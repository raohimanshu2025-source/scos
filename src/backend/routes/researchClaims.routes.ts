// =========================================================================
// SCOS PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION ROUTES
// Authenticated & RBAC Guarded Endpoints for Research Claims & Hypotheses
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { researchClaimValidationService } from '../../services/researchClaimValidationService';

export const researchClaimsRouter = Router();

/**
 * 1. GET /api/research-claims/summary
 * Master consolidated snapshot
 */
researchClaimsRouter.get(
  '/research-claims/summary',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const snapshot = researchClaimValidationService.getClaimsSnapshot();
      res.json({
        status: 'success',
        data: snapshot,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research claims summary.',
      });
    }
  }
);

/**
 * 2. GET /api/research-claims/hypotheses
 * All 5 formal research hypotheses (H01 to H05)
 */
researchClaimsRouter.get(
  '/research-claims/hypotheses',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const hypotheses = researchClaimValidationService.getHypotheses();
      res.json({
        status: 'success',
        data: hypotheses,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research hypotheses.',
      });
    }
  }
);

/**
 * 3. GET /api/research-claims/hypotheses/:id
 * Single hypothesis by ID (e.g. H01, H02, RQ-01)
 */
researchClaimsRouter.get(
  '/research-claims/hypotheses/:id',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const hypothesis = researchClaimValidationService.getHypothesisById(req.params.id);
      if (!hypothesis) {
        res.status(404).json({
          status: 'error',
          message: `Hypothesis ${req.params.id} not found. Available: H01 to H05.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: hypothesis,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve hypothesis.',
      });
    }
  }
);

/**
 * 4. GET /api/research-claims/evidence/:id
 * Formal 9-step evidence chain for specific hypothesis
 */
researchClaimsRouter.get(
  '/research-claims/evidence/:id',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const chain = researchClaimValidationService.getEvidenceChain(req.params.id);
      if (!chain) {
        res.status(404).json({
          status: 'error',
          message: `Evidence chain for ${req.params.id} not found.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: chain,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve evidence chain.',
      });
    }
  }
);

/**
 * 5. GET /api/research-claims/metrics
 * Dynamic Metric-to-Hypothesis mapping matrix (M1 to M10)
 */
researchClaimsRouter.get(
  '/research-claims/metrics',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const matrix = researchClaimValidationService.getMetricMatrix();
      res.json({
        status: 'success',
        data: matrix,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve metric matrix.',
      });
    }
  }
);

/**
 * 6. POST /api/research-claims/validate
 * Rule-based hypothesis and claim validation evaluation
 */
researchClaimsRouter.post(
  '/research-claims/validate',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VALIDATE),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        hasMetric = true,
        hasBaselineAndSCOS = true,
        hasStatisticalDescription = true,
        hasScenarioCoverage = true,
        hasControlledExecution = true,
        isRobustUnderSensitivity = true,
        isAssumptionDependent = false,
      } = req.body || {};

      const status = researchClaimValidationService.evaluateClaimStatus(
        hasMetric,
        hasBaselineAndSCOS,
        hasStatisticalDescription,
        hasScenarioCoverage,
        hasControlledExecution,
        isRobustUnderSensitivity,
        isAssumptionDependent
      );

      const strength = researchClaimValidationService.calculateEvidenceStrength(
        hasMetric,
        hasScenarioCoverage,
        hasStatisticalDescription,
        hasControlledExecution,
        isRobustUnderSensitivity,
        isAssumptionDependent
      );

      res.json({
        status: 'success',
        data: {
          evaluatedStatus: status,
          evidenceStrength: strength.score,
          evidenceBand: strength.band,
          disclaimer:
            'Evidence strength is a structured research completeness indicator and is not a probability of correctness or statistical significance.',
          realWorldValidationNotice: 'REAL-WORLD FIELD VALIDATION — NOT ESTABLISHED.',
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to validate claim criteria.',
      });
    }
  }
);

/**
 * 7. POST /api/research-claims/validate-language
 * Audit claim language against prohibited over-claiming expressions
 */
researchClaimsRouter.post(
  '/research-claims/validate-language',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VALIDATE),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { text } = req.body || {};
      if (!text || typeof text !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Field "text" (string) is required in request body.',
        });
        return;
      }
      const audit = researchClaimValidationService.validateClaimLanguage(text);
      res.json({
        status: 'success',
        data: audit,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to audit claim language.',
      });
    }
  }
);

/**
 * 8. GET /api/research-claims/limitations
 * Research limitations and threats to validity registry
 */
researchClaimsRouter.get(
  '/research-claims/limitations',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const limitations = researchClaimValidationService.getLimitations();
      res.json({
        status: 'success',
        data: limitations,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve limitations.',
      });
    }
  }
);

/**
 * 9. GET /api/research-claims/export/json
 * Full snapshot JSON export
 */
researchClaimsRouter.get(
  '/research-claims/export/json',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const json = researchClaimValidationService.exportJSON();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos-research-claims-${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.json(json);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export claims JSON.',
      });
    }
  }
);

/**
 * 10. GET /api/research-claims/export/csv
 * Formatted CSV export
 */
researchClaimsRouter.get(
  '/research-claims/export/csv',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const csv = researchClaimValidationService.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos-research-claims-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export claims CSV.',
      });
    }
  }
);

/**
 * 11. GET /api/research-claims/fingerprint
 * Canonical SHA-256 hash
 */
researchClaimsRouter.get(
  '/research-claims/fingerprint',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const snapshot = researchClaimValidationService.getClaimsSnapshot();
      res.json({
        status: 'success',
        data: {
          canonicalFingerprint: snapshot.canonicalFingerprint,
          datasetVersion: snapshot.datasetVersion,
          generatedAt: snapshot.generatedAt,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve fingerprint.',
      });
    }
  }
);

/**
 * 12. POST /api/research-claims/test
 * Automated self-verification test runner
 */
researchClaimsRouter.post(
  '/research-claims/test',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_CLAIMS_VALIDATE),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const testResults = researchClaimValidationService.runSelfVerificationTest();
      res.json({
        status: 'success',
        data: testResults,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to run claims test.',
      });
    }
  }
);
