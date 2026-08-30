// =========================================================================
// SCOS PHASE 11C — THESIS EVIDENCE & ACADEMIC REPRODUCIBILITY TYPE SYSTEM
// Formal Models for Thesis Evidence Package, Chapter Mappings, Figure/Table
// Registries, Reproducibility Manifests, and Evidence Boundaries.
// =========================================================================

import {
  HypothesisId,
  EvidenceLevelCode,
  ClaimStatusCode,
  EvidenceStrengthBand,
} from './researchClaims';
import { ResearchQuestionId, BenchmarkScenarioId } from './researchEvidence';
import { ExperimentalMetricKey } from './experimentalExecution';

export type ThesisContributionType =
  | 'ARCHITECTURAL'
  | 'CIVIL_ENGINEERING'
  | 'COMPUTATIONAL'
  | 'OPERATIONAL_DECISION_SUPPORT'
  | 'GOVERNANCE'
  | 'METHODOLOGICAL'
  | 'REPRODUCIBILITY'
  | 'EVALUATION';

export type ThesisEvidenceMaturity =
  | 'PROTOTYPE_COMPUTATIONAL'
  | 'CONTROLLED_SCENARIO_SUPPORTED'
  | 'DESCRIPTIVELY_SUPPORTED'
  | 'FIELD_VALIDATION_NOT_ESTABLISHED';

/**
 * 1. Master RQ -> H -> M -> SC -> Claim Matrix Record
 */
export interface ThesisEvidenceRecord {
  recordId: string;
  researchQuestionId: ResearchQuestionId;
  researchQuestionTitle: string;
  hypothesisId: HypothesisId;
  hypothesisStatement: string;
  relevantMetricCodes: string[];
  relevantMetricKeys: ExperimentalMetricKey[];
  relevantScenarios: BenchmarkScenarioId[];
  relevantValidationCases: string[];
  observedEvidenceSummary: string;
  baselineObservation: {
    mean: number;
    stdDev: number;
    median: number;
    iqr: number;
    n: number;
  };
  scosObservation: {
    mean: number;
    stdDev: number;
    median: number;
    iqr: number;
    n: number;
  };
  absoluteDifference: number;
  relativeChangePercent: number;
  statisticalDescription: string;
  sensitivityStatus: 'ROBUST_STABLE' | 'MODERATELY_SENSITIVE' | 'HIGHLY_SENSITIVE';
  robustnessStatus: 'HIGHLY_ROBUST' | 'MODERATELY_ROBUST' | 'SENSITIVE_ASSUMPTION_DEPENDENT';
  evidenceLevel: EvidenceLevelCode;
  finalClaimStatus: ClaimStatusCode;
  permittedAcademicStatement: string;
  primaryLimitation: string;
  futureValidationRequirement: string;
}

/**
 * 2. Thesis Hypothesis Summary Record (H01 to H05)
 */
export interface ThesisHypothesisSummary {
  hypothesisId: HypothesisId;
  researchQuestionId: ResearchQuestionId;
  title: string;
  hypothesisStatement: string;
  formalHypothesis: string;
  nullHypothesis: string;
  primaryMetrics: string[];
  scenarioCoverage: string[];
  validationCases: string[];
  evidenceStatus: ClaimStatusCode;
  evidenceLevel: EvidenceLevelCode;
  evidenceStrengthScore: number;
  evidenceStrengthBand: EvidenceStrengthBand;
  robustness: string;
  allowedConclusion: string;
  keyLimitation: string;
  fieldValidationStatus: 'NOT_ESTABLISHED';
  reproducibilityHash: string;
}

/**
 * 3. Thesis Research Question Summary
 */
export interface ThesisResearchQuestionSummary {
  researchQuestionId: ResearchQuestionId;
  title: string;
  questionText: string;
  primaryHypothesis: HypothesisId;
  evaluationMetrics: string[];
  scenariosTested: string[];
  evidenceLevel: EvidenceLevelCode;
  thesisChapter: number;
  status: 'SUPPORTED_DESCRIPTIVELY' | 'REQUIRES_FURTHER_EXPERIMENTATION' | 'UNAVAILABLE';
}

/**
 * 4. Thesis Metric Evidence Record
 */
export interface ThesisMetricEvidence {
  metricCode: string;
  metricKey: ExperimentalMetricKey;
  name: string;
  unit: string;
  mappedHypotheses: HypothesisId[];
  baselineMean: number;
  baselineStdDev: number;
  scosMean: number;
  scosStdDev: number;
  percentageImprovement: number;
  descriptiveInterpretation: string;
  tier: 'TIER_1_PRIMARY' | 'TIER_2_CORROBORATING';
}

