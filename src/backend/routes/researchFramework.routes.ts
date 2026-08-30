// =========================================================================
// SCOS PHASE 10E — RESEARCH FRAMEWORK REST API ROUTES
// Endpoints for Architecture Layers, Research Contributions, Civil Engineering,
// RQ Traceability, Threats to Validity, Evidence Strength, Blueprint & Exports
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType, RoleType } from '../../types/auth';
import { researchFrameworkService } from '../../services/researchFrameworkService';
import { runResearchFrameworkTestSuite } from '../../tests/researchFramework.spec';
import { dbStore } from '../db/store';

export const researchFrameworkRouter = Router();

// =========================================================================
// 1. GET /api/research-framework/summary
// Full synthesized Research Contribution Framework
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/summary',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const framework = researchFrameworkService.getResearchFramework(userEmail);

      res.json({
        status: 'success',
        data: framework,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research framework summary.',
      });
    }
  }
);

// =========================================================================
// 2. GET /api/research-framework/architecture
// 9-Layer SCOS Reference Architecture
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/architecture',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const layers = researchFrameworkService.getArchitecturalLayers();

      res.json({
        status: 'success',
        data: {
          totalLayers: layers.length,
          layers,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve reference architecture layers.',
      });
    }
  }
);

// =========================================================================
// 3. GET /api/research-framework/contributions
// 7 Research Contribution Categories
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/contributions',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const contributions = researchFrameworkService.getResearchContributions();
      const gapMatrix = researchFrameworkService.getResearchGapMatrix();

      res.json({
        status: 'success',
        data: {
          contributions,
          gapMatrix,
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

// =========================================================================
// 4. GET /api/research-framework/civil-engineering
// 11 Civil Engineering Integration Domains
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/civil-engineering',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const civilEng = researchFrameworkService.getCivilEngineeringContribution();

      res.json({
        status: 'success',
        data: civilEng,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve civil engineering contribution.',
      });
    }
  }
);

// =========================================================================
// 5. GET /api/research-framework/traceability
// RQ -> Metric -> Scenario -> Evidence Traceability
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/traceability',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const traceability = researchFrameworkService.getResearchQuestionTraceability();

      res.json({
        status: 'success',
        data: traceability,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research question traceability.',
      });
    }
  }
);

// =========================================================================
// 6. GET /api/research-framework/threats-validity
// 14 Threats to Validity Items
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/threats-validity',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const threats = researchFrameworkService.getThreatsToValidity();

      res.json({
        status: 'success',
        data: threats,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve threats to validity registry.',
      });
    }
  }
);

// =========================================================================
// 7. GET /api/research-framework/evidence-strength
// Evidence Strength Taxonomy (Levels A to E)
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/evidence-strength',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const summary = researchFrameworkService.getEvidenceStrengthSummary();

      res.json({
        status: 'success',
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve evidence strength summary.',
      });
    }
  }
);

// =========================================================================
// 8. GET /api/research-framework/blueprint
// 12-Step End-to-End Research Lineage Blueprint Flow
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/blueprint',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const blueprint = researchFrameworkService.getResearchBlueprint();

      res.json({
        status: 'success',
        data: blueprint,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research blueprint flow.',
      });
    }
  }
);

// =========================================================================
// 9. POST /api/research-framework/test
// Automated 25-Spec Research Framework Test Suite
// =========================================================================
researchFrameworkRouter.post(
  '/research-framework/test',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const report = runResearchFrameworkTestSuite();

      dbStore.addAuditLog({
        actorId: req.user?.id || 'system',
        actorEmail: req.user?.email || 'researcher@scos.gov.in',
        actorRole: req.user?.role || RoleType.DISTRICT_ADMIN,
        action: 'EXECUTE_RESEARCH_FRAMEWORK_TEST_SUITE',
        resource: 'RESEARCH_FRAMEWORK_TESTS',
        details: {
          totalTests: report.totalTests,
          passedTests: report.passedTests,
          failedTests: report.failedTests,
          durationMs: report.executionDurationMs,
        },
        status: report.failedTests === 0 ? 'SUCCESS' : 'FAILURE',
      });

      res.json({
        status: 'success',
        data: report,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to execute research framework test suite.',
      });
    }
  }
);

// =========================================================================
// 10. GET /api/research-framework/export/json
// Export framework as JSON
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/export/json',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const framework = researchFrameworkService.exportFrameworkJSON(userEmail);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="scos-research-framework-phase10e.json"');
      res.json(framework);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export research framework JSON.',
      });
    }
  }
);

// =========================================================================
// 11. GET /api/research-framework/export/csv
// Export framework as CSV
// =========================================================================
researchFrameworkRouter.get(
  '/research-framework/export/csv',
  authenticateToken,
  requirePermission(PermissionType.RESEARCH_FRAMEWORK_VIEW),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email || 'researcher@scos.gov.in';
      const csv = researchFrameworkService.exportFrameworkCSV(userEmail);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scos-research-framework-phase10e.csv"');
      res.send(csv);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export research framework CSV.',
      });
    }
  }
);
