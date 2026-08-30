// =========================================================================
// SCOS PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE TYPE SYSTEM
// Non-Destructive Presentation & Guided Research Story Layer
// Version: SCOS-RESEARCH-DEMO-v1.0
// Academic Affiliation: IIT Kanpur — Department of Civil Engineering
// =========================================================================

export type ScenarioId = 'SC-01' | 'SC-02' | 'SC-03' | 'SC-04' | 'SC-05';
export type MetricCode = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9' | 'M10';
export type ResearchQuestionId = 'RQ-01' | 'RQ-02' | 'RQ-03' | 'RQ-04' | 'RQ-05';
export type HypothesisId = 'H01' | 'H02' | 'H03' | 'H04' | 'H05';

export type DemonstrationMode = 'QUICK_DEMO' | 'PROFESSOR_MODE' | 'FULL_RESEARCH' | 'FULL_RESEARCH_MODE';

export type DemonstrationStepId =
  | 'STEP-01'
  | 'STEP-02'
  | 'STEP-03'
  | 'STEP-04'
  | 'STEP-05'
  | 'STEP-06'
  | 'STEP-07'
  | 'STEP-08'
  | 'STEP-09'
  | 'STEP-10'
  | 'STEP-11'
  | 'STEP-12'
  | 'STEP-13'
  | 'STEP-14'
  | 'STEP-15';

export type ObservationSourceType =
  | 'CONTROLLED_SIMULATION'
  | 'SYNTHETIC_BASELINE'
  | 'COMPUTATIONAL_MODEL'
  | 'EXPERT_HEURISTIC'
  | 'CALIBRATED_BENCHMARK';

export interface ResearchDemonstrationSession {
  sessionId: string;
  demoVersion: 'SCOS-RESEARCH-DEMO-v1.0';
  startedAt: string;
  currentStep: DemonstrationStepId;
  completedSteps: DemonstrationStepId[];
  selectedScenario: ScenarioId;
  selectedMode: DemonstrationMode;
  researchQuestionLinks: ResearchQuestionId[];
  hypothesisLinks: HypothesisId[];
  metricLinks: MetricCode[];
  evidenceReferences: string[];
  classification: string;
  fieldValidationStatus: 'NOT_ESTABLISHED';
  isPresenterModeActive: boolean;
}

export interface ResearchDemonstrationStep {
  stepId: DemonstrationStepId;
  stepNumber: number; // 1 to 15
  title: string;
  shortTitle: string;
  subtitle: string;
  timeEstimateMinutes: number;
  isIncludedInQuickDemo: boolean;
  isIncludedInProfessorMode: boolean;
  keyTakeaway: string;
  primaryNarrative: string;
  civilEngineeringContext?: string;
  evidenceReferenceId: string;
  limitationsNotice: string;
  permittedStatements: string[];
  prohibitedOverclaims: string[];
  mappedArtifacts: {
    figures: string[];
    tables: string[];
    phases: string[];
  };
  stepData: any;
}

export interface ResearchDemonstrationEvidence {
  evidenceId: string;
  stepId: DemonstrationStepId;
  sourcePhase: string;
  sourceService: string;
  scenarioId?: ScenarioId;
  metricCode?: MetricCode;
  observationSource: ObservationSourceType;
  statisticalSource?: string;
  sensitivitySource?: string;
  hypothesisId?: HypothesisId;
  claimStatus: string;
  evidenceLevel: string;
  cryptographicFingerprint: string;
  primaryLimitation: string;
  futureFieldRequirement: string;
  auditTrailSummary: string;
}

export interface ResearchDemonstrationScenario {
  scenarioId: ScenarioId;
  title: string;
  location: string;
  durationHours: number;
  rainfallMmPerHr: number;
  infrastructureInvolved: string[];
  departmentsInvolved: string[];
  initialConditions: string;
  engineeringAssumptions: string[];
  dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION';
  isCanonicalDemoScenario: boolean;
  baselineComparisonSummary: string;
}

export interface ResearchDemonstrationProgress {
  totalSteps: number;
  currentStepNumber: number;
  currentStepId: DemonstrationStepId;
  completedStepsCount: number;
  percentComplete: number;
  estimatedRemainingMinutes: number;
  activeMode: DemonstrationMode;
  availableStepIds: DemonstrationStepId[];
}

export interface ResearchDemonstrationSummary {
  researchProblem: string;
  researchGap: string;
  proposedReferenceArchitecture: string;
  civilEngineeringFoundation: string;
  prototypeOperationalModel: string;
  controlledBenchmarkScenario: string;
  experimentalEvaluationDesign: string;
  observedResultsSummary: string;
  supportedHypotheses: string;
  robustnessSummary: string;
  boundedContributions: string;
  unestablishedFieldValidation: string;
  mandatoryNotice: string;
}

export interface ResearchDemonstrationBoundary {
  supportedAspects: Array<{
    id: string;
    domain: string;
    claim: string;
    evidenceLevel: string;
    verifiedScope: string;
  }>;
  unestablishedAspects: Array<{
    id: string;
    domain: string;
    unestablishedAspect: string;
    status: 'NOT_ESTABLISHED';
    fieldValidationRequirement: string;
  }>;
  governanceDeclaration: string;
  bindingStatus: string;
}

export interface ResearchDemonstrationManifest {
  manifestId: string;
  demoVersion: string;
  thesisEvidenceVersion: string;
  researchDatasetVersion: string;
  scenarioVersion: string;
  metricVersion: string;
  claimsVersion: string;
  architectureVersion: string;
  generatedAt: string;
  includedSteps: DemonstrationStepId[];
  includedScenarios: string[];
  includedMetrics: string[];
  includedHypotheses: string[];
  sourceFingerprints: {
    thesisEvidenceFingerprint: string;
    claimsFingerprint: string;
    validationFingerprint: string;
    datasetFingerprint: string;
  };
  demoFingerprint: string;
  academicNotice: string;
}

export interface ExaminerQuestionItem {
  questionId: string;
  questionNumber: number;
  category: string;
  questionText: string;
  shortAnswer: string;
  detailedAnswer: string;
  evidenceLink: string;
  relatedStepId: DemonstrationStepId;
  primaryLimitation: string;
  fieldValidationRequirement: string;
}

export interface QuickDemoStepConfig {
  stepId: DemonstrationStepId;
  stepNumber: number;
  shortTitle: string;
  summaryPoint: string;
}
