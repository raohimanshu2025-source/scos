/**
 * SCOS Phase 5B.6 — Knowledge Graph React Context
 * Hardened to route all knowledge graph operations through the authenticated Express HTTP API.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';

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

  selectEntity: (id: string | null) => Promise<void>;
  loadIncidentContext: (incidentId: string) => Promise<void>;
  loadCascadeImpact: (entityId: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (t?: EntityType) => void;
  refreshGraph: () => Promise<void>;
  advanceScenario: () => Promise<void>;
  resetScenario: () => Promise<void>;
  importGraphData: (payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }) => Promise<{
    importedEntities: number;
    importedRelationships: number;
  }>;
}

const KnowledgeGraphContext = createContext<KnowledgeGraphContextType | undefined>(undefined);

export const KnowledgeGraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
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

  const refreshGraph = useCallback(async () => {
    const activeToken = token || localStorage.getItem('scos_auth_token');
    if (!activeToken && (!isAuthenticated || authLoading)) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('q', searchQuery);
      if (typeFilter) queryParams.append('type', typeFilter);

      const [entData, relData, statsData, scenarioData] = await Promise.all([
        apiRequest<{ success: boolean; data: GraphEntity[] }>(`/api/graph/entities?${queryParams.toString()}`),
        apiRequest<{ success: boolean; data: GraphRelationship[] }>('/api/graph/relationships'),
        apiRequest<{ success: boolean; data: GraphStats }>('/api/graph/stats'),
        apiRequest<{ success: boolean; steps: GraphDemoStep[]; currentIndex: number }>('/api/graph/scenario'),
      ]);

      const allEnts = entData.data || [];
      setEntities(allEnts);
      setRelationships(relData.data || []);
      setStats(statsData.data || null);
      setDemoSteps(scenarioData.steps || []);
      setCurrentDemoStepIndex(scenarioData.currentIndex || 0);

      if (!selectedEntity && allEnts.length > 0) {
        const inc = allEnts.find((e) => e.type === 'INCIDENT') || allEnts[0];
        if (inc) {
          setSelectedEntity(inc);
          const nh = await apiRequest<{ success: boolean; data: GraphNeighborhood }>(
            `/api/graph/entities/${inc.id}/neighborhood`
          );
          setSelectedNeighborhood(nh.data || null);
        }
      }
    } catch (err: any) {
      console.warn('[KnowledgeGraphContext] Error refreshing knowledge graph API:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeFilter, selectedEntity, token, isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshGraph();
    }
  }, [isAuthenticated, authLoading, token, searchQuery, typeFilter]);

  const selectEntity = async (id: string | null) => {
    if (!id) {
      setSelectedEntity(null);
      setSelectedNeighborhood(null);
      return;
    }
    try {
      setIsLoading(true);
      const [entRes, nhRes] = await Promise.all([
        apiRequest<{ success: boolean; data: GraphEntity }>(`/api/graph/entities/${id}`),
        apiRequest<{ success: boolean; data: GraphNeighborhood }>(`/api/graph/entities/${id}/neighborhood`),
      ]);
      setSelectedEntity(entRes.data || null);
      setSelectedNeighborhood(nhRes.data || null);
    } catch (err) {
      console.error('[KnowledgeGraphContext] Error selecting entity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIncidentContext = async (incidentId: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: IncidentContext }>(
        `/api/graph/incident-context/${incidentId}`
      );
      setIncidentContext(res.data || null);
    } catch (err) {
      console.error('[KnowledgeGraphContext] Failed to load incident context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCascadeImpact = async (entityId: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; data: CascadeImpactResult }>(
        `/api/graph/cascade-impact/${entityId}`
      );
      setCascadeResult(res.data || null);
    } catch (err) {
      console.error('[KnowledgeGraphContext] Failed to calculate cascade impact:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceScenario = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; currentIndex: number }>('/api/graph/scenario/advance', {
        method: 'POST',
      });
      setCurrentDemoStepIndex(res.currentIndex);
      await refreshGraph();
    } catch (err) {
      console.error('[KnowledgeGraphContext] Failed to advance scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScenario = async () => {
    try {
      setIsLoading(true);
      await apiRequest('/api/graph/scenario/reset', { method: 'POST' });
      setCurrentDemoStepIndex(0);
      await refreshGraph();
    } catch (err) {
      console.error('[KnowledgeGraphContext] Failed to reset scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const importGraphData = async (payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{
        success: boolean;
        data: { importedEntities: number; importedRelationships: number };
      }>('/api/graph/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await refreshGraph();
      return res.data || { importedEntities: 0, importedRelationships: 0 };
    } finally {
      setIsLoading(false);
    }
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
