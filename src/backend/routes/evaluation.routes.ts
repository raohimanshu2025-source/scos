import { Router, Response } from 'express';
import { evaluationStore } from '../../services/evaluationStore';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';

export const evaluationRouter = Router();

/**
 * 1. Start Evaluation Session
 */
evaluationRouter.post(
  '/evaluation/session/start',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId = 'P01', workflowType = 'SCOS', scenarioId = 'SIMULATED EVALUATION SCENARIO' } = req.body;
      const session = evaluationStore.startSession(participantId, workflowType, scenarioId);
      res.json({ status: 'SUCCESS', session });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to start evaluation session' });
    }
  }
);

/**
 * 2. Get Active Evaluation Session
 */
evaluationRouter.get(
  '/evaluation/session/active',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const participantId = (req.query.participantId as string) || 'P01';
      const session = evaluationStore.getActiveSession(participantId);
      res.json({ status: 'SUCCESS', session: session || null });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to fetch active evaluation session' });
    }
  }
);

/**
 * 3. Record Interaction / Access Event
 */
evaluationRouter.post(
  '/evaluation/session/event',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId = 'P01', eventType, resource } = req.body;
      if (!eventType || !resource) {
        return res.status(400).json({ status: 'ERROR', message: 'eventType and resource are required' });
      }
      const session = evaluationStore.recordAccessEvent(participantId, eventType, resource);
      res.json({ status: 'SUCCESS', session: session || null });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to record event' });
    }
  }
);

/**
 * 4. Complete Baseline Manual Step
 */
evaluationRouter.post(
  '/evaluation/session/baseline-step',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId = 'P01', stepId } = req.body;
      if (!stepId) {
        return res.status(400).json({ status: 'ERROR', message: 'stepId is required' });
      }
      const session = evaluationStore.completeBaselineStep(participantId, stepId);
      res.json({ status: 'SUCCESS', session: session || null });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to record baseline step' });
    }
  }
);

/**
 * 5. Complete Evaluation Session
 */
evaluationRouter.post(
  '/evaluation/session/complete',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId = 'P01', incidentId = 'SCOS-INC-1024' } = req.body;
      const result = evaluationStore.completeSession(participantId, incidentId);
      if (!result) {
        return res.status(400).json({ status: 'ERROR', message: 'No active running evaluation session found for participant' });
      }
      res.json({ status: 'SUCCESS', result });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to complete evaluation session' });
    }
  }
);

/**
 * 6. Reset Evaluation Session
 */
evaluationRouter.post(
  '/evaluation/session/reset',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { participantId = 'P01' } = req.body;
      evaluationStore.resetSession(participantId);
      res.json({ status: 'SUCCESS', message: 'Evaluation session reset successfully' });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to reset evaluation session' });
    }
  }
);

/**
 * 7. Get All Results
 */
evaluationRouter.get(
  '/evaluation/results',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const results = evaluationStore.getAllResults();
      res.json({ status: 'SUCCESS', results });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to fetch evaluation results' });
    }
  }
);

/**
 * 8. Get Comparison (Baseline vs SCOS)
 */
evaluationRouter.get(
  '/evaluation/comparison',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const participantId = (req.query.participantId as string) || 'P01';
      const scenarioId = (req.query.scenarioId as string) || 'SIMULATED EVALUATION SCENARIO';
      const comparison = evaluationStore.getComparison(participantId, scenarioId);
      res.json({ status: 'SUCCESS', comparison: comparison || null });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to generate evaluation comparison' });
    }
  }
);

/**
 * 9. Export Results as CSV
 */
evaluationRouter.get(
  '/evaluation/export/csv',
  authenticateToken,
  requirePermission(PermissionType.EVALUATION_VIEW, PermissionType.INCIDENT_VIEW, PermissionType.DASHBOARD_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const csv = evaluationStore.exportResultsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scos_evaluation_results.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Failed to export CSV' });
    }
  }
);
