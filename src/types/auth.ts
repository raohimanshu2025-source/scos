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

  // Dashboard & Analytics
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  ANALYTICS_VIEW = 'ANALYTICS_VIEW',

  // AI & Governance
  AI_VIEW = 'AI_VIEW',
  AI_RECOMMENDATION_REVIEW = 'AI_RECOMMENDATION_REVIEW',

  // System Administration
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
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
