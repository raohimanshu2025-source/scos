/**
 * SCOS Phase 5B.4 — Incident & Task In-Memory Data Store & Coordination Engine
 * Manages cross-department incidents, multi-department task creation, approval workflows,
 * SLA escalation timers, event timelines, and audit logs.
 */

import {
  Incident,
  DepartmentTask,
  IncidentTimelineEvent,
  AIAssessment,
  TaskStatus,
  EscalationStatus,
  IncidentCategory,
  IncidentSeverity,
  IncidentPriority,
} from '../types/incident';
import { evaluateImpactByRules, DEPARTMENT_MAP } from './impactMappingRules';

export const INITIAL_DEMO_INCIDENTS: Incident[] = [
  {
    incident_id: 'SCOS-INC-1024',
    title: 'Severe Heavy Rainfall & Arterial Waterlogging near Parade Crossing',
    description:
      '[Simulated Incident - Demo Data] 84mm localized cloudburst precipitation causing 0.65m standing water on Parade Crossing & Mall Road. Hydraulic drainage backpressure detected at Jajmau Outflow Trunk #2.',
    category: 'WATERLOGGING',
    subcategory: 'Arterial Inundation',
    location: 'Parade Crossing / Mall Road Intersection',
    latitude: 26.4601,
    longitude: 80.332,
    ward_zone: 'Zone 2 - Parade / Civil Lines',
    severity: 'CRITICAL',
    priority: 'P1',
    source: 'IOT_TELEMETRY',
    reported_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    current_status: 'IN_PROGRESS',
    affected_departments: ['MUNICIPAL', 'TRAFFIC', 'WATER', 'HEALTH'],
    primary_department: 'MUNICIPAL',
    secondary_departments: ['TRAFFIC', 'WATER', 'HEALTH'],
    estimated_impact:
      'High severity urban disruption affecting ~45,000 daily commuters, 3 hospital ambulance access routes, and 2 drainage outfall conduits.',
    is_demo_scenario: true,
    escalation_level: 1,
    created_by: 'SCOS Telemetry Node #14',
    approved_by: 'DM Kanpur Nagar (Dr. R. K. Verma)',
    timestamps: {
      created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      triaged_at: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    AI_assessment: {
      severity: 'CRITICAL',
      priority: 'P1',
      affected_departments: ['MUNICIPAL', 'TRAFFIC', 'WATER', 'HEALTH'],
      primary_department: 'MUNICIPAL',
      secondary_departments: ['TRAFFIC', 'WATER', 'HEALTH'],
      impact_summary:
        'Severe rainfall waterlogging obstructing arterial corridor. Primary drainage overflow requires pump deployment and traffic diversion to prevent city-wide gridlock.',
      recommended_actions: [
        '[Kanpur Nagar Nigam] Deploy 2 high-capacity 100 HP mobile suction pumps to Parade Crossing.',
        '[Traffic Police] Divert commercial and light traffic via Chunniganj & GT Road bypass.',
        '[Kanpur Jal Sansthan] Open hydraulic relief valve B-2 at Jajmau sewer outfall trunk.',
        '[District Health] Alert L1 Casualty ward at Ursula Horsman Hospital for emergency access.',
      ],
      confidence: 0.96,
      explanation:
        'High priority assessment based on real-time spatial overlap of arterial transit, hospital access corridor, and drainage surcharge telemetry.',
      status: 'APPROVED',
      reviewed_by: 'DM Kanpur Nagar',
      reviewed_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    assigned_tasks: [
      {
        task_id: 'TASK-1024-1',
        incident_id: 'SCOS-INC-1024',
        department_id: 'MUNICIPAL',
        department_name: 'Kanpur Nagar Nigam (Municipal Corp)',
        assigned_team_id: 'team-squad-3',
        assigned_team_name: 'Sanitation & Pumping Squad #3',
        task_description:
          'Deploy 2 mobile 100 HP suction pumps to Parade Crossing and unblock storm catch basins.',
        priority: 'P1',
        status: 'IN_PROGRESS',
        due_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        demo_sla_minutes: 30,
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [
          {
            id: 'n1',
            authorName: 'Shri S. K. Gupta',
            authorRole: 'Executive Engineer (Municipal)',
            text: 'Mobile pump truck #04 arrived on site. Suction hose deployed.',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
        ],
        evidence_attachments: [],
      },
      {
        task_id: 'TASK-1024-2',
        incident_id: 'SCOS-INC-1024',
        department_id: 'TRAFFIC',
        department_name: 'Traffic Police & Transport Dept',
        assigned_team_id: 'team-traffic-1',
        assigned_team_name: 'Traffic Rapid Squad #1',
        task_description:
          'Deploy traffic marshals to divert heavy and light traffic away from flooded Parade Crossing toward GT Road bypass.',
        priority: 'P1',
        status: 'IN_PROGRESS',
        due_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        demo_sla_minutes: 30,
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [
          {
            id: 'n2',
            authorName: 'ACP M. P. Singh',
            authorRole: 'Traffic In-Charge',
            text: 'Cones set up at Chunniganj roundabout. Diversion active.',
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          },
        ],
        evidence_attachments: [],
      },
      {
        task_id: 'TASK-1024-3',
        incident_id: 'SCOS-INC-1024',
        department_id: 'WATER',
        department_name: 'Kanpur Jal Sansthan (Water Works)',
        assigned_team_id: 'team-jal-2',
        assigned_team_name: 'Hydraulic Maintenance Unit #2',
        task_description:
          'Inspect Jajmau Trunk Outfall Valve B-2 and clear accumulated debris causing backpressure.',
        priority: 'P1',
        status: 'COMPLETED',
        due_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        demo_sla_minutes: 30,
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [
          {
            id: 'n3',
            authorName: 'Dr. R. K. Verma',
            authorRole: 'Superintending Engineer (Water)',
            text: 'Relief valve B-2 opened successfully. Outflow pressure normalized to 1.8 bar.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ],
        evidence_attachments: [],
      },
      {
        task_id: 'TASK-1024-4',
        incident_id: 'SCOS-INC-1024',
        department_id: 'HEALTH',
        department_name: 'District Health & Emergency Services',
        assigned_team_id: 'team-health-1',
        assigned_team_name: 'Emergency Medical Response Team',
        task_description:
          'Maintain medical emergency standby at Ursula Horsman Hospital and dispatch waterborne disease preventative kits.',
        priority: 'P2',
        status: 'ASSIGNED',
        due_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        demo_sla_minutes: 45,
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [],
        evidence_attachments: [],
      },
    ],
  },

  {
    incident_id: 'SCOS-INC-1025',
    title: 'Zone 4 Jajmau Sewerage Trunk Main Pipeline Overpressure Burst',
    description:
      '[Simulated Incident - Demo Data] 450mm duct iron water transmission pipeline rupture near Jajmau Tannery Road. Water flow halted.',
    category: 'WATER_SUPPLY_DISRUPTION',
    subcategory: 'Pipeline Rupture',
    location: 'Jajmau Tannery Road, Sector 3',
    latitude: 26.4312,
    longitude: 80.381,
    ward_zone: 'Zone 4 - Jajmau',
    severity: 'HIGH',
    priority: 'P1',
    source: 'IOT_TELEMETRY',
    reported_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    current_status: 'IN_PROGRESS',
    affected_departments: ['WATER', 'MUNICIPAL', 'HEALTH'],
    primary_department: 'WATER',
    secondary_departments: ['MUNICIPAL', 'HEALTH'],
    estimated_impact: 'Potable water supply interrupted for ~18,000 residents across 4 wards.',
    is_demo_scenario: false,
    escalation_level: 1,
    created_by: 'Pressure Sensor Node #08',
    timestamps: {
      created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    AI_assessment: {
      severity: 'HIGH',
      priority: 'P1',
      affected_departments: ['WATER', 'MUNICIPAL', 'HEALTH'],
      primary_department: 'WATER',
      secondary_departments: ['MUNICIPAL', 'HEALTH'],
      impact_summary:
        'Main water pipeline rupture causing local street flooding and drinking water cutoff across Jajmau sector.',
      recommended_actions: [
        '[Kanpur Jal Sansthan] Isolate feeder valve #12 and dispatch pipe replacement squad.',
        '[Kanpur Nagar Nigam] Send 6 drinking water tankers to affected residential blocks.',
      ],
      confidence: 0.94,
      explanation: 'Pipeline burst validated by zero pressure telemetry at downstream node #14.',
      status: 'APPROVED',
      reviewed_by: 'Executive Engineer Jal Sansthan',
      reviewed_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    },
    assigned_tasks: [
      {
        task_id: 'TASK-1025-1',
        incident_id: 'SCOS-INC-1025',
        department_id: 'WATER',
        department_name: 'Kanpur Jal Sansthan (Water Works)',
        task_description: 'Isolate feeder valve #12 and replace ruptured 450mm duct section.',
        priority: 'P1',
        status: 'IN_PROGRESS',
        due_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        demo_sla_minutes: 60,
        created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [],
        evidence_attachments: [],
      },
    ],
  },

  {
    incident_id: 'SCOS-INC-1026',
    title: 'Multi-Vehicle Collision & Smart Signal System Failure at GT Road Crossing',
    description:
      '[Simulated Incident - Demo Data] Collision involving commercial truck and transport bus at GT Road / Kalyanpur Junction. Signal sensor communication timeout.',
    category: 'TRAFFIC_ACCIDENT',
    subcategory: 'Corridor Collision',
    location: 'GT Road / Kalyanpur Junction',
    latitude: 26.491,
    longitude: 80.282,
    ward_zone: 'Zone 1 - Kalyanpur',
    severity: 'HIGH',
    priority: 'P1',
    source: 'FIELD_SQUAD',
    reported_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    current_status: 'RESOLVED',
    affected_departments: ['TRAFFIC', 'HEALTH', 'MUNICIPAL'],
    primary_department: 'TRAFFIC',
    secondary_departments: ['HEALTH', 'MUNICIPAL'],
    estimated_impact: '3 light injuries reported. Corridor clearance accomplished in 35 minutes.',
    is_demo_scenario: false,
    escalation_level: 0,
    created_by: 'Traffic PCR Mobile #02',
    timestamps: {
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    AI_assessment: {
      severity: 'HIGH',
      priority: 'P1',
      affected_departments: ['TRAFFIC', 'HEALTH', 'MUNICIPAL'],
      primary_department: 'TRAFFIC',
      secondary_departments: ['HEALTH', 'MUNICIPAL'],
      impact_summary:
        'Traffic collision causing lane blockage and signal failure on GT Road arterial line.',
      recommended_actions: [
        '[Traffic Police] Clear vehicle debris and manual traffic control.',
        '[District Health] Dispatch ALS ambulance.',
      ],
      confidence: 0.92,
      explanation: 'Field report confirmed by AI Optical Traffic Feed #04.',
      status: 'APPROVED',
    },
    assigned_tasks: [
      {
        task_id: 'TASK-1026-1',
        incident_id: 'SCOS-INC-1026',
        department_id: 'TRAFFIC',
        department_name: 'Traffic Police & Transport Dept',
        task_description: 'Clear crash debris and restore traffic flow.',
        priority: 'P1',
        status: 'COMPLETED',
        due_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        demo_sla_minutes: 20,
        created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        escalation_status: 'NORMAL',
        notes: [],
        evidence_attachments: [],
      },
    ],
  },
];

export const INITIAL_TIMELINE_EVENTS: Record<string, IncidentTimelineEvent[]> = {
  'SCOS-INC-1024': [
    {
      id: 'tl-1',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      event_type: 'CREATED',
      title: 'Incident Telemetry Alert Triggered',
      description: 'Precipitation rate 84mm/hr & depth sensor 0.65m detected at Parade Crossing.',
      actor_name: 'SCOS IoT Telemetry Engine',
      actor_role: 'SYSTEM',
    },
    {
      id: 'tl-2',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
      event_type: 'AI_ASSESSED',
      title: 'SCOS AI Multi-Agent Triage Generated',
      description:
        'Assessed CRITICAL severity / P1 priority. Identified 4 affected departments (Municipal, Traffic, Water, Health). Confidence: 96%.',
      actor_name: 'SCOS AI Agent',
      actor_role: 'AI_AGENT',
    },
    {
      id: 'tl-3',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      event_type: 'RECOMMENDATION_APPROVED',
      title: 'District Officer Approved AI Action Matrix',
      description: 'DM Kanpur Nagar reviewed and approved cross-department tasks creation.',
      actor_name: 'Dr. R. K. Verma',
      actor_role: 'DISTRICT_ADMIN',
      department_name: 'District Administration HQ',
    },
    {
      id: 'tl-4',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      event_type: 'TASK_GENERATED',
      title: '4 Department Tasks Dispatched',
      description:
        'Tasks assigned to Kanpur Nagar Nigam, Traffic Police, Jal Sansthan, and Health Services.',
      actor_name: 'SCOS Coordination Kernel',
      actor_role: 'SYSTEM',
    },
    {
      id: 'tl-5',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      event_type: 'TASK_STATUS_UPDATED',
      title: 'Municipal Mobile Pump Arrived on Site',
      description: 'Sanitation & Pumping Squad #3 marked task IN_PROGRESS. Suction initiated.',
      actor_name: 'Shri S. K. Gupta',
      actor_role: 'DEPARTMENT_OFFICER',
      department_name: 'Kanpur Nagar Nigam',
    },
    {
      id: 'tl-6',
      incident_id: 'SCOS-INC-1024',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      event_type: 'TASK_STATUS_UPDATED',
      title: 'Jal Sansthan Outfall Relief Valve Operational',
      description: 'Hydraulic Valve B-2 opened successfully. Outflow pressure normalized.',
      actor_name: 'Dr. R. K. Verma',
      actor_role: 'DEPARTMENT_ADMIN',
      department_name: 'Kanpur Jal Sansthan',
    },
  ],
};

class IncidentStoreService {
  private incidents: Incident[] = [...INITIAL_DEMO_INCIDENTS];
  private timelineMap: Map<string, IncidentTimelineEvent[]> = new Map(
    Object.entries(INITIAL_TIMELINE_EVENTS)
  );

  public getAllIncidents(): Incident[] {
    return [...this.incidents];
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.incident_id === id);
  }

  public createIncident(incidentData: Omit<Incident, 'incident_id' | 'assigned_tasks' | 'timestamps'>): Incident {
    const id = `SCOS-INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      ...incidentData,
      incident_id: id,
      assigned_tasks: [],
      escalation_level: 0,
      timestamps: {
        created_at: now,
        updated_at: now,
      },
    };

    this.incidents.unshift(newIncident);

    // Record timeline
    this.addTimelineEvent({
      incident_id: id,
      event_type: 'CREATED',
      title: 'Incident Reported',
      description: `Reported via ${incidentData.source} at ${incidentData.location}.`,
      actor_name: incidentData.created_by || 'SCOS Officer',
      actor_role: 'OPERATOR',
    });

    return newIncident;
  }

  public updateAIAssessment(incidentId: string, assessment: AIAssessment): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    inc.AI_assessment = assessment;
    inc.affected_departments = assessment.affected_departments;
    inc.primary_department = assessment.primary_department;
    inc.secondary_departments = assessment.secondary_departments;
    inc.severity = assessment.severity;
    inc.priority = assessment.priority;
    inc.timestamps.updated_at = new Date().toISOString();
    inc.timestamps.triaged_at = new Date().toISOString();

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'AI_ASSESSED',
      title: 'AI Impact Assessment Generated',
      description: assessment.impact_summary,
      actor_name: 'SCOS AI Engine',
      actor_role: 'AI_AGENT',
    });

    return inc;
  }

  public approveAIRecommendation(
    incidentId: string,
    officerName: string,
    officerRole: string,
    customTasks?: DepartmentTask[]
  ): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const now = new Date().toISOString();

    if (inc.AI_assessment) {
      inc.AI_assessment.status = 'APPROVED';
      inc.AI_assessment.reviewed_by = officerName;
      inc.AI_assessment.reviewed_at = now;
    }

    inc.approved_by = officerName;
    inc.current_status = 'IN_PROGRESS';
    inc.timestamps.approved_at = now;
    inc.timestamps.updated_at = now;

    // Generate tasks if not provided
    if (customTasks && customTasks.length > 0) {
      inc.assigned_tasks = customTasks;
    } else if (inc.AI_assessment && inc.assigned_tasks.length === 0) {
      const generatedTasks: DepartmentTask[] = inc.AI_assessment.affected_departments.map(
        (deptCode, idx) => {
          const deptInfo = DEPARTMENT_MAP[deptCode] || { name: deptCode, code: deptCode };
          const recAction =
            inc.AI_assessment?.recommended_actions.find((a) => a.includes(deptInfo.name) || a.includes(deptCode)) ||
            `Execute operational response for ${deptInfo.name}.`;

          return {
            task_id: `TASK-${inc.incident_id.replace('SCOS-INC-', '')}-${idx + 1}`,
            incident_id: inc.incident_id,
            department_id: deptCode,
            department_name: deptInfo.name,
            task_description: recAction.replace(/^\[.*?\]\s*/, ''),
            priority: inc.priority,
            status: 'ASSIGNED',
            due_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            demo_sla_minutes: 30,
            created_at: now,
            updated_at: now,
            escalation_status: 'NORMAL',
            notes: [],
            evidence_attachments: [],
          };
        }
      );
      inc.assigned_tasks = generatedTasks;
    }

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'RECOMMENDATION_APPROVED',
      title: 'AI Recommendation Approved by Officer',
      description: `Approved by ${officerName} (${officerRole}). ${inc.assigned_tasks.length} department tasks created.`,
      actor_name: officerName,
      actor_role: officerRole,
    });

    return inc;
  }

  public modifyAIRecommendation(
    incidentId: string,
    officerName: string,
    officerRole: string,
    updatedActions: string[],
    selectedDepts: string[]
  ): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const now = new Date().toISOString();

    if (inc.AI_assessment) {
      inc.AI_assessment.status = 'MODIFIED';
      inc.AI_assessment.reviewed_by = officerName;
      inc.AI_assessment.reviewed_at = now;
      inc.AI_assessment.recommended_actions = updatedActions;
      inc.AI_assessment.affected_departments = selectedDepts;
    }

    inc.affected_departments = selectedDepts;
    inc.approved_by = officerName;
    inc.current_status = 'IN_PROGRESS';
    inc.timestamps.approved_at = now;
    inc.timestamps.updated_at = now;

    // Regenerate tasks
    inc.assigned_tasks = selectedDepts.map((deptCode, idx) => {
      const deptInfo = DEPARTMENT_MAP[deptCode] || { name: deptCode, code: deptCode };
      const actionText = updatedActions[idx] || `Perform operational dispatch for ${deptInfo.name}`;
      return {
        task_id: `TASK-${inc.incident_id.replace('SCOS-INC-', '')}-${idx + 1}`,
        incident_id: inc.incident_id,
        department_id: deptCode,
        department_name: deptInfo.name,
        task_description: actionText.replace(/^\[.*?\]\s*/, ''),
        priority: inc.priority,
        status: 'ASSIGNED',
        due_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        demo_sla_minutes: 30,
        created_at: now,
        updated_at: now,
        escalation_status: 'NORMAL',
        notes: [],
        evidence_attachments: [],
      };
    });

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'RECOMMENDATION_MODIFIED',
      title: 'AI Recommendation Modified by Officer',
      description: `Modified and approved by ${officerName}. Updated to ${inc.assigned_tasks.length} tasks.`,
      actor_name: officerName,
      actor_role: officerRole,
    });

    return inc;
  }

  public rejectAIRecommendation(
    incidentId: string,
    officerName: string,
    officerRole: string,
    reason: string
  ): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const now = new Date().toISOString();

    if (inc.AI_assessment) {
      inc.AI_assessment.status = 'REJECTED';
      inc.AI_assessment.reviewed_by = officerName;
      inc.AI_assessment.reviewed_at = now;
      inc.AI_assessment.review_notes = reason;
    }

    inc.current_status = 'TRIAGED';
    inc.timestamps.updated_at = now;

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'RECOMMENDATION_REJECTED',
      title: 'AI Recommendation Rejected',
      description: `Rejected by ${officerName}. Reason: ${reason}`,
      actor_name: officerName,
      actor_role: officerRole,
    });

    return inc;
  }

  public updateTaskStatus(
    incidentId: string,
    taskId: string,
    newStatus: TaskStatus,
    actorName: string,
    actorRole: string,
    noteText?: string
  ): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const task = inc.assigned_tasks.find((t) => t.task_id === taskId);
    if (!task) return undefined;

    const now = new Date().toISOString();
    task.status = newStatus;
    task.updated_at = now;

    if (newStatus === 'COMPLETED') {
      task.completed_at = now;
    }

    if (noteText) {
      task.notes.push({
        id: `note-${Date.now()}`,
        authorName: actorName,
        authorRole: actorRole,
        text: noteText,
        timestamp: now,
      });
    }

    // Check if ALL tasks completed -> Incident Resolved
    const allCompleted = inc.assigned_tasks.length > 0 && inc.assigned_tasks.every((t) => t.status === 'COMPLETED' || t.status === 'CANCELLED');
    if (allCompleted) {
      inc.current_status = 'RESOLVED';
      inc.timestamps.resolved_at = now;
    } else {
      inc.current_status = 'IN_PROGRESS';
    }

    inc.timestamps.updated_at = now;

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'TASK_STATUS_UPDATED',
      title: `Task Status Updated to ${newStatus}`,
      description: `Task '${task.task_description}' (${task.department_name}) marked ${newStatus} by ${actorName}.`,
      actor_name: actorName,
      actor_role: actorRole,
      department_name: task.department_name,
    });

    return inc;
  }

  public triggerSlaEscalation(incidentId: string, taskId?: string): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const now = new Date().toISOString();
    inc.escalation_level += 1;
    inc.current_status = 'ESCALATED';
    inc.timestamps.updated_at = now;

    if (taskId) {
      const task = inc.assigned_tasks.find((t) => t.task_id === taskId);
      if (task) {
        task.escalation_status = inc.escalation_level > 1 ? 'ESCALATED_DM' : 'ESCALATED_DEPT_HEAD';
        task.status = 'ESCALATED';
      }
    } else {
      inc.assigned_tasks.forEach((t) => {
        if (t.status !== 'COMPLETED') {
          t.escalation_status = inc.escalation_level > 1 ? 'ESCALATED_DM' : 'ESCALATED_DEPT_HEAD';
          t.status = 'ESCALATED';
        }
      });
    }

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'ESCALATED',
      title: `[Demo SLA Trigger] Incident Escalated to Level ${inc.escalation_level}`,
      description: `Task response exceeded demo SLA threshold. Escalated to ${inc.escalation_level > 1 ? 'District Magistrate' : 'Department Head'}.`,
      actor_name: 'SCOS Escalation Engine',
      actor_role: 'SYSTEM',
    });

    return inc;
  }

  public resolveIncident(incidentId: string, officerName: string, officerRole: string): Incident | undefined {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return undefined;

    const now = new Date().toISOString();
    inc.current_status = 'RESOLVED';
    inc.timestamps.resolved_at = now;
    inc.timestamps.updated_at = now;

    this.addTimelineEvent({
      incident_id: incidentId,
      event_type: 'RESOLVED',
      title: 'Incident Officially Resolved',
      description: `Incident marked RESOLVED by ${officerName} (${officerRole}). All operational field actions completed.`,
      actor_name: officerName,
      actor_role: officerRole,
    });

    return inc;
  }

  public resetAndRunDemoScenario(): Incident {
    // Reset Parade Crossing incident to initial state for demo
    const demoInc = INITIAL_DEMO_INCIDENTS[0];
    const index = this.incidents.findIndex((i) => i.incident_id === demoInc.incident_id);

    const freshDemo: Incident = JSON.parse(JSON.stringify(demoInc));
    freshDemo.timestamps.created_at = new Date().toISOString();
    freshDemo.timestamps.updated_at = new Date().toISOString();

    if (index !== -1) {
      this.incidents[index] = freshDemo;
    } else {
      this.incidents.unshift(freshDemo);
    }

    this.timelineMap.set(freshDemo.incident_id, [...INITIAL_TIMELINE_EVENTS['SCOS-INC-1024']]);

    this.addTimelineEvent({
      incident_id: freshDemo.incident_id,
      event_type: 'CREATED',
      title: 'Heavy Rainfall Demonstration Scenario Reset',
      description: 'End-to-End thesis demonstration scenario initialized for Kanpur Nagar Command.',
      actor_name: 'SCOS Demo Controller',
      actor_role: 'SYSTEM',
    });

    return freshDemo;
  }

  public getTimelineEvents(incidentId: string): IncidentTimelineEvent[] {
    return this.timelineMap.get(incidentId) || [];
  }

  public addTimelineEvent(event: Omit<IncidentTimelineEvent, 'id' | 'timestamp'>): IncidentTimelineEvent {
    const list = this.timelineMap.get(event.incident_id) || [];
    const newEvent: IncidentTimelineEvent = {
      ...event,
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEvent);
    this.timelineMap.set(event.incident_id, list);
    return newEvent;
  }
}

export const incidentStore = new IncidentStoreService();
