// =========================================================================
// SCOS PHASE 10F — ROBUSTNESS, SENSITIVITY & MODEL STABILITY ANALYSIS TYPES
// Systematic Parameter Perturbation, Elasticity, Tornado Ranking,
// Research Question Stability & Empirical Calibration Roadmap Foundation
// =========================================================================

import { ResearchQuestionId, BenchmarkScenarioId } from './researchEvidence';
import { ExperimentalMetricKey } from './experimentalExecution';
import { AssumptionParameterSource } from './researchDataset';

/**
 * Robustness & Stability Classification
 */
export type RobustnessClassification =
  | 'HIGHLY_ROBUST' // Insensitive to parameter variation within realistic engineering bounds
  | 'MODERATELY_ROBUST' // Stable conclusions with minor quantitative output shifts
  | 'SENSITIVE_ASSUMPTION_DEPENDENT' // Direction remains positive, but magnitude depends on heuristic
  | 'CRITICALLY_UNSTABLE'; // Decision reversal or hypothesis failure occurs under perturbation

/**
 * Perturbation Scheme Types
 */
export type PerturbationSchemeType =
  | 'ONE_AT_A_TIME'
  | 'EXTREME_BOUNDS'
  | 'COMPOUND_MULTI_HAZARD'
  | 'SYSTEMATIC_SWEEP';

/**
 * Parameter Engineering Category
 */
export type ParameterCategory =
  | 'HYDRAULIC'
  | 'MECHANICAL'
  | 'TOPOLOGICAL'
  | 'OPERATIONAL'
  | 'SPATIAL';

/**
 * Parameter Sensitivity Specification Definition
 */
export interface ParameterSensitivityDefinition {
  parameterId: string;
  name: string;
  category: ParameterCategory;
  unit: string;
  defaultValue: number;
  minBound: number;
  maxBound: number;
  testedLevels: number[]; // e.g. [-50, -25, -10, 0, +10, +25, +50]
  sourceType: AssumptionParameterSource;
  engineeringJustification: string;
  applicability: string;
  empiricalCalibrationNeed: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'ALREADY_CALIBRATED';
  proposedEmpiricalSource: string;
  classification: string;
}

/**
 * One-At-A-Time (OAT) Perturbation Result
 */
export interface SensitivityPerturbationResult {
  perturbationId: string;
  parameterId: string;
  parameterName: string;
  perturbationPercent: number; // e.g. -50, -25, -10, 0, 10, 25, 50
  perturbedValue: number;
  scenarioId: BenchmarkScenarioId;
  metricKey: ExperimentalMetricKey;
  metricCode: string;
  baselineOutput: number;
  perturbedOutput: number;
  absoluteDelta: number;
  relativeDeltaPercent: number;
  elasticity: number; // (% change in output / % change in input)
  isMonotonic: boolean;
  isStableThreshold: boolean;
  timestamp: string;
}

/**
 * Parameter Tornado Diagram Ranking Entry
 */
export interface TornadoRankItem {
  parameterId: string;
  parameterName: string;
  category: ParameterCategory;
  metricKey: ExperimentalMetricKey;
  metricCode: string;
  metricName: string;
  unit: string;
  baseValue: number;
  baseOutput: number;
  lowInput: number;
  highInput: number;
  lowOutput: number;
  highOutput: number;
  outputSwingSpan: number; // |highOutput - lowOutput|
  normalizedSensitivityScore: number; // 0.0 - 1.0
  maxElasticity: number;
  rank: number;
  isDominantFactor: boolean;
}

/**
 * Compound Multi-Hazard Stress Test Result
 */
export interface CompoundStressScenarioResult {
  compoundId: string;
  title: string;
  description: string;
  targetScenarios: BenchmarkScenarioId[];
  simultaneousPerturbations: Record<string, { deltaPercent: number; perturbedValue: number; unit: string }>;
  baselineM1DurationSeconds: number;
  stressedM1DurationSeconds: number;
  baselineM3CompletenessPercent: number;
  stressedM3CompletenessPercent: number;
  baselineM8DecisionSupportPercent: number;
  stressedM8DecisionSupportPercent: number;
  performanceRetentionPercent: number;
  criticalFailureTriggered: boolean;
  failureThresholdNote: string;
  mitigationEffectivenessSCOS: string;
  classification: string;
}

/**
 * Robustness Assessment of Research Questions (RQ-01 to RQ-05)
 */
export interface ResearchQuestionRobustnessAssessment {
  rqId: ResearchQuestionId;
  rqTitle: string;
  coreConclusion: string;
  robustnessClassification: RobustnessClassification;
  stabilityScore: number; // 0-100%
  elasticityIndex: number;
  mostInfluentialParameters: Array<{ parameterId: string; name: string; elasticity: number }>;
  stabilityBoundaryCondition: string;
  conclusionReversalObserved: boolean;
  justification: string;
  empiricalCalibrationRoadmap: string;
  boundedScopeAffirmation: string;
}

/**
 * Empirical Calibration Gap Item
 */
export interface EmpiricalCalibrationGap {
  gapId: string;
  parameterId: string;
  parameterName: string;
  category: ParameterCategory;
  currentHeuristicBasis: string;
  sensitivityImpact: 'HIGH' | 'MODERATE' | 'LOW';
  requiredEmpiricalMeasurement: string;
  proposedEmpiricalSource?: string;
  proposedFieldSensors: string[];
  expectedUncertaintyReduction: string;
  municipalPartner: string;
  recommendedTimeframe: string;
}

/**
 * Dynamic Parameter Sweep Request
 */
export interface SensitivitySweepRequest {
  scenarioId?: BenchmarkScenarioId;
  parameterId: string;
  perturbationPercentages: number[]; // e.g. [-50, -25, -10, 0, 10, 25, 50]
  metricKeys?: ExperimentalMetricKey[];
}

/**
 * Root SCOS Sensitivity Analysis Framework Summary
 */
export interface SensitivityAnalysisFramework {
  frameworkVersion: string;
  generatedAt: string;
  canonicalHash: string;
  totalParametersAudited: number;
  totalPerturbationsEvaluated: number;
  overallModelStabilityScore: number; // 0-100%
  robustConclusionsRatio: string;
  parameters: ParameterSensitivityDefinition[];
  oatResults: SensitivityPerturbationResult[];
  tornadoRankings: Record<string, TornadoRankItem[]>;
  compoundStressResults: CompoundStressScenarioResult[];
  rqAssessments: ResearchQuestionRobustnessAssessment[];
  calibrationGaps: EmpiricalCalibrationGap[];
  classificationNotice: string;
  disclaimer: string;
}

/**
 * Test Suite Execution Report for Phase 10F (30 tests)
 */
export interface SensitivityTestSuiteReport {
  suiteId: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  executedAt: string;
  allPassed: boolean;
  results: Array<{
    testId: string;
    testNumber: number;
    name: string;
    category: string;
    passed: boolean;
    durationMs: number;
    details: string;
  }>;
  canonicalHash: string;
  disclaimer: string;
}
