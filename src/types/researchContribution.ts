// =========================================================================
// SCOS PHASE 10E — RESEARCH CONTRIBUTION & REFERENCE ARCHITECTURE TYPES
// Formal Definitions for SCOS Research Framework, Architecture Layers,
// Civil Engineering Integration, RQ-Metric Traceability, Threats to Validity,
// and Evidence Strength Classifications.
// =========================================================================

import { ResearchQuestionId, BenchmarkScenarioId } from './researchEvidence';

/**
 * Bounded Evidence Strength Levels (PART 9)
 * Strict hierarchical taxonomy from technical verification to empirical reality.
 */
export type EvidenceLevel =
  | 'LEVEL_A_IMPLEMENTATION_VERIFIED'
  | 'LEVEL_B_COMPUTATIONALLY_VERIFIED'
  | 'LEVEL_C_CONTROLLED_PROTOTYPE_EVIDENCE'
  | 'LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE'
  | 'LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION';

export interface EvidenceLevelDefinition {
  level: EvidenceLevel;
  code: string;
  name: string;
  title?: string;
  description: string;
  criteria?: string;
  verificationStandard?: string;
  applicableInPrototype: boolean;
  assignedCount: number;
}

/**
 * Architectural Layer Classification (PART 3)
 */
export type ArchitecturalLayerId =
  | 'LAYER_1_DATA_FOUNDATION'
  | 'LAYER_2_SPATIAL_CIVIL_INFRASTRUCTURE'
  | 'LAYER_3_URBAN_OPERATIONAL_CONTEXT'
  | 'LAYER_4_MULTI_DEPARTMENT_COORDINATION'
  | 'LAYER_5_SITUATIONAL_AWARENESS_DECISION_SUPPORT'
  | 'LAYER_6_URBAN_DIGITAL_TWIN'
  | 'LAYER_7_SCENARIO_SIMULATION'
  | 'LAYER_8_RESEARCH_VALIDATION'
  | 'LAYER_9_GOVERNANCE_SECURITY';

export interface ArchitecturalComponentItem {
  id: string;
  name: string;
  purpose: string;
  relatedPhase: string;
  sourceFiles: string[];
  primaryEndpoints: string[];
  evidenceLevel: EvidenceLevel;
  limitations: string[];
  interfaces?: string[];
  civilEngModels?: string[];
}

export type SCOSComponentDefinition = ArchitecturalComponentItem;

export interface SCOSArchitecturalLayer {
  layerId: ArchitecturalLayerId;
  layerNumber: number;
  name: string;
  tagline: string;
  description: string;
  relatedPhases: string[];
  components: ArchitecturalComponentItem[];
  researchContributionSummary: string;
  evidenceLevel: EvidenceLevel;
  dataProvenanceMechanisms: string[];
  layerLimitations: string[];
}

/**
 * Research Gap -> SCOS Response Matrix (PART 4)
 */
export interface ResearchGapMappingItem {
  gapId: string;
  gapCategory: string;
  dimension?: string;
  gapDescription: string;
  literatureLimitation?: string;
  scosArchitecturalResponse: string;
  existingPhase: string;
  existingComponent: string;
  evidenceSource: string;
  evaluationMetric: string;
  researchQuestionId: ResearchQuestionId;
  evidenceLevel: EvidenceLevel;
  evidenceStrengthRationale: string;
  boundedScopeAffirmation: string;
}

/**
 * RQ -> Metric -> Scenario -> Evidence Traceability (PART 5)
 */
export interface ResearchQuestionTraceability {
  rqId: ResearchQuestionId;
  title: string;
  formalQuestion?: string;
  questionText?: string;
  hypothesisExpectation: string;
  linkedMetrics: string[];
  linkedScenarios: BenchmarkScenarioId[];
  phase10BExecutionEvidenceSummary: string;
  phase10CStatisticalEvidenceSummary: string;
  phase10DEvidenceSynthesisSummary: string;
  evidenceLevel: EvidenceLevel;
  evidenceStrengthRationale: string;
  boundedLimitations: string[];
  status: 'SUPPORTED_DESCRIPTIVELY' | 'REQUIRES_FURTHER_EXPERIMENTATION' | 'NOT_AVAILABLE';
}

/**
 * Civil Engineering Contribution Framework (PART 6)
 */
export type CivilEngineeringDomainKey =
  | 'URBAN_DRAINAGE_SYSTEMS'
  | 'WATERLOGGING_INUNDATION'
  | 'ROAD_TRANSPORTATION_INFRASTRUCTURE'
  | 'CRITICAL_FACILITY_ACCESSIBILITY'
  | 'DEWATERING_INFRASTRUCTURE'
  | 'WATER_SUPPLY_INFRASTRUCTURE'
  | 'ELECTRICAL_INFRASTRUCTURE_DEPENDENCIES'
  | 'SPATIAL_INFRASTRUCTURE_RELATIONSHIPS'
  | 'INFRASTRUCTURE_CRITICALITY'
  | 'INFRASTRUCTURE_CASCADE_IMPACTS'
  | 'URBAN_RESILIENCE_CONTINUITY';

export type CivilEngineeringMaturityStatus =
  | 'CONCEPTUAL'
  | 'PROTOTYPE_COMPUTATIONAL'
  | 'EMPIRICALLY_CALIBRATED'
  | 'REAL_WORLD_VALIDATED';

