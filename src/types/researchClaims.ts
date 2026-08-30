// =========================================================================
// SCOS PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION TYPE SYSTEM
// Formal Models for Hypotheses, Claims, Evidence Chains, Metric Matrices,
// Claim Language Safety, and Reproducibility Provenance
// =========================================================================

import { ResearchQuestionId } from './researchEvidence';
import { ExperimentalMetricKey } from './experimentalExecution';

export type HypothesisId = 'H01' | 'H02' | 'H03' | 'H04' | 'H05';

export type EvidenceLevelCode =
  | 'LEVEL_A_IMPLEMENTATION_VERIFIED'
  | 'LEVEL_B_COMPUTATIONALLY_VERIFIED'
  | 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED'
  | 'LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE'
  | 'LEVEL_E_REAL_WORLD_FIELD_VALIDATION_NOT_ESTABLISHED';

export type ClaimStatusCode =
  | 'IMPLEMENTATION_VERIFIED'
  | 'COMPUTATIONALLY_VERIFIED'
  | 'CONTROLLED_SCENARIO_SUPPORTED'
  | 'DESCRIPTIVELY_SUPPORTED'
  | 'ROBUST_UNDER_TESTED_ASSUMPTIONS'
  | 'ASSUMPTION_DEPENDENT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'REAL_WORLD_VALIDATION_NOT_ESTABLISHED';

export type ClaimLanguageSafetyClassification = 'SAFE' | 'BOUNDED' | 'OVERCLAIMED';

export type EvidenceStrengthBand =
  | 'VERY_WEAK' // 0-24
  | 'LIMITED' // 25-49
  | 'MODERATE' // 50-69
  | 'STRONG_WITHIN_TESTED_SCOPE' // 70-84
  | 'STRONG_WITHIN_TESTED_SCOPE_AND_ASSUMPTIONS'; // 85-100

/**
 * Formal Research Hypothesis Specification
 */
export interface ResearchHypothesisItem {
  hypothesisId: HypothesisId;
  code: string;
  researchQuestionId: ResearchQuestionId;
  title: string;
  statement: string;
  hypothesisFormalText: string;
  nullHypothesisText: string;
  targetObjective: string;
  supportingMetricCodes: string[]; // M1-M10
  supportingMetricKeys: ExperimentalMetricKey[];
  supportingScenarios: string[]; // SC-01 to SC-05
  supportingValidationCases: string[]; // VC-01 to VC-07
  supportingPhases: string[];
  evidenceStrengthScore: number; // 0-100
  evidenceStrengthBand: EvidenceStrengthBand;
  evidenceStatus: ClaimStatusCode;
  robustnessStatus: 'HIGHLY_ROBUST' | 'MODERATELY_ROBUST' | 'SENSITIVE_ASSUMPTION_DEPENDENT';
  civilEngineeringFoundation: {
    domainName: string;
    physicalEngineeringModel: string;
    digitalOperationalRepresentation: string;
    prototypeAssumption: string;
    primaryInfrastructure: string[];
  };
  allowedAcademicStatement: string;
  prohibitedClaims: string[];
  limitations: string[];
  assumptions: string[];
  uncertaintyNotes: string;
  lastValidated: string;
  fingerprint: string;
}

/**
 * Formal Research Claim Model
 */
export interface ResearchClaimItem {
  claimId: string;
  hypothesisId: HypothesisId;
  researchQuestionId: ResearchQuestionId;
  title: string;
  statement: string;
  evidenceLevel: EvidenceLevelCode;
  status: ClaimStatusCode;
  supportingMetrics: string[];
  supportingScenarios: string[];
  supportingPhases: string[];
  limitations: string[];
  assumptions: string[];
  uncertainty: string;
  provenanceReferences: string[];
  allowedLanguage: string;
  prohibitedLanguage: string;
  evidenceStrengthScore: number; // 0-100
  lastValidated: string;
  fingerprint: string;
}

/**
 * Step in the Formal Evidence Chain
 */
export interface EvidenceChainStep {
  stepNumber: number;
  stageName: string;
  identifier: string;
  description: string;
  sourceReference: string;
  verificationStatus: string;
}

/**
 * Complete Traceable Evidence Chain for a Hypothesis
 */
export interface HypothesisEvidenceChain {
  hypothesisId: HypothesisId;
  researchQuestionId: ResearchQuestionId;
  chainSteps: EvidenceChainStep[];
  chainCompletenessPercent: number;
  unbrokenVerification: boolean;
  terminalClaimStatus: ClaimStatusCode;
  canonicalChainHash: string;
}

/**
 * Dynamic Metric-to-Hypothesis Mapping Matrix Item (M1-M10)
 */
export interface MetricHypothesisMatrixItem {
  metricCode: string; // M1 - M10
  metricKey: ExperimentalMetricKey;
  metricName: string;
  unit: string;
  mappedHypotheses: HypothesisId[];
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
  descriptiveValidity: 'VALID_UNDER_TESTED_DISTRIBUTION' | 'QUALITATIVE_VERIFIED' | 'DETERMINISTIC_PASS';
  uncertaintyClassification: 'LOW' | 'MODERATE' | 'HIGH';
  sensitivityStatus: 'ROBUST_STABLE' | 'MODERATE_SENSITIVITY' | 'HIGH_SENSITIVITY';
  supportingScenarios: string[];
  evidenceTier: 'TIER_1_PRIMARY' | 'TIER_2_CORROBORATING';
  finalInterpretation: string;
}

/**
 * Claim Language Safety Audit Result
 */
export interface ClaimLanguageAuditResult {
  text: string;
  classification: ClaimLanguageSafetyClassification;
  isValid: boolean;
  hasOverclaims: boolean;
  flaggedTerms: string[];
  suggestions: Array<{
    term: string;
    suggestedReplacement: string;
    reason: string;
  }>;
  academicComplianceRationale: string;
}

/**
 * Audited Civil Engineering Grounding Item
 */
export interface CivilEngineeringGroundingItem {
  hypothesisId: HypothesisId;
  domain: string;
  physicalAssetClass: string;
  governingPhysicalEquationsOrMechanisms: string;
  sensorTelemetricInputType: string;
  digitalTwinModelType: string;
  operationalDecisionWorkflow: string;
  boundaryConditions: string[];
  fieldValidationGap: string;
}

/**
 * Master Phase 11B Research Claims Snapshot
 */
export interface ResearchClaimsSnapshot {
  snapshotId: string;
  version: string;
  datasetVersion: string;
  generatedAt: string;
  classification: string;
  disclaimer: string;
  evidenceStrengthDisclaimer: string;
  realWorldValidationNotice: string;
  hypotheses: ResearchHypothesisItem[];
  claims: ResearchClaimItem[];
  evidenceChains: HypothesisEvidenceChain[];
  metricMatrix: MetricHypothesisMatrixItem[];
  civilEngineeringGrounding: CivilEngineeringGroundingItem[];
  limitationsRegistry: Array<{
    category: string;
    title: string;
    description: string;
    impactedHypotheses: HypothesisId[];
    mitigationStrategy: string;
  }>;
  canonicalFingerprint: string;
  provenance: {
    academicAffiliation: {
      institution: string;
      department: string;
      thesisTitle: string;
    };
    sourceDatasetVersion: string;
    phaseConsolidatedSources: string[];
    generatedTimestamp: string;
  };
}
