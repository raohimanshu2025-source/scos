// =========================================================================
// SCOS PHASE 10A — RESEARCH DATASET & SCENARIO REGISTRY API ROUTES
// Research Governance, Provenance & Reproducibility API Endpoints
// =========================================================================

import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { researchDatasetService } from '../../services/researchDatasetService';
import { scenarioValidationService } from '../../services/scenarioValidationService';
import { dbStore } from '../db/store';
import { runResearchDatasetTestSuite } from '../../tests/researchDataset.spec';

export const researchDatasetRouter = Router();

/**
 * GET /api/research-dataset/summary
 * Retrieves root research dataset metadata, versions, and classification notice
 */
researchDatasetRouter.get(
  '/research-dataset/summary',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = researchDatasetService.getDatasetSummary();
      res.json({
        status: 'SUCCESS',
        data: summary,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
          disclaimer: 'All scenarios and parameters are research constructs for reproducibility and do not represent live municipal telemetry.',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DATASET_SUMMARY_FAILED',
        message: error.message || 'Failed to retrieve research dataset summary',
      });
    }
  }
);

/**
 * GET /api/research-dataset/scenarios
 * Retrieves all 5 authoritative research scenarios (SC-01 to SC-05)
 */
researchDatasetRouter.get(
  '/research-dataset/scenarios',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const scenarios = researchDatasetService.getAllScenarios();
      res.json({
        status: 'SUCCESS',
        data: scenarios,
        meta: {
          totalScenarios: scenarios.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DATASET_SCENARIOS_FAILED',
        message: error.message || 'Failed to retrieve research scenarios',
      });
    }
  }
);

/**
 * GET /api/research-dataset/scenarios/:id
 * Retrieves specific research scenario by ID or Code
 */
researchDatasetRouter.get(
  '/research-dataset/scenarios/:id',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id;
      const scenario = researchDatasetService.getScenario(id);

      if (!scenario) {
        return res.status(404).json({
          error: 'SCENARIO_NOT_FOUND',
          message: `Research scenario '${id}' does not exist in registry.`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: scenario,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SCENARIO_FETCH_FAILED',
        message: error.message || 'Failed to retrieve scenario',
      });
    }
  }
);

/**
 * GET /api/research-dataset/validation-cases
 * Retrieves Phase 9C validation cases linked to research scenarios
 */
researchDatasetRouter.get(
  '/research-dataset/validation-cases',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const valCases = scenarioValidationService.getValidationCases();
      res.json({
        status: 'SUCCESS',
        data: valCases,
        meta: {
          totalCases: valCases.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'VALIDATION_CASES_FAILED',
        message: error.message || 'Failed to retrieve validation cases',
      });
    }
  }
);

/**
 * GET /api/research-dataset/assumptions
 * Retrieves centralized research engineering assumptions
 */
researchDatasetRouter.get(
  '/research-dataset/assumptions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const assumptions = researchDatasetService.getAllAssumptions();
      res.json({
        status: 'SUCCESS',
        data: assumptions,
        meta: {
          totalAssumptions: assumptions.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'ASSUMPTIONS_FETCH_FAILED',
        message: error.message || 'Failed to retrieve engineering assumptions',
      });
    }
  }
);

/**
 * GET /api/research-dataset/versions
 * Retrieves all dataset versions and release notes
 */
researchDatasetRouter.get(
  '/research-dataset/versions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const versions = researchDatasetService.getAllVersions();
      res.json({
        status: 'SUCCESS',
        data: versions,
        meta: {
          totalVersions: versions.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'VERSIONS_FETCH_FAILED',
        message: error.message || 'Failed to retrieve dataset versions',
      });
    }
  }
);

/**
 * GET /api/research-dataset/executions
 * Retrieves all recorded experimental scenario executions
 */
researchDatasetRouter.get(
  '/research-dataset/executions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const executions = researchDatasetService.getAllExecutions();
      res.json({
        status: 'SUCCESS',
        data: executions,
        meta: {
          totalExecutions: executions.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'EXECUTIONS_FETCH_FAILED',
        message: error.message || 'Failed to retrieve scenario executions',
      });
    }
  }
);

/**
 * GET /api/research-dataset/executions/:id
 * Retrieves specific execution by ID
 */
researchDatasetRouter.get(
  '/research-dataset/executions/:id',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id;
      const execution = researchDatasetService.getExecution(id);

      if (!execution) {
        return res.status(404).json({
          error: 'EXECUTION_NOT_FOUND',
          message: `Execution record '${id}' does not exist.`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: execution,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'EXECUTION_FETCH_FAILED',
        message: error.message || 'Failed to retrieve execution record',
      });
    }
  }
);

/**
 * POST /api/research-dataset/scenarios/:id/freeze
 * Freezes a scenario configuration to protect research immutability
 */
