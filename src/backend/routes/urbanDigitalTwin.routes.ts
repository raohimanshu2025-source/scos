import { Router, Response } from 'express';
import { PermissionType } from '../../types/auth';
import {
  authenticateToken,
  requirePermission,
  AuthenticatedRequest,
} from '../middleware/auth.middleware';
import { urbanDigitalTwinService } from '../../services/urbanDigitalTwinService';
import { scenarioSimulationService } from '../../services/scenarioSimulationService';
import { TwinEntityType } from '../../types/urbanDigitalTwin';
import { runUrbanDigitalTwinTestSuite } from '../../tests/urbanDigitalTwin.spec';

export const urbanDigitalTwinRouter = Router();

/**
 * GET /api/urban-digital-twin/state
 * Retrieves the complete synchronized Urban Digital Twin State
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/state',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const state = urbanDigitalTwinService.getTwinState();
      res.json({
        status: 'SUCCESS',
        data: state,
        meta: {
          requestedBy: req.user?.email,
          userRole: req.user?.role,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DIGITAL_TWIN_STATE_FAILED',
        message: error.message || 'Failed to retrieve Urban Digital Twin state',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/entities
 * Retrieves Digital Twin entities with optional category filter
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/entities',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const type = req.query.type as TwinEntityType | undefined;
      const entities = type
        ? urbanDigitalTwinService.getEntitiesByType(type)
        : urbanDigitalTwinService.getAllEntities();

      res.json({
        status: 'SUCCESS',
        count: entities.length,
        data: entities,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DIGITAL_TWIN_ENTITIES_FAILED',
        message: error.message || 'Failed to retrieve Digital Twin entities',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/entities/:id
 * Retrieves a specific Digital Twin entity with operational state and spatial relationships
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/entities/:id',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const entity = urbanDigitalTwinService.getEntity(id);

      if (!entity) {
        res.status(404).json({
          error: 'ENTITY_NOT_FOUND',
          message: `Digital Twin entity with ID '${id}' not found in prototype model`,
        });
        return;
      }

      const operationalState = urbanDigitalTwinService.getOperationalState(id);
      const spatialRelationships = urbanDigitalTwinService.getSpatialRelationships(id);
      const dependencies = urbanDigitalTwinService.getDependencies(id);
      const dependents = urbanDigitalTwinService.getDependents(id);

      res.json({
        status: 'SUCCESS',
        data: {
          entity,
          operationalState,
          spatialRelationships,
          dependencies,
          dependents,
        },
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DIGITAL_TWIN_ENTITY_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve Digital Twin entity details',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/entities/:id/dependencies
 * Retrieves outgoing dependencies for an entity
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/entities/:id/dependencies',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const dependencies = urbanDigitalTwinService.getDependencies(id);

      res.json({
        status: 'SUCCESS',
        entityId: id,
        count: dependencies.length,
        data: dependencies,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DEPENDENCY_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve dependencies',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/entities/:id/dependents
 * Retrieves incoming dependents for an entity
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/entities/:id/dependents',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const dependents = urbanDigitalTwinService.getDependents(id);

      res.json({
        status: 'SUCCESS',
        entityId: id,
        count: dependents.length,
        data: dependents,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'DEPENDENT_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve dependents',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/statistics
 * Retrieves aggregated metrics for the Urban Digital Twin
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/statistics',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = urbanDigitalTwinService.getTwinStatistics();
      res.json({
        status: 'SUCCESS',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'STATISTICS_CALCULATION_FAILED',
        message: error.message || 'Failed to calculate Digital Twin statistics',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/baseline
 * Retrieves the current scenario baseline snapshot
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/baseline',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const baseline = urbanDigitalTwinService.getBaselineSnapshot();
      res.json({
        status: 'SUCCESS',
        data: baseline,
        meta: {
          requestedBy: req.user?.email,
          timestamp: new Date().toISOString(),
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'BASELINE_GENERATION_FAILED',
        message: error.message || 'Failed to retrieve baseline snapshot',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/scenarios/presets
 * Retrieves pre-configured What-If simulation presets
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/scenarios/presets',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const presets = scenarioSimulationService.getPresetScenarios();
      res.json({
        status: 'SUCCESS',
        data: presets,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'PRESETS_FAILED',
        message: error.message || 'Failed to retrieve preset scenarios',
      });
    }
  }
);

/**
 * POST /api/urban-digital-twin/scenarios/simulate
 * Executes a What-If scenario simulation through the digital twin graph
 */
urbanDigitalTwinRouter.post(
  '/urban-digital-twin/scenarios/simulate',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const scenarioInput = req.body || {};
      const userEmail = req.user?.email || 'officer@scos.kanpur.gov.in';
      const simulation = scenarioSimulationService.executeSimulation(scenarioInput, userEmail);

      res.json({
        status: 'SUCCESS',
        data: simulation,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SIMULATION_FAILED',
        message: error.message || 'Failed to execute scenario simulation',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/scenarios/result/:id
 * Retrieves a previous simulation result by ID
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/scenarios/result/:id',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const simulation = scenarioSimulationService.getSimulationById(req.params.id);
      if (!simulation) {
        return res.status(404).json({
          error: 'SIMULATION_NOT_FOUND',
          message: `Simulation ${req.params.id} not found`,
        });
      }
      res.json({
        status: 'SUCCESS',
        data: simulation,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'SIMULATION_LOOKUP_FAILED',
        message: error.message || 'Failed to retrieve simulation result',
      });
    }
  }
);

/**
 * POST /api/urban-digital-twin/scenarios/review
 * Human Officer reviews and authorizes/modifies/rejects a generated mitigation option
 */
urbanDigitalTwinRouter.post(
  '/urban-digital-twin/scenarios/review',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { simulationId, optionId, decision, officerNotes, modifiedActionSteps } = req.body || {};
      if (!simulationId || !optionId || !decision) {
        return res.status(400).json({
          error: 'MISSING_REVIEW_PARAMS',
          message: 'simulationId, optionId, and decision (APPROVE/MODIFY/REJECT) are required',
        });
      }

      const userEmail = req.user?.email || 'officer@scos.kanpur.gov.in';
      const reviewResult = scenarioSimulationService.reviewMitigationOption(
        simulationId,
        optionId,
        {
          optionId,
          decision,
          officerNotes,
          modifiedActionSteps,
        },
        userEmail
      );

      res.json({
        status: 'SUCCESS',
        data: reviewResult,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'REVIEW_FAILED',
        message: error.message || 'Failed to process officer review decision',
      });
    }
  }
);

/**
 * GET /api/urban-digital-twin/test
 * Run automated Phase 9A & 9B Urban Digital Twin verification test suite
 */
urbanDigitalTwinRouter.get(
  '/urban-digital-twin/test',
  authenticateToken,
  requirePermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const results = runUrbanDigitalTwinTestSuite();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({
        error: 'TEST_SUITE_EXECUTION_FAILED',
        message: error.message || 'Failed to execute Digital Twin test suite',
      });
    }
  }
);
