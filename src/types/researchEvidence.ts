// =========================================================================
// SCOS PHASE 10D — RESEARCH RESULTS & EVIDENCE SYNTHESIS TYPES
// Formal Evidence Classification, RQ Synthesis & Benchmark Scenario Findings
// =========================================================================

export type ResearchQuestionId = 'RQ-01' | 'RQ-02' | 'RQ-03' | 'RQ-04' | 'RQ-05';
export type BenchmarkScenarioId =
  | 'SC-01'
  | 'SC-02'
  | 'SC-03'
  | 'SC-04'
  | 'SC-05'
  | 'SCN-01'
  | 'SCN-02'
  | 'SCN-03'
  | 'SCN-04'
  | 'SCN-05';

export type FindingSignificance = 'STATISTICALLY_DESCRIPTIVE' | 'STRUCTURAL_ADVANTAGE' | 'QUALITATIVE_EQUIVALENT' | 'BOUNDARY_DEPENDENT';

export interface ResearchQuestionDefinition {
  rqId: ResearchQuestionId;
  code: string;
  title: string;
  statement: string;
  hypothesis: string;
  primaryMetrics: string[];
  benchmarkScenarios: BenchmarkScenarioId[];
  synthesizedFinding: string;
  evidenceStrength: string;
  significance: FindingSignificance;
  percentageImprovement: number;
  baselineSummary: string;
  scosSummary: string;
  validityAffirmation: string;
}

export interface ScenarioEvidenceResult {
  scenarioId: BenchmarkScenarioId;
  scenarioName: string;
  hazardType: string;
  baselineDurationSeconds: number;
  scosDurationSeconds: number;
  timeReductionPercent: number;
  baselineCompleteness: number;
  scosCompleteness: number;
  completenessGainPercent: number;
  evidenceLevel: string;
  keyObservation: string;
}

export interface ResearchEvidenceSummary {
  version: string;
  generatedAt: string;
  canonicalHash: string;
  totalResearchQuestions: number;
  totalBenchmarkScenarios: number;
  averageTimeReductionPercent: number;
  averageCompletenessGainPercent: number;
  researchQuestions: ResearchQuestionDefinition[];
  scenarioResults: ScenarioEvidenceResult[];
  governanceNotice: string;
}
