// =========================================================================
// SCOS PHASE 11E.1 — RESEARCH INTEGRITY CORRECTION & THESIS FREEZE TYPES
// Formal Type System for Sample Size Provenance, External Source Verification,
// Scenario Version History, Correction Logs, and Master Thesis Freeze Manifest.
// Academic Affiliation: IIT Kanpur — Department of Civil Engineering
// =========================================================================

/**
 * 1. Observation and Sample Provenance Classification
 */
export type ObservationClassification =
  | 'CONTROLLED_COMPUTATIONAL_SIMULATION'
  | 'SYNTHETIC_BENCHMARK_OBSERVATION'
  | 'DERIVED_STATISTICAL_METRIC'
  | 'HEURISTIC_MODEL_OUTPUT';

export interface SampleProvenanceMetadata {
  humanParticipantCount: 0;
  scenarioCount: 5;
  replicationsPerScenario: 15;
  pairedReplicationCount: 75;
  conditionCount: 2; // Baseline Manual vs SCOS Integrated
  conditionExecutionCount: 150; // 75 paired replications * 2 conditions
  metricsPerConditionExecution: 10; // M1 through M10
  totalMetricObservationCount: 1500; // 150 condition executions * 10 metrics
  computationalRunCount: 75; // Deprecated alias for pairedReplicationCount
  totalObservations: 1500; // Deprecated alias for totalMetricObservationCount
  observationClassification: ObservationClassification;
  sampleDescription: string;
  thesisSafeWording: string;
  prohibitedTerms: string[];
}

/**
 * 2. External Source Verification Status
 */
export type ExternalValidationStatus =
  | 'VERIFIED_DOCUMENTARY_SOURCE'
  | 'PARTIAL_DOCUMENTARY_SUPPORT'
  | 'UNVERIFIED_EXTERNAL_REFERENCE'
  | 'ENGINEERING_ASSUMPTION'
  | 'OPERATIONAL_HEURISTIC';

export type ParameterClaimClassification =
  | 'DOCUMENTED'
  | 'PARTIALLY_DOCUMENTED'
  | 'ASSUMPTION_ONLY';

export interface ExternalSourceVerificationRecord {
  parameterId: string;
  parameterName: string;
  sourceClaim: string;
  sourceType: string;
  activeClassification: string;
  previousClassification?: string;
  citationAvailable: boolean;
  documentReference: string;
  verifiedInRepository: boolean;
  externalValidationStatus: ExternalValidationStatus;
  claimClassification: ParameterClaimClassification;
  thesisSafeDescription: string;
  calibrationRequirementNote: string;
}

/**
 * 3. Scenario Version History & Reconciliation Record
 */
export type ScenarioEvolutionStatus =
  | 'UNCHANGED'
  | 'RENAMED'
  | 'REDEFINED'
  | 'SUPERSEDED'
  | 'CANONICALIZED'
  | 'NO_HISTORICAL_VARIANT_FOUND';

export interface ScenarioVersionHistoryRecord {
  scenarioId: string; // "SC-01" to "SC-05"
  scenarioCode: string;
  currentCanonicalDefinition: {
    title: string;
    incidentType: string;
    location: string;
    primaryAssets: string[];
    departments: string[];
    precipitationRate?: string;
  };
  historicalDefinitionIfAny: {
    phase: string;
    title: string;
    notes: string;
  };
  firstIntroducedPhase: string;
  canonicalizedPhase: string;
  status: ScenarioEvolutionStatus;
  mappingNote: string;
  fingerprint: string;
  thesisUsageStatus: 'CANONICAL_THESIS_BENCHMARK' | 'SUPERSEDED_DEVELOPMENT_VARIANT';
}

/**
 * 4. Civil Engineering & AI Engine Model Classifications
 */
export type CivilEngineeringModelClassification =
  | 'IMPLEMENTED_PHYSICAL_MODEL'
  | 'ENGINEERING_HEURISTIC'
  | 'RULE_BASED_OPERATIONAL_MODEL'
  | 'CONCEPTUAL_RELATIONSHIP'
  | 'DOCUMENTATION_ONLY';

export interface CivilEngineeringModelRecord {
  mechanismId: string;
  mechanismName: string;
  classification: CivilEngineeringModelClassification;
  underlyingFormula: string;
  implementedCodeLocation: string;
  governingParameters: string[];
  calibrationStatus: string;
  thesisSafeWording: string;
}

