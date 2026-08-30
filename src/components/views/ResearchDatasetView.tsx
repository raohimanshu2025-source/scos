// =========================================================================
// SCOS PHASE 10A — EXPERIMENTAL DATASET & RESEARCH SCENARIO REGISTRY VIEW
// Research Governance, Engineering Assumptions & Reproducibility Interface
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Fingerprint,
  Download,
  Play,
  Lock,
  Layers,
  Sliders,
  History,
  FlaskConical,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import {
  ResearchDataset,
  ResearchScenario,
  ResearchAssumption,
  ResearchDatasetVersion,
  ResearchScenarioExecution,
  ReproducibilityCheckResult,
} from '../../types/researchDataset';
import { ResearchDatasetTestSuiteResult } from '../../tests/researchDataset.spec';
import {
  getResearchDatasetSummary,
  getResearchScenarios,
  getResearchAssumptions,
  getResearchVersions,
  getResearchExecutions,
  freezeResearchScenario,
  runResearchExecution,
  verifyReproducibility,
  exportResearchDataset,
  exportResearchDatasetCSV,
  runResearchDatasetTestSuite,
} from '../../services/apiClient';

export const ResearchDatasetView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'scenarios' | 'assumptions' | 'reproducibility' | 'executions' | 'tests'
  >('scenarios');

  const [loading, setLoading] = useState<boolean>(true);
  const [dataset, setDataset] = useState<ResearchDataset | null>(null);
  const [scenarios, setScenarios] = useState<ResearchScenario[]>([]);
  const [assumptions, setAssumptions] = useState<ResearchAssumption[]>([]);
  const [versions, setVersions] = useState<ResearchDatasetVersion[]>([]);
  const [executions, setExecutions] = useState<ResearchScenarioExecution[]>([]);

  const [selectedScenario, setSelectedScenario] = useState<ResearchScenario | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);

  // Reproducibility Checker State
  const [verifyScenarioId, setVerifyScenarioId] = useState<string>('SC-01');
  const [verifyFingerprint, setVerifyFingerprint] = useState<string>('');
  const [verifyCondition, setVerifyCondition] = useState<'BASELINE_MANUAL' | 'SCOS_INTEGRATED'>('SCOS_INTEGRATED');
  const [verifyResult, setVerifyResult] = useState<ReproducibilityCheckResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Execution Runner State
  const [executingScenarioId, setExecutingScenarioId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test Suite State
  const [testResult, setTestResult] = useState<ResearchDatasetTestSuiteResult | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dsData, scData, asData, vsData, exData] = await Promise.all([
        getResearchDatasetSummary().catch(() => null),
        getResearchScenarios().catch(() => []),
        getResearchAssumptions().catch(() => []),
        getResearchVersions().catch(() => []),
        getResearchExecutions().catch(() => []),
      ]);

      if (dsData) setDataset(dsData);
      setScenarios(scData);
      setAssumptions(asData);
      setVersions(vsData);
      setExecutions(exData);

      if (scData.length > 0 && !selectedScenario) {
        setSelectedScenario(scData[0]);
        setVerifyFingerprint(scData[0].configurationFingerprint);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to load dataset registry' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFingerprint(id);
    setTimeout(() => setCopiedFingerprint(null), 2000);
  };

  const handleFreezeScenario = async (scenarioId: string) => {
    try {
      const updated = await freezeResearchScenario(scenarioId);
      setScenarios((prev) => prev.map((s) => (s.scenarioId === scenarioId ? updated : s)));
      if (selectedScenario?.scenarioId === scenarioId) {
        setSelectedScenario(updated);
      }
      setActionMessage({ type: 'success', text: `Scenario ${updated.scenarioCode} successfully frozen.` });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to freeze scenario' });
    }
  };

  const handleRunExecution = async (scenarioId: string, condition: 'BASELINE_MANUAL' | 'SCOS_INTEGRATED') => {
    try {
      setExecutingScenarioId(scenarioId);
      const newExec = await runResearchExecution({ scenarioId, condition });
      setExecutions((prev) => [newExec, ...prev]);
      setActionMessage({
        type: 'success',
        text: `Execution completed for ${newExec.scenarioCode} (${newExec.condition}) — Duration: ${newExec.resultSummary.durationSeconds}s`,
      });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Execution run failed' });
    } finally {
      setExecutingScenarioId(null);
    }
  };

  const handleVerifyReproducibility = async () => {
    try {
      setIsVerifying(true);
      const result = await verifyReproducibility({
        scenarioId: verifyScenarioId,
        condition: verifyCondition,
        configurationFingerprint: verifyFingerprint,
      });
      setVerifyResult(result);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const exportData = await exportResearchDataset();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-research-dataset-${dataset?.currentVersion || 'v1.0'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Failed to export JSON dataset' });
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvText = await exportResearchDatasetCSV();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-research-dataset-${dataset?.currentVersion || 'v1.0'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Failed to export CSV dataset' });
    }
  };

  const handleRunTestSuite = async () => {
    try {
      setIsRunningTests(true);
      const results = await runResearchDatasetTestSuite();
      setTestResult(results);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to run test suite' });
    } finally {
      setIsRunningTests(false);
    }
  };

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.scenarioCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scenarioName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scenarioCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Classification Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200 text-sm tracking-wide">
                RESEARCH DATASET & SCENARIO REGISTRY
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded border border-amber-500/40 font-mono">
                SIMULATED / PROTOTYPE DATA
              </span>
            </div>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Deterministic scenario configurations, centralized engineering assumptions, and reproducible benchmark trials. Not real municipal telemetry.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            JSON Export
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            CSV Export
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Dataset Header / Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Dataset Version</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono border border-indigo-500/30">
              {dataset?.currentVersion || 'v1.0'}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-2 truncate">
            {dataset?.datasetName || 'SCOS Controlled Experimental Dataset'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
            <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{dataset?.configurationFingerprint ? dataset.configurationFingerprint.slice(0, 16) + '...' : 'Calculating...'}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Authoritative Scenarios</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">5</div>
          <div className="text-xs text-slate-400 mt-1">SC-01 through SC-05 Registered</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Engineering Assumptions</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{assumptions.length || 12}</div>
          <div className="text-xs text-slate-400 mt-1">Centralized model parameters</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Validation Cases Linked</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">7</div>
          <div className="text-xs text-slate-400 mt-1">VC-01 through VC-07 (Phase 9C)</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'scenarios'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          Scenario Registry (5)
        </button>

        <button
          onClick={() => setActiveTab('assumptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'assumptions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Engineering Assumptions ({assumptions.length})
        </button>

        <button
          onClick={() => setActiveTab('reproducibility')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'reproducibility'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          Reproducibility Verifier
        </button>

        <button
          onClick={() => setActiveTab('executions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'executions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          Execution Log ({executions.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('tests');
            if (!testResult && !isRunningTests) handleRunTestSuite();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'tests'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Phase 10A Test Suite (25)
        </button>
      </div>

      {/* TAB 1: SCENARIO REGISTRY */}
      {activeTab === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scenario List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scenarios by code or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              {filteredScenarios.map((scenario) => {
                const isSelected = selectedScenario?.scenarioId === scenario.scenarioId;
                return (
                  <div
                    key={scenario.scenarioId}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setVerifyScenarioId(scenario.scenarioId);
                      setVerifyFingerprint(scenario.configurationFingerprint);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-400">
                          {scenario.scenarioCode}
                        </span>
                        {scenario.isFrozen ? (
                          <span className="flex items-center gap-1 text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded font-mono">
                            <Lock className="w-2.5 h-2.5" />
                            FROZEN
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono">
                            VALIDATED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {scenario.validationCaseIds.length} VCs
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 mt-1.5">
                      {scenario.scenarioName}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {scenario.description}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                      <span>{scenario.scenarioCategory}</span>
                      <span className="text-slate-400">
                        {scenario.targetEntities[0]?.name.slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Scenario Deep Dive */}
          <div className="lg:col-span-2">
            {selectedScenario ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                        {selectedScenario.scenarioCode}
                      </span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {selectedScenario.scenarioCategory}
                      </span>
                      {selectedScenario.isFrozen ? (
                        <span className="flex items-center gap-1 text-xs bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">
                          <Lock className="w-3 h-3" />
                          FROZEN ({selectedScenario.frozenAt?.slice(0, 10)})
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-lg font-bold text-slate-100 mt-2">
                      {selectedScenario.scenarioName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedScenario.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!selectedScenario.isFrozen && (
                      <button
                        onClick={() => handleFreezeScenario(selectedScenario.scenarioId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                      >
                        <Lock className="w-3.5 h-3.5 text-sky-400" />
                        Freeze Scenario
                      </button>
                    )}
                    <button
                      onClick={() => handleRunExecution(selectedScenario.scenarioId, 'SCOS_INTEGRATED')}
                      disabled={executingScenarioId === selectedScenario.scenarioId}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {executingScenarioId === selectedScenario.scenarioId ? 'Running...' : 'Execute Trial'}
                    </button>
                  </div>
                </div>

                {/* Fingerprint Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Fingerprint className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-slate-400 font-mono">CONFIGURATION FINGERPRINT (SHA-256)</div>
                      <div className="text-xs text-indigo-300 font-mono truncate">
                        {selectedScenario.configurationFingerprint}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedScenario.configurationFingerprint, selectedScenario.scenarioId)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 shrink-0 transition"
                    title="Copy Fingerprint"
                  >
                    {copiedFingerprint === selectedScenario.scenarioId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Geographic & Target Entities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Geographic Spatial Scope</span>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>
                        <span className="text-slate-500">Ward:</span> {selectedScenario.geographicScope.ward}
                      </div>
                      <div>
                        <span className="text-slate-500">Corridor:</span> {selectedScenario.geographicScope.corridor}
                      </div>
                      <div>
                        <span className="text-slate-500">Coordinates:</span> [{selectedScenario.geographicScope.centerCoordinates.join(', ')}] (Radius: {selectedScenario.geographicScope.boundingRadiusMeters}m)
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Target Digital Twin Entities</span>
                    <div className="space-y-1.5">
                      {selectedScenario.targetEntities.map((entity) => (
                        <div key={entity.id} className="flex items-center justify-between text-xs bg-slate-900 p-1.5 rounded border border-slate-800/60">
                          <span className="text-slate-300 truncate">{entity.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 bg-slate-800 rounded">
                            {entity.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experimental Conditions Comparison (Condition A vs Condition B) */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Experimental Conditions Specification</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Condition A */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {selectedScenario.baselineCondition.conditionName}
                        </span>
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          BASELINE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedScenario.baselineCondition.description}
                      </p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400">Workflow Stages:</span>
                        {selectedScenario.baselineCondition.workflowStages.map((stg, i) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0">•</span>
                            <span>{stg}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Decision Support: <strong className="text-rose-400">OFF</strong></span>
                        <span>Auditability: <strong>{selectedScenario.baselineCondition.auditability}</strong></span>
                      </div>
                    </div>

                    {/* Condition B */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 font-mono">
                          {selectedScenario.scosCondition.conditionName}
                        </span>
                        <span className="text-[10px] bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                          SCOS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedScenario.scosCondition.description}
                      </p>
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-slate-400">Workflow Stages:</span>
                        {selectedScenario.scosCondition.workflowStages.map((stg, i) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-indigo-400 shrink-0">•</span>
                            <span>{stg}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Decision Support: <strong className="text-emerald-400">ACTIVE</strong></span>
                        <span>Auditability: <strong>{selectedScenario.scosCondition.auditability}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engineering Parameters Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Engineering Parameter Snapshot</span>
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono">
                        <tr>
                          <th className="p-2.5">Parameter ID</th>
                          <th className="p-2.5">Value</th>
                          <th className="p-2.5">Unit</th>
                          <th className="p-2.5">Source Type</th>
                          <th className="p-2.5">Engineering Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {selectedScenario.engineeringParameters.map((param) => (
                          <tr key={param.parameterId} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-mono text-indigo-300">{param.parameterId}</td>
                            <td className="p-2.5 font-bold font-mono">{param.value}</td>
                            <td className="p-2.5 text-slate-400 font-mono">{param.unit}</td>
                            <td className="p-2.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {param.sourceType}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 text-[11px]">
                              {param.engineeringJustification}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cross-Phase Validation Links */}
                <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-400">Linked Validation Cases (Phase 9C):</span>
                    <div className="flex items-center gap-1.5">
                      {selectedScenario.validationCaseIds.map((vc) => (
                        <span key={vc} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-mono">
                          {vc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Provenance: {selectedScenario.provenance.sourceModule}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                Select a scenario from the registry to view detailed specifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CENTRALIZED ENGINEERING ASSUMPTIONS */}
      {activeTab === 'assumptions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Centralized Engineering Assumptions Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized model calibration parameters applied across simulation runs, validation cases, and comparative evaluation trials.
              </p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-mono">
              SIMULATED / PROTOTYPE DATA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assumptions.map((assumption) => (
              <div
                key={assumption.parameterId}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {assumption.parameterId}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 mt-1">
                      {assumption.name}
                    </h4>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
                    {assumption.sourceType}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  <span className="text-lg font-bold text-slate-100">{assumption.value}</span>
                  <span className="text-xs text-slate-400">{assumption.unit}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">
                    Range: [{assumption.minimum} - {assumption.maximum}]
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {assumption.engineeringJustification}
                </p>

                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span>Applicability: </span>
                  <span className="text-slate-400">{assumption.applicability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPRODUCIBILITY VERIFIER */}
      {activeTab === 'reproducibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Reproducibility Verification Engine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter a scenario ID and configuration fingerprint to verify mathematical reproducibility against the canonical registry.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Scenario Target</label>
                <select
                  value={verifyScenarioId}
                  onChange={(e) => {
                    setVerifyScenarioId(e.target.value);
                    const sc = scenarios.find((s) => s.scenarioId === e.target.value);
                    if (sc) setVerifyFingerprint(sc.configurationFingerprint);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {scenarios.map((s) => (
                    <option key={s.scenarioId} value={s.scenarioId}>
                      {s.scenarioCode} — {s.scenarioName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Experimental Condition</label>
                <select
                  value={verifyCondition}
                  onChange={(e) => setVerifyCondition(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="SCOS_INTEGRATED">Condition B — SCOS Integrated Decision-Support</option>
                  <option value="BASELINE_MANUAL">Condition A — Baseline Manual Workflow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Configuration Fingerprint (64-Hex SHA-256)
                </label>
                <input
                  type="text"
                  value={verifyFingerprint}
                  onChange={(e) => setVerifyFingerprint(e.target.value)}
                  placeholder="Paste SHA-256 fingerprint hash..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleVerifyReproducibility}
                disabled={isVerifying || !verifyFingerprint}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-indigo-600/30"
              >
                <Fingerprint className="w-4 h-4" />
                {isVerifying ? 'Verifying Canonical Hash...' : 'Verify Reproducibility'}
              </button>
            </div>
          </div>

          {/* Verification Results Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Verification Outcome</h3>

            {verifyResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    verifyResult.isMatch
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  {verifyResult.isMatch ? (
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 shrink-0 text-rose-400" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {verifyResult.isMatch
                        ? 'REPRODUCIBILITY CONFIRMED (MATCH)'
                        : 'REPRODUCIBILITY MISMATCH DETECTED'}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {verifyResult.isMatch
                        ? 'The provided configuration fingerprint mathematically matches the canonical scenario definition.'
                        : 'Parameter drift, condition differences, or invalid hash detected.'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
                  <div>
                    <span className="text-slate-500">Input Hash: </span>
                    <span className="text-slate-300">{verifyResult.inputFingerprint || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Computed: </span>
                    <span className="text-indigo-300">{verifyResult.computedFingerprint || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Algorithm: </span>
                    <span className="text-slate-300">{verifyResult.matchDetails.algorithm}</span>
                  </div>
                </div>

                {verifyResult.diffSummary && verifyResult.diffSummary.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-300">Diff & Drift Diagnostics:</span>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-rose-300 space-y-1 font-mono">
                      {verifyResult.diffSummary.map((diff, i) => (
                        <div key={i}>• {diff}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Fingerprint className="w-8 h-8 mb-2 opacity-40" />
                Select a scenario and click "Verify Reproducibility" to execute check.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTION LOG */}
      {activeTab === 'executions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Experimental Execution Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of controlled scenario runs under Baseline Manual vs SCOS Integrated conditions.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Recorded Trials: {executions.length}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Execution ID</th>
                  <th className="p-3">Scenario</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Traceability</th>
                  <th className="p-3">Fingerprint</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {executions.map((exec) => (
                  <tr key={exec.executionId} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-indigo-300">{exec.executionId}</td>
                    <td className="p-3 font-semibold">{exec.scenarioCode}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          exec.condition === 'SCOS_INTEGRATED'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {exec.condition}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{exec.resultSummary.durationSeconds}s</td>
                    <td className="p-3 font-mono">{exec.resultSummary.decisionTraceabilityPercent}%</td>
                    <td className="p-3 font-mono text-slate-400">
                      {exec.configurationFingerprint.slice(0, 12)}...
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
                        {exec.executionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PHASE 10A 25-TEST HARNESS */}
      {activeTab === 'tests' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Phase 10A Test & Verification Suite</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                25 automated assertion tests for scenario registration, canonical hashing, engineering assumptions, RBAC, and reproducibility.
              </p>
            </div>
            <button
              onClick={handleRunTestSuite}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Executing Tests...' : 'Re-run 25 Tests'}
            </button>
          </div>

          {testResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Assertions</span>
                  <span className="text-base font-bold font-mono text-slate-200">{testResult.totalTests}</span>
                </div>
                <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/60 flex items-center justify-between">
                  <span className="text-xs text-emerald-400">Passed Count</span>
                  <span className="text-base font-bold font-mono text-emerald-300">{testResult.passedCount}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Failed Count</span>
                  <span className="text-base font-bold font-mono text-slate-200">{testResult.failedCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                {testResult.testResults.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                      test.passed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-rose-950/40 border-rose-800 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">
                          <span className="font-mono text-indigo-400 mr-2">{test.id}</span>
                          {test.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{test.message}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {test.executionTimeMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchDatasetView;
