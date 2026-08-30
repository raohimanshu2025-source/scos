/**
 * SCOS Phase 5B.4 — Incident & Cross-Department Coordination Express API Routes
 * Hardened with JWT authentication, RBAC authorization, verified identity, and audit logging.
 */

import { Router, Response } from 'express';
import { incidentStore } from '../../services/incidentStore';
import { generateAIIncidentAnalysis } from '../../services/aiIncidentAnalysis';
import { dbStore } from '../db/store';
import { RoleType, PermissionType } from '../../types/auth';
import { 
  authenticateToken, 
  requirePermission, 
  AuthenticatedRequest 
} from '../middleware/auth.middleware';

export const incidentsRouter = Router();

/**
 * 1. Get All Incidents
 * Enforces permissions and Citizen scope isolation.
 */
incidentsRouter.get(
  '/incidents',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_VIEW, PermissionType.COMPLAINT_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      let incidents = incidentStore.getAllIncidents();

      // Citizen scope restriction: Citizens only see incidents they reported or public ones
      if (req.user?.role === RoleType.CITIZEN) {
        incidents = incidents.filter(
          (inc) =>
            inc.created_by.toLowerCase().includes(req.user!.fullName.toLowerCase()) ||
            inc.created_by.toLowerCase().includes(req.user!.email.toLowerCase()) ||
            inc.source === 'CITIZEN_CPGRAMS'
        );
      }

      res.json({
        status: 'SUCCESS',
        count: incidents.length,
        incidents,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 2. Get Single Incident by ID
 */
incidentsRouter.get(
  '/incidents/:id',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_VIEW, PermissionType.COMPLAINT_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const inc = incidentStore.getIncidentById(req.params.id);
      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      // Citizen scope check
      if (
        req.user?.role === RoleType.CITIZEN &&
        !inc.created_by.toLowerCase().includes(req.user.fullName.toLowerCase()) &&
        !inc.created_by.toLowerCase().includes(req.user.email.toLowerCase()) &&
        inc.source !== 'CITIZEN_CPGRAMS'
      ) {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Access forbidden: You do not have permission to view this incident record.',
        });
      }

      const timeline = incidentStore.getTimelineEvents(req.params.id);
      res.json({
        status: 'SUCCESS',
        incident: inc,
        timeline,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 3. Create New Incident & Run AI/Rule Impact Assessment
 * SECURITY HARDENED: Uses authenticated JWT identity (req.user) instead of body params.
 */
incidentsRouter.post(
  '/incidents',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_CREATE, PermissionType.COMPLAINT_CREATE),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { title, category, description, location, severity, ward_zone, source } = req.body;

      if (!title || !category || !location || !description) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Missing required fields: title, category, location, and description are mandatory.',
        });
      }

      // CRITICAL: Construct reporter identity strictly from verified JWT user token
      const verifiedCreator = `${req.user.fullName} (${req.user.role})`;

      const newInc = incidentStore.createIncident({
        title,
        category,
        description,
        location,
        latitude: req.body.latitude || 26.4499,
        longitude: req.body.longitude || 80.3319,
        ward_zone: ward_zone || 'Kanpur Nagar Zone',
        severity: severity || 'HIGH',
        priority: 'P1',
        source: source || (req.user.role === RoleType.CITIZEN ? 'CITIZEN_CPGRAMS' : 'COMMAND_CENTER'),
        reported_at: new Date().toISOString(),
        current_status: 'REPORTED',
        affected_departments: [],
        primary_department: req.user.departmentCode || 'MUNICIPAL',
        secondary_departments: [],
        estimated_impact: 'Pending SCOS AI Impact Analysis...',
        created_by: verifiedCreator,
        escalation_level: 0,
        is_demo_scenario: false,
      });

      // Run AI analysis
      const aiAssessment = await generateAIIncidentAnalysis({
        title,
        category,
        location,
        description,
        severity,
        wardZone: ward_zone,
      });

      const updatedInc = incidentStore.updateAIAssessment(newInc.incident_id, aiAssessment);

      // Add Audit Log
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'INCIDENT_CREATED',
        resource: `INCIDENT:${newInc.incident_id}`,
        status: 'SUCCESS',
        details: { title, category, severity, created_by: verifiedCreator },
        ipAddress: req.ip,
      });

      res.status(201).json({
        status: 'SUCCESS',
        incident: updatedInc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 4. Re-analyze Incident with AI
 */
incidentsRouter.post(
  '/incidents/:id/ai-analyze',
  authenticateToken,
  requirePermission(PermissionType.AI_ANALYSIS, PermissionType.AI_RECOMMENDATION_REVIEW),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const inc = incidentStore.getIncidentById(req.params.id);
      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      const aiAssessment = await generateAIIncidentAnalysis({
        title: inc.title,
        category: inc.category,
        location: inc.location,
        description: inc.description,
        severity: inc.severity,
        wardZone: inc.ward_zone,
      });

      const updated = incidentStore.updateAIAssessment(inc.incident_id, aiAssessment);

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'INCIDENT_AI_REANALYZED',
          resource: `INCIDENT:${inc.incident_id}`,
          status: 'SUCCESS',
          details: { incidentId: inc.incident_id },
          ipAddress: req.ip,
        });
      }

      res.json({
        status: 'SUCCESS',
        incident: updated,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 5. Approve AI Recommendation
 * SECURITY HARDENED: Uses verified req.user identity context.
 */
incidentsRouter.post(
  '/incidents/:id/approve',
  authenticateToken,
  requirePermission(PermissionType.AI_RECOMMENDATION_REVIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const officerName = req.user.fullName;
      const officerRole = req.user.role;

      const inc = incidentStore.approveAIRecommendation(
        req.params.id,
        officerName,
        officerRole
      );

      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'AI_RECOMMENDATION_APPROVED',
        resource: `INCIDENT:${inc.incident_id}`,
        status: 'SUCCESS',
        details: { tasksGenerated: inc.assigned_tasks.length, officerName, officerRole },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 6. Modify AI Recommendation
 */
incidentsRouter.post(
  '/incidents/:id/modify',
  authenticateToken,
  requirePermission(PermissionType.AI_RECOMMENDATION_REVIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { updatedActions, selectedDepts } = req.body;
      const officerName = req.user.fullName;
      const officerRole = req.user.role;

      const inc = incidentStore.modifyAIRecommendation(
        req.params.id,
        officerName,
        officerRole,
        updatedActions || [],
        selectedDepts || []
      );

      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'AI_RECOMMENDATION_MODIFIED',
        resource: `INCIDENT:${inc.incident_id}`,
        status: 'SUCCESS',
        details: { selectedDepts, officerName, officerRole },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 7. Reject AI Recommendation
 */
incidentsRouter.post(
  '/incidents/:id/reject',
  authenticateToken,
  requirePermission(PermissionType.AI_RECOMMENDATION_REVIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { reason } = req.body;
      const officerName = req.user.fullName;
      const officerRole = req.user.role;

      const inc = incidentStore.rejectAIRecommendation(
        req.params.id,
        officerName,
        officerRole,
        reason || 'Officer decision'
      );

      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'AI_RECOMMENDATION_REJECTED',
        resource: `INCIDENT:${inc.incident_id}`,
        status: 'SUCCESS',
        details: { reason, officerName, officerRole },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 8. Update Department Task Status
 */
incidentsRouter.patch(
  '/incidents/:id/tasks/:taskId',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_UPDATE, PermissionType.COMPLAINT_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const { status, noteText } = req.body;
      const actorName = req.user.fullName;
      const actorRole = req.user.role;

      const inc = incidentStore.updateTaskStatus(
        req.params.id,
        req.params.taskId,
        status,
        actorName,
        actorRole,
        noteText
      );

      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident or Task not found' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'TASK_STATUS_UPDATED',
        resource: `TASK:${req.params.taskId}`,
        status: 'SUCCESS',
        details: { incidentId: req.params.id, newStatus: status, actorName, actorRole },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 9. Trigger Demo SLA Escalation
 */
incidentsRouter.post(
  '/incidents/:id/escalate',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE, PermissionType.INCIDENT_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId } = req.body;
      const inc = incidentStore.triggerSlaEscalation(req.params.id, taskId);

      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'DEMO_SLA_ESCALATED',
          resource: `INCIDENT:${inc.incident_id}`,
          status: 'SUCCESS',
          details: { escalationLevel: inc.escalation_level },
          ipAddress: req.ip,
        });
      }

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 9b. Resolve Incident Directly
 */
incidentsRouter.post(
  '/incidents/:id/resolve',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_UPDATE, PermissionType.COMPLAINT_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'ERROR', message: 'Authentication required' });
      }

      const officerName = req.user.fullName;
      const officerRole = req.user.role;

      const inc = incidentStore.resolveIncident(req.params.id, officerName, officerRole);
      if (!inc) {
        return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
      }

      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        departmentId: req.user.departmentId,
        districtId: req.user.districtId,
        action: 'INCIDENT_RESOLVED',
        resource: `INCIDENT:${inc.incident_id}`,
        status: 'SUCCESS',
        details: { officerName, officerRole },
        ipAddress: req.ip,
      });

      res.json({
        status: 'SUCCESS',
        incident: inc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);
incidentsRouter.post(
  '/incidents/demo-scenario/trigger',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const demoInc = incidentStore.resetAndRunDemoScenario();

      if (req.user) {
        dbStore.addAuditLog({
          actorId: req.user.id,
          actorEmail: req.user.email,
          actorRole: req.user.role,
          departmentId: req.user.departmentId,
          districtId: req.user.districtId,
          action: 'DEMO_SCENARIO_LAUNCHED',
          resource: `INCIDENT:${demoInc.incident_id}`,
          status: 'SUCCESS',
          details: { scenarioName: 'Heavy Rainfall at Parade Crossing' },
          ipAddress: req.ip,
        });
      }

      res.json({
        status: 'SUCCESS',
        message: 'Heavy Rainfall Demonstration Scenario initialized.',
        incident: demoInc,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);

/**
 * 11. Get Timeline Events
 */
incidentsRouter.get(
  '/incidents/:id/timeline',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_VIEW, PermissionType.COMPLAINT_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const events = incidentStore.getTimelineEvents(req.params.id);
      res.json({
        status: 'SUCCESS',
        events,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', message: err.message || 'Server error' });
    }
  }
);
