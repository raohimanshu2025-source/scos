/**
 * SCOS Phase 8.5A — Operational Monitoring Aggregation Type System
 * Provides interfaces and data models for executive district operational monitoring,
 * aggregating metrics across Incidents, Predictive Risks, Civil Infrastructure,
 * Inter-Department Coordination, Tasks, SLAs, Escalations, and Data Sources.
 */

export type OverallSystemStatus = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface IncidentMonitoringSummary {
  totalIncidents: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  criticalSeverityCount: number;
  highSeverityCount: number;
  escalatedCount: number;
  avgResolutionTimeMinutes: number;
}

export interface PredictiveRiskMonitoringSummary {
  totalRiskZones: number;
  highRiskCount: number;
  criticalRiskCount: number;
  averageRiskScore: number;
  activeEarlyWarnings: number;
  pendingApprovals: number;
}

export interface InfrastructureMonitoringSummary {
  totalAssets: number;
  operationalCount: number;
  degradedCount: number;
  disruptedCount: number;
  offlineCount: number;
  criticalityBreakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export interface DepartmentMonitoringSummary {
  totalDepartments: number;
  activeDepartments: number;
  totalCapabilitiesMapped: number;
  activeInterAgencyCoordinations: number;
}

export interface TaskMonitoringSummary {
  totalTasks: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface SLAMonitoringSummary {
  totalMonitoredSLAs: number;
  compliantCount: number;
  breachedCount: number;
  overallComplianceRatePercent: number;
  avgResponseTimeMinutes: number;
}

export interface EscalationMonitoringSummary {
  totalEscalations: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  activeCriticalEscalations: number;
}

export interface DataFreshnessMonitoringSummary {
  freshSourcesCount: number;
  agingSourcesCount: number;
  staleSourcesCount: number;
  overallFreshnessState: 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';
}

export interface DataSourceHealthMonitoringSummary {
  totalDataSources: number;
  activeSourcesCount: number;
  degradedSourcesCount: number;
  inactiveSourcesCount: number;
  averageReliabilityPercent: number;
}

export interface OperationalMonitoringSnapshot {
  snapshotId: string;
  generatedAt: string;
  districtCode: string;
  districtName: string;
  overallSystemStatus: OverallSystemStatus;
  incidents: IncidentMonitoringSummary;
  predictiveRisk: PredictiveRiskMonitoringSummary;
  infrastructure: InfrastructureMonitoringSummary;
  departmentCoordination: DepartmentMonitoringSummary;
  tasks: TaskMonitoringSummary;
  sla: SLAMonitoringSummary;
  escalations: EscalationMonitoringSummary;
  dataFreshness: DataFreshnessMonitoringSummary;
  dataSourceHealth: DataSourceHealthMonitoringSummary;
  classificationNotice: string;
  isSimulatedPrototype: boolean;
}
