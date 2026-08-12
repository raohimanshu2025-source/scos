/**
 * SCOS Phase 5B.6 — End-to-End Scenario Walkthrough Component
 * Interactive 11-step simulation player for "Waterlogging Incident Near Major Road and Hospital".
 * Demonstrates real-time Knowledge Graph binding, contextual risk evaluation, AI dispatch, and resolution.
 */

import React from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  UserCheck,
  Brain,
  ShieldCheck,
  Layers,
  ArrowRight,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';

export const GraphScenarioPlayer: React.FC = () => {
  const { demoSteps, currentDemoStepIndex, advanceScenario, resetScenario } = useKnowledgeGraph();

  const isCompleted = currentDemoStepIndex >= demoSteps.length;
  const currentStep = demoSteps[Math.min(currentDemoStepIndex, demoSteps.length - 1)];

  return (
    <div className="space-y-6 font-sans">
      {/* Player Header Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">11-Step End-to-End Demonstration Scenario</h3>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            "Waterlogging Incident Near Major Road and Hospital" — Interactive Knowledge Graph Lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={resetScenario}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          >
            Reset Walkthrough
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={advanceScenario}
            disabled={isCompleted}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isCompleted ? 'Scenario Completed' : `Advance Step (${currentDemoStepIndex + 1}/11)`}
          </Button>
        </div>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-1.5 font-sans">
        <div className="flex justify-between text-xs text-slate-600 font-mono font-bold">
          <span>Simulation Progress</span>
          <span>
            Step {Math.min(currentDemoStepIndex + 1, demoSteps.length)} of {demoSteps.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${((currentDemoStepIndex + 1) / demoSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 11-Step Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {demoSteps.map((s) => {
          const isPassed = s.step - 1 < currentDemoStepIndex;
          const isCurrent = s.step - 1 === currentDemoStepIndex;

          return (
            <Card
              key={s.step}
              className={`p-4 transition-all ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-md ring-2 ring-indigo-300'
                  : isPassed
                  ? 'border-slate-200 bg-white opacity-80'
                  : 'border-slate-200 bg-slate-50 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between border-b border-slate-200 pb-2 mb-2">
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  Step {s.step}
                </span>
                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isCurrent && <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />}
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{s.description}</p>

              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Actor: {s.actor}</span>
                <span className="font-bold text-indigo-700">{s.role}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
