/**
 * SCOS Phase 5B.5 — Predictive Intelligence & Decision Support API Routes
 * Hardened with JWT authentication, RBAC authorization, verified identity, and audit logging.
 */

import { Router, Response } from 'express';
import { predictionStore } from '../../services/predictionStore';
import { incidentStore } from '../../services/incidentStore';
import { RuleBasedPredictionEngine } from '../../services/predictionService';
import { 
  authenticateToken, 
  requirePermission, 
  AuthenticatedRequest 
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { dbStore } from '../db/store';

export const predictiveRouter = Router();

/**
 * GET /api/predictive/risks
 * Fetch all active city risk zones & predictive alerts
 */
predictiveRouter.get(
  '/predictive/risks',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
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
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * GET /api/predictive/risks/:id
 * Get single risk zone detail
 */
predictiveRouter.get(
  '/predictive/risks/:id',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const zone = predictionStore.getRiskZoneById(req.params.id);
      if (!zone) {
        return res.status(404).json({ status: 'ERROR', message: 'Risk zone not found' });
      }
      res.json({ status: 'SUCCESS', zone });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/risks/:id/approve-preventive
 * Approve Early Warning & Dispatch PREVENTIVE tasks
 * SECURITY HARDENED: Uses authenticated JWT identity (req.user) instead of body params.
 */
predictiveRouter.post(
  '/predictive/risks/:id/approve-preventive',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_APPROVE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      // CRITICAL: Extract identity strictly from authenticated JWT context
      const officerName = req.user.fullName;
      const officerRole = req.user.role;

      const result = predictionStore.approveEarlyWarning(
        req.params.id,
        officerName,
        officerRole
      );

      if (!result.success) {
        return res.status(400).json({ status: 'ERROR', message: result.message });
      }

      const updatedZone = predictionStore.getRiskZoneById(req.params.id);

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'PREDICTIVE_EARLY_WARNING_APPROVED',
        resource: `RISK_ZONE:${req.params.id}`,
        status: 'SUCCESS',
        details: {
          createdIncidentId: result.createdIncidentId,
          officerName,
          officerRole,
        },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        message: result.message,
        createdIncidentId: result.createdIncidentId,
        zone: updatedZone,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/risks/:id/dismiss-preventive
 * Dismiss Early Warning
 */
predictiveRouter.post(
  '/predictive/risks/:id/dismiss-preventive',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_APPROVE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { reason } = req.body;
      const officerName = req.user.fullName;

      const ok = predictionStore.dismissEarlyWarning(
        req.params.id,
        officerName,
        reason || 'Dismissed by officer'
      );

      if (!ok) {
        return res.status(400).json({ status: 'ERROR', message: 'Failed to dismiss early warning' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'PREDICTIVE_EARLY_WARNING_DISMISSED',
        resource: `RISK_ZONE:${req.params.id}`,
        status: 'SUCCESS',
        details: { officerName, reason },
        ipAddress: req.ip,
      });

      res.json({ status: 'SUCCESS', message: 'Early warning dismissed by officer.' });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/risks/:id/modify-preventive
 * Modify preventive actions
 */
predictiveRouter.post(
  '/predictive/risks/:id/modify-preventive',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_APPROVE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { updatedActions } = req.body;
      const officerName = req.user.fullName;

      const ok = predictionStore.modifyEarlyWarningActions(
        req.params.id,
        updatedActions || [],
        officerName
      );

      if (!ok) {
        return res.status(400).json({ status: 'ERROR', message: 'Failed to modify actions' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'PREDICTIVE_ACTIONS_MODIFIED',
        resource: `RISK_ZONE:${req.params.id}`,
        status: 'SUCCESS',
        details: { officerName, updatedActionCount: updatedActions?.length || 0 },
        ipAddress: req.ip,
      });

      res.json({ status: 'SUCCESS', message: 'Preventive actions updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/scenario/what-if
 * Run interactive What-If scenario simulation
 */
predictiveRouter.post(
  '/predictive/scenario/what-if',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_VIEW),
  async (req: AuthenticatedRequest, res: Response) => {
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

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'PREDICTIVE_WHATIF_ANALYSIS_RUN',
          resource: `TARGET_ZONE:${input.target_zone_id}`,
          status: 'SUCCESS',
          details: { scenario_title: input.scenario_title },
          ipAddress: req.ip,
        });
      }

      res.json({ status: 'SUCCESS', result });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/demo-scenario/advance
 * Step forward in the 15-step Predictive Heavy Rainfall Demo Scenario
 */
predictiveRouter.post(
  '/predictive/demo-scenario/advance',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = predictionStore.advanceDemoScenarioStep();

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'PREDICTIVE_DEMO_SCENARIO_ADVANCED',
          resource: 'PREDICTIVE_SCENARIO',
          status: 'SUCCESS',
          details: { step: result.step?.step },
          ipAddress: req.ip,
        });
      }

      res.json({
        status: 'SUCCESS',
        step: result.step,
        stepIndex: predictionStore.getDemoStepIndex(),
        isComplete: result.isComplete,
        zone: result.zone,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/demo-scenario/reset
 * Reset the Predictive Demo Scenario
 */
predictiveRouter.post(
  '/predictive/demo-scenario/reset',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      predictionStore.resetDemoScenario();

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'PREDICTIVE_DEMO_SCENARIO_RESET',
          resource: 'PREDICTIVE_SCENARIO',
          status: 'SUCCESS',
          details: {},
          ipAddress: req.ip,
        });
      }

      res.json({ status: 'SUCCESS', message: 'Predictive Demo Scenario reset.' });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * GET /api/predictive/metrics
 * Fetch research evaluation metrics & scientific dimensions
 */
predictiveRouter.get(
  '/predictive/metrics',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = predictionStore.getMetrics();
      res.json({ status: 'SUCCESS', metrics });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/predictive/evaluate-incident
 * Connect existing Predictive Intelligence engine to an incident.
 * Uses authenticated req.user identity, PREDICTIVE_VIEW permission, and logs audit events.
 */
predictiveRouter.post(
  '/predictive/evaluate-incident',
  authenticateToken,
  requirePermission(PermissionType.PREDICTIVE_VIEW),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { incident_id } = req.body;
      if (!incident_id) {
        return res.status(400).json({ status: 'ERROR', message: 'incident_id is required' });
      }

      const incident = incidentStore.getIncidentById(incident_id);
      if (!incident) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      // Find matching risk zone from predictionStore if present
      const allZones = predictionStore.getAllRiskZones();
      const matchedZone = allZones.find(
        (z) =>
          z.zone_name.toLowerCase().includes(incident.location.toLowerCase()) ||
          incident.location.toLowerCase().includes(z.zone_name.toLowerCase()) ||
          z.use_case === incident.category
      );

      const ruleEngine = new RuleBasedPredictionEngine();
      let baseScore = 42;
      if (incident.severity === 'CRITICAL') baseScore = 82;
      else if (incident.severity === 'HIGH') baseScore = 68;
      else if (incident.severity === 'MEDIUM') baseScore = 48;

      const risk_score = matchedZone ? matchedZone.risk_score : baseScore;
      const risk_level = ruleEngine.getRiskLevel(risk_score);

      const key_risk_factors = matchedZone
        ? matchedZone.contributing_factors.map((f) => f.factor_name)
        : [
            `Severity Level: ${incident.severity}`,
            `Ward/Zone: ${incident.ward_zone}`,
            `Primary Department: ${incident.primary_department}`,
            `Environmental & Telemetry Context`,
          ];

      const potential_service_impacts = matchedZone?.decision_support?.impact_projection
        ? [matchedZone.decision_support.impact_projection]
        : [
            `Potential infrastructure service disruption near ${incident.location}`,
            `Secondary cascade effect on ${incident.secondary_departments.join(', ') || 'adjacent zones'}`,
          ];

      const preventive_actions = matchedZone
        ? matchedZone.recommended_preventive_actions
        : [
            `Pre-position field response team from ${incident.primary_department}`,
            `Issue early traffic/public advisory for ${incident.location}`,
            `Monitor sensor feeds in ${incident.ward_zone}`,
          ];

      const assessment = {
        incident_id,
        label: 'Prototype Predictive Assessment',
        risk_level,
        risk_score,
        key_risk_factors,
        potential_service_impacts,
        preventive_actions,
        explanation: matchedZone?.ai_operational_explanation || `Predictive risk score of ${risk_score}/100 calculated for ${incident.location}.`,
        evaluated_at: new Date().toISOString(),
      };

      // Record audit event
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'PREDICTIVE_INCIDENT_EVALUATED',
        resource: `INCIDENT:${incident_id}`,
        status: 'SUCCESS',
        details: { incident_id, risk_score, risk_level },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        assessment,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);