/**
 * 5. Thesis Scenario Evidence Record
 */
export interface ThesisScenarioEvidence {
  scenarioId: BenchmarkScenarioId;
  name: string;
  districtLocation: string;
  triggerEvent: string;
  departmentsInvolved: string[];
  infrastructureImpacted: string[];
  keyObservation: string;
}

/**
 * 6. Thesis Chapter Mapping
 */
export interface ThesisChapterArtifactMapping {
  artifactId: string;
  artifactType: 'RQ' | 'HYPOTHESIS' | 'FIGURE' | 'TABLE' | 'COMPONENT' | 'DATASET' | 'EVIDENCE';
  title: string;
  sourcePhase: string;
  referencePath?: string;
}

export interface ThesisChapterMapping {
  chapterNumber: number;
  chapterTitle: string;
  academicPurpose: string;
  mappedPhases: string[];
  includedTopics: string[];
  associatedRQs: ResearchQuestionId[];
  associatedHypotheses: HypothesisId[];
  artifacts: ThesisChapterArtifactMapping[];
  limitationsAddressed: string[];
  methodologicalNotes: string;
}

/**
 * 7. Thesis Figure Registry Item
 */
export interface ThesisFigureRegistryItem {
  figureId: string;
  figureNumber: string; // e.g. "Figure 4.1"
  proposedTitle: string;
  sourcePhase: string;
  sourceComponent: string;
  researchPurpose: string;
  chapterMapping: number; // e.g. 4
  dataClassification: 'CONTROLLED_SIMULATION' | 'ARCHITECTURE_SCHEMATIC' | 'STATISTICAL_DISTRIBUTION' | 'TOPOLOGICAL_GRAPH';
  reproducibilityStatus: 'DETERMINISTIC_REPRODUCIBLE' | 'STATIC_ARCHITECTURAL';
  recommendedCaption: string;
  sourceEndpoint?: string;
}

/**
 * 8. Thesis Table Registry Item
 */
export interface ThesisTableRegistryItem {
  tableId: string;
  tableNumber: string; // e.g. "Table 7.2"
  proposedTitle: string;
  sourcePhase: string;
  sourceService: string;
  researchPurpose: string;
  chapterMapping: number;
  dataClassification: 'EXPERIMENTAL_METRICS' | 'STATISTICAL_SUMMARY' | 'HYPOTHESIS_MAPPING' | 'SENSITIVITY_SWEEP';
  reproducibilityStatus: 'DETERMINISTIC_REPRODUCIBLE' | 'STATIC_STRUCTURED';
  recommendedCaption: string;
  rowCount: number;
  columnHeaders: string[];
}

/**
 * 9. Thesis Contribution Registry Item
 */
export interface ThesisContributionRecord {
  contributionId: string;
  contributionType: ThesisContributionType;
  title: string;
  statement: string;
  supportingComponents: string[];
  supportingPhases: string[];
  supportingEvidence: string;
  evidenceLevel: EvidenceLevelCode;
  claimStatus: ClaimStatusCode;
  limitation: string;
  futureValidation: string;
  conservativePhrasing: string;
}

/**
 * 10. Thesis Limitation Record
 */
export interface ThesisLimitationRecord {
  limitationId: string;
  category: 'SIMULATION_ENVIRONMENT' | 'SAMPLE_SIZE' | 'HEURISTIC_PARAMETERS' | 'HUMAN_FACTORS' | 'PHYSICAL_GROUNDING' | 'REGULATORY_STATUTORY';
  title: string;
  description: string;
  impactedHypotheses: HypothesisId[];
  impactedMetrics: string[];
  mitigationStrategy: string;
  academicDisclosureStatement: string;
}

/**
 * 11. What SCOS Supports / What Current Evidence Does NOT Establish
 */
export interface EvidenceBoundarySection {
  supportedAspects: Array<{
    category: string;
    statement: string;
    evidenceLevel: EvidenceLevelCode;
    supportingPhases: string[];
  }>;
  unestablishedAspects: Array<{
    category: string;
    statement: string;
    validationRequirement: string;
    fieldStatus: 'NOT_ESTABLISHED';
  }>;
  governanceDeclaration: string;
}

/**
 * 12. Thesis Reproducibility Manifest
 */
