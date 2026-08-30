// =========================================================================
// SCOS PHASE 10F — SENSITIVITY & ROBUSTNESS REST API ROUTES
// Endpoints for Parameter Registry, OAT Perturbations, Elasticity,
// Tornado Diagrams, Compound Stress-Testing, RQ Robustness & Calibration Roadmap
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { sensitivityAnalysisService } from '../../services/sensitivityAnalysisService';
import { dbStore } from '../db/store';

export const sensitivityAnalysisRouter = Router();

// =========================================================================
// 1. GET /api/sensitivity-analysis/summary
// Full synthesized Robustness & Sensitivity Framework Summary
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/summary',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const framework = sensitivityAnalysisService.getFramework();
      res.json({
        status: 'success',
        data: framework,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve sensitivity framework summary.',
      });
    }
  }
);

// =========================================================================
// 2. GET /api/sensitivity-analysis/parameters
// Audited Engineering Parameters List
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/parameters',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const params = sensitivityAnalysisService.getParameters();
      res.json({
        status: 'success',
        data: {
          totalCount: params.length,
          parameters: params,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve parameters.',
      });
    }
  }
);

// =========================================================================
// 3. GET /api/sensitivity-analysis/parameters/:id
// Single Parameter Definition
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/parameters/:id',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const param = sensitivityAnalysisService.getParameter(req.params.id);
      if (!param) {
        res.status(404).json({
          status: 'error',
          message: `Parameter '${req.params.id}' not found.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: param,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve parameter.',
      });
    }
  }
);

// =========================================================================
// 4. GET /api/sensitivity-analysis/oat
// One-At-A-Time Perturbation Results
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/oat',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { parameterId, metricKey, scenarioId } = req.query as any;
      const results = sensitivityAnalysisService.getOATResults({
        parameterId,
        metricKey,
        scenarioId,
      });
      res.json({
        status: 'success',
        data: {
          totalCount: results.length,
          results,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve OAT results.',
      });
    }
  }
);

// =========================================================================
// 5. GET /api/sensitivity-analysis/tornado
// Tornado Diagram Ranking by Metric
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/tornado',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const metricKey = (req.query.metricKey as string) || 'M1_WORKFLOW_DURATION';
      const tornado = sensitivityAnalysisService.getTornadoRankings(metricKey);
      res.json({
        status: 'success',
        data: {
          metricKey,
          rankings: tornado,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve tornado rankings.',
      });
    }
  }
);

// =========================================================================
// 6. GET /api/sensitivity-analysis/compound
// Compound Multi-Hazard Stress-Testing Scenarios
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/compound',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const compoundResults = sensitivityAnalysisService.getCompoundStressResults();
      res.json({
        status: 'success',
        data: {
          totalScenarios: compoundResults.length,
          scenarios: compoundResults,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve compound stress results.',
      });
    }
  }
);

// =========================================================================
// 7. GET /api/sensitivity-analysis/robustness-claims
// Research Question Robustness Assessments (RQ-01 to RQ-05)
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/robustness-claims',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const claims = sensitivityAnalysisService.getRQAssessments();
      res.json({
        status: 'success',
        data: {
          totalClaims: claims.length,
          claims,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve robustness claims.',
      });
    }
  }
);

// =========================================================================
// 8. GET /api/sensitivity-analysis/calibration-needs
// Empirical Calibration Roadmap
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/calibration-needs',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const gaps = sensitivityAnalysisService.getCalibrationGaps();
      res.json({
        status: 'success',
        data: {
          totalGaps: gaps.length,
          calibrationGaps: gaps,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve calibration gaps.',
      });
    }
  }
);

// =========================================================================
// 9. POST /api/sensitivity-analysis/run-sweep
// Execute Custom Parameter Sensitivity Sweep
// =========================================================================
sensitivityAnalysisRouter.post(
  '/sensitivity-analysis/run-sweep',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_EXECUTE),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { parameterId, perturbationPercentages, scenarioId } = req.body;
      if (!parameterId) {
        res.status(400).json({
          status: 'error',
          message: 'parameterId is required for sensitivity sweep.',
        });
        return;
      }

      const sweepResult = sensitivityAnalysisService.runCustomSweep({
        parameterId,
        perturbationPercentages,
        scenarioId,
      });

      // Log audit event
      dbStore.addAuditLog({
        actorId: req.user?.id || 'anon',
        actorEmail: req.user?.email || 'anon@scos.gov.in',
        actorRole: req.user?.role as any,
        action: 'SENSITIVITY_SWEEP_EXECUTED',
        resource: `PARAMETER:${parameterId}`,
        details: {
          perturbations: perturbationPercentages || [-50, -25, -10, 0, 10, 25, 50],
          meanElasticity: sweepResult.calculatedElasticityMean,
        },
        status: 'SUCCESS',
      });

      res.json({
        status: 'success',
        data: sweepResult,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to execute custom sensitivity sweep.',
      });
    }
  }
);

// =========================================================================
// 10. POST /api/sensitivity-analysis/verify-hash
// Deterministic Reproducibility Verification
// =========================================================================
sensitivityAnalysisRouter.post(
  '/sensitivity-analysis/verify-hash',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { hash } = req.body;
      if (!hash) {
        res.status(400).json({
          status: 'error',
          message: 'Hash string is required for verification.',
        });
        return;
      }

      const result = sensitivityAnalysisService.verifyReproducibility(hash);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to verify hash.',
      });
    }
  }
);

// =========================================================================
// 11. POST /api/sensitivity-analysis/test
// Execute 30-Test Automated Spec Suite
// =========================================================================
sensitivityAnalysisRouter.post(
  '/sensitivity-analysis/test',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_EXECUTE),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const report = sensitivityAnalysisService.runSensitivityTestSuite();

      // Log test run
      dbStore.addAuditLog({
        actorId: req.user?.id || 'anon',
        actorEmail: req.user?.email || 'anon@scos.gov.in',
        actorRole: req.user?.role as any,
        action: 'SENSITIVITY_TEST_SUITE_RUN',
        resource: 'TEST_SUITE:PHASE_10F',
        details: {
          totalTests: report.totalTests,
          passedCount: report.passedCount,
          failedCount: report.failedCount,
        },
        status: 'SUCCESS',
      });

      res.json({
        status: 'success',
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to run sensitivity test suite.',
      });
    }
  }
);

// =========================================================================
// 12. GET /api/sensitivity-analysis/export/json
// Export Framework JSON
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/export/json',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const framework = sensitivityAnalysisService.getFramework();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="scos_sensitivity_analysis_framework.json"'
      );
      res.send(JSON.stringify(framework, null, 2));
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export sensitivity framework JSON.',
      });
    }
  }
);

// =========================================================================
// 13. GET /api/sensitivity-analysis/export/csv
// Export Framework CSV
// =========================================================================
sensitivityAnalysisRouter.get(
  '/sensitivity-analysis/export/csv',
  authenticateToken,
  requirePermission(PermissionType.SENSITIVITY_ANALYSIS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const csv = sensitivityAnalysisService.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="scos_sensitivity_analysis_matrix.csv"'
      );
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export sensitivity framework CSV.',
      });
    }
  }
);
