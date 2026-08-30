// =========================================================================
// SCOS PHASE 10C — STATISTICAL ANALYSIS & UNCERTAINTY REST API ROUTES
// Transparent Research Analytics, Metric Disaggregation & Provenance Auditing
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { statisticalAnalysisService } from '../../services/statisticalAnalysisService';
import { runStatisticalAnalysisTestSuite } from '../../tests/statisticalAnalysis.spec';
import { dbStore } from '../db/store';

export const statisticalAnalysisRouter = Router();

// =========================================================================
// 1. GET /api/statistical-analysis/summary
// Summary statistics header for fast dashboard overview
// =========================================================================
statisticalAnalysisRouter.get(
  '/statistical-analysis/summary',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const summary = statisticalAnalysisService.getStatisticalSummary(userEmail);

      res.json({
        status: 'success',
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve statistical analysis summary.',
      });
    }
  }
);

// =========================================================================
// 2. GET /api/statistical-analysis/metric/:metricCode
// Detailed statistical metrics for a single metric (e.g. M1, M2... M10)
// =========================================================================
statisticalAnalysisRouter.get(
  '/statistical-analysis/metric/:metricCode',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { metricCode } = req.params;
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const stats = statisticalAnalysisService.getMetricStatistics(metricCode, userEmail);

      if (!stats) {
        res.status(404).json({
          status: 'error',
          message: `Metric statistics for '${metricCode}' not found. Available metrics: M1–M10.`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve metric statistics.',
      });
    }
  }
);

// =========================================================================
// 3. GET /api/statistical-analysis/scenario/:scenarioId
// Disaggregated statistical metrics for a specific scenario (SC-01 to SC-05)
// =========================================================================
statisticalAnalysisRouter.get(
  '/statistical-analysis/scenario/:scenarioId',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { scenarioId } = req.params;
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const scStats = statisticalAnalysisService.getScenarioStatistics(scenarioId, userEmail);

      if (!scStats) {
        res.status(404).json({
          status: 'error',
          message: `Scenario statistics for '${scenarioId}' not found. Available scenarios: SC-01 through SC-05.`,
        });
        return;
      }

      res.json({
        status: 'success',
        data: scStats,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve scenario statistics.',
      });
    }
  }
);

// =========================================================================
// 4. POST /api/statistical-analysis/run
// Recompute or execute fresh statistical analysis across all observations
// =========================================================================
statisticalAnalysisRouter.post(
  '/statistical-analysis/run',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_EXECUTE),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';

      // Force recalculation
      statisticalAnalysisService.invalidateCache();
      const snapshot = statisticalAnalysisService.generateAnalysisSnapshot(userEmail);

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('' as any),
        action: 'STATISTICAL_ANALYSIS_EXECUTED',
        resource: snapshot.analysisId,
        details: {
          analysisVersion: snapshot.analysisVersion,
          datasetVersion: snapshot.datasetVersion,
          scenarioCount: snapshot.coverage.scenarioCount,
          totalRuns: snapshot.coverage.totalRunsAnalyzed,
          canonicalFingerprint: snapshot.provenance.canonicalPayloadHash,
          overallUncertaintyScore: snapshot.aggregateSummary.overallUncertaintyScore,
        },
        status: 'SUCCESS',
      });

      res.json({
        status: 'success',
        data: snapshot,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to execute statistical analysis.',
      });
    }
  }
);

// =========================================================================
// 5. POST /api/statistical-analysis/verify
// Verify reproducibility of statistical analysis SHA-256 fingerprint
// =========================================================================
statisticalAnalysisRouter.post(
  '/statistical-analysis/verify',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const snapshot = statisticalAnalysisService.getAnalysisSnapshot(userEmail);
      const verification = statisticalAnalysisService.verifyAnalysisReproducibility(snapshot);

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('' as any),
        action: 'STATISTICAL_ANALYSIS_VERIFIED',
        resource: snapshot.analysisId,
        details: {
          isMatch: verification.isMatch,
          status: verification.status,
          computedFingerprint: verification.computedFingerprint,
          storedFingerprint: verification.storedFingerprint,
        },
        status: 'SUCCESS',
      });

      res.json({
        status: 'success',
        data: verification,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to verify statistical analysis reproducibility.',
      });
    }
  }
);

// =========================================================================
// 6. GET /api/statistical-analysis/export/json
// Export complete statistical analysis snapshot as JSON
// =========================================================================
statisticalAnalysisRouter.get(
  '/statistical-analysis/export/json',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const snapshot = statisticalAnalysisService.exportAnalysisJSON(userEmail);

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('' as any),
        action: 'STATISTICAL_ANALYSIS_EXPORTED',
        resource: snapshot.analysisId,
        details: {
          format: 'JSON',
          datasetVersion: snapshot.datasetVersion,
          analysisVersion: snapshot.analysisVersion,
        },
        status: 'SUCCESS',
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos_statistical_analysis_${snapshot.analysisId}.json"`
      );
      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export statistical analysis JSON.',
      });
    }
  }
);

// =========================================================================
// 7. GET /api/statistical-analysis/export/csv
// Export analysis-readable CSV with descriptive statistics across scenarios
// =========================================================================
statisticalAnalysisRouter.get(
  '/statistical-analysis/export/csv',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const csv = statisticalAnalysisService.exportAnalysisCSV(userEmail);

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('' as any),
        action: 'STATISTICAL_ANALYSIS_EXPORTED',
        resource: 'SCOS_STATISTICAL_ANALYSIS_CSV',
        details: {
          format: 'CSV',
          datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
        },
        status: 'SUCCESS',
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos_statistical_analysis_${Date.now()}.csv"`
      );
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export statistical analysis CSV.',
      });
    }
  }
);

// =========================================================================
// 8. POST /api/statistical-analysis/test
// Automated Phase 10C Test Suite runner
// =========================================================================
statisticalAnalysisRouter.post(
  '/statistical-analysis/test',
  authenticateToken,
  requirePermission(PermissionType.STATISTICAL_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const suiteResult = runStatisticalAnalysisTestSuite();
      res.json({
        status: 'success',
        data: suiteResult,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to run statistical analysis test suite.',
      });
    }
  }
);
