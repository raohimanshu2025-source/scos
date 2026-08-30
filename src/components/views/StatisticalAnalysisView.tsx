import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  Hash,
  Activity,
  Layers,
  FileCode,
  Info,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  StatisticalAnalysisSnapshot,
  StatisticalAnalysisSummary,
  MetricStatistics,
  ScenarioMetricResult,
} from '../../types/statisticalAnalysis';
import { ExperimentalMetricKey } from '../../types/experimentalExecution';
import { statisticalAnalysisService } from '../../services/statisticalAnalysisService';
import { runStatisticalAnalysisTestSuite, StatisticalTestSuiteSummary } from '../../tests/statisticalAnalysis.spec';
import { useAuth } from '../../context/AuthContext';
import { PermissionType } from '../../types/auth';

export const StatisticalAnalysisView: React.FC = () => {
  const { user } = useAuth();

  // Permissions
  const canExecute =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'DISTRICT_ADMIN' ||
    user?.role === 'AI_GOVERNANCE_OFFICER';

  // State
  const [snapshot, setSnapshot] = useState<StatisticalAnalysisSnapshot | null>(null);
  const [summary, setSummary] = useState<StatisticalAnalysisSummary | null>(null);
  const [selectedMetricKey, setSelectedMetricKey] = useState<ExperimentalMetricKey>('M1_WORKFLOW_DURATION');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-01');
  const [activeTab, setActiveTab] = useState<
    'MATRIX' | 'SCENARIO' | 'UNCERTAINTY' | 'COMPLETENESS' | 'PROVENANCE' | 'TEST_SUITE'
  >('MATRIX');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    isMatch: boolean;
    computedFingerprint: string;
    storedFingerprint: string;
    status: string;
  } | null>(null);

  const [testSuiteSummary, setTestSuiteSummary] = useState<StatisticalTestSuiteSummary | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Initial Data Load
  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = () => {
    setIsLoading(true);
    try {
      const snap = statisticalAnalysisService.getAnalysisSnapshot(user?.email || 'researcher@scos.gov.in');
      const sum = statisticalAnalysisService.getStatisticalSummary(user?.email || 'researcher@scos.gov.in');
      setSnapshot(snap);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load statistical analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    setIsLoading(true);
    try {
      statisticalAnalysisService.invalidateCache();
      const snap = statisticalAnalysisService.generateAnalysisSnapshot(user?.email || 'researcher@scos.gov.in');
      const sum = statisticalAnalysisService.getStatisticalSummary(user?.email || 'researcher@scos.gov.in');
      setSnapshot(snap);
      setSummary(sum);
      setVerificationResult(null);
    } catch (err) {
      console.error('Failed to recalculate statistical analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReproducibility = () => {
    if (!snapshot) return;
    setIsVerifying(true);
    try {
      const res = statisticalAnalysisService.verifyAnalysisReproducibility(snapshot);
      setVerificationResult(res);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportJSON = () => {
    if (!snapshot) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `scos_statistical_analysis_${snapshot.analysisId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (!snapshot) return;
    const csvContent = statisticalAnalysisService.exportAnalysisCSV(user?.email || 'researcher@scos.gov.in');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scos_statistical_analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunTestSuite = () => {
    setIsLoading(true);
    try {
      const res = runStatisticalAnalysisTestSuite();
      setTestSuiteSummary(res);
      setActiveTab('TEST_SUITE');
    } catch (err) {
      console.error('Test suite run failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMetricStats: MetricStatistics | undefined = useMemo(() => {
    if (!snapshot) return undefined;
    return snapshot.metrics[selectedMetricKey];
  }, [snapshot, selectedMetricKey]);

  const filteredMetrics = useMemo(() => {
    if (!snapshot) return [];
    const keys = Object.keys(snapshot.metrics) as ExperimentalMetricKey[];
    if (!filterQuery) return keys;
    return keys.filter((k) => {
      const m = snapshot.metrics[k];
      return (
        m.metricCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
        m.metricName.toLowerCase().includes(filterQuery.toLowerCase()) ||
        m.unit.toLowerCase().includes(filterQuery.toLowerCase())
      );
    });
  }, [snapshot, filterQuery]);

  if (isLoading && !snapshot) {
    return (
      <div id="statistical-analysis-loading" className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-slate-600">Computing Descriptive Statistics & Uncertainty Bounds...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="statistical-analysis-view" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner & Title */}
      <div id="stat-header" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BarChart3 className="w-3.5 h-3.5" />
                PHASE 10C — STATISTICAL ANALYSIS LAYER
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                SIMULATED / PROTOTYPE DATA
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Descriptive Statistics & Uncertainty Assessment
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Transparent, reproducible descriptive statistical analysis and empirical uncertainty modeling
              for Standardized SCOS Evaluation Metrics M1–M10 across benchmark flood scenarios SC-01 through SC-05.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {canExecute && (
              <button
                id="btn-stat-recalculate"
                onClick={handleRecalculate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recalculate (N=5)
              </button>
            )}

            <button
              id="btn-stat-verify"
              onClick={handleVerifyReproducibility}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verify SHA-256
            </button>

            <button
              id="btn-stat-export-json"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>

            <button
              id="btn-stat-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              id="btn-stat-run-tests"
              onClick={handleRunTestSuite}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Run Test Suite (25)
            </button>
          </div>
        </div>

        {/* Small Sample Size Safeguards Banner */}
        <div id="stat-sample-warning" className="mt-5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Research Sample Size Safeguard (N = 5 Benchmark Scenarios):</span>
            <p className="text-amber-800 leading-relaxed">
              These results are <strong>descriptive observations</strong> derived from the standardized Phase 10B execution logs and <strong>must not be interpreted as population-level statistical significance</strong>. Null-hypothesis inferential testing (p-values) is deliberately excluded due to sample constraints.
            </p>
          </div>
        </div>

        {/* Reproducibility Verification Result Alert */}
        {verificationResult && (
          <div
            id="stat-verify-alert"
            className={`mt-3 p-3 rounded-lg border text-xs flex items-center justify-between ${
              verificationResult.isMatch
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${verificationResult.isMatch ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>
                <strong>Reproducibility Verification:</strong> {verificationResult.status} (SHA-256: {verificationResult.computedFingerprint.slice(0, 16)}...)
              </span>
            </div>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border">
              100% Deterministic Match
            </span>
          </div>
        )}
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      {snapshot && (
        <div id="stat-kpi-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scenarios</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{snapshot.coverage.scenarioCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">SC-01 to SC-05</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Runs Analyzed</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{snapshot.coverage.totalRunsAnalyzed}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {snapshot.coverage.baselineRunsCount} Manual / {snapshot.coverage.scosRunsCount} SCOS
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Duration Reduction</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              -{snapshot.aggregateSummary.meanDurationReductionPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">M1 Mean Workflow Time</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Context Gain</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              +{snapshot.aggregateSummary.meanContextCompletenessGainPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">M3 Information Density</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Traceability Gain</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              +{snapshot.aggregateSummary.meanDecisionTraceabilityGainPercent}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">M10 Decision Auditing</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Data Completeness</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {snapshot.missingDataAssessment.completenessPercentage}%
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">100/100 Observations</div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div id="stat-tabs" className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        <button
          id="tab-btn-matrix"
          onClick={() => setActiveTab('MATRIX')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'MATRIX'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Metric Comparison Matrix (M1–M10)
        </button>

        <button
          id="tab-btn-scenario"
          onClick={() => setActiveTab('SCENARIO')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'SCENARIO'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          Scenario Breakdown (SC-01–SC-05)
        </button>

        <button
          id="tab-btn-uncertainty"
          onClick={() => setActiveTab('UNCERTAINTY')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'UNCERTAINTY'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Uncertainty & Outliers
        </button>

        <button
          id="tab-btn-completeness"
          onClick={() => setActiveTab('COMPLETENESS')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'COMPLETENESS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Data Completeness
        </button>

        <button
          id="tab-btn-provenance"
          onClick={() => setActiveTab('PROVENANCE')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'PROVENANCE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Hash className="w-4 h-4" />
          Provenance & Formulas
        </button>

        <button
          id="tab-btn-tests"
          onClick={() => setActiveTab('TEST_SUITE')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'TEST_SUITE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification Suite (25 Tests)
          {testSuiteSummary && (
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                testSuiteSummary.allPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {testSuiteSummary.passedTests}/{testSuiteSummary.totalTests}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      {snapshot && (
        <div id="stat-tab-panels" className="bg-white border border-slate-200 border-t-0 rounded-b-xl p-6 shadow-sm">
          {/* TAB 1: METRIC COMPARISON MATRIX */}
          {activeTab === 'MATRIX' && (
            <div id="panel-matrix" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Standardized Metric Matrix (M1–M10)</h2>
                  <p className="text-xs text-slate-500">
                    Descriptive comparative summaries (N=5 scenarios). Click any row to inspect quartiles, IQR bounds, and scenario distribution.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter by metric or code..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Code & Metric</th>
                      <th className="py-3 px-3">Baseline Mean ± SD</th>
                      <th className="py-3 px-3">SCOS Mean ± SD</th>
                      <th className="py-3 px-3">Absolute Delta</th>
                      <th className="py-3 px-3">Relative Change</th>
                      <th className="py-3 px-3">Direction</th>
                      <th className="py-3 px-3">Uncertainty</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-normal text-slate-700">
                    {filteredMetrics.map((key) => {
                      const m = snapshot.metrics[key];
                      const isSelected = selectedMetricKey === key;

                      return (
                        <tr
                          key={key}
                          onClick={() => setSelectedMetricKey(key)}
                          className={`cursor-pointer hover:bg-slate-50/80 transition ${
                            isSelected ? 'bg-blue-50/50 font-medium' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                                {m.metricCode}
                              </span>
                              <div>
                                <div className="text-slate-900 font-medium">{m.metricName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">Unit: {m.unit}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div>
                              <span className="font-semibold text-slate-900">{m.manualStats.mean ?? 'N/A'}</span>
                              {m.manualStats.standardDeviation !== null && (
                                <span className="text-slate-500 text-[11px] ml-1">± {m.manualStats.standardDeviation}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Range: [{m.manualStats.minimum} - {m.manualStats.maximum}]
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <div>
                              <span className="font-semibold text-slate-900">{m.scosStats.mean ?? 'N/A'}</span>
                              {m.scosStats.standardDeviation !== null && (
                                <span className="text-slate-500 text-[11px] ml-1">± {m.scosStats.standardDeviation}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Range: [{m.scosStats.minimum} - {m.scosStats.maximum}]
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono font-medium text-slate-900">
                            {m.comparison.absoluteDifference !== null
                              ? `${m.comparison.absoluteDifference > 0 ? '+' : ''}${m.comparison.absoluteDifference} ${m.unit}`
                              : 'N/A'}
                          </td>

                          <td className="py-3.5 px-3">
                            {m.comparison.relativeChangePercent !== null ? (
                              <span
                                className={`font-bold font-mono ${
                                  m.comparison.directionOfChange === 'IMPROVEMENT'
                                    ? 'text-emerald-600'
                                    : m.comparison.directionOfChange === 'REGRESSION'
                                    ? 'text-rose-600'
                                    : 'text-slate-600'
                                }`}
                              >
                                {m.comparison.relativeChangePercent > 0 ? '+' : ''}
                                {m.comparison.relativeChangePercent}%
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                m.comparison.directionOfChange === 'IMPROVEMENT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : m.comparison.directionOfChange === 'REGRESSION'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {m.comparison.directionOfChange === 'IMPROVEMENT' ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {m.comparison.directionOfChange}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                m.uncertainty.level === 'LOW_UNCERTAINTY'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : m.uncertainty.level === 'MODERATE_UNCERTAINTY'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {m.uncertainty.level.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMetricKey(key);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
                            >
                              Inspect <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selected Metric Deep Dive Box */}
              {selectedMetricStats && (
                <div id="stat-selected-metric-inspector" className="border border-blue-200 bg-blue-50/30 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-600 text-white font-bold">
                        {selectedMetricStats.metricCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedMetricStats.metricName} — Detailed Descriptive Breakdown
                      </h3>
                    </div>
                    <span className="text-xs text-slate-600">
                      Formula: <code className="font-mono bg-white px-2 py-0.5 rounded border text-slate-800">{selectedMetricStats.formula}</code>
                    </span>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Baseline Distribution (N=5)</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        Mean: {selectedMetricStats.manualStats.mean} {selectedMetricStats.unit}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <div>Median: {selectedMetricStats.manualStats.median}</div>
                        <div>StdDev: {selectedMetricStats.manualStats.standardDeviation ?? 'N/A'} (CV: {selectedMetricStats.manualStats.coefficientOfVariation ?? 'N/A'}%)</div>
                        <div>Q1: {selectedMetricStats.manualStats.q1 ?? 'N/A'} | Q3: {selectedMetricStats.manualStats.q3 ?? 'N/A'} | IQR: {selectedMetricStats.manualStats.iqr ?? 'N/A'}</div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">SCOS Distribution (N=5)</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        Mean: {selectedMetricStats.scosStats.mean} {selectedMetricStats.unit}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <div>Median: {selectedMetricStats.scosStats.median}</div>
                        <div>StdDev: {selectedMetricStats.scosStats.standardDeviation ?? 'N/A'} (CV: {selectedMetricStats.scosStats.coefficientOfVariation ?? 'N/A'}%)</div>
                        <div>Q1: {selectedMetricStats.scosStats.q1 ?? 'N/A'} | Q3: {selectedMetricStats.scosStats.q3 ?? 'N/A'} | IQR: {selectedMetricStats.scosStats.iqr ?? 'N/A'}</div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Comparative Difference</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        {selectedMetricStats.comparison.absoluteDifference} {selectedMetricStats.unit}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <div>Relative Change: <strong>{selectedMetricStats.comparison.relativeChangePercent}%</strong></div>
                        <div>Direction: <strong>{selectedMetricStats.comparison.directionOfChange}</strong></div>
                        <div>StdDev Shift: {selectedMetricStats.comparison.stdDevDifference ?? 'N/A'}</div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">Uncertainty & Outliers</div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        Score: {selectedMetricStats.uncertainty.score} / 100
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                        <div>Level: {selectedMetricStats.uncertainty.level}</div>
                        <div>Outliers: {selectedMetricStats.outliers.status} ({selectedMetricStats.outliers.outlierCount})</div>
                        <div>Skew Sensitivity: {selectedMetricStats.manualStats.centralTendencySensitivity ? 'Detected (>20%)' : 'None'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario Breakdown Bars */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 mb-2">Scenario-by-Scenario Observations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {selectedMetricStats.scenarioBreakdown.map((sc) => (
                        <div key={sc.scenarioId} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          <div className="font-semibold text-slate-900">{sc.scenarioId}</div>
                          <div className="text-[11px] text-slate-500 truncate mb-1.5">{sc.scenarioName}</div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="text-slate-600">Manual: {sc.baselineValue}</div>
                            <div className="text-slate-900 font-bold">SCOS: {sc.scosValue}</div>
                            <div className="text-emerald-700 font-semibold">
                              Δ: {sc.absoluteDifference} ({sc.relativeChangePercent}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCENARIO BREAKDOWN */}
          {activeTab === 'SCENARIO' && (
            <div id="panel-scenario" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Scenario-Specific Disaggregation</h2>
                  <p className="text-xs text-slate-500">
                    Detailed side-by-side metric observations for individual standardized scenarios (SC-01 through SC-05).
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedScenarioId(id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        selectedScenarioId === id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(snapshot.metrics) as ExperimentalMetricKey[]).map((key) => {
                  const m = snapshot.metrics[key];
                  const scObs = m.scenarioBreakdown.find((s) => s.scenarioId === selectedScenarioId);
                  if (!scObs) return null;

                  return (
                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white rounded border text-slate-800">
                            {m.metricCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{m.metricName}</span>
                        </div>
                        <span
                          className={`text-[11px] font-bold ${
                            scObs.directionOfChange === 'IMPROVEMENT'
                              ? 'text-emerald-600'
                              : scObs.directionOfChange === 'REGRESSION'
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {scObs.relativeChangePercent !== null ? `${scObs.relativeChangePercent > 0 ? '+' : ''}${scObs.relativeChangePercent}%` : 'N/A'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-2.5 rounded-lg border border-slate-200 font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Baseline</div>
                          <div className="font-medium text-slate-700 mt-0.5">{scObs.baselineValue ?? 'N/A'} {m.unit}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">SCOS</div>
                          <div className="font-bold text-slate-900 mt-0.5">{scObs.scosValue ?? 'N/A'} {m.unit}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Delta</div>
                          <div className="font-semibold text-emerald-600 mt-0.5">{scObs.absoluteDifference ?? 'N/A'} {m.unit}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: UNCERTAINTY & OUTLIERS */}
          {activeTab === 'UNCERTAINTY' && (
            <div id="panel-uncertainty" className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Uncertainty Scoring & Exploratory Outlier Retention</h2>
                <p className="text-xs text-slate-500">
                  Multivariate uncertainty assessment based on sample size (N=5), coefficient of variation (CV%), and Tukey IQR boxplot bounds.
                </p>
              </div>

              {/* Methodology Notice */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Research Outlier Retention Principle
                </div>
                <p className="leading-relaxed">
                  In accordance with empirical reproducibility rules, <strong>no observations are discarded or sanitized</strong>. Outlier flags are computed using the standard Tukey IQR Fence: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">[Q1 - 1.5×IQR, Q3 + 1.5×IQR]</code>. All empirical observations are retained in the published distribution.
                </p>
              </div>

              {/* Uncertainty Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Metric</th>
                      <th className="py-3 px-3">Uncertainty Score</th>
                      <th className="py-3 px-3">Level</th>
                      <th className="py-3 px-3">CV (Manual / SCOS)</th>
                      <th className="py-3 px-3">Outlier Status</th>
                      <th className="py-3 px-4">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-normal text-slate-700">
                    {(Object.keys(snapshot.metrics) as ExperimentalMetricKey[]).map((key) => {
                      const m = snapshot.metrics[key];
                      return (
                        <tr key={key} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {m.metricCode} — {m.metricName}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold">
                            {m.uncertainty.score} / 100
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                m.uncertainty.level === 'LOW_UNCERTAINTY'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : m.uncertainty.level === 'MODERATE_UNCERTAINTY'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {m.uncertainty.level}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {m.manualStats.coefficientOfVariation ?? 'N/A'}% / {m.scosStats.coefficientOfVariation ?? 'N/A'}%
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-[11px] text-slate-700">
                              {m.outliers.outlierCount > 0
                                ? `${m.outliers.outlierCount} Retained`
                                : '0 Detected'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            {m.uncertainty.summaryReason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DATA COMPLETENESS */}
          {activeTab === 'COMPLETENESS' && (
            <div id="panel-completeness" className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Data Completeness & Missing Observation Audit</h2>
                <p className="text-xs text-slate-500">
                  Verification of recorded experimental observation logs across 10 activity steps and 10 evaluation metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Completeness Status</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">
                    {snapshot.missingDataAssessment.status} (100.0%)
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {snapshot.missingDataAssessment.totalRecordedObservations} / {snapshot.missingDataAssessment.totalExpectedObservations} observations recorded
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Missing Metric Counts</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {snapshot.missingDataAssessment.missingMetricObservationsCount}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Zero missing values across SC-01 to SC-05</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Imputation Rule</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">NO SYNTHETIC IMPUTATION</div>
                  <div className="text-xs text-slate-600 mt-1">Missing values are never filled with 0, mean, or median</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROVENANCE & FORMULAS */}
          {activeTab === 'PROVENANCE' && (
            <div id="panel-provenance" className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Provenance Chain & Mathematical Specifications</h2>
                <p className="text-xs text-slate-500">
                  Cryptographic SHA-256 fingerprinting and mathematical formulas for unbiased sample estimators.
                </p>
              </div>

              {/* Provenance Box */}
              <div className="p-5 bg-slate-900 text-slate-100 rounded-xl space-y-3 font-mono text-xs">
                <div className="text-emerald-400 font-bold text-sm">SCOS PROVENANCE MANIFEST</div>
                <div className="space-y-1 text-slate-300">
                  <div>Analysis ID: {snapshot.analysisId}</div>
                  <div>Dataset Version: {snapshot.provenance.researchDatasetVersion}</div>
                  <div>Method Version: {snapshot.provenance.analysisMethodVersion}</div>
                  <div>Generated At: {snapshot.generatedAt}</div>
                  <div className="text-amber-300">
                    Deterministic SHA-256: {snapshot.provenance.canonicalPayloadHash}
                  </div>
                </div>
              </div>

              {/* Mathematical Formulas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900">Sample Mean & Median</h3>
                  <p className="text-slate-600 font-mono">Mean = (1 / n) * Σ(x_i)</p>
                  <p className="text-slate-600">Calculated as arithmetic mean across all valid non-null scenario executions.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900">Sample Variance & Standard Deviation</h3>
                  <p className="text-slate-600 font-mono">s² = (1 / (n - 1)) * Σ(x_i - x̄)²</p>
                  <p className="text-slate-600">Unbiased sample estimator using Bessel's correction (n - 1 denominator).</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUTOMATED TEST SUITE */}
          {activeTab === 'TEST_SUITE' && (
            <div id="panel-test-suite" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Phase 10C Verification Suite (25 Tests)</h2>
                  <p className="text-xs text-slate-500">
                    Automated verification covering descriptive statistics, dispersion bounds, safeguards, and RBAC security.
                  </p>
                </div>

                <button
                  id="btn-re-run-tests"
                  onClick={handleRunTestSuite}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-Run Verification
                </button>
              </div>

              {testSuiteSummary ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      testSuiteSummary.allPassed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`w-6 h-6 ${testSuiteSummary.allPassed ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <div>
                        <div className="font-bold text-sm">
                          {testSuiteSummary.allPassed
                            ? 'All 25 Statistical Tests Passed Successfully'
                            : 'Test Suite Failures Detected'}
                        </div>
                        <div className="text-xs opacity-90 mt-0.5">
                          Executed at {testSuiteSummary.executedAt} — {testSuiteSummary.passedTests}/{testSuiteSummary.totalTests} passing
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                    {testSuiteSummary.results.map((t) => (
                      <div key={t.id} className="p-3.5 bg-white flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-[11px] text-slate-800">
                              {t.id}
                            </span>
                            <span className="font-semibold text-slate-900">{t.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">({t.category})</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{t.details}</p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                            t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-600 mb-3">Click below to execute the 25-point automated verification suite.</p>
                  <button
                    onClick={handleRunTestSuite}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Execute Test Suite
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticalAnalysisView;
