// =========================================================================
// SCOS PHASE 9D — COMPARATIVE DECISION-SUPPORT EVALUATION TYPE SYSTEM
// Controlled Research Evaluation: Baseline Manual vs SCOS Integrated Operations
// =========================================================================

import { WorkflowType, EvaluationResult, ContextElementStatus, DecisionSupportCheckitem } from './evaluation';

/**
 * Result Validity Classification
 */
export type ResultValidityClassification =
  | 'VALID DESCRIPTIVE RESULT'
  | 'PARTIALLY VALID'
  | 'NOT COMPARABLE'
  | 'INSUFFICIENT DATA';

/**
 * Potential Learning / Order Effect Risk
 */
export type OrderEffectRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

/**
 * Evaluation Execution Order
 */
export type EvaluationOrder =
  | 'BASELINE_THEN_SCOS'
  | 'SCOS_THEN_BASELINE'
  | 'COUNTERBALANCED';

/**
 * 10 Primary Evaluation Metric Keys
 */
export type ComparativeMetricKey =
  | 'WORKFLOW_DURATION'
  | 'INFORMATION_RETRIEVAL'
  | 'CONTEXT_COMPLETENESS'
  | 'COORDINATION_OVERHEAD'
  | 'INFRASTRUCTURE_AWARENESS'
  | 'CASCADE_IDENTIFICATION'
  | 'CRITICAL_FACILITY_AWARENESS'
  | 'DECISION_SUPPORT_COMPLETENESS'
  | 'AUDIT_COMPLETENESS'
  | 'DECISION_TRACEABILITY';

/**
 * Scenario Specification for Comparative Evaluation
 */
export interface ComparativeEvaluationScenario {
  scenarioId: string; // e.g. "SC-01", "SC-02"
  code: string;
  name: string;
  category: 'HYDROLOGIC' | 'MECHANICAL' | 'DRAINAGE' | 'COMPOUND' | 'HEALTHCARE_ACCESS';
  description: string;
  targetEntityId: string;
  targetEntityName: string;
  targetEntityType: string;
  expectedCascadeNodes: string[];
  expectedDepartments: string[];
  expectedCriticalFacilities: string[];
  baselineWorkflowAssumptions: string[];
  scosWorkflowAssumptions: string[];
  isSimulatedPrototype: boolean;
  classificationNotice: string;
}

/**
 * Individual Comparative Metric Result
 */
export interface ComparativeMetric {
  key: ComparativeMetricKey;
  displayName: string;
  unit: string;
  baselineValue: number | string;
  scosValue: number | string;
  absoluteDifference: number | string;
  relativeChangePercent: number | null; // e.g. -45% for duration or +75% for completeness
  interpretation: string;
  validityClassification: ResultValidityClassification;
  rationaleAndLimitations: string;
}

/**
 * Legacy Metric Aliases for Explicit Type Compliance
 */
export interface BaselineMetric {
  key: ComparativeMetricKey;
  value: number | string;
  unit: string;
  source: string;
}

export interface ScosMetric {
  key: ComparativeMetricKey;
  value: number | string;
  unit: string;
  source: string;
}

export interface MetricDifference {
  key: ComparativeMetricKey;
  absoluteDiff: number | string;
  relativeDiffPercent: number | null;
  direction: 'IMPROVEMENT' | 'REGRESSION' | 'NEUTRAL' | 'NOT_COMPARABLE';
}

export interface RelativeChange {
  metricKey: ComparativeMetricKey;
  percent: number;
  isDescriptiveOnly: boolean;
}

export interface EvaluationLimitations {
  orderEffectNotice: string;
  sampleSizeLimitation: string;
  simulatedEnvironmentNotice: string;
  observationalModelBoundary: string;
}

/**
 * Detailed Infrastructure Awareness Breakdown
 */
export interface InfrastructureAwarenessDetails {
  identifiedAssets: string[];
  requiredAssets: string[];
  awarenessPercentage: number;
  unidentifiedAssets: string[];
}

