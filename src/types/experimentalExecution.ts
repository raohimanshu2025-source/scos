// =========================================================================
// SCOS PHASE 10B — CONTROLLED EXPERIMENTAL EXECUTION DATA MODELS
// Reproducible Results Generation, Standardized Metrics & Comparative Engine
// =========================================================================

import { ResultValidityClassification, OrderEffectRisk } from './comparativeEvaluation';

/**
 * Experimental Condition Identifiers
 */
export type ExperimentalCondition = 'BASELINE_MANUAL' | 'SCOS_INTEGRATED';

/**
 * Experimental Execution Status Lifecycle
 */
export type ExperimentalExecutionStatus =
  | 'DRAFT'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'VALIDATED'
  | 'INVALIDATED';

/**
 * Experimental Execution Ordering for Counterbalancing
 */
export type ExperimentalOrder =
  | 'BASELINE_THEN_SCOS'
  | 'SCOS_THEN_BASELINE'
  | 'COUNTERBALANCED';

/**
 * Standardized 10 Municipal Operational Activity Steps
 */
export type WorkflowActivityStepId =
  | 'INCIDENT_IDENTIFICATION'
  | 'INFORMATION_RETRIEVAL'
  | 'CONTEXT_REVIEW'
  | 'INFRASTRUCTURE_IDENTIFICATION'
  | 'DEPARTMENT_IDENTIFICATION'
  | 'COORDINATION_INTERACTIONS'
  | 'RISK_INTERPRETATION'
  | 'DECISION_FORMATION'
  | 'TASK_PREPARATION'
  | 'AUDIT_DOCUMENTATION';

/**
 * Standardized 10 Evaluation Metric Keys (M1–M10)
 */
export type ExperimentalMetricKey =
  | 'M1_WORKFLOW_DURATION'
  | 'M2_INFORMATION_RETRIEVAL_COUNT'
  | 'M3_CONTEXT_COMPLETENESS_SCORE'
  | 'M4_COORDINATION_OVERHEAD'
  | 'M5_INFRASTRUCTURE_AWARENESS'
  | 'M6_CASCADE_IDENTIFICATION'
  | 'M7_CRITICAL_FACILITY_AWARENESS'
  | 'M8_DECISION_SUPPORT_COMPLETENESS'
  | 'M9_AUDIT_COMPLETENESS_SCORE'
  | 'M10_DECISION_TRACEABILITY';

/**
 * Standardized Observation Recorded during a Workflow Activity Step
 */
export interface ExperimentalObservation {
  stepId: WorkflowActivityStepId;
  stepNumber: number;
  stepName: string;
  durationSeconds: number;
  status: 'COMPLETED' | 'UNAVAILABLE' | 'PARTIAL';
  actionsCount: number;
  interactionsCount: number;
  assetsIdentified: string[];
  departmentsInvolved: string[];
  facilitiesFlagged: string[];
  dataSourcesAccessed: string[];
  traceNodeRef: string;
  notes: string;
  timestamp: string;
}

/**
 * Standardized Metric Result (M1–M10) with Provenance and Calculation Method
 */
export interface ExperimentalMetricObservation {
  metricId: ExperimentalMetricKey;
  metricCode: string; // e.g. "M1", "M2"
  displayName: string;
  value: number | string;
  unit: string;
  calculationMethod: string;
  sourceObservations: WorkflowActivityStepId[];
  validityClassification: ResultValidityClassification;
  provenance: string;
  classificationNotice: string;
  isAvailable: boolean;
  notes?: string;
}

/**
 * Controlled Experimental Run
 */
export interface ExperimentalRun {
  runId: string;
  sessionId: string;
  datasetVersion: string;
  scenarioId: string; // e.g. "SC-01"
  scenarioCode: string;
  scenarioName: string;
  scenarioFingerprint: string;
  condition: ExperimentalCondition;
  executionTimestamp: string;
  completedAt?: string;
  executionStatus: ExperimentalExecutionStatus;
  parameterFingerprint: string;
  initialConditionFingerprint: string;
  executionConfigurationFingerprint: string;
  order: ExperimentalOrder;
  parametersSnapshot: Record<string, number | string>;
  initialConditions: Record<string, number | string | boolean>;
  observations: ExperimentalObservation[];
  metricResults: Record<ExperimentalMetricKey, ExperimentalMetricObservation>;
  provenance: {
    dataOrigin: string;
    sourceModule: string;
    sourceScenario: string;
    validationStatus: string;
    classification: 'SIMULATED / PROTOTYPE DATA';
    isSimulatedPrototype: boolean;
    executedBy: string;
    createdAt: string;
    reproducibilityStandard: string;
  };
  classification: 'SIMULATED / PROTOTYPE DATA';
  auditReference: string;
  validationNotes?: string[];
  orderEffectNotice?: string;
}

