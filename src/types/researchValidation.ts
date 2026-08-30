// =========================================================================
// SCOS PHASE 11A — INTEGRATED RESEARCH VALIDATION & EVIDENCE CONSOLIDATION TYPES
// Formal Evidence Consolidation, Claim Ledger, Language Safety & Research Maturity
// =========================================================================

import { ResearchQuestionId, BenchmarkScenarioId } from './researchEvidence';
import { ExperimentalMetricKey } from './experimentalExecution';
import { EvidenceLevel } from './researchContribution';
import { RobustnessClassification } from './sensitivityAnalysis';

/**
 * Conservative Final Research Status Classification (PART 5)
 */
export type ResearchStatusClassification =
  | 'SUPPORTED BY COMPUTATIONAL EVIDENCE'
  | 'PARTIALLY SUPPORTED'
  | 'ROBUST UNDER TESTED ASSUMPTIONS'
  | 'ASSUMPTION DEPENDENT'
  | 'INSUFFICIENT EVIDENCE'
  | 'NOT TESTED'
  | 'REAL-WORLD VALIDATION NOT ESTABLISHED';

/**
 * Structured Evidence Profile (PART 16)
 */
export interface StructuredEvidenceProfile {
  implementationVerification: 'HIGH' | 'MEDIUM' | 'LOW';
  computationalVerification: 'HIGH' | 'MEDIUM' | 'LOW';
  controlledScenarioValidation: 'HIGH' | 'MODERATE/HIGH' | 'MODERATE' | 'LOW';
  comparativeEvidence: 'BOUNDED DESCRIPTIVE' | 'EXPLORATORY' | 'NONE';
  statisticalEvidence: 'EXPLORATORY / SMALL-SAMPLE' | 'DESCRIPTIVE' | 'NONE';
  sensitivityEvidence: 'TESTED UNDER SPECIFIED ASSUMPTIONS' | 'EXPLORATORY' | 'NONE';
  realWorldFieldValidation: 'NOT ESTABLISHED';
}

/**
 * Research Maturity Level Specification (PART 17)
 */
export type MaturityLevelCode =
  | 'LEVEL_1_CONCEPTUAL'
  | 'LEVEL_2_ARCHITECTURAL'
  | 'LEVEL_3_IMPLEMENTED_PROTOTYPE'
  | 'LEVEL_4_COMPUTATIONALLY_VERIFIED'
  | 'LEVEL_5_CONTROLLED_EXPERIMENTALLY_EVALUATED'
  | 'LEVEL_6_FIELD_VALIDATED';

export interface MaturityLevelDefinition {
  levelNumber: number;
  code: MaturityLevelCode;
  name: string;
  description: string;
  criteria: string;
  isCurrentAchieved: boolean;
  requiredEvidenceForAdvancement?: string;
}

export interface ResearchMaturityAssessment {
  currentLevelNumber: number;
  currentLevelName: string;
  currentLevelCode: MaturityLevelCode;
  maturityJustification: string;
  nextRequiredEvidenceForAdvancement: string;
  levels: MaturityLevelDefinition[];
}

/**
 * Consolidated Evidence for Research Questions RQ-01 to RQ-05 (PART 4)
 */
export interface ResearchQuestionConsolidatedEvidence {
  rqId: ResearchQuestionId;
  code: string;
  title: string;
  researchQuestion: string;
  hypothesisOrExpectedDirection: string;
  linkedMetrics: string[];
  linkedScenarios: string[];
  linkedValidationCases: string[];
  phase9CEvidence: string;
  phase9DEvidence: string;
  phase10CStatisticalEvidence: string;
  phase10DEvidenceSynthesis: string;
  phase10FRobustness: string;
  strongestEvidenceLevel: EvidenceLevel;
  robustnessClassification: RobustnessClassification;
  uncertaintyStatus: string;
  limitations: string[];
  finalResearchStatus: ResearchStatusClassification;
}

/**
 * Consolidated Evidence for Metrics M1 to M10 (PART 6)
 */
export interface MetricConsolidatedEvidence {
  metricId: ExperimentalMetricKey;
  metricCode: string;
  metricName: string;
  unit: string;
  desiredDirection: 'LOWER_IS_BETTER' | 'HIGHER_IS_BETTER';
  baselineEvidence: {
    mean: number;
    median: number;
    range: [number, number];
    stdDev: number;
    sampleSize: number;
  };
  scosEvidence: {
    mean: number;
    median: number;
    range: [number, number];
    stdDev: number;
    sampleSize: number;
  };
  absoluteDifference: number;
  relativeChangePercent: number;
  descriptiveStatistics: string;
  uncertainty: string;
  sensitivityStatus: string;
  robustnessStatus: RobustnessClassification;
  linkedRQs: ResearchQuestionId[];
  linkedScenarios: string[];
  evidenceLevel: EvidenceLevel;
  provenance: string;
  limitations: string[];
}

/**
 * Consolidated Evidence for Benchmark Scenarios SC-01 to SC-05 (PART 7)
 */
export interface ScenarioConsolidatedEvidence {
  scenarioId: BenchmarkScenarioId;
  scenarioName: string;
  category: string;
  primaryCivilInfrastructure: string;
  linkedVCs: string[];
  phase9CValidationResult: string;
  phase9DComparativeResult: string;
  phase10BExecutions: string;
  phase10CStatistics: string;
  phase10FSensitivityStatus: string;
  robustnessClassification: RobustnessClassification;
  evidenceLevel: EvidenceLevel;
  limitations: string[];
}

