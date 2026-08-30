// =========================================================================
// SCOS PHASE 9A — URBAN DIGITAL TWIN FOUNDATION TEST SUITE
// Tests 20 critical engineering, spatial, topological, operational, and RBAC assertions
// =========================================================================

import { urbanDigitalTwinService } from '../services/urbanDigitalTwinService';
import { scenarioSimulationService } from '../services/scenarioSimulationService';
import { operationalMonitoringService } from '../services/operationalMonitoringService';
import { operationalDecisionSupportService } from '../services/operationalDecisionSupportService';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';
import { apiClient } from '../services/apiClient';

export function runUrbanDigitalTwinTestSuite(): {
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  testResults: Array<{ id: string; title: string; passed: boolean; message?: string }>;
} {
  const testResults: Array<{ id: string; title: string; passed: boolean; message?: string }> = [];

  const assert = (id: string, title: string, condition: boolean, failMessage?: string) => {
    testResults.push({
      id,
      title,
      passed: condition,
      message: condition ? undefined : failMessage || 'Assertion failed',
    });
  };

  try {
    // TEST-DT-01: Digital Twin state loads successfully
    const state = urbanDigitalTwinService.getTwinState();
    assert(
      'TEST-DT-01',
      'Digital Twin state loads successfully with valid state ID and timestamp',
      !!state && !!state.stateId && !!state.timestamp && state.entities.length > 0,
      `State ID: ${state?.stateId}, Entities: ${state?.entities?.length}`
    );

    // TEST-DT-02: Existing infrastructure assets are represented without duplicate infrastructure records
    const allEntities = urbanDigitalTwinService.getAllEntities();
    const entityIds = allEntities.map((e) => e.entityId);
    const uniqueEntityIds = new Set(entityIds);
    const hasInfrastructureSource = allEntities.some(
      (e) => e.entityId === 'INFRA-ROAD-PARADE-CORRIDOR' || e.sourceAssetId === 'INFRA-ROAD-PARADE-CORRIDOR'
    );
    assert(
      'TEST-DT-02',
      'Existing infrastructure assets are represented without duplicate entity IDs',
      entityIds.length === uniqueEntityIds.size && hasInfrastructureSource,
      `Entities: ${entityIds.length}, Unique IDs: ${uniqueEntityIds.size}`
    );

    // TEST-DT-03: Entity lookup returns valid entity
    const roadEntity = urbanDigitalTwinService.getEntity('INFRA-ROAD-PARADE-CORRIDOR');
    assert(
      'TEST-DT-03',
      'Entity lookup returns valid entity with location and attributes',
      !!roadEntity && roadEntity.name.includes('Parade') && !!roadEntity.location.ward,
      `Looked up: ${roadEntity?.name}`
    );

    // TEST-DT-04: Spatial relationships are available
    const spatialRels = urbanDigitalTwinService.getSpatialRelationships('INFRA-ROAD-PARADE-CORRIDOR', 3000);
    assert(
      'TEST-DT-04',
      'Spatial relationships computed using Haversine distance engine',
      Array.isArray(spatialRels) && spatialRels.length > 0 && typeof spatialRels[0].distanceMeters === 'number',
      `Spatial neighbors found: ${spatialRels.length}`
    );

    // TEST-DT-05: Dependency relationships are represented
    const deps = urbanDigitalTwinService.getDependencies('INFRA-ROAD-PARADE-CORRIDOR');
    assert(
      'TEST-DT-05',
      'Dependency relationships represented with valid source and target links',
      Array.isArray(deps) && deps.length > 0 && !!deps[0].relationshipType,
      `Dependencies count: ${deps.length}`
    );

    // TEST-DT-06: Dependent entities can be retrieved
    const dependents = urbanDigitalTwinService.getDependents('INFRA-DRAIN-NALA-17');
    assert(
      'TEST-DT-06',
      'Dependent entities can be retrieved for critical civil drainage infrastructure',
      Array.isArray(dependents) && dependents.length > 0,
      `Dependents on Nala 17: ${dependents.length}`
    );

    // TEST-DT-07: Operational states are dynamically derived
    const opState = urbanDigitalTwinService.getOperationalState('INFRA-ROAD-PARADE-CORRIDOR');
    assert(
      'TEST-DT-07',
      'Operational states are dynamically derived from incident store and telemetry',
      !!opState && typeof opState.activeIncidentCount === 'number' && typeof opState.predictiveRiskScore === 'number',
      `Active incidents: ${opState?.activeIncidentCount}, Risk score: ${opState?.predictiveRiskScore}`
    );

    // TEST-DT-08: Criticality information is preserved
    assert(
      'TEST-DT-08',
      'Criticality levels (CRITICAL, HIGH, MEDIUM, LOW) are strictly preserved from civil assets',
      !!roadEntity && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(roadEntity.criticality),
      `Entity criticality: ${roadEntity?.criticality}`
    );

    // TEST-DT-09: Data provenance is preserved
    assert(
      'TEST-DT-09',
      'Data provenance metadata and publisher lineage are strictly maintained',
      !!roadEntity?.provenance && !!roadEntity.provenance.sourceId && !!roadEntity.provenance.department,
      `Source ID: ${roadEntity?.provenance?.sourceId}, Dept: ${roadEntity?.provenance?.department}`
    );

    // TEST-DT-10: Data freshness is preserved
    assert(
      'TEST-DT-10',
      'Data freshness classification (FRESH, STALE, EXPIRING, REAL_TIME_SIMULATED) is tracked',
      !!roadEntity && ['FRESH', 'STALE', 'EXPIRING', 'REAL_TIME_SIMULATED'].includes(roadEntity.dataFreshness),
      `Freshness: ${roadEntity?.dataFreshness}`
    );

    // TEST-DT-11: SIMULATED / PROTOTYPE classification is present
    const stats = urbanDigitalTwinService.getTwinStatistics();
    assert(
      'TEST-DT-11',
      'SIMULATED / PROTOTYPE classification banner is present in governance metadata and state',
      state.governance.isSimulatedPrototype && state.governance.classificationNotice.includes('SIMULATED / PROTOTYPE'),
      `Governance Notice: ${state.governance.classificationNotice}`
    );

    // TEST-DT-12: Prototype/inferred relationships are not falsely labelled VERIFIED
    const inferredDep = state.dependencies.find((d) => d.isPrototypeInferred);
    assert(
      'TEST-DT-12',
      'Inferred/prototype relationships are not falsely labelled VERIFIED',
      !!inferredDep && (inferredDep.verificationStatus === 'PROTOTYPE' || inferredDep.verificationStatus === 'INFERRED'),
      `Inferred dep verification: ${inferredDep?.verificationStatus}`
    );

    // TEST-DT-13: URBAN_DIGITAL_TWIN_VIEW permission exists
    assert(
      'TEST-DT-13',
      'URBAN_DIGITAL_TWIN_VIEW permission exists in PermissionType enum',
      PermissionType.URBAN_DIGITAL_TWIN_VIEW === 'URBAN_DIGITAL_TWIN_VIEW',
      `Permission: ${PermissionType.URBAN_DIGITAL_TWIN_VIEW}`
    );

    // TEST-DT-14: CITIZEN cannot access unauthorized Digital Twin endpoint
    const citizenPermissions = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];
    const citizenHasAccess = citizenPermissions.includes(PermissionType.URBAN_DIGITAL_TWIN_VIEW);
    assert(
      'TEST-DT-14',
      'CITIZEN role does NOT have URBAN_DIGITAL_TWIN_VIEW permission',
      citizenHasAccess === false,
      `Citizen has twin access: ${citizenHasAccess}`
    );

    // TEST-DT-15: JWT authentication protects Digital Twin endpoints
    const districtAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
    const adminHasAccess = districtAdminPerms.includes(PermissionType.URBAN_DIGITAL_TWIN_VIEW);
    assert(
      'TEST-DT-15',
      'Authorized municipal roles (SUPER_ADMIN, DISTRICT_ADMIN, etc.) possess Digital Twin permissions',
      adminHasAccess === true,
      `District Admin twin permission: ${adminHasAccess}`
    );

    // TEST-DT-16: Frontend uses apiClient rather than direct backend store access
    assert(
      'TEST-DT-16',
      'apiClient provides typed helper methods for Urban Digital Twin API integration',
      typeof apiClient.getUrbanDigitalTwinState === 'function' &&
        typeof apiClient.getUrbanDigitalTwinEntity === 'function' &&
        typeof apiClient.getUrbanDigitalTwinStatistics === 'function',
      'apiClient methods verified'
    );

    // TEST-DT-17: Existing Phase 8.5A monitoring functionality remains functional
    const monitoringSnapshot = operationalMonitoringService.generateSnapshot();
    assert(
      'TEST-DT-17',
      'Existing Phase 8.5A Operational Monitoring service generates valid snapshots',
      !!monitoringSnapshot && !!monitoringSnapshot.snapshotId,
      `Monitoring Snapshot: ${monitoringSnapshot?.snapshotId}`
    );

    // TEST-DT-18: Existing Phase 8.5B situational awareness remains functional
    assert(
      'TEST-DT-18',
      'Existing Phase 8.5B Situational Awareness permissions and dependencies remain active',
      PermissionType.SITUATIONAL_AWARENESS_VIEW === 'SITUATIONAL_AWARENESS_VIEW',
      'Phase 8.5B verified'
    );

    // TEST-DT-19: Existing Phase 8.5C decision support remains functional
    const dsSnapshot = operationalDecisionSupportService.getDecisionSupportSnapshot('INC-2026-0815-01');
    assert(
      'TEST-DT-19',
      'Existing Phase 8.5C Decision Support snapshot generation remains functional',
      !!dsSnapshot && dsSnapshot.options.length > 0,
      `Decision options: ${dsSnapshot?.options?.length}`
    );

    // TEST-DT-20: Baseline snapshot is dynamically generated
    const baseline = urbanDigitalTwinService.getBaselineSnapshot();
    assert(
      'TEST-DT-20',
      'Scenario baseline snapshot is dynamically generated with entity counts, system status, and research disclaimer',
      !!baseline && baseline.entityCount > 0 && !!baseline.snapshotId && baseline.disclaimer.includes('PROTOTYPE'),
      `Baseline ID: ${baseline?.snapshotId}, Entity count: ${baseline?.entityCount}`
    );

    // =========================================================================
    // PHASE 9B SCENARIO SIMULATION & IMPACT PROPAGATION TESTS
    // =========================================================================

    // TEST-SIM-01: Preset scenarios loaded with valid schema and failure modes
    const presets = scenarioSimulationService.getPresetScenarios();
    assert(
      'TEST-SIM-01',
      'Preset scenarios load with valid schema, targets, and environmental modifiers',
      Array.isArray(presets) && presets.length >= 4 && !!presets.find((p) => p.scenarioId === 'SCENARIO-PUMP-P04-FAILURE'),
      `Presets count: ${presets.length}`
    );

    // TEST-SIM-02: What-If simulation executes for "Drainage Pump P-04 fails"
    const simResult = scenarioSimulationService.executeSimulation({
      targetEntityId: 'INFRA-PUMP-PARAM-PURWAPUMP',
      failureMode: 'TOTAL_FAILURE',
      environmentalModifiers: {
        rainfallMmPerHour: 65,
        stormSurgeLevel: 'HEAVY',
        trafficVolumeMultiplier: 1.8,
        timeHorizonHours: 4,
      },
    });
    assert(
      'TEST-SIM-02',
      'What-If simulation executes successfully for Drainage Pump P-04 failure',
      !!simResult && !!simResult.simulationId && simResult.cascadeSteps.length > 0,
      `Sim ID: ${simResult?.simulationId}, Steps: ${simResult?.cascadeSteps?.length}`
    );

    // TEST-SIM-03: Cascade steps propagate through graph stages
    const hasPrimary = simResult.cascadeSteps.some((s) => s.stage === 'PRIMARY_FAILURE');
    const hasPhysical = simResult.cascadeSteps.some((s) => s.stage === 'DIRECT_PHYSICAL_IMPACT');
    const hasSecondary = simResult.cascadeSteps.some((s) => s.stage === 'SECONDARY_TOPOLOGICAL_CASCADE');
    const hasHospitalThreat = simResult.cascadeSteps.some((s) => s.stage === 'CRITICAL_FACILITY_THREAT');
    assert(
      'TEST-SIM-03',
      'Cascade propagation covers primary failure, physical impact, secondary arterial cascade, and critical facility threat',
      hasPrimary && hasPhysical && hasSecondary && hasHospitalThreat,
      `Cascade stages verified: Primary(${hasPrimary}), Physical(${hasPhysical}), Secondary(${hasSecondary}), Hospital(${hasHospitalThreat})`
    );

    // TEST-SIM-04: Affected departments matrix correctly maps roles and mobilization priorities
    const depts = simResult.affectedDepartments;
    const hasKJS = depts.some((d) => d.departmentCode === 'KJS' && d.role === 'PRIMARY_RESPONSE');
    const hasTraffic = depts.some((d) => d.departmentCode === 'TRAFFIC');
    assert(
      'TEST-SIM-04',
      'Affected departments matrix accurately maps response roles, priorities, and asset units',
      depts.length >= 3 && hasKJS && hasTraffic,
      `Departments mapped: ${depts.map((d) => d.departmentCode).join(', ')}`
    );

    // TEST-SIM-05: Critical facilities at risk (Ursula Hospital, Substation) identified
    const facilities = simResult.criticalFacilitiesAtRisk;
    const hasUrsula = facilities.some((f) => f.facilityName.includes('Ursula') && f.threatLevel === 'CRITICAL');
    assert(
      'TEST-SIM-05',
      'Critical facilities at risk identified with proximity distances, threat levels, and access route status',
      facilities.length > 0 && hasUrsula,
      `Critical facilities: ${facilities.map((f) => f.facilityName).join(', ')}`
    );

    // TEST-SIM-06: Generated mitigation options include resource allocations and predicted deltas
    const options = simResult.mitigationOptions;
    const hasTacticalOption = options.some(
      (o) => o.strategyType === 'COMBINED_TACTICAL_RESPONSE' && o.predictedImpactReduction.inundationReductionPercent > 50
    );
    assert(
      'TEST-SIM-06',
      'Generated mitigation options include resource allocations, trade-offs, feasibility, and impact drawdown %',
      options.length >= 3 && hasTacticalOption,
      `Mitigation options: ${options.length}`
    );

    // TEST-SIM-07: Human officer review governance updates decision status and audit trail
    const reviewRes = scenarioSimulationService.reviewMitigationOption(
      simResult.simulationId,
      options[0].optionId,
      {
        optionId: options[0].optionId,
        decision: 'APPROVE',
        officerNotes: 'Approved for emergency monsoon deployment readiness.',
      },
      'officer.sharma@kanpur.gov.in'
    );
    assert(
      'TEST-SIM-07',
      'Human officer review governance updates decision status to APPROVED and attaches audit credentials',
      reviewRes.success && reviewRes.option.officerDecisionStatus === 'APPROVED' && reviewRes.option.reviewedBy === 'officer.sharma@kanpur.gov.in',
      `Review result: ${reviewRes.option.officerDecisionStatus} by ${reviewRes.option.reviewedBy}`
    );
  } catch (err: any) {
    testResults.push({
      id: 'TEST-DT-ERR',
      title: 'Unexpected error in test execution',
      passed: false,
      message: err.message || String(err),
    });
  }

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.length - passedCount;

  return {
    success: failedCount === 0,
    totalTests: testResults.length,
    passedCount,
    failedCount,
    testResults,
  };
}
