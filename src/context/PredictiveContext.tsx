/**
 * SCOS Phase 5B.5 — Predictive Intelligence React Context
 * Context provider managing risk zones, early warning human approvals,
 * What-If scenario simulations, research metrics, and the 15-step thesis demonstration scenario.
 * Hardened with JWT authorization header injection.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RiskZone,
  ResearchMetrics,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
  PredictiveDemoStep,
} from '../types/prediction';
import { useIncidents } from './IncidentContext';
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';

export interface IncidentPredictiveAssessment {
  incident_id: string;
  label: string;
  risk_level: string;
  risk_score: number;
  key_risk_factors: string[];
  potential_service_impacts: string[];
  preventive_actions: string[];
  explanation: string;
  evaluated_at: string;
}

export interface PredictiveContextType {
  risks: RiskZone[];
  selectedRisk: RiskZone | null;
  metrics: ResearchMetrics | null;
  currentDemoStep: PredictiveDemoStep | null;
  demoStepIndex: number;
  isDemoRunning: boolean;
  isLoading: boolean;
  error: string | null;
  refreshRisks: () => Promise<void>;
  selectRiskById: (id: string) => void;
  approveEarlyWarning: (zoneId: string) => Promise<boolean>;
  dismissEarlyWarning: (zoneId: string, reason: string) => Promise<boolean>;
  modifyEarlyWarningActions: (zoneId: string, updatedActions: string[]) => Promise<boolean>;
  runWhatIfScenario: (input: WhatIfScenarioInput) => Promise<WhatIfScenarioResult | null>;
  evaluateIncidentPrediction: (incidentId: string) => Promise<IncidentPredictiveAssessment | null>;
  advanceDemoStep: () => Promise<void>;
  resetDemoScenario: () => Promise<void>;
}

const PredictiveContext = createContext<PredictiveContextType | undefined>(undefined);

export const PredictiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [risks, setRisks] = useState<RiskZone[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskZone | null>(null);
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null);
  const [currentDemoStep, setCurrentDemoStep] = useState<PredictiveDemoStep | null>(null);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { refreshIncidents } = useIncidents();

  const refreshRisks = useCallback(async () => {
    const activeToken = token || localStorage.getItem('scos_auth_token');
    if (!activeToken && (!isAuthenticated || authLoading)) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiRequest<{
        status: string;
        risks: RiskZone[];
        metrics: ResearchMetrics;
        currentDemoStep: PredictiveDemoStep;
        demoStepIndex: number;
        isDemoRunning: boolean;
      }>('/api/predictive/risks');

      if (data.status === 'SUCCESS') {
        setRisks(data.risks || []);
        setMetrics(data.metrics || null);
        setCurrentDemoStep(data.currentDemoStep || null);
        setDemoStepIndex(data.demoStepIndex || 0);
        setIsDemoRunning(data.isDemoRunning || false);

        if (selectedRisk) {
          const updated = (data.risks || []).find((r: RiskZone) => r.zone_id === selectedRisk.zone_id);
          if (updated) setSelectedRisk(updated);
        } else if ((data.risks || []).length > 0 && !selectedRisk) {
          setSelectedRisk(data.risks[0]);
        }
      }
    } catch (err: any) {
      console.warn('[PredictiveContext] Refresh failed:', err?.message || err);
      setError(err?.message || 'Predictive refresh failed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRisk, token, isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshRisks();
    }
  }, [isAuthenticated, authLoading, token]);

  const selectRiskById = (id: string) => {
    const found = risks.find((r) => r.zone_id === id);
    if (found) setSelectedRisk(found);
  };

  const approveEarlyWarning = async (zoneId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string; message: string }>(
        `/api/predictive/risks/${zoneId}/approve-preventive`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      if (data.status === 'SUCCESS') {
        await refreshRisks();
        await refreshIncidents();
        return true;
      }
      throw new Error(data.message || 'Failed to approve early warning');
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const dismissEarlyWarning = async (zoneId: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string }>(
        `/api/predictive/risks/${zoneId}/dismiss-preventive`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
      if (data.status === 'SUCCESS') {
        await refreshRisks();
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

  const modifyEarlyWarningActions = async (zoneId: string, updatedActions: string[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string }>(
        `/api/predictive/risks/${zoneId}/modify-preventive`,
        {
          method: 'POST',
          body: JSON.stringify({ updatedActions }),
        }
      );
      if (data.status === 'SUCCESS') {
        await refreshRisks();
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

  const runWhatIfScenario = async (input: WhatIfScenarioInput): Promise<WhatIfScenarioResult | null> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string; result: WhatIfScenarioResult; message?: string }>(
        '/api/predictive/scenario/what-if',
        {
          method: 'POST',
          body: JSON.stringify(input),
        }
      );
      if (data.status === 'SUCCESS') {
        return data.result;
      }
      throw new Error(data.message || 'What-If simulation failed');
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateIncidentPrediction = async (
    incidentId: string
  ): Promise<IncidentPredictiveAssessment | null> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{
        status: string;
        assessment: IncidentPredictiveAssessment;
        message?: string;
      }>('/api/predictive/evaluate-incident', {
        method: 'POST',
        body: JSON.stringify({ incident_id: incidentId }),
      });
      if (data.status === 'SUCCESS' && data.assessment) {
        return data.assessment;
      }
      throw new Error(data.message || 'Predictive assessment unavailable');
    } catch (err: any) {
      console.error('[PredictiveContext] Incident evaluation failed:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const advanceDemoStep = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string }>('/api/predictive/demo-scenario/advance', {
        method: 'POST',
      });
      if (data.status === 'SUCCESS') {
        await refreshRisks();
        await refreshIncidents();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemoScenario = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await apiRequest<{ status: string }>('/api/predictive/demo-scenario/reset', {
        method: 'POST',
      });
      if (data.status === 'SUCCESS') {
        await refreshRisks();
        await refreshIncidents();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PredictiveContext.Provider
      value={{
        risks,
        selectedRisk,
        metrics,
        currentDemoStep,
        demoStepIndex,
        isDemoRunning,
        isLoading,
        error,
        refreshRisks,
        selectRiskById,
        approveEarlyWarning,
        dismissEarlyWarning,
        modifyEarlyWarningActions,
        runWhatIfScenario,
        evaluateIncidentPrediction,
        advanceDemoStep,
        resetDemoScenario,
      }}
    >
      {children}
    </PredictiveContext.Provider>
  );
};

export const usePredictive = (): PredictiveContextType => {
  const context = useContext(PredictiveContext);
  if (!context) {
    throw new Error('usePredictive must be used within a PredictiveProvider');
  }
  return context;
};
