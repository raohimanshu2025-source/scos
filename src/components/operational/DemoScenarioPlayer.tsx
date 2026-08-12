/**
 * SCOS Phase 5B.4 — Heavy Rainfall Thesis Demonstration Scenario Player
 * Provides a step-by-step interactive walkthrough of the end-to-end cross-department coordination flow
 * for M.Tech thesis evaluation & stakeholder demonstration.
 */

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { useIncidents } from '../../context/IncidentContext';

export const DEMO_SCENARIO_STEPS = [
  {
    step: 1,
    title: '1. Urban Telemetry Alert Received',
    actor: 'SCOS IoT Telemetry Node #14',
    role: 'SYSTEM',
    description: 'Precipitation rate 84mm/hr and 0.65m standing water depth detected near Parade Crossing.',
    actionType: 'INITIALIZE',
  },
  {
    step: 2,
    title: '2. Incident Automatic Classification',
    actor: 'SCOS Rule & Spatial Engine',
    role: 'CLASSIFIER',
    description: 'Classified as WATERLOGGING / Arterial Inundation. Severity: CRITICAL | Priority: P1.',
    actionType: 'CLASSIFY',
  },
  {
    step: 3,
    title: '3. Multi-Department Impact Assessment',
    actor: 'SCOS Cross-Department Engine',
    role: 'IMPACT_ENGINE',
    description: 'Identified 4 affected departments: Municipal Services, Traffic Police, Jal Sansthan, and Health.',
    actionType: 'MAP_IMPACT',
  },
  {
    step: 4,
    title: '4. AI Recommendation Matrix Generated',
    actor: 'Gemini AI Triage Engine',
    role: 'AI_AGENT',
    description: 'Generated 4 structured departmental actions with 96% confidence score.',
    actionType: 'AI_RECOMMEND',
  },
  {
    step: 5,
    title: '5. Human-in-the-Loop Officer Review',
    actor: 'Dr. R. K. Verma (District Magistrate)',
    role: 'DISTRICT_ADMIN',
    description: 'Presented recommendation matrix to District Officer for approval/modification/rejection.',
    actionType: 'OFFICER_REVIEW',
  },
  {
    step: 6,
    title: '6. Officer Approves AI Recommendation',
    actor: 'District Magistrate',
    role: 'APPROVAL',
    description: 'Approved action matrix. Authorized creation of cross-department coordination tasks.',
    actionType: 'APPROVE',
  },
  {
    step: 7,
    title: '7. Department Tasks Dispatched',
    actor: 'SCOS Coordination Kernel',
    role: 'SYSTEM',
    description: 'Dispatched 4 tasks to Municipal, Traffic, Jal Sansthan, and Health departmental queues.',
    actionType: 'DISPATCH_TASKS',
  },
  {
    step: 8,
    title: '8. Municipal Squad Initiates Pumping',
    actor: 'Sanitation Squad #3 (Municipal)',
    role: 'FIELD_OPERATOR',
    description: 'Arrived at Parade Crossing with 2 mobile 100 HP suction pumps. Suction initiated.',
    actionType: 'UPDATE_TASK',
  },
  {
    step: 9,
    title: '9. Traffic Police Sets Up Diversion',
    actor: 'Traffic Rapid Squad #1',
    role: 'FIELD_OPERATOR',
    description: 'Deployed traffic cones at Chunniganj to divert heavy vehicles via GT Road bypass.',
    actionType: 'UPDATE_TASK',
  },
  {
    step: 10,
    title: '10. Jal Sansthan Valve B-2 Cleared',
    actor: 'Jal Sansthan Hydraulic Unit #2',
    role: 'FIELD_OPERATOR',
    description: 'Opened relief valve B-2 at Jajmau sewer outfall. Outflow pressure normalized to 1.8 bar.',
    actionType: 'COMPLETE_TASK_JAL',
  },
  {
    step: 11,
    title: '11. Health Services Casualty Standby',
    actor: 'Emergency Medical Response Team',
    role: 'FIELD_OPERATOR',
    description: 'Alerted Ursula Horsman Hospital casualty ward & dispatched waterborne disease kits.',
    actionType: 'UPDATE_TASK',
  },
  {
    step: 12,
    title: '12. Demo SLA Expiry Warning Triggered',
    actor: 'SCOS Escalation Timer',
    role: 'SYSTEM',
    description: 'Simulated SLA threshold timer triggered for Traffic Task to demonstrate escalation workflow.',
    actionType: 'TRIGGER_SLA_WARNING',
  },
  {
    step: 13,
    title: '13. Escalation Level 1 Activated',
    actor: 'SCOS Escalation Engine',
    role: 'SYSTEM',
    description: 'Escalated to Traffic In-Charge (ACP M. P. Singh). Notification logged in District Audit Trail.',
    actionType: 'ESCALATE_L1',
  },
  {
    step: 14,
    title: '14. Parade Crossing Standing Water Cleared',
    actor: 'Municipal & Traffic Officers',
    role: 'COORDINATION',
    description: 'Suction pumps removed 0.65m standing water. Traffic flow restored on Mall Road.',
    actionType: 'COMPLETE_ALL_TASKS',
  },
  {
    step: 15,
    title: '15. Incident Resolved & Audit Trail Sealed',
    actor: 'SCOS Governance Kernel',
    role: 'SYSTEM',
    description: 'All 4 department tasks completed. Incident marked RESOLVED. Audit log archived for research thesis.',
    actionType: 'RESOLVE',
  },
];

