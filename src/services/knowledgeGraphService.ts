/**
 * SCOS Phase 5B.6 — Knowledge Graph Service Layer
 * Service abstraction providing graph querying, context retrieval,
 * cascade impact evaluation, and AI context enrichment for SCOS.
 */

import { knowledgeGraphStore } from './knowledgeGraphStore';
import {
  GraphEntity,
  GraphRelationship,
  GraphNeighborhood,
  IncidentContext,
  CascadeImpactResult,
  GraphStats,
  GraphDemoStep,
  EntityType,
} from '../types/knowledgeGraph';

export class KnowledgeGraphService {
  /**
   * Retrieve a single entity by ID
   */
  public getEntity(id: string): GraphEntity | undefined {
    return knowledgeGraphStore.getEntity(id);
  }

  /**
   * Retrieve all entities in graph
   */
  public getAllEntities(): GraphEntity[] {
    return knowledgeGraphStore.getAllEntities();
  }

  /**
   * Retrieve all relationships in graph
   */
  public getAllRelationships(): GraphRelationship[] {
    return knowledgeGraphStore.getAllRelationships();
  }

  /**
   * Get 1-hop or n-hop direct neighborhood of an entity
   */
  public getNeighborhood(entityId: string, depth: number = 1): GraphNeighborhood {
    return knowledgeGraphStore.getNeighborhood(entityId, depth);
  }

  /**
   * Search graph entities by keyword or type filter
   */
  public searchEntities(query: string, filterType?: EntityType): GraphEntity[] {
    return knowledgeGraphStore.searchEntities(query, filterType);
  }

  /**
   * Retrieve full structured Knowledge Graph context for an incident
   */
  public getContextForIncident(incidentId: string): IncidentContext {
    return knowledgeGraphStore.getContextForIncident(incidentId);
  }

  /**
   * Compute multi-level cascade impact for an asset or incident
   */
  public getCascadeImpact(primaryEntityId: string): CascadeImpactResult {
    return knowledgeGraphStore.getCascadeImpact(primaryEntityId);
  }

  /**
   * Retrieve Graph Statistics and Research Metrics
   */
  public getGraphStats(): GraphStats {
    return knowledgeGraphStore.getGraphStats();
  }

  /**
   * Create a new entity (RBAC Restricted)
   */
  public createEntity(entity: GraphEntity): GraphEntity {
    return knowledgeGraphStore.createEntity(entity);
  }

  /**
   * Create a new relationship (RBAC Restricted)
   */
  public createRelationship(rel: GraphRelationship): GraphRelationship {
    return knowledgeGraphStore.createRelationship(rel);
  }

  /**
   * Import graph payload (JSON)
   */
  public importGraphData(payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }) {
    return knowledgeGraphStore.importGraphData(payload);
  }

  /**
   * Walkthrough 11-step demo scenario
   */
  public getDemoSteps(): GraphDemoStep[] {
    return knowledgeGraphStore.getDemoSteps();
  }

  public getDemoStepIndex(): number {
    return knowledgeGraphStore.getDemoStepIndex();
  }

  public advanceDemoStep(): GraphDemoStep {
    return knowledgeGraphStore.advanceDemoStep();
  }

  public resetDemoScenario(): void {
    knowledgeGraphStore.resetDemoScenario();
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
