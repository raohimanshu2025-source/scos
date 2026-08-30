// =========================================================================
// SCOS PHASE 11A — INTEGRATED RESEARCH VALIDATION & EVIDENCE CONSOLIDATION ROUTES
// Authenticated & RBAC Guarded Endpoints for Consolidated Research Evidence
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { researchValidationService } from '../../services/researchValidationService';

export const researchValidationRouter = Router();

/**
 * 1. GET /api/research-validation/summary
 * Master consolidated snapshot
 */
researchValidationRouter.get(
  '/research-validation/summary',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const snapshot = researchValidationService.getConsolidatedSnapshot();
      res.json({
        status: 'success',
        data: snapshot,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research validation summary.',
      });
    }
  }
);

/**
 * 2. GET /api/research-validation/rq/:rqId
 * Consolidated evidence for specific research question (RQ-01 to RQ-05)
 */
researchValidationRouter.get(
  '/research-validation/rq/:rqId',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const rqId = req.params.rqId.toUpperCase();
      const rqs = researchValidationService.getResearchQuestions();
      const match = rqs.find((r) => r.rqId.toUpperCase() === rqId || r.code.toUpperCase() === rqId);
      if (!match) {
        res.status(404).json({
          status: 'error',
          message: `Research Question ${req.params.rqId} not found. Available: RQ-01 to RQ-05.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: match,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research question evidence.',
      });
    }
  }
);

/**
 * 3. GET /api/research-validation/metric/:metricId
 * Consolidated evidence for specific metric (M1 to M10)
 */
researchValidationRouter.get(
  '/research-validation/metric/:metricId',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const metricId = req.params.metricId.toUpperCase();
      const metrics = researchValidationService.getMetrics();
      const match = metrics.find(
        (m) =>
          m.metricId.toUpperCase() === metricId ||
          m.metricCode.toUpperCase() === metricId ||
          m.metricId.toUpperCase().startsWith(metricId + '_')
      );
      if (!match) {
        res.status(404).json({
          status: 'error',
          message: `Metric ${req.params.metricId} not found. Available: M1 to M10.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: match,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve metric evidence.',
      });
    }
  }
);

/**
 * 4. GET /api/research-validation/scenario/:scenarioId
 * Consolidated evidence for specific benchmark scenario (SC-01 to SC-05)
 */
researchValidationRouter.get(
  '/research-validation/scenario/:scenarioId',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const scenarioId = req.params.scenarioId.toUpperCase();
      const scenarios = researchValidationService.getScenarios();
      const match = scenarios.find(
        (s) =>
          s.scenarioId.toUpperCase() === scenarioId ||
          s.scenarioId.toUpperCase().replace('SC-', 'SCN-') === scenarioId ||
          s.scenarioId.toUpperCase().replace('SCN-', 'SC-') === scenarioId
      );
      if (!match) {
        res.status(404).json({
          status: 'error',
          message: `Scenario ${req.params.scenarioId} not found. Available: SC-01 to SC-05.`,
        });
        return;
      }
      res.json({
        status: 'success',
        data: match,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve scenario evidence.',
      });
    }
  }
);

/**
 * 5. GET /api/research-validation/validation-cases
 * VC-01 to VC-07 Scenario Validation Cases
 */
researchValidationRouter.get(
  '/research-validation/validation-cases',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cases = researchValidationService.getValidationCases();
      res.json({
        status: 'success',
        data: {
          totalCount: cases.length,
          cases,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve validation cases.',
      });
    }
  }
);

/**
 * 6. GET /api/research-validation/evidence-matrix
 * Complete Evidence Matrix across RQs, Metrics, and Scenarios
 */
researchValidationRouter.get(
  '/research-validation/evidence-matrix',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const rqs = researchValidationService.getResearchQuestions();
      const metrics = researchValidationService.getMetrics();
      const scenarios = researchValidationService.getScenarios();
      const profile = researchValidationService.getStructuredEvidenceProfile();
      res.json({
        status: 'success',
        data: {
          profile,
          researchQuestions: rqs,
          metrics,
          scenarios,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve evidence matrix.',
      });
    }
  }
);

