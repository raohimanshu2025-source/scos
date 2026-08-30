// =========================================================================
// SCOS PHASE 10B — CONTROLLED EXPERIMENTAL EXECUTION ROUTER
// Reproducible Results Generation & Research Governance API Endpoints
// =========================================================================

import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { experimentalExecutionService } from '../../services/experimentalExecutionService';
import { experimentalResultsStore } from '../../services/experimentalResultsStore';
import { researchDatasetService } from '../../services/researchDatasetService';
import { dbStore } from '../db/store';
import { runExperimentalExecutionTestSuite } from '../../tests/experimentalExecution.spec';

export const experimentalExecutionRouter = Router();

/**
 * GET /api/experimental-execution/dataset-status
 * Checks integrity status of underlying Phase 10A Research Dataset
 */
experimentalExecutionRouter.get(
  '/experimental-execution/dataset-status',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = researchDatasetService.getDatasetSummary();
      const allScenarios = researchDatasetService.getAllScenarios();

      res.json({
        status: 'SUCCESS',
        data: {
          datasetId: summary.datasetId,
          version: summary.currentVersion,
          status: summary.status,
          configurationFingerprint: summary.configurationFingerprint,
          scenarioCount: allScenarios.length,
          allScenariosFrozen: allScenarios.every((s) => s.isFrozen),
          isIntegrityPreserved: true,
        },
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DATASET_STATUS_CHECK_FAILED',
        message: error.message || 'Failed to check dataset integrity status',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/research-summary
 * Returns aggregated statistics for all experimental sessions, runs, and comparisons
 */
experimentalExecutionRouter.get(
  '/experimental-execution/research-summary',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const summary = experimentalResultsStore.getResearchSummary();
      res.json({
        status: 'SUCCESS',
        data: summary,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'RESEARCH_SUMMARY_FAILED',
        message: error.message || 'Failed to generate research summary',
      });
    }
  }
);

/**
 * POST /api/experimental-execution/sessions
 * Create a new Controlled Experimental Execution Session
 */
experimentalExecutionRouter.post(
  '/experimental-execution/sessions',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { scenarioId, order, notes } = req.body;
      if (!scenarioId) {
        return res.status(400).json({
          error: 'MISSING_SCENARIO_ID',
          message: 'Scenario ID is required to initialize an experimental execution session.',
        });
      }

      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const session = experimentalExecutionService.createSession(
        scenarioId,
        order || 'BASELINE_THEN_SCOS',
        userEmail,
        notes
      );

      // Audit Log
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: userEmail,
        actorRole: req.user?.role || ('' as any),
        action: 'EXPERIMENT_SESSION_CREATED',
        resource: session.sessionId,
        details: {
          scenarioId: session.scenarioId,
          order: session.order,
          datasetVersion: session.datasetVersion,
        },
        status: 'SUCCESS',
      });

      res.status(201).json({
        status: 'SUCCESS',
        data: session,
        message: `Experimental Execution Session '${session.sessionId}' initialized for scenario '${session.scenarioCode}'.`,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'SESSION_CREATION_FAILED',
        message: error.message || 'Failed to create experimental session',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/sessions
 * List all experimental execution sessions
 */
experimentalExecutionRouter.get(
  '/experimental-execution/sessions',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const sessions = experimentalResultsStore.getAllSessions();
      res.json({
        status: 'SUCCESS',
        data: sessions,
        meta: {
          totalSessions: sessions.length,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SESSIONS_FETCH_FAILED',
        message: error.message || 'Failed to fetch experimental execution sessions',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/sessions/:id
 * Get a specific experimental execution session with all associated runs
 */
experimentalExecutionRouter.get(
  '/experimental-execution/sessions/:id',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionId = req.params.id;
      const session = experimentalResultsStore.getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'SESSION_NOT_FOUND',
          message: `Experimental session '${sessionId}' does not exist.`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: session,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SESSION_FETCH_FAILED',
        message: error.message || 'Failed to fetch session',
      });
    }
  }
);

/**
 * POST /api/experimental-execution/sessions/:id/execute
 * Execute Condition A or Condition B for an active session
 */
experimentalExecutionRouter.post(
  '/experimental-execution/sessions/:id/execute',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { condition, order } = req.body;

      if (!condition || (condition !== 'BASELINE_MANUAL' && condition !== 'SCOS_INTEGRATED')) {
        return res.status(400).json({
          error: 'INVALID_CONDITION',
          message: "Experimental condition must be either 'BASELINE_MANUAL' or 'SCOS_INTEGRATED'.",
        });
      }

      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const run = experimentalExecutionService.executeRun(
        sessionId,
        condition,
        userEmail,
        order
      );

      res.json({
        status: 'SUCCESS',
        data: run,
        message: `Executed Condition '${condition}' for Scenario '${run.scenarioCode}'.`,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'EXECUTION_RUN_FAILED',
        message: error.message || 'Failed to execute experimental run',
      });
    }
  }
);

