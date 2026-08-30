/**
 * SCOS Phase 5B.4 — Incident & Coordination React Context
 * React Context providing incident state, AI triage triggers, task workflow actions,
 * SLA escalation timers, and the Heavy Rainfall Thesis Demo Scenario Player.
 * Hardened to send JWT authorization tokens with every request.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Incident, TaskStatus, IncidentTimelineEvent } from '../types/incident';
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';

export interface IncidentContextType {
  incidents: Incident[];
  selectedIncident: Incident | null;
  selectedTimeline: IncidentTimelineEvent[];
  isLoading: boolean;
  error: string | null;
  refreshIncidents: () => Promise<void>;
  selectIncidentById: (id: string) => Promise<void>;
  createIncident: (data: {
    title: string;
    category: string;
    description: string;
    location: string;
    severity?: string;
    ward_zone?: string;
  }) => Promise<Incident | null>;
  approveRecommendation: (incidentId: string) => Promise<boolean>;
  modifyRecommendation: (
    incidentId: string,
    updatedActions: string[],
    selectedDepts: string[]
  ) => Promise<boolean>;
  rejectRecommendation: (incidentId: string, reason: string) => Promise<boolean>;
  updateTaskStatus: (
    incidentId: string,
    taskId: string,
    status: TaskStatus,
    noteText?: string
  ) => Promise<boolean>;
  triggerSlaEscalation: (incidentId: string, taskId?: string) => Promise<boolean>;
  resolveIncident: (incidentId: string) => Promise<boolean>;
  launchDemoScenario: () => Promise<Incident | null>;
  reAnalyzeWithAi: (incidentId: string) => Promise<boolean>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<IncidentTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshIncidents = useCallback(async () => {
    const activeToken = token || localStorage.getItem('scos_auth_token');
    if (!activeToken && (!isAuthenticated || authLoading)) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<{ status: string; incidents: Incident[] }>('/api/incidents');
      if (data.status === 'SUCCESS') {
        setIncidents(data.incidents || []);
        if (selectedIncident) {
          const updatedSelected = (data.incidents || []).find(
            (i: Incident) => i.incident_id === selectedIncident.incident_id
          );
          if (updatedSelected) {
            setSelectedIncident(updatedSelected);
          }
        }
      }
    } catch (err: any) {
      console.warn('[IncidentContext] Fetch failed:', err?.message || err);
      setError(err.message || 'Error connecting to SCOS Kernel');
    } finally {
      setIsLoading(false);
    }
  }, [selectedIncident, token, isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshIncidents();
    }
  }, [isAuthenticated, authLoading, token]);

  const selectIncidentById = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string; incident: Incident; timeline: IncidentTimelineEvent[] }>(
        `/api/incidents/${id}`
      );
      if (data.status === 'SUCCESS') {
        setSelectedIncident(data.incident);
        setSelectedTimeline(data.timeline || []);
      }
    } catch (err: any) {
      console.error('[IncidentContext] Select incident failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createIncident = async (data: {
    title: string;
    category: string;
    description: string;
    location: string;
    severity?: string;
    ward_zone?: string;
  }): Promise<Incident | null> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (result.status === 'SUCCESS') {
        await refreshIncidents();
        setSelectedIncident(result.incident);
        return result.incident;
      }
      throw new Error('Failed to create incident');
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecommendation = async (incidentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/approve`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const modifyRecommendation = async (
    incidentId: string,
    updatedActions: string[],
    selectedDepts: string[]
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/modify`,
        {
          method: 'POST',
          body: JSON.stringify({ updatedActions, selectedDepts }),
        }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRecommendation = async (incidentId: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    incidentId: string,
    taskId: string,
    status: TaskStatus,
    noteText?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, noteText }),
        }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSlaEscalation = async (incidentId: string, taskId?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/escalate`,
        {
          method: 'POST',
          body: JSON.stringify({ taskId }),
        }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resolveIncident = async (incidentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/resolve`,
        { method: 'POST' }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const launchDemoScenario = async (): Promise<Incident | null> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        '/api/incidents/demo-scenario/trigger',
        { method: 'POST' }
      );
      if (result.status === 'SUCCESS' && result.incident) {
        await refreshIncidents();
        await selectIncidentById(result.incident.incident_id);
        return result.incident;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reAnalyzeWithAi = async (incidentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await apiRequest<{ status: string; incident: Incident }>(
        `/api/incidents/${incidentId}/ai-analyze`,
        { method: 'POST' }
      );
      if (result.status === 'SUCCESS') {
        await selectIncidentById(incidentId);
        await refreshIncidents();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        selectedIncident,
        selectedTimeline,
        isLoading,
        error,
        refreshIncidents,
        selectIncidentById,
        createIncident,
        approveRecommendation,
        modifyRecommendation,
        rejectRecommendation,
        updateTaskStatus,
        triggerSlaEscalation,
        resolveIncident,
        launchDemoScenario,
        reAnalyzeWithAi,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = (): IncidentContextType => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
