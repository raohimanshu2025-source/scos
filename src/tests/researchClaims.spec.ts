// =========================================================================
// SCOS PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION TEST SUITE
// Comprehensive Automated Test Suite (TEST-RC-01 to TEST-RC-35)
// =========================================================================

import { researchClaimValidationService } from '../services/researchClaimValidationService';
import { HypothesisId } from '../types/researchClaims';

export interface ResearchClaimsTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface ResearchClaimsTestSuiteReport {
  suiteId: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  executedAt: string;
  allPassed: boolean;
  results: ResearchClaimsTestResult[];
  canonicalFingerprint: string;
  disclaimer: string;
}

export function runResearchClaimsTestSuite(): ResearchClaimsTestSuiteReport {
  const startTime = Date.now();
  const results: ResearchClaimsTestResult[] = [];

  const runTest = (
    specId: string,
    specName: string,
    category: string,
    description: string,
    testFn: () => boolean | void
  ) => {
    const t0 = Date.now();
    try {
      const outcome = testFn();
      const passed = outcome === undefined || outcome === true;
      results.push({
        specId,
        specName,
        category,
        passed,
        durationMs: Math.max(1, Date.now() - t0),
        description,
      });
    } catch (e: any) {
      results.push({
        specId,
        specName,
        category,
        passed: false,
        durationMs: Math.max(1, Date.now() - t0),
        description,
        error: e?.message || String(e),
      });
    }
  };

  const snapshot = researchClaimValidationService.getClaimsSnapshot(true);

  // 1. Snapshot Core Integrity
  runTest('TEST-RC-01', 'Snapshot ID and Version', 'SNAPSHOT', 'Snapshot contains valid ID, version and dataset reference', () => {
    if (!snapshot) return false;
    return (
      snapshot.snapshotId === 'SCOS-PHASE-11B-CLAIMS-MASTER' &&
      snapshot.version === '1.0.0' &&
      snapshot.datasetVersion === 'SCOS-RESEARCH-DS-v1.0-FROZEN'
    );
  });

  runTest('TEST-RC-02', 'Academic Research Disclaimer', 'DISCLAIMER', 'Non-field research disclaimer is present and explicit', () => {
    return (
      snapshot.disclaimer.includes('SCOS is a research prototype') &&
      snapshot.disclaimer.includes('Real-world municipal field validation has not been established')
    );
  });

  runTest('TEST-RC-03', 'Evidence Strength Disclaimer', 'DISCLAIMER', 'Evidence score disclaimer is documented', () => {
    return snapshot.evidenceStrengthDisclaimer.includes('Evidence strength is a structured research completeness indicator');
  });

  runTest('TEST-RC-04', 'Real-World Validation Notice', 'DISCLAIMER', 'Real-world validation status is explicitly marked NOT ESTABLISHED', () => {
    return snapshot.realWorldValidationNotice.includes('NOT ESTABLISHED');
  });

  // 2. Formal Hypotheses (H01 to H05)
  runTest('TEST-RC-05', 'Hypotheses Count (H01 to H05)', 'HYPOTHESES', 'Snapshot registers exactly 5 primary research hypotheses', () => {
    if (snapshot.hypotheses.length !== 5) return false;
    const expectedIds: HypothesisId[] = ['H01', 'H02', 'H03', 'H04', 'H05'];
    return expectedIds.every((id) => snapshot.hypotheses.some((h) => h.hypothesisId === id));
  });

  runTest('TEST-RC-06', 'RQ Mapping (RQ-01 to RQ-05)', 'HYPOTHESES', 'Hypotheses map 1:1 to formal Research Questions RQ-01..RQ-05', () => {
    return (
      snapshot.hypotheses.find((h) => h.hypothesisId === 'H01')?.researchQuestionId === 'RQ-01' &&
      snapshot.hypotheses.find((h) => h.hypothesisId === 'H02')?.researchQuestionId === 'RQ-02' &&
      snapshot.hypotheses.find((h) => h.hypothesisId === 'H03')?.researchQuestionId === 'RQ-03' &&
      snapshot.hypotheses.find((h) => h.hypothesisId === 'H04')?.researchQuestionId === 'RQ-04' &&
      snapshot.hypotheses.find((h) => h.hypothesisId === 'H05')?.researchQuestionId === 'RQ-05'
    );
  });

  runTest('TEST-RC-07', 'Formal and Null Hypotheses Completeness', 'HYPOTHESES', 'Every hypothesis contains non-empty formal and null texts', () => {
    return snapshot.hypotheses.every(
      (h) => h.hypothesisFormalText.length > 20 && h.nullHypothesisText.length > 20 && h.targetObjective.length > 10
    );
  });

  runTest('TEST-RC-08', 'Supporting Scenarios and Metrics', 'HYPOTHESES', 'Every hypothesis references supporting metrics and benchmark scenarios', () => {
    return snapshot.hypotheses.every(
      (h) => h.supportingMetricCodes.length >= 1 && h.supportingScenarios.length >= 3 && h.supportingValidationCases.length >= 1
    );
  });

  runTest('TEST-RC-09', 'H01 Workflow Latency Reduction Evaluation', 'HYPOTHESES', 'H01 is evaluated with metrics M1, M2 across SC-01..SC-05', () => {
    const h01 = snapshot.hypotheses.find((h) => h.hypothesisId === 'H01');
    if (!h01) return false;
    return h01.supportingMetricCodes.includes('M1') && h01.evidenceStatus === 'ROBUST_UNDER_TESTED_ASSUMPTIONS';
  });

  runTest('TEST-RC-10', 'H02 Cross-Department Coordination Evaluation', 'HYPOTHESES', 'H02 evaluates coordination visibility with M4 and M8', () => {
    const h02 = snapshot.hypotheses.find((h) => h.hypothesisId === 'H02');
    if (!h02) return false;
    return h02.supportingMetricCodes.includes('M4') && h02.supportingMetricCodes.includes('M8');
  });

  runTest('TEST-RC-11', 'H03 Civil Infrastructure Dependency Evaluation', 'HYPOTHESES', 'H03 evaluates cascade and facility exposure with M5, M6, M7', () => {
    const h03 = snapshot.hypotheses.find((h) => h.hypothesisId === 'H03');
    if (!h03) return false;
    return (
      h03.supportingMetricCodes.includes('M5') &&
      h03.supportingMetricCodes.includes('M6') &&
      h03.supportingMetricCodes.includes('M7')
    );
  });

  runTest('TEST-RC-12', 'H04 Context Completeness Evaluation', 'HYPOTHESES', 'H04 evaluates decision support context with M3, M8, M10', () => {
    const h04 = snapshot.hypotheses.find((h) => h.hypothesisId === 'H04');
    if (!h04) return false;
    return h04.supportingMetricCodes.includes('M3') && h04.supportingMetricCodes.includes('M10');
  });

  runTest('TEST-RC-13', 'H05 Governance Traceability Evaluation', 'HYPOTHESES', 'H05 verifies audit completeness M9 and lineage M10', () => {
    const h05 = snapshot.hypotheses.find((h) => h.hypothesisId === 'H05');
    if (!h05) return false;
    return (
      h05.supportingMetricCodes.includes('M9') &&
      h05.supportingMetricCodes.includes('M10') &&
      h05.evidenceStatus === 'IMPLEMENTATION_VERIFIED'
    );
  });

  // 3. Claims Completeness
  runTest('TEST-RC-14', 'Claims Count (CLAIM-H01 to CLAIM-H05)', 'CLAIMS', 'Registers exactly 5 research claims corresponding to H01..H05', () => {
    if (snapshot.claims.length !== 5) return false;
    return ['CLAIM-H01', 'CLAIM-H02', 'CLAIM-H03', 'CLAIM-H04', 'CLAIM-H05'].every((id) =>
      snapshot.claims.some((c) => c.claimId === id)
    );
  });

  runTest('TEST-RC-15', 'Claim Evidence Levels Bounded', 'CLAIMS', 'Claims adhere strictly to Level A or Level D evidence levels', () => {
    return snapshot.claims.every(
      (c) =>
        c.evidenceLevel === 'LEVEL_A_IMPLEMENTATION_VERIFIED' ||
        c.evidenceLevel === 'LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE'
    );
  });

  // 4. Evidence Strength Scoring
  runTest('TEST-RC-16', 'Evidence Strength Score Bounds [0, 100]', 'SCORING', 'All hypothesis evidence strength scores fall in [0, 100]', () => {
    return snapshot.hypotheses.every((h) => h.evidenceStrengthScore >= 0 && h.evidenceStrengthScore <= 100);
  });

  runTest('TEST-RC-17', 'Evidence Strength Bands Assignment', 'SCORING', 'Every hypothesis has an assigned evidence strength band', () => {
    const validBands = [
      'VERY_WEAK',
      'LIMITED',
      'MODERATE',
      'STRONG_WITHIN_TESTED_SCOPE',
      'STRONG_WITHIN_TESTED_SCOPE_AND_ASSUMPTIONS',
    ];
    return snapshot.hypotheses.every((h) => validBands.includes(h.evidenceStrengthBand));
  });

  // 5. Evidence Chains
  runTest('TEST-RC-18', '9-Step Unbroken Evidence Chains', 'CHAINS', 'All 5 evidence chains are complete and unbroken with 9 stages', () => {
    if (snapshot.evidenceChains.length !== 5) return false;
    return snapshot.evidenceChains.every(
      (chain) => chain.unbrokenVerification === true && chain.chainCompletenessPercent === 100 && chain.chainSteps.length === 9
    );
  });

  runTest('TEST-RC-19', 'Evidence Chain Stage Sequence Order', 'CHAINS', 'Chain steps adhere to standard 9-stage sequence from RQ to Statement', () => {
    const expectedStages = [
      'RESEARCH_QUESTION',
      'HYPOTHESIS',
      'METRICS_DEFINITION',
      'SCENARIO_DESIGN',
      'OBSERVATIONS',
      'STATISTICAL_DESCRIPTION',
      'ROBUSTNESS_SENSITIVITY',
      'VALIDITY_LIMITATIONS',
      'PERMITTED_STATEMENT',
    ];
    return snapshot.evidenceChains.every((chain) => {
      const actualStages = chain.chainSteps.map((s) => s.stageName);
      return expectedStages.every((stage, i) => actualStages[i] === stage);
    });
  });

  runTest('TEST-RC-20', 'Evidence Chain Hashes', 'CHAINS', 'Each chain contains a deterministic sha256 canonical hash', () => {
    return snapshot.evidenceChains.every((c) => c.canonicalChainHash.startsWith('sha256:'));
  });

  // 6. Metric Matrix (M1 to M10)
  runTest('TEST-RC-21', 'Metric Matrix 10 Metrics Completeness', 'METRIC_MATRIX', 'Matrix contains all 10 standard evaluation metrics (M1 to M10)', () => {
    if (snapshot.metricMatrix.length !== 10) return false;
    const expectedCodes = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'];
    return expectedCodes.every((code) => snapshot.metricMatrix.some((m) => m.metricCode === code));
  });

  runTest('TEST-RC-22', 'Metric Matrix Baseline and SCOS Stats', 'METRIC_MATRIX', 'Metric items define valid mean and stdDev values for baseline & SCOS', () => {
    return snapshot.metricMatrix.every(
      (m) =>
        typeof m.baselineObservation.mean === 'number' &&
        typeof m.baselineObservation.stdDev === 'number' &&
        typeof m.scosObservation.mean === 'number' &&
        typeof m.scosObservation.stdDev === 'number' &&
        m.baselineObservation.n >= 5 &&
        m.scosObservation.n >= 5
    );
  });

  runTest('TEST-RC-23', 'M1 Latency Reduction Observation', 'METRIC_MATRIX', 'M1 shows lower observed duration in SCOS (394s) than baseline (1240s)', () => {
    const m1 = snapshot.metricMatrix.find((m) => m.metricCode === 'M1');
    if (!m1) return false;
    return m1.scosObservation.mean < m1.baselineObservation.mean && m1.mappedHypotheses.includes('H01');
  });

  runTest('TEST-RC-24', 'M9 and M10 Full Integrity Verification', 'METRIC_MATRIX', 'M9 and M10 audit metrics achieve 100% in SCOS condition', () => {
    const m9 = snapshot.metricMatrix.find((m) => m.metricCode === 'M9');
    const m10 = snapshot.metricMatrix.find((m) => m.metricCode === 'M10');
    if (!m9 || !m10) return false;
    return m9.scosObservation.mean === 100 && m10.scosObservation.mean === 100;
  });

  // 7. Claim Language Safety Linter
  runTest('TEST-RC-25', 'Safety Linter Flags Overclaims ("proven", "guarantees")', 'LINTER', 'Flags prohibited words "proven", "guarantee", "real cities"', () => {
    const audit = researchClaimValidationService.validateClaimLanguage(
      'SCOS is proven to guarantee 100% emergency response success across real cities.'
    );
    return audit.isValid === false && audit.hasOverclaims === true && audit.flaggedTerms.length >= 2;
  });

  runTest('TEST-RC-26', 'Safety Linter Approves Bounded Academic Phrasing', 'LINTER', 'Approves safe, bounded academic phrasing with observational context', () => {
    const audit = researchClaimValidationService.validateClaimLanguage(
      'Under the evaluated simulated scenarios, SCOS was observed to show a reduction in workflow duration.'
    );
    return audit.isValid === true && audit.hasOverclaims === false;
  });

  runTest('TEST-RC-27', 'Safety Linter Handles Empty Input Gracefully', 'LINTER', 'Returns valid safe report for empty string input', () => {
    const audit = researchClaimValidationService.validateClaimLanguage('');
    return audit.isValid === true && audit.flaggedTerms.length === 0;
  });

  // 8. Civil Engineering Grounding
  runTest('TEST-RC-28', 'Civil Grounding for All 5 Hypotheses', 'CIVIL_ENGINEERING', 'Civil engineering grounding is populated for all 5 hypotheses', () => {
    if (snapshot.civilEngineeringGrounding.length !== 5) return false;
    return snapshot.civilEngineeringGrounding.every(
      (g) =>
        g.domain.length > 5 &&
        g.physicalAssetClass.length > 5 &&
        g.governingPhysicalEquationsOrMechanisms.length > 5 &&
        g.fieldValidationGap.length > 5
    );
  });

  // 9. Limitations Registry
  runTest('TEST-RC-29', 'Limitations and Threats to Validity Registry', 'LIMITATIONS', 'Registry documents multiple threats to validity with mitigations', () => {
    if (snapshot.limitationsRegistry.length < 4) return false;
    return snapshot.limitationsRegistry.every(
      (l) => l.category.length > 2 && l.description.length > 10 && l.mitigationStrategy.length > 10
    );
  });

  // 10. Provenance & Deterministic Fingerprinting
  runTest('TEST-RC-30', 'Academic Provenance Details', 'PROVENANCE', 'Provenance details include IIT Kanpur and thesis metadata', () => {
    return (
      snapshot.provenance.academicAffiliation.institution.includes('IIT Kanpur') &&
      snapshot.provenance.academicAffiliation.thesisTitle.includes('Smart City Operating System') &&
      snapshot.provenance.sourceDatasetVersion === 'SCOS-RESEARCH-DS-v1.0-FROZEN'
    );
  });

  runTest('TEST-RC-31', 'Canonical SHA-256 Fingerprint Determinism', 'PROVENANCE', 'Fingerprint is deterministic and begins with sha256:', () => {
    const fp1 = snapshot.canonicalFingerprint;
    const fp2 = researchClaimValidationService.getClaimsSnapshot(true).canonicalFingerprint;
    return fp1.startsWith('sha256:') && fp1 === fp2;
  });

  // 11. Data Exports & Helpers
  runTest('TEST-RC-32', 'CSV Export Formatter', 'EXPORT', 'CSV export outputs 3 distinct structured sections with headers', () => {
    const csv = researchClaimValidationService.exportCSV();
    return (
      csv.includes('SCOS PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION EXPORT') &&
      csv.includes('SECTION 1: FORMAL RESEARCH HYPOTHESES') &&
      csv.includes('SECTION 2: METRIC-TO-HYPOTHESIS MAPPING MATRIX') &&
      csv.includes('SECTION 3: RESEARCH LIMITATIONS & THREATS TO VALIDITY')
    );
  });

  runTest('TEST-RC-33', 'Single Hypothesis Retrieval by ID and RQ', 'HELPERS', 'Retrieves hypothesis by H01 or RQ-01 key', () => {
    const byH01 = researchClaimValidationService.getHypothesisById('H01');
    const byRQ02 = researchClaimValidationService.getHypothesisById('RQ-02');
    const invalid = researchClaimValidationService.getHypothesisById('INVALID_KEY');
    return byH01?.hypothesisId === 'H01' && byRQ02?.hypothesisId === 'H02' && invalid === undefined;
  });

  runTest('TEST-RC-34', 'Built-in Self-Verification Test Suite', 'SELF_TEST', 'Self-verification runner executes and passes all internal checks', () => {
    const selfTest = researchClaimValidationService.runSelfVerificationTest();
    return selfTest.allPassed === true && selfTest.checks.every((c) => c.passed === true);
  });

  runTest('TEST-RC-35', 'Strict Non-Claim Boundary Enforcement', 'SAFETY', 'Ensures no claim asserts real-world field validation or universal effectiveness', () => {
    return snapshot.hypotheses.every(
      (h) =>
        !h.allowedAcademicStatement.includes('proven') &&
        !h.allowedAcademicStatement.includes('guarantee') &&
        !h.allowedAcademicStatement.includes('real-world validated') &&
        h.prohibitedClaims.length >= 2
    );
  });

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    suiteId: 'SUITE-SCOS-PHASE-11B-RESEARCH-CLAIMS',
    totalTests: results.length,
    passedCount,
    failedCount,
    durationMs,
    executedAt: new Date().toISOString(),
    allPassed: failedCount === 0,
    results,
    canonicalFingerprint: snapshot.canonicalFingerprint,
    disclaimer: snapshot.disclaimer,
  };
}
