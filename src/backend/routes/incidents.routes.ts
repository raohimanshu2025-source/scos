/**
 * SCOS Phase 5B.4 — Incident & Cross-Department Coordination Express API Routes
 */

import { Router, Request, Response } from 'express';
import { incidentStore } from '../../services/incidentStore';
import { generateAIIncidentAnalysis } from '../../services/aiIncidentAnalysis';
import { dbStore } from '../db/store';
import { RoleType } from '../../types/auth';

export const incidentsRouter = Router();

// 1. Get All Incidents
incidentsRouter.get('/incidents', (_req: Request, res: Response) => {
  try {
    const incidents = incidentStore.getAllIncidents();
    res.json({
      status: 'SUCCESS',
      count: incidents.length,
      incidents,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 2. Get Single Incident by ID
incidentsRouter.get('/incidents/:id', (req: Request, res: Response) => {
  try {
    const inc = incidentStore.getIncidentById(req.params.id);
    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }
    const timeline = incidentStore.getTimelineEvents(req.params.id);
    res.json({
      status: 'SUCCESS',
      incident: inc,
      timeline,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 3. Create New Incident & Run AI/Rule Impact Assessment
incidentsRouter.post('/incidents', async (req: Request, res: Response) => {
  try {
    const { title, category, description, location, severity, ward_zone, source, created_by } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required fields: title, category, location, and description are mandatory.',
      });
    }

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
      source: source || 'COMMAND_CENTER',
      reported_at: new Date().toISOString(),
      current_status: 'REPORTED',
      affected_departments: [],
      primary_department: 'MUNICIPAL',
      secondary_departments: [],
      estimated_impact: 'Pending SCOS AI Impact Analysis...',
      created_by: created_by || 'District Officer',
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
      actorId: created_by || 'Officer',
      actorEmail: 'officer@kanpur.gov.in',
      actorRole: RoleType.DISTRICT_ADMIN,
      action: 'INCIDENT_CREATED',
      resource: `INCIDENT:${newInc.incident_id}`,
      status: 'SUCCESS',
      details: { title, category, severity },
    });

    res.status(201).json({
      status: 'SUCCESS',
      incident: updatedInc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 4. Re-analyze Incident with AI
incidentsRouter.post('/incidents/:id/ai-analyze', async (req: Request, res: Response) => {
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

    res.json({
      status: 'SUCCESS',
      incident: updated,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 5. Approve AI Recommendation
incidentsRouter.post('/incidents/:id/approve', (req: Request, res: Response) => {
  try {
    const { officerName, officerRole } = req.body;
    const inc = incidentStore.approveAIRecommendation(
      req.params.id,
      officerName || 'District Officer',
      officerRole || 'DISTRICT_ADMIN'
    );

    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    dbStore.addAuditLog({
      actorId: officerName || 'Officer',
      actorEmail: 'dm-kanpur@up.gov.in',
      actorRole: RoleType.DISTRICT_ADMIN,
      action: 'AI_RECOMMENDATION_APPROVED',
      resource: `INCIDENT:${inc.incident_id}`,
      status: 'SUCCESS',
      details: { tasksGenerated: inc.assigned_tasks.length },
    });

    res.json({
      status: 'SUCCESS',
      incident: inc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 6. Modify AI Recommendation
incidentsRouter.post('/incidents/:id/modify', (req: Request, res: Response) => {
  try {
    const { officerName, officerRole, updatedActions, selectedDepts } = req.body;
    const inc = incidentStore.modifyAIRecommendation(
      req.params.id,
      officerName || 'District Officer',
      officerRole || 'DISTRICT_ADMIN',
      updatedActions || [],
      selectedDepts || []
    );

    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    dbStore.addAuditLog({
      actorId: officerName || 'Officer',
      actorEmail: 'dm-kanpur@up.gov.in',
      actorRole: RoleType.DISTRICT_ADMIN,
      action: 'AI_RECOMMENDATION_MODIFIED',
      resource: `INCIDENT:${inc.incident_id}`,
      status: 'SUCCESS',
      details: { selectedDepts },
    });

    res.json({
      status: 'SUCCESS',
      incident: inc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 7. Reject AI Recommendation
incidentsRouter.post('/incidents/:id/reject', (req: Request, res: Response) => {
  try {
    const { officerName, officerRole, reason } = req.body;
    const inc = incidentStore.rejectAIRecommendation(
      req.params.id,
      officerName || 'District Officer',
      officerRole || 'DISTRICT_ADMIN',
      reason || 'Officer decision'
    );

    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    dbStore.addAuditLog({
      actorId: officerName || 'Officer',
      actorEmail: 'dm-kanpur@up.gov.in',
      actorRole: RoleType.DISTRICT_ADMIN,
      action: 'AI_RECOMMENDATION_REJECTED',
      resource: `INCIDENT:${inc.incident_id}`,
      status: 'SUCCESS',
      details: { reason },
    });

    res.json({
      status: 'SUCCESS',
      incident: inc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 8. Update Department Task Status
incidentsRouter.patch('/incidents/:id/tasks/:taskId', (req: Request, res: Response) => {
  try {
    const { status, actorName, actorRole, noteText } = req.body;
    const inc = incidentStore.updateTaskStatus(
      req.params.id,
      req.params.taskId,
      status,
      actorName || 'Department Officer',
      actorRole || 'DEPARTMENT_OFFICER',
      noteText
    );

    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident or Task not found' });
    }

    dbStore.addAuditLog({
      actorId: actorName || 'Officer',
      actorEmail: 'officer@kanpur.gov.in',
      actorRole: RoleType.DEPARTMENT_OFFICER,
      action: 'TASK_STATUS_UPDATED',
      resource: `TASK:${req.params.taskId}`,
      status: 'SUCCESS',
      details: { incidentId: req.params.id, newStatus: status },
    });

    res.json({
      status: 'SUCCESS',
      incident: inc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 9. Trigger Demo SLA Escalation
incidentsRouter.post('/incidents/:id/escalate', (req: Request, res: Response) => {
  try {
    const { taskId } = req.body;
    const inc = incidentStore.triggerSlaEscalation(req.params.id, taskId);

    if (!inc) {
      return res.status(404).json({ status: 'ERROR', message: 'Incident not found' });
    }

    dbStore.addAuditLog({
      actorId: 'SCOS_ENGINE',
      actorEmail: 'system@scos.gov.in',
      actorRole: RoleType.SUPER_ADMIN,
      action: 'DEMO_SLA_ESCALATED',
      resource: `INCIDENT:${inc.incident_id}`,
      status: 'SUCCESS',
      details: { escalationLevel: inc.escalation_level },
    });

    res.json({
      status: 'SUCCESS',
      incident: inc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 10. Reset & Launch End-to-End Heavy Rainfall Demonstration Scenario
incidentsRouter.post('/incidents/demo-scenario/trigger', (_req: Request, res: Response) => {
  try {
    const demoInc = incidentStore.resetAndRunDemoScenario();

    dbStore.addAuditLog({
      actorId: 'DEMO_CONTROLLER',
      actorEmail: 'demo@scos.gov.in',
      actorRole: RoleType.SUPER_ADMIN,
      action: 'DEMO_SCENARIO_LAUNCHED',
      resource: `INCIDENT:${demoInc.incident_id}`,
      status: 'SUCCESS',
      details: { scenarioName: 'Heavy Rainfall at Parade Crossing' },
    });

    res.json({
      status: 'SUCCESS',
      message: 'Heavy Rainfall Demonstration Scenario initialized.',
      incident: demoInc,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 11. Get Timeline Events
incidentsRouter.get('/incidents/:id/timeline', (req: Request, res: Response) => {
  try {
    const events = incidentStore.getTimelineEvents(req.params.id);
    res.json({
      status: 'SUCCESS',
      events,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});
