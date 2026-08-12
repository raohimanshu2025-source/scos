/**
 * SCOS Phase 5B.6 — Knowledge Graph & Contextual Intelligence Types
 * Defines node entities, relationships, attributes, graph neighborhoods,
 * incident context representations, cascade impact analysis structures,
 * and research architecture metrics.
 */

export type EntityType =
  | 'CITY'
  | 'ZONE'
  | 'WARD'
  | 'LOCATION'
  | 'DEPARTMENT'
  | 'SERVICE'
  | 'ASSET'
  | 'INFRASTRUCTURE'
  | 'INCIDENT'
  | 'RISK'
  | 'TASK'
  | 'FACILITY'
  | 'HOSPITAL'
  | 'ROAD'
  | 'WATER_ASSET'
  | 'DRAINAGE_ASSET'
  | 'TRAFFIC_POINT'
  | 'HISTORICAL_EVENT'
  | 'PREDICTION'
  | 'RECOMMENDATION'
  | 'OFFICER';

export type RelationshipType =
  | 'LOCATED_IN'
  | 'MANAGED_BY'
  | 'RESPONSIBLE_FOR'
  | 'SERVES'
  | 'CONNECTED_TO'
  | 'NEAR'
  | 'AFFECTS'
  | 'AFFECTED_BY'
  | 'DEPENDS_ON'
  | 'REPORTED_AT'
  | 'OCCURRED_AT'
  | 'HAS_RISK'
  | 'HAS_INCIDENT'
  | 'HAS_TASK'
  | 'HAS_PREDICTION'
  | 'REQUIRES_ACTION'
  | 'ESCALATED_TO'
  | 'MONITORED_BY';

export type DataSourceType = 'SIMULATED' | 'PUBLIC_DATA' | 'OBSERVED' | 'DERIVED';

export interface GraphEntity {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  source: DataSourceType;
  confidence?: number; // 0 - 1.0
  status?: string;
  latitude?: number;
  longitude?: number;
  attributes: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface GraphRelationship {
  id: string;
  source_id: string;
  source_type: EntityType;
  relationship_type: RelationshipType;
  target_id: string;
  target_type: EntityType;
  weight?: number; // 0 - 100
  attributes?: Record<string, any>;
  source: DataSourceType;
  created_at?: string;
}

export interface GraphNeighborhood {
  centerEntity: GraphEntity;
  directRelationships: GraphRelationship[];
  connectedEntities: GraphEntity[];
}

export interface CascadeImpactItem {
  level: number; // 1, 2, 3...
  event: string;
  downstreamImpacts: string[];
  affectedDepartments: string[];
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  verificationStatus: 'Potentially affected' | 'Possible downstream impact' | 'Requires verification';
}

export interface CascadeImpactResult {
  primaryEntity: GraphEntity;
  primaryEventTitle: string;
  cascadeChain: CascadeImpactItem[];
  involvedDepartments: string[];
  recommendedCoordination: string[];
  timestamp: string;
}

export interface IncidentContext {
  incidentId: string;
  incidentTitle: string;
  incidentEntity?: GraphEntity;
  locationEntity?: GraphEntity;
  wardEntity?: GraphEntity;
  zoneEntity?: GraphEntity;
  nearbyAssets: GraphEntity[];
  nearbyFacilities: GraphEntity[]; // e.g. Hospitals, Schools
  responsibleDepartments: GraphEntity[];
  historicalEvents: GraphEntity[]; // Similar past events
  currentRisk?: GraphEntity;
  openTasks: GraphEntity[];
  cascadeImpacts: CascadeImpactItem[];
  aiContextSummary: string;
}

export interface GraphStats {
  totalEntities: number;
  totalRelationships: number;
  entitiesByType: Record<string, number>;
  relationshipsByType: Record<string, number>;
  dataSourcesBreakdown: Record<string, number>;
  mostConnectedEntities: Array<{
    id: string;
    name: string;
    type: EntityType;
    connectionCount: number;
  }>;
  recentlyUpdated: GraphEntity[];
}

export interface GraphDemoStep {
  step: number;
  title: string;
  actor: string;
  role: string;
  description: string;
  actionPayload?: Record<string, any>;
}
