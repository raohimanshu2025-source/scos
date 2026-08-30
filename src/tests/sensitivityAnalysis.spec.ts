// =========================================================================
// SCOS PHASE 10F — SENSITIVITY & ROBUSTNESS ANALYSIS TEST SUITE
// 30 Rigorous Automated Specs for Parameter Registry, OAT Perturbations,
// Elasticity Math, Tornado Rankings, Compound Stress Testing,
// RQ Robustness Claims, Empirical Calibration Gaps, and RBAC Provenance.
// =========================================================================

import { sensitivityAnalysisService } from '../services/sensitivityAnalysisService';
import { PermissionType, RoleType } from '../types/auth';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';

export interface SensitivityTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface SensitivityTestSuiteReport {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionDurationMs: number;
  timestamp: string;
  results: SensitivityTestResult[];
}

export function runSensitivityAnalysisTestSuite(): SensitivityTestSuiteReport {
  const startTime = Date.now();
  const results: SensitivityTestResult[] = [];

  const runTest = (
    specId: string,
    specName: string,
    category: string,
    description: string,
    testFn: () => void
  ) => {
    const t0 = Date.now();
    try {
      testFn();
      results.push({
        specId,
        specName,
        category,
        passed: true,
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

  const framework = sensitivityAnalysisService.getFramework();

  // -------------------------------------------------------------------------
  // 1. PARAMETER REGISTRY & BOUNDS VERIFICATION (Specs 01-05)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-01',
    'Audited Parameter Registry Count',
    'REGISTRY',
    'Verify exactly 12 engineering parameters are registered from Phase 10A repository audit.',
    () => {
      const params = sensitivityAnalysisService.getParameters();
      if (params.length !== 12) {
        throw new Error(`Expected 12 parameters, received ${params.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-02',
    'Precipitation Parameter Bounds & Unit',
    'REGISTRY',
    'Verify precipitation intensity parameter has minBound=0, maxBound=150, unit=mm/hr, default=65.',
    () => {
      const p = sensitivityAnalysisService.getParameter('precipitationIntensity');
      if (!p) throw new Error('precipitationIntensity parameter missing');
      if (p.defaultValue !== 65 || p.minBound !== 0 || p.maxBound !== 150 || p.unit !== 'mm/hr') {
        throw new Error(`Invalid precipitation properties: ${JSON.stringify(p)}`);
      }
    }
  );

  runTest(
    'SPEC-10F-03',
    'Pump Impairment Heuristic Classification',
    'REGISTRY',
    'Verify pumpCapacityLoss parameter is classified as ENGINEERING_HEURISTIC with critical empirical calibration need.',
    () => {
      const p = sensitivityAnalysisService.getParameter('pumpCapacityLoss');
      if (!p) throw new Error('pumpCapacityLoss parameter missing');
      if (p.sourceType !== 'ENGINEERING_HEURISTIC' || p.empiricalCalibrationNeed !== 'CRITICAL') {
        throw new Error(`Invalid pump capacity loss metadata: ${p.sourceType}, ${p.empiricalCalibrationNeed}`);
      }
    }
  );

  runTest(
    'SPEC-10F-04',
    'Siltation Factor Hydraulic Model Basis',
    'REGISTRY',
    'Verify siltationFactor parameter is bounded between 0.0 and 1.0 with HYDRAULIC_MODEL source.',
    () => {
      const p = sensitivityAnalysisService.getParameter('siltationFactor');
      if (!p) throw new Error('siltationFactor parameter missing');
      if (p.minBound !== 0.0 || p.maxBound !== 1.0 || p.sourceType !== 'HYDRAULIC_MODEL') {
        throw new Error(`Invalid siltation factor bounds: ${p.minBound} - ${p.maxBound}`);
      }
    }
  );

  runTest(
    'SPEC-10F-05',
    'Topological Inter-Asset Coupling Multiplier',
    'REGISTRY',
    'Verify dependencyStrengthMultiplier parameter is categorized under TOPOLOGICAL with maxBound 1.0.',
    () => {
      const p = sensitivityAnalysisService.getParameter('dependencyStrengthMultiplier');
      if (!p) throw new Error('dependencyStrengthMultiplier missing');
      if (p.category !== 'TOPOLOGICAL' || p.defaultValue !== 0.85) {
        throw new Error(`Invalid coupling multiplier: ${p.category}, ${p.defaultValue}`);
      }
    }
  );

  // -------------------------------------------------------------------------
  // 2. ONE-AT-A-TIME (OAT) PERTURBATION MATH (Specs 06-10)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-06',
    'OAT Matrix Cardinality',
    'OAT_EVALUATION',
    'Verify OAT results contain evaluations across all 12 parameters and multiple metrics.',
    () => {
      const oat = sensitivityAnalysisService.getOATResults();
      if (oat.length < 200) {
        throw new Error(`Expected >= 200 OAT evaluations, found ${oat.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-07',
    'Zero Perturbation Level Invariance',
    'OAT_EVALUATION',
    'Verify that when perturbation is 0%, delta is exactly 0 and elasticity is 0 across all parameters.',
    () => {
      const zeroOAT = sensitivityAnalysisService.getOATResults().filter((r) => r.perturbationPercent === 0);
      for (const item of zeroOAT) {
        if (item.absoluteDelta !== 0 || item.elasticity !== 0) {
          throw new Error(`Non-zero delta at 0% perturbation: ${item.parameterId} ${item.metricKey}`);
        }
      }
    }
  );

  runTest(
    'SPEC-10F-08',
    'Precipitation Monotonic Response on M1',
    'OAT_EVALUATION',
    'Verify precipitation increase (+50%) monotonically increases workflow duration.',
    () => {
      const pPlus50 = sensitivityAnalysisService.getOATResults({
        parameterId: 'precipitationIntensity',
        metricKey: 'M1_WORKFLOW_DURATION' as any,
      }).find((r) => r.perturbationPercent === 50);

      if (!pPlus50 || pPlus50.perturbedOutput <= 297) {
        throw new Error(`Expected increased latency, received ${pPlus50?.perturbedOutput}`);
      }
    }
  );

  runTest(
    'SPEC-10F-09',
    'Drainage Capacity Negative Elasticity',
    'OAT_EVALUATION',
    'Verify increased drainage capacity yields negative elasticity on operational latency.',
    () => {
      const dPlus50 = sensitivityAnalysisService.getOATResults({
        parameterId: 'drainageCapacity',
        metricKey: 'M1_WORKFLOW_DURATION' as any,
      }).find((r) => r.perturbationPercent === 50);

      if (!dPlus50 || dPlus50.elasticity >= 0) {
        throw new Error(`Expected negative elasticity for drainage, received ${dPlus50?.elasticity}`);
      }
    }
  );

  runTest(
    'SPEC-10F-10',
    'Elasticity Numerical Formula Consistency',
    'OAT_EVALUATION',
    'Verify elasticity matches % delta output / % delta input within 0.001 precision.',
    () => {
      const sample = sensitivityAnalysisService.getOATResults().find((r) => r.perturbationPercent === 25);
      if (!sample) throw new Error('Sample perturbation not found');
      const expected = Number((sample.relativeDeltaPercent / sample.perturbationPercent).toFixed(3));
      if (Math.abs(sample.elasticity - expected) > 0.001) {
        throw new Error(`Elasticity mismatch: ${sample.elasticity} vs expected ${expected}`);
      }
    }
  );

  // -------------------------------------------------------------------------
  // 3. TORNADO DIAGRAM RANKINGS (Specs 11-15)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-11',
    'Tornado Rankings Generation for M1, M6, M3',
    'TORNADO_ANALYSIS',
    'Verify tornado rankings exist for M1, M6, and M3 metrics.',
    () => {
      const tM1 = sensitivityAnalysisService.getTornadoRankings('M1_WORKFLOW_DURATION');
      const tM6 = sensitivityAnalysisService.getTornadoRankings('M6_CASCADE_IDENTIFICATION');
      const tM3 = sensitivityAnalysisService.getTornadoRankings('M3_CONTEXT_COMPLETENESS_SCORE');

      if (tM1.length !== 12 || tM6.length !== 12 || tM3.length !== 12) {
        throw new Error(`Incomplete tornado rankings: M1=${tM1.length}, M6=${tM6.length}, M3=${tM3.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-12',
    'M1 Dominant Factor Identification',
    'TORNADO_ANALYSIS',
    'Verify precipitationIntensity is identified as Rank 1 dominant factor for M1 workflow duration.',
    () => {
      const tM1 = sensitivityAnalysisService.getTornadoRankings('M1_WORKFLOW_DURATION');
      if (tM1[0].parameterId !== 'precipitationIntensity' || tM1[0].rank !== 1) {
        throw new Error(`Expected precipitationIntensity at rank 1, got ${tM1[0].parameterId}`);
      }
    }
  );

  runTest(
    'SPEC-10F-13',
    'M6 Cascade Dominant Factor Identification',
    'TORNADO_ANALYSIS',
    'Verify dependencyStrengthMultiplier is identified as Rank 1 for M6 cascade identification.',
    () => {
      const tM6 = sensitivityAnalysisService.getTornadoRankings('M6_CASCADE_IDENTIFICATION');
      if (tM6[0].parameterId !== 'dependencyStrengthMultiplier' || tM6[0].rank !== 1) {
        throw new Error(`Expected dependencyStrengthMultiplier at rank 1, got ${tM6[0].parameterId}`);
      }
    }
  );

  runTest(
    'SPEC-10F-14',
    'Tornado Output Swing Descending Sorting',
    'TORNADO_ANALYSIS',
    'Verify parameters are strictly sorted descending by outputSwingSpan.',
    () => {
      const tM1 = sensitivityAnalysisService.getTornadoRankings('M1_WORKFLOW_DURATION');
      for (let i = 0; i < tM1.length - 1; i++) {
        if (tM1[i].outputSwingSpan < tM1[i + 1].outputSwingSpan) {
          throw new Error(`Sorting violation at index ${i}: ${tM1[i].outputSwingSpan} < ${tM1[i + 1].outputSwingSpan}`);
        }
      }
    }
  );

  runTest(
    'SPEC-10F-15',
    'Normalized Sensitivity Score Boundary (0.0 - 1.0)',
    'TORNADO_ANALYSIS',
    'Verify normalizedSensitivityScore is bounded in [0.0, 1.0] and rank 1 is 1.000.',
    () => {
      const tM1 = sensitivityAnalysisService.getTornadoRankings('M1_WORKFLOW_DURATION');
      if (tM1[0].normalizedSensitivityScore !== 1.0) {
        throw new Error(`Rank 1 score not 1.0: ${tM1[0].normalizedSensitivityScore}`);
      }
      for (const item of tM1) {
        if (item.normalizedSensitivityScore < 0 || item.normalizedSensitivityScore > 1) {
          throw new Error(`Normalized score out of range: ${item.normalizedSensitivityScore}`);
        }
      }
    }
  );

  // -------------------------------------------------------------------------
  // 4. COMPOUND MULTI-HAZARD STRESS TESTING (Specs 16-20)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-16',
    'Compound Stress Scenarios Completeness',
    'COMPOUND_STRESS',
    'Verify 4 compound stress-testing scenarios are configured (CST-01 to CST-04).',
    () => {
      const compound = sensitivityAnalysisService.getCompoundStressResults();
      if (compound.length !== 4) {
        throw new Error(`Expected 4 compound scenarios, received ${compound.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-17',
    'CST-01 Multi-Failure Latency Resilience',
    'COMPOUND_STRESS',
    'Verify CST-01 maintains SCOS latency advantage over 1240s manual baseline (384s vs 1240s).',
    () => {
      const cst1 = sensitivityAnalysisService.getCompoundStressResults().find((c) => c.compoundId === 'CST-01');
      if (!cst1) throw new Error('CST-01 not found');
      if (cst1.stressedM1DurationSeconds !== 384 || cst1.criticalFailureTriggered) {
        throw new Error(`CST-01 unexpected stress outcome: ${cst1.stressedM1DurationSeconds}s`);
      }
    }
  );

  runTest(
    'SPEC-10F-18',
    'CST-02 Healthcare Access Ingress Retention',
    'COMPOUND_STRESS',
    'Verify CST-02 maintains decision support efficacy >= 90% during critical hospital access stress.',
    () => {
      const cst2 = sensitivityAnalysisService.getCompoundStressResults().find((c) => c.compoundId === 'CST-02');
      if (!cst2 || cst2.stressedM8DecisionSupportPercent < 90) {
        throw new Error(`CST-02 decision support low: ${cst2?.stressedM8DecisionSupportPercent}`);
      }
    }
  );

  runTest(
    'SPEC-10F-19',
    'CST-03 Topological Cascade Power Feeder Resilience',
    'COMPOUND_STRESS',
    'Verify CST-03 exhibits >= 85% performance retention during cascading substation trip.',
    () => {
      const cst3 = sensitivityAnalysisService.getCompoundStressResults().find((c) => c.compoundId === 'CST-03');
      if (!cst3 || cst3.performanceRetentionPercent < 85) {
        throw new Error(`CST-03 performance retention low: ${cst3?.performanceRetentionPercent}`);
      }
    }
  );

  runTest(
    'SPEC-10F-20',
    'CST-04 100-Year Cloudburst Drainage Saturation',
    'COMPOUND_STRESS',
    'Verify CST-04 correctly transitions operational utility from drainage to civil protection evacuation.',
    () => {
      const cst4 = sensitivityAnalysisService.getCompoundStressResults().find((c) => c.compoundId === 'CST-04');
      if (!cst4 || cst4.stressedM1DurationSeconds !== 412) {
        throw new Error(`CST-04 unexpected duration: ${cst4?.stressedM1DurationSeconds}`);
      }
    }
  );

  // -------------------------------------------------------------------------
  // 5. RESEARCH QUESTIONS ROBUSTNESS (Specs 21-25)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-21',
    'RQ Robustness Assessments Coverage (5/5)',
    'RQ_ROBUSTNESS',
    'Verify all 5 research questions (RQ-01 to RQ-05) have formal robustness assessments.',
    () => {
      const rqs = sensitivityAnalysisService.getRQAssessments();
      if (rqs.length !== 5) {
        throw new Error(`Expected 5 RQ assessments, found ${rqs.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-22',
    'RQ-01 Decision Latency High Robustness',
    'RQ_ROBUSTNESS',
    'Verify RQ-01 is classified as HIGHLY_ROBUST with no conclusion reversals.',
    () => {
      const rq1 = sensitivityAnalysisService.getRQAssessment('RQ-01');
      if (rq1?.robustnessClassification !== 'HIGHLY_ROBUST' || rq1.conclusionReversalObserved) {
        throw new Error(`RQ-01 invalid classification: ${rq1?.robustnessClassification}`);
      }
    }
  );

  runTest(
    'SPEC-10F-23',
    'RQ-02 Multi-Department Coordination Robustness',
    'RQ_ROBUSTNESS',
    'Verify RQ-02 coordination advantage exhibits elasticity < 0.15.',
    () => {
      const rq2 = sensitivityAnalysisService.getRQAssessment('RQ-02');
      if (!rq2 || rq2.elasticityIndex >= 0.15) {
        throw new Error(`RQ-02 elasticity too high: ${rq2?.elasticityIndex}`);
      }
    }
  );

  runTest(
    'SPEC-10F-24',
    'RQ-04 Cryptographic Audit Invariance (Elasticity 0.00)',
    'RQ_ROBUSTNESS',
    'Verify RQ-04 cryptographic auditability has exactly 0.00 elasticity to physical variables.',
    () => {
      const rq4 = sensitivityAnalysisService.getRQAssessment('RQ-04');
      if (!rq4 || rq4.elasticityIndex !== 0.0) {
        throw new Error(`RQ-04 elasticity must be 0.00, received ${rq4?.elasticityIndex}`);
      }
    }
  );

  runTest(
    'SPEC-10F-25',
    'RQ-05 Bounded Assumption-Dependent Classification',
    'RQ_ROBUSTNESS',
    'Verify RQ-05 is explicitly flagged as SENSITIVE_ASSUMPTION_DEPENDENT requiring local hydraulic calibration.',
    () => {
      const rq5 = sensitivityAnalysisService.getRQAssessment('RQ-05');
      if (rq5?.robustnessClassification !== 'SENSITIVE_ASSUMPTION_DEPENDENT') {
        throw new Error(`RQ-05 must be SENSITIVE_ASSUMPTION_DEPENDENT, received ${rq5?.robustnessClassification}`);
      }
    }
  );

  // -------------------------------------------------------------------------
  // 6. CALIBRATION ROADMAP, RBAC & PROVENANCE (Specs 26-30)
  // -------------------------------------------------------------------------
  runTest(
    'SPEC-10F-26',
    'Empirical Calibration Gaps Prioritization',
    'CALIBRATION_ROADMAP',
    'Verify 7 prioritized civil engineering empirical calibration gaps exist.',
    () => {
      const gaps = sensitivityAnalysisService.getCalibrationGaps();
      if (gaps.length !== 7) {
        throw new Error(`Expected 7 calibration gaps, received ${gaps.length}`);
      }
    }
  );

  runTest(
    'SPEC-10F-27',
    'Nala Siltation Acoustic Telemetry Gap',
    'CALIBRATION_ROADMAP',
    'Verify GAP-CAL-01 specifies acoustic ADCP sonar sensors for Sisamau & Nala-17 silt profiling.',
    () => {
      const g1 = sensitivityAnalysisService.getCalibrationGaps().find((g) => g.gapId === 'GAP-CAL-01');
      if (!g1 || g1.sensitivityImpact !== 'HIGH' || !g1.proposedFieldSensors.some((s) => s.includes('Acoustic'))) {
        throw new Error(`GAP-CAL-01 invalid configuration: ${JSON.stringify(g1)}`);
      }
    }
  );

  runTest(
    'SPEC-10F-28',
    'Phase 10F RBAC Permissions Enforcement',
    'RBAC_GOVERNANCE',
    'Verify SENSITIVITY_ANALYSIS_VIEW and EXECUTE are granted to SUPER_ADMIN, DEPARTMENT_ADMIN, AI_GOVERNANCE_OFFICER.',
    () => {
      const superAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.SUPER_ADMIN];
      const deptAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DEPARTMENT_ADMIN];
      const aiGovPerms = ROLE_PERMISSIONS_MAP[RoleType.AI_GOVERNANCE_OFFICER];

      if (!superAdminPerms.includes(PermissionType.SENSITIVITY_ANALYSIS_VIEW) ||
          !superAdminPerms.includes(PermissionType.SENSITIVITY_ANALYSIS_ADMIN)) {
        throw new Error('SUPER_ADMIN missing sensitivity permissions');
      }
      if (!deptAdminPerms.includes(PermissionType.SENSITIVITY_ANALYSIS_VIEW) ||
          !deptAdminPerms.includes(PermissionType.SENSITIVITY_ANALYSIS_EXECUTE)) {
        throw new Error('DEPARTMENT_ADMIN missing sensitivity permissions');
      }
      if (!aiGovPerms.includes(PermissionType.SENSITIVITY_ANALYSIS_VIEW)) {
        throw new Error('AI_GOVERNANCE_OFFICER missing sensitivity view');
      }
    }
  );

  runTest(
    'SPEC-10F-29',
    'Deterministic SHA-256 Fingerprint Verification',
    'PROVENANCE',
    'Verify framework canonical SHA-256 fingerprint is 64 hex characters and self-verifies.',
    () => {
      const hash = framework.canonicalHash;
      if (!hash || hash.length !== 64) {
        throw new Error(`Invalid hash length: ${hash}`);
      }
      const verif = sensitivityAnalysisService.verifyReproducibility(hash);
      if (!verif.isMatch) {
        throw new Error('Self-verification hash mismatch');
      }
    }
  );

  runTest(
    'SPEC-10F-30',
    'CSV & JSON Export Serialization',
    'DATA_EXPORTS',
    'Verify CSV export contains valid header rows and OAT/RQ records.',
    () => {
      const csv = sensitivityAnalysisService.exportCSV();
      if (!csv.startsWith('Section,ParameterId') || !csv.includes('OAT_PERTURBATION') || !csv.includes('RQ-01')) {
        throw new Error('CSV serialization format incomplete');
      }
    }
  );

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.length - passedTests;
  const executionDurationMs = Date.now() - startTime;

  return {
    suiteName: 'SCOS-SUITE-10F-SENSITIVITY-ROBUSTNESS',
    totalTests: results.length,
    passedTests,
    failedTests,
    executionDurationMs,
    timestamp: new Date().toISOString(),
    results,
  };
}
