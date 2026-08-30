import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WorkflowType,
  EvaluationSession,
  EvaluationResult,
  EvaluationComparison,
  InteractionEventType,
} from '../types/evaluation';
import { apiRequest } from '../services/apiClient';
import { useAuth } from './AuthContext';

interface EvaluationContextType {
  activeSession: EvaluationSession | null;
  participantId: string;
  setParticipantId: (id: string) => void;
  workflowType: WorkflowType;
  setWorkflowType: (type: WorkflowType) => void;
  scenarioId: string;
  timerSeconds: number;
  isLoading: boolean;
  error: string | null;
  results: EvaluationResult[];
  comparison: EvaluationComparison | null;
  startSession: (overrideWorkflow?: WorkflowType, overrideParticipant?: string) => Promise<EvaluationSession | null>;
  recordAccessEvent: (eventType: InteractionEventType, resource: string) => Promise<void>;
  completeBaselineStep: (stepId: string) => Promise<void>;
  completeSession: () => Promise<EvaluationResult | null>;
  resetSession: () => Promise<boolean>;
  fetchResults: () => Promise<void>;
  fetchComparison: () => Promise<void>;
  exportCsv: () => Promise<string>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeSession, setActiveSession] = useState<EvaluationSession | null>(null);
  const [participantId, setParticipantId] = useState<string>('P01');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('SCOS');
  const [scenarioId] = useState<string>('SIMULATED EVALUATION SCENARIO');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [comparison, setComparison] = useState<EvaluationComparison | null>(null);

  // Real-time timer ticker
  useEffect(() => {
    let interval: any = null;
    if (activeSession && activeSession.status === 'RUNNING') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const fetchActiveSession = useCallback(async (pId: string) => {
    try {
      const res = await apiRequest<{ status: string; session: EvaluationSession | null }>(
        `/api/evaluation/session/active?participantId=${encodeURIComponent(pId)}`
      );
      if (res.status === 'SUCCESS' && res.session) {
        setActiveSession(res.session);
        setTimerSeconds(res.session.duration || 0);
      } else {
        setActiveSession(null);
        setTimerSeconds(0);
      }
    } catch {
      setActiveSession(null);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await apiRequest<{ status: string; results: EvaluationResult[] }>(
        '/api/evaluation/results'
      );
      if (res.status === 'SUCCESS') {
        setResults(res.results || []);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  const fetchComparison = useCallback(async () => {
    try {
      const res = await apiRequest<{ status: string; comparison: EvaluationComparison | null }>(
        `/api/evaluation/comparison?participantId=${encodeURIComponent(
          participantId
        )}&scenarioId=${encodeURIComponent(scenarioId)}`
      );
      if (res.status === 'SUCCESS') {
        setComparison(res.comparison || null);
      } else {
        setComparison(null);
      }
    } catch {
      setComparison(null);
    }
  }, [participantId, scenarioId]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchActiveSession(participantId);
      fetchResults();
      fetchComparison();
    }
  }, [participantId, isAuthenticated, authLoading, fetchActiveSession, fetchResults, fetchComparison]);

  const startSession = async (
    overrideWorkflow?: WorkflowType,
    overrideParticipant?: string
  ): Promise<EvaluationSession | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const targetWorkflow = overrideWorkflow || workflowType;
      const targetParticipant = (overrideParticipant || participantId).trim().toUpperCase() || 'P01';

      const res = await apiRequest<{ status: string; session: EvaluationSession }>(
        '/api/evaluation/session/start',
        {
          method: 'POST',
          body: JSON.stringify({
            participantId: targetParticipant,
            workflowType: targetWorkflow,
            scenarioId,
          }),
        }
      );

      if (res.status === 'SUCCESS') {
        setActiveSession(res.session);
        setTimerSeconds(0);
        await fetchComparison();
        return res.session;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to start evaluation session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const recordAccessEvent = async (eventType: InteractionEventType, resource: string) => {
    if (!activeSession || activeSession.status !== 'RUNNING') return;
    try {
      const res = await apiRequest<{ status: string; session: EvaluationSession | null }>(
        '/api/evaluation/session/event',
        {
          method: 'POST',
          body: JSON.stringify({
            participantId,
            eventType,
            resource,
          }),
        }
      );
      if (res.status === 'SUCCESS' && res.session) {
        setActiveSession(res.session);
      }
    } catch {
      // Non-blocking
    }
  };

  const completeBaselineStep = async (stepId: string) => {
    if (!activeSession || activeSession.status !== 'RUNNING' || activeSession.workflowType !== 'BASELINE') return;
    try {
      const res = await apiRequest<{ status: string; session: EvaluationSession | null }>(
        '/api/evaluation/session/baseline-step',
        {
          method: 'POST',
          body: JSON.stringify({
            participantId,
            stepId,
          }),
        }
      );
      if (res.status === 'SUCCESS' && res.session) {
        setActiveSession(res.session);
      }
    } catch {
      // Non-blocking
    }
  };

  const completeSession = async (): Promise<EvaluationResult | null> => {
    if (!activeSession || activeSession.status !== 'RUNNING') return null;
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiRequest<{ status: string; result: EvaluationResult }>(
        '/api/evaluation/session/complete',
        {
          method: 'POST',
          body: JSON.stringify({
            participantId,
            incidentId: 'SCOS-INC-1024',
          }),
        }
      );

      if (res.status === 'SUCCESS') {
        setActiveSession(null);
        setTimerSeconds(0);
        await fetchResults();
        await fetchComparison();
        return res.result;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to complete session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await apiRequest('/api/evaluation/session/reset', {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });
      setActiveSession(null);
      setTimerSeconds(0);
      await fetchComparison();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reset session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exportCsv = async (): Promise<string> => {
    try {
      const res = await apiRequest<string | { csv: string }>('/api/evaluation/export/csv');
      if (typeof res === 'string') return res;
      if (res && typeof res === 'object' && 'csv' in res) return (res as any).csv;
      return '';
    } catch {
      return '';
    }
  };

  return (
    <EvaluationContext.Provider
      value={{
        activeSession,
        participantId,
        setParticipantId,
        workflowType,
        setWorkflowType,
        scenarioId,
        timerSeconds,
        isLoading,
        error,
        results,
        comparison,
        startSession,
        recordAccessEvent,
        completeBaselineStep,
        completeSession,
        resetSession,
        fetchResults,
        fetchComparison,
        exportCsv,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const ctx = useContext(EvaluationContext);
  if (!ctx) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return ctx;
};