/**
 * Consolidated Evidence for Validation Cases VC-01 to VC-07 (PART 8)
 */
export interface ValidationCaseConsolidatedEvidence {
  validationCaseId: string;
  scenarioId: string;
  validationCriterion: string;
  result: 'PASS' | 'REQUIRES_REVIEW' | 'FAIL';
  supportingEvidence: string;
  reproducibilityStatus: 'REPRODUCIBLE' | 'PARAMETRICALLY_STABLE' | 'DEVIATING';
  sensitivityStatus: string;
  evidenceLevel: EvidenceLevel;
  limitations: string[];
}

/**
 * Comparative Evidence (PART 9)
 */
export interface ComparativeConsolidatedEvidence {
  conditionAName: string; // Conventional / Manual Municipal Operations
  conditionBName: string; // SCOS Integrated Operational Intelligence
  safeguards: string[];
  observedDifferencesSummary: string;
  orderEffectNotice: string;
  computationalVsRealWorldBoundary: string;
}

/**
 * Civil Engineering Evidence Mapping Item (PART 13)
 */
export interface CivilEngineeringDomainEvidence {
  domainKey: string;
  domainName: string;
  civilEngineeringPrinciple: string;
  scosImplementation: string;
  computationalRepresentation: string;
  evidenceLevel: EvidenceLevel;
  validationStatus: string;
  calibrationRequirement: string;
}

/**
 * Research Contribution Synthesis Item (PART 14)
 */
export interface ResearchContributionConsolidatedItem {
  contributionId: string;
  category: 'TECHNICAL' | 'METHODOLOGICAL' | 'CIVIL_ENGINEERING' | 'GOVERNANCE' | 'RESEARCH_EVALUATION';
  title: string;
  problemAddressed: string;
  scosArchitecturalSolution: string;
  implementation: string;
  evidence: string;
  robustness: string;
  limitation: string;
  futureValidation: string;
}

/**
 * Evidence Gap Matrix Item (PART 15)
 */
export interface EvidenceGapItem {
  gapId: string;
  claim: string;
  currentEvidence: string;
  highestEvidenceLevel: EvidenceLevel;
  missingEvidence: string;
  whyMissing: string;
  futureValidationMethod: string;
  responsibleDomain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'FUTURE EMPIRICAL VALIDATION';
}

/**
 * Research Claim Ledger Item (PART 24)
 */
export interface ClaimLedgerItem {
  claimId: string;
  claim: string;
  claimType: 'TECHNICAL' | 'METHODOLOGICAL' | 'CIVIL_ENGINEERING' | 'GOVERNANCE' | 'RESEARCH_EVALUATION';
  supportingEvidence: string;
  evidenceLevel: EvidenceLevel;
  robustness: RobustnessClassification;
  limitation: string;
  allowedLanguage: string;
  prohibitedLanguage: string;
}

/**
 * Provenance Manifest (PART 26)
 */
export interface ResearchValidationProvenance {
  sourceDatasetVersion: string;
  sourcePhases: string[];
  sourceComponents: string[];
  generatedTimestamp: string;
  canonicalFingerprint: string;
  classificationNotice: string;
  unvalidatedStatement: string;
  academicAffiliation: {
    institution: string;
    department: string;
    thesisTitle: string;
  };
}

/**
 * Complete Research Validation Snapshot (PART 2)
 */
export interface ResearchValidationSnapshot {
  validationId: string;
  datasetVersion: string;
  generatedAt: string;
  classification: 'SIMULATED / PROTOTYPE DATA — Not a Real-World Municipal Measurement';
  overallEvidenceStatus: string;
  executiveAnswers: {
    whatHasBeenVerified: string;
    whatHasBeenComputationallyTested: string;
    whatHasBeenComparativelyEvaluated: string;
    whatHasBeenShownToBeRobust: string;
    whatRemainsAssumptionDependent: string;
    whatHasNotBeenValidated: string;
  };
  evidenceProfile: StructuredEvidenceProfile;
  researchQuestions: ResearchQuestionConsolidatedEvidence[];
  metrics: MetricConsolidatedEvidence[];
  scenarios: ScenarioConsolidatedEvidence[];
  validationCases: ValidationCaseConsolidatedEvidence[];
  comparativeEvidence: ComparativeConsolidatedEvidence;
  statisticalEvidence: {
    sampleSizeNote: string;
    uncertaintyNote: string;
    zeroImputationPolicy: string;
  };
  sensitivityEvidence: {
    robustnessSummary: string;
    criticalParameters: string[];
    elasticityFinding: string;
  };
  robustnessSummary: {
    highlyRobustPercentage: number;
    moderatelyRobustPercentage: number;
    assumptionDependentPercentage: number;
    unstablePercentage: number;
  };
  threatsToValidity: {
    threatId: string;
    category: string;
    threatTitle: string;
    affectedEvidence: string;
    mitigationAlreadyImplemented: string;
    residualLimitation: string;
    futureResearchRequirement: string;
  }[];
  civilEngineeringEvidence: CivilEngineeringDomainEvidence[];
  researchContributions: ResearchContributionConsolidatedItem[];
  evidenceGaps: EvidenceGapItem[];
  researchMaturity: ResearchMaturityAssessment;
  claimLedger: ClaimLedgerItem[];
  provenanceManifest: ResearchValidationProvenance;
  limitations: string[];
  futureValidationRequirements: string[];
}
