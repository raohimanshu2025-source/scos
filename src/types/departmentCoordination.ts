import { DataProvenance } from './dataSource';
import { IncidentPriority, DepartmentTask } from './incident';

export type DepartmentType =
  | 'MUNICIPAL'
  | 'WATER'
  | 'TRAFFIC'
  | 'HEALTH'
  | 'PUBLIC_WORKS'
  | 'DISTRICT_ADMINISTRATION'
  | 'EMERGENCY_RESPONSE';

export type DepartmentCapability =
  // Kanpur Nagar Nigam
  | 'ROAD_CLEANUP'
  | 'MUNICIPAL_RESPONSE'
  | 'PUBLIC_AREA_MANAGEMENT'
  // Kanpur Jal Sansthan
  | 'DRAINAGE_RESPONSE'
  | 'DEWATERING'
  | 'WATER_INFRASTRUCTURE'
  // Traffic Police
  | 'TRAFFIC_DIVERSION'
  | 'ROAD_CONTROL'
  | 'TRAFFIC_MONITORING'
  // Health Services
  | 'HOSPITAL_ACCESS'
  | 'EMERGENCY_COORDINATION'
  | 'HEALTH_FACILITY_PROTECTION'
  // Public Works
  | 'ROAD_INFRASTRUCTURE'
  | 'DRAINAGE_INFRASTRUCTURE'
  | 'INFRASTRUCTURE_REPAIR'
  // District Administration
  | 'CROSS_DEPARTMENT_COORDINATION'
  | 'ESCALATION'
  | 'SITUATION_MONITORING';

export interface DepartmentSLA {
  taskType: string;
  priority: IncidentPriority;
  targetResponseMinutes: number;
  targetCompletionMinutes: number;
  escalationLevel: number;
  isPrototypeParameter: true;
}

export interface DepartmentProfile {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  departmentType: DepartmentType;
  description: string;
  operationalScope: string;
  contactRole: string;
  status: 'ACTIVE' | 'INACTIVE';
  capabilities: DepartmentCapability[];
  infrastructureResponsibilities: string[]; // e.g. ['DRAIN', 'ROAD', 'HOSPITAL', 'WATER_PIPELINE', 'POWER_SUBSTATION']
  supportedIncidentTypes: string[]; // e.g. ['WATERLOGGING', 'TRAFFIC_CONGESTION']
  slaProfile: DepartmentSLA;
  dataSources: string[];
  provenance: DataProvenance;
  isPrototypeProfile: true;
}

export interface ResponsibilityMapping {
  infrastructureType: string;
  operationalResponsibility: string;
  primaryDepartmentId: string;
  secondaryDepartmentIds: string[];
  description: string;
  isPrototypeMapping: true;
}

export type DepartmentCoordinationRole =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SUPPORT'
  | 'INFORMATIONAL';

export type CoordinationVerificationStatus =
  | 'POTENTIAL'
  | 'POSSIBLE'
  | 'REQUIRES_VERIFICATION';

export type RecommendationDecisionStatus =
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'MODIFIED'
  | 'REJECTED';

export type CoordinationStatus =
  | 'NOT_STARTED'
  | 'ASSESSING'
  | 'AWAITING_DECISION'
  | 'COORDINATION_ACTIVE'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'ESCALATED';

export type SlaEscalationState =
  | 'NORMAL'
  | 'APPROACHING_SLA'
  | 'SLA_BREACHED'
  | 'ESCALATED';

export interface RecommendedTask {
  recommendationId: string;
  incidentId: string;
  departmentId: string;
  departmentName: string;
  coordinationRole: DepartmentCoordinationRole;
  responsibleCapability: DepartmentCapability;
  taskTitle: string;
  taskDescription: string;
  priority: IncidentPriority;
  sourceInfrastructure: string;
  infrastructureType: string;
  reason: string; // Explains WHY THIS DEPARTMENT, WHY THIS TASK, WHICH INFRASTRUCTURE/IMPACT
  verificationStatus: CoordinationVerificationStatus;
  decisionStatus: RecommendationDecisionStatus;
  originalRecommendation?: {
    taskTitle: string;
    taskDescription: string;
    priority: IncidentPriority;
    departmentId: string;
  };
  reviewedBy?: string;
  reviewedByEmail?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdTaskId?: string;
  dependsOnRecommendationIds?: string[];
  dependsOnTaskIds?: string[];
  requiresApproval: true;
  isPrototypeRecommendation: true;
}

export interface DepartmentImpactAnalysis {
  incidentId: string;
  analyzedAt: string;
  coordinationStatus: CoordinationStatus;
  primaryDepartment: {
    departmentId: string;
    departmentName: string;
    reason: string;
  };
  secondaryDepartments: Array<{
    departmentId: string;
    departmentName: string;
    role: DepartmentCoordinationRole;
    reason: string;
  }>;
  affectedInfrastructure: Array<{
    assetId: string;
    assetName: string;
    type: string;
    condition: string;
  }>;
  recommendedTasks: RecommendedTask[];
  activeTasks: DepartmentTask[];
  slaEscalationState: SlaEscalationState;
  predictiveSupportingContext?: string;
  isPrototypeAnalysis: true;
}

export interface CoordinationMatrixRow {
  departmentId: string;
  departmentName: string;
  role: DepartmentCoordinationRole;
  affectedAsset: string;
  operationalResponsibility: string;
  recommendedAction: string;
  status: string;
  slaTargetMinutes: number;
  recommendationId?: string;
  createdTaskId?: string;
  dependsOn?: string[];
}