export interface ThesisReproducibilityManifest {
  manifestId: string;
  thesisPackageVersion: string;
  researchDatasetVersion: string;
  scenarioRegistryVersion: string;
  modelVersion: string;
  metricDefinitionVersion: string;
  statisticalAnalysisVersion: string;
  researchEvidenceVersion: string;
  researchClaimsVersion: string;
  includedScenarioIds: string[];
  includedValidationCaseIds: string[];
  includedMetricIds: string[];
  includedHypothesisIds: string[];
  sourceExecutionIds: string[];
  canonicalFingerprints: {
    datasetFingerprint: string;
    statisticalFingerprint: string;
    validationFingerprint: string;
    claimsFingerprint: string;
    packageFingerprint: string;
  };
  fingerprintAlgorithm: string;
  reproducibilityProtocolSteps: string[];
  generatedAt: string;
}

/**
 * 13. Thesis Dataset Manifest
 */
export interface ThesisDatasetManifest {
  datasetId: string;
  datasetName: string;
  datasetVersion: string;
  isFrozen: boolean;
  classification: string;
  scenarioCount: number;
  validationCaseCount: number;
  experimentalRunCount: number;
  metricCount: number;
  hypothesisCount: number;
  storageFormat: string;
  spatialResolution: string;
  temporalCoverage: string;
  dataSources: Array<{
    sourceName: string;
    department: string;
    modality: string;
    recordCount: number;
  }>;
  datasetFingerprint: string;
  provenance: {
    institution: string;
    center: string;
    curator: string;
    frozenDate: string;
  };
}

/**
 * 14. Thesis Evidence Provenance
 */
export interface ThesisEvidenceProvenance {
  academicAffiliation: {
    institution: string;
    department: string;
    center: string;
    degreeProgram: string;
    thesisTitle: string;
  };
  datasetVersion: string;
  packageVersion: string;
  phaseConsolidatedSources: string[];
  generatedTimestamp: string;
  license: string;
  auditTrailReference: string;
}

/**
 * 15. Professor / Examiner Research Summary
 */
export interface ProfessorExaminerSummary {
  researchProblem: string;
  proposedContribution: string;
  methodology: string;
  whatWasTested: string;
  whatWasObserved: string;
  whatIsSupported: string;
  whatIsNotYetValidated: string;
  examinationReadinessNotes: string;
}

/**
 * 16. Complete Master Thesis Evidence Package
 */
export interface ThesisEvidencePackage {
  packageId: string;
  packageVersion: string;
  datasetVersion: string;
  frameworkVersion: string;
  generatedAt: string;
  classification: string;
  disclaimer: string;
  evidenceStrengthDisclaimer: string;
  realWorldValidationNotice: string;
  executiveSummary: {
    researchQuestionCount: number;
    hypothesisCount: number;
    metricCount: number;
    scenarioCount: number;
    validationCaseCount: number;
    datasetVersion: string;
    evidenceMaturity: ThesisEvidenceMaturity;
    highestEvidenceLevel: EvidenceLevelCode;
    fieldValidationStatus: 'NOT_ESTABLISHED';
  };
  professorExaminerSummary: ProfessorExaminerSummary;
  masterMatrix: ThesisEvidenceRecord[];
  hypothesesSummary: ThesisHypothesisSummary[];
  researchQuestions: ThesisResearchQuestionSummary[];
  metricsEvidence: ThesisMetricEvidence[];
  scenariosEvidence: ThesisScenarioEvidence[];
  chapterMappings: ThesisChapterMapping[];
  figureRegistry: ThesisFigureRegistryItem[];
  tableRegistry: ThesisTableRegistryItem[];
  contributions: ThesisContributionRecord[];
  limitations: ThesisLimitationRecord[];
  evidenceBoundaries: EvidenceBoundarySection;
  reproducibilityManifest: ThesisReproducibilityManifest;
  datasetManifest: ThesisDatasetManifest;
  provenance: ThesisEvidenceProvenance;
  packageFingerprint: string;
  fingerprintAlgorithm: string;
  fingerprintVerified: boolean;
}

/**
 * 17. Thesis Export Manifest
 */
export interface ThesisExportManifest {
  exportId: string;
  packageVersion: string;
  format: 'JSON' | 'CSV' | 'MARKDOWN';
  exportedAt: string;
  exportedBy: string;
  packageFingerprint: string;
  checksum: string;
  content: string;
}
