// =========================================================================
// SCOS PHASE 11C — THESIS EVIDENCE & ACADEMIC REPRODUCIBILITY ROUTES
// Authenticated & RBAC Guarded Endpoints for Academic Evidence Package,
// Chapter Mappings, Registries, Manifests, and Reproducibility Exports.
// =========================================================================

import { Router, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { thesisEvidenceService } from '../../services/thesisEvidenceService';

export const thesisEvidenceRouter = Router();

/**
 * 1. GET /api/thesis-evidence/package
 * Complete master Thesis Evidence Package
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/package',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const pkg = thesisEvidenceService.buildThesisEvidencePackage();
      res.json({
        status: 'success',
        data: pkg,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to build thesis evidence package.',
      });
    }
  }
);

/**
 * 2. GET /api/thesis-evidence/rq-matrix
 * Master RQ -> H -> M -> SC -> Claim Matrix
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/rq-matrix',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const matrix = thesisEvidenceService.getResearchQuestionMatrix();
      res.json({
        status: 'success',
        data: matrix,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve research question matrix.',
      });
    }
  }
);

/**
 * 3. GET /api/thesis-evidence/hypotheses
 * Thesis Hypothesis Summaries (H01 to H05)
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/hypotheses',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const hypotheses = thesisEvidenceService.getHypothesisSummaries();
      res.json({
        status: 'success',
        data: hypotheses,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve thesis hypotheses.',
      });
    }
  }
);

/**
 * 4. GET /api/thesis-evidence/chapters
 * Thesis Chapter Mappings (Chapters 1 to 9)
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/chapters',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const chapters = thesisEvidenceService.getChapterMappings();
      res.json({
        status: 'success',
        data: chapters,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve thesis chapter mappings.',
      });
    }
  }
);

/**
 * 5. GET /api/thesis-evidence/figures
 * Figure Registry (10 registered thesis figures)
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/figures',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const figures = thesisEvidenceService.getFigureRegistry();
      res.json({
        status: 'success',
        data: figures,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve figure registry.',
      });
    }
  }
);

/**
 * 6. GET /api/thesis-evidence/tables
 * Table Registry (10 registered thesis tables)
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/tables',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const tables = thesisEvidenceService.getTableRegistry();
      res.json({
        status: 'success',
        data: tables,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve table registry.',
      });
    }
  }
);

/**
 * 7. GET /api/thesis-evidence/contributions
 * Research Contributions Registry (8 academic contributions)
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/contributions',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const contributions = thesisEvidenceService.getContributionRegistry();
      res.json({
        status: 'success',
        data: contributions,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve contribution registry.',
      });
    }
  }
);

/**
 * 8. GET /api/thesis-evidence/boundaries
 * Evidence Boundaries: What SCOS Supports vs. Does NOT Establish
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/boundaries',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const boundaries = thesisEvidenceService.getEvidenceBoundaries();
      res.json({
        status: 'success',
        data: boundaries,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve evidence boundaries.',
      });
    }
  }
);

/**
 * 9. GET /api/thesis-evidence/reproducibility-manifest
 * Thesis Reproducibility Manifest
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/reproducibility-manifest',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.getReproducibilityManifest();
      res.json({
        status: 'success',
        data: manifest,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve reproducibility manifest.',
      });
    }
  }
);

/**
 * 10. GET /api/thesis-evidence/dataset-manifest
 * Thesis Dataset Manifest
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/dataset-manifest',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.getDatasetManifest();
      res.json({
        status: 'success',
        data: manifest,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to retrieve dataset manifest.',
      });
    }
  }
);

/**
 * 11. GET /api/thesis-evidence/verify-fingerprint
 * Verification of package, dataset, and claims fingerprints
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/verify-fingerprint',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const verification = thesisEvidenceService.verifyPackageFingerprint();
      res.json({
        status: 'success',
        data: verification,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to verify package fingerprint.',
      });
    }
  }
);

/**
 * 12. GET & POST /api/thesis-evidence/export/json
 * Export full thesis package as deterministic JSON
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/export/json',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceJSON();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="scos-thesis-evidence-v1.0.json"`);
      res.send(manifest.content);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export thesis evidence JSON.',
      });
    }
  }
);

thesisEvidenceRouter.post(
  '/thesis-evidence/export/json',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceJSON();
      res.json({
        status: 'success',
        data: manifest,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to generate thesis JSON manifest.',
      });
    }
  }
);

/**
 * 13. GET & POST /api/thesis-evidence/export/csv
 * Export master evidence tables as CSV
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/export/csv',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="scos-thesis-evidence-matrices-v1.0.csv"`);
      res.send(manifest.content);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export thesis evidence CSV.',
      });
    }
  }
);

thesisEvidenceRouter.post(
  '/thesis-evidence/export/csv',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceCSV();
      res.json({
        status: 'success',
        data: manifest,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to generate thesis CSV manifest.',
      });
    }
  }
);

/**
 * 14. GET & POST /api/thesis-evidence/export/markdown
 * Export publication-ready academic Markdown summary
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/export/markdown',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceMarkdown();
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="scos-thesis-evidence-summary-v1.0.md"`);
      res.send(manifest.content);
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to export thesis evidence Markdown.',
      });
    }
  }
);

thesisEvidenceRouter.post(
  '/thesis-evidence/export/markdown',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_EXPORT),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const manifest = thesisEvidenceService.exportThesisEvidenceMarkdown();
      res.json({
        status: 'success',
        data: manifest,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to generate thesis Markdown manifest.',
      });
    }
  }
);

/**
 * 15. GET /api/thesis-evidence/self-test
 * Self-verification test suite
 */
thesisEvidenceRouter.get(
  '/thesis-evidence/self-test',
  authenticateToken,
  requirePermission(PermissionType.THESIS_EVIDENCE_VIEW),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const testResults = thesisEvidenceService.runSelfVerificationTest();
      res.json({
        status: 'success',
        data: testResults,
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to execute thesis self-verification test.',
      });
    }
  }
);
