/**
 * SCOS Phase 5B.5 — Predictive Intelligence React Context
 * Context provider managing risk zones, early warning human approvals,
 * What-If scenario simulations, research metrics, and the 15-step thesis demonstration scenario.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RiskZone,
  ResearchMetrics,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
  PredictiveDemoStep,
} from '../types/prediction';
import { useAuth } from './AuthContext';
import { useIncidents } from './IncidentContext';

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
  advanceDemoStep: () => Promise<void>;
  resetDemoScenario: () => Promise<void>;
}

const PredictiveContext = createContext<PredictiveContextType | undefined>(undefined);

export const PredictiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [risks, setRisks] = useState<RiskZone[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskZone | null>(null);
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null);
  const [currentDemoStep, setCurrentDemoStep] = useState<PredictiveDemoStep | null>(null);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { refreshIncidents } = useIncidents();

  const refreshRisks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/predictive/risks');
      if (!res.ok) throw new Error('Failed to fetch predictive risk state');
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setRisks(data.risks || []);
        setMetrics(data.metrics || null);
        setCurrentDemoStep(data.currentDemoStep || null);
        setDemoStepIndex(data.demoStepIndex || 0);
        setIsDemoRunning(data.isDemoRunning || false);

        // Keep selected risk updated
        if (selectedRisk) {
          const updated = (data.risks || []).find((r: RiskZone) => r.zone_id === selectedRisk.zone_id);
          if (updated) setSelectedRisk(updated);
        } else if ((data.risks || []).length > 0 && !selectedRisk) {
          setSelectedRisk(data.risks[0]);
        }
      }
    } catch (err: any) {
      console.error('[PredictiveContext] Refresh failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRisk]);

  useEffect(() => {
    refreshRisks();
  }, []);

  const selectRiskById = (id: string) => {
    const found = risks.find((r) => r.zone_id === id);
    if (found) setSelectedRisk(found);
  };

  const approveEarlyWarning = async (zoneId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/predictive/risks/${zoneId}/approve-preventive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: user?.fullName || 'Dr. R. K. Verma (District Officer)',
          officerRole: user?.role || 'DISTRICT_ADMIN',
        }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        await refreshRisks();
        await refreshIncidents(); // Sync with incident store
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
      const res = await fetch(`/api/predictive/risks/${zoneId}/dismiss-preventive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: user?.fullName || 'District Officer',
          reason,
        }),
      });
      const data = await res.json();
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
      const res = await fetch(`/api/predictive/risks/${zoneId}/modify-preventive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedActions,
          officerName: user?.fullName || 'District Officer',
        }),
      });
      const data = await res.json();
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
      const res = await fetch('/api/predictive/scenario/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
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

  const advanceDemoStep = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/predictive/demo-scenario/advance', { method: 'POST' });
      const data = await res.json();
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
      const res = await fetch('/api/predictive/demo-scenario/reset', { method: 'POST' });
      const data = await res.json();
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