/**
 * POST /api/experimental-execution/sessions/:id/validate
 * Validate reproducibility and integrity of all runs in a session
 */
experimentalExecutionRouter.post(
  '/experimental-execution/sessions/:id/validate',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessionId = req.params.id;
      const userEmail = req.user?.email || 'researcher@scos.gov.in';

      const validatedSession = experimentalExecutionService.validateSession(sessionId, userEmail);

      res.json({
        status: 'SUCCESS',
        data: validatedSession,
        message: `Session '${sessionId}' validation completed with status '${validatedSession.status}'.`,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'SESSION_VALIDATION_FAILED',
        message: error.message || 'Failed to validate session',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/runs/:id
 * Get detailed experimental run results and activity observations
 */
experimentalExecutionRouter.get(
  '/experimental-execution/runs/:id',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const runId = req.params.id;
      const run = experimentalResultsStore.getRun(runId);

      if (!run) {
        return res.status(404).json({
          error: 'RUN_NOT_FOUND',
          message: `Experimental run '${runId}' not found.`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: run,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'RUN_FETCH_FAILED',
        message: error.message || 'Failed to fetch run',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/runs/:id/reproducibility
 * Verify reproducibility fingerprint for an experimental run
 */
experimentalExecutionRouter.get(
  '/experimental-execution/runs/:id/reproducibility',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const runId = req.params.id;
      const providedFingerprint = req.query.fingerprint as string | undefined;

      const result = experimentalExecutionService.verifyRunReproducibility(runId, providedFingerprint);

      // Audit reproducibility check
      dbStore.addAuditLog({
        actorId: req.user?.id || 'unknown',
        actorEmail: req.user?.email || 'researcher@scos.gov.in',
        actorRole: req.user?.role || ('' as any),
        action: 'EXPERIMENT_REPRODUCIBILITY_CHECKED',
        resource: runId,
        details: {
          isMatch: result.isMatch,
          status: result.status,
          computedFingerprint: result.computedFingerprint,
        },
        status: 'SUCCESS',
      });

      res.json({
        status: 'SUCCESS',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'REPRODUCIBILITY_CHECK_FAILED',
        message: error.message || 'Failed to verify reproducibility',
      });
    }
  }
);

/**
 * POST /api/experimental-execution/compare
 * Generate comparative analysis between Baseline and SCOS runs
 */
experimentalExecutionRouter.post(
  '/experimental-execution/compare',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { baselineRunId, scosRunId, sessionId } = req.body;
      const userEmail = req.user?.email || 'researcher@scos.gov.in';

      let comparison;
      if (sessionId) {
        comparison = experimentalExecutionService.compareSession(sessionId, userEmail);
      } else if (baselineRunId && scosRunId) {
        comparison = experimentalExecutionService.compareRuns(baselineRunId, scosRunId, userEmail);
      } else {
        return res.status(400).json({
          error: 'MISSING_COMPARISON_TARGETS',
          message: "Either 'sessionId' or both 'baselineRunId' and 'scosRunId' must be provided.",
        });
      }

      res.json({
        status: 'SUCCESS',
        data: comparison,
        message: `Comparative evaluation generated for scenario '${comparison.scenarioCode}'.`,
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'COMPARISON_FAILED',
        message: error.message || 'Failed to generate comparison',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/comparisons
 * List all comparative evaluation results
 */
experimentalExecutionRouter.get(
  '/experimental-execution/comparisons',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const comparisons = experimentalResultsStore.getAllComparisons();
      res.json({
        status: 'SUCCESS',
        data: comparisons,
        meta: {
          totalComparisons: comparisons.length,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARISONS_FETCH_FAILED',
        message: error.message || 'Failed to fetch comparisons',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/export/json
 * Export all experimental results in JSON format with complete provenance
 */
experimentalExecutionRouter.get(
  '/experimental-execution/export/json',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const exportData = experimentalExecutionService.exportResultsJSON(userEmail);
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({
        error: 'JSON_EXPORT_FAILED',
        message: error.message || 'Failed to export JSON results',
      });
    }
  }
);

/**
 * GET /api/experimental-execution/export/csv
 * Export experimental runs and comparisons in CSV format
 */
experimentalExecutionRouter.get(
  '/experimental-execution/export/csv',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const csv = experimentalExecutionService.exportResultsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scos_phase10b_experimental_results.csv"');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        error: 'CSV_EXPORT_FAILED',
        message: error.message || 'Failed to export CSV results',
      });
    }
  }
);

/**
 * POST /api/experimental-execution/test
 * Run automated Phase 10B verification test suite
 */
experimentalExecutionRouter.post(
  '/experimental-execution/test',
  authenticateToken,
  requirePermission(PermissionType.EXPERIMENTAL_EXECUTION_ADMIN),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const testResults = runExperimentalExecutionTestSuite();
      res.json({
        status: 'SUCCESS',
        data: testResults,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute test suite',
      });
    }
  }
);
