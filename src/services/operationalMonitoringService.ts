/**
 * SCOS Phase 8.5A — Operational Monitoring Aggregation Service
 * Reuses existing in-memory stores (incidentStore, predictionStore, infrastructureStore,
 * departmentProfileStore, dataSourceStore) to generate an executive OperationalMonitoringSnapshot.
 */

import {
  OperationalMonitoringSnapshot,
  OverallSystemStatus,
  IncidentMonitoringSummary,
  PredictiveRiskMonitoringSummary,
  InfrastructureMonitoringSummary,
  DepartmentMonitoringSummary,
  TaskMonitoringSummary,
  SLAMonitoringSummary,
  EscalationMonitoringSummary,
  DataFreshnessMonitoringSummary,
  DataSourceHealthMonitoringSummary,
} from '../types/operationalMonitoring';

import { incidentStore } from './incidentStore';
import { predictionStore } from './predictionStore';
import { infrastructureStore } from './infrastructureStore';
import { departmentProfileStore } from './departmentProfileStore';
import { dataSourceStore, computeFreshness } from './dataSourceStore';

class OperationalMonitoringService {
  /**
   * Generates a real-time aggregated snapshot of all city operations.
   */
  public generateSnapshot(): OperationalMonitoringSnapshot {
    const nowIso = new Date().toISOString();

    // 1. Gather Incidents & Tasks
    const incidents = incidentStore.getAllIncidents();
    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let criticalSeverityCount = 0;
    let highSeverityCount = 0;
    let incidentEscalatedCount = 0;

    let totalTasksCount = 0;
    let taskAssignedCount = 0;
    let taskInProgressCount = 0;
    let taskCompletedCount = 0;
    let taskOverdueCount = 0;

    let slaTotalMonitored = 0;
    let slaCompliantCount = 0;
    let slaBreachedCount = 0;

    let escLevel1Count = 0;
    let escLevel2Count = 0;
    let escLevel3Count = 0;

    const nowMs = Date.now();

    for (const inc of incidents) {
      if (inc.current_status === 'RESOLVED') resolvedCount++;
      else if (inc.current_status === 'IN_PROGRESS') inProgressCount++;
      else openCount++;

      if (inc.severity === 'CRITICAL') criticalSeverityCount++;
      else if (inc.severity === 'HIGH') highSeverityCount++;

      if ((inc.escalation_level && inc.escalation_level > 0) || inc.current_status === 'ESCALATED') {
        incidentEscalatedCount++;
      }

      if (inc.escalation_level === 1) escLevel1Count++;
      else if (inc.escalation_level === 2) escLevel2Count++;
      else if (inc.escalation_level && inc.escalation_level >= 3) escLevel3Count++;

      for (const task of inc.assigned_tasks) {
        totalTasksCount++;
        if (task.status === 'COMPLETED') {
          taskCompletedCount++;
        } else if (task.status === 'IN_PROGRESS') {
          taskInProgressCount++;
        } else {
          taskAssignedCount++;
        }

        slaTotalMonitored++;
        const dueMs = new Date(task.due_time).getTime();
        const isOverdue = task.status !== 'COMPLETED' && dueMs < nowMs;

        if (isOverdue || task.escalation_status !== 'NORMAL') {
          taskOverdueCount++;
          slaBreachedCount++;
        } else {
          slaCompliantCount++;
        }
      }
    }

    const incidentSummary: IncidentMonitoringSummary = {
      totalIncidents: incidents.length,
      openCount,
      inProgressCount,
      resolvedCount,
      criticalSeverityCount,
      highSeverityCount,
      escalatedCount: incidentEscalatedCount,
      avgResolutionTimeMinutes: 45, // Target SLA baseline
    };

    // 2. Predictive Risk Summary
    const riskZones = predictionStore.getAllRiskZones();
    let highRiskCount = 0;
    let criticalRiskCount = 0;
    let activeEarlyWarnings = 0;
    let pendingApprovals = 0;
    let totalScore = 0;

    for (const zone of riskZones) {
      totalScore += zone.risk_score;
      if (zone.risk_level === 'CRITICAL') criticalRiskCount++;
      else if (zone.risk_level === 'HIGH') highRiskCount++;

      if (zone.early_warning_status && zone.early_warning_status !== 'NONE') {
        activeEarlyWarnings++;
      }
      if (zone.early_warning_status === 'AWAITING_REVIEW') {
        pendingApprovals++;
      }
    }

    const avgRiskScore = riskZones.length > 0 ? Math.round(totalScore / riskZones.length) : 0;

    const predictiveRiskSummary: PredictiveRiskMonitoringSummary = {
      totalRiskZones: riskZones.length,
      highRiskCount,
      criticalRiskCount,
      averageRiskScore: avgRiskScore,
      activeEarlyWarnings,
      pendingApprovals,
    };

    // 3. Infrastructure Summary
    const assets = infrastructureStore.getAllAssets();
    let infraOperational = 0;
    let infraDegraded = 0;
    let infraDisrupted = 0;
    let infraOffline = 0;

    const criticalityBreakdown = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const asset of assets) {
      if (asset.status === 'OPERATIONAL') infraOperational++;
      else if (asset.status === 'DEGRADED') infraDegraded++;
      else if (asset.status === 'DISRUPTED') infraDisrupted++;
      else if (asset.status === 'OFFLINE') infraOffline++;

      if (asset.criticality in criticalityBreakdown) {
        criticalityBreakdown[asset.criticality as keyof typeof criticalityBreakdown]++;
      }
    }

