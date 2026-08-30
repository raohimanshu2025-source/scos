// =========================================================================
// SCOS PHASE 10A — RESEARCH DATASET & SCENARIO REGISTRY TEST SUITE (25 TESTS)
// Verification Harness for Research Governance & Reproducibility Foundation
// =========================================================================

import {
  researchDatasetService,
  canonicalJsonStringify,
  computeDeterministicFingerprint,
} from '../services/researchDatasetService';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';

export interface TestAssertionResult {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  executionTimeMs: number;
}

export interface ResearchDatasetTestSuiteResult {
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  executedAt: string;
  testResults: TestAssertionResult[];
  disclaimer: string;
}

export function runResearchDatasetTestSuite(): ResearchDatasetTestSuiteResult {
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
    // TEST-DATASET-01: Research Dataset summary exists with valid metadata
    // =========================================================================
    const dataset = researchDatasetService.getDatasetSummary();
    assert(
      'TEST-DATASET-01',
      'Dataset summary exists with valid metadata and prototype classification',
      !!dataset &&
        dataset.datasetId.length > 0 &&
        dataset.classification === 'SIMULATED / PROTOTYPE DATA' &&
        dataset.provenance.isSimulatedPrototype === true,
      `Dataset ID: "${dataset.datasetId}", Classification: "${dataset.classification}"`
    );

    // =========================================================================
    // TEST-DATASET-02: 5 Authoritative Scenarios (SC-01 to SC-05) registered
    // =========================================================================
    const scenarios = researchDatasetService.getAllScenarios();
    const scCodes = scenarios.map((s) => s.scenarioCode).sort();
    assert(
      'TEST-DATASET-02',
      '5 authoritative research scenarios (SC-01 to SC-05) are registered',
      scenarios.length === 5 &&
        scCodes.join(',') === 'SC-01,SC-02,SC-03,SC-04,SC-05',
      `Registered Scenarios: [${scCodes.join(', ')}] (Count: ${scenarios.length})`
    );

    // =========================================================================
    // TEST-DATASET-03: SC-01 preserves target entities, category & parameters
    // =========================================================================
    const sc01 = researchDatasetService.getScenario('SC-01');
    assert(
      'TEST-DATASET-03',
      'SC-01 (Severe Waterlogging at Parade) preserves target entities and hydrologic parameters',
      !!sc01 &&
        sc01.scenarioCategory === 'Monsoonal Urban Flooding' &&
        sc01.targetEntities.some((e) => e.id === 'ROAD-PARADE-A') &&
        sc01.engineeringParameters.some((p) => p.parameterId === 'precipitationIntensity' && p.value === 45),
      `SC-01 Category: "${sc01?.scenarioCategory}", Entities: ${sc01?.targetEntities.map((e) => e.id).join(', ')}`
    );

    // =========================================================================
    // TEST-DATASET-04: SC-02 preserves mechanical failure characteristics
    // =========================================================================
    const sc02 = researchDatasetService.getScenario('SC-02');
    assert(
      'TEST-DATASET-04',
      'SC-02 (Param Purwa Dewatering Station P-04) preserves mechanical pump trip profile',
      !!sc02 &&
        sc02.targetEntities.some((e) => e.id === 'INFRA-PUMP-PARAM-PURWAPUMP') &&
        sc02.engineeringParameters.some((p) => p.parameterId === 'pumpCapacityLoss' && p.value === 100),
      `SC-02 Target: "${sc02?.targetEntities[0]?.name}", Pump Loss: 100%`
    );

    // =========================================================================
    // TEST-DATASET-05: SC-03 preserves hydraulic surcharge & silt factor
    // =========================================================================
    const sc03 = researchDatasetService.getScenario('SC-03');
    assert(
      'TEST-DATASET-05',
      'SC-03 (Nala-17 Siltation) preserves hydraulic surcharge and siltation ratio',
      !!sc03 &&
        sc03.targetEntities.some((e) => e.id === 'INFRA-DRAIN-NALA-17') &&
        sc03.engineeringParameters.some((p) => p.parameterId === 'siltationFactor' && p.value === 0.8),
      `SC-03 Target: "${sc03?.targetEntities[0]?.name}", Silt Factor: 0.8`
    );

    // =========================================================================
    // TEST-DATASET-06: SC-04 preserves multi-hazard compound characteristics
    // =========================================================================
    const sc04 = researchDatasetService.getScenario('SC-04');
    assert(
      'TEST-DATASET-06',
      'SC-04 (Compound Cloudburst + Drainage + Pump) preserves compound multi-asset targets',
      !!sc04 &&
        sc04.targetEntities.length >= 3 &&
        sc04.targetEntities.some((e) => e.id === 'INFRA-SUB-CIVILLINES') &&
        sc04.engineeringParameters.some((p) => p.parameterId === 'precipitationIntensity' && p.value === 65),
      `SC-04 Entities: ${sc04?.targetEntities.map((e) => e.name).join('; ')}`
    );

    // =========================================================================
    // TEST-DATASET-07: SC-05 preserves Ursula Hospital access impedance metrics
    // =========================================================================
    const sc05 = researchDatasetService.getScenario('SC-05');
    assert(
      'TEST-DATASET-07',
      'SC-05 (Hospital Access Corridor) preserves healthcare facility protection metrics',
      !!sc05 &&
        sc05.targetEntities.some((e) => e.id === 'INFRA-HOSP-URSULA') &&
        sc05.engineeringParameters.some((p) => p.parameterId === 'criticalFacilityAccessImpedance' && p.value === 75),
      `SC-05 Hospital: "${sc05?.targetEntities[0]?.name}", Access Impedance: 75%`
    );

    // =========================================================================
    // TEST-DATASET-08: Validation cases VC-01..VC-07 linked to scenarios
    // =========================================================================
    const allLinkedValCases = new Set<string>();
    scenarios.forEach((s) => s.validationCaseIds.forEach((vc) => allLinkedValCases.add(vc)));
    assert(
      'TEST-DATASET-08',
      'Validation cases VC-01 through VC-07 are linked across the scenario registry',
      allLinkedValCases.has('VC-01') &&
        allLinkedValCases.has('VC-02') &&
        allLinkedValCases.has('VC-03') &&
        allLinkedValCases.has('VC-04') &&
        allLinkedValCases.has('VC-05') &&
        allLinkedValCases.has('VC-06') &&
        allLinkedValCases.has('VC-07'),
      `Linked Validation Cases: [${Array.from(allLinkedValCases).sort().join(', ')}]`
    );

    // =========================================================================
    // TEST-DATASET-09: Comparative evaluation scenarios mapped
    // =========================================================================
    const compMappings = scenarios.map((s) => s.comparativeScenarioIds).flat();
    assert(
      'TEST-DATASET-09',
      'Comparative evaluation benchmark scenario IDs (Phase 9D) are mapped',
      compMappings.includes('SC-01') &&
        compMappings.includes('SC-02') &&
        compMappings.includes('SC-03') &&
        compMappings.includes('SC-04') &&
        compMappings.includes('SC-05'),
      `Comparative Scenario Mappings: [${compMappings.join(', ')}]`
    );

    // =========================================================================
    // TEST-DATASET-10: Centralized engineering assumptions contains >= 12 params
    // =========================================================================
    const assumptions = researchDatasetService.getAllAssumptions();
    assert(
      'TEST-DATASET-10',
      'Centralized engineering assumptions registry contains at least 12 parameters',
      assumptions.length >= 12,
      `Registered Assumptions Count: ${assumptions.length}`
    );

    // =========================================================================
    // TEST-DATASET-11: Precipitation intensity assumption validity
    // =========================================================================
    const precip = researchDatasetService.getAssumption('precipitationIntensity');
    assert(
      'TEST-DATASET-11',
      'Precipitation intensity assumption specifies valid units and reasonable bounds',
      !!precip &&
        precip.unit === 'mm/hr' &&
        precip.defaultValue === 65 &&
        precip.minimum === 0 &&
        precip.maximum === 150,
      `Parameter: "${precip?.name}", Default: ${precip?.defaultValue} ${precip?.unit}, Range: [${precip?.minimum}-${precip?.maximum}]`
    );

    // =========================================================================
    // TEST-DATASET-12: Dewatering pump capacity loss assumption validity
    // =========================================================================
    const pumpLoss = researchDatasetService.getAssumption('pumpCapacityLoss');
    assert(
      'TEST-DATASET-12',
      'Pump capacity loss assumption specifies percentage unit and engineering heuristic source',
      !!pumpLoss &&
        pumpLoss.unit === '%' &&
        pumpLoss.defaultValue === 100 &&
        pumpLoss.sourceType === 'ENGINEERING_HEURISTIC',
      `Parameter: "${pumpLoss?.name}", Source: ${pumpLoss?.sourceType}, Range: [${pumpLoss?.minimum}-${pumpLoss?.maximum}%]`
    );

    // =========================================================================
    // TEST-DATASET-13: Drainage capacity reduction parameter validity
    // =========================================================================
    const drainCap = researchDatasetService.getAssumption('drainageCapacity');
    assert(
      'TEST-DATASET-13',
      'Drainage capacity reduction assumption is defined with hydraulic model rationale',
      !!drainCap &&
        drainCap.unit === '%' &&
        drainCap.sourceType === 'HYDRAULIC_MODEL' &&
        drainCap.defaultValue === 80,
      `Parameter: "${drainCap?.name}", Source: ${drainCap?.sourceType}, Default: ${drainCap?.defaultValue}%`
    );

    // =========================================================================
    // TEST-DATASET-14: Mean Time to Restoration (MTTR) assumption validity
    // =========================================================================
    const mttr = researchDatasetService.getAssumption('meanRestorationTime');
    assert(
      'TEST-DATASET-14',
      'Mean time to restoration (MTTR) assumption specifies hours and calibrated defaults',
      !!mttr &&
        mttr.unit === 'hours' &&
        mttr.defaultValue === 4.0 &&
        mttr.minimum === 0.5 &&
        mttr.maximum === 24.0,
      `Parameter: "${mttr?.name}", Value: ${mttr?.defaultValue} hours, Range: [${mttr?.minimum}-${mttr?.maximum}]`
    );

    // =========================================================================
    // TEST-DATASET-15: Experimental Condition A (Baseline Manual) definition
    // =========================================================================
    const condA = sc01?.baselineCondition;
    assert(
      'TEST-DATASET-15',
      'Condition A (Baseline Manual) defines manual workflow stages and disconnected auditability',
      !!condA &&
        condA.conditionType === 'BASELINE_MANUAL' &&
        condA.decisionSupportAvailability === false &&
        condA.workflowStages.length >= 4,
      `Condition A Stages: ${condA?.workflowStages.length}, Decision Support: ${condA?.decisionSupportAvailability}`
    );

    // =========================================================================
    // TEST-DATASET-16: Experimental Condition B (SCOS Integrated) definition
    // =========================================================================
    const condB = sc01?.scosCondition;
    assert(
      'TEST-DATASET-16',
      'Condition B (SCOS Integrated) defines digital twin stages and automated auditability',
      !!condB &&
        condB.conditionType === 'SCOS_INTEGRATED' &&
        condB.decisionSupportAvailability === true &&
        condB.workflowStages.length >= 4,
      `Condition B Stages: ${condB?.workflowStages.length}, Decision Support: ${condB?.decisionSupportAvailability}`
    );

    // =========================================================================
    // TEST-DATASET-17: Deterministic configuration fingerprinting stability
    // =========================================================================
    const testPayload = { scenarioId: 'SC-01', version: 'v1.0', value: 45 };
    const hash1 = computeDeterministicFingerprint(testPayload);
    const hash2 = computeDeterministicFingerprint(testPayload);
    assert(
      'TEST-DATASET-17',
      'Deterministic configuration fingerprint produces identical 64-character hash for identical inputs',
      hash1 === hash2 && hash1.length === 64,
      `Hash 1: ${hash1.slice(0, 16)}..., Hash 2: ${hash2.slice(0, 16)}... (Length: ${hash1.length})`
    );

    // =========================================================================
    // TEST-DATASET-18: Configuration fingerprint changes on parameter alteration
    // =========================================================================
    const alteredPayload = { scenarioId: 'SC-01', version: 'v1.0', value: 46 };
    const hashAltered = computeDeterministicFingerprint(alteredPayload);
    assert(
      'TEST-DATASET-18',
      'Configuration fingerprint changes when input parameter values are modified',
      hash1 !== hashAltered,
      `Original: ${hash1.slice(0, 12)}..., Altered: ${hashAltered.slice(0, 12)}... (Distinct: true)`
    );

    // =========================================================================
    // TEST-DATASET-19: Canonical serialization key-order invariance
    // =========================================================================
    const objA = { z: 1, a: 2, m: { y: 10, x: 20 } };
    const objB = { a: 2, z: 1, m: { x: 20, y: 10 } };
    const canonA = canonicalJsonStringify(objA);
    const canonB = canonicalJsonStringify(objB);
    const hashA = computeDeterministicFingerprint(objA);
    const hashB = computeDeterministicFingerprint(objB);
    assert(
      'TEST-DATASET-19',
      'Canonical JSON serialization is invariant to object key ordering',
      canonA === canonB && hashA === hashB,
      `Canonical: "${canonA}", Hash Match: ${hashA === hashB}`
    );

    // =========================================================================
    // TEST-DATASET-20: Dataset version SCOS-RESEARCH-DATASET-v1.0 integrity
    // =========================================================================
    const versions = researchDatasetService.getAllVersions();
    const v1 = versions.find((v) => v.versionTag === 'v1.0');
    assert(
      'TEST-DATASET-20',
      'Dataset version v1.0 has VALIDATED status and valid configuration fingerprint',
      !!v1 &&
        v1.status === 'VALIDATED' &&
        v1.scenarioCount === 5 &&
        v1.configurationFingerprint.length === 64,
      `Version Tag: "${v1?.versionTag}", Scenarios: ${v1?.scenarioCount}, Fingerprint: ${v1?.configurationFingerprint.slice(0, 12)}...`
    );

    // =========================================================================
    // TEST-DATASET-21: Reproducibility check identifies MATCH for valid hash
    // =========================================================================
    if (sc01) {
      const matchCheck = researchDatasetService.verifyReproducibility({
        scenarioId: 'SC-01',
        configurationFingerprint: sc01.configurationFingerprint,
      });
      assert(
        'TEST-DATASET-21',
        'Reproducibility verification endpoint correctly confirms MATCH for authentic fingerprint',
        matchCheck.status === 'MATCH' && matchCheck.isMatch === true,
        `Status: "${matchCheck.status}", Match: ${matchCheck.isMatch}`
      );
    } else {
      assert('TEST-DATASET-21', 'Reproducibility check identifies MATCH', false, 'SC-01 not found');
    }

    // =========================================================================
    // TEST-DATASET-22: Reproducibility check identifies MISMATCH on altered param
    // =========================================================================
    if (sc01) {
      const mismatchCheck = researchDatasetService.verifyReproducibility({
        scenarioId: 'SC-01',
        configurationFingerprint: '0000000000000000000000000000000000000000000000000000000000000000',
        parametersOverride: { precipitationIntensity: 99 },
      });
      assert(
        'TEST-DATASET-22',
        'Reproducibility verification correctly identifies MISMATCH and details diffs',
        mismatchCheck.status === 'MISMATCH' &&
          mismatchCheck.isMatch === false &&
          (mismatchCheck.diffSummary?.length || 0) > 0,
        `Status: "${mismatchCheck.status}", Diff count: ${mismatchCheck.diffSummary?.length}`
      );
    } else {
      assert('TEST-DATASET-22', 'Reproducibility check identifies MISMATCH', false, 'SC-01 not found');
    }

    // =========================================================================
    // TEST-DATASET-23: Scenario execution record captures snapshot and provenance
    // =========================================================================
    const execution = researchDatasetService.executeResearchRun('SC-01', 'SCOS_INTEGRATED', {
      precipitationIntensity: 50,
    });
    assert(
      'TEST-DATASET-23',
      'Research scenario execution record captures parameter snapshot and provenance',
      !!execution &&
        execution.scenarioId === 'SC-01' &&
        execution.condition === 'SCOS_INTEGRATED' &&
        execution.executionStatus === 'COMPLETED' &&
        execution.parameterSnapshot.precipitationIntensity === 50 &&
        execution.classification === 'SIMULATED / PROTOTYPE DATA',
      `Execution ID: "${execution.executionId}", Fingerprint: ${execution.configurationFingerprint.slice(0, 12)}...`
    );

    // =========================================================================
    // TEST-DATASET-24: RBAC permissions correctly enforce roles
    // =========================================================================
    const superAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.SUPER_ADMIN] || [];
    const districtAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
    const deptOfficerPerms = ROLE_PERMISSIONS_MAP[RoleType.DEPARTMENT_OFFICER] || [];
    const citizenPerms = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];

    assert(
      'TEST-DATASET-24',
      'RBAC permissions correctly enforce RESEARCH_DATASET privileges across roles',
      superAdminPerms.includes(PermissionType.RESEARCH_DATASET_VIEW) &&
        districtAdminPerms.includes(PermissionType.RESEARCH_DATASET_ADMIN) &&
        deptOfficerPerms.includes(PermissionType.RESEARCH_DATASET_VIEW) &&
        !deptOfficerPerms.includes(PermissionType.RESEARCH_DATASET_ADMIN) &&
        !citizenPerms.includes(PermissionType.RESEARCH_DATASET_VIEW),
      `SuperAdmin: OK, DistrictAdmin: OK, DeptOfficer: ViewOnly, Citizen: NoAccess`
    );

    // =========================================================================
    // TEST-DATASET-25: Exports include SIMULATED / PROTOTYPE DATA notice
    // =========================================================================
    const jsonExport = researchDatasetService.exportDataset('evaluator@scos.gov.in');
    const csvExport = researchDatasetService.exportDatasetCSV();
    assert(
      'TEST-DATASET-25',
      'Full dataset JSON and CSV exports contain mandatory SIMULATED / PROTOTYPE DATA notice',
      jsonExport.exportMetadata.classificationNotice.includes('SIMULATED / PROTOTYPE DATA') &&
        jsonExport.scenarios.length === 5 &&
        csvExport.includes('CLASSIFICATION: SIMULATED / PROTOTYPE DATA') &&
        csvExport.includes('SC-01'),
      `JSON Classification: "${jsonExport.exportMetadata.classificationNotice.slice(0, 30)}...", CSV Header verified`
    );
  } catch (error: any) {
    assert(
      'TEST-DATASET-CRITICAL-ERROR',
      'Test execution encountered an unhandled exception',
      false,
      error?.message || 'Unknown test runner error'
    );
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.filter((t) => !t.passed).length;

  return {
    success: failedCount === 0,
    totalTests: testResults.length,
    passedCount,
    failedCount,
    executedAt: new Date().toISOString(),
    testResults,
    disclaimer:
      'SIMULATED / PROTOTYPE TEST HARNESS — Verifies internal dataset consistency, canonical hashing, and scenario reproducibility. Does not represent real-world municipal operational telemetry.',
  };
}
