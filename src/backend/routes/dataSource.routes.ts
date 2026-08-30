import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { dataSourceStore, computeFreshness } from '../../services/dataSourceStore';
import { dbStore } from '../db/store';

export const dataSourceRouter = Router();

// Apply authentication to all data source endpoints
dataSourceRouter.use(authenticateToken);

/**
 * GET /api/data-sources
 * List all data sources in the registry
 */
dataSourceRouter.get(
  '/data-sources',
  requirePermission(PermissionType.DATA_SOURCE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const sources = dataSourceStore.getAllSources().map((source) => ({
        ...source,
        freshness: computeFreshness(source.lastUpdated, source.updateFrequency),
      }));

      res.json({
        sources,
        total: sources.length,
        prototypeNotice:
          'SCOS URBAN DATA INTEGRATION FOUNDATION — All sources represent prototype, simulated, historical, or static baseline datasets. No live government APIs or real-time IoT networks are active in this environment.',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-sources/:id
 * Retrieve specific data source by ID
 */
dataSourceRouter.get(
  '/data-sources/:id',
  requirePermission(PermissionType.DATA_SOURCE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const source = dataSourceStore.getSourceById(id);

      if (!source) {
        res.status(404).json({ error: 'NOT_FOUND', message: `Data source ${id} not found` });
        return;
      }

      const freshness = computeFreshness(source.lastUpdated, source.updateFrequency);

      res.json({
        source: {
          ...source,
          freshness,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-sources/:id/provenance
 * Retrieve provenance details for a specific data source
 */
dataSourceRouter.get(
  '/data-sources/:id/provenance',
  requirePermission(PermissionType.DATA_SOURCE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const source = dataSourceStore.getSourceById(id);

      if (!source) {
        res.status(404).json({ error: 'NOT_FOUND', message: `Data source ${id} not found` });
        return;
      }

      res.json({
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        provenance: source.provenance,
        dataMode: source.dataMode,
        civilEngineeringDomain: source.civilEngineeringDomain,
        prototypeNotice: 'Prototype Data Source Provenance Record',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * POST /api/data-sources
 * Create a new data source entry in the registry
 */
dataSourceRouter.post(
  '/data-sources',
  requirePermission(PermissionType.DATA_SOURCE_CREATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const { sourceName, sourceType, department, description, dataCategory, updateFrequency, dataMode, civilEngineeringDomain, reliability } = req.body;

      if (!sourceName || !sourceType || !department || !dataCategory) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Missing required fields: sourceName, sourceType, department, dataCategory',
        });
        return;
      }

      const created = dataSourceStore.createSource({
        sourceName,
        sourceType,
        department,
        description: description || 'Urban infrastructure dataset entry',
        dataCategory,
        updateFrequency: updateFrequency || 'Daily',
        dataMode: dataMode || 'SIMULATED',
        civilEngineeringDomain,
        reliability,
      });

      // Audit Log with req.user identity
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'DATA_SOURCE_CREATED',
        resource: `/api/data-sources/${created.sourceId}`,
        details: {
          sourceId: created.sourceId,
          sourceName: created.sourceName,
          dataMode: created.dataMode,
          dataCategory: created.dataCategory,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.status(201).json({
        message: 'Data source registered successfully',
        source: {
          ...created,
          freshness: computeFreshness(created.lastUpdated, created.updateFrequency),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * PUT /api/data-sources/:id
 * Update an existing data source
 */
dataSourceRouter.put(
  '/data-sources/:id',
  requirePermission(PermissionType.DATA_SOURCE_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const { id } = req.params;
      const updated = dataSourceStore.updateSource(id, req.body);

      if (!updated) {
        res.status(404).json({ error: 'NOT_FOUND', message: `Data source ${id} not found` });
        return;
      }

      // Audit Log with req.user identity
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'DATA_SOURCE_UPDATED',
        resource: `/api/data-sources/${id}`,
        details: {
          sourceId: id,
          updatedFields: Object.keys(req.body),
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.json({
        message: 'Data source updated successfully',
        source: {
          ...updated,
          freshness: computeFreshness(updated.lastUpdated, updated.updateFrequency),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * PATCH /api/data-sources/:id/toggle
 * Enable or disable a data source
 */
dataSourceRouter.patch(
  '/data-sources/:id/toggle',
  requirePermission(PermissionType.DATA_SOURCE_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const { id } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Boolean field "enabled" is required' });
        return;
      }

      const updated = dataSourceStore.toggleSource(id, enabled);

      if (!updated) {
        res.status(404).json({ error: 'NOT_FOUND', message: `Data source ${id} not found` });
        return;
      }

      const auditAction = enabled ? 'DATA_SOURCE_ENABLED' : 'DATA_SOURCE_DISABLED';

      // Audit Log with req.user identity
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: auditAction,
        resource: `/api/data-sources/${id}`,
        details: {
          sourceId: id,
          enabled,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.json({
        message: `Data source ${enabled ? 'enabled' : 'disabled'} successfully`,
        source: {
          ...updated,
          freshness: computeFreshness(updated.lastUpdated, updated.updateFrequency),
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);
