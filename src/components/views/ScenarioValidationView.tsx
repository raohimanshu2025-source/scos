// =========================================================================
// SCOS PHASE 9C — SCENARIO VALIDATION & MODEL CALIBRATION VIEW
// Controlled Research Validation Dashboard for Urban Digital Twin Engine
// =========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sliders,
  Layers,
  FileText,
  Activity,
  GitBranch,
  Building2,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import {
  ScenarioValidationCase,
  ScenarioValidationInput,
  ScenarioValidationOutput,
  ScenarioComparisonResult,
  ScenarioValidationReport,
  CalibrationParameter,
  CalibrationAssumption,
  ValidationCriterion,
  ValidationMetricSummary,
} from '../../types/scenarioValidation';

export const ScenarioValidationView: React.FC = () => {
  const { user } = useAuth();

  // State Management
  const [cases, setCases] = useState<ScenarioValidationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('VC-04');
  const [currentOutput, setCurrentOutput] = useState<ScenarioValidationOutput | null>(null);
  const [comparison, setComparison] = useState<ScenarioComparisonResult | null>(null);
  const [report, setReport] = useState<ScenarioValidationReport | null>(null);
  const [calibrationParams, setCalibrationParams] = useState<CalibrationParameter[]>([]);
  const [assumptions, setAssumptions] = useState<CalibrationAssumption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CRITERIA' | 'COMPARISON' | 'ASSUMPTIONS' | 'REPORT'>('OVERVIEW');

  // Calibrated Input Overrides
  const [inputOverrides, setInputOverrides] = useState<Partial<ScenarioValidationInput>>({
    rainfallIntensityMmPerHour: 80,
    pumpCapacityReductionPercent: 100,
    drainageCapacityReductionPercent: 80,
    trafficVolumeMultiplier: 2.0,
    restorationTimeHours: 6.0,
  });

  // Automated Test Suite State
  const [isRunningTestSuite, setIsRunningTestSuite] = useState<boolean>(false);
  const [testSuiteResults, setTestSuiteResults] = useState<{
    success: boolean;
    totalTests: number;
    passedCount: number;
    failedCount: number;
    executedAt: string;
    testResults: Array<{ id: string; title: string; passed: boolean; message: string }>;
  } | null>(null);

  // Load initial registry and calibration data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [casesData, paramsData] = await Promise.all([
        apiClient.getScenarioValidationCases(),
        apiClient.getCalibrationParameters(),
      ]);

      setCases(casesData);
      setCalibrationParams(paramsData.parameters || []);
      setAssumptions(paramsData.assumptions || []);

      if (casesData.length > 0) {
        const defaultCase = casesData.find((c) => c.validationCaseId === 'VC-04') || casesData[0];
        setSelectedCaseId(defaultCase.validationCaseId);
        await executeValidationRun(defaultCase.validationCaseId);
      }
    } catch (err) {
      console.error('Failed to load validation initial state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    const selectedCase = cases.find((c) => c.validationCaseId === caseId);
    if (selectedCase) {
      setInputOverrides({
        rainfallIntensityMmPerHour: selectedCase.inputParameters.rainfallIntensityMmPerHour,
        pumpCapacityReductionPercent: selectedCase.inputParameters.pumpCapacityReductionPercent,
        drainageCapacityReductionPercent: selectedCase.inputParameters.drainageCapacityReductionPercent,
        trafficVolumeMultiplier: selectedCase.inputParameters.trafficVolumeMultiplier,
        restorationTimeHours: selectedCase.inputParameters.restorationTimeHours,
      });
    }
    await executeValidationRun(caseId);
  };

  const executeValidationRun = async (caseId: string, customOverrides?: Partial<ScenarioValidationInput>) => {
    setIsExecuting(true);
    try {
      const overridesToUse = customOverrides || inputOverrides;
      const [outputData, compData, reportData] = await Promise.all([
        apiClient.runScenarioValidation(caseId, overridesToUse),
        apiClient.compareScenarioValidation(caseId),
        apiClient.getScenarioValidationReport(caseId),
      ]);

      setCurrentOutput(outputData);
      setComparison(compData);
      setReport(reportData);
    } catch (err) {
      console.error('Validation run failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunAutomatedTestSuite = async () => {
    setIsRunningTestSuite(true);
    try {
      const res = await apiClient.runScenarioValidationTestSuite();
      setTestSuiteResults(res);
    } catch (err) {
      console.error('Test suite failed:', err);
    } finally {
      setIsRunningTestSuite(false);
    }
  };

  const selectedCase = useMemo(
    () => cases.find((c) => c.validationCaseId === selectedCaseId) || cases[0],
    [cases, selectedCaseId]
  );

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'VALIDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VALIDATED (PASS)
          </span>
        );
      case 'REQUIRES_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/80">
            <AlertTriangle className="w-3.5 h-3.5" />
            REQUIRES REVIEW
          </span>
        );
      case 'FAIL':
      case 'FAILED_VALIDATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/80">
            <XCircle className="w-3.5 h-3.5" />
            FAIL (ANOMALY)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-4 p-8">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-medium tracking-wide">
          Initializing SCOS Controlled Scenario Validation Framework & Digital Twin Baseline...
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Evaluating Deterministic Topological Invariants (VC-01 through VC-07)
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6 font-sans">
      {/* 1. RESEARCH & PROTOTYPE DISCLAIMER BANNER */}
      <div
        id="scos-validation-disclaimer-banner"
        className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-indigo-950/40 p-4 sm:p-5 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                PHASE 9C RESEARCH VALIDATION
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                SIMULATED / PROTOTYPE DATA
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Engine: v9.3-RESEARCH | Snapshot: SNAP-KANPUR-CIVIL-2026-Q3
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-indigo-400" />
              SCOS Scenario Validation & Model Calibration Framework
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Controlled research validation framework evaluating internal topological consistency,
              severity monotonicity, spatial cascade plausibility, deterministic reproducibility, and
              multi-agency response mapping across the Kanpur Urban Digital Twin model.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="run-validation-test-suite-btn"
              onClick={handleRunAutomatedTestSuite}
              disabled={isRunningTestSuite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors disabled:opacity-50"
            >
              {isRunningTestSuite ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Run Complete Test Suite (16 Tests)
            </button>
          </div>
        </div>

        {/* Boundary Notice Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>Scientific Boundary Notice:</strong> Validation results assess internal model
              consistency and prototype behaviour; they do not establish real-world predictive
              accuracy or replace municipal civil engineering surveys.
            </span>
          </div>
          <div className="text-slate-500 font-mono">
            User: {user?.email || 'officer@scos.kanpur.gov.in'} | Observational Mode
          </div>
        </div>
      </div>

      {/* 2. AUTOMATED TEST SUITE HARNESS DRAWER (IF EXECUTED) */}
      {testSuiteResults && (
        <div
          id="scos-validation-test-suite-drawer"
          className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck
                className={`w-5 h-5 ${
                  testSuiteResults.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Phase 9C Test Harness Execution Results (
                {testSuiteResults.passedCount}/{testSuiteResults.totalTests} Passed)
              </h3>
            </div>
            <button
              onClick={() => setTestSuiteResults(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close Diagnostics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {testSuiteResults.testResults.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  t.passed
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span>{t.id}</span>
                  <span>{t.passed ? 'PASS' : 'FAIL'}</span>
                </div>
                <div className="font-medium text-slate-200">{t.title}</div>
                <div className="text-slate-400 text-[11px] font-mono leading-tight">{t.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CASE REGISTRY SELECTOR (VC-01 to VC-07) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Controlled Research Scenario Suite (VC-01 to VC-07)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Click scenario to calibrate & inspect graph propagation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {cases.map((c) => {
            const isSelected = c.validationCaseId === selectedCaseId;
            const severityColor =
              c.severityLevel === 'CRITICAL'
                ? 'border-rose-500/50 bg-rose-950/20 text-rose-300'
                : c.severityLevel === 'HIGH'
                ? 'border-amber-500/50 bg-amber-950/20 text-amber-300'
                : c.severityLevel === 'MEDIUM'
                ? 'border-sky-500/50 bg-sky-950/20 text-sky-300'
                : 'border-slate-700 bg-slate-900/40 text-slate-300';

            return (
              <button
                key={c.validationCaseId}
                id={`val-case-card-${c.validationCaseId.toLowerCase()}`}
                onClick={() => handleSelectCase(c.validationCaseId)}
                className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold font-mono text-indigo-400">
                      {c.validationCaseId}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${severityColor}`}
                    >
                      {c.severityLevel}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                    {c.scenarioName}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                  <span className="truncate max-w-[120px]">{c.targetEntityName.split(' ')[0]}</span>
                  <span className="font-mono text-indigo-300">
                    {c.inputParameters.rainfallIntensityMmPerHour}mm/h
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN WORKSPACE: CONTROLLED INPUTS + TABBED ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONTROLLED INPUT & CALIBRATION PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div
            id="scos-calibration-control-panel"
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Controlled Model Parameters
                </h3>
              </div>
              <button
                onClick={() =>
                  executeValidationRun(selectedCaseId, {
                    rainfallIntensityMmPerHour: selectedCase.inputParameters.rainfallIntensityMmPerHour,
                    pumpCapacityReductionPercent: selectedCase.inputParameters.pumpCapacityReductionPercent,
                    drainageCapacityReductionPercent: selectedCase.inputParameters.drainageCapacityReductionPercent,
                    trafficVolumeMultiplier: selectedCase.inputParameters.trafficVolumeMultiplier,
                    restorationTimeHours: selectedCase.inputParameters.restorationTimeHours,
                  })
                }
                className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1"
                title="Reset to scenario defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Rain Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Precipitation Intensity</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {inputOverrides.rainfallIntensityMmPerHour} mm/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={inputOverrides.rainfallIntensityMmPerHour || 0}
                  onChange={(e) =>
                    setInputOverrides((prev) => ({
                      ...prev,
                      rainfallIntensityMmPerHour: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Prototype modelling parameter — not a real-time municipal measurement.
                </p>
              </div>

              {/* Pump Reduction Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Pump Capacity Reduction</span>
                  <span className="font-mono font-bold text-rose-400">
                    {inputOverrides.pumpCapacityReductionPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={inputOverrides.pumpCapacityReductionPercent || 0}
                  onChange={(e) =>
                    setInputOverrides((prev) => ({
                      ...prev,
                      pumpCapacityReductionPercent: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Prototype modelling parameter — not a real-time municipal measurement.
                </p>
              </div>

              {/* Drain Reduction Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Drainage Trunk Siltation Loss</span>
                  <span className="font-mono font-bold text-amber-400">
                    {inputOverrides.drainageCapacityReductionPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={inputOverrides.drainageCapacityReductionPercent || 0}
                  onChange={(e) =>
                    setInputOverrides((prev) => ({
                      ...prev,
                      drainageCapacityReductionPercent: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Prototype modelling parameter — not a real-time municipal measurement.
                </p>
              </div>

              {/* Traffic Multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Traffic Friction Multiplier</span>
                  <span className="font-mono font-bold text-sky-400">
                    {inputOverrides.trafficVolumeMultiplier}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={inputOverrides.trafficVolumeMultiplier || 1.0}
                  onChange={(e) =>
                    setInputOverrides((prev) => ({
                      ...prev,
                      trafficVolumeMultiplier: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Prototype modelling parameter — not a real-time municipal measurement.
                </p>
              </div>

              {/* Restoration Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Restoration Horizon (MTTR)</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {inputOverrides.restorationTimeHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={inputOverrides.restorationTimeHours || 4}
                  onChange={(e) =>
                    setInputOverrides((prev) => ({
                      ...prev,
                      restorationTimeHours: Number(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Prototype modelling parameter — not a real-time municipal measurement.
                </p>
              </div>

              <button
                onClick={() => executeValidationRun(selectedCaseId, inputOverrides)}
                disabled={isExecuting}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow"
              >
                {isExecuting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5" />
                )}
                Re-evaluate Scenario Validation
              </button>
            </div>
          </div>

          {/* Model Limitations Notice Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Observational Boundary & Limitations
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Simulation Classification:</strong> Outputs reflect mathematical graph
                heuristics, not live SCADA or telemetry sensors.
              </li>
              <li>
                <strong>Zero Autonomous Control:</strong> System possesses no authority to actuate
                physical hardware or dispatch personnel.
              </li>
              <li>
                <strong>Human Decision Mandate:</strong> All tactical mitigation plans require
                explicit human officer authorization.
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: TABBED RESEARCH WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'OVERVIEW'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Cascade & Impact Overview
            </button>
            <button
              onClick={() => setActiveTab('CRITERIA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'CRITERIA'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Validation Criteria (7 Benchmarks)
            </button>
            <button
              onClick={() => setActiveTab('COMPARISON')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'COMPARISON'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Baseline vs Scenario Delta
            </button>
            <button
              onClick={() => setActiveTab('ASSUMPTIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ASSUMPTIONS'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Engineering Assumptions
            </button>
            <button
              onClick={() => setActiveTab('REPORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'REPORT'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Full Research Report
            </button>
          </div>

          {/* TAB CONTENT A: CASCADE & IMPACT OVERVIEW */}
          {activeTab === 'OVERVIEW' && currentOutput && (
            <div className="space-y-4">
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Validation Status</div>
                  <div>{renderStatusBadge(currentOutput.validationResult.overallStatus)}</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Cascade Propagation</div>
                  <div className="text-base font-bold font-mono text-white">
                    {currentOutput.simulationResult.cascadeSteps.length} Stages
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Agencies Mobilized</div>
                  <div className="text-base font-bold font-mono text-indigo-300">
                    {currentOutput.simulationResult.affectedDepartments.length} Departments
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">Critical Facilities</div>
                  <div className="text-base font-bold font-mono text-rose-300">
                    {currentOutput.simulationResult.criticalFacilitiesAtRisk.length} Threatened
                  </div>
                </div>
              </div>

              {/* Cascade Progression Tree */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  Topological Cascade Progression Trace
                </h4>

                <div className="space-y-2.5">
                  {currentOutput.simulationResult.cascadeSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 flex items-center justify-center font-mono font-bold shrink-0">
                          {step.stepNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{step.entityName}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {step.stage}
                            </span>
                            <span className="text-[10px] font-mono text-rose-400">
                              {step.simulatedStatus}
                            </span>
                          </div>
                          <p className="text-slate-400 mt-1">{step.impactDescription}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                        <div>T+{step.timeToImpactMinutes} min</div>
                        <div className="text-indigo-400">
                          Confidence: {(step.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Facilities & Multi-Agency Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Critical Facilities */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-rose-400" />
                    Critical Facilities at Risk
                  </h4>
                  <div className="space-y-2">
                    {currentOutput.simulationResult.criticalFacilitiesAtRisk.map((fac) => (
                      <div
                        key={fac.facilityId}
                        className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{fac.facilityName}</span>
                          <span className="text-rose-400 text-[10px] font-mono">
                            {fac.threatLevel}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{fac.threatDescription}</p>
                        <div className="text-[10px] font-mono text-slate-500">
                          Distance: {fac.distanceFromEpicenterMeters}m | Access: {fac.accessRouteStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agencies Mobilized */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    Statutory Multi-Agency Response
                  </h4>
                  <div className="space-y-2">
                    {currentOutput.simulationResult.affectedDepartments.map((dept) => (
                      <div
                        key={dept.departmentCode}
                        className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>
                            [{dept.departmentCode}] {dept.departmentName}
                          </span>
                          <span className="text-indigo-400 text-[10px] font-mono">
                            {dept.role}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{dept.taskSummary}</p>
                        <div className="text-[10px] font-mono text-slate-500">
                          Priority: {dept.mobilizationPriority} | Units:{' '}
                          {dept.recommendedAssetUnits.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT B: VALIDATION CRITERIA TABLE (7 BENCHMARKS) */}
          {activeTab === 'CRITERIA' && currentOutput && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Formal Research Criteria Evaluation ({currentOutput.validationResult.passedCount}/
                  {currentOutput.validationResult.totalEvaluated} Passed)
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Hash: {currentOutput.validationResult.reproducibilityHash.slice(0, 18)}
                </span>
              </div>

              <div className="space-y-3">
                {currentOutput.validationResult.criteria.map((crit) => (
                  <div
                    key={crit.criterionId}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-400">{crit.criterionId}</span>
                        <span className="font-bold text-white text-sm">{crit.title}</span>
                      </div>
                      <div>{renderStatusBadge(crit.status)}</div>
                    </div>

                    <p className="text-slate-400">{crit.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 font-semibold uppercase block text-[10px]">
                          Expected Behaviour:
                        </span>
                        <span className="text-slate-300">{crit.expectedBehaviour}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 font-semibold uppercase block text-[10px]">
                          Observed Behaviour:
                        </span>
                        <span className="text-slate-200">{crit.observedBehaviour}</span>
                      </div>
                    </div>

                    {crit.flaggedAnomaly && (
                      <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px] font-mono">
                        {crit.flaggedAnomaly}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT C: BASELINE VS SCENARIO DELTA */}
          {activeTab === 'COMPARISON' && comparison && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Modelled Difference: {comparison.baselineCaseId} vs {comparison.scenarioCaseId}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {comparison.terminologyNotice}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {comparison.classification}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
                    <span className="text-slate-400 font-medium">Impacted Assets Delta</span>
                    <div className="text-lg font-bold font-mono text-indigo-400">
                      +{comparison.modelledDifferences.impactedAssetDelta.deltaCount} Assets
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Baseline: {comparison.modelledDifferences.impactedAssetDelta.baselineCount} →
                      Scenario: {comparison.modelledDifferences.impactedAssetDelta.scenarioCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
                    <span className="text-slate-400 font-medium">Inundation Depth Delta</span>
                    <div className="text-lg font-bold font-mono text-rose-400">
                      +{comparison.modelledDifferences.estimatedOperationalImpactDelta.waterDepthCmDelta} cm
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Calculated head surcharge above civil baseline
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1">
                    <span className="text-slate-400 font-medium">Traffic Delay Delta</span>
                    <div className="text-lg font-bold font-mono text-amber-400">
                      +{comparison.modelledDifferences.estimatedOperationalImpactDelta.trafficDelayMinutesDelta} min
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Arterial transit impedance on Parade corridor
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 text-xs space-y-2">
                  <h5 className="font-semibold text-slate-200">Newly Mobilized Agencies</h5>
                  <div className="flex flex-wrap gap-2">
                    {comparison.modelledDifferences.affectedDepartmentDelta.newlyMobilizedDepts.map((d) => (
                      <span
                        key={d}
                        className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT D: ENGINEERING ASSUMPTIONS */}
          {activeTab === 'ASSUMPTIONS' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Documented Model Assumptions & Engineering Rationale
                </h4>

                <div className="space-y-3">
                  {assumptions.map((a) => (
                    <div
                      key={a.assumptionId}
                      className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-400">{a.assumptionId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {a.category}
                        </span>
                      </div>
                      <p className="font-medium text-slate-200">{a.description}</p>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Engineering Justification:</strong> {a.engineeringJustification}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Verification Method: {a.verificationMethod}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT E: FULL RESEARCH REPORT */}
          {activeTab === 'REPORT' && report && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-5 text-xs">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Research Validation Report: {report.validationCase.scenarioName}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Report ID: {report.reportId} | Generated:{' '}
                      {new Date(report.provenance.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>{renderStatusBadge(report.overallValidationStatus)}</div>
                </div>

                {/* Limitations */}
                <div className="p-3 rounded-lg border border-amber-900/50 bg-amber-950/20 text-amber-200 space-y-1.5">
                  <h5 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                    Model Assumptions & Formal Limitations
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {report.modelLimitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>

                {/* Provenance */}
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 space-y-1">
                  <div>Source Model: {report.provenance.sourceModel}</div>
                  <div>Digital Twin Snapshot: {report.provenance.digitalTwinVersion}</div>
                  <div>Deterministic Reproducibility Hash: {report.reproducibilityHash}</div>
                  <div>Evaluated By: {report.provenance.evaluatedBy}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioValidationView;
