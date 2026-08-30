// ==========================================
// AI-SCOS AUTHENTICATION & RBAC TYPE SYSTEM
// ==========================================

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN',
  DEPARTMENT_OFFICER = 'DEPARTMENT_OFFICER',
  FIELD_OFFICER = 'FIELD_OFFICER',
  CITIZEN = 'CITIZEN',
  AI_GOVERNANCE_OFFICER = 'AI_GOVERNANCE_OFFICER',
}

export enum PermissionType {
  // User Management
  USER_VIEW = 'USER_VIEW',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Department Management
  DEPARTMENT_VIEW = 'DEPARTMENT_VIEW',
  DEPARTMENT_MANAGE = 'DEPARTMENT_MANAGE',

  // Complaint / Grievance Management
  COMPLAINT_VIEW = 'COMPLAINT_VIEW',
  COMPLAINT_CREATE = 'COMPLAINT_CREATE',
  COMPLAINT_ASSIGN = 'COMPLAINT_ASSIGN',
  COMPLAINT_UPDATE = 'COMPLAINT_UPDATE',

  // Incident Operations
  INCIDENT_VIEW = 'INCIDENT_VIEW',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_UPDATE = 'INCIDENT_UPDATE',

  // Predictive Intelligence
  PREDICTIVE_VIEW = 'PREDICTIVE_VIEW',
  PREDICTIVE_APPROVE = 'PREDICTIVE_APPROVE',

  // Knowledge Graph
  GRAPH_VIEW = 'GRAPH_VIEW',
  GRAPH_MODIFY = 'GRAPH_MODIFY',
  GRAPH_IMPORT = 'GRAPH_IMPORT',

  // Scenario Execution
  SCENARIO_EXECUTE = 'SCENARIO_EXECUTE',

  // Dashboard & Analytics
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  ANALYTICS_VIEW = 'ANALYTICS_VIEW',

  // AI & Governance
  AI_VIEW = 'AI_VIEW',
  AI_ANALYSIS = 'AI_ANALYSIS',
  AI_RECOMMENDATION_REVIEW = 'AI_RECOMMENDATION_REVIEW',

  // System Administration & Evaluation
  EVALUATION_VIEW = 'EVALUATION_VIEW',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',

  // Urban Data Integration Foundation
  DATA_SOURCE_VIEW = 'DATA_SOURCE_VIEW',
  DATA_SOURCE_CREATE = 'DATA_SOURCE_CREATE',
  DATA_SOURCE_UPDATE = 'DATA_SOURCE_UPDATE',
  DATA_SOURCE_ADMIN = 'DATA_SOURCE_ADMIN',

  // SCOS Data Validation & Quality Engine
  DATA_VALIDATION_VIEW = 'DATA_VALIDATION_VIEW',
  DATA_VALIDATION_EXECUTE = 'DATA_VALIDATION_EXECUTE',
  DATA_QUALITY_VIEW = 'DATA_QUALITY_VIEW',
  DATA_QUALITY_ADMIN = 'DATA_QUALITY_ADMIN',

  // SCOS Geospatial & Civil Infrastructure Intelligence
  INFRASTRUCTURE_VIEW = 'INFRASTRUCTURE_VIEW',
  INFRASTRUCTURE_CREATE = 'INFRASTRUCTURE_CREATE',
  INFRASTRUCTURE_UPDATE = 'INFRASTRUCTURE_UPDATE',
  SPATIAL_ANALYSIS_VIEW = 'SPATIAL_ANALYSIS_VIEW',
  SPATIAL_ANALYSIS_EXECUTE = 'SPATIAL_ANALYSIS_EXECUTE',

  // SCOS Multi-Department Operational Coordination
  COORDINATION_VIEW = 'COORDINATION_VIEW',
  COORDINATION_RECOMMEND = 'COORDINATION_RECOMMEND',
  COORDINATION_APPROVE = 'COORDINATION_APPROVE',
  COORDINATION_EXECUTE = 'COORDINATION_EXECUTE',
  COORDINATION_ADMIN = 'COORDINATION_ADMIN',

  // SCOS Phase 8.5A — Operational Monitoring
  OPERATIONAL_MONITORING_VIEW = 'OPERATIONAL_MONITORING_VIEW',

  // SCOS Phase 8.5B — Situational Awareness Layer
  SITUATIONAL_AWARENESS_VIEW = 'SITUATIONAL_AWARENESS_VIEW',

  // SCOS Phase 8.5C — Operational Decision Support Layer
  OPERATIONAL_DECISION_SUPPORT_VIEW = 'OPERATIONAL_DECISION_SUPPORT_VIEW',
  OPERATIONAL_DECISION_SUPPORT_REVIEW = 'OPERATIONAL_DECISION_SUPPORT_REVIEW',

  // SCOS Phase 9A — Urban Digital Twin Foundation
  URBAN_DIGITAL_TWIN_VIEW = 'URBAN_DIGITAL_TWIN_VIEW',

  // SCOS Phase 9C — Scenario Validation & Model Calibration
  SCENARIO_VALIDATION_VIEW = 'SCENARIO_VALIDATION_VIEW',
  SCENARIO_VALIDATION_EXECUTE = 'SCENARIO_VALIDATION_EXECUTE',

  // SCOS Phase 9D — Comparative Decision-Support Evaluation
  COMPARATIVE_EVALUATION_VIEW = 'COMPARATIVE_EVALUATION_VIEW',
  COMPARATIVE_EVALUATION_EXECUTE = 'COMPARATIVE_EVALUATION_EXECUTE',

