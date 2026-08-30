// =========================================================================
// SCOS PHASE 9C — SCENARIO VALIDATION & MODEL CALIBRATION TYPE SYSTEM
// Controlled Research Validation Framework for Urban Digital Twin & Sim Engine
// =========================================================================

import { TwinEntityType, TwinOperationalStatus, TwinCriticality } from './urbanDigitalTwin';
import {
  SimulationFailureMode,
  ScenarioEnvironmentalModifiers,
  CascadeStep,
  AffectedDepartmentImpact,
  CriticalFacilityAtRisk,
  SimulationMitigationOption,
  SimulationResult,
} from './scenarioSimulation';

/**
 * Validation Criterion Identifier
 */
export type ValidationCriterionId =
  | 'VC-CRITERION-01' // Reproducibility
  | 'VC-CRITERION-02' // Severity Monotonicity
  | 'VC-CRITERION-03' // Spatial Consistency
  | 'VC-CRITERION-04' // Dependency Consistency
  | 'VC-CRITERION-05' // Critical Facility Sensitivity
  | 'VC-CRITERION-06' // Department Response Consistency
  | 'VC-CRITERION-07'; // Data Provenance

/**
 * Validation Outcome Status
 */
export type ValidationCriterionStatus =
  | 'PASS'
  | 'REQUIRES_REVIEW'
  | 'FAIL'
  | 'NOT_EVALUATED';

/**
 * Calibration Parameter Confidence
 */
export type CalibrationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'PROTOTYPE_DEFAULT';

/**
 * Controlled Input Parameters for Model Calibration
 */
export interface ScenarioValidationInput {
  rainfallIntensityMmPerHour: number;
  failureSeverity: TwinCriticality;
  pumpCapacityReductionPercent: number;
  drainageCapacityReductionPercent: number;
  restorationTimeHours: number;
  trafficVolumeMultiplier: number;
  infrastructureAvailabilityPercent: number;
  distanceToCriticalFacilityMeters: number;
  dependencyStrengthMultiplier: number;
  ambientTemperatureC?: number;
}

/**
 * Engineering Calibration Parameter Definition
 */
export interface CalibrationParameter {
  parameterName: string;
  displayName: string;
  value: number | string;
  unit: string;
  source: string;
  rationale: string;
  confidence: CalibrationConfidence;
  classification: 'SIMULATED / PROTOTYPE';
  disclaimer: string;
}

/**
 * Engineering Assumption Definition
 */
export interface CalibrationAssumption {
  assumptionId: string;
  category: 'HYDROLOGIC' | 'TOPOLOGICAL' | 'MOBILIZATION' | 'TRAFFIC' | 'ELECTRICAL';
  description: string;
  basis: string;
  engineeringJustification: string;
  verificationMethod: string;
  isSimulatedPrototype: boolean;
}

/**
 * Individual Validation Criterion Evaluation
 */
export interface ValidationCriterion {
  criterionId: ValidationCriterionId;
  title: string;
  category:
    | 'REPRODUCIBILITY'
    | 'MONOTONICITY'
    | 'SPATIAL_INTEGRITY'
    | 'GRAPH_DEPENDENCY'
    | 'FACILITY_PROTECTION'
    | 'AGENCY_MAPPING'
    | 'PROVENANCE';
  description: string;
  expectedBehaviour: string;
  observedBehaviour: string;
  status: ValidationCriterionStatus;
  explanation: string;
  metrics?: Record<string, any>;
  flaggedAnomaly?: string;
}

/**
 * Individual Validation Result Record
 */
export interface ValidationResult {
  evaluationId: string;
  caseId: string;
  scenarioId: string;
  executedAt: string;
  criteria: ValidationCriterion[];
  passedCount: number;
  reviewCount: number;
  failedCount: number;
  totalEvaluated: number;
  reproducibilityHash: string;
  overallStatus: 'VALIDATED' | 'REQUIRES_REVIEW' | 'FAILED_VALIDATION';
  provenance: {
    engineVersion: string;
    digitalTwinSnapshotId: string;
    author: string;
    classification: string;
  };
}

/**
 * Scenario Validation Case Specification
 */
