/**
 * SCOS Phase 5B.6 — Knowledge Graph React Context
 * State management for SCOS entity relationships, active node focus,
 * incident context, cascade impact calculations, research statistics,
 * and 11-step end-to-end scenario playback.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { knowledgeGraphService } from '../services/knowledgeGraphService';

interface KnowledgeGraphContextType {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  selectedEntity: GraphEntity | null;
  selectedNeighborhood: GraphNeighborhood | null;
  incidentContext: IncidentContext | null;
  cascadeResult: CascadeImpactResult | null;
  stats: GraphStats | null;
  searchQuery: string;
  typeFilter: EntityType | undefined;
  demoSteps: GraphDemoStep[];
  currentDemoStepIndex: number;
  isLoading: boolean;

  selectEntity: (id: string | null) => void;
  loadIncidentContext: (incidentId: string) => void;
  loadCascadeImpact: (entityId: string) => void;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (t?: EntityType) => void;
  refreshGraph: () => void;
  advanceScenario: () => void;
  resetScenario: () => void;
  importGraphData: (payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }) => {
    importedEntities: number;
    importedRelationships: number;
  };
}

const KnowledgeGraphContext = createContext<KnowledgeGraphContextType | undefined>(undefined);

export const KnowledgeGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entities, setEntities] = useState<GraphEntity[]>([]);
  const [relationships, setRelationships] = useState<GraphRelationship[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<GraphNeighborhood | null>(null);
  const [incidentContext, setIncidentContext] = useState<IncidentContext | null>(null);
  const [cascadeResult, setCascadeResult] = useState<CascadeImpactResult | null>(null);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<EntityType | undefined>(undefined);
  const [demoSteps, setDemoSteps] = useState<GraphDemoStep[]>([]);
  const [currentDemoStepIndex, setCurrentDemoStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshGraph = () => {
    setIsLoading(true);
    try {
      const allEnts = knowledgeGraphService.searchEntities(searchQuery, typeFilter);
      setEntities(allEnts);

      const allRels = knowledgeGraphService.getAllRelationships();
      setRelationships(allRels);

      const st = knowledgeGraphService.getGraphStats();
      setStats(st);

      setDemoSteps(knowledgeGraphService.getDemoSteps());
      setCurrentDemoStepIndex(knowledgeGraphService.getDemoStepIndex());

      // Default select incident if available
      if (!selectedEntity && allEnts.length > 0) {
        const inc = allEnts.find((e) => e.type === 'INCIDENT') || allEnts[0];
        if (inc) {
          setSelectedEntity(inc);
          const nh = knowledgeGraphService.getNeighborhood(inc.id);
          setSelectedNeighborhood(nh);
        }
      }
    } catch (err) {
      console.error('Error refreshing knowledge graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshGraph();
  }, [searchQuery, typeFilter]);

  const selectEntity = (id: string | null) => {
    if (!id) {
      setSelectedEntity(null);
      setSelectedNeighborhood(null);
      return;
    }
    const ent = knowledgeGraphService.getEntity(id);
    if (ent) {
      setSelectedEntity(ent);
      const nh = knowledgeGraphService.getNeighborhood(id);
      setSelectedNeighborhood(nh);
    }
  };

  const loadIncidentContext = (incidentId: string) => {
    setIsLoading(true);
    try {
      const ctx = knowledgeGraphService.getContextForIncident(incidentId);
      setIncidentContext(ctx);
    } catch (err) {
      console.error('Failed to load incident context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCascadeImpact = (entityId: string) => {
    setIsLoading(true);
    try {
      const res = knowledgeGraphService.getCascadeImpact(entityId);
      setCascadeResult(res);
    } catch (err) {
      console.error('Failed to calculate cascade impact:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceScenario = () => {
    knowledgeGraphService.advanceDemoStep();
    setCurrentDemoStepIndex(knowledgeGraphService.getDemoStepIndex());
  };

  const resetScenario = () => {
    knowledgeGraphService.resetDemoScenario();
    setCurrentDemoStepIndex(0);
  };

  const importGraphData = (payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }) => {
    const res = knowledgeGraphService.importGraphData(payload);
    refreshGraph();
    return res;
  };

  return (
    <KnowledgeGraphContext.Provider
      value={{
        entities,
        relationships,
        selectedEntity,
        selectedNeighborhood,
        incidentContext,
        cascadeResult,
        stats,
        searchQuery,
        typeFilter,
        demoSteps,
        currentDemoStepIndex,
        isLoading,
        selectEntity,
        loadIncidentContext,
        loadCascadeImpact,
        setSearchQuery,
        setTypeFilter,
        refreshGraph,
        advanceScenario,
        resetScenario,
        importGraphData,
      }}
    >
      {children}
    </KnowledgeGraphContext.Provider>
  );
};

export const useKnowledgeGraph = () => {
  const context = useContext(KnowledgeGraphContext);
  if (!context) {
    throw new Error('useKnowledgeGraph must be used within a KnowledgeGraphProvider');
  }
  return context;
};