researchDatasetRouter.post(
  '/research-dataset/scenarios/:id/freeze',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_ADMIN),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id;
      const userEmail = req.user?.email || 'admin@scos.gov.in';
      const scenario = researchDatasetService.freezeScenario(id, userEmail);

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'RESEARCH_SCENARIO_FROZEN',
        resource: `research_scenario:${scenario.scenarioId}`,
        districtId: req.user?.districtId || 'dist-kanpur',
        status: 'SUCCESS',
        details: {
          scenarioId: scenario.scenarioId,
          scenarioCode: scenario.scenarioCode,
          configurationFingerprint: scenario.configurationFingerprint,
          frozenAt: scenario.frozenAt,
        },
      });

      res.json({
        status: 'SUCCESS',
        data: scenario,
        message: `Scenario '${scenario.scenarioCode}' has been frozen.`,
        meta: {
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SCENARIO_FREEZE_FAILED',
        message: error.message || 'Failed to freeze scenario configuration',
      });
    }
  }
);

/**
 * POST /api/research-dataset/executions
 * Executes a controlled research scenario trial under Condition A or Condition B
 */
researchDatasetRouter.post(
  '/research-dataset/executions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { scenarioId, condition, parameterOverrides } = req.body || {};

      if (!scenarioId || !condition) {
        return res.status(400).json({
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'scenarioId (e.g. "SC-01") and condition ("BASELINE_MANUAL" | "SCOS_INTEGRATED") are required',
        });
      }

      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const execution = researchDatasetService.executeResearchRun(
        scenarioId,
        condition,
        parameterOverrides || {},
        userEmail
      );

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'RESEARCH_SCENARIO_EXECUTED',
        resource: `research_execution:${execution.executionId}`,
        districtId: req.user?.districtId || 'dist-kanpur',
        status: 'SUCCESS',
        details: {
          executionId: execution.executionId,
          scenarioId: execution.scenarioId,
          condition: execution.condition,
          configurationFingerprint: execution.configurationFingerprint,
          durationSeconds: execution.resultSummary.durationSeconds,
        },
      });

      res.json({
        status: 'SUCCESS',
        data: execution,
        meta: {
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'RESEARCH_EXECUTION_FAILED',
        message: error.message || 'Failed to execute research scenario run',
      });
    }
  }
);

/**
 * POST /api/research-dataset/reproducibility-check
 * Verifies if a given configuration fingerprint matches the deterministic hash
 */
researchDatasetRouter.post(
  '/research-dataset/reproducibility-check',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { scenarioId, datasetVersion, condition, configurationFingerprint, parametersOverride } = req.body || {};

      if (!scenarioId || !configurationFingerprint) {
        return res.status(400).json({
          error: 'MISSING_FINGERPRINT_PAYLOAD',
          message: 'scenarioId and configurationFingerprint are required for verification',
        });
      }

      const result = researchDatasetService.verifyReproducibility({
        scenarioId,
        datasetVersion,
        condition,
        configurationFingerprint,
        parametersOverride,
      });

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: req.user?.email || 'evaluator@scos.gov.in',
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'RESEARCH_REPRODUCIBILITY_CHECKED',
        resource: `reproducibility:${scenarioId}`,
        districtId: req.user?.districtId || 'dist-kanpur',
        status: 'SUCCESS',
        details: {
          scenarioId,
          status: result.status,
          isMatch: result.isMatch,
          inputFingerprint: result.inputFingerprint,
          computedFingerprint: result.computedFingerprint,
        },
      });

      res.json({
        status: 'SUCCESS',
        data: result,
        meta: {
          verifiedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'REPRODUCIBILITY_CHECK_FAILED',
        message: error.message || 'Failed to perform reproducibility verification',
      });
    }
  }
);

/**
 * GET /api/research-dataset/export
 * Exports full dataset in JSON or CSV format
 */
researchDatasetRouter.get(
  '/research-dataset/export',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const format = (req.query.format as string)?.toUpperCase() || 'JSON';
      const userEmail = req.user?.email || 'researcher@scos.gov.in';

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('SUPER_ADMIN' as any),
        action: 'RESEARCH_DATASET_EXPORTED',
        resource: `research_dataset:export`,
        districtId: req.user?.districtId || 'dist-kanpur',
        status: 'SUCCESS',
        details: {
          exportFormat: format,
        },
      });

      if (format === 'CSV') {
        const csvData = researchDatasetService.exportDatasetCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="scos-research-dataset-v1.0.csv"');
        return res.send(csvData);
      }

      const jsonData = researchDatasetService.exportDataset(userEmail);
      res.json({
        status: 'SUCCESS',
        data: jsonData,
        meta: {
          classification: 'SIMULATED / PROTOTYPE DATA',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'EXPORT_FAILED',
        message: error.message || 'Failed to export research dataset',
      });
    }
  }
);

/**
 * POST /api/research-dataset/test
 * Runs the 25-test Phase 10A Research Dataset verification harness
 */
researchDatasetRouter.post(
  '/research-dataset/test',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_DATASET_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const suiteResult = runResearchDatasetTestSuite();
      res.json({
        status: 'SUCCESS',
        data: suiteResult,
        meta: {
          executedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_FAILED',
        message: error.message || 'Failed to run research dataset test suite',
      });
    }
  }
);
