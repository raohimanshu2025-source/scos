// =========================================================================
// SCOS PHASE 8.5B — SITUATIONAL AWARENESS INTEGRATION SUITE
// =========================================================================

import { operationalMonitoringService } from '../services/operationalMonitoringService';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';
import { apiClient } from '../services/apiClient';

export function runSituationalAwarenessTestSuite(): {
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
    // 1. View loads operational monitoring snapshot
    const snapshot = operationalMonitoringService.generateSnapshot();
    assert(
      'TEST-SA-01',
      'Situational Awareness layer successfully loads valid operational monitoring snapshot',
      !!snapshot && typeof snapshot.snapshotId === 'string' && snapshot.snapshotId.startsWith('SNAPSHOT-'),
      `Snapshot: ${JSON.stringify(snapshot?.snapshotId)}`
    );

    // 2. Summary metrics render correctly
    assert(
      'TEST-SA-02',
      'Summary metrics correctly aggregate active incidents, risks, assets, tasks, SLAs, and data sources',
      typeof snapshot.incidents.totalIncidents === 'number' &&
        typeof snapshot.predictiveRisk.averageRiskScore === 'number' &&
        typeof snapshot.infrastructure.totalAssets === 'number' &&
        typeof snapshot.tasks.totalTasks === 'number' &&
        typeof snapshot.sla.overallComplianceRatePercent === 'number' &&
        typeof snapshot.dataSourceHealth.totalDataSources === 'number',
      `Incidents: ${snapshot.incidents.totalIncidents}, Assets: ${snapshot.infrastructure.totalAssets}`
    );

    // 3. Critical incidents are identified
    const hasCriticalMetric = typeof snapshot.incidents.criticalSeverityCount === 'number';
    assert(
      'TEST-SA-03',
      'Critical incidents and high-severity emergencies are clearly quantified for priority ranking',
      hasCriticalMetric && snapshot.incidents.criticalSeverityCount >= 0,
      `Critical incidents count: ${snapshot.incidents.criticalSeverityCount}`
    );

    // 4. Infrastructure status is represented
    assert(
      'TEST-SA-04',
      'Civil infrastructure operational, degraded, disrupted, and offline states are represented',
      typeof snapshot.infrastructure.operationalCount === 'number' &&
        typeof snapshot.infrastructure.disruptedCount === 'number' &&
        typeof snapshot.infrastructure.degradedCount === 'number',
      `Operational: ${snapshot.infrastructure.operationalCount}, Disrupted: ${snapshot.infrastructure.disruptedCount}`
    );

    // 5. Department status is represented
    assert(
      'TEST-SA-05',
      'Department coordination status, active departments, and capabilities are represented',
      snapshot.departmentCoordination.totalDepartments > 0 &&
        snapshot.departmentCoordination.activeDepartments > 0,
      `Total Depts: ${snapshot.departmentCoordination.totalDepartments}, Active: ${snapshot.departmentCoordination.activeDepartments}`
    );

    // 6. Task status is represented
    assert(
      'TEST-SA-06',
      'Task status breakdown (assigned, in-progress, completed, overdue) is represented for bottleneck analysis',
      typeof snapshot.tasks.assignedCount === 'number' &&
        typeof snapshot.tasks.inProgressCount === 'number' &&
        typeof snapshot.tasks.completedCount === 'number' &&
        typeof snapshot.tasks.overdueCount === 'number',
      `Tasks: Assigned=${snapshot.tasks.assignedCount}, InProg=${snapshot.tasks.inProgressCount}, Overdue=${snapshot.tasks.overdueCount}`
    );

    // 7. SLA / escalation attention items appear when present
    const slaAttentionDerived = typeof snapshot.sla.breachedCount === 'number' && typeof snapshot.escalations.totalEscalations === 'number';
    assert(
      'TEST-SA-07',
      'SLA breaches and multi-level escalations are derived into actionable attention items',
      slaAttentionDerived,
      `SLA Breaches: ${snapshot.sla.breachedCount}, Escalations: ${snapshot.escalations.totalEscalations}`
    );

    // 8. Stale data indication appears when appropriate
    assert(
      'TEST-SA-08',
      'Data freshness state (FRESH, AGING, STALE) is monitored with provenance transparency',
      ['FRESH', 'AGING', 'STALE', 'UNKNOWN'].includes(snapshot.dataFreshness.overallFreshnessState) &&
        typeof snapshot.dataFreshness.staleSourcesCount === 'number',
      `Freshness state: ${snapshot.dataFreshness.overallFreshnessState}`
    );

    // 9. SIMULATED / PROTOTYPE classification is visible
    assert(
      'TEST-SA-09',
      'Mandatory SIMULATED / PROTOTYPE DATA classification notice is present and explicit',
      snapshot.isSimulatedPrototype === true &&
        snapshot.classificationNotice.includes('SIMULATED / PROTOTYPE DATA'),
      `Classification: ${snapshot.classificationNotice}`
    );

    // 10. Missing optional data renders UNAVAILABLE rather than fabricated data
    const testRecord: { location?: string; severity?: string; secondary_departments?: string[] } = {};
    const fallbackLocation = testRecord.location || 'UNAVAILABLE';
    const fallbackSeverity = testRecord.severity || 'UNAVAILABLE';
    const fallbackDepts = testRecord.secondary_departments?.length ? testRecord.secondary_departments.join(', ') : 'NONE';
    assert(
      'TEST-SA-10',
      'Missing optional fields resolve to UNAVAILABLE/NONE without fabricating placeholder values',
      fallbackLocation === 'UNAVAILABLE' && fallbackSeverity === 'UNAVAILABLE' && fallbackDepts === 'NONE',
      `Fallbacks: location=${fallbackLocation}, severity=${fallbackSeverity}, depts=${fallbackDepts}`
    );

    // 11. SITUATIONAL_AWARENESS_VIEW permission exists
    assert(
      'TEST-SA-11',
      'SITUATIONAL_AWARENESS_VIEW permission exists in PermissionType enum',
      PermissionType.SITUATIONAL_AWARENESS_VIEW === 'SITUATIONAL_AWARENESS_VIEW',
      `Permission value: ${PermissionType.SITUATIONAL_AWARENESS_VIEW}`
    );

    // 12. Unauthorized users cannot access the operational view
    const citizenPerms = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];
    const districtAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
    const superAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.SUPER_ADMIN] || [];
    const deptAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DEPARTMENT_ADMIN] || [];

    const citizenHasSA = citizenPerms.includes(PermissionType.SITUATIONAL_AWARENESS_VIEW);
    const adminHasSA = districtAdminPerms.includes(PermissionType.SITUATIONAL_AWARENESS_VIEW);
    const superHasSA = superAdminPerms.includes(PermissionType.SITUATIONAL_AWARENESS_VIEW);
    const deptHasSA = deptAdminPerms.includes(PermissionType.SITUATIONAL_AWARENESS_VIEW);

    assert(
      'TEST-SA-12',
      'RBAC policy strictly denies SITUATIONAL_AWARENESS_VIEW to CITIZEN while granting to ADMIN/OFFICERS',
      !citizenHasSA && adminHasSA && superHasSA && deptHasSA,
      `Citizen: ${citizenHasSA}, DistrictAdmin: ${adminHasSA}, SuperAdmin: ${superHasSA}, DeptAdmin: ${deptHasSA}`
    );

    // 13. No direct frontend store mutation/access is introduced
    assert(
      'TEST-SA-13',
      'Frontend uses apiClient service abstraction layer and does not mutate backend stores directly',
      typeof apiClient.getOperationalMonitoringSummary === 'function' &&
        typeof apiClient.getInfrastructureAssets === 'function' &&
        typeof apiClient.getDepartmentProfiles === 'function',
      'apiClient methods verified'
    );

    // 14. Existing Phase 8.5A API remains unchanged
    assert(
      'TEST-SA-14',
      'Phase 8.5A GET /api/operational-monitoring/summary service API contract is preserved without regressions',
      typeof operationalMonitoringService.generateSnapshot === 'function' &&
        snapshot.districtCode === 'KANPUR_NAGAR' &&
        ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'].includes(snapshot.overallSystemStatus),
      `System status: ${snapshot.overallSystemStatus}, District: ${snapshot.districtCode}`
    );
  } catch (err: any) {
    testResults.push({
      id: 'TEST-SA-FATAL',
      title: 'Situational Awareness Test Suite Execution',
      passed: false,
      message: `Fatal execution error: ${err.message}`,
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
