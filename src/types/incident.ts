/**
 * SCOS Phase 5B.4 — Incident & Cross-Department Coordination Data Models
 */

export type IncidentCategory =
  | 'WATERLOGGING'
  | 'FLOODING'
  | 'WATER_SUPPLY_DISRUPTION'
  | 'MAJOR_ROAD_DAMAGE'
  | 'TRAFFIC_ACCIDENT'
  | 'TRAFFIC_CONGESTION'
  | 'DRAINAGE_FAILURE'
  | 'SANITATION_ISSUE'
  | 'PUBLIC_HEALTH_INCIDENT'
  | 'INFRASTRUCTURE_FAILURE'
  | 'FIRE_EMERGENCY'
  | 'OTHER_URBAN_INCIDENT';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentPriority = 'P1' | 'P2' | 'P3' | 'P4';

export type IncidentStatus =
  | 'REPORTED'
  | 'TRIAGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export type IncidentSource =
  | 'CITIZEN_CPGRAMS'
  | 'IOT_TELEMETRY'
  | 'FIELD_SQUAD'
  | 'COMMAND_CENTER'
  | 'AI_SENSOR_GRID';

export type AIAssessmentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED' | 'REJECTED';

export type TaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'ESCALATED'
  | 'CANCELLED';

export type EscalationStatus =
  | 'NORMAL'
  | 'SLA_WARNING'
  | 'ESCALATED_DEPT_HEAD'
  | 'ESCALATED_DM';

export interface AIAssessment {
  severity: IncidentSeverity;
  priority: IncidentPriority;
  affected_departments: string[]; // Dept IDs or Codes e.g. ["MUNICIPAL", "TRAFFIC", "WATER", "HEALTH"]
  primary_department: string;
  secondary_departments: string[];
  impact_summary: string;
  recommended_actions: string[];
  confidence: number; // 0.0 - 1.0
  explanation: string;
  status: AIAssessmentStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface TaskNote {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export interface DepartmentTask {
  task_id: string;
  incident_id: string;
  department_id: string;
  department_name: string;
  task_type?: 'RESPONSE' | 'PREVENTIVE';
  assigned_role?: string;
  assigned_team_id?: string;
  assigned_team_name?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  task_description: string;
  priority: IncidentPriority;
  status: TaskStatus;
  due_time: string; // ISO date string
  demo_sla_minutes: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  escalation_status: EscalationStatus;
  notes: TaskNote[];
  evidence_attachments: string[];
}

export interface IncidentTimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  event_type:
    | 'CREATED'
    | 'AI_ASSESSED'
    | 'RECOMMENDATION_APPROVED'
    | 'RECOMMENDATION_MODIFIED'
    | 'RECOMMENDATION_REJECTED'
    | 'TASK_GENERATED'
    | 'TASK_ASSIGNED'
    | 'TASK_STATUS_UPDATED'
    | 'SLA_WARNING'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'REOPENED'
    | 'PREDICTION_GENERATED'
    | 'EARLY_WARNING_ISSUED'
    | 'PREVENTIVE_RECOMMENDATION_APPROVED'
    | 'PREVENTIVE_RECOMMENDATION_DISMISSED'
    | 'PREVENTIVE_TASK_CREATED';
  title: string;
  description: string;
  actor_name: string;
  actor_role: string;
  department_name?: string;
}

export interface Incident {
  incident_id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  subcategory?: string;
  location: string;
  latitude: number;
  longitude: number;
  ward_zone: string;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  source: IncidentSource;
  reported_at: string;
  current_status: IncidentStatus;
  affected_departments: string[];
  primary_department: string;
  secondary_departments: string[];
  estimated_impact: string;
  AI_assessment?: AIAssessment;
  assigned_tasks: DepartmentTask[];
  escalation_level: number;
  created_by: string;
  approved_by?: string;
  timestamps: {
    created_at: string;
    updated_at: string;
    triaged_at?: string;
    approved_at?: string;
    resolved_at?: string;
  };
  is_demo_scenario?: boolean;
}

export interface IncidentImpactRule {
  category: IncidentCategory;
  primaryDepartment: string;
  potentiallyAffected: string[];
  defaultSeverity: IncidentSeverity;
  defaultPriority: IncidentPriority;
  demoSlaMinutesP1: number;
  potentialImpacts: string[];
  defaultActionsMap: Record<string, string[]>;
}
