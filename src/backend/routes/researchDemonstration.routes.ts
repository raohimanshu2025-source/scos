// =========================================================================
// SCOS PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE ROUTES
// Guided 15-Step Research Presentation, Examiner Questions, Manifest
// Version: SCOS-RESEARCH-DEMO-v1.0
// Mount: /api/research-demonstration
// =========================================================================

import { Router, Request, Response } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { researchDemonstrationService } from '../../services/researchDemonstrationService';
import { DemonstrationStepId, ScenarioId } from '../../types/researchDemonstration';

const router = Router();

// Apply JWT Authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/research-demonstration/summary
 * Retrieves compact research story summary and session status
 */
router.get(
  '/summary',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const summary = researchDemonstrationService.getResearchStorySummary();
      const session = researchDemonstrationService.buildResearchDemonstration();
      res.json({
        success: true,
        summary,
        session,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/steps
 * Retrieves all 15 master demonstration steps with complete narratives & mapped artifacts
 */
router.get(
  '/steps',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      res.json({
        success: true,
        totalSteps: steps.length,
        steps,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/quick
 * Retrieves 10-step Quick Demo sequence (~5 minutes)
 */
router.get(
  '/quick',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const quickSteps = researchDemonstrationService.getQuickDemoSteps();
      res.json({
        success: true,
        totalSteps: quickSteps.length,
        quickSteps,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/professor
 * Retrieves professor-mode filtered steps
 */
router.get(
  '/professor',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const professorSteps = researchDemonstrationService.getProfessorDemoSteps();
      const summary = researchDemonstrationService.getResearchStorySummary();
      res.json({
        success: true,
        totalSteps: professorSteps.length,
        professorSteps,
        summary,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/scenario
 * Retrieves benchmark scenario details (default: SC-01, or ?scenarioId=SC-02)
 */
router.get(
  '/scenario',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const scenarioId = (req.query.scenarioId as ScenarioId) || 'SC-01';
      const scenario = researchDemonstrationService.getDemonstrationScenario(scenarioId);
      res.json({
        success: true,
        scenario,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/civil-engineering
 * Retrieves civil engineering foundation summary & grounding registry
 */
router.get(
  '/civil-engineering',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const civilEngineering = researchDemonstrationService.getCivilEngineeringSummary();
      res.json({
        success: true,
        civilEngineering,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/experimental-design
 * Retrieves experimental design protocol (Condition A vs Condition B)
 */
router.get(
  '/experimental-design',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const design = researchDemonstrationService.getExperimentalDesignSummary();
      res.json({
        success: true,
        design,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/results
 * Retrieves M1–M10 benchmark results summary
 */
router.get(
  '/results',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const results = researchDemonstrationService.getResultsSummary();
      res.json({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/hypotheses
 * Retrieves H01–H05 hypothesis status & claim classifications
 */
router.get(
  '/hypotheses',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const hypotheses = researchDemonstrationService.getHypothesisSummary();
      res.json({
        success: true,
        hypotheses,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/contributions
 * Retrieves 8 formal research contributions
 */
router.get(
  '/contributions',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const contributions = researchDemonstrationService.getContributionSummary();
      res.json({
        success: true,
        contributions,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/boundaries
 * Retrieves Supported vs Unestablished evidence boundaries & disclosures
 */
router.get(
  '/boundaries',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const boundaries = researchDemonstrationService.getBoundarySummary();
      res.json({
        success: true,
        boundaries,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/questions
 * Retrieves 17 likely examiner questions with research-linked answers
 */
router.get(
  '/questions',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const questions = researchDemonstrationService.getExaminerQuestions();
      res.json({
        success: true,
        totalQuestions: questions.length,
        questions,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/manifest
 * Retrieves Demonstration Manifest with cryptographic SHA-256 fingerprint
 */
router.get(
  '/manifest',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const manifest = researchDemonstrationService.getDemonstrationManifest();
      res.json({
        success: true,
        manifest,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * GET /api/research-demonstration/evidence/:stepId
 * Retrieves granular evidence record for the Evidence Drawer
 */
router.get(
  '/evidence/:stepId',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const stepId = req.params.stepId as DemonstrationStepId;
      const evidence = researchDemonstrationService.getDemonstrationEvidence(stepId);
      res.json({
        success: true,
        stepId,
        evidence,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/research-demonstration/verify
 * Cryptographically verifies demonstration manifest fingerprint
 */
router.post(
  '/verify',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const verification = researchDemonstrationService.verifyDemonstrationFingerprint();
      res.json({
        success: true,
        verification,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/research-demonstration/reset
 * Resets active demonstration state non-destructively
 */
router.post(
  '/reset',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const result = researchDemonstrationService.resetDemonstrationState();
      res.json({
        success: true,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * POST /api/research-demonstration/test
 * Runs demonstration self-test
 */
router.post(
  '/test',
  requirePermission(PermissionType.RESEARCH_DEMONSTRATION_VIEW),
  (req: Request, res: Response) => {
    try {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const manifest = researchDemonstrationService.getDemonstrationManifest();
      const verification = researchDemonstrationService.verifyDemonstrationFingerprint();
      const questions = researchDemonstrationService.getExaminerQuestions();

      res.json({
        success: true,
        testResult: {
          status: verification.valid ? 'PASSED' : 'FAILED',
          stepCount: steps.length,
          manifestId: manifest.manifestId,
          fingerprintValid: verification.valid,
          examinerQuestionsCount: questions.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
