// =========================================================================
// SCOS PHASE 10A — EXPERIMENTAL DATASET & RESEARCH SCENARIO REGISTRY TYPES
// Research Governance, Engineering Assumptions & Reproducibility Foundation
// =========================================================================

/**
 * Dataset Lifecycle State
 */
export type ResearchDatasetLifecycle = 'DRAFT' | 'VALIDATED' | 'FROZEN' | 'ARCHIVED';

/**
 * Research Scenario Status
 */
export type ResearchScenarioStatus = 'DRAFT' | 'VALIDATED' | 'FROZEN' | 'DEPRECATED';

/**
 * Execution Status of Research Experiment
 */
export type ResearchExecutionStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

/**
 * Reproducibility Verification Outcome
 */
export type ReproducibilityMatchStatus = 'MATCH' | 'MISMATCH' | 'NOT_FOUND';

/**
 * Experimental Condition Identifiers
 */
export type ResearchExperimentalConditionType = 'BASELINE_MANUAL' | 'SCOS_INTEGRATED';

/**
 * Source Type of Assumption / Parameter
 */
export type AssumptionParameterSource =
  | 'PROTOTYPE_ASSUMPTION'
  | 'ENGINEERING_HEURISTIC'
  | 'SPATIAL_TOPOLOGY'
  | 'HYDRAULIC_MODEL'
  | 'CALIBRATED_DEFAULT';

/**
 * Engineering Scenario Parameter Specification
 */
export interface ResearchScenarioParameter {
  parameterId: string;
  name: string;
  value: number;
  unit: string;
  defaultValue: number;
  minimum: number;
  maximum: number;
  sourceType: AssumptionParameterSource;
  engineeringJustification: string;
  applicability: string;
  classification: string;
}

/**
 * Experimental Condition Specification
 */
export interface ResearchExperimentalCondition {
  conditionType: ResearchExperimentalConditionType;
  workflowType: 'BASELINE' | 'SCOS';
  conditionName: string;
  workflowStages: string[];
  availableEvidence: string[];
  decisionSupportAvailability: boolean;
  coordinationMechanism: string;
  auditability: string;
  traceability: string;
  description: string;
}

/**
 * Research Provenance Metadata
 */
export interface ResearchProvenance {
  dataOrigin: string;
  sourceModule: string;
  sourceScenario: string;
  validationStatus: string;
  classification: string;
  isSimulatedPrototype: boolean;
  provenanceNote: string;
  createdAt: string;
  createdBy: string;
}

/**
 * Deterministic Configuration Fingerprint Structure
 */
export interface ResearchConfigurationFingerprint {
  fingerprintHash: string;
  algorithm: string;
  canonicalPayload: string;
  timestamp: string;
}

/**
 * Authoritative Research Scenario
 */
export interface ResearchScenario {
  scenarioId: string; // e.g. "SC-01"
  scenarioCode: string;
  scenarioName: string;
  scenarioCategory: string; // e.g. "Monsoonal Urban Flooding", "Water Quality Emergency"
  description: string;
  geographicScope: {
    district: string;
    ward: string;
    corridor: string;
    centerCoordinates: [number, number]; // [lat, lng]
    boundingRadiusMeters: number;
  };
  targetEntities: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  engineeringParameters: ResearchScenarioParameter[];
  baselineCondition: ResearchExperimentalCondition;
  scosCondition: ResearchExperimentalCondition;
  expectedEffects: string[];
  researchPurpose: string;
  validationCaseIds: string[]; // Link to Phase 9C (e.g. VC-01, VC-02)
  comparativeScenarioIds: string[]; // Link to Phase 9D (e.g. SC-01)
  datasetVersion: string; // e.g. "SCOS-RESEARCH-DATASET-v1.0"
  status: ResearchScenarioStatus;
  provenance: ResearchProvenance;
  classification: string;
  configurationFingerprint: string;
  isFrozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
}

/**
 * Centralized Research Engineering Assumption
 */
export interface ResearchAssumption {
  parameterId: string;
  name: string;
  value: number;
  unit: string;
  defaultValue: number;
  minimum: number;
  maximum: number;
  sourceType: AssumptionParameterSource;
  engineeringJustification: string;
  applicability: string;
  classification: string;
  disclaimer: string;
}

/**
 * Dataset Version Specification
 */
export interface ResearchDatasetVersion {
  versionId: string;
  datasetId: string;
  versionName: string;
  versionTag: string; // e.g. "v1.0"
  scenarioCount: number;
  validationCaseCount: number;
  parameterCount: number;
  status: ResearchDatasetLifecycle;
  configurationFingerprint: string;
  createdAt: string;
  createdBy: string;
  releaseNotes: string;
  isFrozen: boolean;
}

/**
 * Research Scenario Execution Record
 */
export interface ResearchScenarioExecution {
  executionId: string;
  scenarioId: string;
  scenarioCode: string;
  datasetVersion: string;
  condition: ResearchExperimentalConditionType;
  configurationFingerprint: string;
  startedAt: string;
  completedAt?: string;
  executionStatus: ResearchExecutionStatus;
  modelVersion: string;
  parameterSnapshot: Record<string, number | string>;
  resultSummary: {
    durationSeconds?: number;
    retrievalSteps?: number;
    contextCompletenessPercent?: number;
    decisionTraceabilityPercent?: number;
    notes?: string;
  };
  provenance: ResearchProvenance;
  classification: string;
  executedBy: string;
}

/**
 * Root Research Dataset Model
 */
export interface ResearchDataset {
  datasetId: string;
  datasetName: string;
  currentVersion: string;
  versions: ResearchDatasetVersion[];
  scenarios: ResearchScenario[];
  assumptions: ResearchAssumption[];
  validationCaseIds: string[];
  comparativeScenarioIds: string[];
  status: ResearchDatasetLifecycle;
  configurationFingerprint: string;
  provenance: ResearchProvenance;
  classification: string;
  disclaimer: string;
}

/**
 * Reproducibility Verification Request
 */
export interface ReproducibilityCheckRequest {
  scenarioId: string;
  datasetVersion?: string;
  condition?: ResearchExperimentalConditionType;
  configurationFingerprint: string;
  parametersOverride?: Record<string, number>;
}

/**
 * Reproducibility Verification Result
 */
export interface ReproducibilityCheckResult {
  status: ReproducibilityMatchStatus;
  scenarioId: string;
  datasetVersion: string;
  condition: ResearchExperimentalConditionType;
  inputFingerprint: string;
  computedFingerprint: string;
  isMatch: boolean;
  diffSummary?: string[];
  matchDetails: {
    scenarioCode: string;
    scenarioName: string;
    parameterCount: number;
    verifiedAt: string;
    algorithm: string;
  };
  classificationNotice: string;
}

/**
 * Research Dataset Full Export
 */
export interface ResearchDatasetExport {
  dataset: {
    datasetId: string;
    datasetName: string;
    version: string;
    status: ResearchDatasetLifecycle;
    configurationFingerprint: string;
    scenarioCount: number;
    validationCaseCount: number;
    parameterCount: number;
    createdAt: string;
    classification: string;
  };
  scenarios: ResearchScenario[];
  engineeringAssumptions: ResearchAssumption[];
  executions: ResearchScenarioExecution[];
  exportMetadata: {
    exportedAt: string;
    exportedBy: string;
    exportFormat: 'JSON' | 'CSV';
    classificationNotice: string;
    reproducibilityStandard: string;
  };
}
