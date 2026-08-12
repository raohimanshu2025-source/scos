import React from 'react';
import { PredictiveDemoStep, RiskZone } from '../../types/prediction';
import { Play, RotateCcw, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Brain } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PredictiveDemoScenarioPlayerProps {
  currentStep: PredictiveDemoStep | null;
  stepIndex: number; // 0 - 15
  isDemoRunning: boolean;
  onAdvanceStep: () => Promise<void>;
  onResetDemo: () => Promise<void>;
  paradeZone: RiskZone | undefined;
}

export const PredictiveDemoScenarioPlayer: React.FC<PredictiveDemoScenarioPlayerProps> = ({
  currentStep,
  stepIndex,
  isDemoRunning,
  onAdvanceStep,
  onResetDemo,
  paradeZone,
}) => {
  const totalSteps = 15;
  const progressPercent = Math.min(100, Math.round((stepIndex / totalSteps) * 100));

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/40 p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                Primary Thesis Walkthrough Scenario
              </span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                15-Step End-to-End Execution
              </span>
            </div>
            <h3 className="text-base font-black text-white">
              Heavy Rainfall — Predictive Waterlogging Risk
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onResetDemo} className="border-slate-700 text-slate-300">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Scenario
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onAdvanceStep}
            disabled={stepIndex >= totalSteps}
            className="bg-indigo-600 hover:bg-indigo-500 font-bold px-4"
          >
            {stepIndex === 0 ? 'Start Scenario Walkthrough' : stepIndex >= totalSteps ? 'Scenario Complete' : 'Next Step'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold">
            Walkthrough Step {stepIndex} of {totalSteps}
          </span>
          <span className="text-indigo-400 font-bold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Step Active Card */}
      {currentStep ? (
        <div className="bg-slate-800/80 rounded-xl border border-indigo-500/50 p-4 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {currentStep.step}
              </span>
              <h4 className="text-sm font-bold text-white">{currentStep.title}</h4>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-700 text-indigo-300 border border-slate-600">
              Actor: {currentStep.actor} ({currentStep.role})
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {currentStep.description}
          </p>

          {/* Dynamic Status Callout for Key Steps */}
          {currentStep.step === 4 && (
            <div className="bg-amber-950/60 border border-amber-500/40 p-2.5 rounded-lg text-xs text-amber-200 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Risk score threshold breached (78/100). Early Warning generated!</span>
            </div>
          )}

          {currentStep.step === 10 && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-lg text-xs text-emerald-200 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Human Officer Dr. R. K. Verma approved Option 1. 4 PREVENTIVE tasks created in kernel!</span>
            </div>
          )}

          {currentStep.step === 14 && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-lg text-xs text-emerald-200 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Intervention Success: Pre-positioned mobile pumps prevented inundation! Risk dropped to 32 (LOW).</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/40 rounded-xl border border-slate-800 p-4 text-center space-y-2 relative z-10">
          <p className="text-xs text-slate-400 font-mono">
            Click <strong className="text-indigo-400">"Start Scenario Walkthrough"</strong> to step through the 15-stage predictive Heavy Rainfall waterlogging lifecycle.
          </p>
        </div>
      )}

      {/* Target Zone Live Status Footer */}
      {paradeZone && (
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono relative z-10">
          <span className="text-slate-400">
            Target Zone: <strong className="text-white">{paradeZone.zone_name}</strong>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Live Score:{' '}
              <strong
                className={
                  paradeZone.risk_score >= 70
                    ? 'text-rose-400'
                    : paradeZone.risk_score >= 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {paradeZone.risk_score}/100 ({paradeZone.risk_level})
              </strong>
            </span>

            <span className="text-slate-400">
              Early Warning:{' '}
              <strong className="text-indigo-300">{paradeZone.early_warning_status}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