    const infrastructureSummary: InfrastructureMonitoringSummary = {
      totalAssets: assets.length,
      operationalCount: infraOperational,
      degradedCount: infraDegraded,
      disruptedCount: infraDisrupted,
      offlineCount: infraOffline,
      criticalityBreakdown,
    };

    // 4. Department Coordination Summary
    const deptProfiles = departmentProfileStore.getAllProfiles();
    let totalCapabilities = 0;
    let activeDepts = 0;

    for (const dept of deptProfiles) {
      if (dept.status === 'ACTIVE') activeDepts++;
      totalCapabilities += dept.capabilities.length;
    }

    const departmentSummary: DepartmentMonitoringSummary = {
      totalDepartments: deptProfiles.length,
      activeDepartments: activeDepts,
      totalCapabilitiesMapped: totalCapabilities,
      activeInterAgencyCoordinations: incidents.filter((i) => i.secondary_departments.length > 0).length,
    };

    // 5. Task Summary
    const taskSummary: TaskMonitoringSummary = {
      totalTasks: totalTasksCount,
      assignedCount: taskAssignedCount,
      inProgressCount: taskInProgressCount,
      completedCount: taskCompletedCount,
      overdueCount: taskOverdueCount,
    };

    // 6. SLA Summary
    const slaComplianceRate = slaTotalMonitored > 0
      ? Math.round((slaCompliantCount / slaTotalMonitored) * 100)
      : 100;

    const slaSummary: SLAMonitoringSummary = {
      totalMonitoredSLAs: slaTotalMonitored,
      compliantCount: slaCompliantCount,
      breachedCount: slaBreachedCount,
      overallComplianceRatePercent: slaComplianceRate,
      avgResponseTimeMinutes: 22,
    };

    // 7. Escalation Summary
    const totalEscalations = escLevel1Count + escLevel2Count + escLevel3Count;
    const escalationSummary: EscalationMonitoringSummary = {
      totalEscalations,
      level1Count: escLevel1Count,
      level2Count: escLevel2Count,
      level3Count: escLevel3Count,
      activeCriticalEscalations: escLevel3Count + criticalSeverityCount,
    };

    // 8 & 9. Data Sources & Freshness Summary
    const dataSources = dataSourceStore.getAllSources();
    let freshSources = 0;
    let agingSources = 0;
    let staleSources = 0;
    let activeSources = 0;
    let degradedSources = 0;
    let inactiveSources = 0;
    let totalReliability = 0;

    for (const src of dataSources) {
      const freshness = computeFreshness(src.lastUpdated, src.updateFrequency);
      if (freshness === 'FRESH') freshSources++;
      else if (freshness === 'AGING') agingSources++;
      else staleSources++;

      if (src.status === 'ACTIVE') activeSources++;
      else if (src.status === 'MAINTENANCE') degradedSources++;
      else inactiveSources++;

      totalReliability += src.reliability || 90;
    }

    const avgReliability = dataSources.length > 0 ? Math.round(totalReliability / dataSources.length) : 0;

    let overallFreshnessState: 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN' = 'FRESH';
    if (staleSources > dataSources.length / 3) overallFreshnessState = 'STALE';
    else if (agingSources > 0 || staleSources > 0) overallFreshnessState = 'AGING';

    const dataFreshnessSummary: DataFreshnessMonitoringSummary = {
      freshSourcesCount: freshSources,
      agingSourcesCount: agingSources,
      staleSourcesCount: staleSources,
      overallFreshnessState,
    };

    const dataSourceHealthSummary: DataSourceHealthMonitoringSummary = {
      totalDataSources: dataSources.length,
      activeSourcesCount: activeSources,
      degradedSourcesCount: degradedSources,
      inactiveSourcesCount: inactiveSources,
      averageReliabilityPercent: avgReliability,
    };

    // 10. Overall System Status Calculation
    let overallSystemStatus: OverallSystemStatus = 'NORMAL';
    if (criticalSeverityCount > 0 || criticalRiskCount > 0 || infraDisrupted > 0) {
      overallSystemStatus = 'WARNING';
    }
    if (criticalSeverityCount >= 2 || (infraDisrupted >= 2 && criticalRiskCount >= 1)) {
      overallSystemStatus = 'CRITICAL';
    }

    return {
      snapshotId: `SNAPSHOT-${Date.now()}`,
      generatedAt: nowIso,
      districtCode: 'KANPUR_NAGAR',
      districtName: 'Kanpur Nagar District',
      overallSystemStatus,
      incidents: incidentSummary,
      predictiveRisk: predictiveRiskSummary,
      infrastructure: infrastructureSummary,
      departmentCoordination: departmentSummary,
      tasks: taskSummary,
      sla: slaSummary,
      escalations: escalationSummary,
      dataFreshness: dataFreshnessSummary,
      dataSourceHealth: dataSourceHealthSummary,
      classificationNotice:
        'SIMULATED / PROTOTYPE DATA — SCOS Executive Operational Monitoring Aggregation Engine.',
      isSimulatedPrototype: true,
    };
  }
}

export const operationalMonitoringService = new OperationalMonitoringService();
