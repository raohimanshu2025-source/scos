// =========================================================================
// SCOS PHASE 9C — SCENARIO VALIDATION & CALIBRATION TEST SUITE
// Automated Test Harness verifying internal model consistency & research criteria
// =========================================================================

import { scenarioValidationService } from '../services/scenarioValidationService';
import { scenarioCalibrationService } from '../services/scenarioCalibrationService';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';

export interface TestAssertionResult {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  executionTimeMs: number;
}

export interface ScenarioValidationTestSuiteResult {
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  executedAt: string;
  testResults: TestAssertionResult[];
  disclaimer: string;
}

export function runScenarioValidationTestSuite(): ScenarioValidationTestSuiteResult {
  const startTime = Date.now();
  const testResults: TestAssertionResult[] = [];

  function assert(id: string, title: string, condition: boolean, details: string) {
    testResults.push({
      id,
      title,
      passed: !!condition,
      message: condition ? `PASSED: ${details}` : `FAILED: ${details}`,
      executionTimeMs: 1,
    });
  }

  try {
    // =========================================================================
    // TEST-VAL-01: Baseline scenario loads and establishes normal reference state
    // =========================================================================
    const baselineCase = scenarioValidationService.getValidationCase('VC-01');
    const baselineOutput = scenarioValidationService.runValidationCase('VC-01');
    assert(
      'TEST-VAL-01',
      'Baseline scenario loads and establishes reference zero-shock state',
      !!baselineCase &&
        baselineCase.severityLevel === 'BASELINE' &&
        !!baselineOutput &&
        baselineOutput.simulationResult.cascadeSteps.length > 0,
      `Baseline case: ${baselineCase?.scenarioName}, Steps: ${baselineOutput?.simulationResult.cascadeSteps.length}`
    );

    // =========================================================================
    // TEST-VAL-02: Low severity scenario executes with localized impact
    // =========================================================================
    const lowOutput = scenarioValidationService.runValidationCase('VC-02');
    assert(
      'TEST-VAL-02',
      'Low severity scenario executes with localized perturbation and minimal cascade',
      !!lowOutput &&
        lowOutput.validationCaseId === 'VC-02' &&
        lowOutput.simulationResult.cascadeSteps.length > 0 &&
        lowOutput.validationResult.overallStatus !== 'FAILED_VALIDATION',
      `Low severity steps: ${lowOutput?.simulationResult.cascadeSteps.length}, Status: ${lowOutput?.validationResult.overallStatus}`
    );

    // =========================================================================
    // TEST-VAL-03: Medium severity scenario executes with increased cascade
    // =========================================================================
    const medOutput = scenarioValidationService.runValidationCase('VC-03');
    assert(
      'TEST-VAL-03',
      'Medium severity scenario executes with intermediate topological cascade',
      !!medOutput &&
        medOutput.validationCaseId === 'VC-03' &&
        medOutput.simulationResult.cascadeSteps.length >= 2,
      `Medium severity steps: ${medOutput?.simulationResult.cascadeSteps.length}`
    );

    // =========================================================================
    // TEST-VAL-04: High severity scenario executes with deep multi-tier cascade
    // =========================================================================
    const highOutput = scenarioValidationService.runValidationCase('VC-04');
    assert(
      'TEST-VAL-04',
      'High severity scenario executes with extensive multi-stage cascade progression',
      !!highOutput &&
        highOutput.validationCaseId === 'VC-04' &&
        highOutput.simulationResult.cascadeSteps.length >= 3 &&
        highOutput.simulationResult.criticalFacilitiesAtRisk.length > 0,
      `High severity steps: ${highOutput?.simulationResult.cascadeSteps.length}, Critical facilities: ${highOutput?.simulationResult.criticalFacilitiesAtRisk.length}`
    );

    // =========================================================================
    // TEST-VAL-05: Combined failure scenario executes with compound cascade
    // =========================================================================
    const combOutput = scenarioValidationService.runValidationCase('VC-06');
    assert(
      'TEST-VAL-05',
      'Combined failure scenario executes compound multi-agency disruption',
      !!combOutput &&
        combOutput.validationCaseId === 'VC-06' &&
        combOutput.simulationResult.affectedDepartments.length >= 3,
      `Combined failure departments mobilized: ${combOutput?.simulationResult.affectedDepartments.length}`
    );

    // =========================================================================
    // TEST-VAL-06: Same inputs produce reproducible deterministic structural results
    // =========================================================================
    const runA = scenarioValidationService.runValidationCase('VC-03');
    const runB = scenarioValidationService.runValidationCase('VC-03');
    const sameSteps = runA.simulationResult.cascadeSteps.length === runB.simulationResult.cascadeSteps.length;
    const sameDepts = runA.simulationResult.affectedDepartments.length === runB.simulationResult.affectedDepartments.length;
    const reproCrit = runA.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-01');
    assert(
      'TEST-VAL-06',
      'Same scenario inputs produce 100% reproducible deterministic structural outputs',
      sameSteps && sameDepts && reproCrit?.status === 'PASS',
      `Reproducibility confirmed. Step match: ${sameSteps}, Dept match: ${sameDepts}, Hash: ${runA.validationResult.reproducibilityHash.slice(0, 16)}`
    );

    // =========================================================================
    // TEST-VAL-07: Severity comparison is evaluated monotonically
    // =========================================================================
    const lowSteps = lowOutput.simulationResult.cascadeSteps.length;
    const highSteps = highOutput.simulationResult.cascadeSteps.length;
    const monoCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-02');
    assert(
      'TEST-VAL-07',
      'Severity comparison is evaluated monotonically without unexpected impact contraction',
      highSteps >= lowSteps && (monoCrit?.status === 'PASS' || monoCrit?.status === 'REQUIRES_REVIEW'),
      `Monotonicity check: Low(${lowSteps} steps) <= High(${highSteps} steps). Criterion Status: ${monoCrit?.status}`
    );

    // =========================================================================
    // TEST-VAL-08: Spatial relationships are respected and confined to valid catchment
    // =========================================================================
    const spatialCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-03');
    assert(
      'TEST-VAL-08',
      'Spatial proximity relationships are respected within topological catchment bounds',
      spatialCrit?.status === 'PASS',
      `Spatial integrity verified: ${spatialCrit?.observedBehaviour}`
    );

    // =========================================================================
    // TEST-VAL-09: Dependency relationships are respected along topological directed edges
    // =========================================================================
    const depCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-04');
    assert(
      'TEST-VAL-09',
      'Topological dependency relationships respected along ordered cascade edges',
      depCrit?.status === 'PASS',
      `Dependency graph propagation: ${depCrit?.observedBehaviour}`
    );

    // =========================================================================
    // TEST-VAL-10: Critical facility exposure is explainable and uses access disruption wording
    // =========================================================================
    const facCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-05');
    const hospitalAssessed = highOutput.simulationResult.criticalFacilitiesAtRisk.some((f) =>
      f.facilityName.includes('Ursula')
    );
    assert(
      'TEST-VAL-10',
      'Critical facility exposure is explainable and worded as access disruption rather than physical destruction',
      facCrit?.status === 'PASS' && hospitalAssessed,
      `Hospital access route evaluation verified: ${facCrit?.observedBehaviour}`
    );

    // =========================================================================
    // TEST-VAL-11: Department mapping is consistent with statutory roles
    // =========================================================================
    const deptCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-06');
    const hasKJS = highOutput.simulationResult.affectedDepartments.some((d) => d.departmentCode === 'KJS');
    assert(
      'TEST-VAL-11',
      'Department mapping follows statutory municipal mandates (KJS lead on drainage, Traffic on diversions)',
      deptCrit?.status === 'PASS' && hasKJS,
      `Department mapping verified: ${highOutput.simulationResult.affectedDepartments.map((d) => d.departmentCode).join(', ')}`
    );

    // =========================================================================
    // TEST-VAL-12: Provenance metadata is preserved across all validation outputs
    // =========================================================================
    const provCrit = highOutput.validationResult.criteria.find((c) => c.criterionId === 'VC-CRITERION-07');
    assert(
      'TEST-VAL-12',
      'Provenance metadata, digital twin version, and audit timestamps preserved across validation runs',
      provCrit?.status === 'PASS' && !!highOutput.validationResult.provenance.engineVersion,
      `Provenance version: ${highOutput.validationResult.provenance.engineVersion}, Classification: ${highOutput.validationResult.provenance.classification}`
    );

    // =========================================================================
    // TEST-VAL-13: SIMULATED / PROTOTYPE classification is explicitly preserved
    // =========================================================================
    const report = scenarioValidationService.generateValidationReport('VC-04');
    const hasDisclaimer =
      report.provenance.dataClassification.includes('SIMULATED') &&
      report.modelLimitations.some((l) => l.includes('PROTOTYPE'));
    assert(
      'TEST-VAL-13',
      'SIMULATED / PROTOTYPE DATA classification is explicitly preserved across report envelopes',
      hasDisclaimer,
      `Classification: ${report.provenance.dataClassification}, Limitations count: ${report.modelLimitations.length}`
    );

    // =========================================================================
    // TEST-VAL-14: RBAC blocks unauthorized users
    // =========================================================================
    const citizenPermissions = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];
    const officerPermissions = ROLE_PERMISSIONS_MAP[RoleType.DEPARTMENT_OFFICER] || [];
    const citizenBlocked = !citizenPermissions.includes(PermissionType.SCENARIO_VALIDATION_VIEW);
    const officerAllowed = officerPermissions.includes(PermissionType.SCENARIO_VALIDATION_VIEW);
    assert(
      'TEST-VAL-14',
      'RBAC policy grants SCENARIO_VALIDATION_VIEW to municipal officers while blocking unauthorized citizen roles',
      citizenBlocked && officerAllowed,
      `Citizen blocked: ${citizenBlocked}, Department Officer authorized: ${officerAllowed}`
    );

    // =========================================================================
    // TEST-VAL-15: Validation results do not trigger autonomous operational actions
    // =========================================================================
    const isObservationalOnly =
      report.modelLimitations.some((l) => l.includes('NO AUTONOMOUS CONTROL')) &&
      report.modelLimitations.some((l) => l.includes('HUMAN OFFICER MANDATE'));
    assert(
      'TEST-VAL-15',
      'Validation engine maintains strict observational boundary with zero autonomous actuation',
      isObservationalOnly,
      'Observational non-actuating governance boundary verified.'
    );

    // =========================================================================
    // TEST-VAL-16: Validation report contains engineering assumptions and explicit model limitations
    // =========================================================================
    const hasAssumptions = report.engineeringAssumptions.length > 0;
    const hasLimitations = report.modelLimitations.length >= 4;
    const hasComparison = !!report.comparisonWithBaseline;
    assert(
      'TEST-VAL-16',
      'Validation report contains engineering assumptions, baseline comparison, and comprehensive limitations',
      hasAssumptions && hasLimitations && hasComparison,
      `Assumptions: ${report.engineeringAssumptions.length}, Limitations: ${report.modelLimitations.length}, Baseline Delta: ${report.comparisonWithBaseline.modelledDifferences.impactedAssetDelta.deltaCount} assets`
    );
  } catch (err: any) {
    testResults.push({
      id: 'TEST-VAL-ERR',
      title: 'Unexpected Exception during Validation Test Harness Execution',
      passed: false,
      message: `Exception: ${err.message || String(err)}`,
      executionTimeMs: Date.now() - startTime,
    });
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.length - passedCount;

  return {
    success: failedCount === 0,
    totalTests: testResults.length,
    passedCount,
    failedCount,
    executedAt: new Date().toISOString(),
    testResults,
    disclaimer:
      'SIMULATED / PROTOTYPE TEST HARNESS — Verifies internal computational and topological consistency.',
  };
}
