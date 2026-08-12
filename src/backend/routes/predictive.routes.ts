/**
 * SCOS Phase 5B.5 — Predictive Intelligence & Decision Support API Routes
 */

import { Router, Request, Response } from 'express';
import { predictionStore } from '../../services/predictionStore';
import { generateAIPredictionExplanation } from '../../services/predictionService';

export const predictiveRouter = Router();

/**
 * GET /api/predictive/risks
 * Fetch all active city risk zones & predictive alerts
 */
predictiveRouter.get('/predictive/risks', (_req: Request, res: Response) => {
  try {
    const risks = predictionStore.getAllRiskZones();
    const metrics = predictionStore.getMetrics();
    const currentDemoStep = predictionStore.getCurrentDemoStep();

    res.json({
      status: 'SUCCESS',
      risks,
      metrics,
      currentDemoStep,
      demoStepIndex: predictionStore.getDemoStepIndex(),
      isDemoRunning: predictionStore.isScenarioRunning(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * GET /api/predictive/risks/:id
 * Get single risk zone detail
 */
predictiveRouter.get('/predictive/risks/:id', (req: Request, res: Response) => {
  try {
    const zone = predictionStore.getRiskZoneById(req.params.id);
    if (!zone) {
      return res.status(404).json({ status: 'ERROR', message: 'Risk zone not found' });
    }
    res.json({ status: 'SUCCESS', zone });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/risks/:id/approve-preventive
 * Approve Early Warning & Dispatch PREVENTIVE tasks
 */
predictiveRouter.post('/predictive/risks/:id/approve-preventive', (req: Request, res: Response) => {
  try {
    const { officerName, officerRole } = req.body;
    const result = predictionStore.approveEarlyWarning(
      req.params.id,
      officerName || 'District Officer',
      officerRole || 'DISTRICT_ADMIN'
    );

    if (!result.success) {
      return res.status(400).json({ status: 'ERROR', message: result.message });
    }

    const updatedZone = predictionStore.getRiskZoneById(req.params.id);
    res.json({
      status: 'SUCCESS',
      message: result.message,
      createdIncidentId: result.createdIncidentId,
      zone: updatedZone,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/risks/:id/dismiss-preventive
 * Dismiss Early Warning
 */
predictiveRouter.post('/predictive/risks/:id/dismiss-preventive', (req: Request, res: Response) => {
  try {
    const { officerName, reason } = req.body;
    const ok = predictionStore.dismissEarlyWarning(req.params.id, officerName || 'Officer', reason || 'Dismissed by officer');
    if (!ok) return res.status(400).json({ status: 'ERROR', message: 'Failed to dismiss early warning' });

    res.json({ status: 'SUCCESS', message: 'Early warning dismissed by officer.' });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/risks/:id/modify-preventive
 * Modify preventive actions
 */
predictiveRouter.post('/predictive/risks/:id/modify-preventive', (req: Request, res: Response) => {
  try {
    const { updatedActions, officerName } = req.body;
    const ok = predictionStore.modifyEarlyWarningActions(req.params.id, updatedActions || [], officerName || 'Officer');
    if (!ok) return res.status(400).json({ status: 'ERROR', message: 'Failed to modify actions' });

    res.json({ status: 'SUCCESS', message: 'Preventive actions updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/scenario/what-if
 * Run interactive What-If scenario simulation
 */
predictiveRouter.post('/predictive/scenario/what-if', async (req: Request, res: Response) => {
  try {
    const {
      scenario_title,
      rainfall_intensity_mm_hr,
      duration_hours,
      road_blockage_severity,
      drainage_clogging_percent,
      target_zone_id,
    } = req.body;

    const input = {
      scenario_title: scenario_title || `What-If Analysis: ${rainfall_intensity_mm_hr || 60}mm/hr Rainfall`,
      rainfall_intensity_mm_hr: Number(rainfall_intensity_mm_hr) || 60,
      duration_hours: Number(duration_hours) || 2,
      road_blockage_severity: road_blockage_severity || 'PARTIAL',
      drainage_clogging_percent: Number(drainage_clogging_percent) || 40,
      target_zone_id: target_zone_id || 'ZONE-PARADE-CROSSING',
    };

    const result = await predictionStore.runWhatIfAnalysis(input);
    res.json({ status: 'SUCCESS', result });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/demo-scenario/advance
 * Step forward in the 15-step Predictive Heavy Rainfall Demo Scenario
 */
predictiveRouter.post('/predictive/demo-scenario/advance', (_req: Request, res: Response) => {
  try {
    const result = predictionStore.advanceDemoScenarioStep();
    res.json({
      status: 'SUCCESS',
      step: result.step,
      stepIndex: predictionStore.getDemoStepIndex(),
      isComplete: result.isComplete,
      zone: result.zone,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * POST /api/predictive/demo-scenario/reset
 * Reset the Predictive Demo Scenario
 */
predictiveRouter.post('/predictive/demo-scenario/reset', (_req: Request, res: Response) => {
  try {
    predictionStore.resetDemoScenario();
    res.json({ status: 'SUCCESS', message: 'Predictive Demo Scenario reset.' });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/**
 * GET /api/predictive/metrics
 * Fetch research evaluation metrics & scientific dimensions
 */
predictiveRouter.get('/predictive/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = predictionStore.getMetrics();
    res.json({ status: 'SUCCESS', metrics });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});
