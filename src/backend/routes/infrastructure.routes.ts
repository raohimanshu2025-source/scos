// =========================================================================
// SCOS CIVIL INFRASTRUCTURE & GEOSPATIAL INTELLIGENCE API ROUTES
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { infrastructureStore } from '../../services/infrastructureStore';
import { knowledgeGraphStore } from '../../services/knowledgeGraphStore';
import { dbStore } from '../db/store';
import { runInfrastructureTestSuite } from '../../tests/infrastructure.spec';

export const infrastructureRouter = Router();

// Require token authentication for all civil infrastructure & spatial routes
infrastructureRouter.use(authenticateToken);

/**
 * GET /api/infrastructure/test
 * Run automated Phase 8.3 Infrastructure & Spatial Intelligence test suite
 */
infrastructureRouter.get(
  '/infrastructure/test',
  requirePermission(PermissionType.INFRASTRUCTURE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const suiteResults = runInfrastructureTestSuite();
      res.json(suiteResults);
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to execute test suite',
      });
    }
  }
);

/**
 * GET /api/infrastructure/metrics
 * Summary statistics & asset count breakdowns
 */
infrastructureRouter.get(
  '/infrastructure/metrics',
  requirePermission(PermissionType.INFRASTRUCTURE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = infrastructureStore.getSummaryMetrics();
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to compute infrastructure metrics',
      });
    }
  }
);

/**
 * GET /api/infrastructure
 * List civil infrastructure assets with optional filtering
 */
infrastructureRouter.get(
  '/infrastructure',
  requirePermission(PermissionType.INFRASTRUCTURE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, department, condition, criticality, zone, ward } = req.query;

      const assets = infrastructureStore.getAllAssets({
        type: type as string,
        department: department as string,
        condition: condition as string,
        criticality: criticality as string,
        zone: zone as string,
        ward: ward as string,
      });

      res.json({
        success: true,
        count: assets.length,
        data: assets,
        disclaimer:
          'SIMULATED / PROTOTYPE DATA — Civil Infrastructure Asset Inventory.',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve infrastructure assets',
      });
    }
  }
);

/**
 * GET /api/infrastructure/:id
 * Retrieve specific civil infrastructure asset and its graph neighborhood
 */
infrastructureRouter.get(
  '/infrastructure/:id',
  requirePermission(PermissionType.INFRASTRUCTURE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const assetId = req.params.id;
      const asset = infrastructureStore.getAssetById(assetId);

      if (!asset) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: `Infrastructure asset with ID '${assetId}' not found.`,
        });
        return;
      }

      const kgNeighborhood = knowledgeGraphStore.getNeighborhood(assetId, 1);

      res.json({
        success: true,
        data: {
          asset,
          knowledgeGraphNeighborhood: kgNeighborhood,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve asset details',
      });
    }
  }
);

/**
 * POST /api/infrastructure
 * Create a new civil infrastructure asset
 */
infrastructureRouter.post(
  '/infrastructure',
  requirePermission(PermissionType.INFRASTRUCTURE_CREATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const body = req.body;
      if (!body.assetName || !body.assetType) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'assetName and assetType are required fields.',
        });
        return;
      }

      // Check coordinates validity
      if (
        body.location &&
        (typeof body.location.latitude === 'number' &&
          (body.location.latitude < -90 || body.location.latitude > 90))
      ) {
        res.status(400).json({
          error: 'INVALID_COORDINATES',
          message: 'Latitude must be between -90 and 90 degrees.',
        });
        return;
      }

      const createdAsset = infrastructureStore.createAsset(body);

      // Record Audit Log
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'INFRASTRUCTURE_CREATED',
        resource: createdAsset.assetId,
        details: {
          assetName: createdAsset.assetName,
          assetType: createdAsset.assetType,
          message: `Created civil infrastructure asset: ${createdAsset.assetName}`,
        },
        status: 'SUCCESS',
      });

      res.status(201).json({
        success: true,
        message: 'Civil infrastructure asset created successfully.',
        data: createdAsset,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create infrastructure asset',
      });
    }
  }
);

/**
 * PATCH /api/infrastructure/:id
 * Update status, condition, or criticality of an existing asset
 */
infrastructureRouter.patch(
  '/infrastructure/:id',
  requirePermission(PermissionType.INFRASTRUCTURE_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const assetId = req.params.id;
      const updates = req.body;

      const updated = infrastructureStore.updateAsset(assetId, updates);
      if (!updated) {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: `Infrastructure asset with ID '${assetId}' not found.`,
        });
        return;
      }

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'INFRASTRUCTURE_UPDATED',
        resource: assetId,
        details: {
          assetId,
          status: updated.status,
          condition: updated.condition,
          message: `Updated asset status/condition: ${updated.status} / ${updated.condition}`,
        },
        status: 'SUCCESS',
      });

      res.json({
        success: true,
        message: 'Infrastructure asset updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update asset',
      });
    }
  }
);

/**
 * GET /api/spatial/nearby
 * Spatial proximity query using Haversine distance engine
 */
infrastructureRouter.get(
  '/spatial/nearby',
  requirePermission(PermissionType.SPATIAL_ANALYSIS_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const latStr = req.query.lat as string;
      const lonStr = req.query.lon as string;
      const radiusStr = req.query.radiusMeters as string;

      const lat = parseFloat(latStr || '26.458');
      const lon = parseFloat(lonStr || '80.342');
      const radiusMeters = parseInt(radiusStr || '2000', 10);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid latitude or longitude parameters.',
        });
        return;
      }

      const nearbyAssets = infrastructureStore.getNearbyAssets(lat, lon, radiusMeters);

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          action: 'SPATIAL_ANALYSIS_EXECUTED',
          resource: `LAT:${lat},LON:${lon}`,
          details: {
            latitude: lat,
            longitude: lon,
            radiusMeters,
            count: nearbyAssets.length,
          },
          status: 'SUCCESS',
        });
      }

      res.json({
        success: true,
        query: { latitude: lat, longitude: lon, radiusMeters },
        count: nearbyAssets.length,
        data: nearbyAssets,
        disclaimer:
          'Haversine distance calculation on prototype spatial coordinates. Not survey-grade positional accuracy.',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to execute spatial query',
      });
    }
  }
);

/**
 * GET /api/spatial/incident-impact/:incidentId
 * Retrieve civil infrastructure proximity and cascade impact analysis for a given incident
 */
infrastructureRouter.get(
  '/spatial/incident-impact/:incidentId',
  requirePermission(PermissionType.SPATIAL_ANALYSIS_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidentId = req.params.incidentId;
      const latStr = req.query.lat as string;
      const lonStr = req.query.lon as string;

      const lat = latStr ? parseFloat(latStr) : 26.458;
      const lon = lonStr ? parseFloat(lonStr) : 80.342;

      const impactAnalysis = infrastructureStore.getIncidentImpactChain(incidentId, lat, lon);

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          action: 'SPATIAL_IMPACT_VIEWED',
          resource: incidentId,
          details: {
            incidentId,
            latitude: lat,
            longitude: lon,
          },
          status: 'SUCCESS',
        });
      }

      res.json({
        success: true,
        data: impactAnalysis,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate incident infrastructure impact analysis',
      });
    }
  }
);