export interface CivilEngineeringDomainContribution {
  domainKey: CivilEngineeringDomainKey;
  domainName: string;
  name?: string;
  description?: string;
  scosRepresentation: string;
  computationalTreatment: string;
  computationalRepresentation?: string;
  operationalRelevance: string;
  civilRelevance?: string;
  researchRelevance: string;
  governingEquations?: string[];
  keyParameters?: string[];
  validationCases?: string[];
  existingImplementation: {
    phase: string;
    components: string[];
    models: string[];
  };
  maturityStatus: CivilEngineeringMaturityStatus;
  evidenceLevel: EvidenceLevel;
  keyAssumptions: string[];
  boundedLimitations: string[];
}

export type CivilEngineeringDomainItem = CivilEngineeringDomainContribution;

export interface CivilEngineeringContributionFramework {
  frameworkTitle: string;
  overview: string;
  domains: CivilEngineeringDomainContribution[];
  governanceDisclaimer: string;
}

/**
 * Research Contribution Category Item (PART 7)
 */
export type ResearchContributionCategoryKey =
  | 'ARCHITECTURAL_CONTRIBUTION'
  | 'CIVIL_ENGINEERING_INTEGRATION'
  | 'COMPUTATIONAL_MODELLING'
  | 'OPERATIONAL_DECISION_SUPPORT'
  | 'GOVERNANCE_HUMAN_IN_THE_LOOP'
  | 'RESEARCH_METHODOLOGY'
  | 'REPRODUCIBILITY_FRAMEWORK';

export interface ResearchContributionItem {
  id: string;
  category: ResearchContributionCategoryKey;
  categoryName: string;
  title: string;
  contributionStatement: string;
  supportingComponents: string[];
  implementationPhase: string;
  evidenceSource: string;
  evidenceLevel: EvidenceLevel;
  primaryLimitations: string[];
  conservativePhrasing: string;
}

/**
 * Threats to Validity Registry (PART 8)
 */
export type ThreatToValidityCategory =
  | 'INTERNAL_VALIDITY'
  | 'CONSTRUCT_VALIDITY'
  | 'STATISTICAL_CONCLUSION_VALIDITY'
  | 'EXTERNAL_VALIDITY'
  | 'ECOLOGICAL_VALIDITY'
  | 'MEASUREMENT_VALIDITY'
  | 'MODEL_VALIDITY'
  | 'DATA_VALIDITY'
  | 'CALIBRATION_VALIDITY'
  | 'GENERALIZABILITY'
  | 'OPERATOR_LEARNING_EFFECTS'
  | 'SIMULATION_REALISM'
  | 'PROTOTYPE_DATA_LIMITATIONS'
  | 'ENGINEERING_PARAMETER_UNCERTAINTY';

export interface ThreatToValidityItem {
  threatId: string;
  category: ThreatToValidityCategory;
  categoryTitle: string;
  threatTitle: string;
  academicDimension?: string;
  threatDescription: string;
  description?: string;
  affectedComponents: string[];
  potentialConsequence: string;
  mitigationAlreadyImplemented: string;
  remainingLimitation: string;
  futureResearchRequirement: string;
}

/**
 * Evidence Strength Summary (PART 9)
 */
export interface EvidenceStrengthSummary {
  overallClassification: string;
  levelsSummary: EvidenceLevelDefinition[];
  distributionCount: Record<EvidenceLevel, number>;
  levelEAssigned: boolean;
  levelEExplanation: string;
}

/**
 * Provenance & Fingerprint Model (PART 16)
 */
export interface FrameworkProvenance {
  sourcePhase: string;
  sourceComponent: string;
  sourceType: string;
  evidenceLevel: EvidenceLevel;
  generatedAt: string;
  datasetVersion: string;
  classification: string;
  canonicalHash: string;
}

/**
 * Research Blueprint Flow (PART 12)
 */
export interface ResearchBlueprintStep {
  stepNumber: number;
  stageName: string;
  name?: string;
  title: string;
  relatedPhase?: string;
  description: string;
  inputData?: string;
  outputArtifact?: string;
  outputSummary: string;
  computationalKernel?: string;
  mappedArtifacts: string[];
  evidenceLevel: EvidenceLevel;
}

export interface ResearchBlueprintFlow {
  title: string;
  description: string;
  steps: ResearchBlueprintStep[];
  lineageHash: string;
}

/**
 * Top-Level Research Contribution Framework (PART 2)
 */
export interface ResearchContributionFramework {
  frameworkId: string;
  frameworkVersion: string;
  title: string;
  institutionContext: string;
  researchProblem: string;
  researchGap: string;
  researchObjective: string;
  academicAffiliation: {
    institution: string;
    department: string;
    degree: string;
    supervisor: string;
    academicFocus: string;
  };
  researchQuestions: Record<ResearchQuestionId, ResearchQuestionTraceability>;
  architecturalLayers: SCOSArchitecturalLayer[];
  researchGapMatrix: ResearchGapMappingItem[];
  civilEngineeringContribution: CivilEngineeringContributionFramework;
  contributions: ResearchContributionItem[];
  threatsToValidity: ThreatToValidityItem[];
  evidenceStrength: EvidenceStrengthSummary;
  researchBlueprint?: ResearchBlueprintFlow;
  researchBlueprintFlow: ResearchBlueprintFlow;
  provenance: FrameworkProvenance;
  governanceClassification: {
    noticeText: string;
    disclaimer: string;
    boundedScopeAffirmation: boolean;
    academicContextAffirmation: string;
  };
}
