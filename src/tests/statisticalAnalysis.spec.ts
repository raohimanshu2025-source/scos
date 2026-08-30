// =========================================================================
// SCOS PHASE 10C — STATISTICAL ANALYSIS & UNCERTAINTY TEST SUITE
// 25 Comprehensive Automated Verification Tests (STAT-01 to STAT-25)
// =========================================================================

import { statisticalAnalysisService } from '../services/statisticalAnalysisService';
import { researchDatasetService, computeDeterministicFingerprint } from '../services/researchDatasetService';
import { experimentalResultsStore } from '../services/experimentalResultsStore';
import { experimentalExecutionService } from '../services/experimentalExecutionService';
import { RoleType, PermissionType } from '../types/auth';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { ExperimentalMetricKey } from '../types/experimentalExecution';

export interface TestResultItem {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  details: string;
  durationMs?: number;
}

export interface StatisticalTestSuiteSummary {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  executedAt: string;
  results: TestResultItem[];
  classificationNotice: string;
}

export function runStatisticalAnalysisTestSuite(): StatisticalTestSuiteSummary {
  const results: TestResultItem[] = [];

  function recordTest(
    id: string,
    name: string,
    category: string,
    testFn: () => { passed: boolean; details: string }
  ) {
    const start = Date.now();
    try {
      const res = testFn();
      results.push({
        id,
        name,
        category,
        passed: res.passed,
        details: res.details,
        durationMs: Date.now() - start,
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        category,
        passed: false,
        details: `Exception thrown: ${err?.message || String(err)}`,
        durationMs: Date.now() - start,
      });
    }
  }

  // Ensure fresh snapshot
  const snapshot = statisticalAnalysisService.generateAnalysisSnapshot('test-runner@scos.gov.in');

  // STAT-01: Dataset Loading
  recordTest(
    'STAT-01',
    'Research Dataset Version and Metadata Loading',
    'Dataset Foundation',
    () => {
      const summary = researchDatasetService.getDatasetSummary();
      const scenarios = researchDatasetService.getAllScenarios();
      const match = snapshot.datasetVersion === summary.currentVersion;
      return {
        passed: match && scenarios.length === 5,
        details: `Loaded dataset ${snapshot.datasetVersion} with ${scenarios.length} scenarios.`,
      };
    }
  );

  // STAT-02: Phase 10B Execution Retrieval
  recordTest(
    'STAT-02',
    'Phase 10B Controlled Execution Records Retrieval',
    'Data Ingestion',
    () => {
      const allRuns = experimentalResultsStore.getAllRuns();
      const hasBaseline = allRuns.some((r) => r.condition === 'BASELINE_MANUAL');
      const hasScos = allRuns.some((r) => r.condition === 'SCOS_INTEGRATED');
      return {
        passed: hasBaseline && hasScos && allRuns.length >= 10,
        details: `Successfully ingested ${allRuns.length} Phase 10B execution runs across both conditions.`,
      };
    }
  );

  // STAT-03: M1 Workflow Duration Mean Calculation
  recordTest(
    'STAT-03',
    'M1 Workflow Duration Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m1 = snapshot.metrics.M1_WORKFLOW_DURATION;
      const bMean = m1.manualStats.mean;
      const sMean = m1.scosStats.mean;
      const valid = bMean !== null && sMean !== null && bMean > sMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}s, SCOS Mean: ${sMean}s (Delta: ${m1.comparison.absoluteDifference}s).`,
      };
    }
  );

  // STAT-04: M2 Information Retrieval Count Mean Calculation
  recordTest(
    'STAT-04',
    'M2 Information Retrieval Queries Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m2 = snapshot.metrics.M2_INFORMATION_RETRIEVAL_COUNT;
      const bMean = m2.manualStats.mean;
      const sMean = m2.scosStats.mean;
      const valid = bMean !== null && sMean !== null && bMean >= sMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean} queries, SCOS Mean: ${sMean} queries.`,
      };
    }
  );

  // STAT-05: M3 Context Completeness Score Mean Calculation
  recordTest(
    'STAT-05',
    'M3 Context Completeness Score Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m3 = snapshot.metrics.M3_CONTEXT_COMPLETENESS_SCORE;
      const bMean = m3.manualStats.mean;
      const sMean = m3.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean > bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-06: M4 Coordination Overhead Mean Calculation
  recordTest(
    'STAT-06',
    'M4 Coordination Overhead Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m4 = snapshot.metrics.M4_COORDINATION_OVERHEAD;
      const bMean = m4.manualStats.mean;
      const sMean = m4.scosStats.mean;
      const valid = bMean !== null && sMean !== null;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}, SCOS Mean: ${sMean}.`,
      };
    }
  );

  // STAT-07: M5 Infrastructure Awareness Mean Calculation
  recordTest(
    'STAT-07',
    'M5 Infrastructure Awareness Score Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m5 = snapshot.metrics.M5_INFRASTRUCTURE_AWARENESS;
      const bMean = m5.manualStats.mean;
      const sMean = m5.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean > bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-08: M6 Cascade Identification Rate Mean Calculation
  recordTest(
    'STAT-08',
    'M6 Cascade Identification Rate Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m6 = snapshot.metrics.M6_CASCADE_IDENTIFICATION;
      const bMean = m6.manualStats.mean;
      const sMean = m6.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean > bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-09: M7 Critical Facility Awareness Mean Calculation
  recordTest(
    'STAT-09',
    'M7 Critical Facility Awareness Score Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m7 = snapshot.metrics.M7_CRITICAL_FACILITY_AWARENESS;
      const bMean = m7.manualStats.mean;
      const sMean = m7.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean >= bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-10: M8 Decision Support Completeness Mean Calculation
  recordTest(
    'STAT-10',
    'M8 Decision Support Completeness Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m8 = snapshot.metrics.M8_DECISION_SUPPORT_COMPLETENESS;
      const bMean = m8.manualStats.mean;
      const sMean = m8.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean > bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-11: M9 Audit Completeness Score Mean Calculation
  recordTest(
    'STAT-11',
    'M9 Audit Completeness Score Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m9 = snapshot.metrics.M9_AUDIT_COMPLETENESS_SCORE;
      const bMean = m9.manualStats.mean;
      const sMean = m9.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean >= bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-12: M10 Decision Traceability Mean Calculation
  recordTest(
    'STAT-12',
    'M10 End-to-End Decision Traceability Mean Calculation',
    'Descriptive Statistics',
    () => {
      const m10 = snapshot.metrics.M10_DECISION_TRACEABILITY;
      const bMean = m10.manualStats.mean;
      const sMean = m10.scosStats.mean;
      const valid = bMean !== null && sMean !== null && sMean > bMean;
      return {
        passed: valid,
        details: `Baseline Mean: ${bMean}%, SCOS Mean: ${sMean}%.`,
      };
    }
  );

  // STAT-13: Median Calculation Determinism
  recordTest(
    'STAT-13',
    'Median Calculation Mathematical Correctness',
    'Descriptive Mathematics',
    () => {
      const oddList = [10, 20, 30, 40, 50];
      const evenList = [10, 20, 30, 40];
      const oddMed = statisticalAnalysisService.calculateMedian(oddList);
      const evenMed = statisticalAnalysisService.calculateMedian(evenList);
      return {
        passed: oddMed === 30 && evenMed === 25,
        details: `Odd count median: ${oddMed} (expected 30), Even count median: ${evenMed} (expected 25).`,
      };
    }
  );

  // STAT-14: Sample Standard Deviation with N-1 Denominator
  recordTest(
    'STAT-14',
    'Sample Standard Deviation Unbiased Estimator (N-1)',
    'Descriptive Mathematics',
    () => {
      const values = [10, 20, 30, 40, 50]; // mean = 30, variance = 250, stdDev = 15.81
      const variance = statisticalAnalysisService.calculateVariance(values);
      const stdDev = statisticalAnalysisService.calculateStandardDeviation(values);
      const singleValStdDev = statisticalAnalysisService.calculateStandardDeviation([42]);

      return {
        passed: variance === 250 && stdDev === 15.81 && singleValStdDev === null,
        details: `Calculated Sample Variance: ${variance}, Sample StdDev: ${stdDev}, Single observation StdDev: ${singleValStdDev}.`,
      };
    }
  );

  // STAT-15: Minimum / Maximum and Range
  recordTest(
    'STAT-15',
    'Minimum, Maximum and Extent Range Bounds',
    'Descriptive Mathematics',
    () => {
      const desc = statisticalAnalysisService.computeDescriptiveStatistics([15, 25, 45, 95]);
      return {
        passed: desc.minimum === 15 && desc.maximum === 95 && desc.range === 80,
        details: `Min: ${desc.minimum}, Max: ${desc.maximum}, Range: ${desc.range}.`,
      };
    }
  );

  // STAT-16: Absolute Difference Calculation
  recordTest(
    'STAT-16',
    'Absolute Difference between Conditions (SCOS - Manual)',
    'Comparative Analysis',
    () => {
      const m1 = snapshot.metrics.M1_WORKFLOW_DURATION;
      const expectedDiff = Number(((m1.scosStats.mean || 0) - (m1.manualStats.mean || 0)).toFixed(2));
      return {
        passed: m1.comparison.absoluteDifference === expectedDiff,
        details: `Absolute difference computed: ${m1.comparison.absoluteDifference}s matches (SCOS Mean - Baseline Mean).`,
      };
    }
  );

  // STAT-17: Relative Change % Calculation
  recordTest(
    'STAT-17',
    'Relative Change Percentage with Direction Semantics',
    'Comparative Analysis',
    () => {
      const m3 = snapshot.metrics.M3_CONTEXT_COMPLETENESS_SCORE;
      const pct = m3.comparison.relativeChangePercent;
      const dir = m3.comparison.directionOfChange;
      return {
        passed: pct !== null && pct > 0 && dir === 'IMPROVEMENT',
        details: `Relative change: +${pct}% (Direction: ${dir}).`,
      };
    }
  );

  // STAT-18: Small Sample Size Warning Safeguard
  recordTest(
    'STAT-18',
    'Explicit Small Sample Size Classification and Warning Safeguard',
    'Research Safeguards',
    () => {
      const sampleAssessment = snapshot.sampleSizeAssessment;
      const isSmallSample = sampleAssessment.classification === 'SMALL_SAMPLE';
      const hasWarning = sampleAssessment.isSmallSampleWarningActive;
      const hasDisclaimer = sampleAssessment.disclaimer.includes('statistical significance');

      return {
        passed: isSmallSample && hasWarning && hasDisclaimer,
        details: `Classification: ${sampleAssessment.classification}, Warning Active: ${hasWarning}.`,
      };
    }
  );

  // STAT-19: Missing Data Handling and Non-Zero Substitution
  recordTest(
    'STAT-19',
    'Missing Data Handling (No Zero or Fabricated Imputation)',
    'Data Integrity',
    () => {
      const statsWithMissing = statisticalAnalysisService.computeDescriptiveStatistics([
        10,
        null,
        30,
        undefined,
        50,
      ]);

      return {
        passed:
          statsWithMissing.sampleSize === 5 &&
          statsWithMissing.validObservationCount === 3 &&
          statsWithMissing.missingObservationCount === 2 &&
          statsWithMissing.mean === 30, // mean of [10, 30, 50]
        details: `Missing count: ${statsWithMissing.missingObservationCount}, Mean computed only on valid observations: ${statsWithMissing.mean}.`,
      };
    }
  );

  // STAT-20: Exploratory Outlier Detection using IQR Method
  recordTest(
    'STAT-20',
    'Exploratory Outlier Detection with Observation Retention',
    'Uncertainty & Robustness',
    () => {
      const m1 = snapshot.metrics.M1_WORKFLOW_DURATION;
      const outliers = m1.outliers;
      return {
        passed:
          outliers.methodology.includes('IQR') &&
          outliers.retentionNotice.includes('retained'),
        details: `Outlier status: ${outliers.status}, Detected: ${outliers.outlierCount}. All observations retained.`,
      };
    }
  );

  // STAT-21: Rule-Based Uncertainty Assessment
  recordTest(
    'STAT-21',
    'Transparent Rule-Based Uncertainty Level Classification',
    'Uncertainty & Robustness',
    () => {
      const m5 = snapshot.metrics.M5_INFRASTRUCTURE_AWARENESS;
      const unc = m5.uncertainty;
      return {
        passed:
          !!unc.level &&
          typeof unc.score === 'number' &&
          unc.isDescriptiveOnly === true &&
          unc.summaryReason.length > 0,
        details: `Uncertainty Level: ${unc.level}, Score: ${unc.score}/100. Reason: ${unc.summaryReason}`,
      };
    }
  );

  // STAT-22: Data Provenance Chain Preservation
  recordTest(
    'STAT-22',
    'Full Provenance Traceability back to Phase 10B Executions',
    'Provenance & Audit',
    () => {
      const prov = snapshot.provenance;
      return {
        passed:
          prov.researchDatasetVersion === 'SCOS-RESEARCH-DATASET-v1.0' &&
          prov.scenarioIds.length === 5 &&
          prov.executionRunIds.length >= 10 &&
          !!prov.canonicalPayloadHash,
        details: `Provenance linked across ${prov.scenarioIds.length} scenarios and ${prov.executionRunIds.length} runs.`,
      };
    }
  );

  // STAT-23: Deterministic SHA-256 Analysis Fingerprint
  recordTest(
    'STAT-23',
    'Deterministic SHA-256 Analysis Fingerprinting and Verification',
    'Reproducibility',
    () => {
      const verification = statisticalAnalysisService.verifyAnalysisReproducibility(snapshot);
      return {
        passed: verification.isMatch && verification.status === 'VERIFIED_MATCH',
        details: `Verified SHA-256 Fingerprint: ${verification.computedFingerprint.slice(0, 16)}... matches stored hash.`,
      };
    }
  );

  // STAT-24: RBAC Permissions for Statistical Analysis
  recordTest(
    'STAT-24',
    'RBAC Access Controls for Statistical Analysis',
    'Security & RBAC',
    () => {
      const citizenPerms = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];
      const adminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
      const aiOfficerPerms = ROLE_PERMISSIONS_MAP[RoleType.AI_GOVERNANCE_OFFICER] || [];

      const citizenDenied = !citizenPerms.includes(PermissionType.STATISTICAL_ANALYSIS_VIEW);
      const adminGranted =
        adminPerms.includes(PermissionType.STATISTICAL_ANALYSIS_VIEW) &&
        adminPerms.includes(PermissionType.STATISTICAL_ANALYSIS_EXECUTE);
      const aiOfficerGranted = aiOfficerPerms.includes(PermissionType.STATISTICAL_ANALYSIS_VIEW);

      return {
        passed: citizenDenied && adminGranted && aiOfficerGranted,
        details: `Citizen denied: ${citizenDenied}, Admin view/exec: ${adminGranted}, AI Officer view: ${aiOfficerGranted}.`,
      };
    }
  );

  // STAT-25: Prototype Classification and Research Non-Actuation Safeguards
  recordTest(
    'STAT-25',
    'SIMULATED / PROTOTYPE DATA Classification Preservation',
    'Research Governance',
    () => {
      const isProto = snapshot.metadata.classification === 'SIMULATED / PROTOTYPE DATA';
      const hasLimitations = snapshot.limitations.length >= 4;
      const noInferentialPvalues = snapshot.limitations.some((l) => l.includes('p-values'));

      return {
        passed: isProto && hasLimitations && noInferentialPvalues,
        details: `Classification: ${snapshot.metadata.classification}. ${snapshot.limitations.length} governance limitations defined.`,
      };
    }
  );

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  return {
    suiteName: 'SCOS Phase 10C Statistical Analysis & Uncertainty Test Suite',
    totalTests: results.length,
    passedTests,
    failedTests,
    allPassed: failedTests === 0,
    executedAt: new Date().toISOString(),
    results,
    classificationNotice: 'SIMULATED / PROTOTYPE DATA — Automated Statistical Verification Suite',
  };
}