export const DemoScenarioPlayer: React.FC = () => {
  const { launchDemoScenario, approveRecommendation, updateTaskStatus, triggerSlaEscalation, selectedIncident } =
    useIncidents();

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isProcessingStep, setIsProcessingStep] = useState<boolean>(false);

  const currentStep = DEMO_SCENARIO_STEPS[currentStepIdx];

  const handleStartReset = async () => {
    setIsProcessingStep(true);
    await launchDemoScenario();
    setCurrentStepIdx(0);
    setIsProcessingStep(false);
  };

  const handleExecuteNextStep = async () => {
    if (currentStepIdx >= DEMO_SCENARIO_STEPS.length - 1) return;

    setIsProcessingStep(true);
    const nextIdx = currentStepIdx + 1;
    const stepToExecute = DEMO_SCENARIO_STEPS[nextIdx];

    const incidentId = selectedIncident?.incident_id || 'SCOS-INC-1024';

    try {
      if (stepToExecute.actionType === 'APPROVE') {
        await approveRecommendation(incidentId);
      } else if (stepToExecute.actionType === 'COMPLETE_TASK_JAL') {
        await updateTaskStatus(incidentId, 'TASK-1024-3', 'COMPLETED', 'Valve B-2 relief operational');
      } else if (stepToExecute.actionType === 'TRIGGER_SLA_WARNING' || stepToExecute.actionType === 'ESCALATE_L1') {
        await triggerSlaEscalation(incidentId, 'TASK-1024-2');
      } else if (stepToExecute.actionType === 'COMPLETE_ALL_TASKS') {
        await updateTaskStatus(incidentId, 'TASK-1024-1', 'COMPLETED', 'Submersion cleared');
        await updateTaskStatus(incidentId, 'TASK-1024-2', 'COMPLETED', 'Traffic clear');
        await updateTaskStatus(incidentId, 'TASK-1024-4', 'COMPLETED', 'Health standby complete');
      }
    } catch (err) {
      console.warn('Demo scenario execution step note:', err);
    }

    setCurrentStepIdx(nextIdx);
    setIsProcessingStep(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-800 font-sans space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-500/40 text-indigo-300">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-200">
                End-to-End Thesis Demonstration Scenario
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                M.Tech Research Workflow
              </span>
            </div>
            <p className="text-xs text-slate-300 font-normal">
              Heavy Rainfall Causes Waterlogging near Parade Crossing (SCOS-INC-1024)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartReset}
            isLoading={isProcessingStep}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs bg-slate-800/80 border-indigo-700 text-indigo-200 hover:bg-indigo-900/50"
          >
            Reset Demo
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecuteNextStep}
            disabled={currentStepIdx >= DEMO_SCENARIO_STEPS.length - 1 || isProcessingStep}
            icon={<ChevronRight className="w-4 h-4" />}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
          >
            {currentStepIdx >= DEMO_SCENARIO_STEPS.length - 1 ? 'Scenario Completed' : 'Next Step'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
          <span>
            Step {currentStep.step} of {DEMO_SCENARIO_STEPS.length}: {currentStep.title}
          </span>
          <span className="font-bold">{Math.round(((currentStepIdx + 1) / DEMO_SCENARIO_STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentStepIdx + 1) / DEMO_SCENARIO_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step Active Detail Card */}
      <div className="bg-slate-900/80 border border-indigo-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
            <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700 font-bold">
              Actor: {currentStep.actor}
            </span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Role: {currentStep.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {currentStepIdx === DEMO_SCENARIO_STEPS.length - 1 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Scenario Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 bg-indigo-900/40 border border-indigo-700/60 px-3 py-1.5 rounded-lg">
              Active Phase: {currentStep.actionType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
