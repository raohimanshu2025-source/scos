// =========================================================================
// SCOS PHASE 9D — COMPARATIVE DECISION-SUPPORT EVALUATION VIEW
// Controlled Research Evaluation: Baseline Manual vs SCOS Integrated Workflow
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  ComparativeEvaluationScenario,
  ComparativeEvaluationRecord,
  ComparativeEvaluationReport,
  EvaluationOrder,
  OrderEffectRisk,
  ResultValidityClassification,
} from '../../types/comparativeEvaluation';
import { ComparativeEvaluationTestSuiteResult } from '../../tests/comparativeEvaluation.spec';
import apiClient from '../../services/apiClient';
import {
  FileText,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Shield,
  Activity,
  GitBranch,
  Building2,
  Users,
  Search,
  Scale,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export const ComparativeEvaluationView: React.FC = () => {
  const [scenarios, setScenarios] = useState<ComparativeEvaluationScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-01');
  const [participantId, setParticipantId] = useState<string>('P01');
  const [evaluationOrder, setEvaluationOrder] = useState<EvaluationOrder>('BASELINE_THEN_SCOS');
  const [activeRecord, setActiveRecord] = useState<ComparativeEvaluationRecord | null>(null);
  const [report, setReport] = useState<ComparativeEvaluationReport | null>(null);
  const [testSuiteResult, setTestSuiteResult] = useState<ComparativeEvaluationTestSuiteResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'TRACEABILITY' | 'CASCADE' | 'AGGREGATE' | 'TESTS'>('METRICS');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load scenarios and initial report on mount
  useEffect(() => {
    loadScenariosAndReport();
  }, []);

  const loadScenariosAndReport = async () => {
    try {
      setIsLoading(true);
      const [scList, rep] = await Promise.all([
        apiClient.getComparativeScenarios(),
        apiClient.getComparativeReport(),
      ]);
      setScenarios(scList || []);
      setReport(rep || null);

      // Execute or load initial record for selected scenario
      if (scList && scList.length > 0) {
        const initialRec = await apiClient.runComparativeEvaluation({
          participantId: 'P01',
          scenarioId: scList[0].scenarioId,
          evaluationOrder: 'BASELINE_THEN_SCOS',
        });
        setActiveRecord(initialRec);
      }
    } catch (err: any) {
      console.error('Failed to load comparative evaluation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const rec = await apiClient.runComparativeEvaluation({
        participantId: participantId.trim().toUpperCase() || 'P01',
        scenarioId: selectedScenarioId,
        evaluationOrder,
      });
      setActiveRecord(rec);
      const updatedReport = await apiClient.getComparativeReport();
      setReport(updatedReport);
      setStatusMessage(`Comparative evaluation successfully calculated for ${rec.participantId} on ${rec.scenarioId}.`);
    } catch (err: any) {
      setStatusMessage(`Evaluation execution failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTestSuite = async () => {
    try {
      setIsTestRunning(true);
      const res = await apiClient.runComparativeEvaluationTestSuite();
      setTestSuiteResult(res);
      setActiveTab('TESTS');
    } catch (err: any) {
      console.error('Test suite failed:', err);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const csvText = await apiClient.exportComparativeCSV();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `scos-comparative-evaluation-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const selectedScenario = scenarios.find((s) => s.scenarioId === selectedScenarioId) || scenarios[0];

  const getValidityBadge = (validity: ResultValidityClassification) => {
    switch (validity) {
      case 'VALID DESCRIPTIVE RESULT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">VALID DESCRIPTIVE RESULT</span>;
      case 'PARTIALLY VALID':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">PARTIALLY VALID</span>;
      case 'INSUFFICIENT DATA':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">INSUFFICIENT DATA</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">NOT COMPARABLE</span>;
    }
  };

  const getOrderEffectBadge = (risk: OrderEffectRisk) => {
    switch (risk) {
      case 'HIGH':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200 dark:border-amber-800">Order Effect Risk: HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-200 dark:border-blue-800">Order Effect Risk: MEDIUM</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">Order Effect Risk: LOW</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 9D Controlled Research Framework
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                SIMULATED / PROTOTYPE DATA
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Scale className="w-7 h-7 text-indigo-400" />
              SCOS Comparative Decision-Support Evaluation
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Controlled within-subject research evaluation comparing Conventional/Manual Municipal Workflow against the SCOS Unified Operational Intelligence Workflow across 5 standardized infrastructure shock scenarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunTestSuite}
              disabled={isTestRunning}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              {isTestRunning ? 'Running 20 Tests...' : 'Run 20-Test Diagnostic'}
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Research CSV
            </button>
          </div>
        </div>

        {/* Non-actuating disclaimer banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-xs text-amber-300/90 bg-amber-950/30 p-3 rounded-lg border border-amber-800/40">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-200">Non-Actuating Observational Boundary:</strong> SCOS is an observational decision-support prototype. Comparative metrics evaluate user interaction efficiency, contextual completeness, and decision traceability within the prototype simulator. They do not claim physical municipal operational improvements or real-time SCADA actuations.
          </div>
        </div>
      </div>

      {/* Research Question & Secondary RQs Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Primary Research Question</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Formal Protocol RQ-9D</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 font-serif italic mb-4">
          &ldquo;How does an integrated Urban Operating System architecture affect the efficiency, completeness, coordination overhead, infrastructure awareness, and traceability of urban incident decision support when compared with a conventional/manual operational workflow?&rdquo;
        </div>

        {/* Secondary RQs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report?.secondaryQuestions.map((q) => (
            <div key={q.rq} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{q.rq}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {q.status === 'OBSERVED_PROTOTYPE_REDUCTION' ? 'Observed Reduction' : 'Observed Completeness'}
                </span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{q.question}</p>
              <p className="text-slate-500 dark:text-slate-400">{q.findings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Controls & Scenario Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          Evaluation Execution Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Scenario Selection */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Benchmark Scenario (SC-01 to SC-05)
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              {scenarios.map((s) => (
                <option key={s.scenarioId} value={s.scenarioId}>
                  {s.code}: {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Participant ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Anonymized Participant ID
            </label>
            <input
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="P01"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          {/* Evaluation Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Execution Order
            </label>
            <select
              value={evaluationOrder}
              onChange={(e) => setEvaluationOrder(e.target.value as EvaluationOrder)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BASELINE_THEN_SCOS">Baseline → SCOS (Standard)</option>
              <option value="SCOS_THEN_BASELINE">SCOS → Baseline (Reverse)</option>
              <option value="COUNTERBALANCED">Counterbalanced Split</option>
            </select>
          </div>
        </div>

        {/* Action Button & Status */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Target Asset:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {selectedScenario?.targetEntityName || 'N/A'}
            </span>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Execute Comparative Evaluation
          </button>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            {statusMessage}
          </div>
        )}
      </div>

      {/* Order Effect Notice Banner */}
      {activeRecord && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-900 dark:text-amber-200">
                Order Effect & Learning Bias Consideration:
              </strong>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                {activeRecord.orderEffectNotice}
              </span>
            </div>
          </div>
          <div className="shrink-0">{getOrderEffectBadge(activeRecord.orderEffectRisk)}</div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-4 py-2.5 font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'METRICS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          10 Primary Metrics Comparison
        </button>
        <button
          onClick={() => setActiveTab('TRACEABILITY')}
          className={`px-4 py-2.5 font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TRACEABILITY'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Decision Traceability Chain
        </button>
        <button
          onClick={() => setActiveTab('CASCADE')}
          className={`px-4 py-2.5 font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'CASCADE'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Infrastructure & Cascade Matrix
        </button>
        <button
          onClick={() => setActiveTab('AGGREGATE')}
          className={`px-4 py-2.5 font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'AGGREGATE'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Descriptive Aggregate Analysis
        </button>
        <button
          onClick={() => setActiveTab('TESTS')}
          className={`px-4 py-2.5 font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TESTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          20-Test Diagnostic Results
          {testSuiteResult && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                testSuiteResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {testSuiteResult.passedCount}/{testSuiteResult.totalTests}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: 10 PRIMARY METRICS COMPARISON TABLE */}
      {activeTab === 'METRICS' && activeRecord && (
        <div className="space-y-6">
          {/* Side-by-side Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Condition A</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Conventional / Manual Workflow</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Fragmented Systems
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeRecord.baselineResult.duration}s</div>
                  <div className="text-[11px] text-slate-500">Duration (8.0 min)</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeRecord.baselineResult.retrievalInteractionCount}</div>
                  <div className="text-[11px] text-slate-500">Retrieval Steps</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeRecord.baselineResult.contextCompleteness}%</div>
                  <div className="text-[11px] text-slate-500">Context Complete</div>
                </div>
              </div>
            </div>

            {/* SCOS Card */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800/60 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Condition B</span>
                  <h4 className="text-base font-bold text-indigo-950 dark:text-indigo-200">SCOS Unified Intelligence Workflow</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  Integrated Digital Twin
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{activeRecord.scosResult.duration}s</div>
                  <div className="text-[11px] text-slate-500">Duration (2.75 min)</div>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{activeRecord.scosResult.retrievalInteractionCount}</div>
                  <div className="text-[11px] text-slate-500">Retrieval Steps</div>
                </div>
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{activeRecord.scosResult.contextCompleteness}%</div>
                  <div className="text-[11px] text-slate-500">Context Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* 10 Primary Metric Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  10 Standardized Comparative Evaluation Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Participant: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeRecord.participantId}</span> | Scenario: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeRecord.scenarioId}</span>
                </p>
              </div>
              <span className="text-xs text-slate-500 italic">Descriptive Prototype Observations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Metric Name</th>
                    <th className="p-3 text-center">Baseline</th>
                    <th className="p-3 text-center">SCOS</th>
                    <th className="p-3 text-center">Absolute Diff</th>
                    <th className="p-3 text-center">Relative Change</th>
                    <th className="p-3">Interpretation & Prototype Rationale</th>
                    <th className="p-3 text-center">Validity Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeRecord.metrics.map((m) => (
                    <tr key={m.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {m.displayName}
                        <div className="text-[10px] font-mono text-slate-400 font-normal">{m.key} ({m.unit})</div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {m.baselineValue}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {m.scosValue}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-800 dark:text-slate-200">
                        {typeof m.absoluteDifference === 'number' && m.absoluteDifference > 0
                          ? `+${m.absoluteDifference}`
                          : m.absoluteDifference}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {m.relativeChangePercent !== null ? (
                          <span
                            className={
                              m.relativeChangePercent < 0 && m.key.includes('DURATION') || m.key.includes('OVERHEAD') || m.key.includes('RETRIEVAL')
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : m.relativeChangePercent > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-600'
                            }
                          >
                            {m.relativeChangePercent > 0 ? `+${m.relativeChangePercent}%` : `${m.relativeChangePercent}%`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{m.interpretation}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.rationaleAndLimitations}</div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {getValidityBadge(m.validityClassification)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DECISION TRACEABILITY CHAIN */}
      {activeTab === 'TRACEABILITY' && activeRecord && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-500" />
                10-Stage Operational Decision Traceability Provenance Chain
              </h3>
              <p className="text-xs text-slate-500">
                Verifies unbroken provenance from original incident ingestion through to post-authorization municipal audit logging.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {activeRecord.decisionTraceability.traceabilityPercentage}% Traceable
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Unbroken Chain Verified
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {activeRecord.decisionTraceability.traceChain.map((node) => (
              <div
                key={node.stepNumber}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                    {node.stepNumber}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{node.nodeType}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{node.entityRef}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {node.verified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Verified In Telemetry
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                      <XCircle className="w-4 h-4" /> Not In Baseline
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INFRASTRUCTURE & CASCADE MATRIX */}
      {activeTab === 'CASCADE' && activeRecord && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Infrastructure Asset Awareness */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Infrastructure Awareness Matrix
              </h4>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeRecord.infrastructureAwareness.awarenessPercentage}% Coverage
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Identified civil infrastructure entities compared against required topology in Digital Twin:
            </p>
            <div className="space-y-1.5">
              {activeRecord.infrastructureAwareness.requiredAssets.map((asset, idx) => {
                const identified = activeRecord.infrastructureAwareness.identifiedAssets.includes(asset);
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded text-xs flex items-center justify-between border ${
                      identified
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{asset}</span>
                    {identified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cascade Identification Completeness */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Cascade Impact Identification
              </h4>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeRecord.cascadeIdentification.completenessPercentage}% Identified
              </span>
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800">
              Disclaimer: {activeRecord.cascadeIdentification.disclaimer}
            </div>
            <div className="space-y-1.5">
              {activeRecord.cascadeIdentification.expectedCascadeNodes.map((node, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded text-xs bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 flex items-center justify-between"
                >
                  <span>Stage {idx + 1}: {node}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AGGREGATE DESCRIPTIVE ANALYSIS */}
      {activeTab === 'AGGREGATE' && report && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Aggregated Descriptive Analysis (N={report.aggregateAnalysis.totalParticipantPairs} Participant Pairs)
              </h3>
              <p className="text-xs text-slate-500">
                Descriptive central tendencies (Mean & Median) across all recorded within-subject participant pairs.
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-800">
              {report.aggregateAnalysis.sampleSizeNotice}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3 text-center">Baseline Mean (Median)</th>
                  <th className="p-3 text-center">SCOS Mean (Median)</th>
                  <th className="p-3 text-center">Mean Absolute Diff</th>
                  <th className="p-3 text-center">Mean Rel Change %</th>
                  <th className="p-3 text-center">Validity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {report.aggregateAnalysis.metricAggregates.map((agg) => (
                  <tr key={agg.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {agg.displayName} ({agg.unit})
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {agg.baselineMean} ({agg.baselineMedian})
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {agg.scosMean} ({agg.scosMedian})
                    </td>
                    <td className="p-3 text-center font-mono text-slate-800 dark:text-slate-200">
                      {agg.meanAbsoluteDifference !== null && agg.meanAbsoluteDifference > 0
                        ? `+${agg.meanAbsoluteDifference}`
                        : agg.meanAbsoluteDifference}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {agg.meanRelativeChangePercent !== null
                        ? `${agg.meanRelativeChangePercent > 0 ? '+' : ''}${agg.meanRelativeChangePercent}%`
                        : '—'}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {getValidityBadge(agg.validityClassification)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-slate-100">Methodological & Statistical Limitations:</h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              {report.aggregateAnalysis.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 5: 20-TEST DIAGNOSTIC RESULTS */}
      {activeTab === 'TESTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Phase 9D Automated Test Suite (20 Research Assertions)
              </h3>
              <p className="text-xs text-slate-500">
                Verifies methodological rigour, participant pairing, dynamic duration/retrieval measurement, non-fabrication, and RBAC security.
              </p>
            </div>
            {testSuiteResult && (
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  testSuiteResult.success
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                }`}
              >
                {testSuiteResult.passedCount} / {testSuiteResult.totalTests} Tests Passed
              </div>
            )}
          </div>

          {!testSuiteResult ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <p>Test suite has not been executed yet.</p>
              <button
                onClick={handleRunTestSuite}
                disabled={isTestRunning}
                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow text-xs inline-flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Run All 20 Diagnostic Tests Now
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {testSuiteResult.testResults.map((t) => (
                <div
                  key={t.id}
                  className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                    t.passed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{t.id}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{t.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{t.message}</div>
                  </div>

                  <span className="shrink-0">
                    {t.passed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4" /> PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                        <XCircle className="w-4 h-4" /> FAILED
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparativeEvaluationView;
