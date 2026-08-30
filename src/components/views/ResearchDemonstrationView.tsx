// =========================================================================
// SCOS PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE VIEW
// Guided 10–15 Minute Examiner Presentation, Professor Review Mode,
// Step-by-Step Research Story, Evidence Drawer & Examiner Q&A Matrix
// Academic Affiliation: IIT Kanpur — Department of Civil Engineering
// =========================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DemonstrationMode,
  DemonstrationStepId,
  ResearchDemonstrationStep,
  ResearchDemonstrationEvidence,
  ResearchDemonstrationScenario,
  ResearchDemonstrationSummary,
  ResearchDemonstrationBoundary,
  ResearchDemonstrationManifest,
  ExaminerQuestionItem,
  QuickDemoStepConfig,
  ScenarioId,
} from '../../types/researchDemonstration';
import { researchDemonstrationService } from '../../services/researchDemonstrationService';
import {
  Presentation,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  Building2,
  Compass,
  Scale,
  FlaskConical,
  Award,
  GraduationCap,
  Sliders,
  HelpCircle,
  Hash,
  ExternalLink,
  BookOpen,
  Check,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Flame,
  Info,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const ResearchDemonstrationView: React.FC = () => {
  // Mode & Step State
  const [selectedMode, setSelectedMode] = useState<DemonstrationMode>('PROFESSOR_MODE');
  const [currentStepId, setCurrentStepId] = useState<DemonstrationStepId>('STEP-01');
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('SC-01');

  // UI Drawers & Panels
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState<boolean>(false);
  const [isClaimLinterOpen, setIsClaimLinterOpen] = useState<boolean>(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState<boolean>(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Claim Linter Input
  const [linterInput, setLinterInput] = useState<string>('');
  const [linterResult, setLinterResult] = useState<any>(null);

  // Verification & Feedback State
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ExaminerQuestionItem | null>(null);

  // Load static data from service
  const allSteps = useMemo(() => researchDemonstrationService.getDemonstrationSteps(), []);
  const quickStepsConfig = useMemo(() => researchDemonstrationService.getQuickDemoSteps(), []);
  const storySummary = useMemo(() => researchDemonstrationService.getResearchStorySummary(), []);
  const civilSummary = useMemo(() => researchDemonstrationService.getCivilEngineeringSummary(), []);
  const designSummary = useMemo(() => researchDemonstrationService.getExperimentalDesignSummary(), []);
  const resultsSummary = useMemo(() => researchDemonstrationService.getResultsSummary(), []);
  const hypothesesSummary = useMemo(() => researchDemonstrationService.getHypothesisSummary(), []);
  const contributionSummary = useMemo(() => researchDemonstrationService.getContributionSummary(), []);
  const boundarySummary = useMemo(() => researchDemonstrationService.getBoundarySummary(), []);
  const examinerQuestions = useMemo(() => researchDemonstrationService.getExaminerQuestions(), []);
  const manifest = useMemo(() => researchDemonstrationService.getDemonstrationManifest(), []);

  // Filtered steps depending on mode
  const activeSteps = useMemo(() => {
    if (selectedMode === 'QUICK_DEMO') {
      const quickIds = quickStepsConfig.map((q) => q.stepId);
      return allSteps.filter((s) => quickIds.includes(s.stepId));
    }
    return allSteps;
  }, [selectedMode, allSteps, quickStepsConfig]);

  // Current active step object
  const currentStep = useMemo(() => {
    return allSteps.find((s) => s.stepId === currentStepId) || allSteps[0];
  }, [allSteps, currentStepId]);

  const currentIndex = useMemo(() => {
    return activeSteps.findIndex((s) => s.stepId === currentStepId);
  }, [activeSteps, currentStepId]);

  // Current step evidence
  const currentEvidence = useMemo(() => {
    return researchDemonstrationService.getDemonstrationEvidence(currentStepId);
  }, [currentStepId]);

  // Current scenario details
  const activeScenario = useMemo(() => {
    return researchDemonstrationService.getDemonstrationScenario(selectedScenarioId);
  }, [selectedScenarioId]);

  // Navigation handlers
  const handleNextStep = useCallback(() => {
    if (currentIndex < activeSteps.length - 1) {
      setCurrentStepId(activeSteps[currentIndex + 1].stepId);
    } else {
      setIsAutoPlayActive(false);
    }
  }, [currentIndex, activeSteps]);

  const handlePrevStep = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentStepId(activeSteps[currentIndex - 1].stepId);
    }
  }, [currentIndex, activeSteps]);

  const handleReset = useCallback(() => {
    researchDemonstrationService.resetDemonstrationState();
    setCurrentStepId(activeSteps[0].stepId);
    setIsAutoPlayActive(false);
  }, [activeSteps]);

  // Auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (isAutoPlayActive) {
      timer = setInterval(() => {
        handleNextStep();
      }, 15000); // 15 seconds per step
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlayActive, handleNextStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStep, handlePrevStep]);

  // Claim Linter validation runner
  const handleRunLinter = () => {
    if (!linterInput.trim()) return;
    const res = researchDemonstrationService.validatePresentationClaim(linterInput);
    setLinterResult(res);
  };

  // Fingerprint verification runner
  const handleVerifyFingerprint = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = researchDemonstrationService.verifyDemonstrationFingerprint();
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div
      id="research-demonstration-root"
      className="space-y-6 text-slate-800 animate-fadeIn"
    >
      {/* 1. ACADEMIC TITLE & INSTITUTIONAL GOVERNANCE HEADER */}
      <div
        id="demo-header-card"
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                Phase 11D — Research Demonstration & Defense
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Canonical Evidence Frozen
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                v1.0.0
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              M.Tech Research Demonstration & Viva Voce Defense Flow
            </h1>
            <p className="text-sm text-slate-600">
              Department of Civil Engineering & Center for Smart Governance • Indian Institute of Technology Kanpur
            </p>
          </div>

          {/* Demonstration Mode Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="mode-btn-quick"
              onClick={() => {
                setSelectedMode('QUICK_DEMO');
                if (!quickStepsConfig.map((q) => q.stepId).includes(currentStepId)) {
                  setCurrentStepId('STEP-01');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'QUICK_DEMO'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              ⏱️ Quick Demo (5 min)
            </button>
            <button
              id="mode-btn-professor"
              onClick={() => setSelectedMode('PROFESSOR_MODE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'PROFESSOR_MODE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              🎓 Professor Review (10-15 min)
            </button>
            <button
              id="mode-btn-full"
              onClick={() => setSelectedMode('FULL_RESEARCH_MODE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'FULL_RESEARCH_MODE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              🔬 Full Research Mode (15 Steps)
            </button>
          </div>
        </div>

        {/* Mandatory Academic Disclaimer Banner */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">MANDATORY ACADEMIC DISCLOSURE:</span> SCOS is an M.Tech research prototype evaluated under controlled digital twin simulations and calibrated computational scenarios. Baseline comparisons derive from synthetic administrative models. <span className="font-semibold text-amber-950">REAL-WORLD MUNICIPAL FIELD VALIDATION IS NOT ESTABLISHED.</span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS STEPPER / BREADCRUMBS */}
      <div
        id="demo-stepper-bar"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Presentation Progress:
            </span>
            <span className="text-xs font-bold text-indigo-600">
              Step {currentIndex + 1} of {activeSteps.length}
            </span>
            <span className="text-xs text-slate-400">
              ({currentStep.shortTitle})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-autoplay"
              onClick={() => setIsAutoPlayActive(!isAutoPlayActive)}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                isAutoPlayActive
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              title="Automatically advance steps every 15 seconds"
            >
              {isAutoPlayActive ? (
                <>
                  <Pause className="w-3 h-3" /> Pausing...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Auto Advance
                </>
              )}
            </button>
            <button
              id="btn-reset-demo"
              onClick={handleReset}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
              title="Reset demonstration state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper bubbles */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-1.5">
          {activeSteps.map((step, idx) => {
            const isActive = step.stepId === currentStepId;
            const isPassed = idx < currentIndex;
            return (
              <button
                key={step.stepId}
                id={`step-tab-${step.stepId}`}
                onClick={() => setCurrentStepId(step.stepId)}
                className={`py-1.5 px-1 rounded-md text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                    : isPassed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{step.stepNumber}</span>
                <span className="text-[10px] font-normal truncate max-w-full hidden sm:inline">
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN STEP PRESENTATION CANVAS */}
      <div
        id="demo-main-canvas"
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6"
      >
        {/* Step Header */}
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-900 text-white rounded">
                STEP {currentStep.stepNumber.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500">
                Est. Duration: ~{currentStep.timeEstimateMinutes} min
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentStep.title}
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={handlePrevStep}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={currentIndex === activeSteps.length - 1}
              onClick={handleNextStep}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Key Takeaway Callout Box */}
        <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Core Examiner Takeaway
              </h3>
              <p className="text-sm font-semibold text-indigo-950 mt-0.5 leading-relaxed">
                {currentStep.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Research Narrative */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Primary Academic Narrative & Context
          </h4>
          <p className="text-base text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-lg border border-slate-100">
            {currentStep.primaryNarrative}
          </p>
        </div>

        {/* Civil Engineering Grounding Callout */}
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg flex items-start gap-3 text-sky-950">
          <Building2 className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
              Civil Engineering Domain Linkage
            </h4>
            <p className="text-xs leading-relaxed">
              {currentStep.civilEngineeringContext}
            </p>
          </div>
        </div>

        {/* STEP-SPECIFIC VISUAL INTERACTION PANELS */}
        <div id="step-interactive-payload" className="pt-2">
          {/* STEP 1: Problem Dimensions */}
          {currentStep.stepId === 'STEP-01' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStep.stepData?.coreProblemDimensions?.map((dim: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-indigo-700 uppercase">
                    Dimension {idx + 1}: {dim.dim}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">{dim.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: Research Gap Matrix */}
          {currentStep.stepId === 'STEP-02' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Domain</th>
                    <th className="p-3">State of the Art</th>
                    <th className="p-3">Identified Research Gap</th>
                    <th className="p-3">SCOS Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {currentStep.stepData?.gapMatrix?.map((g: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{g.domain}</td>
                      <td className="p-3">{g.stateOfArt}</td>
                      <td className="p-3 text-rose-700">{g.identifiedGap}</td>
                      <td className="p-3 text-emerald-700 font-medium">{g.scosContribution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* STEP 3: Research Questions & Hypotheses */}
          {currentStep.stepId === 'STEP-03' && (
            <div className="space-y-3">
              {currentStep.stepData?.hypothesesSummary?.map((h: any) => (
                <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{h.id}</span>
                      <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {h.rq}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">{h.statement}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-slate-500">
                      Score: <strong className="text-indigo-600">{h.score}/100</strong>
                    </span>
                    <div className="text-[10px] text-slate-400">Metrics: {h.metrics.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: Reference Architecture Layers */}
          {currentStep.stepId === 'STEP-04' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentStep.stepData?.layers?.map((l: any) => (
                  <div key={l.level} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-700">{l.level}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">{l.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{l.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Civil Engineering Grounding */}
          {currentStep.stepId === 'STEP-05' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStep.stepData?.domains?.map((d: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-bold text-sky-800 uppercase">{d.domain}</span>
                    <div className="text-[11px] text-slate-700 mt-1 font-mono">{d.model}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px]">
                      <span className="font-semibold text-indigo-600">{d.classification}</span>
                      <span className="text-slate-500 truncate max-w-[180px]">{d.assets}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Scenario Selector */}
          {currentStep.stepId === 'STEP-06' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'] as ScenarioId[]).map((scId) => (
                  <button
                    key={scId}
                    onClick={() => setSelectedScenarioId(scId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedScenarioId === scId
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {scId} {scId === 'SC-01' ? '(Canonical)' : ''}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="font-bold text-sm text-slate-900">{activeScenario.title}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                  <div><strong>Location:</strong> {activeScenario.location}</div>
                  <div><strong>Rainfall:</strong> {activeScenario.rainfallMmPerHr} mm/hr peak</div>
                  <div><strong>Duration:</strong> {activeScenario.durationHours} hours</div>
                  <div><strong>Classification:</strong> {activeScenario.dataClassification}</div>
                </div>
                <div className="pt-2 text-slate-700">
                  <strong>Baseline vs SCOS Summary:</strong> {activeScenario.baselineComparisonSummary}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Digital Twin Metrics */}
          {currentStep.stepId === 'STEP-07' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-700">128</div>
                <div className="text-xs text-indigo-950 font-medium">Twin Entities</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-700">214</div>
                <div className="text-xs text-indigo-950 font-medium">Dependency Edges</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-700">18</div>
                <div className="text-xs text-indigo-950 font-medium">Catchment Zones</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-700">4.2 ms</div>
                <div className="text-xs text-indigo-950 font-medium">Traversal Latency</div>
              </div>
            </div>
          )}

          {/* STEP 8: Cascade Milestones */}
          {currentStep.stepId === 'STEP-08' && (
            <div className="space-y-2">
              {currentStep.stepData?.cascadeSteps?.map((c: any) => (
                <div key={c.step} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                      {c.step}
                    </span>
                    <span className="text-slate-800 font-medium">{c.event}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{c.delay}</span>
                </div>
              ))}
            </div>
          )}

          {/* STEP 9: Triage Flow */}
          {currentStep.stepId === 'STEP-09' && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {currentStep.stepData?.triageFlow?.map((t: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-indigo-700">{idx + 1}. {t.step}</div>
                  <div className="text-slate-600 text-[11px] leading-snug">{t.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 10: Experimental Design */}
          {currentStep.stepId === 'STEP-10' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-900">Condition A (Conventional Baseline)</div>
                <p className="text-slate-600">{designSummary.conditionA.description}</p>
                <div className="font-semibold text-rose-700">{designSummary.conditionA.dataClassification}</div>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2">
                <div className="font-bold text-indigo-950">Condition B (SCOS Integrated)</div>
                <p className="text-indigo-900">{designSummary.conditionB.description}</p>
                <div className="font-semibold text-emerald-700">{designSummary.conditionB.dataClassification}</div>
              </div>
            </div>
          )}

          {/* STEP 11: Benchmark Results Table */}
          {currentStep.stepId === 'STEP-11' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Metric</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Condition A (Baseline)</th>
                    <th className="p-2.5">Condition B (SCOS)</th>
                    <th className="p-2.5">Difference</th>
                    <th className="p-2.5">Runs (N)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {currentStep.stepData?.primaryMetrics?.map((m: any) => (
                    <tr key={m.code} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold font-mono text-indigo-700">{m.code}</td>
                      <td className="p-2.5 font-medium text-slate-900">{m.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{m.base}</td>
                      <td className="p-2.5 font-mono text-indigo-900 font-semibold">{m.scos}</td>
                      <td className="p-2.5 font-mono text-emerald-700 font-bold">{m.diff}</td>
                      <td className="p-2.5 font-mono text-slate-500">{m.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* STEP 12: Sensitivity Summary */}
          {currentStep.stepId === 'STEP-12' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 mb-2">Dominant Input Factors (% Total Variance Contribution):</div>
                <div className="space-y-1.5">
                  {currentStep.stepData?.sensitivitySummary?.dominantParameters?.map((p: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <span className="font-medium text-slate-800">{p}</span>
                      <span className="text-indigo-600 font-bold font-mono">Dominant Factor</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 13: Hypotheses Claims Ledger */}
          {currentStep.stepId === 'STEP-13' && (
            <div className="space-y-2">
              {currentStep.stepData?.claimsLedger?.map((c: any) => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700">{c.id} ({c.hyp})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{c.statement}</p>
                  <p className="text-slate-500 text-[11px]"><em>Limitation:</em> {c.limitation}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 14: Contributions */}
          {currentStep.stepId === 'STEP-14' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {currentStep.stepData?.contributions?.map((c: any) => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.id}</span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {c.level}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">{c.title}</div>
                  <div className="text-slate-500 text-[11px]">{c.domain}</div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 15: Supported vs Unestablished */}
          {currentStep.stepId === 'STEP-15' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What the Research Establishes
                </div>
                <ul className="space-y-1.5 text-emerald-900">
                  {currentStep.stepData?.supportedSummary?.map((s: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2">
                <div className="font-bold text-rose-950 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  What Remains Unestablished in Field Practice
                </div>
                <ul className="space-y-1.5 text-rose-900">
                  {currentStep.stepData?.unestablishedSummary?.map((u: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Permitted Statements vs Prohibited Overclaims */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1 text-xs">
            <span className="font-bold text-emerald-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Permitted Academic Statements
            </span>
            <ul className="space-y-1 text-emerald-800">
              {currentStep.permittedStatements.map((stmt, idx) => (
                <li key={idx}>• {stmt}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg space-y-1 text-xs">
            <span className="font-bold text-rose-900 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Prohibited Overclaims
            </span>
            <ul className="space-y-1 text-rose-800">
              {currentStep.prohibitedOverclaims.map((over, idx) => (
                <li key={idx}>• {over}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step Artifact Mappings */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span><strong>Mapped Figures:</strong> {currentStep.mappedArtifacts.figures.join(', ')}</span>
            <span><strong>Mapped Tables:</strong> {currentStep.mappedArtifacts.tables.join(', ')}</span>
          </div>
          <div>
            <span><strong>Historical Sources:</strong> {currentStep.mappedArtifacts.phases.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* 4. FOOTER CONTROLS & DRILL-DOWN DRAWERS BAR */}
      <div
        id="demo-action-bar"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            id="btn-open-evidence-drawer"
            variant="outline"
            size="sm"
            onClick={() => setIsEvidenceDrawerOpen(true)}
            className="flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Evidence Drawer (Step {currentStep.stepNumber})
          </Button>

          <Button
            id="btn-open-examiner-questions"
            variant="outline"
            size="sm"
            onClick={() => setIsQuestionsModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            Examiner Questions Matrix ({examinerQuestions.length})
          </Button>

          <Button
            id="btn-open-claim-linter"
            variant="outline"
            size="sm"
            onClick={() => setIsClaimLinterOpen(true)}
            className="flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Presentation Claim Linter
          </Button>

          <Button
            id="btn-open-manifest"
            variant="outline"
            size="sm"
            onClick={() => setIsManifestModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Hash className="w-4 h-4 text-slate-700" />
            Demonstration Manifest
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="btn-verify-demo-fingerprint"
            variant="secondary"
            size="sm"
            onClick={handleVerifyFingerprint}
            disabled={isVerifying}
            className="flex items-center gap-1.5 font-mono text-xs"
          >
            {isVerifying ? (
              'Verifying...'
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verify SHA-256 Digest
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Verification Notice Toast */}
      {verificationResult && (
        <div
          id="verification-toast"
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            verificationResult.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <div className="font-bold">
              {verificationResult.valid
                ? 'Cryptographic Demonstration Integrity Verified'
                : 'Fingerprint Mismatch Detected'}
            </div>
            <div className="font-mono text-[11px]">
              SHA-256 Digest: {verificationResult.computedFingerprint}
            </div>
            <div className="text-slate-600">
              Verified against SCOS Canonical Manifest at {verificationResult.checkedAt}.
            </div>
          </div>
        </div>
      )}

      {/* 5. EVIDENCE DRAWER (MODAL / OVERLAY) */}
      {isEvidenceDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Evidence Record for Step {currentStep.stepNumber}: {currentStep.shortTitle}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {currentEvidence.evidenceId}
                </span>
              </div>
              <button
                onClick={() => setIsEvidenceDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Source Phase:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{currentEvidence.sourcePhase}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Source Service:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{currentEvidence.sourceService}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Evidence Level:</span>
                  <div className="font-semibold text-indigo-700 mt-0.5">{currentEvidence.evidenceLevel}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 font-medium">Observation Source:</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">{currentEvidence.observationSource}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900">Cryptographic Digest (SHA-256):</span>
                <div className="p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-800 break-all">
                  {currentEvidence.cryptographicFingerprint}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900">Audit Trail Summary:</span>
                <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  {currentEvidence.auditTrailSummary}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-amber-900">Primary Academic Limitation:</span>
                <p className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 leading-relaxed">
                  {currentEvidence.primaryLimitation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-indigo-900">Future Field Validation Requirement:</span>
                <p className="p-3 bg-indigo-50 rounded border border-indigo-200 text-indigo-900 leading-relaxed">
                  {currentEvidence.futureFieldRequirement}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsEvidenceDrawerOpen(false)}>
                Close Evidence Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXAMINER QUESTIONS MODAL */}
      {isQuestionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  Examiner Question Matrix (17 Research-Linked Questions)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any likely examiner question to inspect research grounding and limitation disclosures.
                </p>
              </div>
              <button
                onClick={() => setIsQuestionsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Question list */}
              <div className="w-full md:w-1/2 border-r border-slate-200 overflow-y-auto p-3 space-y-2">
                {examinerQuestions.map((q) => (
                  <button
                    key={q.questionId}
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                      selectedQuestion?.questionId === q.questionId
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{q.questionId}</span>
                      <span className="font-semibold text-slate-500 uppercase">{q.category}</span>
                    </div>
                    <div>{q.questionText}</div>
                  </button>
                ))}
              </div>

              {/* Selected question detail */}
              <div className="w-full md:w-1/2 p-4 overflow-y-auto space-y-4 text-xs">
                {selectedQuestion ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600">
                        {selectedQuestion.category} • {selectedQuestion.questionId}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {selectedQuestion.questionText}
                      </h4>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">Direct Answer:</span>
                      <p className="p-3 bg-indigo-50/70 border border-indigo-200 rounded text-indigo-950 leading-relaxed font-medium">
                        {selectedQuestion.shortAnswer}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">Detailed Research Grounding:</span>
                      <p className="text-slate-700 leading-relaxed">
                        {selectedQuestion.detailedAnswer}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">Evidence Link:</span>
                      <div className="p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-800">
                        {selectedQuestion.evidenceLink}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-amber-900">Primary Limitation:</span>
                      <p className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 leading-relaxed">
                        {selectedQuestion.primaryLimitation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center p-6">
                    Select a question from the left panel to inspect the examiner response and evidence grounding.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsQuestionsModalOpen(false)}>
                Close Matrix
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CLAIM LINTER MODAL */}
      {isClaimLinterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Presentation Claim Linter
                </h3>
                <p className="text-xs text-slate-500">
                  Verify presentation slide text against Phase 11B academic claim safety rules.
                </p>
              </div>
              <button
                onClick={() => setIsClaimLinterOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Enter candidate presentation statement:</label>
                <textarea
                  value={linterInput}
                  onChange={(e) => setLinterInput(e.target.value)}
                  placeholder="e.g. SCOS was observed to show response time reductions under evaluated prototype scenarios..."
                  className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[11px] text-slate-500">
                  Prohibited words: <em>proven, guarantees, field validated, real cities</em>
                </div>
                <Button size="sm" onClick={handleRunLinter}>
                  Audit Statement
                </Button>
              </div>

              {linterResult && (
                <div
                  className={`p-4 rounded-lg border space-y-2 ${
                    linterResult.isValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {linterResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Compliant Academic Language
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Overclaim Detected
                      </>
                    )}
                  </div>
                  <p className="text-xs">{linterResult.academicComplianceRationale}</p>
                  {linterResult.flaggedTerms?.length > 0 && (
                    <div className="text-[11px] space-y-1">
                      <span className="font-semibold">Flagged Terms:</span>
                      <ul className="list-disc pl-4 text-rose-800">
                        {linterResult.flaggedTerms.map((f: any, idx: number) => (
                          <li key={idx}>
                            <strong>"{f.term}"</strong> — Suggestion: <em>{f.replacement}</em> ({f.reason})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsClaimLinterOpen(false)}>
                Close Linter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DEMONSTRATION MANIFEST MODAL */}
      {isManifestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Hash className="w-5 h-5 text-slate-700" />
                  Demonstration Manifest & Provenance Digest
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {manifest.manifestId}
                </span>
              </div>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="font-bold text-slate-900">Canonical SHA-256 Fingerprint:</span>
                <div className="p-2 bg-slate-100 rounded font-mono text-[11px] text-slate-800 break-all">
                  {manifest.demoFingerprint}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500">Demo Version:</span>
                  <div className="font-mono font-bold text-slate-900">{manifest.demoVersion}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500">Dataset Version:</span>
                  <div className="font-mono font-bold text-slate-900">{manifest.researchDatasetVersion}</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900">Source Component Fingerprints:</span>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 font-mono text-[10px] text-slate-600">
                  <div><strong>Thesis Evidence:</strong> {manifest.sourceFingerprints.thesisEvidenceFingerprint}</div>
                  <div><strong>Claims Fingerprint:</strong> {manifest.sourceFingerprints.claimsFingerprint}</div>
                  <div><strong>Dataset Fingerprint:</strong> {manifest.sourceFingerprints.datasetFingerprint}</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900">
                <span className="font-bold">Permanent Academic Notice:</span>
                <p className="mt-0.5">{manifest.academicNotice}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" onClick={() => setIsManifestModalOpen(false)}>
                Close Manifest
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResearchDemonstrationView;
