import React, { useState } from 'react';
import {
  Brain,
  Timer,
  Play,
  CheckCircle2,
  RotateCcw,
  Download,
  Activity,
  Layers,
  FileCheck2,
  Users,
  Building2,
  ShieldAlert,
  BarChart2,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { PageHeader } from '../shell/PageHeader';
import { useEvaluation } from '../../context/EvaluationContext';
import { BASELINE_MANUAL_STEPS, WorkflowType } from '../../types/evaluation';

export interface EvaluationViewProps {
  onNavigateToIncident?: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ onNavigateToIncident }) => {
  const {
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
    completeBaselineStep,
    completeSession,
    resetSession,
    exportCsv,
  } = useEvaluation();

  const [csvNotice, setCsvNotice] = useState<string | null>(null);

  // Helper to format seconds as mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadCsv = async () => {
    const csvContent = await exportCsv();
    if (!csvContent) {
      setCsvNotice('No CSV evaluation data available to export.');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scos_evaluation_results_${participantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCsvNotice('CSV evaluation export generated successfully.');
    setTimeout(() => setCsvNotice(null), 3000);
  };

  // Find latest result for current participant & selected workflow
  const latestResult = results.find(
    (r) => r.participantId === participantId && r.workflowType === workflowType
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Page Header */}
      <PageHeader
        title="SCOS Evaluation Instrument"
        description="Controlled prototype research evaluation comparing Baseline manual operations against SCOS Unified Operational Intelligence."
        statusBadge={<StatusBadge status="INFO" label="EVALUATION MODE" />}
        breadcrumbs={[{ label: 'System' }, { label: 'Evaluation Instrumentation' }]}
      />

      {/* Mandatory Research Integrity Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>SCOS EVALUATION MODE — Controlled Prototype Evaluation</span>
        </div>
        <p className="text-xs text-amber-900/90 font-medium">
          All data, measurements, and scenarios are simulated unless explicitly connected to validated real-world data.
        </p>
        <p className="text-[11px] text-amber-800 italic">
          &quot;This evaluation uses controlled prototype scenarios and should not be interpreted as evidence of real-world government operational performance.&quot;
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {csvNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          {csvNotice}
        </div>
      )}

      {/* Grid: Session Setup & Live Instrumentation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Setup Controls */}
        <Card className="p-5 border-indigo-200 bg-white space-y-4 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              Evaluation Session Setup
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Participant Identifier */}
            <div className="space-y-1">
              <label className="block font-mono font-bold text-[10px] uppercase text-slate-500">
                Anonymized Participant ID
              </label>
              <input
                type="text"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value.toUpperCase())}
                disabled={activeSession?.status === 'RUNNING'}
                placeholder="e.g. P01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 uppercase"
              />
              <span className="text-[10px] text-slate-400">No personal credentials stored (e.g. P01, P02).</span>
            </div>

            {/* Scenario Identifier */}
            <div className="space-y-1">
              <label className="block font-mono font-bold text-[10px] uppercase text-slate-500">
                Evaluation Scenario
              </label>
              <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-[11px]">
                {scenarioId}
              </div>
              <span className="text-[10px] text-slate-400">Severe Waterlogging near Parade Crossing & Hospital.</span>
            </div>

            {/* Workflow Mode Selector */}
            <div className="space-y-1">
              <label className="block font-mono font-bold text-[10px] uppercase text-slate-500">
                Workflow Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkflowType('BASELINE')}
                  disabled={activeSession?.status === 'RUNNING'}
                  className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
                    workflowType === 'BASELINE'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">BASELINE</div>
                  <div className="text-[9px] font-normal text-slate-500">Fragmented Manual</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkflowType('SCOS')}
                  disabled={activeSession?.status === 'RUNNING'}
                  className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
                    workflowType === 'SCOS'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">SCOS UNIFIED</div>
                  <div className="text-[9px] font-normal text-slate-500">Unified Decision</div>
                </button>
              </div>
            </div>

            {/* Session Action Buttons */}
            <div className="pt-2 space-y-2">
              {activeSession?.status !== 'RUNNING' ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => startSession()}
                  isLoading={isLoading}
                  icon={<Play className="w-4 h-4 fill-current" />}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold"
                >
                  Start Evaluation Session
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => completeSession()}
                  isLoading={isLoading}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  Complete Session & Store Result
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => resetSession()}
                isLoading={isLoading}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                className="w-full text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                Reset Evaluation Session
              </Button>
            </div>
          </div>
        </Card>

        {/* Active Session Instrumentation Monitor */}
        <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                  Live Workflow Telemetry Instrumentation
                </h3>
              </div>
              <StatusBadge
                status={activeSession?.status === 'RUNNING' ? 'NORMAL' : 'NEUTRAL'}
                label={activeSession?.status || 'NOT_STARTED'}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              {/* Live Timer */}
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                  Elapsed Timer
                </span>
                <span className="text-xl font-mono font-bold text-amber-400">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[9px] font-mono text-slate-400 block">mm:ss duration</span>
              </div>

              {/* Retrieval Interactions */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-indigo-800 uppercase block">
                  Retrieval Interactions
                </span>
                <span className="text-xl font-bold text-indigo-950">
                  {activeSession?.retrievalInteractionCount ?? 'N/A'}
                </span>
                <span className="text-[9px] font-mono text-indigo-700 block">Workflow clicks/views</span>
              </div>

              {/* Coordination Steps */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-amber-900 uppercase block">
                  Coordination Steps
                </span>
                <span className="text-xl font-bold text-amber-950">
                  {activeSession?.coordinationStepCount ?? 'N/A'}
                </span>
                <span className="text-[9px] font-mono text-amber-800 block">Dept coordination actions</span>
              </div>

              {/* Participant & Workflow */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">
                  Subject & Workflow
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {participantId} ({workflowType})
                </span>
                <span className="text-[9px] font-mono text-slate-500 block">Session ID: {activeSession?.sessionId?.slice(0, 10) || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Contextual Action Link depending on Active Workflow Mode */}
          <div className="pt-4 border-t border-slate-100">
            {activeSession?.status === 'RUNNING' && activeSession.workflowType === 'SCOS' && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-indigo-950 block">SCOS Unified Workflow Evaluation Active</span>
                  <p className="text-[11px] text-indigo-800">
                    Open the incident view to execute unified AI, graph, predictive, and task actions while telemetry records interaction steps.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToIncident}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="bg-indigo-700 hover:bg-indigo-800 shrink-0 text-xs font-bold"
                >
                  Open Incident SCOS-INC-1024
                </Button>
              </div>
            )}

            {activeSession?.status === 'RUNNING' && activeSession.workflowType === 'BASELINE' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-950 block">Baseline Manual Workflow Simulation Active</span>
                <p className="text-[11px] text-amber-900">
                  Use the step-by-step checklist below to simulate manual fragmented operational steps.
                </p>
              </div>
            )}

            {activeSession?.status !== 'RUNNING' && (
              <p className="text-xs text-slate-500 italic text-center">
                Click &quot;Start Evaluation Session&quot; to begin controlled workflow instrumentation.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* BASELINE WORKFLOW GUIDED STEP-BY-STEP CHECKLIST PANEL (If Baseline session active) */}
      {activeSession?.status === 'RUNNING' && activeSession.workflowType === 'BASELINE' && (
        <Card className="p-5 border-amber-300 bg-amber-50/20 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              <h3 className="text-xs font-bold uppercase text-amber-950 tracking-wider">
                Simulated Manual Baseline Workflow Execution
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
              {activeSession.completedBaselineSteps.length} / {BASELINE_MANUAL_STEPS.length} Steps Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {BASELINE_MANUAL_STEPS.map((step) => {
              const isCompleted = activeSession.completedBaselineSteps.includes(step.id);
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-[10px] mb-1">
                    <span className={isCompleted ? 'text-emerald-700' : 'text-slate-400'}>
                      STEP {step.stepNumber} ({step.category})
                    </span>
                    {isCompleted ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => completeBaselineStep(step.id)}
                        className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                  <div className="font-bold text-xs mb-0.5">{step.title}</div>
                  <p className="text-[11px] text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SCOS EVALUATION RESULTS CARD */}
      <Card className="p-5 border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              SCOS EVALUATION RESULTS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Results Metrics Display */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Workflow Type</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult?.workflowType || 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Scenario</span>
            <span className="text-xs font-bold text-slate-900 truncate block">
              {latestResult ? 'Severe Waterlogging' : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Workflow Duration</span>
            <span className="text-sm font-bold font-mono text-indigo-700">
              {latestResult ? formatTime(latestResult.duration) : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Retrieval Effort</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.retrievalInteractionCount} interactions` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Context Completeness</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.contextCompleteness}%` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Coordination Steps</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.coordinationStepCount} steps` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Decision Completeness</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.decisionSupportCompleteness}%` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Audit Completeness</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.auditCompleteness}%` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Tasks Generated</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.completedTasks} / ${latestResult.taskCount}` : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Departments</span>
            <span className="text-sm font-bold text-slate-900">
              {latestResult ? `${latestResult.departmentCount} Depts` : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* BASELINE VS SCOS COMPARISON PANEL */}
      <Card className="p-5 border-indigo-200 bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              Baseline vs. SCOS Integrated Workflow Comparison
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            Participant {participantId}
          </span>
        </div>

        {comparison ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] uppercase text-slate-500">
                  <th className="p-2.5 font-bold">Evaluation Metric</th>
                  <th className="p-2.5 font-bold text-amber-900">Baseline Workflow</th>
                  <th className="p-2.5 font-bold text-indigo-900">SCOS Integrated</th>
                  <th className="p-2.5 font-bold">Absolute Difference</th>
                  <th className="p-2.5 font-bold text-emerald-700">Percentage Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="p-2.5 font-bold">Workflow Duration</td>
                  <td className="p-2.5 font-mono">{formatTime(comparison.baselineResult!.duration)}</td>
                  <td className="p-2.5 font-mono font-bold text-indigo-700">{formatTime(comparison.scosResult!.duration)}</td>
                  <td className="p-2.5 font-mono">{comparison.timeDifferenceFormatted}</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    {comparison.timeReductionPercent && comparison.timeReductionPercent > 0
                      ? `-${comparison.timeReductionPercent}% time`
                      : `${comparison.timeReductionPercent}%`}
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-bold">Information Retrieval Effort</td>
                  <td className="p-2.5">{comparison.baselineResult!.retrievalInteractionCount} interactions</td>
                  <td className="p-2.5 font-bold text-indigo-700">{comparison.scosResult!.retrievalInteractionCount} interactions</td>
                  <td className="p-2.5 font-mono">{comparison.retrievalDifference}</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    {Math.round(
                      ((comparison.scosResult!.retrievalInteractionCount -
                        comparison.baselineResult!.retrievalInteractionCount) /
                        comparison.baselineResult!.retrievalInteractionCount) *
                        100
                    )}%
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-bold">Context Completeness</td>
                  <td className="p-2.5">{comparison.baselineResult!.contextCompleteness}%</td>
                  <td className="p-2.5 font-bold text-indigo-700">{comparison.scosResult!.contextCompleteness}%</td>
                  <td className="p-2.5 font-mono">+{comparison.contextCompletenessDifference}%</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    +{Math.round(
                      ((comparison.scosResult!.contextCompleteness -
                        comparison.baselineResult!.contextCompleteness) /
                        comparison.baselineResult!.contextCompleteness) *
                        100
                    )}%
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-bold">Coordination Effort</td>
                  <td className="p-2.5">{comparison.baselineResult!.coordinationStepCount} steps</td>
                  <td className="p-2.5 font-bold text-indigo-700">{comparison.scosResult!.coordinationStepCount} steps</td>
                  <td className="p-2.5 font-mono">{comparison.coordinationDifference}</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    {Math.round(
                      ((comparison.scosResult!.coordinationStepCount -
                        comparison.baselineResult!.coordinationStepCount) /
                        comparison.baselineResult!.coordinationStepCount) *
                        100
                    )}%
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-bold">Decision-Support Completeness</td>
                  <td className="p-2.5">{comparison.baselineResult!.decisionSupportCompleteness}%</td>
                  <td className="p-2.5 font-bold text-indigo-700">{comparison.scosResult!.decisionSupportCompleteness}%</td>
                  <td className="p-2.5 font-mono">+{comparison.decisionCompletenessDifference}%</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    +{Math.round(
                      ((comparison.scosResult!.decisionSupportCompleteness -
                        comparison.baselineResult!.decisionSupportCompleteness) /
                        comparison.baselineResult!.decisionSupportCompleteness) *
                        100
                    )}%
                  </td>
                </tr>

                <tr>
                  <td className="p-2.5 font-bold">Audit Completeness</td>
                  <td className="p-2.5">{comparison.baselineResult!.auditCompleteness}%</td>
                  <td className="p-2.5 font-bold text-indigo-700">{comparison.scosResult!.auditCompleteness}%</td>
                  <td className="p-2.5 font-mono">+{comparison.auditCompletenessDifference}%</td>
                  <td className="p-2.5 font-bold text-emerald-700">
                    +{Math.round(
                      ((comparison.scosResult!.auditCompleteness -
                        comparison.baselineResult!.auditCompleteness) /
                        comparison.baselineResult!.auditCompleteness) *
                        100
                    )}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
            <Info className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Comparison Unavailable
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Comparison is unavailable until both Baseline and SCOS evaluation sessions have been completed for participant <strong className="font-mono text-indigo-700">{participantId}</strong>.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
