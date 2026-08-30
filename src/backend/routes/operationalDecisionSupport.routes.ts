import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { operationalDecisionSupportService } from '../../services/operationalDecisionSupportService';
import { runOperationalDecisionSupportTestSuite } from '../../tests/operationalDecisionSupport.spec';

export const operationalDecisionSupportRouter = Router();

/**
 * GET /api/operational-decision-support/:incidentId?
 * Retrieves a transparent, evidence-linked decision-support snapshot for a specific incident.
 */
operationalDecisionSupportRouter.get(
  '/operational-decision-support/:incidentId?',
  authenticateToken,
  requirePermission(PermissionType.OPERATIONAL_DECISION_SUPPORT_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidentId = req.params.incidentId;
      const snapshot = operationalDecisionSupportService.getDecisionSupportSnapshot(incidentId);

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
        error: 'DECISION_SUPPORT_GENERATION_FAILED',
        message: error.message || 'An unexpected error occurred generating decision support snapshot',
      });
    }
  }
);

/**
 * POST /api/operational-decision-support/:incidentId/review
 * Allows an authorized officer to review (Approve / Modify / Reject) a decision option.
 * Audit-logged and maintains Human-in-the-Loop governance.
 */
operationalDecisionSupportRouter.post(
  '/operational-decision-support/:incidentId/review',
  authenticateToken,
  requirePermission(PermissionType.OPERATIONAL_DECISION_SUPPORT_REVIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidentId = req.params.incidentId;
      const payload = req.body;

      if (!payload || !payload.optionId || !payload.action) {
        res.status(400).json({
          error: 'INVALID_REVIEW_PAYLOAD',
          message: 'optionId and action (APPROVE, MODIFY, REJECT) are required',
        });
        return;
      }

      const result = operationalDecisionSupportService.reviewDecisionOption(
        incidentId,
        payload,
        req.user?.email || 'officer@kanpur.gov.in',
        req.user?.role || 'DISTRICT_ADMIN',
        req.user?.id
      );

      res.json({
        status: 'SUCCESS',
        message: `Decision option ${payload.optionId} successfully recorded as ${payload.action}`,
        data: result.snapshot,
        auditEventId: result.auditEventId,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DECISION_REVIEW_FAILED',
        message: error.message || 'Failed to record decision option review',
      });
    }
  }
);

/**
 * GET /api/operational-decision-support/test/run
 * Run automated Phase 8.5C Decision Support verification suite
 */
operationalDecisionSupportRouter.get(
  '/operational-decision-support/test/run',
  authenticateToken,
  requirePermission(PermissionType.OPERATIONAL_DECISION_SUPPORT_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const results = runOperationalDecisionSupportTestSuite();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute decision support test suite',
      });
    }
  }
);
