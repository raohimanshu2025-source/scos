// ==========================================
// SCOS PHASE 7B — EVALUATION INSTRUMENTATION TYPES
// ==========================================

export type WorkflowType = 'BASELINE' | 'SCOS';

export type EvaluationSessionStatus = 'NOT_STARTED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export type InteractionEventType =
  | 'INCIDENT_VIEW'
  | 'GRAPH_CONTEXT_VIEW'
  | 'AI_ANALYSIS_VIEW'
  | 'PREDICTIVE_ASSESSMENT'
  | 'CASCADE_VIEW'
  | 'DEPARTMENT_VIEW'
  | 'RECOMMENDATION_VIEW'
  | 'TASK_VIEW'
  | 'AUDIT_VIEW'
  | 'MANUAL_STEP_COMPLETED';

export interface EvaluationAccessEvent {
  timestamp: string;
  eventType: InteractionEventType;
  resource: string;
}

export interface ContextElementStatus {
  name: string;
  required: boolean;
  available: boolean;
  source: string;
}

export interface DecisionSupportCheckitem {
  name: string;
  required: boolean;
  available: boolean;
  description: string;
}

export interface EvaluationSession {
  sessionId: string;
  scenarioId: string;
  workflowType: WorkflowType;
  participantId: string;
  startTime: string; // ISO timestamp
  endTime?: string | null;
  duration: number; // Duration in seconds
  status: EvaluationSessionStatus;
  retrievalInteractionCount: number;
  informationAccessEvents: EvaluationAccessEvent[];
  coordinationStepCount: number;
  completedBaselineSteps: string[];
}

export interface EvaluationResult {
  evaluationId: string;
  sessionId: string;
  participantId: string;
  scenarioId: string;
  workflowType: WorkflowType;
  duration: number; // Duration in seconds
  retrievalInteractionCount: number;
  contextCompleteness: number; // Percentage (0 - 100)
  coordinationStepCount: number;
  decisionSupportCompleteness: number; // Percentage (0 - 100)
  auditCompleteness: number; // Percentage (0 - 100)
  taskCount: number;
  departmentCount: number;
  completedTasks: number;
  status: EvaluationSessionStatus;
  createdAt: string;
  contextElements: ContextElementStatus[];
  decisionSupportChecklist: DecisionSupportCheckitem[];
}

export interface EvaluationComparison {
  scenarioId: string;
  participantId: string;
  baselineResult?: EvaluationResult;
  scosResult?: EvaluationResult;
  timeDifferenceSeconds?: number;
  timeDifferenceFormatted?: string;
  timeReductionPercent?: number;
  retrievalDifference?: number;
  contextCompletenessDifference?: number;
  coordinationDifference?: number;
  decisionCompletenessDifference?: number;
  auditCompletenessDifference?: number;
}

export interface BaselineManualStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  category: 'RETRIEVAL' | 'CONTEXT' | 'COORDINATION' | 'DECISION' | 'AUDIT';
}

export const BASELINE_MANUAL_STEPS: BaselineManualStep[] = [
  { id: 'step-1', stepNumber: 1, title: 'Review Incident Report', description: 'Manually inspect fragmented paper/SMS complaint details from field officers.', category: 'RETRIEVAL' },
  { id: 'step-2', stepNumber: 2, title: 'Locate Spatial Context', description: 'Cross-reference ward boundaries & road maps on legacy static GIS file.', category: 'CONTEXT' },
  { id: 'step-3', stepNumber: 3, title: 'Identify Infrastructure Dependencies', description: 'Manual call to Jal Sansthan to query nearby drainage pump operational state.', category: 'CONTEXT' },
  { id: 'step-4', stepNumber: 4, title: 'Identify Affected Departments', description: 'Identify Municipal, Traffic Police, Jal Sansthan, and Health Dept leads.', category: 'COORDINATION' },
  { id: 'step-5', stepNumber: 5, title: 'Assess Flood Risk & Impact', description: 'Estimate potential waterlogging severity without predictive inundation models.', category: 'DECISION' },
  { id: 'step-6', stepNumber: 6, title: 'Determine Recommended Actions', description: 'Draft paper emergency action plan for dewatering pump deployment.', category: 'DECISION' },
  { id: 'step-7', stepNumber: 7, title: 'Coordinate Department Actions', description: 'Dispatch individual official phone calls/memos to 4 separate department heads.', category: 'COORDINATION' },
  { id: 'step-8', stepNumber: 8, title: 'Track Department Task Execution', description: 'Call field crews individually to verify mobile pump installation status.', category: 'COORDINATION' },
  { id: 'step-9', stepNumber: 9, title: 'Record Audit Log & Close Incident', description: 'Manually compile paper log sheet for executive archiving.', category: 'AUDIT' },
];
