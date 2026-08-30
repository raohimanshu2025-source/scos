// =========================================================================
// SCOS PHASE 10C — STATISTICAL ANALYSIS & UNCERTAINTY LAYER DATA MODELS
// Research-Grade Descriptive Analytics, Uncertainty Scoring & Provenance Engine
// =========================================================================

import { ExperimentalCondition, ExperimentalMetricKey } from './experimentalExecution';
import { ResultValidityClassification } from './comparativeEvaluation';

/**
 * Sample Size Safeguard Classification
 */
export type SampleSizeClassification =
  | 'NO_DATA' // N = 0
  | 'INSUFFICIENT_DATA' // N = 1
  | 'VERY_SMALL_SAMPLE' // N = 2-4
  | 'SMALL_SAMPLE' // N = 5-9
  | 'LIMITED_RESEARCH_SAMPLE' // N = 10-29
  | 'LARGER_DESCRIPTIVE_SAMPLE'; // N >= 30

/**
 * Uncertainty Level Classification
 */
export type UncertaintyClassification =
  | 'LOW_UNCERTAINTY'
  | 'MODERATE_UNCERTAINTY'
  | 'HIGH_UNCERTAINTY'
  | 'INSUFFICIENT_DATA';

/**
 * Data Completeness Assessment Status
 */
export type DataCompletenessStatus =
  | 'COMPLETE'
  | 'PARTIALLY_COMPLETE'
  | 'INCOMPLETE'
  | 'UNAVAILABLE';

/**
 * Metric Direction of Change & Improvement Classification
 */
export type MetricDirectionOfChange =
  | 'IMPROVEMENT'
  | 'REGRESSION'
  | 'NEUTRAL'
  | 'NOT_COMPARABLE';

/**
 * Outlier Retention Status
 */
export type OutlierStatus =
  | 'NO_OUTLIERS_DETECTED'
  | 'POTENTIAL_OUTLIER_RETAINED'
  | 'OUTLIER_ANALYSIS_UNAVAILABLE';

/**
 * Single Descriptive Summary for a Condition and Metric
 */
export interface DescriptiveStatistics {
  sampleSize: number; // N
  validObservationCount: number;
  missingObservationCount: number;
  mean: number | null;
  median: number | null;
  minimum: number | null;
  maximum: number | null;
  range: number | null;
  variance: number | null;
  standardDeviation: number | null;
  coefficientOfVariation: number | null; // % (CV = (stdDev / mean) * 100)
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  values: number[];
  validityClassification: ResultValidityClassification;
  sampleSizeClassification: SampleSizeClassification;
  sampleSizeWarning: string;
  centralTendencySensitivity: boolean; // Flagged if |mean - median| / mean > 0.20
}

/**
 * Condition-Specific Statistics Bundle
 */
export interface ConditionStatistics {
  condition: ExperimentalCondition;
  conditionDisplayName: string;
  scenarioIds: string[];
  executionRunIds: string[];
  stats: DescriptiveStatistics;
}

/**
 * Scenario-Level Metric Observation Pair
 */
export interface ScenarioMetricResult {
  scenarioId: string;
  scenarioCode: string;
  scenarioName: string;
  baselineValue: number | null;
  scosValue: number | null;
  absoluteDifference: number | null;
  relativeChangePercent: number | null;
  directionOfChange: MetricDirectionOfChange;
  baselineRunId?: string;
  scosRunId?: string;
  validity: ResultValidityClassification;
  dataCompleteness: DataCompletenessStatus;
  notes?: string;
}

/**
 * Uncertainty Assessment Record
 */
export interface UncertaintyAssessment {
  level: UncertaintyClassification;
  score: number; // 0 (low uncertainty) to 100 (high uncertainty)
  sampleSizeReason: string;
  variabilityReason: string;
  completenessReason: string;
  summaryReason: string;
  isDescriptiveOnly: boolean;
}

/**
 * Exploratory Outlier Assessment Record
 */
export interface OutlierAssessment {
  status: OutlierStatus;
  outlierCount: number;
  lowerBound: number | null;
  upperBound: number | null;
  flaggedObservations: Array<{
    scenarioId: string;
    condition: ExperimentalCondition;
    runId: string;
    value: number;
    reason: string;
  }>;
  methodology: string;
  retentionNotice: string;
}

