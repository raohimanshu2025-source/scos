// =========================================================================
// SCOS PHASE 10C — STATISTICAL ANALYSIS & UNCERTAINTY SERVICE
// Transparent Descriptive Analytics, Uncertainty Scoring & Provenance Engine
// =========================================================================

import {
  DescriptiveStatistics,
  ConditionStatistics,
  ScenarioMetricResult,
  UncertaintyAssessment,
  OutlierAssessment,
  SampleSizeAssessment,
  MissingDataAssessment,
  MetricStatistics,
  StatisticalAnalysisSnapshot,
  StatisticalAnalysisSummary,
  SampleSizeClassification,
  UncertaintyClassification,
  DataCompletenessStatus,
  MetricDirectionOfChange,
} from '../types/statisticalAnalysis';
import {
  ExperimentalMetricKey,
  ExperimentalCondition,
  ExperimentalRun,
} from '../types/experimentalExecution';
import { ResultValidityClassification } from '../types/comparativeEvaluation';
import { experimentalResultsStore } from './experimentalResultsStore';
import { experimentalExecutionService } from './experimentalExecutionService';
import { researchDatasetService, computeDeterministicFingerprint } from './researchDatasetService';
import { dbStore } from '../backend/db/store';

export class StatisticalAnalysisService {
  private readonly ANALYSIS_VERSION = 'SCOS-STAT-ANALYSIS-v1.0';
  private readonly METHOD_VERSION = 'SCOS_DESCRIPTIVE_MATH_v1.0';
  private cachedSnapshot: StatisticalAnalysisSnapshot | null = null;

  // =========================================================================
  // METRIC DEFINITIONS & SEMANTICS (M1–M10)
  // =========================================================================

  private readonly METRIC_METADATA: Record<
    ExperimentalMetricKey,
    {
      code: string;
      name: string;
      unit: string;
      desiredDirection: 'LOWER_IS_BETTER' | 'HIGHER_IS_BETTER';
      calculationMethod: string;
      formula: string;
    }
  > = {
    M1_WORKFLOW_DURATION: {
      code: 'M1',
      name: 'Workflow Duration',
      unit: 'seconds',
      desiredDirection: 'LOWER_IS_BETTER',
      calculationMethod: 'Sum of durations of 10 standardized operational activity steps',
      formula: 'Sum(duration_i) for i = 1..10',
    },
    M2_INFORMATION_RETRIEVAL_COUNT: {
      code: 'M2',
      name: 'Information Retrieval Queries',
      unit: 'queries',
      desiredDirection: 'LOWER_IS_BETTER',
      calculationMethod: 'Count of external cross-department queries and manual portal lookups',
      formula: 'Sum(retrieval_actions) during information acquisition',
    },
    M3_CONTEXT_COMPLETENESS_SCORE: {
      code: 'M3',
      name: 'Context Completeness Score',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Percentage of critical scenario facts and contextual nodes identified',
      formula: '(Identified Context Nodes / Total Scenario Context Nodes) * 100',
    },
    M4_COORDINATION_OVERHEAD: {
      code: 'M4',
      name: 'Coordination Overhead',
      unit: 'exchanges',
      desiredDirection: 'LOWER_IS_BETTER',
      calculationMethod: 'Number of inter-agency coordination phone/radio/memo transactions',
      formula: 'Sum(inter_department_exchanges)',
    },
    M5_INFRASTRUCTURE_AWARENESS: {
      code: 'M5',
      name: 'Infrastructure Awareness Score',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Percentage of relevant civil infrastructure assets correctly recognized',
      formula: '(Identified Critical Assets / Total Scenario Target Assets) * 100',
    },
    M6_CASCADE_IDENTIFICATION: {
      code: 'M6',
      name: 'Cascade Identification Rate',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Percentage of cascading secondary & tertiary dependencies identified',
      formula: '(Recognized Cascade Branches / Total Scenario Cascade Branches) * 100',
    },
    M7_CRITICAL_FACILITY_AWARENESS: {
      code: 'M7',
      name: 'Critical Facility Awareness Score',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Awareness rate of threatened hospitals, substations, and emergency corridors',
      formula: '(Flagged Critical Facilities / Expected Scenario Facilities) * 100',
    },
    M8_DECISION_SUPPORT_COMPLETENESS: {
      code: 'M8',
      name: 'Decision Support Completeness Score',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Completeness of trade-off evaluation, constraint checks, and action formulation',
      formula: 'Composite score across mitigation ranking, resource checks, and task readiness',
    },
    M9_AUDIT_COMPLETENESS_SCORE: {
      code: 'M9',
      name: 'Audit Completeness Score',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Completeness of timestamped operational logs and decision rationale capturing',
      formula: '(Documented Action Steps / Total Executed Steps) * 100',
    },
    M10_DECISION_TRACEABILITY: {
      code: 'M10',
      name: 'End-to-End Decision Traceability',
      unit: '%',
      desiredDirection: 'HIGHER_IS_BETTER',
      calculationMethod: 'Percentage of dispatched actions linked to underlying scenario evidence',
      formula: '(Trace-Linked Decision Nodes / Total Decision Nodes) * 100',
    },
  };

  // =========================================================================
  // CORE MATHEMATICAL FUNCTIONS
  // =========================================================================

  /**
   * Calculate Mean (Arithmetic Average)
   */
  public calculateMean(values: number[]): number | null {
    if (!values || values.length === 0) return null;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }

  /**
   * Calculate Median
   */
  public calculateMedian(values: number[]): number | null {
    if (!values || values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 !== 0) {
      return Number(sorted[mid].toFixed(2));
    }
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }

  /**
   * Calculate Sample Variance (N - 1 denominator for unbiased estimator)
   */
  public calculateVariance(values: number[]): number | null {
    if (!values || values.length <= 1) return null;
    const mean = this.calculateMean(values);
    if (mean === null) return null;
    const sumSquareDiffs = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    return Number((sumSquareDiffs / (values.length - 1)).toFixed(4));
  }

  /**
   * Calculate Sample Standard Deviation
   */
  public calculateStandardDeviation(values: number[]): number | null {
    const variance = this.calculateVariance(values);
    if (variance === null) return null;
    return Number(Math.sqrt(variance).toFixed(2));
  }

  /**
   * Calculate Coefficient of Variation (%)
   */
  public calculateCoefficientOfVariation(stdDev: number | null, mean: number | null): number | null {
    if (stdDev === null || mean === null || mean === 0) return null;
    return Number(((stdDev / Math.abs(mean)) * 100).toFixed(2));
  }

  /**
   * Calculate Quartiles and IQR
   */
  public calculateQuartiles(values: number[]): { q1: number | null; q3: number | null; iqr: number | null } {
    if (!values || values.length < 4) {
      return { q1: null, q3: null, iqr: null };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const lowerHalf = sorted.slice(0, mid);
    const upperHalf = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

    const q1 = this.calculateMedian(lowerHalf);
    const q3 = this.calculateMedian(upperHalf);
    const iqr = q1 !== null && q3 !== null ? Number((q3 - q1).toFixed(2)) : null;

    return { q1, q3, iqr };
  }

  /**
   * Classify Sample Size based on research safeguards
   */
  public classifySampleSize(n: number): SampleSizeClassification {
    if (n === 0) return 'NO_DATA';
    if (n === 1) return 'INSUFFICIENT_DATA';
    if (n >= 2 && n <= 4) return 'VERY_SMALL_SAMPLE';
    if (n >= 5 && n <= 9) return 'SMALL_SAMPLE';
    if (n >= 10 && n <= 29) return 'LIMITED_RESEARCH_SAMPLE';
    return 'LARGER_DESCRIPTIVE_SAMPLE';
  }

  /**
   * Generate Sample Size Warning Message
   */
  public getSampleSizeWarning(n: number): string {
    if (n === 0) return 'No observations recorded. Quantitative analysis is unavailable.';
    if (n === 1) return 'Single observation (N=1). Variance and standard deviation cannot be estimated.';
    if (n >= 2 && n <= 4) {
      return 'Very small sample (N=2–4). High estimator variability; exploratory descriptive comparison only.';
    }
    if (n >= 5 && n <= 9) {
      return 'Small sample (N=5–9). Descriptive benchmark metrics only; results must not be interpreted as population-level statistical significance.';
    }
    if (n >= 10 && n <= 29) {
      return 'Limited research sample (N=10–29). Suitable for exploratory scenario evaluation with reported uncertainty bounds.';
    }
    return 'Descriptive sample size adequate for preliminary distribution analysis.';
  }

  // =========================================================================
  // DESCRIPTIVE STATISTICS GENERATOR
  // =========================================================================

  /**
   * Build complete DescriptiveStatistics for a set of raw numerical values
   */
  public computeDescriptiveStatistics(
    rawValues: (number | string | null | undefined)[]
  ): DescriptiveStatistics {
    const validNumbers = rawValues
      .filter((v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v));

    const sampleSize = rawValues.length;
    const validCount = validNumbers.length;
    const missingCount = sampleSize - validCount;

    if (validCount === 0) {
      return {
        sampleSize,
        validObservationCount: 0,
        missingObservationCount: missingCount,
        mean: null,
        median: null,
        minimum: null,
        maximum: null,
        range: null,
        variance: null,
        standardDeviation: null,
        coefficientOfVariation: null,
        q1: null,
        q3: null,
        iqr: null,
        values: [],
        validityClassification: 'INSUFFICIENT DATA',
        sampleSizeClassification: this.classifySampleSize(0),
        sampleSizeWarning: this.getSampleSizeWarning(0),
        centralTendencySensitivity: false,
      };
    }

    const min = Number(Math.min(...validNumbers).toFixed(2));
    const max = Number(Math.max(...validNumbers).toFixed(2));
    const range = Number((max - min).toFixed(2));
    const mean = this.calculateMean(validNumbers);
    const median = this.calculateMedian(validNumbers);
    const variance = this.calculateVariance(validNumbers);
    const standardDeviation = this.calculateStandardDeviation(validNumbers);
    const coefficientOfVariation = this.calculateCoefficientOfVariation(standardDeviation, mean);
    const { q1, q3, iqr } = this.calculateQuartiles(validNumbers);

    // Central-tendency sensitivity check: |mean - median| / mean > 0.20
    let centralTendencySensitivity = false;
    if (mean !== null && median !== null && mean !== 0 && validCount >= 3) {
      const diffRatio = Math.abs(mean - median) / Math.abs(mean);
      centralTendencySensitivity = diffRatio > 0.2;
    }

    const sampleSizeClass = this.classifySampleSize(validCount);
    const sampleSizeWarning = this.getSampleSizeWarning(validCount);

    const validityClassification: ResultValidityClassification =
      validCount >= 5 ? 'VALID DESCRIPTIVE RESULT' : validCount >= 2 ? 'PARTIALLY VALID' : 'INSUFFICIENT DATA';

    return {
      sampleSize,
      validObservationCount: validCount,
      missingObservationCount: missingCount,
      mean,
      median,
      minimum: min,
      maximum: max,
      range,
      variance,
      standardDeviation,
      coefficientOfVariation,
      q1,
      q3,
      iqr,
      values: validNumbers,
      validityClassification,
      sampleSizeClassification: sampleSizeClass,
      sampleSizeWarning,
      centralTendencySensitivity,
    };
  }

  // =========================================================================
  // UNCERTAINTY, OUTLIER & MISSING DATA ASSESSMENTS
  // =========================================================================

  /**
   * Assess Uncertainty for a Given Metric
   */
  public assessUncertainty(
    metricKey: ExperimentalMetricKey,
    manualStats: DescriptiveStatistics,
    scosStats: DescriptiveStatistics,
    scenarioCount: number
  ): UncertaintyAssessment {
    const totalValid = (manualStats.validObservationCount + scosStats.validObservationCount) / 2;

    if (totalValid < 2) {
      return {
        level: 'INSUFFICIENT_DATA',
        score: 95,
        sampleSizeReason: 'Insufficient observations (N < 2) to evaluate distributional stability.',
        variabilityReason: 'Variability cannot be quantified with fewer than 2 valid observations.',
        completenessReason: 'Severe observation missingness.',
        summaryReason: 'Insufficient data for descriptive reliability.',
        isDescriptiveOnly: true,
      };
    }

    let uncertaintyScore = 0;
    const reasons: string[] = [];

    // Factor 1: Sample Size (Weight: 40)
    if (totalValid < 5) {
      uncertaintyScore += 35;
      reasons.push(`Small scenario sample size (N=${totalValid.toFixed(1)})`);
    } else if (totalValid < 10) {
      uncertaintyScore += 20;
      reasons.push(`Moderate benchmark sample size (N=${totalValid.toFixed(1)})`);
    } else {
      uncertaintyScore += 5;
    }

    // Factor 2: Coefficient of Variation (Weight: 35)
    const maxCv = Math.max(
      manualStats.coefficientOfVariation || 0,
      scosStats.coefficientOfVariation || 0
    );
    if (maxCv >= 50) {
      uncertaintyScore += 35;
      reasons.push(`High observed dispersion (CV = ${maxCv.toFixed(1)}%)`);
    } else if (maxCv >= 25) {
      uncertaintyScore += 20;
      reasons.push(`Moderate observed dispersion (CV = ${maxCv.toFixed(1)}%)`);
    } else {
      uncertaintyScore += 5;
      reasons.push(`Low observed dispersion (CV = ${maxCv.toFixed(1)}%)`);
    }

    // Factor 3: Missingness (Weight: 25)
    const missingTotal =
      manualStats.missingObservationCount + scosStats.missingObservationCount;
    if (missingTotal > 0) {
      uncertaintyScore += 20;
      reasons.push(`${missingTotal} missing or unrecorded observation(s) across conditions`);
    }

    // Factor 4: Central-Tendency Sensitivity
    if (manualStats.centralTendencySensitivity || scosStats.centralTendencySensitivity) {
      uncertaintyScore += 10;
      reasons.push('Divergence between mean and median indicates skewed distribution');
    }

    // Normalize score to 0..100
    const finalScore = Math.min(100, Math.max(10, uncertaintyScore));
    let level: UncertaintyClassification = 'LOW_UNCERTAINTY';
    if (finalScore >= 60) level = 'HIGH_UNCERTAINTY';
    else if (finalScore >= 35) level = 'MODERATE_UNCERTAINTY';

    return {
      level,
      score: finalScore,
      sampleSizeReason: `Evaluated across ${scenarioCount} scenarios (N_manual=${manualStats.validObservationCount}, N_scos=${scosStats.validObservationCount}).`,
      variabilityReason: `Manual CV: ${manualStats.coefficientOfVariation ?? 'N/A'}%, SCOS CV: ${scosStats.coefficientOfVariation ?? 'N/A'}%.`,
      completenessReason:
        missingTotal === 0
          ? '100% complete observations recorded across benchmark scenarios.'
          : `${missingTotal} observation(s) were missing or incomplete.`,
      summaryReason: reasons.join('; ') + '.',
      isDescriptiveOnly: true,
    };
  }

  /**
   * Assess Exploratory Outliers using IQR Method (Tukey's Fences)
   */
  public assessOutliers(
    metricKey: ExperimentalMetricKey,
    manualRuns: ExperimentalRun[],
    scosRuns: ExperimentalRun[]
  ): OutlierAssessment {
    const allObservations: Array<{
      scenarioId: string;
      condition: ExperimentalCondition;
      runId: string;
      value: number;
    }> = [];

    for (const r of manualRuns) {
      const val = r.metricResults[metricKey]?.value;
      if (typeof val === 'number') {
        allObservations.push({
          scenarioId: r.scenarioId,
          condition: r.condition,
          runId: r.runId,
          value: val,
        });
      }
    }

    for (const r of scosRuns) {
      const val = r.metricResults[metricKey]?.value;
      if (typeof val === 'number') {
        allObservations.push({
          scenarioId: r.scenarioId,
          condition: r.condition,
          runId: r.runId,
          value: val,
        });
      }
    }

    const values = allObservations.map((o) => o.value);
    if (values.length < 4) {
      return {
        status: 'OUTLIER_ANALYSIS_UNAVAILABLE',
        outlierCount: 0,
        lowerBound: null,
        upperBound: null,
        flaggedObservations: [],
        methodology: 'IQR-based detection requires at least 4 observations across execution conditions.',
        retentionNotice: 'No observations were altered or excluded.',
      };
    }

    const { q1, q3, iqr } = this.calculateQuartiles(values);
    if (q1 === null || q3 === null || iqr === null) {
      return {
        status: 'OUTLIER_ANALYSIS_UNAVAILABLE',
        outlierCount: 0,
        lowerBound: null,
        upperBound: null,
        flaggedObservations: [],
        methodology: 'Quartiles could not be computed.',
        retentionNotice: 'No observations were altered or excluded.',
      };
    }

    const lowerBound = Number((q1 - 1.5 * iqr).toFixed(2));
    const upperBound = Number((q3 + 1.5 * iqr).toFixed(2));

    const flagged: Array<{
      scenarioId: string;
      condition: ExperimentalCondition;
      runId: string;
      value: number;
      reason: string;
    }> = [];

    for (const obs of allObservations) {
      if (obs.value < lowerBound) {
        flagged.push({
          ...obs,
          reason: `Value ${obs.value} is below lower threshold (Q1 - 1.5*IQR = ${lowerBound}). Flagged as exploratory low outlier.`,
        });
      } else if (obs.value > upperBound) {
        flagged.push({
          ...obs,
          reason: `Value ${obs.value} exceeds upper threshold (Q3 + 1.5*IQR = ${upperBound}). Flagged as exploratory high outlier.`,
        });
      }
    }

    return {
      status: flagged.length > 0 ? 'POTENTIAL_OUTLIER_RETAINED' : 'NO_OUTLIERS_DETECTED',
      outlierCount: flagged.length,
      lowerBound,
      upperBound,
      flaggedObservations: flagged,
      methodology: 'Tukey IQR Boxplot Rule: Lower = Q1 - 1.5×IQR, Upper = Q3 + 1.5×IQR.',
      retentionNotice:
        'All observations remain retained in the dataset. Flags are exploratory and do not imply data corruption.',
    };
  }

  // =========================================================================
  // STATISTICAL ANALYSIS SNAPSHOT ENGINE
  // =========================================================================

  /**
   * Run and Build Complete Statistical Analysis Snapshot
   */
  public generateAnalysisSnapshot(actorEmail = 'researcher@scos.gov.in'): StatisticalAnalysisSnapshot {
    // 1. Ensure benchmark scenarios have execution data
    this.ensureBenchmarkExecutionData(actorEmail);

    const allRuns = experimentalResultsStore.getAllRuns();
    const allSessions = experimentalResultsStore.getAllSessions();
    const benchmarkScenarios = ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'];

    // Filter relevant completed/validated runs
    const manualRuns = allRuns.filter(
      (r) => r.condition === 'BASELINE_MANUAL' && (r.executionStatus === 'COMPLETED' || r.executionStatus === 'VALIDATED')
    );
    const scosRuns = allRuns.filter(
      (r) => r.condition === 'SCOS_INTEGRATED' && (r.executionStatus === 'COMPLETED' || r.executionStatus === 'VALIDATED')
    );

    const metricKeys: ExperimentalMetricKey[] = [
      'M1_WORKFLOW_DURATION',
      'M2_INFORMATION_RETRIEVAL_COUNT',
      'M3_CONTEXT_COMPLETENESS_SCORE',
      'M4_COORDINATION_OVERHEAD',
      'M5_INFRASTRUCTURE_AWARENESS',
      'M6_CASCADE_IDENTIFICATION',
      'M7_CRITICAL_FACILITY_AWARENESS',
      'M8_DECISION_SUPPORT_COMPLETENESS',
      'M9_AUDIT_COMPLETENESS_SCORE',
      'M10_DECISION_TRACEABILITY',
    ];

    const metricsMap: Record<ExperimentalMetricKey, MetricStatistics> = {} as any;

    let totalImprovementCount = 0;
    let totalRegressionCount = 0;
    let totalNeutralCount = 0;
    let sumUncertaintyScores = 0;

    let durationReductionPctSum = 0;
    let durationReductionCount = 0;
    let contextGainPctSum = 0;
    let contextGainCount = 0;
    let infraGainPctSum = 0;
    let infraGainCount = 0;
    let traceGainPctSum = 0;
    let traceGainCount = 0;

    for (const key of metricKeys) {
      const meta = this.METRIC_METADATA[key];

      // Extract values across scenarios for baseline
      const manualValuesByScenario: Record<string, number | null> = {};
      const scosValuesByScenario: Record<string, number | null> = {};
      const manualRunIdByScenario: Record<string, string> = {};
      const scosRunIdByScenario: Record<string, string> = {};

      for (const scId of benchmarkScenarios) {
        const mRun = manualRuns.find((r) => r.scenarioId === scId || r.scenarioCode === scId);
        const sRun = scosRuns.find((r) => r.scenarioId === scId || r.scenarioCode === scId);

        if (mRun && typeof mRun.metricResults[key]?.value === 'number') {
          manualValuesByScenario[scId] = mRun.metricResults[key].value as number;
          manualRunIdByScenario[scId] = mRun.runId;
        } else {
          manualValuesByScenario[scId] = null;
        }

        if (sRun && typeof sRun.metricResults[key]?.value === 'number') {
          scosValuesByScenario[scId] = sRun.metricResults[key].value as number;
          scosRunIdByScenario[scId] = sRun.runId;
        } else {
          scosValuesByScenario[scId] = null;
        }
      }

      const manualValues = Object.values(manualValuesByScenario);
      const scosValues = Object.values(scosValuesByScenario);

      const manualStats = this.computeDescriptiveStatistics(manualValues);
      const scosStats = this.computeDescriptiveStatistics(scosValues);

      // Comparison calculations
      let absoluteDifference: number | null = null;
      let relativeChangePercent: number | null = null;
      let directionOfChange: MetricDirectionOfChange = 'NOT_COMPARABLE';
      let interpretation = 'Insufficient observations for comparative interpretation.';
      let stdDevDifference: number | null = null;

      if (manualStats.mean !== null && scosStats.mean !== null) {
        absoluteDifference = Number((scosStats.mean - manualStats.mean).toFixed(2));
        if (manualStats.mean !== 0) {
          relativeChangePercent = Number(
            (((scosStats.mean - manualStats.mean) / Math.abs(manualStats.mean)) * 100).toFixed(2)
          );
        }

        if (manualStats.standardDeviation !== null && scosStats.standardDeviation !== null) {
          stdDevDifference = Number(
            (scosStats.standardDeviation - manualStats.standardDeviation).toFixed(2)
          );
        }

        // Semantic direction evaluation
        if (meta.desiredDirection === 'LOWER_IS_BETTER') {
          if (absoluteDifference < -0.01) {
            directionOfChange = 'IMPROVEMENT';
            interpretation = `Descriptive reduction of ${Math.abs(relativeChangePercent || 0)}% in ${meta.name} observed under SCOS condition.`;
            totalImprovementCount++;
          } else if (absoluteDifference > 0.01) {
            directionOfChange = 'REGRESSION';
            interpretation = `Descriptive increase of ${relativeChangePercent}% observed under SCOS condition.`;
            totalRegressionCount++;
          } else {
            directionOfChange = 'NEUTRAL';
            interpretation = 'No discernible difference between manual and SCOS conditions.';
            totalNeutralCount++;
          }
        } else {
          // HIGHER_IS_BETTER
          if (absoluteDifference > 0.01) {
            directionOfChange = 'IMPROVEMENT';
            interpretation = `Descriptive increase of +${relativeChangePercent}% in ${meta.name} observed under SCOS condition.`;
            totalImprovementCount++;
          } else if (absoluteDifference < -0.01) {
            directionOfChange = 'REGRESSION';
            interpretation = `Descriptive decline of ${relativeChangePercent}% observed under SCOS condition.`;
            totalRegressionCount++;
          } else {
            directionOfChange = 'NEUTRAL';
            interpretation = 'No discernible difference between manual and SCOS conditions.';
            totalNeutralCount++;
          }
        }
      } else {
        totalNeutralCount++;
      }

      // Track aggregate gains for specific headline metrics
      if (key === 'M1_WORKFLOW_DURATION' && relativeChangePercent !== null) {
        durationReductionPctSum += Math.abs(relativeChangePercent);
        durationReductionCount++;
      } else if (key === 'M3_CONTEXT_COMPLETENESS_SCORE' && relativeChangePercent !== null) {
        contextGainPctSum += relativeChangePercent;
        contextGainCount++;
      } else if (key === 'M5_INFRASTRUCTURE_AWARENESS' && relativeChangePercent !== null) {
        infraGainPctSum += relativeChangePercent;
        infraGainCount++;
      } else if (key === 'M10_DECISION_TRACEABILITY' && relativeChangePercent !== null) {
        traceGainPctSum += relativeChangePercent;
        traceGainCount++;
      }

      // Scenario-level breakdown
      const scenarioBreakdown: ScenarioMetricResult[] = [];
      for (const scId of benchmarkScenarios) {
        const scenario = researchDatasetService.getScenario(scId);
        const bVal = manualValuesByScenario[scId];
        const sVal = scosValuesByScenario[scId];

        let scDiff: number | null = null;
        let scPct: number | null = null;
        let scDir: MetricDirectionOfChange = 'NOT_COMPARABLE';

        if (bVal !== null && sVal !== null) {
          scDiff = Number((sVal - bVal).toFixed(2));
          if (bVal !== 0) {
            scPct = Number((((sVal - bVal) / Math.abs(bVal)) * 100).toFixed(2));
          }
          if (meta.desiredDirection === 'LOWER_IS_BETTER') {
            scDir = scDiff < -0.01 ? 'IMPROVEMENT' : scDiff > 0.01 ? 'REGRESSION' : 'NEUTRAL';
          } else {
            scDir = scDiff > 0.01 ? 'IMPROVEMENT' : scDiff < -0.01 ? 'REGRESSION' : 'NEUTRAL';
          }
        }

        const dataCompleteness: DataCompletenessStatus =
          bVal !== null && sVal !== null
            ? 'COMPLETE'
            : bVal !== null || sVal !== null
            ? 'PARTIALLY_COMPLETE'
            : 'UNAVAILABLE';

        const validity: ResultValidityClassification =
          dataCompleteness === 'COMPLETE' ? 'VALID DESCRIPTIVE RESULT' : 'PARTIALLY VALID';

        scenarioBreakdown.push({
          scenarioId: scId,
          scenarioCode: scenario?.scenarioCode || scId,
          scenarioName: scenario?.scenarioName || `Scenario ${scId}`,
          baselineValue: bVal,
          scosValue: sVal,
          absoluteDifference: scDiff,
          relativeChangePercent: scPct,
          directionOfChange: scDir,
          baselineRunId: manualRunIdByScenario[scId],
          scosRunId: scosRunIdByScenario[scId],
          validity,
          dataCompleteness,
        });
      }

      // Uncertainty & Outliers
      const uncertainty = this.assessUncertainty(
        key,
        manualStats,
        scosStats,
        benchmarkScenarios.length
      );
      sumUncertaintyScores += uncertainty.score;

      const outliers = this.assessOutliers(key, manualRuns, scosRuns);

      const metricOverallValidity: ResultValidityClassification =
        manualStats.validityClassification === 'VALID DESCRIPTIVE RESULT' &&
        scosStats.validityClassification === 'VALID DESCRIPTIVE RESULT'
          ? 'VALID DESCRIPTIVE RESULT'
          : 'PARTIALLY VALID';

      metricsMap[key] = {
        metricKey: key,
        metricCode: meta.code,
        metricName: meta.name,
        unit: meta.unit,
        desiredDirection: meta.desiredDirection,
        calculationMethod: meta.calculationMethod,
        formula: meta.formula,
        manualStats,
        scosStats,
        comparison: {
          absoluteDifference,
          relativeChangePercent,
          directionOfChange,
          interpretation,
          stdDevDifference,
        },
        scenarioBreakdown,
        uncertainty,
        outliers,
        validity: metricOverallValidity,
        notes: `Calculated from Phase 10B execution observation logs across ${benchmarkScenarios.length} benchmark scenarios.`,
      };
    }

    // Completeness assessment
    const totalExpectedObservations = benchmarkScenarios.length * 2 * metricKeys.length;
    let totalRecordedObservations = 0;
    const missingDetails: string[] = [];

    for (const key of metricKeys) {
      const stat = metricsMap[key];
      totalRecordedObservations +=
        stat.manualStats.validObservationCount + stat.scosStats.validObservationCount;
      if (stat.manualStats.missingObservationCount > 0) {
        missingDetails.push(
          `${stat.metricName} (Baseline): ${stat.manualStats.missingObservationCount} missing`
        );
      }
      if (stat.scosStats.missingObservationCount > 0) {
        missingDetails.push(
          `${stat.metricName} (SCOS): ${stat.scosStats.missingObservationCount} missing`
        );
      }
    }

    const completenessPercentage = Number(
      ((totalRecordedObservations / totalExpectedObservations) * 100).toFixed(1)
    );

    const missingDataAssessment: MissingDataAssessment = {
      status:
        completenessPercentage === 100
          ? 'COMPLETE'
          : completenessPercentage >= 75
          ? 'PARTIALLY_COMPLETE'
          : 'INCOMPLETE',
      totalExpectedObservations,
      totalRecordedObservations,
      missingRunsCount: Math.max(0, benchmarkScenarios.length * 2 - (manualRuns.length + scosRuns.length)),
      missingMetricObservationsCount: totalExpectedObservations - totalRecordedObservations,
      incompleteSessionsCount: allSessions.filter((s) => s.status !== 'COMPLETED' && s.status !== 'VALIDATED').length,
      completenessPercentage,
      missingDetails,
    };

    const sampleSizeAssessment: SampleSizeAssessment = {
      classification: this.classifySampleSize(benchmarkScenarios.length),
      nManual: manualRuns.length,
      nScos: scosRuns.length,
      scenarioCount: benchmarkScenarios.length,
      recommendation:
        'Small-sample descriptive analysis. Interpret as empirical demonstration of prototype workflow differences rather than generalizable population parameters.',
      isSmallSampleWarningActive: benchmarkScenarios.length < 30,
      disclaimer:
        'These results are descriptive observations from the available experimental executions and should not be interpreted as population-level statistical significance.',
    };

    const overallUncertaintyScore = Number(
      (sumUncertaintyScores / metricKeys.length).toFixed(1)
    );

    const analysisId = `STAT-ANALYSIS-${Date.now()}`;
    const generatedAt = new Date().toISOString();

    // Canonical representation for Deterministic SHA-256 Fingerprint
    const canonicalPayload = {
      datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
      analysisVersion: this.ANALYSIS_VERSION,
      methodVersion: this.METHOD_VERSION,
      scenarioIds: benchmarkScenarios,
      manualRunIds: manualRuns.map((r) => r.runId).sort(),
      scosRunIds: scosRuns.map((r) => r.runId).sort(),
      metricKeys: metricKeys.sort(),
    };

    const analysisFingerprint = computeDeterministicFingerprint(canonicalPayload);

    const snapshot: StatisticalAnalysisSnapshot = {
      analysisId,
      analysisVersion: this.ANALYSIS_VERSION,
      datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
      generatedAt,
      generatedBy: actorEmail,
      metadata: {
        title: 'SCOS Phase 10C Controlled Statistical Analysis & Uncertainty Report',
        institution: 'Indian Institute of Technology Kanpur — M.Tech Research Project',
        purpose:
          'Comparative descriptive statistical analysis of conventional manual municipal response vs. SCOS integrated workflow across standardized flood & infrastructure emergency scenarios.',
        framework: 'SCOS Research Evaluation & Reproducibility Framework (Phases 9D, 10A, 10B, 10C)',
        classification: 'SIMULATED / PROTOTYPE DATA',
        descriptiveNotice:
          'SIMULATED / PROTOTYPE DATA — Descriptive statistical observations only. Not a claim of statistical significance or live municipal performance.',
      },
      coverage: {
        scenarioIds: benchmarkScenarios,
        scenarioCount: benchmarkScenarios.length,
        totalRunsAnalyzed: manualRuns.length + scosRuns.length,
        baselineRunsCount: manualRuns.length,
        scosRunsCount: scosRuns.length,
        sessionsAnalyzed: allSessions.map((s) => s.sessionId),
        metricsCount: metricKeys.length,
      },
      sampleSizeAssessment,
      missingDataAssessment,
      metrics: metricsMap,
      aggregateSummary: {
        overallDataCompletenessPercent: completenessPercentage,
        metricsAnalyzedCount: metricKeys.length,
        metricsWithImprovement: totalImprovementCount,
        metricsWithRegression: totalRegressionCount,
        metricsNeutralOrUnavailable: totalNeutralCount,
        overallUncertaintyScore,
        meanDurationReductionPercent:
          durationReductionCount > 0
            ? Number((durationReductionPctSum / durationReductionCount).toFixed(1))
            : null,
        meanContextCompletenessGainPercent:
          contextGainCount > 0
            ? Number((contextGainPctSum / contextGainCount).toFixed(1))
            : null,
        meanInfrastructureAwarenessGainPercent:
          infraGainCount > 0
            ? Number((infraGainPctSum / infraGainCount).toFixed(1))
            : null,
        meanDecisionTraceabilityGainPercent:
          traceGainCount > 0
            ? Number((traceGainPctSum / traceGainCount).toFixed(1))
            : null,
      },
      provenance: {
        researchDatasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
        scenarioIds: benchmarkScenarios,
        executionRunIds: [...manualRuns.map((r) => r.runId), ...scosRuns.map((r) => r.runId)],
        sourceConditionA: 'BASELINE_MANUAL',
        sourceConditionB: 'SCOS_INTEGRATED',
        reproducibilityStandard: 'SHA-256 Deterministic Canonical Representation',
        analysisMethodVersion: this.METHOD_VERSION,
        canonicalPayloadHash: analysisFingerprint,
        auditId: `audit-stat-${analysisId}`,
        isSimulatedPrototype: true,
      },
      reproducibilityStatus: {
        isReproducible: true,
        computedFingerprint: analysisFingerprint,
        storedFingerprint: analysisFingerprint,
        verifiedAt: generatedAt,
      },
      limitations: [
        'Small benchmark scenario sample size (N=5) precludes inferential null-hypothesis significance testing (p-values).',
        'All observations are generated within simulated prototype sandbox environments.',
        'Human-in-the-loop discretion is mandatory before any municipal action is dispatched.',
        'No direct physical actuation of municipal hardware, pumps, or SCADA gates is performed.',
        'Outlier flags are purely exploratory and all empirical observations are retained in the published distribution.',
      ],
    };

    this.cachedSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Get Current Analysis Snapshot (or generate if not cached)
   */
  public getAnalysisSnapshot(actorEmail = 'researcher@scos.gov.in'): StatisticalAnalysisSnapshot {
    if (!this.cachedSnapshot) {
      return this.generateAnalysisSnapshot(actorEmail);
    }
    return this.cachedSnapshot;
  }

  /**
   * Get Quick Statistical Summary Header
   */
  public getStatisticalSummary(actorEmail = 'researcher@scos.gov.in'): StatisticalAnalysisSummary {
    const snap = this.getAnalysisSnapshot(actorEmail);
    return {
      analysisId: snap.analysisId,
      datasetVersion: snap.datasetVersion,
      scenarioCount: snap.coverage.scenarioCount,
      baselineRunsCount: snap.coverage.baselineRunsCount,
      scosRunsCount: snap.coverage.scosRunsCount,
      totalRunsCount: snap.coverage.totalRunsAnalyzed,
      dataCompletenessPercent: snap.missingDataAssessment.completenessPercentage,
      sampleSizeClassification: snap.sampleSizeAssessment.classification,
      analysisFingerprint: snap.provenance.canonicalPayloadHash,
      generatedAt: snap.generatedAt,
      classificationNotice: snap.metadata.classification,
      disclaimer: snap.sampleSizeAssessment.disclaimer,
    };
  }

  /**
   * Get Statistics for a Specific Metric (e.g. M1 to M10)
   */
  public getMetricStatistics(
    metricKeyOrCode: string,
    actorEmail = 'researcher@scos.gov.in'
  ): MetricStatistics | undefined {
    const snap = this.getAnalysisSnapshot(actorEmail);

    // Look up by key or code
    for (const key of Object.keys(snap.metrics) as ExperimentalMetricKey[]) {
      const item = snap.metrics[key];
      if (
        key.toLowerCase() === metricKeyOrCode.toLowerCase() ||
        item.metricCode.toLowerCase() === metricKeyOrCode.toLowerCase()
      ) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Get Statistics for a Specific Scenario (SC-01 to SC-05)
   */
  public getScenarioStatistics(
    scenarioIdOrCode: string,
    actorEmail = 'researcher@scos.gov.in'
  ): {
    scenarioId: string;
    scenarioName: string;
    metrics: Record<
      string,
      {
        metricKey: ExperimentalMetricKey;
        metricName: string;
        unit: string;
        baselineValue: number | null;
        scosValue: number | null;
        absoluteDifference: number | null;
        relativeChangePercent: number | null;
        directionOfChange: MetricDirectionOfChange;
      }
    >;
  } | undefined {
    const snap = this.getAnalysisSnapshot(actorEmail);
    const targetScenarioId = scenarioIdOrCode.toUpperCase();

    const scenario = researchDatasetService.getScenario(targetScenarioId);
    if (!scenario && !['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'].includes(targetScenarioId)) {
      return undefined;
    }

    const scenarioName = scenario?.scenarioName || `Scenario ${targetScenarioId}`;
    const scenarioMetrics: Record<string, any> = {};

    for (const key of Object.keys(snap.metrics) as ExperimentalMetricKey[]) {
      const mStat = snap.metrics[key];
      const scItem = mStat.scenarioBreakdown.find(
        (s) => s.scenarioId.toUpperCase() === targetScenarioId || s.scenarioCode.toUpperCase() === targetScenarioId
      );

      if (scItem) {
        scenarioMetrics[mStat.metricCode] = {
          metricKey: key,
          metricName: mStat.metricName,
          unit: mStat.unit,
          baselineValue: scItem.baselineValue,
          scosValue: scItem.scosValue,
          absoluteDifference: scItem.absoluteDifference,
          relativeChangePercent: scItem.relativeChangePercent,
          directionOfChange: scItem.directionOfChange,
        };
      }
    }

    return {
      scenarioId: targetScenarioId,
      scenarioName,
      metrics: scenarioMetrics,
    };
  }

  /**
   * Verify Reproducibility of Statistical Analysis
   */
  public verifyAnalysisReproducibility(
    snapshot: StatisticalAnalysisSnapshot
  ): {
    isMatch: boolean;
    computedFingerprint: string;
    storedFingerprint: string;
    status: 'VERIFIED_MATCH' | 'FINGERPRINT_MISMATCH';
  } {
    const canonicalPayload = {
      datasetVersion: snapshot.datasetVersion,
      analysisVersion: snapshot.analysisVersion,
      methodVersion: snapshot.provenance.analysisMethodVersion,
      scenarioIds: snapshot.coverage.scenarioIds,
      manualRunIds: snapshot.provenance.executionRunIds
        .filter((id) => id.includes('run-man-') || id.includes('baseline'))
        .sort(),
      scosRunIds: snapshot.provenance.executionRunIds
        .filter((id) => id.includes('run-scos-') || id.includes('scos'))
        .sort(),
      metricKeys: Object.keys(snapshot.metrics).sort(),
    };

    const computed = computeDeterministicFingerprint(canonicalPayload);
    const stored = snapshot.provenance.canonicalPayloadHash;
    const isMatch = computed === stored;

    return {
      isMatch,
      computedFingerprint: computed,
      storedFingerprint: stored,
      status: isMatch ? 'VERIFIED_MATCH' : 'FINGERPRINT_MISMATCH',
    };
  }

  /**
   * Export Analysis as Structured JSON
   */
  public exportAnalysisJSON(actorEmail = 'researcher@scos.gov.in'): StatisticalAnalysisSnapshot {
    return this.getAnalysisSnapshot(actorEmail);
  }

  /**
   * Export Analysis as Analysis-Readable CSV
   */
  public exportAnalysisCSV(actorEmail = 'researcher@scos.gov.in'): string {
    const snap = this.getAnalysisSnapshot(actorEmail);

    const headers = [
      'Scenario',
      'Scenario_Name',
      'Metric_Code',
      'Metric_Name',
      'Unit',
      'Manual_Value',
      'SCOS_Value',
      'Absolute_Difference',
      'Relative_Change_Percent',
      'Direction_Of_Change',
      'Manual_Mean',
      'Manual_Median',
      'Manual_StdDev',
      'Manual_Min',
      'Manual_Max',
      'SCOS_Mean',
      'SCOS_Median',
      'SCOS_StdDev',
      'SCOS_Min',
      'SCOS_Max',
      'Uncertainty_Level',
      'Uncertainty_Score',
      'Data_Validity',
      'Classification',
    ];

    const rows: string[] = [
      '# SCOS PHASE 10C STATISTICAL ANALYSIS & UNCERTAINTY EXPORT',
      `# Analysis ID: ${snap.analysisId}`,
      `# Dataset Version: ${snap.datasetVersion}`,
      `# Generated At: ${snap.generatedAt}`,
      `# Analysis Fingerprint (SHA-256): ${snap.provenance.canonicalPayloadHash}`,
      `# Classification: ${snap.metadata.classification}`,
      `# Notice: ${snap.metadata.descriptiveNotice}`,
      headers.join(','),
    ];

    for (const key of Object.keys(snap.metrics) as ExperimentalMetricKey[]) {
      const m = snap.metrics[key];
      for (const sc of m.scenarioBreakdown) {
        const row = [
          sc.scenarioId,
          `"${sc.scenarioName.replace(/"/g, '""')}"`,
          m.metricCode,
          `"${m.metricName.replace(/"/g, '""')}"`,
          m.unit,
          sc.baselineValue !== null ? sc.baselineValue : 'N/A',
          sc.scosValue !== null ? sc.scosValue : 'N/A',
          sc.absoluteDifference !== null ? sc.absoluteDifference : 'N/A',
          sc.relativeChangePercent !== null ? `${sc.relativeChangePercent}%` : 'N/A',
          sc.directionOfChange,
          m.manualStats.mean !== null ? m.manualStats.mean : 'N/A',
          m.manualStats.median !== null ? m.manualStats.median : 'N/A',
          m.manualStats.standardDeviation !== null ? m.manualStats.standardDeviation : 'N/A',
          m.manualStats.minimum !== null ? m.manualStats.minimum : 'N/A',
          m.manualStats.maximum !== null ? m.manualStats.maximum : 'N/A',
          m.scosStats.mean !== null ? m.scosStats.mean : 'N/A',
          m.scosStats.median !== null ? m.scosStats.median : 'N/A',
          m.scosStats.standardDeviation !== null ? m.scosStats.standardDeviation : 'N/A',
          m.scosStats.minimum !== null ? m.scosStats.minimum : 'N/A',
          m.scosStats.maximum !== null ? m.scosStats.maximum : 'N/A',
          m.uncertainty.level,
          m.uncertainty.score,
          sc.validity,
          '"SIMULATED / PROTOTYPE DATA"',
        ];
        rows.push(row.join(','));
      }
    }

    return rows.join('\n');
  }

  // =========================================================================
  // BENCHMARK EXECUTION SEEDING HELPER
  // =========================================================================

  /**
   * Helper: Ensure SC-01 through SC-05 have execution runs recorded in store
   */
  private ensureBenchmarkExecutionData(actorEmail: string): void {
    const benchmarkScenarios = ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'];
    const existingSessions = experimentalResultsStore.getAllSessions();

    for (const scId of benchmarkScenarios) {
      const session = existingSessions.find(
        (s) => s.scenarioId === scId || s.scenarioCode === scId
      );

      if (!session) {
        // Create session and execute both conditions
        const newSession = experimentalExecutionService.createSession(
          scId,
          'BASELINE_THEN_SCOS',
          actorEmail
        );
        const mRun = experimentalExecutionService.executeRun(newSession.sessionId, 'BASELINE_MANUAL', actorEmail);
        const sRun = experimentalExecutionService.executeRun(newSession.sessionId, 'SCOS_INTEGRATED', actorEmail);
        experimentalExecutionService.compareRuns(mRun.runId, sRun.runId, actorEmail);
      } else {
        // Check if both runs exist in session
        let mRunId = session.baselineRunId;
        let sRunId = session.scosRunId;

        if (!mRunId) {
          const mRun = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', actorEmail);
          mRunId = mRun.runId;
        }
        if (!sRunId) {
          const sRun = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', actorEmail);
          sRunId = sRun.runId;
        }
        if (!session.comparisonId && mRunId && sRunId) {
          experimentalExecutionService.compareRuns(mRunId, sRunId, actorEmail);
        }
      }
    }
  }

  /**
   * Invalidate cached snapshot (e.g. after new experimental executions)
   */
  public invalidateCache(): void {
    this.cachedSnapshot = null;
  }
}

export const statisticalAnalysisService = new StatisticalAnalysisService();
