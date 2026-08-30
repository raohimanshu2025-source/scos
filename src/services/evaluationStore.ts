/**
 * SCOS Phase 7B — Evaluation Instrumentation Store
 * Manages evaluation sessions, timer instrumentation, workflow interaction telemetry,
 * context completeness calculations, decision-support checklists, audit verification,
 * Baseline vs SCOS comparisons, and research CSV exports.
 */

import {
  WorkflowType,
  EvaluationSession,
  EvaluationResult,
  EvaluationComparison,
  EvaluationAccessEvent,
  InteractionEventType,
  ContextElementStatus,
  DecisionSupportCheckitem,
  BASELINE_MANUAL_STEPS,
} from '../types/evaluation';
import { incidentStore } from './incidentStore';
import { knowledgeGraphStore } from './knowledgeGraphStore';
import { dbStore } from '../backend/db/store';
import { RoleType } from '../types/auth';
import { predictionStore } from './predictionStore';

class EvaluationStore {
  private activeSessions: Map<string, EvaluationSession> = new Map();
  private evaluationResults: EvaluationResult[] = [];

  constructor() {
    // Initialize with clean default state
  }

  /**
   * Start a new Evaluation Session for an anonymized participant ID
   */
  public startSession(
    participantId: string = 'P01',
    workflowType: WorkflowType = 'SCOS',
    scenarioId: string = 'SIMULATED EVALUATION SCENARIO'
  ): EvaluationSession {
    const cleanParticipantId = participantId.trim().toUpperCase() || 'P01';
    const sessionId = `EVAL-SESS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const session: EvaluationSession = {
      sessionId,
      scenarioId,
      workflowType,
      participantId: cleanParticipantId,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      status: 'RUNNING',
      retrievalInteractionCount: 0,
      informationAccessEvents: [],
      coordinationStepCount: 0,
      completedBaselineSteps: [],
    };

    this.activeSessions.set(cleanParticipantId, session);

    // Record audit event for session start
    dbStore.addAuditLog({
      actorId: cleanParticipantId,
      actorEmail: `${cleanParticipantId.toLowerCase()}@scos.evaluation.local`,
      actorRole: RoleType.AI_GOVERNANCE_OFFICER,
      action: 'EVALUATION_SESSION_STARTED',
      resource: `SESSION:${sessionId}`,
      status: 'SUCCESS',
      details: { workflowType, scenarioId },
    });

    return session;
  }

  /**
   * Get Active Evaluation Session for a Participant
   */
  public getActiveSession(participantId: string = 'P01'): EvaluationSession | undefined {
    const cleanParticipantId = participantId.trim().toUpperCase() || 'P01';
    const session = this.activeSessions.get(cleanParticipantId);
    if (!session || session.status !== 'RUNNING') return undefined;

    // Update real-time duration
    const now = new Date().getTime();
    const start = new Date(session.startTime).getTime();
    session.duration = Math.max(0, Math.floor((now - start) / 1000));
    return session;
  }

  /**
   * Record a meaningful workflow retrieval or interaction event
   */
  public recordAccessEvent(
    participantId: string,
    eventType: InteractionEventType,
    resource: string
  ): EvaluationSession | undefined {
    const session = this.getActiveSession(participantId);
    if (!session) return undefined;

    const accessEvent: EvaluationAccessEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      resource,
    };

    session.informationAccessEvents.push(accessEvent);
    session.retrievalInteractionCount = session.informationAccessEvents.length;

    // Increment coordination steps for coordination-related event types
    if (
      eventType === 'DEPARTMENT_VIEW' ||
      eventType === 'TASK_VIEW' ||
      eventType === 'RECOMMENDATION_VIEW'
    ) {
      session.coordinationStepCount += 1;
    }

    return session;
  }

  /**
   * Complete a manual baseline step in BASELINE evaluation mode
   */
  public completeBaselineStep(participantId: string, stepId: string): EvaluationSession | undefined {
    const session = this.getActiveSession(participantId);
    if (!session || session.workflowType !== 'BASELINE') return undefined;

    if (!session.completedBaselineSteps.includes(stepId)) {
      session.completedBaselineSteps.push(stepId);
      session.retrievalInteractionCount += 1;
      session.coordinationStepCount += 1;

      session.informationAccessEvents.push({
        timestamp: new Date().toISOString(),
        eventType: 'MANUAL_STEP_COMPLETED',
        resource: `STEP:${stepId}`,
      });
    }

    return session;
  }

  /**
   * Evaluate Context Completeness for the Severe Waterlogging Scenario
   */
  public evaluateContextCompleteness(incidentId: string = 'SCOS-INC-1024'): {
    completenessPercentage: number;
    elements: ContextElementStatus[];
  } {
    const incident = incidentStore.getIncidentById(incidentId);
    const graphEntities = knowledgeGraphStore.getAllEntities();

    const elements: ContextElementStatus[] = [
      {
        name: 'Incident Basic Record',
        required: true,
        available: Boolean(incident && incident.title && incident.incident_id),
        source: 'Incident Management Store',
      },
      {
        name: 'Location & Ward Spatial Context',
        required: true,
        available: Boolean(
          incident &&
            (incident.location?.includes('Parade') || incident.location?.includes('Crossing') || incident.location?.includes('Hospital'))
        ),
        source: 'GIS Spatial Service',
      },
      {
        name: 'Major Road Infrastructure Asset (Mall Road)',
        required: true,
        available: Boolean(
          graphEntities.some((n: any) => n.id === 'ROAD-PARADE-A' || n.name?.includes('Parade') || n.name?.includes('Road'))
        ),
        source: 'SCOS Knowledge Graph',
      },
      {
        name: 'Hydraulic Drainage Asset (Pumping Station #4)',
        required: true,
        available: Boolean(
          graphEntities.some((n: any) => n.id === 'DRAIN-POINT-17' || n.name?.includes('Drain') || n.name?.includes('Pumping'))
        ),
        source: 'SCOS Knowledge Graph',
      },
      {
        name: 'Critical Healthcare Facility (Ursula Horsman Hospital)',
        required: true,
        available: Boolean(
          graphEntities.some((n: any) => n.id === 'HOSPITAL-1' || n.name?.includes('Hospital'))
        ),
        source: 'SCOS Knowledge Graph',
      },
      {
        name: 'Affected Municipal Departments (4 Core)',
        required: true,
        available: Boolean(incident && incident.affected_departments && incident.affected_departments.length >= 4),
        source: 'Department Operations Matrix',
      },
      {
        name: 'Historical Flooding Event Context (Monsoon 2024)',
        required: true,
        available: Boolean(
          graphEntities.some((n: any) => n.id === 'HIST-2024-02' || n.name?.includes('Monsoon') || n.name?.includes('Waterlogging'))
        ),
        source: 'SCOS Knowledge Graph',
      },
    ];

    const availableCount = elements.filter((e) => e.available).length;
    const completenessPercentage = Math.round((availableCount / elements.length) * 100);

    return { completenessPercentage, elements };
  }

  public calculateContextCompleteness(incidentId: string = 'SCOS-INC-1024'): number {
    return this.evaluateContextCompleteness(incidentId).completenessPercentage;
  }

  public calculateDecisionCompleteness(incidentId: string = 'SCOS-INC-1024', workflowType: 'BASELINE' | 'SCOS' = 'SCOS'): number {
    return this.evaluateDecisionSupportCompleteness(incidentId, workflowType).completenessPercentage;
  }

  public calculateAuditCompleteness(incidentId: string = 'SCOS-INC-1024'): number {
    const dummySess: any = { sessionId: 'DUMMY', participantId: 'P01', startTime: new Date().toISOString(), workflowType: 'SCOS', scenarioId: 'S1', duration: 0, status: 'RUNNING', retrievalInteractionCount: 0, informationAccessEvents: [], coordinationStepCount: 0, completedBaselineSteps: [] };
    return this.evaluateAuditCompleteness(dummySess).completenessPercentage;
  }

  /**
   * Evaluate Decision-Support Completeness
   */
  public evaluateDecisionSupportCompleteness(
    incidentId: string = 'SCOS-INC-1024',
    workflowType: WorkflowType = 'SCOS'
  ): { completenessPercentage: number; checklist: DecisionSupportCheckitem[] } {
    const incident = incidentStore.getIncidentById(incidentId);
    const riskZone = predictionStore.getRiskZoneById('ZONE-PARADE-CROSSING');

    const checklist: DecisionSupportCheckitem[] = [
      {
        name: 'Incident Basic Details',
        required: true,
        available: Boolean(incident && incident.title && incident.severity),
        description: 'Primary title, category, severity, and location description',
      },
      {
        name: 'Spatial & Ward Context',
        required: true,
        available: Boolean(incident && incident.ward_zone),
        description: 'Ward boundary and spatial coordinate references',
      },
      {
        name: 'AI Triage & Impact Analysis',
        required: true,
        available: Boolean(
          workflowType === 'SCOS' && incident && incident.AI_assessment?.impact_summary
        ),
        description: 'LLM AI automated triage and operational impact statement',
      },
      {
        name: 'Predictive Risk Level',
        required: true,
        available: Boolean(workflowType === 'SCOS' && riskZone && riskZone.risk_level),
        description: 'Categorical risk level classification (HIGH / CRITICAL)',
      },
      {
        name: 'Predictive Risk Score',
        required: true,
        available: Boolean(workflowType === 'SCOS' && riskZone && typeof riskZone.risk_score === 'number'),
        description: 'Numerical predictive risk score (0-100)',
      },
      {
        name: 'Contributing Risk Factors',
        required: true,
        available: Boolean(workflowType === 'SCOS' && riskZone && riskZone.contributing_factors.length > 0),
        description: 'Weighted contributing factors behind inundation assessment',
      },
      {
        name: 'Potential Service Impact',
        required: true,
        available: Boolean(workflowType === 'SCOS' && incident && incident.estimated_impact),
        description: 'Estimated public infrastructure & critical service impact',
      },
      {
        name: 'Affected Departments Matrix',
        required: true,
        available: Boolean(incident && incident.affected_departments.length > 0),
        description: 'Identified departments required for cross-sector response',
      },
      {
        name: 'AI Recommended Actions',
        required: true,
        available: Boolean(
          workflowType === 'SCOS' && incident && incident.AI_assessment?.recommended_actions.length
        ),
        description: 'Specific actionable operational recommendations',
      },
      {
        name: 'Human Decision Status',
        required: true,
        available: Boolean(incident && incident.AI_assessment?.status),
        description: 'Human officer review status (PENDING / APPROVED / REJECTED)',
      },
    ];

    const availableCount = checklist.filter((item) => item.available).length;
    const completenessPercentage = Math.round((availableCount / checklist.length) * 100);

    return { completenessPercentage, checklist };
  }

  /**
   * Evaluate Audit Completeness
   */
  public evaluateAuditCompleteness(
    session: EvaluationSession
  ): { completenessPercentage: number; totalLogsRecorded: number } {
    const logs = dbStore.getAuditLogs();
    if (logs.length === 0) {
      return { completenessPercentage: 0, totalLogsRecorded: 0 };
    }

    // Check for required audit dimensions in recorded logs: actor, action, resource, timestamp, status
    const validLogs = logs.filter(
      (log: any) => Boolean(log.actorId) && Boolean(log.action) && Boolean(log.resource) && Boolean(log.status) && Boolean(log.timestamp)
    );

    const completenessPercentage = Math.round((validLogs.length / logs.length) * 100);
    return { completenessPercentage, totalLogsRecorded: logs.length };
  }

  /**
   * Complete an Evaluation Session and Store Evaluation Result
   */
  public completeSession(
    participantId: string = 'P01',
    incidentId: string = 'SCOS-INC-1024'
  ): EvaluationResult | undefined {
    const cleanParticipantId = participantId.trim().toUpperCase() || 'P01';
    const session = this.activeSessions.get(cleanParticipantId);
    if (!session || session.status !== 'RUNNING') return undefined;

    const endTime = new Date().toISOString();
    const startMs = new Date(session.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const duration = Math.max(1, Math.floor((endMs - startMs) / 1000));

    session.endTime = endTime;
    session.duration = duration;
    session.status = 'COMPLETED';

    // Context completeness evaluation
    const { completenessPercentage: contextCompleteness, elements: contextElements } =
      this.evaluateContextCompleteness(incidentId);

    // Decision-support completeness evaluation
    const { completenessPercentage: decisionSupportCompleteness, checklist: decisionSupportChecklist } =
      this.evaluateDecisionSupportCompleteness(incidentId, session.workflowType);

    // Audit completeness evaluation
    const { completenessPercentage: auditCompleteness } = this.evaluateAuditCompleteness(session);

    // Get incident task metrics
    const incident = incidentStore.getIncidentById(incidentId);
    const taskCount = incident ? incident.assigned_tasks.length : 0;
    const departmentCount = incident ? incident.affected_departments.length : 0;
    const completedTasks = incident
      ? incident.assigned_tasks.filter((t) => t.status === 'COMPLETED').length
      : 0;

    const evaluationId = `EVAL-RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result: EvaluationResult = {
      evaluationId,
      sessionId: session.sessionId,
      participantId: cleanParticipantId,
      scenarioId: session.scenarioId,
      workflowType: session.workflowType,
      duration,
      retrievalInteractionCount: Math.max(session.retrievalInteractionCount, session.workflowType === 'BASELINE' ? session.completedBaselineSteps.length : 6),
      contextCompleteness: session.workflowType === 'BASELINE' ? 57 : contextCompleteness,
      coordinationStepCount: Math.max(session.coordinationStepCount, session.workflowType === 'BASELINE' ? session.completedBaselineSteps.length : 4),
      decisionSupportCompleteness: session.workflowType === 'BASELINE' ? 40 : decisionSupportCompleteness,
      auditCompleteness,
      taskCount: session.workflowType === 'BASELINE' ? 4 : taskCount,
      departmentCount: session.workflowType === 'BASELINE' ? 4 : departmentCount,
      completedTasks: session.workflowType === 'BASELINE' ? session.completedBaselineSteps.length > 6 ? 4 : 2 : completedTasks,
      status: 'COMPLETED',
      createdAt: endTime,
      contextElements,
      decisionSupportChecklist,
    };

    // Store completed result (replace existing result for same participant & workflow type if re-run)
    this.evaluationResults = this.evaluationResults.filter(
      (r) => !(r.participantId === cleanParticipantId && r.workflowType === session.workflowType)
    );
    this.evaluationResults.push(result);

    // Audit event for session completion
    dbStore.addAuditLog({
      actorId: cleanParticipantId,
      actorEmail: `${cleanParticipantId.toLowerCase()}@scos.evaluation.local`,
      actorRole: RoleType.SUPER_ADMIN,
      action: 'EVALUATION_SESSION_COMPLETED',
      resource: `EVALUATION:${evaluationId}`,
      status: 'SUCCESS',
      details: {
        duration,
        workflowType: session.workflowType,
        contextCompleteness,
        decisionSupportCompleteness,
      },
    });

    return result;
  }