/**
 * Detailed Cascade Identification Breakdown
 */
export interface CascadeIdentificationDetails {
  expectedCascadeNodes: string[];
  workflowIdentifiedNodes: string[];
  completenessPercentage: number;
  disclaimer: string; // "Prototype cascade-structure identification completeness."
}

/**
 * Detailed Critical Facility Awareness Breakdown
 */
export interface CriticalFacilityAwarenessDetails {
  facilitiesIdentified: string[];
  phrasingClassification: 'POTENTIAL_ACCESS_DISRUPTION' | 'FACILITY_DAMAGED';
  statusDescription: string;
  auxiliaryPowerIdentified: boolean;
}

/**
 * Decision Traceability Step Node
 */
export interface DecisionTraceabilityDetails {
  traceChain: Array<{
    stepNumber: number;
    nodeType:
      | 'INCIDENT'
      | 'EVIDENCE'
      | 'RISK'
      | 'INFRASTRUCTURE'
      | 'CASCADE'
      | 'DEPARTMENT'
      | 'RECOMMENDATION'
      | 'HUMAN_DECISION'
      | 'TASK'
      | 'AUDIT';
    entityRef: string;
    verified: boolean;
    timestamp?: string;
  }>;
  traceabilityPercentage: number;
  unbrokenChain: boolean;
}

/**
 * Complete Comparative Evaluation Record for a (Participant + Scenario) Pair
 */
export interface ComparativeEvaluationRecord {
  evaluationId: string;
  participantId: string; // e.g. "P01" (Anonymized)
  scenarioId: string; // e.g. "SC-01"
  scenarioName: string;
  evaluationOrder: EvaluationOrder;
  orderEffectRisk: OrderEffectRisk;
  orderEffectNotice: string;
  baselineResult: EvaluationResult;
  scosResult: EvaluationResult;
  metrics: ComparativeMetric[];
  infrastructureAwareness: InfrastructureAwarenessDetails;
  cascadeIdentification: CascadeIdentificationDetails;
  criticalFacilityAwareness: CriticalFacilityAwarenessDetails;
  decisionTraceability: DecisionTraceabilityDetails;
  executedAt: string;
  provenance: {
    engineVersion: string;
    dataClassification: 'SIMULATED / PROTOTYPE DATA';
    evaluatedBy: string;
    sessionIdBaseline: string;
    sessionIdScos: string;
  };
}

/**
 * Aggregated Descriptive Analysis across all completed participant pairs
 */
export interface AggregateDescriptiveAnalysis {
  totalParticipantPairs: number;
  hasSufficientData: boolean;
  sampleSizeNotice: string;
  metricAggregates: Array<{
    key: ComparativeMetricKey;
    displayName: string;
    unit: string;
    baselineMean: number | null;
    scosMean: number | null;
    baselineMedian: number | null;
    scosMedian: number | null;
    meanAbsoluteDifference: number | null;
    meanRelativeChangePercent: number | null;
    validityClassification: ResultValidityClassification;
  }>;
  limitations: string[];
}

/**
 * Comprehensive Comparative Evaluation Report
 */
export interface ComparativeEvaluationReport {
  reportId: string;
  researchQuestion: string;
  secondaryQuestions: Array<{
    rq: string;
    question: string;
    findings: string;
    status: 'OBSERVED_PROTOTYPE_REDUCTION' | 'OBSERVED_PROTOTYPE_IMPROVEMENT' | 'INSUFFICIENT_DATA';
  }>;
  experimentalDesign: string;
  scenariosEvaluated: string[];
  records: ComparativeEvaluationRecord[];
  aggregateAnalysis: AggregateDescriptiveAnalysis;
  statisticalCautionNotice: string;
  researchLimitations: string[];
  classification: 'SIMULATED / PROTOTYPE DATA';
  generatedAt: string;
}