export type AIEngineClassification =
  | 'DETERMINISTIC_GRAPH_TRAVERSAL'
  | 'MULTI_CRITERIA_RISK_SCORING'
  | 'RULE_BASED_SOP_SYNTHESIS'
  | 'RULE_BASED_PRIORITY_TRIAGE'
  | 'OPTIONAL_LLM_ASSISTED_SYNTHESIS';

export interface AIEngineComponentRecord {
  componentId: string;
  marketingOrPreviousTerm: string;
  normalizedThesisTerm: string;
  classification: AIEngineClassification;
  isMachineLearning: false;
  isGenerativeLLM: boolean;
  governingMechanism: string;
  thesisSafeDescription: string;
}

/**
 * 5. Correction Log Item
 */
export interface ThesisCorrectionLogItem {
  correctionId: string; // e.g. "CORR-LOG-01"
  date: string;
  affectedArtifact: string;
  affectedPhase: string;
  category:
    | 'SAMPLE_SIZE_TERMINOLOGY'
    | 'PARAMETER_PROVENANCE'
    | 'EXTERNAL_SOURCE_STATUS'
    | 'KANPUR_CALIBRATION_WORDING'
    | 'SCENARIO_VERSION_HISTORY'
    | 'DIGITAL_TWIN_CLASSIFICATION'
    | 'CIVIL_ENGINEERING_MODEL'
    | 'AI_TERMINOLOGY'
    | 'BASELINE_DATA_DISCLOSURE'
    | 'RESULTS_LANGUAGE'
    | 'HYPOTHESIS_WORDING'
    | 'CONTRIBUTION_WORDING';
  oldWordingOrMetadata: string;
  newWordingOrMetadata: string;
  reason: string;
  numericalResultsChanged: false;
  historicalEvidenceModified: false;
}

/**
 * 6. Thesis Freeze Manifest (SCOS-THESIS-FREEZE-v1.0)
 */
export interface ThesisFreezeManifest {
  manifestId: string; // "SCOS-THESIS-FREEZE-v1.0"
  manifestVersion: string; // "v1.0-FROZEN"
  freezeDate: string;
  academicAffiliation: {
    institution: string;
    department: string;
    center: string;
    degreeProgram: string;
    thesisTitle: string;
  };
  canonicalResearchDatasetVersion: string; // "SCOS-RESEARCH-DATASET-v1.1"
  canonicalScenarioRegistryVersion: string; // "SCOS-SCENARIO-REGISTRY-v1.1"
  architectureVersion: string; // "SCOS-ARCH-v1.0"
  metricRegistryVersion: string; // "SCOS-METRIC-M1-M10-v1.0"
  hypothesisRegistryVersion: string; // "SCOS-HYPOTHESIS-H01-H05-v1.0"
  claimRegistryVersion: string; // "SCOS-CLAIMS-v1.0"
  thesisEvidenceVersion: string; // "SCOS-THESIS-EVIDENCE-v1.0"
  researchDemoVersion: string; // "SCOS-RESEARCH-DEMO-v1.0"
  sampleProvenance: SampleProvenanceMetadata;
  fieldValidationStatus: 'NOT_ESTABLISHED';
  statisticalBoundary: 'DESCRIPTIVE_ONLY';
  digitalTwinClassification: 'PROTOTYPE_DIGITAL_TWIN';
  aiEngineClassification: 'DETERMINISTIC_GRAPH_AND_RULE_BASED';
  baselineClassification: 'SYNTHETIC_PARAMETERIZED_BENCHMARK';
  universalThesisSafeDisclosure: string;
  externalSourceVerificationSummary: {
    totalAuditedParameters: number;
    verifiedDocumentarySources: number;
    partialDocumentarySupport: number;
    unverifiedExternalReferences: number;
    engineeringAssumptions: number;
    operationalHeuristics: number;
  };
  totalSensitivityParameterCount: 12;
  primaryEngineeringParameterCount: 8;
  scenarioVersionHistory: ScenarioVersionHistoryRecord[];
  civilEngineeringModels: CivilEngineeringModelRecord[];
  aiEngineComponents: AIEngineComponentRecord[];
  correctionLog: ThesisCorrectionLogItem[];
  knownLimitationsSummary: string[];
  sourceFingerprints: {
    datasetFingerprint: string;
    scenarioFingerprint: string;
    metricsFingerprint: string;
    statisticalFingerprint: string;
    claimsFingerprint: string;
    evidenceFingerprint: string;
    demoFingerprint: string;
  };
  masterFreezeFingerprint: string;
  fingerprintAlgorithm: string;
  isImmutableFrozen: true;
}