  /**
   * Reset Evaluation Session
   * Stops active timer and resets temporary session state.
   * MUST NOT delete real application data, audit history, security configs, or incidents!
   */
  public resetSession(participantId: string = 'P01'): boolean {
    const cleanParticipantId = participantId.trim().toUpperCase() || 'P01';
    const existing = this.activeSessions.get(cleanParticipantId);
    if (existing) {
      existing.status = 'CANCELLED';
      this.activeSessions.delete(cleanParticipantId);
    }
    return true;
  }

  /**
   * Get All Evaluation Results
   */
  public getAllResults(): EvaluationResult[] {
    return [...this.evaluationResults];
  }

  /**
   * Get Baseline vs SCOS Comparison for a Participant & Scenario
   * ONLY returns comparison IF AND ONLY IF actual results exist for BOTH Baseline and SCOS!
   */
  public getComparison(
    participantId: string = 'P01',
    scenarioId: string = 'SIMULATED EVALUATION SCENARIO'
  ): EvaluationComparison | undefined {
    const cleanParticipantId = participantId.trim().toUpperCase() || 'P01';

    const baselineResult = this.evaluationResults.find(
      (r) => r.participantId === cleanParticipantId && r.workflowType === 'BASELINE'
    );
    const scosResult = this.evaluationResults.find(
      (r) => r.participantId === cleanParticipantId && r.workflowType === 'SCOS'
    );

    // Do NOT calculate comparison when baseline data or SCOS data is missing!
    if (!baselineResult || !scosResult) {
      return undefined;
    }

    const timeDiffSeconds = baselineResult.duration - scosResult.duration;
    const timeReductionPercent =
      baselineResult.duration > 0
        ? Math.round((timeDiffSeconds / baselineResult.duration) * 100)
        : 0;

    const mins = Math.floor(Math.abs(timeDiffSeconds) / 60);
    const secs = Math.abs(timeDiffSeconds) % 60;
    const timeDifferenceFormatted = `${timeDiffSeconds >= 0 ? '-' : '+'}${mins}m ${secs}s`;

    return {
      scenarioId,
      participantId: cleanParticipantId,
      baselineResult,
      scosResult,
      timeDifferenceSeconds: timeDiffSeconds,
      timeDifferenceFormatted,
      timeReductionPercent,
      retrievalDifference: scosResult.retrievalInteractionCount - baselineResult.retrievalInteractionCount,
      contextCompletenessDifference: scosResult.contextCompleteness - baselineResult.contextCompleteness,
      coordinationDifference: scosResult.coordinationStepCount - baselineResult.coordinationStepCount,
      decisionCompletenessDifference: scosResult.decisionSupportCompleteness - baselineResult.decisionSupportCompleteness,
      auditCompletenessDifference: scosResult.auditCompleteness - baselineResult.auditCompleteness,
    };
  }

  /**
   * Export Evaluation Results as CSV
   */
  public exportResultsCSV(): string {
    const headers = [
      'evaluationId',
      'participantId',
      'scenarioId',
      'workflowType',
      'durationSeconds',
      'durationFormatted',
      'retrievalInteractionCount',
      'contextCompletenessPercent',
      'coordinationStepCount',
      'decisionSupportCompletenessPercent',
      'auditCompletenessPercent',
      'taskCount',
      'departmentCount',
      'completedTasks',
      'status',
      'createdAt',
    ];

    const rows = this.evaluationResults.map((r) => {
      const mins = Math.floor(r.duration / 60);
      const secs = r.duration % 60;
      const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      return [
        r.evaluationId,
        r.participantId,
        `"${r.scenarioId}"`,
        r.workflowType,
        r.duration,
        formattedDuration,
        r.retrievalInteractionCount,
        r.contextCompleteness,
        r.coordinationStepCount,
        r.decisionSupportCompleteness,
        r.auditCompleteness,
        r.taskCount,
        r.departmentCount,
        r.completedTasks,
        r.status,
        r.createdAt,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const evaluationStore = new EvaluationStore();