export interface ScenarioValidationCase {
  validationCaseId: string; // e.g. "VC-01", "VC-02"
  scenarioId: string;
  scenarioName: string;
  baselineScenarioId: string;
  severityLevel: 'BASELINE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetEntityId: string;
  targetEntityName: string;
  targetEntityType: TwinEntityType;
  failureMode: SimulationFailureMode;
  inputParameters: ScenarioValidationInput;
  assumptions: CalibrationAssumption[];
  expectedBehaviour: string[];
  classificationNotice: string;
  isSimulatedPrototype: boolean;
}

/**
 * Output of a Single Validation Case Execution
 */
export interface ScenarioValidationOutput {
  validationCaseId: string;
  scenarioId: string;
  executedAt: string;
  simulationResult: SimulationResult;
  validationResult: ValidationResult;
  traceabilityLog: {
    inputHash: string;
    propagationTrace: string[];
    affectedAssetIds: string[];
    departmentCodes: string[];
    criticalFacilityIds: string[];
  };
}

/**
 * Comparative Delta between Baseline and Scenario
 */
export interface ScenarioComparisonResult {
  comparisonId: string;
  baselineCaseId: string;
  scenarioCaseId: string;
  generatedAt: string;
  modelledDifferences: {
    impactedAssetDelta: {
      baselineCount: number;
      scenarioCount: number;
      deltaCount: number;
      addedAssetNames: string[];
    };
    cascadeDepthDelta: {
      baselineStages: number;
      scenarioStages: number;
      deltaStages: number;
      maxStageReached: string;
    };
    affectedDepartmentDelta: {
      baselineDepts: string[];
      scenarioDepts: string[];
      newlyMobilizedDepts: string[];
    };
    criticalFacilityExposureDelta: {
      baselineAtRiskCount: number;
      scenarioAtRiskCount: number;
      newlyThreatenedFacilities: string[];
      highestThreatLevel: string;
    };
    estimatedOperationalImpactDelta: {
      inundationAreaSqKmDelta: number;
      waterDepthCmDelta: number;
      trafficDelayMinutesDelta: number;
      affectedPopulationDelta: number;
    };
    mitigationRequirementDelta: {
      requiredUnitsDelta: number;
      estimatedCostScale: string;
      leadAgency: string;
    };
  };
  terminologyNotice: string; // e.g. "Modelled Difference — not a real-world municipal measurement."
  classification: string;
}

/**
 * Research Validation Report
 */
export interface ScenarioValidationReport {
  reportId: string;
  validationCase: ScenarioValidationCase;
  inputParameters: ScenarioValidationInput;
  engineeringAssumptions: CalibrationAssumption[];
  calibrationParameters: CalibrationParameter[];
  cascadePropagation: CascadeStep[];
  impactAssessment: {
    affectedInfrastructure: Array<{
      entityId: string;
      entityName: string;
      status: TwinOperationalStatus;
      impact: string;
    }>;
    potentialServiceImpacts: string[];
    criticalFacilityExposure: CriticalFacilityAtRisk[];
    trafficImpedance: {
      delayMinutes: number;
      congestedArterials: string[];
    };
    exposedPopulationEstimate: number;
  };
  comparisonWithBaseline: ScenarioComparisonResult;
  validationCriteria: ValidationCriterion[];
  overallValidationStatus: 'VALIDATED' | 'REQUIRES_REVIEW' | 'FAILED_VALIDATION';
  modelLimitations: string[];
  reproducibilityHash: string;
  provenance: {
    sourceModel: string;
    digitalTwinVersion: string;
    dataClassification: string;
    generatedAt: string;
    evaluatedBy: string;
  };
}

/**
 * Empirical Research Metrics Summary
 */
export interface ValidationMetricSummary {
  totalCasesEvaluated: number;
  scenarioReproducibilityRate: number; // 0.0 - 1.0 (e.g. 1.0)
  validationCriterionPassRate: number; // 0.0 - 1.0
  severityMonotonicityConsistency: number; // 0.0 - 1.0
  spatialConsistencyRate: number; // 0.0 - 1.0
  dependencyConsistencyRate: number; // 0.0 - 1.0
  criticalFacilitySensitivityConsistency: number; // 0.0 - 1.0
  departmentResponseConsistency: number; // 0.0 - 1.0
  provenanceCompletenessRate: number; // 0.0 - 1.0
  passCount: number;
  reviewCount: number;
  failCount: number;
  evaluatedAt: string;
}