/**
 * 7. GET /api/research-validation/threats
 * Threats to Validity Matrix (14 Categories)
 */
researchValidationRouter.get(
  '/research-validation/threats',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const threats = researchValidationService.getThreatsToValidity();
      res.json({
        status: 'success',
        data: {
          totalCount: threats.length,
          threats,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve threats to validity.',
      });
    }
  }
);

/**
 * 8. GET /api/research-validation/civil-engineering
 * Civil Engineering Domain Evidence
 */
researchValidationRouter.get(
  '/research-validation/civil-engineering',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const civilEng = researchValidationService.getCivilEngineeringEvidence();
      res.json({
        status: 'success',
        data: {
          totalCount: civilEng.length,
          domains: civilEng,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve civil engineering evidence.',
      });
    }
  }
);

/**
 * 9. GET /api/research-validation/contributions
 * Research Contributions (5 Categories)
 */
researchValidationRouter.get(
  '/research-validation/contributions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const contribs = researchValidationService.getResearchContributions();
      res.json({
        status: 'success',
        data: {
          totalCount: contribs.length,
          contributions: contribs,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research contributions.',
      });
    }
  }
);

/**
 * 10. GET /api/research-validation/gaps
 * Evidence Gaps & Future Validation Roadmap
 */
researchValidationRouter.get(
  '/research-validation/gaps',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const gaps = researchValidationService.getEvidenceGaps();
      res.json({
        status: 'success',
        data: {
          totalCount: gaps.length,
          gaps,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve evidence gaps.',
      });
    }
  }
);

/**
 * 11. GET /api/research-validation/maturity
 * Research Maturity Assessment (Level 1-6)
 */
researchValidationRouter.get(
  '/research-validation/maturity',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const maturity = researchValidationService.getResearchMaturity();
      res.json({
        status: 'success',
        data: maturity,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research maturity assessment.',
      });
    }
  }
);

/**
 * 12. GET /api/research-validation/provenance
 * Provenance and Academic Manifest
 */
researchValidationRouter.get(
  '/research-validation/provenance',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const provenance = researchValidationService.getProvenanceManifest();
      res.json({
        status: 'success',
        data: provenance,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve provenance manifest.',
      });
    }
  }
);

/**
 * 13. GET /api/research-validation/claim-ledger
 * Audited Claim Ledger with Language Safety Constraints
 */
researchValidationRouter.get(
  '/research-validation/claim-ledger',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const claims = researchValidationService.getClaimLedger();
      res.json({
        status: 'success',
        data: {
          totalCount: claims.length,
          claims,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve claim ledger.',
      });
    }
  }
);

/**
 * 14. POST /api/research-validation/validate-claim
 * Language safety linter for claim text
 */
researchValidationRouter.post(
  '/research-validation/validate-claim',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
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
      const validation = researchValidationService.validateClaimLanguage(text);
      res.json({
        status: 'success',
        data: validation,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to validate claim text.',
      });
    }
  }
);

/**
 * 15. GET /api/research-validation/export/json
 * Export full validation snapshot as JSON
 */
researchValidationRouter.get(
  '/research-validation/export/json',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const snapshot = researchValidationService.exportJSON();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos-research-validation-${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.json(snapshot);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export validation JSON.',
      });
    }
  }
);

/**
 * 16. GET /api/research-validation/export/csv
 * Export summary evidence as CSV
 */
researchValidationRouter.get(
  '/research-validation/export/csv',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const csv = researchValidationService.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="scos-research-validation-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export validation CSV.',
      });
    }
  }
);

/**
 * 17. GET /api/research-validation/test
 * Self-verification test routine
 */
researchValidationRouter.get(
  '/research-validation/test',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_VALIDATION_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = researchValidationService.runSelfVerificationTest();
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to run validation test.',
      });
    }
  }
);
