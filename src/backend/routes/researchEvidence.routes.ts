// =========================================================================
// SCOS PHASE 10D — RESEARCH EVIDENCE ROUTES
// Backend REST API Endpoints for Research Evidence & Findings Synthesis
// =========================================================================

import { Router, Request, Response } from 'express';
import { researchEvidenceService } from '../../services/researchEvidenceService';

export const researchEvidenceRouter = Router();

// GET /api/research-evidence/summary
researchEvidenceRouter.get('/research-evidence/summary', (_req: Request, res: Response) => {
  try {
    const summary = researchEvidenceService.getEvidenceSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch research evidence summary',
    });
  }
});

// GET /api/research-evidence/questions
researchEvidenceRouter.get('/research-evidence/questions', (_req: Request, res: Response) => {
  try {
    const questions = researchEvidenceService.getResearchQuestions();
    res.json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch research questions',
    });
  }
});

// GET /api/research-evidence/scenarios
researchEvidenceRouter.get('/research-evidence/scenarios', (_req: Request, res: Response) => {
  try {
    const scenarios = researchEvidenceService.getBenchmarkScenarios();
    res.json({
      success: true,
      data: scenarios,
      total: scenarios.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch benchmark scenarios',
    });
  }
});

// GET /api/research-evidence/export/csv
researchEvidenceRouter.get('/research-evidence/export/csv', (_req: Request, res: Response) => {
  try {
    const csv = researchEvidenceService.exportCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scos_research_evidence_matrix.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export CSV',
    });
  }
});
