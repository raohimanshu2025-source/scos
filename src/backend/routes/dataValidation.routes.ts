import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { dataQualityStore } from '../../services/dataQualityStore';
import { dbStore } from '../db/store';
import { RawIngestionRecord } from '../../types/dataValidation';

import { runDataValidationTestSuite } from '../../tests/dataValidation.spec';

export const dataValidationRouter = Router();

// Apply authentication to all data validation & quality endpoints
dataValidationRouter.use(authenticateToken);

/**
 * POST /api/data-validation/process
 * Ingest and process raw record(s) through validation, normalization & quality engine
 */
dataValidationRouter.post(
  '/data-validation/process',
  requirePermission(PermissionType.DATA_VALIDATION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const body = req.body;
      const rawRecords: RawIngestionRecord[] = Array.isArray(body)
        ? body
        : body.records && Array.isArray(body.records)
        ? body.records
        : [body];

      if (rawRecords.length === 0) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'No records provided for processing' });
        return;
      }

      const result = dataQualityStore.ingestRecords(rawRecords);

      // Audit Log: DATA_VALIDATION_EXECUTED
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'DATA_VALIDATION_EXECUTED',
        resource: '/api/data-validation/process',
        details: {
          totalIngested: result.summary.totalIngested,
          acceptedCount: result.summary.acceptedCount,
          rejectedCount: result.summary.rejectedCount,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      // Audit Logs for Accepted & Rejected Records
      if (result.acceptedRecords.length > 0) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'DATA_RECORD_ACCEPTED',
          resource: '/api/data-validation/records',
          details: {
            acceptedIds: result.acceptedRecords.map((r) => r.recordId),
            sources: result.acceptedRecords.map((r) => r.sourceId),
          },
          ipAddress: req.ip,
          status: 'SUCCESS',
        });
      }

      if (result.rejectedRecords.length > 0) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'DATA_RECORD_REJECTED',
          resource: '/api/data-validation/rejections',
          details: {
            rejectedIds: result.rejectedRecords.map((r) => r.recordId),
            reasons: result.rejectedRecords.map((r) => r.rejectionReason),
          },
          ipAddress: req.ip,
          status: 'SUCCESS',
        });
      }

      res.status(200).json({
        message: `Processed ${result.summary.totalIngested} records (${result.summary.acceptedCount} accepted, ${result.summary.rejectedCount} rejected)`,
        result,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-validation/records
 * Retrieve normalized SCOS records with optional filter parameters
 */
dataValidationRouter.get(
  '/data-validation/records',
  requirePermission(PermissionType.DATA_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { category, quality, freshness, status } = req.query;

      const records = dataQualityStore.getAllNormalizedRecords({
        category: category ? String(category) : undefined,
        quality: quality ? String(quality) : undefined,
        freshness: freshness ? String(freshness) : undefined,
        status: status ? String(status) : undefined,
      });

      res.json({
        records,
        total: records.length,
        disclaimer:
          'SCOS DATA VALIDATION & QUALITY ENGINE — All normalized records originate from prototype and simulated Kanpur urban data pipelines.',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-validation/records/:id
 * Inspect a specific normalized record along with its original raw representation
 */
dataValidationRouter.get(
  '/data-validation/records/:id',
  requirePermission(PermissionType.DATA_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const record = dataQualityStore.getRecordById(id);

      if (!record) {
        res.status(404).json({ error: 'NOT_FOUND', message: `Normalized record ${id} not found` });
        return;
      }

      res.json({
        record,
        originalRepresentation: record.originalPayload,
        normalizedRepresentation: {
          recordId: record.recordId,
          sourceId: record.sourceId,
          dataCategory: record.dataCategory,
          entityType: record.entityType,
          entityId: record.entityId,
          timestamp: record.timestamp,
          location: record.location,
          attributes: record.attributes,
          provenance: record.provenance,
          quality: record.quality,
          validation: record.validation,
          freshness: record.freshness,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-validation/rejections
 * Retrieve rejected records buffer
 */
dataValidationRouter.get(
  '/data-validation/rejections',
  requirePermission(PermissionType.DATA_VALIDATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const rejections = dataQualityStore.getRejectedRecords();
      res.json({
        rejections,
        total: rejections.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * GET /api/data-quality/metrics
 * Retrieve SCOS Data Quality metrics summary
 */
dataValidationRouter.get(
  '/data-quality/metrics',
  requirePermission(PermissionType.DATA_QUALITY_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'User context required' });
        return;
      }

      const summary = dataQualityStore.getMetricsSummary();

      // Audit Log: DATA_QUALITY_ASSESSED
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'DATA_QUALITY_ASSESSED',
        resource: '/api/data-quality/metrics',
        details: {
          totalRecords: summary.totalRecords,
          validRecords: summary.validRecords,
          rejectedRecords: summary.rejectedRecords,
          averageCompleteness: summary.averageCompleteness,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * POST /api/data-validation/simulate
 * Re-seed prototype pipeline records for live UI demonstration
 */
dataValidationRouter.post(
  '/data-validation/simulate',
  requirePermission(PermissionType.DATA_VALIDATION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      dataQualityStore.seedPrototypePipelineRecords();
      const summary = dataQualityStore.getMetricsSummary();
      res.json({
        message: 'Prototype pipeline re-seeded successfully',
        summary,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * POST /api/data-validation/test-suite
 * Run automated validation, normalization, quality & security test suite
 */
dataValidationRouter.post(
  '/data-validation/test-suite',
  requirePermission(PermissionType.DATA_VALIDATION_EXECUTE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const testResult = await runDataValidationTestSuite();

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'DATA_VALIDATION_EXECUTED',
          resource: '/api/data-validation/test-suite',
          details: {
            passedScenarios: testResult.passed,
            totalScenarios: testResult.total,
          },
          ipAddress: req.ip,
          status: 'SUCCESS',
        });
      }

      res.json(testResult);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);
