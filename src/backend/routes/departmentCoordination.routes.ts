import { Router, Response } from 'express';
import { dbStore } from '../db/store';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { departmentProfileStore } from '../../services/departmentProfileStore';
import { departmentImpactEngine } from '../../services/departmentImpactEngine';
import { incidentStore } from '../../services/incidentStore';

export const departmentCoordinationRouter = Router();

/**
 * 1. GET /api/departments/profiles
 * Retrieve all prototype department profiles
 */
departmentCoordinationRouter.get(
  '/departments/profiles',
  authenticateToken,
  requirePermission(PermissionType.DEPARTMENT_VIEW, PermissionType.COORDINATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const profiles = departmentProfileStore.getAllProfiles();
      res.json({
        status: 'SUCCESS',
        count: profiles.length,
        profiles,
        disclaimer: 'PROTOTYPE DEPARTMENT PROFILES',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch department profiles', message: error.message });
    }
  }
);

/**
 * 2. GET /api/departments/profiles/:id
 * Retrieve single department profile by ID
 */
departmentCoordinationRouter.get(
  '/departments/profiles/:id',
  authenticateToken,
  requirePermission(PermissionType.DEPARTMENT_VIEW, PermissionType.COORDINATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const profile = departmentProfileStore.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Department Profile Not Found', message: `No profile matching ID ${req.params.id}` });
      }
      res.json({
        status: 'SUCCESS',
        profile,
        disclaimer: 'PROTOTYPE DEPARTMENT PROFILE',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
    }
  }
);

/**
 * 3. GET /api/departments/responsibility-mappings
 * Retrieve operational responsibility mappings
 */
departmentCoordinationRouter.get(
  '/departments/responsibility-mappings',
  authenticateToken,
  requirePermission(PermissionType.DEPARTMENT_VIEW, PermissionType.COORDINATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const mappings = departmentProfileStore.getResponsibilityMappings();
      res.json({
        status: 'SUCCESS',
        count: mappings.length,
        mappings,
        disclaimer: 'PROTOTYPE OPERATIONAL RESPONSIBILITY MAPPINGS',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch responsibility mappings', message: error.message });
    }
  }
);

/**
 * 4. GET /api/coordination/incident/:id/impact
 * Generate / retrieve department impact analysis for an incident
 */
departmentCoordinationRouter.get(
  '/coordination/incident/:id/impact',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_VIEW, PermissionType.COORDINATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidentId = req.params.id;
      const incident = incidentStore.getIncidentById(incidentId);

      if (!incident) {
        return res.status(404).json({ error: 'Incident Not Found', message: `No incident found with ID ${incidentId}` });
      }

      const activeTasks = incident.assigned_tasks || [];
      const analysis = departmentImpactEngine.analyzeIncidentImpact(incident, activeTasks);

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'DEPARTMENT_IMPACT_ANALYZED',
        resource: `Incident/${incidentId}`,
        details: {
          primaryDepartment: analysis.primaryDepartment.departmentId,
          secondaryDepartmentsCount: analysis.secondaryDepartments.length,
          recommendedTasksCount: analysis.recommendedTasks.length,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.json({
        status: 'SUCCESS',
        analysis,
        disclaimer: 'PROTOTYPE DECISION SUPPORT RECOMMENDATIONS',
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to calculate department impact', message: error.message });
    }
  }
);

/**
 * 5. GET /api/coordination/incident/:id/matrix
 * Get SCOS Department Coordination Matrix
 */
departmentCoordinationRouter.get(
  '/coordination/incident/:id/matrix',
  authenticateToken,
  requirePermission(PermissionType.INCIDENT_VIEW, PermissionType.COORDINATION_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const incidentId = req.params.id;
      const matrix = departmentImpactEngine.getCoordinationMatrix(incidentId);

      res.json({
        status: 'SUCCESS',
        incidentId,
        matrix,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate coordination matrix', message: error.message });
    }
  }
);

/**
 * 6. POST /api/coordination/recommendation/:id/review
 * Human review decision (APPROVE, MODIFY, REJECT) for a recommended task
 */
departmentCoordinationRouter.post(
  '/coordination/recommendation/:id/review',
  authenticateToken,
  requirePermission(PermissionType.COORDINATION_APPROVE, PermissionType.INCIDENT_UPDATE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const recommendationId = req.params.id;
      const { incidentId, decision, modifications, reviewNotes } = req.body;

      if (!incidentId || !decision || !['APPROVE', 'MODIFY', 'REJECT'].includes(decision)) {
        return res.status(400).json({
          error: 'Invalid Payload',
          message: 'Must provide incidentId and a valid decision (APPROVE, MODIFY, REJECT)',
        });
      }

      const actor = {
        id: req.user!.id,
        email: req.user!.email,
        fullName: req.user!.fullName,
        role: req.user!.role,
      };

      const result = departmentImpactEngine.reviewRecommendation(
        incidentId,
        recommendationId,
        decision,
        actor,
        modifications,
        reviewNotes
      );

      // If APPROVE or MODIFY, attach created task to the actual incident in incidentStore
      if (result.createdTask && (decision === 'APPROVE' || decision === 'MODIFY')) {
        const incident = incidentStore.getIncidentById(incidentId);
        if (incident) {
          const newTask: any = {
            ...result.createdTask,
            assigned_user_id: req.user!.id,
            assigned_user_name: req.user!.fullName,
          };
          incident.assigned_tasks.push(newTask);
          incident.timestamps.updated_at = new Date().toISOString();

          // Add timeline event
          incidentStore.addTimelineEvent({
            incident_id: incidentId,
            event_type: decision === 'APPROVE' ? 'RECOMMENDATION_APPROVED' : 'RECOMMENDATION_MODIFIED',
            title: `Coordination Recommendation ${decision}`,
            description: `Task "${result.updatedRecommendation.taskTitle}" ${decision.toLowerCase()} by ${req.user!.fullName} (${req.user!.role}).`,
            actor_name: req.user!.fullName,
            actor_role: req.user!.role,
            department_name: result.updatedRecommendation.departmentName,
          });
        }
      }

      const auditAction =
        decision === 'APPROVE'
          ? 'COORDINATION_APPROVED'
          : decision === 'MODIFY'
          ? 'COORDINATION_MODIFIED'
          : 'COORDINATION_REJECTED';

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: auditAction,
        resource: `Recommendation/${recommendationId}`,
        details: {
          incidentId,
          decision,
          createdTaskId: result.updatedRecommendation.createdTaskId,
          reviewNotes,
        },
        ipAddress: req.ip,
        status: 'SUCCESS',
      });

      res.json({
        status: 'SUCCESS',
        updatedRecommendation: result.updatedRecommendation,
        createdTask: result.createdTask,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to review recommendation', message: error.message });
    }
  }
);

/**
 * 7. GET /api/coordination/test
 * Self-testing endpoint for Phase 8.4 Multi-Department Operational Coordination
 */
departmentCoordinationRouter.get(
  '/coordination/test',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const profiles = departmentProfileStore.getAllProfiles();
      const mappings = departmentProfileStore.getResponsibilityMappings();
      const demoInc = incidentStore.getIncidentById('SCOS-INC-1024');

      let testAnalysis = null;
      let matrix = null;
      if (demoInc) {
        testAnalysis = departmentImpactEngine.analyzeIncidentImpact(demoInc, demoInc.assigned_tasks);
        matrix = departmentImpactEngine.getCoordinationMatrix(demoInc.incident_id);
      }

      res.json({
        status: 'SUCCESS',
        phase: 'PHASE 8.4 — MULTI-DEPARTMENT OPERATIONAL COORDINATION',
        results: {
          profilesCount: profiles.length,
          mappingsCount: mappings.length,
          demoScenarioIncident: demoInc?.incident_id || 'NOT_FOUND',
          primaryDepartment: testAnalysis?.primaryDepartment.departmentName,
          secondaryDepartmentsCount: testAnalysis?.secondaryDepartments.length,
          recommendedTasksCount: testAnalysis?.recommendedTasks.length,
          matrixRowsCount: matrix?.length || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Phase 8.4 Self-Test Failed', message: error.message });
    }
  }
);
