// =========================================================================
// SCOS PHASE 9D — COMPARATIVE EVALUATION API ROUTES
// Research Comparison Endpoints: Baseline Manual vs SCOS Integrated Workflow
// =========================================================================

import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { comparativeEvaluationService } from '../../services/comparativeEvaluationService';
import { runComparativeEvaluationTestSuite } from '../../tests/comparativeEvaluation.spec';

export const comparativeEvaluationRouter = Router();

/**
 * GET /api/comparative-evaluation/scenarios
 * Retrieves the registry of controlled comparative scenarios (SC-01 to SC-05)
 */
comparativeEvaluationRouter.get(
  '/comparative-evaluation/scenarios',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const scenarios = comparativeEvaluationService.getScenarios();
      res.json({
        status: 'SUCCESS',
        data: scenarios,
        meta: {
          totalScenarios: scenarios.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
          disclaimer: 'Comparative evaluation scenarios are controlled research prototypes and do not reflect real-world municipal operational data.',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_SCENARIOS_FAILED',
        message: error.message || 'Failed to retrieve comparative evaluation scenarios',
      });
    }
  }
);

/**
 * GET /api/comparative-evaluation/records
 * Retrieves all stored comparative evaluation records
 */
comparativeEvaluationRouter.get(
  '/comparative-evaluation/records',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const records = comparativeEvaluationService.getAllRecords();
      res.json({
        status: 'SUCCESS',
        data: records,
        meta: {
          totalRecords: records.length,
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_RECORDS_FAILED',
        message: error.message || 'Failed to retrieve comparative evaluation records',
      });
    }
  }
);

/**
 * GET /api/comparative-evaluation/records/:participantId
 * Retrieves comparative record for a specific participant and scenario
 */
comparativeEvaluationRouter.get(
  '/comparative-evaluation/records/:participantId',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const participantId = req.params.participantId;
      const scenarioId = (req.query.scenarioId as string) || 'SC-01';
      const record = comparativeEvaluationService.getRecordByParticipant(participantId, scenarioId);

      if (!record) {
        return res.status(404).json({
          error: 'RECORD_NOT_FOUND',
          message: `No comparative evaluation record found for participant '${participantId}' on scenario '${scenarioId}'`,
        });
      }

      res.json({
        status: 'SUCCESS',
        data: record,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_RECORD_FAILED',
        message: error.message || 'Failed to retrieve comparative record',
      });
    }
  }
);

/**
 * POST /api/comparative-evaluation/run
 * Executes a controlled comparative evaluation across Baseline and SCOS
 */
comparativeEvaluationRouter.post(
  '/comparative-evaluation/run',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId, scenarioId, evaluationOrder, incidentId } = req.body || {};
      const targetParticipant = participantId || 'P01';
      const targetScenario = scenarioId || 'SC-01';
      const targetOrder = evaluationOrder || 'BASELINE_THEN_SCOS';
      const targetIncident = incidentId || 'SCOS-INC-1024';

      const result = comparativeEvaluationService.executeComparativeEvaluation(
        targetParticipant,
        targetScenario,
        targetOrder,
        targetIncident
      );

      res.json({
        status: 'SUCCESS',
        data: result,
        meta: {
          executedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
          disclaimer: 'Comparative evaluation assesses prototype workflow characteristics; it does not claim real-world municipal operational improvement.',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_RUN_FAILED',
        message: error.message || 'Failed to execute comparative evaluation',
      });
    }
  }
);

/**
 * GET /api/comparative-evaluation/report
 * Retrieves full comparative evaluation research report with descriptive aggregate statistics
 */
comparativeEvaluationRouter.get(
  '/comparative-evaluation/report',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const report = comparativeEvaluationService.generateComparativeReport();
      res.json({
        status: 'SUCCESS',
        data: report,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_REPORT_FAILED',
        message: error.message || 'Failed to generate comparative evaluation report',
      });
    }
  }
);

/**
 * POST /api/comparative-evaluation/export
 * Exports comparative evaluation results as formatted CSV
 */
comparativeEvaluationRouter.post(
  '/comparative-evaluation/export',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const csv = comparativeEvaluationService.exportComparativeCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scos-comparative-evaluation.csv"');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_EXPORT_FAILED',
        message: error.message || 'Failed to export comparative evaluation CSV',
      });
    }
  }
);

/**
 * POST /api/comparative-evaluation/test-suite
 * Executes the 20-test automated comparative evaluation test suite
 */
comparativeEvaluationRouter.post(
  '/comparative-evaluation/test-suite',
  authenticateToken,
  requirePermission(PermissionType.COMPARATIVE_EVALUATION_EXECUTE),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const suiteResult = runComparativeEvaluationTestSuite();
      res.json(suiteResult);
    } catch (error: any) {
      res.status(500).json({
        error: 'COMPARATIVE_TEST_SUITE_FAILED',
        message: error.message || 'Failed to execute comparative evaluation test suite',
      });
    }
  }
);
