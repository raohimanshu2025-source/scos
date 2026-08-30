// =========================================================================
// SCOS PHASE 9B — WHAT-IF SCENARIO SIMULATION & IMPACT PROPAGATION TYPES
// Engineering Models for Urban Digital Twin Simulation & Cascade Analysis
// =========================================================================

import { TwinEntityType, TwinOperationalStatus, TwinCriticality } from './urbanDigitalTwin';

export type SimulationFailureMode =
  | 'TOTAL_FAILURE'
  | 'PARTIAL_DEGRADATION'
  | 'POWER_OUTAGE'
  | 'CLOGGED_SILTED'
  | 'BURST_RUPTURE'
  | 'STRUCTURAL_COLLAPSE';

export type StormSurgeLevel =
  | 'NONE'
  | 'MODERATE'
  | 'HEAVY'
  | 'EXTREME_CLOUD_BURST';

export interface ScenarioEnvironmentalModifiers {
  rainfallMmPerHour: number;
  stormSurgeLevel: StormSurgeLevel;
  trafficVolumeMultiplier: number;
  timeHorizonHours: number;
  ambientTemperatureC?: number;
}

export interface ScenarioDefinition {
  scenarioId: string;
  title: string;
  description: string;
  targetEntityId: string;
  targetEntityType: TwinEntityType;
  targetEntityName: string;
  failureMode: SimulationFailureMode;
  severity: TwinCriticality;
  environmentalModifiers: ScenarioEnvironmentalModifiers;
  createdBy: string;
  createdAt: string;
  isPreset: boolean;
}

export type CascadeStage =
  | 'PRIMARY_FAILURE'
  | 'DIRECT_PHYSICAL_IMPACT'
  | 'SECONDARY_TOPOLOGICAL_CASCADE'
  | 'CRITICAL_FACILITY_THREAT'
  | 'TERTIARY_CITY_DISRUPTION';

export interface CascadeStep {
  stepNumber: number;
  stage: CascadeStage;
  entityId: string;
  entityName: string;
  entityType: TwinEntityType;
  department: string;
  previousStatus: TwinOperationalStatus;
  simulatedStatus: TwinOperationalStatus;
  impactDescription: string;
  physicalMetrics: {
    inundationDepthCm?: number;
    capacityLossPercent?: number;
    trafficDelayMinutes?: number;
    serviceOutagePopulation?: number;
  };
  propagationVector: string;
  confidence: number; // 0.0 - 1.0
  timeToImpactMinutes: number;
}

export interface AffectedDepartmentImpact {
  departmentCode: string;
  departmentName: string;
  role: 'PRIMARY_RESPONSE' | 'SECONDARY_SUPPORT' | 'CRITICAL_FACILITY_PROTECTION';
  mobilizationPriority: 'P1_IMMEDIATE' | 'P2_ELEVATED' | 'P3_STANDBY';
  taskSummary: string;
  recommendedAssetUnits: string[];
  estimatedResponseTimeMinutes: number;
}

export interface CriticalFacilityAtRisk {
  facilityId: string;
  facilityName: string;
  facilityType: 'HOSPITAL' | 'POWER_SUBSTATION' | 'EMERGENCY_CENTER' | 'TRANSPORT_HUB' | 'WATER_TREATMENT' | 'SCHOOL';
  distanceFromEpicenterMeters: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatDescription: string;
  accessRouteStatus: 'CLEAR' | 'PARTIALLY_IMPEDED' | 'SUBMERGED_BLOCKED';
  auxiliaryPowerRequirement: boolean;
}

export type MitigationStrategyType =
  | 'MOBILE_PUMP_DEPLOYMENT'
  | 'TRAFFIC_REROUTING'
  | 'AUXILIARY_POWER_GENERATION'
  | 'BYPASS_CHANNEL_ACTIVATION'
  | 'EMERGENCY_CORRIDOR_CLEARANCE'
  | 'COMBINED_TACTICAL_RESPONSE';

export interface SimulationMitigationOption {
  optionId: string;
  title: string;
  strategyType: MitigationStrategyType;
  summary: string;
  actionSteps: string[];
  leadDepartment: string;
  supportDepartments: string[];
  resourcesRequired: Array<{ resourceName: string; quantity: number; unit: string }>;
  predictedImpactReduction: {
    inundationReductionPercent: number;
    restorationTimeHours: number;
    facilitiesProtected: number;
  };
  feasibilityScore: number; // 0 - 100
  coordinationLoad: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedCostIndex: 'LOW' | 'MEDIUM' | 'HIGH';
  riskTradeoffs: string[];
  officerDecisionStatus: 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  officerReviewNotes?: string;
  modifiedActionSteps?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SimulationResult {
  simulationId: string;
  scenario: ScenarioDefinition;
  simulatedAt: string;
  baselineComparison: {
    baselineOperationalAssets: number;
    simulatedOperationalAssets: number;
    degradedAssetsDelta: number;
    disruptedAssetsDelta: number;
    totalInundatedAreaSqKm: number;
    peakInundationDepthCm: number;
    disruptedRoadKm: number;
    affectedPopulationEstimate: number;
  };
  cascadeSteps: CascadeStep[];
  affectedDepartments: AffectedDepartmentImpact[];
  criticalFacilitiesAtRisk: CriticalFacilityAtRisk[];
  mitigationOptions: SimulationMitigationOption[];
  governanceNotice: string;
  isSimulatedPrototype: true;
}

export interface ScenarioReviewPayload {
  optionId: string;
  decision: 'APPROVE' | 'MODIFY' | 'REJECT';
  officerNotes?: string;
  modifiedActionSteps?: string[];
}
