// =========================================================================
// SCOS URBAN DIGITAL TWIN FOUNDATION TYPE SYSTEM (PHASE 9A)
// Prototype Engineering Model for Civil Infrastructure & Urban Systems
// =========================================================================

import type {
  AssetType,
  AssetCondition,
  AssetCriticality,
  AssetStatus,
  CivilInfrastructureLocation,
} from './infrastructure';
import type { DataProvenance, DataQuality, ValidationLevel } from './dataValidation';

/**
 * Supported Digital Twin Entity Categories
 */
export type TwinEntityType =
  | 'ROAD'
  | 'JUNCTION'
  | 'DRAIN'
  | 'DRAINAGE_CHANNEL'
  | 'PUMP_STATION'
  | 'WATER_PIPELINE'
  | 'HOSPITAL'
  | 'POWER_SUBSTATION'
  | 'PUBLIC_FACILITY'
  | 'TRAFFIC_ASSET'
  | 'WARD'
  | 'CRITICAL_FACILITY';

/**
 * Digital Twin Operational Status
 */
export type TwinOperationalStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'MAINTENANCE'
  | 'DISRUPTED'
  | 'OFFLINE'
  | 'CLOGGED_RISK';

/**
 * Digital Twin Physical Condition
 */
export type TwinCondition = 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' | 'UNKNOWN';

/**
 * Digital Twin Criticality Level
 */
export type TwinCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Verification status for entities and relationships
 */
export type TwinVerificationStatus =
  | 'VERIFIED'
  | 'INFERRED'
  | 'PROTOTYPE'
  | 'UNVERIFIED';

/**
 * Digital Twin Dependency Types
 */
export type TwinDependencyType =
  | 'AFFECTED_BY'
  | 'DEPENDS_ON'
  | 'SUPPORTS'
  | 'SUPPLIES'
  | 'CONNECTS'
  | 'CONNECTED_TO'
  | 'DRAINS'
  | 'SERVES'
  | 'LOCATED_IN'
  | 'COORDINATES_WITH';

/**
 * Dependency Direction
 */
export type TwinDependencyDirection = 'OUTGOING' | 'INCOMING' | 'BIDIRECTIONAL';

/**
 * Data Freshness Classification
 */
export type TwinDataFreshness =
  | 'FRESH'
  | 'STALE'
  | 'EXPIRING'
  | 'REAL_TIME_SIMULATED';

/**
 * Governance & Classification Metadata
 */
export interface TwinGovernanceMetadata {
  isSimulatedPrototype: boolean;
  classificationNotice: string;
  verificationStatus: TwinVerificationStatus;
  confidenceScore: number;
  humanApprovalRequired: boolean;
  modelVersion: string;
  disclaimer: string;
}

/**
 * Data Reference for Provenance & Lineage
 */
export interface TwinDataReference {
  dataSourceId: string;
  sourceName: string;
  department: string;
  lastSync: string;
  freshness: TwinDataFreshness;
  qualityScore: number;
  qualityLevel: DataQuality;
  lineage: string[];
}

/**
 * Structured Digital Twin Entity
 */
export interface TwinEntity {
  entityId: string;
  entityType: TwinEntityType;
  name: string;
  description?: string;
  location: CivilInfrastructureLocation;
  department: string;
  departmentCode?: string;
  operationalStatus: TwinOperationalStatus;
  condition: TwinCondition;
  criticality: TwinCriticality;
  capacity?: string;
  currentLoad?: string;
  dataQuality: {
    completenessPercent: number;
    qualityLevel: DataQuality;
    qualityScore: number;
  };
  dataFreshness: TwinDataFreshness;
  provenance: DataProvenance;
  lastUpdated: string;
  sourceAssetId?: string;
  governance: TwinGovernanceMetadata;
  attributes?: Record<string, any>;
}

/**
 * Detailed Infrastructure State Snapshot
 */
export interface TwinInfrastructureState {
  entityId: string;
  operationalStatus: TwinOperationalStatus;
  condition: TwinCondition;
  criticality: TwinCriticality;
  capacityUtilizationPercent?: number;
  disruptionReason?: string;
  activeAlerts: string[];
  lastInspectedAt?: string;
  dataFreshness: TwinDataFreshness;
}

/**
 * Explicit Urban Dependency Relationship
 */
export interface TwinDependency {
  relationshipId: string;
  sourceEntityId: string;
  sourceEntityType: TwinEntityType;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityType: TwinEntityType;
  targetEntityName: string;
  relationshipType: TwinDependencyType;
  direction: TwinDependencyDirection;
  confidence: number;
  verificationStatus: TwinVerificationStatus;
  description: string;
  provenance: string;
  isPrototypeInferred: boolean;
}

/**
 * Spatial Proximity & Topological Relationship
 */
export interface TwinSpatialRelationship {
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  targetEntityName: string;
  targetEntityType: TwinEntityType;
  spatialType: string;
  distanceMeters: number;
  distanceKm: string;
  isWithinCriticalBuffer: boolean;
  verificationStatus: TwinVerificationStatus;
}

/**
 * Operational State representation for an Entity
 */
export interface TwinOperationalState {
  entityId: string;
  entityName: string;
  entityType: TwinEntityType;
  operationalStatus: TwinOperationalStatus;
  condition: TwinCondition;
  criticality: TwinCriticality;
  activeIncidentCount: number;
  associatedIncidentIds: string[];
  predictiveRiskScore?: number;
  directDependenciesCount: number;
  directDependentsCount: number;
  dataFreshness: TwinDataFreshness;
  governance: TwinGovernanceMetadata;
}

/**
 * Scenario Baseline Snapshot
 */
export interface TwinScenarioBaseline {
  snapshotId: string;
  generatedAt: string;
  entityCount: number;
  relationshipCount: number;
  activeIncidentCount: number;
  criticalInfrastructureCount: number;
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'DISRUPTED' | 'CRITICAL';
  dataClassification: string;
  provenanceSummary: {
    totalSources: number;
    verifiedSources: number;
    simulatedSources: number;
    freshnessRatePercent: number;
  };
  entitiesSummaryByType: Record<string, number>;
  disclaimer: string;
}

/**
 * Aggregated Digital Twin Metrics
 */
export interface DigitalTwinStatistics {
  totalEntities: number;
  totalRelationships: number;
  criticalEntities: number;
  operationalEntities: number;
  degradedEntities: number;
  disruptedEntities: number;
  offlineEntities: number;
  departmentsRepresented: number;
  activeIncidents: number;
  dataFreshnessSummary: {
    freshCount: number;
    staleCount: number;
    totalCount: number;
    averageQualityScore: number;
  };
  governanceNotice: string;
}

/**
 * Complete State of the Urban Digital Twin
 */
export interface UrbanDigitalTwinState {
  stateId: string;
  timestamp: string;
  entities: TwinEntity[];
  dependencies: TwinDependency[];
  baselineSnapshot: TwinScenarioBaseline;
  statistics: DigitalTwinStatistics;
  governance: TwinGovernanceMetadata;
}
