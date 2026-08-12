/**
 * SCOS Phase 5B.6 — Knowledge Graph API Routes
 * Endpoints for entity search, graph neighborhood retrieval, incident context extraction,
 * cascade impact evaluation, and research graph statistics.
 */

import { Router } from 'express';
import { knowledgeGraphService } from '../../services/knowledgeGraphService';
import { EntityType } from '../../types/knowledgeGraph';

export const knowledgeGraphRouter = Router();

/**
 * GET /api/graph/entities
 * List or filter entities
 */
knowledgeGraphRouter.get('/graph/entities', (req, res) => {
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
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/entities/:id
 * Retrieve specific entity by ID
 */
knowledgeGraphRouter.get('/graph/entities/:id', (req, res) => {
  try {
    const entity = knowledgeGraphService.getEntity(req.params.id);
    if (!entity) {
      return res.status(404).json({ success: false, error: `Entity ${req.params.id} not found` });
    }
    res.json({ success: true, data: entity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/entities/:id/neighborhood
 * Retrieve neighborhood graph
 */
knowledgeGraphRouter.get('/graph/entities/:id/neighborhood', (req, res) => {
  try {
    const depth = parseInt(req.query.depth as string, 10) || 1;
    const neighborhood = knowledgeGraphService.getNeighborhood(req.params.id, depth);
    res.json({ success: true, data: neighborhood });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/search
 * Search graph entities
 */
knowledgeGraphRouter.get('/graph/search', (req, res) => {
  try {
    const query = (req.query.q as string) || '';
    const type = req.query.type as EntityType | undefined;
    const results = knowledgeGraphService.searchEntities(query, type);
    res.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/incident-context/:incidentId
 * Retrieve context for an incident
 */
knowledgeGraphRouter.get('/graph/incident-context/:incidentId', (req, res) => {
  try {
    const context = knowledgeGraphService.getContextForIncident(req.params.incidentId);
    res.json({ success: true, data: context });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/cascade-impact/:entityId
 * Calculate cascade impact
 */
knowledgeGraphRouter.get('/graph/cascade-impact/:entityId', (req, res) => {
  try {
    const result = knowledgeGraphService.getCascadeImpact(req.params.entityId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/graph/stats
 * Knowledge Graph statistics
 */
knowledgeGraphRouter.get('/graph/stats', (_req, res) => {
  try {
    const stats = knowledgeGraphService.getGraphStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/graph/entities
 * Create new entity
 */
knowledgeGraphRouter.post('/graph/entities', (req, res) => {
  try {
    const newEnt = knowledgeGraphService.createEntity(req.body);
    res.status(201).json({ success: true, data: newEnt });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/graph/relationships
 * Create new relationship
 */
knowledgeGraphRouter.post('/graph/relationships', (req, res) => {
  try {
    const newRel = knowledgeGraphService.createRelationship(req.body);
    res.status(201).json({ success: true, data: newRel });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/graph/import
 * Import JSON graph payload
 */
knowledgeGraphRouter.post('/graph/import', (req, res) => {
  try {
    const result = knowledgeGraphService.importGraphData(req.body);
    res.json({ success: true, message: 'Graph imported successfully', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * 11-Step Scenario Endpoints
 */
knowledgeGraphRouter.get('/graph/scenario', (_req, res) => {
  res.json({
    success: true,
    steps: knowledgeGraphService.getDemoSteps(),
    currentIndex: knowledgeGraphService.getDemoStepIndex(),
  });
});

knowledgeGraphRouter.post('/graph/scenario/advance', (_req, res) => {
  const step = knowledgeGraphService.advanceDemoStep();
  res.json({
    success: true,
    step,
    currentIndex: knowledgeGraphService.getDemoStepIndex(),
  });
});

knowledgeGraphRouter.post('/graph/scenario/reset', (_req, res) => {
  knowledgeGraphService.resetDemoScenario();
  res.json({
    success: true,
    message: 'Scenario reset to Step 1',
    currentIndex: 0,
  });
});