  // SCOS Phase 10A — Research Dataset, Scenario Registry & Reproducibility
  RESEARCH_DATASET_VIEW = 'RESEARCH_DATASET_VIEW',
  RESEARCH_DATASET_ADMIN = 'RESEARCH_DATASET_ADMIN',
  RESEARCH_DATASET_EXECUTE = 'RESEARCH_DATASET_EXECUTE',

  // SCOS Phase 10B — Controlled Experimental Execution & Results Generation
  EXPERIMENTAL_EXECUTION_VIEW = 'EXPERIMENTAL_EXECUTION_VIEW',
  EXPERIMENTAL_EXECUTION_EXECUTE = 'EXPERIMENTAL_EXECUTION_EXECUTE',
  EXPERIMENTAL_EXECUTION_ADMIN = 'EXPERIMENTAL_EXECUTION_ADMIN',

  // SCOS Phase 10C — Statistical Analysis & Uncertainty Layer
  STATISTICAL_ANALYSIS_VIEW = 'STATISTICAL_ANALYSIS_VIEW',
  STATISTICAL_ANALYSIS_EXECUTE = 'STATISTICAL_ANALYSIS_EXECUTE',
  STATISTICAL_ANALYSIS_ADMIN = 'STATISTICAL_ANALYSIS_ADMIN',

  // SCOS Phase 10D — Research Results & Evidence Synthesis Layer
  RESEARCH_EVIDENCE_VIEW = 'RESEARCH_EVIDENCE_VIEW',
  RESEARCH_EVIDENCE_ADMIN = 'RESEARCH_EVIDENCE_ADMIN',
  RESEARCH_EVIDENCE_EXPORT = 'RESEARCH_EVIDENCE_EXPORT',

  // SCOS Phase 10E — Research Contribution & Reference Architecture Synthesis
  RESEARCH_FRAMEWORK_VIEW = 'RESEARCH_FRAMEWORK_VIEW',
  RESEARCH_FRAMEWORK_ADMIN = 'RESEARCH_FRAMEWORK_ADMIN',
  RESEARCH_FRAMEWORK_EXPORT = 'RESEARCH_FRAMEWORK_EXPORT',

  // SCOS Phase 10F — Robustness, Sensitivity & Model Stability Analysis
  SENSITIVITY_ANALYSIS_VIEW = 'SENSITIVITY_ANALYSIS_VIEW',
  SENSITIVITY_ANALYSIS_EXECUTE = 'SENSITIVITY_ANALYSIS_EXECUTE',
  SENSITIVITY_ANALYSIS_ADMIN = 'SENSITIVITY_ANALYSIS_ADMIN',

  // SCOS Phase 11A — Integrated Research Validation & Evidence Consolidation
  RESEARCH_VALIDATION_VIEW = 'RESEARCH_VALIDATION_VIEW',
  RESEARCH_VALIDATION_ADMIN = 'RESEARCH_VALIDATION_ADMIN',

  // SCOS Phase 11B — Research Claim & Hypothesis Validation Layer
  RESEARCH_CLAIMS_VIEW = 'RESEARCH_CLAIMS_VIEW',
  RESEARCH_CLAIMS_VALIDATE = 'RESEARCH_CLAIMS_VALIDATE',
  RESEARCH_CLAIMS_ADMIN = 'RESEARCH_CLAIMS_ADMIN',

  // SCOS Phase 11C — Thesis Evidence & Academic Reproducibility Package
  THESIS_EVIDENCE_VIEW = 'THESIS_EVIDENCE_VIEW',
  THESIS_EVIDENCE_EXPORT = 'THESIS_EVIDENCE_EXPORT',
  THESIS_EVIDENCE_ADMIN = 'THESIS_EVIDENCE_ADMIN',

  // SCOS Phase 11D — Research Demonstration & Defense Presentation Flow
  RESEARCH_DEMONSTRATION_VIEW = 'RESEARCH_DEMONSTRATION_VIEW',
  RESEARCH_DEMONSTRATION_ADMIN = 'RESEARCH_DEMONSTRATION_ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  INACTIVE = 'INACTIVE',
}

export interface District {
  id: string;
  code: string;
  name: string;
  state: string;
  country: string;
  adminCode?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  districtId: string;
  category: 'MUNICIPAL' | 'WATER' | 'TRAFFIC' | 'HEALTH' | 'ELECTRICITY' | 'ENVIRONMENT' | 'POLICE' | 'REVENUE' | 'GENERAL';
  isDistrictWide: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  description: string;
  leadUserId?: string;
  leadName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  code: string;
  title: string;
  level: number;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Role {
  id: string;
  name: RoleType;
  description: string;
  permissions: PermissionType[];
  isSystemRole: boolean;
}

export interface User {
  id: string;
  email: string;
  mobile: string;
  fullName: string;
  passwordHash: string;
  role: RoleType;
  districtId?: string;
  departmentId?: string; // Primary department
  secondaryDepartmentIds?: string[]; // Multi-department authorized scope
  teamId?: string;
  designationId?: string;
  designationTitle?: string;
  reportingManagerId?: string;
  status: AccountStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    mobile: string;
    fullName: string;
    role: RoleType;
    districtId?: string;
    districtName?: string;
    departmentId?: string;
    departmentCode?: string;
    departmentName?: string;
    secondaryDepartmentIds?: string[];
    teamId?: string;
    teamName?: string;
    designationTitle?: string;
    reportingManagerName?: string;
    status: AccountStatus;
    permissions: PermissionType[];
  };
  token: string;
  expiresAt: string;
}

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: RoleType;
  departmentId?: string;
  districtId?: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

export interface AuthErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
