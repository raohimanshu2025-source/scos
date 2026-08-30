/**
 * SCOS Phase 5B.6 — Knowledge Graph API Routes
 * Endpoints for entity search, graph neighborhood retrieval, incident context extraction,
 * cascade impact evaluation, research graph statistics, and graph modification/import.
 * Protected by authenticateToken and granular RBAC permissions.
 */

import { Router, Response } from 'express';
import { knowledgeGraphService } from '../../services/knowledgeGraphService';
import { EntityType } from '../../types/knowledgeGraph';
import { 
  authenticateToken, 
  requirePermission, 
  AuthenticatedRequest 
} from '../middleware/auth.middleware';
import { PermissionType } from '../../types/auth';
import { dbStore } from '../db/store';

export const knowledgeGraphRouter = Router();

/**
 * GET /api/graph/entities
 * List or filter entities
 */
knowledgeGraphRouter.get(
  '/graph/entities',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const type = req.query.type as EntityType | undefined;
      const search = req.query.q as string | undefined;

      let entities = knowledgeGraphService.getAllEntities();

      if (type) {
        entities = entities.filter((e) => e.type === type);
      }
      if (search) {
        entities = knowledgeGraphService.searchEntities(search, type);
      }

      res.json({
        success: true,
        count: entities.length,
        data: entities,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/relationships
 * Retrieve all relationships in knowledge graph
 */
knowledgeGraphRouter.get(
  '/graph/relationships',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const relationships = knowledgeGraphService.getAllRelationships();
      res.json({
        success: true,
        count: relationships.length,
        data: relationships,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/entities/:id
 * Retrieve specific entity by ID
 */
knowledgeGraphRouter.get(
  '/graph/entities/:id',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const entity = knowledgeGraphService.getEntity(req.params.id);
      if (!entity) {
        return res.status(404).json({ success: false, error: `Entity ${req.params.id} not found` });
      }
      res.json({ success: true, data: entity });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/entities/:id/neighborhood
 * Retrieve neighborhood graph
 */
knowledgeGraphRouter.get(
  '/graph/entities/:id/neighborhood',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const depth = parseInt(req.query.depth as string, 10) || 1;
      const neighborhood = knowledgeGraphService.getNeighborhood(req.params.id, depth);
      res.json({ success: true, data: neighborhood });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message || 'Neighborhood query failed' });
    }
  }
);

/**
 * GET /api/graph/search
 * Search graph entities
 */
knowledgeGraphRouter.get(
  '/graph/search',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = (req.query.q as string) || '';
      const type = req.query.type as EntityType | undefined;
      const results = knowledgeGraphService.searchEntities(query, type);
      res.json({ success: true, count: results.length, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/incident-context/:incidentId
 * Retrieve context for an incident
 */
knowledgeGraphRouter.get(
  '/graph/incident-context/:incidentId',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const context = knowledgeGraphService.getContextForIncident(req.params.incidentId);
      res.json({ success: true, data: context });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/cascade-impact/:entityId
 * Calculate cascade impact
 */
knowledgeGraphRouter.get(
  '/graph/cascade-impact/:entityId',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = knowledgeGraphService.getCascadeImpact(req.params.entityId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * GET /api/graph/stats
 * Knowledge Graph statistics
 */
knowledgeGraphRouter.get(
  '/graph/stats',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = knowledgeGraphService.getGraphStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

/**
 * POST /api/graph/entities
 * Create new entity (Requires GRAPH_MODIFY elevated permission)
 */
knowledgeGraphRouter.post(
  '/graph/entities',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_MODIFY),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const newEnt = knowledgeGraphService.createEntity(req.body);

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'GRAPH_ENTITY_CREATED',
        resource: `GRAPH_ENTITY:${newEnt.id}`,
        status: 'SUCCESS',
        details: { name: newEnt.name, type: newEnt.type },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, data: newEnt });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Failed to create entity' });
    }
  }
);

/**
 * POST /api/graph/relationships
 * Create new relationship (Requires GRAPH_MODIFY elevated permission)
 */
knowledgeGraphRouter.post(
  '/graph/relationships',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_MODIFY),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const newRel = knowledgeGraphService.createRelationship(req.body);

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'GRAPH_RELATIONSHIP_CREATED',
        resource: `GRAPH_RELATIONSHIP:${newRel.id}`,
        status: 'SUCCESS',
        details: { source_id: newRel.source_id, target_id: newRel.target_id, relationship_type: newRel.relationship_type },
        ipAddress: req.ip,
      });

      res.status(201).json({ success: true, data: newRel });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Failed to create relationship' });
    }
  }
);

/**
 * POST /api/graph/import
 * Import JSON graph payload (Requires GRAPH_IMPORT administrative permission)
 */
knowledgeGraphRouter.post(
  '/graph/import',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_IMPORT),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = knowledgeGraphService.importGraphData(req.body);

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'GRAPH_DATA_IMPORTED',
        resource: 'KNOWLEDGE_GRAPH',
        status: 'SUCCESS',
        details: {
          importedEntities: result.importedEntities,
          importedRelationships: result.importedRelationships,
        },
        ipAddress: req.ip,
      });

      res.json({ success: true, message: 'Graph imported successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || 'Failed to import graph data' });
    }
  }
);

/**
 * 11-Step Scenario Endpoints
 */
knowledgeGraphRouter.get(
  '/graph/scenario',
  authenticateToken,
  requirePermission(PermissionType.GRAPH_VIEW),
  (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      steps: knowledgeGraphService.getDemoSteps(),
      currentIndex: knowledgeGraphService.getDemoStepIndex(),
    });
  }
);

knowledgeGraphRouter.post(
  '/graph/scenario/advance',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const step = knowledgeGraphService.advanceDemoStep();

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'GRAPH_SCENARIO_ADVANCED',
        resource: `GRAPH_STEP:${step.step}`,
        status: 'SUCCESS',
        details: { stepTitle: step.title },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        step,
        currentIndex: knowledgeGraphService.getDemoStepIndex(),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to advance scenario' });
    }
  }
);

knowledgeGraphRouter.post(
  '/graph/scenario/reset',
  authenticateToken,
  requirePermission(PermissionType.SCENARIO_EXECUTE),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      knowledgeGraphService.resetDemoScenario();

      dbStore.addAuditLog({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        departmentId: req.user!.departmentId,
        districtId: req.user!.districtId,
        action: 'GRAPH_SCENARIO_RESET',
        resource: 'KNOWLEDGE_GRAPH_SCENARIO',
        status: 'SUCCESS',
        details: {},
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Scenario reset to Step 1',
        currentIndex: 0,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to reset scenario' });
    }
  }
);
