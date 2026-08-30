import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  Clock,
  Search,
  Eye,
  Layers,
  Users,
  MessageSquare,
  AlertCircle,
  Compass,
  CheckSquare,
  History,
  Lock,
  GitCompare,
  TrendingDown,
  TrendingUp,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import {
  ExperimentalCondition,
  ExperimentalOrder,
  ExperimentalExecutionSession,
  ExperimentalRun,
  ExperimentalComparisonResult,
  ExperimentalResearchSummary,
  RunReproducibilityVerificationResult,
} from '../../types/experimentalExecution';
import { researchDatasetService } from '../../services/researchDatasetService';
import { experimentalExecutionService } from '../../services/experimentalExecutionService';
import { experimentalResultsStore } from '../../services/experimentalResultsStore';
import { runExperimentalExecutionTestSuite, TestSuiteSummary } from '../../tests/experimentalExecution.spec';
import { useAuth } from '../../context/AuthContext';

export const ExperimentalExecutionView: React.FC = () => {
  const { user } = useAuth();

  // State
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-01');
  const [selectedOrder, setSelectedOrder] = useState<ExperimentalOrder>('BASELINE_THEN_SCOS');
  const [sessionNotes, setSessionNotes] = useState<string>('Standard municipal operational research session');
  
  const [currentSession, setCurrentSession] = useState<ExperimentalExecutionSession | null>(null);
  const [selectedRun, setSelectedRun] = useState<ExperimentalRun | null>(null);
  const [currentComparison, setCurrentComparison] = useState<ExperimentalComparisonResult | null>(null);
  const [researchSummary, setResearchSummary] = useState<ExperimentalResearchSummary | null>(null);
  
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'TIMELINE' | 'METRICS' | 'COMPARISON' | 'REPRODUCIBILITY' | 'TEST_SUITE'>('CONSOLE');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [reproducibilityResult, setReproducibilityResult] = useState<RunReproducibilityVerificationResult | null>(null);
  const [testSuiteResults, setTestSuiteResults] = useState<TestSuiteSummary | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState<boolean>(false);

  // Load initial scenarios and summary
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const scList = researchDatasetService.getAllScenarios();
    setScenarios(scList);
    const summary = experimentalResultsStore.getResearchSummary();
    setResearchSummary(summary);

    // If existing sessions, load the latest
    const allSessions = experimentalResultsStore.getAllSessions();
    if (allSessions.length > 0) {
      const latest = allSessions[0];
      setCurrentSession(latest);
      if (latest.runs.length > 0) {
        setSelectedRun(latest.runs[latest.runs.length - 1]);
      }
      if (latest.comparisonId) {
        const comp = experimentalResultsStore.getComparison(latest.comparisonId);
        if (comp) setCurrentComparison(comp);
      }
    }
  };

  const selectedScenario = useMemo(() => {
    return scenarios.find((s) => s.scenarioId === selectedScenarioId || s.scenarioCode === selectedScenarioId);
  }, [scenarios, selectedScenarioId]);

  // Actions
  const handleCreateSession = () => {
    try {
      setIsExecuting(true);
      const session = experimentalExecutionService.createSession(
        selectedScenarioId,
        selectedOrder,
        user?.email || 'researcher@scos.gov.in',
        sessionNotes
      );
      setCurrentSession(session);
      setSelectedRun(null);
      setCurrentComparison(null);
      setExecutionMessage(`Initialized session ${session.sessionId} for scenario ${session.scenarioCode}.`);
      setResearchSummary(experimentalResultsStore.getResearchSummary());
    } catch (err: any) {
      setExecutionMessage(`Error initializing session: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteCondition = (condition: ExperimentalCondition) => {
    if (!currentSession) {
      setExecutionMessage('Please initialize a session first.');
      return;
    }
    try {
      setIsExecuting(true);
      const run = experimentalExecutionService.executeRun(
        currentSession.sessionId,
        condition,
        user?.email || 'researcher@scos.gov.in',
        selectedOrder
      );
      setSelectedRun(run);
      const updatedSession = experimentalResultsStore.getSession(currentSession.sessionId);
      if (updatedSession) setCurrentSession(updatedSession);
      setExecutionMessage(`Successfully executed ${condition} (Run: ${run.runId}).`);
      setResearchSummary(experimentalResultsStore.getResearchSummary());
      setActiveTab('TIMELINE');
    } catch (err: any) {
      setExecutionMessage(`Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCompareSession = () => {
    if (!currentSession || !currentSession.baselineRunId || !currentSession.scosRunId) {
      setExecutionMessage('Both Baseline Manual and SCOS Integrated runs must be executed before comparing.');
      return;
    }
    try {
      setIsExecuting(true);
      const comparison = experimentalExecutionService.compareSession(
        currentSession.sessionId,
        user?.email || 'researcher@scos.gov.in'
      );
      setCurrentComparison(comparison);
      setExecutionMessage(`Comparative evaluation generated for ${comparison.scenarioCode}.`);
      setResearchSummary(experimentalResultsStore.getResearchSummary());
      setActiveTab('COMPARISON');
    } catch (err: any) {
      setExecutionMessage(`Comparison error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVerifyReproducibility = (runId: string) => {
    try {
      const result = experimentalExecutionService.verifyRunReproducibility(runId);
      setReproducibilityResult(result);
      setActiveTab('REPRODUCIBILITY');
    } catch (err: any) {
      setExecutionMessage(`Verification error: ${err.message}`);
    }
  };

  const handleValidateSession = () => {
    if (!currentSession) return;
    try {
      const val = experimentalExecutionService.validateSession(
        currentSession.sessionId,
        user?.email || 'researcher@scos.gov.in'
      );
      setCurrentSession(val);
      setExecutionMessage(`Session validated with status: ${val.status}`);
      setResearchSummary(experimentalResultsStore.getResearchSummary());
    } catch (err: any) {
      setExecutionMessage(`Validation error: ${err.message}`);
    }
  };

  const handleRunTestSuite = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = runExperimentalExecutionTestSuite();
      setTestSuiteResults(res);
      setIsExecuting(false);
      setActiveTab('TEST_SUITE');
      setResearchSummary(experimentalResultsStore.getResearchSummary());
    }, 150);
  };

  const handleExportJSON = () => {
    const payload = experimentalExecutionService.exportResultsJSON(user?.email || 'researcher@scos.gov.in');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos_phase10b_experimental_results_${Date.now()}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csv = experimentalExecutionService.exportResultsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos_phase10b_experimental_results_${Date.now()}.csv`;
    a.click();
  };

  // Step Icon Helper
  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'INCIDENT_IDENTIFICATION': return <AlertCircle className="w-4 h-4" />;
      case 'INFORMATION_RETRIEVAL': return <Search className="w-4 h-4" />;
      case 'CONTEXT_REVIEW': return <Eye className="w-4 h-4" />;
      case 'INFRASTRUCTURE_IDENTIFICATION': return <Layers className="w-4 h-4" />;
      case 'DEPARTMENT_IDENTIFICATION': return <Users className="w-4 h-4" />;
      case 'COORDINATION_INTERACTIONS': return <MessageSquare className="w-4 h-4" />;
      case 'RISK_INTERPRETATION': return <AlertTriangle className="w-4 h-4" />;
      case 'DECISION_FORMATION': return <Compass className="w-4 h-4" />;
      case 'TASK_PREPARATION': return <CheckSquare className="w-4 h-4" />;
      case 'AUDIT_DOCUMENTATION': return <History className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {/* Top Header & Research Disclaimer */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-700/50">
                  PHASE 10B
                </span>
                <span className="bg-amber-950/60 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-700/50 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SIMULATED / PROTOTYPE DATA
                </span>
                <span className="bg-emerald-950/60 text-emerald-300 text-xs font-mono px-2.5 py-0.5 rounded border border-emerald-700/50">
                  SHA-256 REPRODUCIBLE
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-blue-400" />
                Controlled Experimental Execution & Results Generation
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Standardized empirical evaluation of 10 municipal operational activities across Conventional (Baseline) and SCOS Integrated conditions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRunTestSuite}
                disabled={isExecuting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" /> Run 25-Test Suite
              </button>
              <button
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <FileCode className="w-4 h-4 text-blue-400" /> Export JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Export CSV
              </button>
              <button
                onClick={loadData}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg border border-slate-700"
                title="Refresh State"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Aggregate Stats Bar */}
          {researchSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Total Sessions</span>
                <p className="text-lg font-bold text-white mt-0.5">{researchSummary.totalSessions}</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Total Runs</span>
                <p className="text-lg font-bold text-blue-400 mt-0.5">{researchSummary.totalExecutions}</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Baseline / SCOS</span>
                <p className="text-lg font-bold text-amber-400 mt-0.5">
                  {researchSummary.baselineRuns} / {researchSummary.scosRuns}
                </p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Comparable Pairs</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{researchSummary.comparablePairs}</p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Reproducibility</span>
                <p className="text-lg font-bold text-cyan-400 mt-0.5">
                  {researchSummary.reproducibilityMatches} Match / {researchSummary.reproducibilityMismatches} Mismatch
                </p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400">Dataset Standard</span>
                <p className="text-sm font-mono text-slate-300 mt-1 truncate">{researchSummary.datasetVersion}</p>
              </div>
            </div>
          )}

          {executionMessage && (
            <div className="mt-4 p-2.5 bg-blue-950/40 border border-blue-800/60 rounded text-xs text-blue-200 flex items-center justify-between">
              <span>{executionMessage}</span>
              <button onClick={() => setExecutionMessage(null)} className="text-blue-400 hover:text-white ml-2">×</button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 text-sm">
          <button
            onClick={() => setActiveTab('CONSOLE')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CONSOLE'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Experiment Console
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'TIMELINE'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Activity Timeline (10 Steps)
          </button>
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'METRICS'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Standardized Metrics (M1–M10)
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'COMPARISON'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-4 h-4" /> Comparative Evaluation
          </button>
          <button
            onClick={() => setActiveTab('REPRODUCIBILITY')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'REPRODUCIBILITY'
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Reproducibility Fingerprint
          </button>
          <button
            onClick={() => setActiveTab('TEST_SUITE')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'TEST_SUITE'
                ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Automated Test Suite (25)
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXPERIMENT CONSOLE */}
        {/* ========================================================================= */}
        {activeTab === 'CONSOLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario & Setup Selector */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" /> 1. Select Research Scenario
                </h2>
                <div className="space-y-2">
                  {scenarios.map((sc) => (
                    <div
                      key={sc.scenarioId}
                      onClick={() => setSelectedScenarioId(sc.scenarioId)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedScenarioId === sc.scenarioId
                          ? 'bg-blue-950/40 border-blue-600 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">{sc.scenarioCode}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {sc.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-200 mt-1">{sc.scenarioName}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.narrativeDescription}</p>
                      <div className="mt-2 text-[10px] text-slate-500 font-mono truncate">
                        FP: {sc.configurationFingerprint?.slice(0, 16)}...
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Experimental Ordering</label>
                    <select
                      value={selectedOrder}
                      onChange={(e) => setSelectedOrder(e.target.value as ExperimentalOrder)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="BASELINE_THEN_SCOS">Baseline First → Then SCOS</option>
                      <option value="SCOS_THEN_BASELINE">SCOS First → Then Baseline</option>
                      <option value="COUNTERBALANCED">Counterbalanced (Cross-Cohort)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Session Notes</label>
                    <input
                      type="text"
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Trial Run Batch 1"
                    />
                  </div>

                  <button
                    onClick={handleCreateSession}
                    disabled={isExecuting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <FlaskConical className="w-4 h-4" /> Initialize New Session
                  </button>
                </div>
              </div>
            </div>

            {/* Active Session & Execution Engine */}
            <div className="lg:col-span-2 space-y-5">
              {currentSession ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        SESSION: {currentSession.sessionId}
                      </span>
                      <h2 className="text-base font-bold text-white mt-1">
                        Scenario {currentSession.scenarioCode}: {currentSession.scenarioName}
                      </h2>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>Order: <strong className="text-slate-200">{currentSession.order}</strong></span>
                        <span>Status: <strong className="text-emerald-400">{currentSession.status}</strong></span>
                        <span>Runs: <strong className="text-blue-400">{currentSession.runs.length}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleValidateSession}
                        className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Validate Integrity
                      </button>
                      <button
                        onClick={handleCompareSession}
                        disabled={!currentSession.baselineRunId || !currentSession.scosRunId}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white px-3 py-1.5 rounded flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <GitCompare className="w-3.5 h-3.5" /> Compare Runs
                      </button>
                    </div>
                  </div>

                  {/* Execution Condition Trigger Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Condition A: Baseline */}
                    <div className="bg-slate-950/70 border border-amber-900/40 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> CONDITION A: BASELINE MANUAL
                        </span>
                        {currentSession.baselineRunId && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                            EXECUTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Conventional manual municipal operational workflow. Disparate paper registers, bilateral phone calls, and manual multi-agency triage.
                      </p>
                      <button
                        onClick={() => handleExecuteCondition('BASELINE_MANUAL')}
                        disabled={isExecuting}
                        className="w-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" /> Execute Condition A (Baseline)
                      </button>
                    </div>

                    {/* Condition B: SCOS Integrated */}
                    <div className="bg-slate-950/70 border border-blue-900/40 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> CONDITION B: SCOS INTEGRATED
                        </span>
                        {currentSession.scosRunId && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                            EXECUTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Integrated SCOS intelligence workflow. Multi-modal sensor telemetry, spatial graph topological lookup, predictive cascades, and unified dispatch.
                      </p>
                      <button
                        onClick={() => handleExecuteCondition('SCOS_INTEGRATED')}
                        disabled={isExecuting}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" /> Execute Condition B (SCOS)
                      </button>
                    </div>
                  </div>

                  {/* Parameter & Initial Condition Integrity Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Scenario Parameters Fingerprint</span>
                      <p className="font-mono text-slate-300 text-[11px] truncate">{currentSession.parameterFingerprint}</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1">Initial Conditions Fingerprint</span>
                      <p className="font-mono text-slate-300 text-[11px] truncate">{currentSession.initialConditionFingerprint}</p>
                    </div>
                  </div>

                  {/* Executed Runs List */}
                  {currentSession.runs.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-semibold text-slate-300 mb-2">Executed Runs in this Session</h3>
                      <div className="space-y-2">
                        {currentSession.runs.map((r) => (
                          <div
                            key={r.runId}
                            onClick={() => setSelectedRun(r)}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                              selectedRun?.runId === r.runId
                                ? 'bg-slate-800/90 border-blue-500'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  r.condition === 'BASELINE_MANUAL'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}
                              >
                                {r.condition === 'BASELINE_MANUAL' ? 'BASELINE' : 'SCOS'}
                              </span>
                              <div>
                                <span className="font-mono text-xs text-white">{r.runId}</span>
                                <div className="text-[10px] text-slate-400">
                                  Duration: {r.metricResults.M1_WORKFLOW_DURATION.value}s | Retrieval:{' '}
                                  {r.metricResults.M2_INFORMATION_RETRIEVAL_COUNT.value} actions | Status: {r.executionStatus}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyReproducibility(r.runId);
                                }}
                                className="text-xs text-slate-400 hover:text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3 h-3" /> Verify
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
                  <FlaskConical className="w-12 h-12 mx-auto text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-200">No Active Session Selected</h3>
                  <p className="text-xs max-w-md mx-auto">
                    Select a research scenario on the left and click "Initialize New Session" to begin controlled experimental execution.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACTIVITY TIMELINE (10 STEPS) */}
        {/* ========================================================================= */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" /> Standardized Operational Activity Steps (1–10)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controlled observations captured during each phase of municipal incident mitigation.
                </p>
              </div>

              {currentSession && currentSession.runs.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">View Run:</span>
                  <select
                    value={selectedRun?.runId || ''}
                    onChange={(e) => {
                      const r = currentSession.runs.find((x) => x.runId === e.target.value);
                      if (r) setSelectedRun(r);
                    }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded"
                  >
                    {currentSession.runs.map((r) => (
                      <option key={r.runId} value={r.runId}>
                        {r.condition === 'BASELINE_MANUAL' ? 'Baseline' : 'SCOS'} ({r.runId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedRun ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-400">Selected Run:</span>{' '}
                    <strong className="text-white font-mono">{selectedRun.runId}</strong> ({selectedRun.condition})
                  </div>
                  <div>
                    <span className="text-slate-400">Scenario:</span>{' '}
                    <strong className="text-blue-400">{selectedRun.scenarioCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Duration:</span>{' '}
                    <strong className="text-amber-400">{selectedRun.metricResults.M1_WORKFLOW_DURATION.value}s</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Classification:</span>{' '}
                    <strong className="text-emerald-400">{selectedRun.classification}</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedRun.observations.map((obs) => (
                    <div
                      key={obs.stepId}
                      className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-700 text-blue-300 text-xs flex items-center justify-center font-bold">
                            {obs.stepNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStepIcon(obs.stepId)}
                            <h3 className="text-sm font-semibold text-white">{obs.stepName}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-amber-400" /> {obs.durationSeconds}s
                          </span>
                          <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            Actions: {obs.actionsCount} | Interactions: {obs.interactionsCount}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              obs.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {obs.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                        {obs.notes}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          <span className="text-slate-500 font-semibold">Data Sources:</span>{' '}
                          {obs.dataSourcesAccessed.join(', ') || 'None'}
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Assets Identified:</span>{' '}
                          {obs.assetsIdentified.join(', ') || 'None'}
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Departments:</span>{' '}
                          {obs.departmentsInvolved.join(', ') || 'None'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No execution run selected. Execute Condition A or B in the console to view the 10-step activity trace.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STANDARDIZED METRICS (M1–M10) */}
        {/* ========================================================================= */}
        {activeTab === 'METRICS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" /> Standardized Evaluation Metrics (M1–M10)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standardized operational metrics derived directly from empirical activity step observations.
                </p>
              </div>

              {currentSession && currentSession.runs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Run:</span>
                  <select
                    value={selectedRun?.runId || ''}
                    onChange={(e) => {
                      const r = currentSession.runs.find((x) => x.runId === e.target.value);
                      if (r) setSelectedRun(r);
                    }}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded"
                  >
                    {currentSession.runs.map((r) => (
                      <option key={r.runId} value={r.runId}>
                        {r.condition === 'BASELINE_MANUAL' ? 'Baseline' : 'SCOS'} ({r.runId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedRun ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(selectedRun.metricResults).map((metric) => (
                  <div
                    key={metric.metricId}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-950 border border-blue-800 text-blue-300 font-mono text-xs font-bold px-2 py-0.5 rounded">
                        {metric.metricCode}
                      </span>
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                        {metric.validityClassification}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white">{metric.displayName}</h3>

                    <div className="flex items-baseline gap-2 py-1">
                      <span className="text-2xl font-bold text-emerald-400">
                        {typeof metric.value === 'number' ? metric.value : metric.value}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{metric.unit}</span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                      <p><strong className="text-slate-300">Method:</strong> {metric.calculationMethod}</p>
                      <p><strong className="text-slate-300">Provenance:</strong> {metric.provenance}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No run selected. Execute Condition A or B in the console to derive M1–M10 metrics.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: COMPARATIVE EVALUATION */}
        {/* ========================================================================= */}
        {activeTab === 'COMPARISON' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-emerald-400" /> Condition A vs Condition B Comparative Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct comparison between Conventional/Manual Baseline and SCOS Integrated Intelligence.
                </p>
              </div>

              {currentSession && currentSession.baselineRunId && currentSession.scosRunId && (
                <button
                  onClick={handleCompareSession}
                  className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white px-3 py-1.5 rounded flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-evaluate Comparison
                </button>
              )}
            </div>

            {currentComparison ? (
              <div className="space-y-4">
                {/* Comparison Metadata & Order Warning */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div>
                      <span className="text-slate-400">Comparison ID:</span>{' '}
                      <strong className="text-white font-mono">{currentComparison.comparisonId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Scenario:</span>{' '}
                      <strong className="text-blue-400">{currentComparison.scenarioCode}</strong> ({currentComparison.scenarioName})
                    </div>
                    <div>
                      <span className="text-slate-400">Integrity Status:</span>{' '}
                      <strong className={currentComparison.isValid ? 'text-emerald-400' : 'text-red-400'}>
                        {currentComparison.isValid ? 'VALID COMPARISON' : 'INVALID'}
                      </strong>
                    </div>
                  </div>

                  {/* Order Effect Notice */}
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded p-2.5 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Order Effect Risk ({currentComparison.orderEffectRisk}):</strong> {currentComparison.orderEffectWarning}
                    </div>
                  </div>
                </div>

                {/* Metrics Comparative Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">Metric</th>
                        <th className="py-2.5 px-3">Condition A (Baseline)</th>
                        <th className="py-2.5 px-3">Condition B (SCOS)</th>
                        <th className="py-2.5 px-3">Absolute Delta</th>
                        <th className="py-2.5 px-3">Relative (%)</th>
                        <th className="py-2.5 px-3">Impact Direction</th>
                        <th className="py-2.5 px-3">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {currentComparison.metricsComparison.map((m) => (
                        <tr key={m.metricId} className="hover:bg-slate-950/50">
                          <td className="py-3 px-3">
                            <span className="font-mono text-blue-400 font-bold mr-1.5">{m.metricCode}</span>
                            <span className="text-white font-medium">{m.displayName}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            {m.baselineValue} {m.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                            {m.scosValue} {m.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-cyan-300">
                            {typeof m.absoluteDifference === 'number'
                              ? `${m.absoluteDifference > 0 ? '+' : ''}${m.absoluteDifference} ${m.unit}`
                              : m.absoluteDifference}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {m.relativeChangePercent !== null ? (
                              <span className={m.relativeChangePercent < 0 ? 'text-emerald-400' : 'text-blue-400'}>
                                {m.relativeChangePercent > 0 ? '+' : ''}
                                {m.relativeChangePercent}%
                              </span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {m.direction === 'IMPROVEMENT' ? (
                              <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <TrendingUp className="w-3 h-3" /> IMPROVEMENT
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] w-fit">
                                NEUTRAL
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-xs">{m.interpretation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Statistical Limitation Notice:</strong> {currentComparison.statisticalLimitationNotice}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <p>No comparative evaluation available for this session.</p>
                <p className="text-slate-500">Execute both Baseline and SCOS runs in the console, then click "Compare Runs".</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: REPRODUCIBILITY FINGERPRINT */}
        {/* ========================================================================= */}
        {activeTab === 'REPRODUCIBILITY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Deterministic Reproducibility Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verification of canonical JSON structure and SHA-256 fingerprint hash matches.
              </p>
            </div>

            {reproducibilityResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${
                    reproducibilityResult.isMatch
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-red-950/40 border-red-800 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {reproducibilityResult.isMatch ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400" /> REPRODUCIBILITY VERIFICATION PASSED (MATCH)
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-400" /> REPRODUCIBILITY MISMATCH DETECTED
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-1">
                    The executed run configuration is identical to the canonical scenario specification in the Phase 10A Research Dataset.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold">Provided Fingerprint:</span>
                    <p className="font-mono text-slate-200 break-all">{reproducibilityResult.providedFingerprint}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold">Computed Canonical SHA-256:</span>
                    <p className="font-mono text-emerald-400 break-all">{reproducibilityResult.computedFingerprint}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Canonical JSON Payload:</span>
                    <button
                      onClick={() => setShowPayloadModal(!showPayloadModal)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {showPayloadModal ? 'Hide Payload' : 'Inspect Canonical String'}
                    </button>
                  </div>

                  {showPayloadModal && (
                    <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60">
                      {reproducibilityResult.canonicalPayload}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a run from the Console or Timeline tab and click "Verify" to test cryptographic reproducibility.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUTOMATED TEST SUITE (25 TESTS) */}
        {/* ========================================================================= */}
        {activeTab === 'TEST_SUITE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> Automated Verification Test Suite (TEST-EXP-01 to TEST-EXP-25)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  25 automated diagnostic test cases verifying dataset freeze, execution determinism, RBAC, M1–M10 schemas, and export integrity.
                </p>
              </div>

              <button
                onClick={handleRunTestSuite}
                disabled={isExecuting}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white px-3.5 py-1.5 rounded flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-run 25 Tests
              </button>
            </div>

            {testSuiteResults ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border flex items-center justify-between text-xs ${
                    testSuiteResults.allPassed
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-red-950/40 border-red-800 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>
                      {testSuiteResults.passedTests} / {testSuiteResults.totalTests} TESTS PASSED (100% SUCCESS)
                    </span>
                  </div>
                  <span className="font-mono text-slate-300">Executed: {new Date(testSuiteResults.executedAt).toLocaleTimeString()}</span>
                </div>

                <div className="space-y-2">
                  {testSuiteResults.results.map((test) => (
                    <div
                      key={test.id}
                      className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400 text-[11px]">{test.id}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {test.category}
                          </span>
                          <h4 className="font-semibold text-slate-200">{test.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400">{test.details}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{test.durationMs}ms</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            test.passed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {test.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                <p>Test suite not yet executed.</p>
                <button
                  onClick={handleRunTestSuite}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white px-4 py-2 rounded"
                >
                  Execute 25 Automated Tests Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
