// =========================================================================
// SCOS GEOSPATIAL & CIVIL INFRASTRUCTURE INTELLIGENCE TYPE SYSTEM
// =========================================================================

import type {
  DataProvenance,
  DataQuality,
  DataMode,
  ValidationLevel,
} from './dataValidation';

export type AssetType =
  | 'ROAD'
  | 'ROAD_JUNCTION'
  | 'DRAIN'
  | 'DRAINAGE_NETWORK'
  | 'PUMPING_STATION'
  | 'WATER_PIPELINE'
  | 'HOSPITAL'
  | 'HEALTH_FACILITY'
  | 'BRIDGE'
  | 'TRAFFIC_SIGNAL'
  | 'PUBLIC_BUILDING'
  | 'CRITICAL_FACILITY'
  | 'FLOOD_PRONE_ZONE'
  | 'MUNICIPAL_ASSET';

export type AssetCondition = 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' | 'UNKNOWN';

export type AssetCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AssetStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'MAINTENANCE'
  | 'DISRUPTED'
  | 'OFFLINE'
  | 'CLOGGED_RISK';

export interface GeometryReference {
  type: 'POINT' | 'LINESTRING' | 'POLYGON';
  coordinates: number[] | number[][] | number[][][]; // GeoJSON-like representation
}

export interface CivilInfrastructureLocation {
  latitude: number;
  longitude: number;
  ward: string;
  zone: string;
  landmark?: string;
  address?: string;
  geometryReference?: GeometryReference;
}

export interface CivilInfrastructureAsset {
  assetId: string;
  assetType: AssetType;
  assetName: string;
  department: string;
  departmentId?: string;
  status: AssetStatus;
  location: CivilInfrastructureLocation;
  geometryReference?: GeometryReference;
  criticality: AssetCriticality;
  capacity?: string;
  condition: AssetCondition;
  dataSource: string; // sourceId e.g. DS-KNN-DRAINAGE-01
  provenance: DataProvenance;
  quality: {
    completenessPercent: number;
    qualityLevel: DataQuality;
    qualityScore: number;
  };
  validationStatus: ValidationLevel;
  lastUpdated: string;
  dataMode: DataMode;
  isSimulatedPrototype: boolean;
  attributes?: Record<string, any>;
}

export type SpatialRelationshipType =
  | 'ROAD_NEAR_DRAIN'
  | 'ROAD_SERVES_HOSPITAL'
  | 'DRAIN_SERVES_ZONE'
  | 'PUMP_SERVES_ZONE'
  | 'HOSPITAL_NEAR_ROAD'
  | 'ROAD_CONNECTS_JUNCTION'
  | 'ASSET_LOCATED_IN_ZONE'
  | 'INCIDENT_AFFECTS_ROAD'
  | 'INCIDENT_AFFECTS_DRAIN'
  | 'INCIDENT_THREATENS_FACILITY';

export interface InfrastructureRelationship {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationshipType: SpatialRelationshipType;
  description?: string;
  distanceMeters?: number;
}

export interface NearbyAssetResult {
  distanceMeters: number;
  distanceKm: string;
  asset: CivilInfrastructureAsset;
  assetType: AssetType;
  source: string;
  dataMode: DataMode;
  quality: DataQuality;
  spatialRelType: SpatialRelationshipType | string;
}

export interface CivilCascadeStep {
  step: number;
  trigger: string;
  affectedAsset: string;
  assetType: AssetType;
  potentialImpact: string;
  verificationStatus: 'POTENTIAL' | 'POSSIBLE' | 'REQUIRES_VERIFICATION';
  mitigationAction?: string;
}

export interface CivilCascadeImpact {
  incidentId: string;
  incidentTitle: string;
  location: {
    latitude: number;
    longitude: number;
    ward: string;
    zone: string;
  };
  nearbyAssets: NearbyAssetResult[];
  impactChain: CivilCascadeStep[];
  disclaimer: string;
}

export interface InfrastructureSummaryMetrics {
  totalAssets: number;
  roadCount: number;
  drainageCount: number;
  healthCount: number;
  criticalFacilityCount: number;
  pumpingStationCount: number;
  trafficCount: number;
  conditionDistribution: Record<AssetCondition, number>;
  criticalityDistribution: Record<AssetCriticality, number>;
  disclaimer: string;
}
