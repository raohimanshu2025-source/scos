import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { operationalMonitoringService } from '../../services/operationalMonitoringService';
import { runOperationalMonitoringTestSuite } from '../../tests/operationalMonitoring.spec';
import { runSituationalAwarenessTestSuite } from '../../tests/situationalAwareness.spec';

export const operationalMonitoringRouter = Router();

/**
 * GET /api/operational-monitoring/summary
 * Retrieves executive real-time operational monitoring snapshot aggregating
 * Incidents, Predictive Risks, Civil Infrastructure, Department Coordination,
 * Tasks, SLAs, Escalations, Data Freshness, and Data Source Health.
 */
operationalMonitoringRouter.get(
  '/operational-monitoring/summary',
  authenticateToken,
  requirePermission(PermissionType.OPERATIONAL_MONITORING_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const snapshot = operationalMonitoringService.generateSnapshot();

      res.json({
        status: 'SUCCESS',
        data: snapshot,
        meta: {
          requestedBy: req.user?.email,
          userRole: req.user?.role,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'OPERATIONAL_MONITORING_AGGREGATION_FAILED',
        message: error.message || 'An unexpected error occurred during operational aggregation',
      });
    }
  }
);

/**
 * GET /api/operational-monitoring/test
 * Run automated Phase 8.5A Operational Monitoring verification suite
 */
operationalMonitoringRouter.get(
  '/operational-monitoring/test',
  authenticateToken,
  requirePermission(PermissionType.OPERATIONAL_MONITORING_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const results = runOperationalMonitoringTestSuite();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute operational monitoring test suite',
      });
    }
  }
);

/**
 * GET /api/situational-awareness/test
 * Run automated Phase 8.5B Situational Awareness verification suite
 */
operationalMonitoringRouter.get(
  '/situational-awareness/test',
  authenticateToken,
  requirePermission(PermissionType.SITUATIONAL_AWARENESS_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const results = runSituationalAwarenessTestSuite();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute situational awareness test suite',
      });
    }
  }
);
