// =========================================================================
// SCOS PHASE 8.5A — OPERATIONAL MONITORING AGGREGATION SUITE
// =========================================================================

import { operationalMonitoringService } from '../services/operationalMonitoringService';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';

export function runOperationalMonitoringTestSuite(): {
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
    // TEST 1: Generate Operational Monitoring Snapshot
    const snapshot = operationalMonitoringService.generateSnapshot();
    assert(
      'TEST-MONITOR-01',
      'Operational Monitoring Snapshot generation produces valid snapshot ID & district code',
      !!snapshot.snapshotId && snapshot.districtCode === 'KANPUR_NAGAR',
      `Snapshot ID: ${snapshot.snapshotId}, District: ${snapshot.districtCode}`
    );

    // TEST 2: Verify Incident Metrics Aggregation
    assert(
      'TEST-MONITOR-02',
      'Incident summary metrics contain total, open, in-progress, and critical counts',
      snapshot.incidents.totalIncidents > 0 &&
        typeof snapshot.incidents.criticalSeverityCount === 'number' &&
        typeof snapshot.incidents.openCount === 'number',
      `Total incidents: ${snapshot.incidents.totalIncidents}`
    );

    // TEST 3: Verify Predictive Risk Aggregation
    assert(
      'TEST-MONITOR-03',
      'Predictive risk metrics contain valid risk score average and high/critical zone counts',
      snapshot.predictiveRisk.totalRiskZones > 0 &&
        snapshot.predictiveRisk.averageRiskScore >= 0 &&
        typeof snapshot.predictiveRisk.highRiskCount === 'number',
      `Avg risk score: ${snapshot.predictiveRisk.averageRiskScore}`
    );

    // TEST 4: Verify Infrastructure Monitoring Summary
    assert(
      'TEST-MONITOR-04',
      'Civil infrastructure metrics contain operational, degraded, and disrupted asset counts',
      snapshot.infrastructure.totalAssets > 0 &&
        snapshot.infrastructure.operationalCount >= 0 &&
        typeof snapshot.infrastructure.criticalityBreakdown.CRITICAL === 'number',
      `Total assets: ${snapshot.infrastructure.totalAssets}`
    );

    // TEST 5: Verify Department Coordination & Capabilities Summary
    assert(
      'TEST-MONITOR-05',
      'Department coordination metrics aggregate profiles and mapped capabilities',
      snapshot.departmentCoordination.totalDepartments > 0 &&
        snapshot.departmentCoordination.totalCapabilitiesMapped > 0,
      `Mapped capabilities: ${snapshot.departmentCoordination.totalCapabilitiesMapped}`
    );

    // TEST 6: Verify Task & SLA Monitoring Aggregation
    assert(
      'TEST-MONITOR-06',
      'Task and SLA summary metrics calculate compliance rate percentage',
      snapshot.sla.totalMonitoredSLAs >= 0 &&
        snapshot.sla.overallComplianceRatePercent >= 0 &&
        snapshot.sla.overallComplianceRatePercent <= 100,
      `SLA compliance rate: ${snapshot.sla.overallComplianceRatePercent}%`
    );

    // TEST 7: Verify Data Freshness & Source Health Aggregation
    assert(
      'TEST-MONITOR-07',
      'Data freshness and data source health metrics calculate average reliability',
      snapshot.dataSourceHealth.totalDataSources > 0 &&
        snapshot.dataSourceHealth.averageReliabilityPercent > 0,
      `Avg source reliability: ${snapshot.dataSourceHealth.averageReliabilityPercent}%`
    );

    // TEST 8: Verify Classification Notice & Prototype Flag
    assert(
      'TEST-MONITOR-08',
      'Snapshot contains required SIMULATED / PROTOTYPE DATA classification notice',
      snapshot.isSimulatedPrototype === true &&
        snapshot.classificationNotice.includes('SIMULATED / PROTOTYPE DATA'),
      `Notice: ${snapshot.classificationNotice}`
    );

    // TEST 9: RBAC Permission Mapping Security Verification
    const superAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.SUPER_ADMIN] || [];
    const districtAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
    const deptAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DEPARTMENT_ADMIN] || [];
    const citizenPerms = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];

    const hasSuperAdmin = superAdminPerms.includes(PermissionType.OPERATIONAL_MONITORING_VIEW);
    const hasDistrictAdmin = districtAdminPerms.includes(PermissionType.OPERATIONAL_MONITORING_VIEW);
    const hasDeptAdmin = deptAdminPerms.includes(PermissionType.OPERATIONAL_MONITORING_VIEW);
    const hasCitizen = citizenPerms.includes(PermissionType.OPERATIONAL_MONITORING_VIEW);

    assert(
      'TEST-MONITOR-09',
      'RBAC Security — OPERATIONAL_MONITORING_VIEW assigned to administrative roles but denied to Citizens',
      hasSuperAdmin && hasDistrictAdmin && hasDeptAdmin && !hasCitizen,
      `SuperAdmin: ${hasSuperAdmin}, DistrictAdmin: ${hasDistrictAdmin}, DeptAdmin: ${hasDeptAdmin}, Citizen: ${hasCitizen}`
    );
  } catch (err: any) {
    testResults.push({
      id: 'TEST-MONITOR-FATAL',
      title: 'Operational Monitoring Test Suite Execution',
      passed: false,
      message: `Fatal error during test suite execution: ${err.message}`,
    });
  }

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.filter((r) => !r.passed).length;

  return {
    success: failedCount === 0,
    totalTests: testResults.length,
    passedCount,
    failedCount,
    testResults,
  };
}