/**
 * Controlled Experimental Execution Session
 */
export interface ExperimentalExecutionSession {
  sessionId: string;
  sessionCode: string;
  datasetVersion: string;
  scenarioId: string;
  scenarioCode: string;
  scenarioName: string;
  scenarioFingerprint: string;
  parameterFingerprint: string;
  initialConditionFingerprint: string;
  order: ExperimentalOrder;
  status: ExperimentalExecutionStatus;
  baselineRunId?: string;
  scosRunId?: string;
  runs: ExperimentalRun[];
  comparisonId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
  validationNotes?: string[];
}

/**
 * Individual Metric Comparative Item
 */
export interface MetricComparisonItem {
  metricId: ExperimentalMetricKey;
  metricCode: string;
  displayName: string;
  unit: string;
  baselineValue: number | string;
  scosValue: number | string;
  absoluteDifference: number | string;
  relativeChangePercent: number | null; // e.g. -65.5 for duration reduction or +80.0 for completeness
  validityClassification: ResultValidityClassification;
  calculationMethod: string;
  interpretation: string;
  direction: 'IMPROVEMENT' | 'REGRESSION' | 'NEUTRAL' | 'NOT_COMPARABLE';
}

/**
 * Comparative Result between Condition A and Condition B for the Same Scenario
 */
export interface ExperimentalComparisonResult {
  comparisonId: string;
  sessionId: string;
  scenarioId: string;
  scenarioCode: string;
  scenarioName: string;
  datasetVersion: string;
  scenarioFingerprint: string;
  parameterFingerprint: string;
  initialConditionFingerprint: string;
  baselineRunId: string;
  scosRunId: string;
  isValid: boolean;
  invalidationReason?: string;
  order: ExperimentalOrder;
  orderEffectRisk: OrderEffectRisk;
  orderEffectWarning: string;
  metricsComparison: MetricComparisonItem[];
  reproducibilityStatus: {
    isReproducible: boolean;
    baselineFingerprintMatch: boolean;
    scosFingerprintMatch: boolean;
    scenarioFingerprintMatch: boolean;
    parameterFingerprintMatch: boolean;
  };
  provenance: {
    dataOrigin: string;
    generatedAt: string;
    generatedBy: string;
    classification: 'SIMULATED / PROTOTYPE DATA';
  };
  classificationNotice: 'SIMULATED / PROTOTYPE DATA — Descriptive research comparison only.';
  statisticalLimitationNotice: string;
}

/**
 * Aggregated Research Summary for Phase 10B
 */
export interface ExperimentalResearchSummary {
  datasetVersion: string;
  totalScenarios: number;
  totalSessions: number;
  totalExecutions: number;
  completedExecutions: number;
  validatedExecutions: number;
  invalidExecutions: number;
  baselineRuns: number;
  scosRuns: number;
  comparablePairs: number;
  reproducibilityMatches: number;
  reproducibilityMismatches: number;
  metricCoverage: Record<ExperimentalMetricKey, number>;
  classificationNotice: string;
  limitations: string[];
}

/**
 * Reproducibility Verification for an Experimental Run
 */
export interface RunReproducibilityVerificationResult {
  runId: string;
  scenarioId: string;
  condition: ExperimentalCondition;
  datasetVersion: string;
  providedFingerprint: string;
  computedFingerprint: string;
  isMatch: boolean;
  status: 'MATCH' | 'MISMATCH';
  diffs: string[];
  canonicalPayload: string;
  verifiedAt: string;
  algorithm: string;
  classificationNotice: string;
}

/**
 * Export Formats for Controlled Experimental Results
 */
export interface ExperimentalExportPayload {
  exportId: string;
  datasetVersion: string;
  exportedAt: string;
  exportedBy: string;
  format: 'JSON' | 'CSV';
  classification: 'SIMULATED / PROTOTYPE DATA';
  disclaimer: string;
  sessions: ExperimentalExecutionSession[];
  runs: ExperimentalRun[];
  comparisons: ExperimentalComparisonResult[];
  summary: ExperimentalResearchSummary;
}