/**
 * Sample Size Assessment
 */
export interface SampleSizeAssessment {
  classification: SampleSizeClassification;
  nManual: number;
  nScos: number;
  scenarioCount: number;
  recommendation: string;
  isSmallSampleWarningActive: boolean;
  disclaimer: string;
}

/**
 * Missing Data Assessment
 */
export interface MissingDataAssessment {
  status: DataCompletenessStatus;
  totalExpectedObservations: number;
  totalRecordedObservations: number;
  missingRunsCount: number;
  missingMetricObservationsCount: number;
  incompleteSessionsCount: number;
  completenessPercentage: number;
  missingDetails: string[];
}

/**
 * Comprehensive Comparative Metric Statistics (M1–M10)
 */
export interface MetricStatistics {
  metricKey: ExperimentalMetricKey;
  metricCode: string; // e.g. "M1", "M2"
  metricName: string;
  unit: string;
  desiredDirection: 'LOWER_IS_BETTER' | 'HIGHER_IS_BETTER';
  calculationMethod: string;
  formula: string;

  manualStats: DescriptiveStatistics;
  scosStats: DescriptiveStatistics;

  comparison: {
    absoluteDifference: number | null; // SCOS - Manual
    relativeChangePercent: number | null; // ((SCOS - Manual) / Manual) * 100
    directionOfChange: MetricDirectionOfChange;
    interpretation: string;
    stdDevDifference: number | null;
  };

  scenarioBreakdown: ScenarioMetricResult[];
  uncertainty: UncertaintyAssessment;
  outliers: OutlierAssessment;
  validity: ResultValidityClassification;
  notes: string;
}

/**
 * Complete Statistical Analysis Snapshot & Export Schema
 */
export interface StatisticalAnalysisSnapshot {
  analysisId: string;
  analysisVersion: string;
  datasetVersion: string;
  generatedAt: string;
  generatedBy: string;

  metadata: {
    title: string;
    institution: string;
    purpose: string;
    framework: string;
    classification: 'SIMULATED / PROTOTYPE DATA';
    descriptiveNotice: string;
  };

  coverage: {
    scenarioIds: string[];
    scenarioCount: number;
    totalRunsAnalyzed: number;
    baselineRunsCount: number;
    scosRunsCount: number;
    sessionsAnalyzed: string[];
    metricsCount: number;
  };

  sampleSizeAssessment: SampleSizeAssessment;
  missingDataAssessment: MissingDataAssessment;

  metrics: Record<ExperimentalMetricKey, MetricStatistics>;

  aggregateSummary: {
    overallDataCompletenessPercent: number;
    metricsAnalyzedCount: number;
    metricsWithImprovement: number;
    metricsWithRegression: number;
    metricsNeutralOrUnavailable: number;
    overallUncertaintyScore: number;
    meanDurationReductionPercent: number | null;
    meanContextCompletenessGainPercent: number | null;
    meanInfrastructureAwarenessGainPercent: number | null;
    meanDecisionTraceabilityGainPercent: number | null;
  };

  provenance: {
    researchDatasetVersion: string;
    scenarioIds: string[];
    executionRunIds: string[];
    sourceConditionA: string;
    sourceConditionB: string;
    reproducibilityStandard: string;
    analysisMethodVersion: string;
    canonicalPayloadHash: string; // SHA-256
    auditId: string;
    isSimulatedPrototype: boolean;
  };

  reproducibilityStatus?: {
    isReproducible: boolean;
    computedFingerprint: string;
    storedFingerprint: string;
    verifiedAt: string;
  };

  limitations: string[];
}

/**
 * Statistical Analysis Summary for Quick Header Display
 */
export interface StatisticalAnalysisSummary {
  analysisId: string;
  datasetVersion: string;
  scenarioCount: number;
  baselineRunsCount: number;
  scosRunsCount: number;
  totalRunsCount: number;
  dataCompletenessPercent: number;
  sampleSizeClassification: SampleSizeClassification;
  analysisFingerprint: string;
  generatedAt: string;
  classificationNotice: string;
  disclaimer: string;
}
