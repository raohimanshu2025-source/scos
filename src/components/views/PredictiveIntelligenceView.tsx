import React, { useState } from 'react';
import { usePredictive } from '../../context/PredictiveContext';
import {
  Brain,
  ShieldAlert,
  Sliders,
  Award,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Activity,
  Layers,
  History,
  Info,
  Clock,
  Sparkles,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DecisionSupportPanel } from '../predictive/DecisionSupportPanel';
import { ContributingFactorsList } from '../predictive/ContributingFactorsList';
import { HistoricalPatternView } from '../predictive/HistoricalPatternView';
import { WhatIfScenarioSimulator } from '../predictive/WhatIfScenarioSimulator';
import { PredictiveDemoScenarioPlayer } from '../predictive/PredictiveDemoScenarioPlayer';
import { ResearchMetricsView } from '../predictive/ResearchMetricsView';

export const PredictiveIntelligenceView: React.FC = () => {
  const {
    risks,
    selectedRisk,
    metrics,
    currentDemoStep,
    demoStepIndex,
    isDemoRunning,
    selectRiskById,
    approveEarlyWarning,
    dismissEarlyWarning,
    modifyEarlyWarningActions,
    runWhatIfScenario,
    advanceDemoStep,
    resetDemoScenario,
  } = usePredictive();

  const [activeTab, setActiveTab] = useState<'decision-support' | 'what-if' | 'thesis-walkthrough' | 'research-metrics'>('decision-support');

  // Overview counts
  const criticalCount = risks.filter((r) => r.risk_level === 'CRITICAL').length;
  const highCount = risks.filter((r) => r.risk_level === 'HIGH').length;
  const mediumCount = risks.filter((r) => r.risk_level === 'MEDIUM').length;
  const lowCount = risks.filter((r) => r.risk_level === 'LOW').length;
  const pendingReviewCount = risks.filter((r) => r.early_warning_status === 'AWAITING_REVIEW').length;
  const approvedCount = risks.filter((r) => r.early_warning_status === 'APPROVED').length;

  const paradeZone = risks.find((r) => r.zone_id === 'ZONE-PARADE-CROSSING');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400 font-mono">
                AI-SCOS Phase 5B.5
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/30 font-bold">
                Predictive Intelligence & Decision Support
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-indigo-400" />
              Predictive City Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed font-mono">
              Proactive multi-department risk modeling, AI-assisted decision support, early warning human-in-the-loop validation, and What-If urban scenario simulation for Kanpur Smart City.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'thesis-walkthrough' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('thesis-walkthrough')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" />
              15-Step Thesis Walkthrough
            </Button>
          </div>
        </div>

        {/* Epistemological Distinction Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 font-bold block">1. OBSERVED FACT</span>
            <span className="text-slate-200">Sensor Telemetry / Reports</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-amber-400 font-bold block">2. DETECTED PATTERN</span>
            <span className="text-slate-200">Monsoon Correlation</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-indigo-400 font-bold block">3. PREDICTION</span>
            <span className="text-slate-200">Risk Score (0 - 100)</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
            <span className="text-emerald-400 font-bold block">4. RECOMMENDATION</span>
            <span className="text-slate-200">Preventive Action Options</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-cyan-400 font-bold block">5. HUMAN DECISION</span>
            <span className="text-slate-200">Officer Verification</span>
          </div>
        </div>
      </div>

      {/* City Risk Overview KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Critical Risks</span>
          <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">{criticalCount}</span>
          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block font-mono">Immediate Review</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">High Risks</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{highCount}</span>
          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block font-mono">Early Warning Level</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Medium / Low</span>
          <span className="text-2xl font-black text-slate-700 font-mono mt-1 block">{mediumCount + lowCount}</span>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block font-mono">Monitored Zones</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Awaiting Review</span>
          <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">{pendingReviewCount}</span>
          <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block font-mono">Officer Verification</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Approved Actions</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{approvedCount}</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block font-mono">Preventive Tasks</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">Data Quality</span>
          <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">HIGH</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block font-mono">Multi-Sensor Feed</span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 bg-white p-2 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('decision-support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'decision-support'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Active Early Warnings & Decision Support ({pendingReviewCount} Pending)
        </button>

        <button
          onClick={() => setActiveTab('what-if')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'what-if'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          What-If Scenario Simulation
        </button>

        <button
          onClick={() => setActiveTab('thesis-walkthrough')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'thesis-walkthrough'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          15-Step Thesis Scenario
        </button>

        <button
          onClick={() => setActiveTab('research-metrics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'research-metrics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Research Metrics & Evaluation
        </button>
      </div>

      {/* TAB CONTENT 1: DECISION SUPPORT COCKPIT */}
      {activeTab === 'decision-support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Risk Zone Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono px-1">
              Active Urban Risk Zones ({risks.length})
            </h3>

            <div className="space-y-2.5">
              {risks.map((zone) => {
                const isSelected = selectedRisk?.zone_id === zone.zone_id;
                return (
                  <div
                    key={zone.zone_id}
                    onClick={() => selectRiskById(zone.zone_id)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {zone.use_case}
                      </span>
                      <span
                        className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                          zone.risk_level === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                            : zone.risk_level === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                        }`}
                      >
                        {zone.risk_level} ({zone.risk_score}/100)
                      </span>
                    </div>

                    <h4 className="text-xs font-bold truncate">{zone.zone_name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{zone.ward_zone}</span>

                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono border-t pt-2 border-slate-700/40">
                      <span className="text-slate-400">Horizon: {zone.time_horizon}</span>
                      <span
                        className={`font-bold ${
                          zone.early_warning_status === 'APPROVED'
                            ? 'text-emerald-400'
                            : zone.early_warning_status === 'AWAITING_REVIEW'
                            ? 'text-amber-400 font-extrabold'
                            : 'text-slate-400'
                        }`}
                      >
                        {zone.early_warning_status === 'AWAITING_REVIEW' ? '⚡ REVIEW REQUIRED' : zone.early_warning_status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Risk Zone Detail & Decision Support Panel */}
          <div className="lg:col-span-8 space-y-6">
            {selectedRisk ? (
              <>
                {/* Decision Support Panel */}
                <DecisionSupportPanel
                  zone={selectedRisk}
                  onApprove={approveEarlyWarning}
                  onDismiss={dismissEarlyWarning}
                  onModify={modifyEarlyWarningActions}
                />

                {/* AI Concise Operational Explanation Card */}
                <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/30 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    AI Operational Explanation (Gemini Engine)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                    {selectedRisk.ai_operational_explanation}
                  </p>
                </div>

                {/* Grid: Contributing Factors + Historical Pattern */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ContributingFactorsList factors={selectedRisk.contributing_factors} />
                  <HistoricalPatternView
                    pattern={selectedRisk.historical_pattern}
                    trend={selectedRisk.trend}
                    zoneName={selectedRisk.zone_name}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-sm text-slate-500">Select a risk zone from the list to view Decision Support controls.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: WHAT-IF SCENARIO SIMULATION */}
      {activeTab === 'what-if' && (
        <WhatIfScenarioSimulator zones={risks} onRunSimulation={runWhatIfScenario} />
      )}

      {/* TAB CONTENT 3: THESIS SCENARIO WALKTHROUGH */}
      {activeTab === 'thesis-walkthrough' && (
        <div className="space-y-6">
          <PredictiveDemoScenarioPlayer
            currentStep={currentDemoStep}
            stepIndex={demoStepIndex}
            isDemoRunning={isDemoRunning}
            onAdvanceStep={advanceDemoStep}
            onResetDemo={resetDemoScenario}
            paradeZone={paradeZone}
          />

          {paradeZone && (
            <DecisionSupportPanel
              zone={paradeZone}
              onApprove={approveEarlyWarning}
              onDismiss={dismissEarlyWarning}
              onModify={modifyEarlyWarningActions}
            />
          )}
        </div>
      )}

      {/* TAB CONTENT 4: RESEARCH METRICS */}
      {activeTab === 'research-metrics' && (
        <ResearchMetricsView metrics={metrics} />
      )}
    </div>
  );
};
