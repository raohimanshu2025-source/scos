/**
 * SCOS Phase 8.5C — Operational Decision Support Data Models & Type System
 * Logical layer situated after Situational Awareness and before Human Decision / Operational Execution.
 * 
 * CORE PRINCIPLE: SCOS does NOT autonomously execute emergency actions.
 * It synthesizes evidence, risk context, infrastructure impact, affected departments,
 * and transparent operational options with confidence and provenance indicators for human review.
 */

import { IncidentSeverity, IncidentCategory } from './incident';

export type DecisionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DecisionConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'REQUIRES_VERIFICATION';

export type DecisionExecutionStatus = 'PROPOSED' | 'REVIEWED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';

export type CoordinationLoadEstimate = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DecisionEvidenceItem {
  evidenceId: string;
  sourceType: 'INCIDENT_TELEMETRY' | 'PREDICTIVE_RISK_MODEL' | 'CIVIL_INFRASTRUCTURE_GRAPH' | 'DEPARTMENT_CAPABILITY_MATRIX' | 'SLA_TRACKER' | 'SENSOR_FEED' | 'HISTORICAL_BASELINE';
  title: string;
  description: string;
  dataFreshness: 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';
  provenance: string;
  confidenceScore: number; // 0.0 to 1.0
  validationStatus: 'FULLY_VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'PROTOTYPE_DATA';
  isSimulated: boolean;
}

export interface DecisionDepartment {
  departmentCode: string;
  departmentName: string;
  role: 'PRIMARY_LEAD' | 'SECONDARY_SUPPORT' | 'ADVISORY';
  assignedCapabilities: string[];
  operationalReadiness: 'READY' | 'DEGRADED' | 'UNAVAILABLE';
}

export interface DecisionInfrastructureImpact {
  assetId: string;
  assetName: string;
  assetType: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  distanceKm: number;
  expectedDisruption: string;
  requiresVerification: boolean;
}

export interface DecisionFactorScore {
  factor: 'INCIDENT_SEVERITY' | 'PREDICTIVE_RISK' | 'INFRASTRUCTURE_CRITICALITY' | 'CRITICAL_FACILITY_PROXIMITY' | 'SLA_STATUS' | 'ESCALATION_LEVEL' | 'DEPARTMENT_LOAD' | 'DATA_FRESHNESS';
  label: string;
  score: number; // 0 - 100
  weight: number; // 0.0 - 1.0
  weightedContribution: number;
  contributingData: string;
}

export interface DecisionUncertainty {
  uncertaintyId: string;
  category: 'TELEMETRY_LATENCY' | 'FIELD_VERIFICATION_PENDING' | 'MODEL_ASSUMPTION' | 'PROTOTYPE_SIMULATION_CONSTRAINT';
  description: string;
  mitigationRecommendation: string;
  blockingForExecution: boolean;
}

export interface DecisionOption {
  optionId: string;
  optionCode: 'OPTION_A' | 'OPTION_B' | 'OPTION_C' | string;
  title: string;
  description: string;
  priority: DecisionPriority;
  rationale: string;
  supportingEvidence: DecisionEvidenceItem[];
  affectedInfrastructure: DecisionInfrastructureImpact[];
  affectedDepartments: DecisionDepartment[];
  expectedOperationalImpact: string;
  estimatedCoordinationLoad: CoordinationLoadEstimate;
  relatedIncidentId: string;
  relatedRiskZoneId?: string;
  confidence: DecisionConfidence;
  confidenceScore: number; // 0.0 - 1.0
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'PROTOTYPE_ASSESSMENT';
  dataFreshness: 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';
  provenance: string;
  requiresHumanApproval: boolean;
  executionStatus: DecisionExecutionStatus;
  reviewMetadata?: {
    reviewedBy?: string;
    reviewedAt?: string;
    action?: 'APPROVE' | 'MODIFY' | 'REJECT';
    notes?: string;
    modifiedActions?: string[];
  };
}

export interface DecisionSituation {
  incidentId: string;
  incidentTitle: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  location: string;
  wardZone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  reportedAt: string;
  currentStatus: string;
  escalationLevel: number;
  slaBreachRisk: boolean;
  primaryDepartment: string;
  affectedDepartments: string[];
  criticalFacilitiesNearby: string[];
}

export interface DecisionGovernanceMetadata {
  frameworkVersion: string;
  generatedAt: string;
  generatedByService: string;
  districtCode: string;
  districtName: string;
  dataClassification: 'SIMULATED / PROTOTYPE DATA — SCOS DECISION SUPPORT ENGINE';
  isSimulatedPrototype: boolean;
  humanInTheLoopDisclaimer: string;
  prioritizationModel: string;
}

export interface OperationalDecisionSupportSnapshot {
  snapshotId: string;
  generatedAt: string;
  situation: DecisionSituation;
  prioritizationSummary: {
    overallPriorityScore: number; // 0 - 100
    priorityLevel: DecisionPriority;
    contributingFactors: DecisionFactorScore[];
    prioritizationMethod: 'PROTOTYPE DECISION PRIORITIZATION';
  };
  evidenceSummary: {
    totalEvidenceItems: number;
    primaryEvidence: DecisionEvidenceItem[];
    keyRiskFactors: string[];
    whatWeKnow: string[];
    whyScosSuggestsAction: string;
  };
  options: DecisionOption[];
  uncertainties: DecisionUncertainty[];
  humanGovernance: {
    requiresHumanReview: true;
    authorizedRoles: string[];
    currentReviewStatus: DecisionExecutionStatus;
    auditLogCount: number;
  };
  governance: DecisionGovernanceMetadata;
}

export interface DecisionReviewPayload {
  optionId: string;
  action: 'APPROVE' | 'MODIFY' | 'REJECT';
  officerNotes?: string;
  modifiedInstructions?: string[];
  approvedDepartments?: string[];
}
