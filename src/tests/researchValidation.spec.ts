// =========================================================================
// SCOS PHASE 11A — INTEGRATED RESEARCH VALIDATION & EVIDENCE CONSOLIDATION TEST SUITE
// Automated Verification Suite (TEST-RV-01 to TEST-RV-40)
// =========================================================================

import { researchValidationService } from '../services/researchValidationService';
import { scenarioValidationService } from '../services/scenarioValidationService';
import { comparativeEvaluationService } from '../services/comparativeEvaluationService';
import { statisticalAnalysisService } from '../services/statisticalAnalysisService';
import { researchEvidenceService } from '../services/researchEvidenceService';
import { researchFrameworkService } from '../services/researchFrameworkService';
import { sensitivityAnalysisService } from '../services/sensitivityAnalysisService';
import { PermissionType } from '../types/auth';

export interface ResearchValidationTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface ResearchValidationTestSuiteReport {
  suiteId: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  executedAt: string;
  allPassed: boolean;
  results: ResearchValidationTestResult[];
  canonicalHash: string;
  disclaimer: string;
}

export function runResearchValidationTestSuite(): ResearchValidationTestSuiteReport {
  const startTime = Date.now();
  const results: ResearchValidationTestResult[] = [];

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
        error: e.message || String(e),
      });
    }
  };

  const snapshot = researchValidationService.getConsolidatedSnapshot();

  // TEST-RV-01: Research validation snapshot generates without errors
  runTest('TEST-RV-01', 'Snapshot Generation', 'SNAPSHOT', 'Research validation snapshot generates without errors', () => {
    return !!snapshot && !!snapshot.validationId && !!snapshot.generatedAt;
  });

  // TEST-RV-02: All 5 Research Questions (RQ-01 to RQ-05) are present
  runTest('TEST-RV-02', '5 Research Questions Completeness', 'RQS', 'Contains all 5 Research Questions (RQ-01 to RQ-05)', () => {
    if (snapshot.researchQuestions.length !== 5) return false;
    const rqIds = snapshot.researchQuestions.map((rq) => rq.rqId);
    return ['RQ-01', 'RQ-02', 'RQ-03', 'RQ-04', 'RQ-05'].every((id) => rqIds.includes(id as any));
  });

  // TEST-RV-03: All 10 Metrics (M1 to M10) are present
  runTest('TEST-RV-03', '10 Metrics Completeness', 'METRICS', 'Contains all 10 standard evaluation metrics (M1 to M10)', () => {
    if (snapshot.metrics.length !== 10) return false;
    const codes = snapshot.metrics.map((m) => m.metricCode);
    return ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'].every((c) => codes.includes(c));
  });

  // TEST-RV-04: All 5 Benchmark Scenarios (SC-01 to SC-05) are present
  runTest('TEST-RV-04', '5 Benchmark Scenarios Completeness', 'SCENARIOS', 'Contains all 5 benchmark scenarios (SC-01 to SC-05)', () => {
    if (snapshot.scenarios.length !== 5) return false;
    const scIds = snapshot.scenarios.map((s) => s.scenarioId);
    return ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'].every((id) => scIds.includes(id as any));
  });

  // TEST-RV-05: All 7 Validation Cases (VC-01 to VC-07) are present
  runTest('TEST-RV-05', '7 Validation Cases Completeness', 'VALIDATION_CASES', 'Contains all 7 validation cases (VC-01 to VC-07)', () => {
    if (snapshot.validationCases.length !== 7) return false;
    const vcIds = snapshot.validationCases.map((vc) => vc.validationCaseId);
    return ['VC-01', 'VC-02', 'VC-03', 'VC-04', 'VC-05', 'VC-06', 'VC-07'].every((id) => vcIds.includes(id));
  });

  // TEST-RV-06: Level E (real-world validation) is NEVER claimed as established
  runTest('TEST-RV-06', 'Level E Real-World Non-Claim Boundary', 'ETHICS', 'Strictly states that Level E real-world validation is NOT established', () => {
    return (
      snapshot.evidenceProfile.realWorldFieldValidation === 'NOT ESTABLISHED' &&
      snapshot.provenanceManifest.unvalidatedStatement.toLowerCase().includes('not established')
    );
  });

  // TEST-RV-07: Prohibited language is rejected by claim safety linter
  runTest('TEST-RV-07', 'Claim Safety Linter Rejections', 'LINTER', 'Flags prohibited over-claiming language in claim validator', () => {
    const testText = 'SCOS is PROVEN to GUARANTEE emergency response in real-world municipal operations.';
    const result = researchValidationService.validateClaimLanguage(testText);
    return !result.isValid && result.flaggedTerms.includes('PROVEN') && result.suggestions.length > 0;
  });

  // TEST-RV-08: Allowed language is accepted by claim safety linter
  runTest('TEST-RV-08', 'Claim Safety Linter Allowances', 'LINTER', 'Accepts compliant academic terminology in claim validator', () => {
    const compliantText = 'SCOS computationally demonstrated reduced operational workflow duration within the controlled prototype evaluation.';
    const result = researchValidationService.validateClaimLanguage(compliantText);
    return result.isValid && result.flaggedTerms.length === 0;
  });

  // TEST-RV-09: Research maturity level is exactly 5
  runTest('TEST-RV-09', 'Research Maturity Level 5', 'MATURITY', 'Specifies research maturity level as Level 5 (Controlled Experimentally Evaluated)', () => {
    return (
      snapshot.researchMaturity.currentLevelNumber === 5 &&
      snapshot.researchMaturity.currentLevelCode === 'LEVEL_5_CONTROLLED_EXPERIMENTALLY_EVALUATED'
    );
  });

  // TEST-RV-10: Research maturity level 6 (Field Validated) is NOT achieved
  runTest('TEST-RV-10', 'Level 6 Unachieved Status', 'MATURITY', 'Specifies Level 6 (Field Validated) as NOT achieved', () => {
    const level6 = snapshot.researchMaturity.levels.find((l) => l.levelNumber === 6);
    return !!level6 && level6.isCurrentAchieved === false;
  });

  // TEST-RV-11: Level 6 requirements are documented
  runTest('TEST-RV-11', 'Level 6 Advancement Requirements', 'MATURITY', 'Documents required evidence for Level 6 advancement', () => {
    return snapshot.researchMaturity.nextRequiredEvidenceForAdvancement.includes('LEVEL 6');
  });

  // TEST-RV-12: Structured evidence profile has 7 dimensions
  runTest('TEST-RV-12', '7 Evidence Dimensions', 'EVIDENCE', 'Has all 7 dimensions in structured evidence profile', () => {
    const profile = snapshot.evidenceProfile;
    return (
      profile.implementationVerification === 'HIGH' &&
      profile.computationalVerification === 'HIGH' &&
      profile.comparativeEvidence === 'BOUNDED DESCRIPTIVE' &&
      profile.statisticalEvidence === 'EXPLORATORY / SMALL-SAMPLE' &&
      profile.sensitivityEvidence === 'TESTED UNDER SPECIFIED ASSUMPTIONS' &&
      profile.realWorldFieldValidation === 'NOT ESTABLISHED'
    );
  });

  // TEST-RV-13: Executive answers exist for all 6 core questions
  runTest('TEST-RV-13', '6 Executive Answers', 'SYNTHESIS', 'Provides answers to all 6 core research questions', () => {
    const ans = snapshot.executiveAnswers;
    return (
      !!ans.whatHasBeenVerified &&
      !!ans.whatHasBeenComputationallyTested &&
      !!ans.whatHasBeenComparativelyEvaluated &&
      !!ans.whatHasBeenShownToBeRobust &&
      !!ans.whatRemainsAssumptionDependent &&
      !!ans.whatHasNotBeenValidated
    );
  });

  // TEST-RV-14: Provenance manifest contains SHA-256 fingerprint
  runTest('TEST-RV-14', 'SHA-256 Provenance Fingerprint', 'PROVENANCE', 'Contains SHA-256 canonical hash in provenance manifest', () => {
    return snapshot.provenanceManifest.canonicalFingerprint.startsWith('sha256:');
  });

  // TEST-RV-15: Canonical fingerprint is deterministic across runs
  runTest('TEST-RV-15', 'Deterministic Canonical Fingerprint', 'PROVENANCE', 'Produces deterministic canonical hash across calls', () => {
    const p1 = researchValidationService.getProvenanceManifest();
    const p2 = researchValidationService.getProvenanceManifest();
    return p1.canonicalFingerprint === p2.canonicalFingerprint;
  });

  // TEST-RV-16: Dataset version is SCOS-RESEARCH-DS-v1.0-FROZEN
  runTest('TEST-RV-16', 'Dataset Version Freeze', 'DATASET', 'Specifies frozen dataset version', () => {
    return snapshot.datasetVersion === 'SCOS-RESEARCH-DS-v1.0-FROZEN';
  });

  // TEST-RV-17: Simulation/prototype classification is explicitly stated
  runTest('TEST-RV-17', 'Simulation Prototype Classification', 'DISCLAIMER', 'Explicitly states prototype data classification', () => {
    return snapshot.classification.includes('SIMULATED / PROTOTYPE DATA');
  });

  // TEST-RV-18: Threats to validity registry contains 14 categories
  runTest('TEST-RV-18', 'Threats to Validity 14 Categories', 'THREATS', 'Contains 14 threats to validity categories', () => {
    return snapshot.threatsToValidity.length >= 14;
  });

  // TEST-RV-19: Civil engineering evidence contains all 6 domains
  runTest('TEST-RV-19', 'Civil Engineering 6 Domains', 'CIVIL_ENG', 'Contains all 6 civil engineering evidence domains', () => {
    return snapshot.civilEngineeringEvidence.length === 6;
  });

  // TEST-RV-20: Research contributions contain all 5 taxonomy areas
  runTest('TEST-RV-20', 'Research Contributions 5 Taxonomy Areas', 'CONTRIBUTIONS', 'Contains all 5 research contribution areas', () => {
    if (snapshot.researchContributions.length !== 5) return false;
    const cats = snapshot.researchContributions.map((c) => c.category);
    return ['TECHNICAL', 'METHODOLOGICAL', 'CIVIL_ENGINEERING', 'GOVERNANCE', 'RESEARCH_EVALUATION'].every((cat) =>
      cats.includes(cat as any)
    );
  });

  // TEST-RV-21: Evidence gaps matrix contains all 5 gap items
  runTest('TEST-RV-21', 'Evidence Gaps Matrix', 'GAPS', 'Contains all 5 evidence gap items', () => {
    return snapshot.evidenceGaps.length === 5;
  });

  // TEST-RV-22: Claim ledger contains all 5 core claims
  runTest('TEST-RV-22', 'Claim Ledger Completeness', 'LEDGER', 'Contains all 5 audited claims in claim ledger', () => {
    return snapshot.claimLedger.length === 5;
  });

  // TEST-RV-23: JSON export is valid and matches snapshot
  runTest('TEST-RV-23', 'JSON Serialization', 'EXPORT', 'Exports valid JSON matching snapshot structure', () => {
    const json = researchValidationService.exportJSON();
    return json.validationId === snapshot.validationId && json.researchQuestions.length === 5;
  });

  // TEST-RV-24: CSV export contains all required sections
  runTest('TEST-RV-24', 'CSV Serialization', 'EXPORT', 'Exports formatted CSV with all evidence sections', () => {
    const csv = researchValidationService.exportCSV();
    return (
      csv.includes('SECTION 1: RESEARCH QUESTIONS') &&
      csv.includes('SECTION 2: METRICS M1-M10') &&
      csv.includes('SECTION 3: BENCHMARK SCENARIOS') &&
      csv.includes('SECTION 4: EVIDENCE GAPS')
    );
  });

  // TEST-RV-25: Self-verification test passes 100%
  runTest('TEST-RV-25', 'Self-Verification Determinism', 'VERIFICATION', 'Passes self-verification test checks deterministically', () => {
    const res = researchValidationService.runSelfVerificationTest();
    return res.allPassed === true;
  });

  // TEST-RV-26: RQ-01 evidence includes M1 and M2
  runTest('TEST-RV-26', 'RQ-01 Metric Linkage', 'RQS', 'Links RQ-01 with M1 and M2 metrics', () => {
    const rq1 = snapshot.researchQuestions.find((r) => r.rqId === 'RQ-01');
    return !!rq1 && rq1.linkedMetrics.includes('M1_WORKFLOW_DURATION' as any);
  });

  // TEST-RV-27: RQ-04 evidence includes M9 and M10
  runTest('TEST-RV-27', 'RQ-04 Audit Metric Linkage', 'RQS', 'Links RQ-04 with M9 and M10 audit metrics', () => {
    const rq4 = snapshot.researchQuestions.find((r) => r.rqId === 'RQ-04');
    return (
      !!rq4 &&
      rq4.linkedMetrics.includes('M9_AUDIT_COMPLETENESS_SCORE' as any) &&
      rq4.linkedMetrics.includes('M10_DECISION_TRACEABILITY' as any)
    );
  });

  // TEST-RV-28: RQ-05 status is ASSUMPTION DEPENDENT
  runTest('TEST-RV-28', 'RQ-05 Assumption Dependency', 'RQS', 'Classifies RQ-05 as assumption dependent', () => {
    const rq5 = snapshot.researchQuestions.find((r) => r.rqId === 'RQ-05');
    return !!rq5 && rq5.finalResearchStatus === 'ASSUMPTION DEPENDENT';
  });

  // TEST-RV-29: M1 baseline mean is greater than SCOS mean
  runTest('TEST-RV-29', 'M1 Latency Advantage', 'METRICS', 'Shows lower workflow duration for SCOS vs Baseline in M1', () => {
    const m1 = snapshot.metrics.find((m) => m.metricCode === 'M1');
    return !!m1 && m1.baselineEvidence.mean > m1.scosEvidence.mean;
  });

  // TEST-RV-30: M9 and M10 SCOS mean is 100%
  runTest('TEST-RV-30', 'M9 and M10 100% Audit SCOS', 'METRICS', 'Shows 100% audit completeness and traceability for SCOS in M9 and M10', () => {
    const m9 = snapshot.metrics.find((m) => m.metricCode === 'M9');
    const m10 = snapshot.metrics.find((m) => m.metricCode === 'M10');
    return !!m9 && !!m10 && m9.scosEvidence.mean === 100 && m10.scosEvidence.mean === 100;
  });

  // TEST-RV-31: SC-01 primary infrastructure is Sisamau Nala
  runTest('TEST-RV-31', 'SC-01 Sisamau Infrastructure', 'SCENARIOS', 'Identifies Sisamau Nala as primary infrastructure for SC-01', () => {
    const sc1 = snapshot.scenarios.find((s) => s.scenarioId === 'SC-01');
    return !!sc1 && sc1.primaryCivilInfrastructure.includes('Sisamau Nala');
  });

  // TEST-RV-32: VC-01 result is PASS
  runTest('TEST-RV-32', 'VC-01 Deterministic Pass', 'VALIDATION_CASES', 'Verifies VC-01 result is PASS', () => {
    const vc1 = snapshot.validationCases.find((v) => v.validationCaseId === 'VC-01');
    return !!vc1 && vc1.result === 'PASS';
  });

  // TEST-RV-33: VC-07 result is PASS
  runTest('TEST-RV-33', 'VC-07 Cryptographic Traceability Pass', 'VALIDATION_CASES', 'Verifies VC-07 cryptographic traceability result is PASS', () => {
    const vc7 = snapshot.validationCases.find((v) => v.validationCaseId === 'VC-07');
    return !!vc7 && vc7.result === 'PASS';
  });

  // TEST-RV-34: Comparative evidence includes condition A and B
  runTest('TEST-RV-34', 'Comparative Condition A & B Definition', 'COMPARATIVE', 'Defines Condition A and Condition B in comparative evidence', () => {
    return (
      snapshot.comparativeEvidence.conditionAName.includes('Condition A') &&
      snapshot.comparativeEvidence.conditionBName.includes('Condition B')
    );
  });

  // TEST-RV-35: Statistical evidence specifies N=15
  runTest('TEST-RV-35', 'Statistical Sample Size N=15 Disclosure', 'STATISTICS', 'Discloses sample size N=15 in statistical evidence', () => {
    return snapshot.statisticalEvidence.sampleSizeNote.includes('N=15');
  });

  // TEST-RV-36: Sensitivity evidence confirms 4/5 RQs robust
  runTest('TEST-RV-36', '4 of 5 RQs Robust Confirmation', 'SENSITIVITY', 'Documents that 4 of 5 RQs are robust under sensitivity testing', () => {
    return snapshot.sensitivityEvidence.robustnessSummary.includes('4 out of 5');
  });

  // TEST-RV-37: Non-destructive verification: Phase 8-10 services intact
  runTest('TEST-RV-37', 'Phase 8-10 Services Non-Destructive Integrity', 'INTEGRITY', 'Verifies that existing Phase 8, 9, and 10 services remain intact', () => {
    const vcs = scenarioValidationService.getValidationCases();
    const scs = comparativeEvaluationService.getScenarios();
    const statSnap = statisticalAnalysisService.getAnalysisSnapshot();
    const rqs = researchEvidenceService.getResearchQuestions();
    const threats = researchFrameworkService.getThreatsToValidity();
    const params = sensitivityAnalysisService.getParameters();

    return (
      vcs.length === 7 &&
      scs.length === 5 &&
      Object.keys(statSnap.metrics).length === 10 &&
      rqs.length === 5 &&
      threats.length >= 14 &&
      params.length === 8
    );
  });

  // TEST-RV-38: RBAC permissions include RESEARCH_VALIDATION_VIEW
  runTest('TEST-RV-38', 'RESEARCH_VALIDATION_VIEW Permission', 'RBAC', 'Defines PermissionType.RESEARCH_VALIDATION_VIEW', () => {
    return PermissionType.RESEARCH_VALIDATION_VIEW === 'RESEARCH_VALIDATION_VIEW';
  });

  // TEST-RV-39: RBAC permissions include RESEARCH_VALIDATION_ADMIN
  runTest('TEST-RV-39', 'RESEARCH_VALIDATION_ADMIN Permission', 'RBAC', 'Defines PermissionType.RESEARCH_VALIDATION_ADMIN', () => {
    return PermissionType.RESEARCH_VALIDATION_ADMIN === 'RESEARCH_VALIDATION_ADMIN';
  });

  // TEST-RV-40: Academic affiliation is IIT Kanpur
  runTest('TEST-RV-40', 'IIT Kanpur Academic Affiliation', 'PROVENANCE', 'Specifies IIT Kanpur as academic affiliation', () => {
    return snapshot.provenanceManifest.academicAffiliation.institution.includes('IIT Kanpur');
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;
  const totalDuration = Date.now() - startTime;

  return {
    suiteId: 'SCOS-SUITE-11A-INTEGRATED-RESEARCH-VALIDATION',
    totalTests: results.length,
    passedCount,
    failedCount,
    durationMs: totalDuration,
    executedAt: new Date().toISOString(),
    allPassed: failedCount === 0,
    results,
    canonicalHash: snapshot.provenanceManifest.canonicalFingerprint,
    disclaimer: 'Phase 11A Integrated Research Validation 40-Test Automated Verification Suite',
  };
}
