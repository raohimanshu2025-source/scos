// =========================================================================
// SCOS URBAN DIGITAL TWIN FOUNDATION SERVICE (PHASE 9A)
// Computational Representation of Civil Infrastructure, Spatial Relationships,
// Dependencies & Operational Baseline
// =========================================================================

import {
  TwinEntity,
  TwinEntityType,
  TwinOperationalStatus,
  TwinCondition,
  TwinCriticality,
  TwinVerificationStatus,
  TwinDependency,
  TwinDependencyType,
  TwinSpatialRelationship,
  TwinOperationalState,
  TwinScenarioBaseline,
  DigitalTwinStatistics,
  UrbanDigitalTwinState,
  TwinGovernanceMetadata,
} from '../types/urbanDigitalTwin';
import { infrastructureStore } from './infrastructureStore';
import { incidentStore } from './incidentStore';
import { predictionStore } from './predictionStore';
import { knowledgeGraphStore } from './knowledgeGraphStore';
import { calculateHaversineDistance, filterByProximity } from './spatialEngine';
import { CivilInfrastructureAsset } from '../types/infrastructure';

const DEFAULT_GOVERNANCE: TwinGovernanceMetadata = {
  isSimulatedPrototype: true,
  classificationNotice: 'SIMULATED / PROTOTYPE DATA',
  verificationStatus: 'PROTOTYPE',
  confidenceScore: 0.92,
  humanApprovalRequired: true,
  modelVersion: 'SCOS-TWIN-v1.0-PROTOTYPE',
  disclaimer:
    'SCOS DIGITAL TWIN — PROTOTYPE ENGINEERING MODEL. Not a complete physical representation of the city.',
};

class UrbanDigitalTwinService {
  /**
   * Prototype Power Substation and Ward entities to complement civil infrastructure
   */
  private supplementaryEntities: TwinEntity[] = [
    {
      entityId: 'TWIN-PWR-CIVIL-LINES',
      entityType: 'POWER_SUBSTATION',
      name: 'Civil Lines 33/11kV Primary Substation',
      description: 'Supplies electrical feeder grid for Parade & Central Corridor pumping units',
      location: {
        latitude: 26.462,
        longitude: 80.345,
        ward: 'Ward 14 — Civil Lines',
        zone: 'Zone 1 — Central Corridor',
        landmark: 'Near KESCO Zonal Substation Compound',
        address: 'Civil Lines Feeder Complex, Kanpur',
      },
      department: 'Kanpur Electricity Supply Company (KESCO)',
      departmentCode: 'KESCO',
      operationalStatus: 'OPERATIONAL',
      condition: 'GOOD',
      criticality: 'CRITICAL',
      capacity: '40 MVA Dual Transformer',
      currentLoad: '64% Peak Load',
      dataQuality: {
        completenessPercent: 95,
        qualityLevel: 'HIGH',
        qualityScore: 94,
      },
      dataFreshness: 'REAL_TIME_SIMULATED',
      provenance: {
        sourceId: 'DS-KESCO-GRID-01',
        sourceName: 'KESCO Substation SCADA Grid',
        department: 'Kanpur Electricity Supply Company',
        timestamp: new Date().toISOString(),
        dataMode: 'SIMULATED',
        dataQuality: 'HIGH',
        lastValidated: new Date().toISOString(),
        validationStatus: 'VALIDATED',
        dataPublisher: 'KESCO Power Grid Operations',
        publisherRole: 'MUNICIPAL',
        acquisitionMethod: 'SIMULATED',
        systemLineage: ['SCOS-Twin-Sync-v1.0', 'KESCO-SCADA-Ingest'],
      },
      lastUpdated: new Date().toISOString(),
      governance: {
        ...DEFAULT_GOVERNANCE,
        verificationStatus: 'PROTOTYPE',
      },
      attributes: {
        voltageKV: 33,
        feederCount: 8,
        backupDieselGen: true,
      },
    },
    {
      entityId: 'TWIN-WARD-12',
      entityType: 'WARD',
      name: 'Ward 12 Administrative & Inundation Basin',
      description: 'Low-elevation urban basin with dense commercial activities and storm vulnerability',
      location: {
        latitude: 26.4578,
        longitude: 80.3418,
        ward: 'Ward 12 — Parade Crossing',
        zone: 'Zone 1 — Central Corridor',
        landmark: 'Parade Ground & Naveen Market Perimeter',
        address: 'Ward 12 Civil Basin, Kanpur',
      },
      department: 'Kanpur Nagar Nigam',
      departmentCode: 'MUNICIPAL',
      operationalStatus: 'DEGRADED',
      condition: 'FAIR',
      criticality: 'HIGH',
      capacity: '42,000 Residents',
      currentLoad: 'High Commercial Footfall',
      dataQuality: {
        completenessPercent: 92,
        qualityLevel: 'HIGH',
        qualityScore: 90,
      },
      dataFreshness: 'FRESH',
      provenance: {
        sourceId: 'DS-KNN-CIVIL-01',
        sourceName: 'Kanpur Nagar Nigam Ward GIS Registry',
        department: 'Kanpur Nagar Nigam',
        timestamp: new Date().toISOString(),
        dataMode: 'SIMULATED',
        dataQuality: 'HIGH',
        lastValidated: new Date().toISOString(),
        validationStatus: 'VALIDATED',
        dataPublisher: 'Kanpur Nagar Nigam Works Department',
        publisherRole: 'MUNICIPAL',
        acquisitionMethod: 'SIMULATED',
        systemLineage: ['SCOS-Twin-Sync-v1.0'],
      },
      lastUpdated: new Date().toISOString(),
      governance: {
        ...DEFAULT_GOVERNANCE,
        verificationStatus: 'VERIFIED',
      },
      attributes: {
        averageElevationMeters: 124,
        imperviousSurfacePercent: 82,
      },
    },
  ];

  /**
   * Prototype dependency relationships between urban entities
   */
  private prototypeDependencies: TwinDependency[] = [
    {
      relationshipId: 'DEP-ROAD-DRAIN-01',
      sourceEntityId: 'INFRA-ROAD-PARADE-CORRIDOR',
      sourceEntityType: 'ROAD',
      sourceEntityName: 'Major Road A (Parade Crossing Corridor)',
      targetEntityId: 'INFRA-DRAIN-NALA-17',
      targetEntityType: 'DRAIN',
      targetEntityName: 'Drainage Nala Point 17 (Parade Channel)',
      relationshipType: 'AFFECTED_BY',
      direction: 'OUTGOING',
      confidence: 0.94,
      verificationStatus: 'PROTOTYPE',
      description: 'Corridor road surface drainage is physically dependent on Nala Point 17 gravity discharge capacity.',
      provenance: 'Kanpur Stormwater Master Plan Model & Spatial Overlay',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-HOSP-ROAD-01',
      sourceEntityId: 'INFRA-HOSP-URSULA-MEMORIAL',
      sourceEntityType: 'HOSPITAL',
      sourceEntityName: 'Ursula Horsman Memorial Hospital Access Corridor',
      targetEntityId: 'INFRA-ROAD-PARADE-CORRIDOR',
      targetEntityType: 'ROAD',
      targetEntityName: 'Major Road A (Parade Crossing Corridor)',
      relationshipType: 'DEPENDS_ON',
      direction: 'OUTGOING',
      confidence: 0.91,
      verificationStatus: 'INFERRED',
      description: 'Emergency trauma ambulance transit route relies on navigable conditions along Parade Corridor.',
      provenance: 'Emergency Response Spatial Routing Network',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-PUMP-DRAIN-01',
      sourceEntityId: 'INFRA-PUMP-PARADE-B',
      sourceEntityType: 'PUMP_STATION',
      sourceEntityName: 'Dewatering Pump Station B (Parade Square)',
      targetEntityId: 'INFRA-DRAIN-NALA-17',
      targetEntityType: 'DRAIN',
      targetEntityName: 'Drainage Nala Point 17 (Parade Channel)',
      relationshipType: 'SUPPORTS',
      direction: 'OUTGOING',
      confidence: 0.96,
      verificationStatus: 'PROTOTYPE',
      description: 'Stationary diesel pump station accelerates dewatering into downstream channel during high tide/siltation.',
      provenance: 'Jal Sansthan Pumping Station Operational Schema',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-PWR-PUMP-01',
      sourceEntityId: 'TWIN-PWR-CIVIL-LINES',
      sourceEntityType: 'POWER_SUBSTATION',
      sourceEntityName: 'Civil Lines 33/11kV Primary Substation',
      targetEntityId: 'INFRA-PUMP-PARADE-B',
      targetEntityType: 'PUMP_STATION',
      targetEntityName: 'Dewatering Pump Station B (Parade Square)',
      relationshipType: 'SUPPLIES',
      direction: 'OUTGOING',
      confidence: 0.88,
      verificationStatus: 'PROTOTYPE',
      description: 'Feeds primary 3-phase electric motors for auxiliary dewatering pumps.',
      provenance: 'KESCO Municipal Substation Distribution Network',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-JNC-ROAD-01',
      sourceEntityId: 'INFRA-JNC-PARADE-CHAURAHA',
      sourceEntityType: 'JUNCTION',
      sourceEntityName: 'Parade Chauraha Traffic Junction',
      targetEntityId: 'INFRA-ROAD-PARADE-CORRIDOR',
      targetEntityType: 'ROAD',
      targetEntityName: 'Major Road A (Parade Crossing Corridor)',
      relationshipType: 'CONNECTS',
      direction: 'BIDIRECTIONAL',
      confidence: 0.98,
      verificationStatus: 'VERIFIED',
      description: 'Physical intersection connecting Parade Corridor with Mall Road commercial axis.',
      provenance: 'Kanpur Master Plan GIS Road Geometry',
      isPrototypeInferred: false,
    },
    {
      relationshipId: 'DEP-HOSP-MALL-01',
      sourceEntityId: 'INFRA-HOSP-URSULA-MEMORIAL',
      sourceEntityType: 'HOSPITAL',
      sourceEntityName: 'Ursula Horsman Memorial Hospital Access Corridor',
      targetEntityId: 'INFRA-ROAD-MALL-RD',
      targetEntityType: 'ROAD',
      targetEntityName: 'Mall Road East Arterial Segment',
      relationshipType: 'CONNECTED_TO',
      direction: 'OUTGOING',
      confidence: 0.95,
      verificationStatus: 'INFERRED',
      description: 'Secondary emergency ambulance diversion route during Parade waterlogging.',
      provenance: 'Kanpur Traffic Police Emergency Corridor Route Map',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-DRAIN-WARD-01',
      sourceEntityId: 'INFRA-DRAIN-NALA-17',
      sourceEntityType: 'DRAIN',
      sourceEntityName: 'Drainage Nala Point 17 (Parade Channel)',
      targetEntityId: 'TWIN-WARD-12',
      targetEntityType: 'WARD',
      targetEntityName: 'Ward 12 Administrative & Inundation Basin',
      relationshipType: 'DRAINS',
      direction: 'OUTGOING',
      confidence: 0.93,
      verificationStatus: 'PROTOTYPE',
      description: 'Primary gravitational stormwater catchment outlet for Ward 12 low-lying zone.',
      provenance: 'Kanpur Municipal Drainage Basin Survey',
      isPrototypeInferred: true,
    },
    {
      relationshipId: 'DEP-WATER-PIPE-01',
      sourceEntityId: 'INFRA-WAT-MAIN-FEEDER',
      sourceEntityType: 'WATER_PIPELINE',
      sourceEntityName: 'Benajhabar Water Treatment Feeder Trunk 450mm',
      targetEntityId: 'INFRA-HOSP-URSULA-MEMORIAL',
      targetEntityType: 'HOSPITAL',
      targetEntityName: 'Ursula Horsman Memorial Hospital Access Corridor',
      relationshipType: 'SUPPLIES',
      direction: 'OUTGOING',
      confidence: 0.92,
      verificationStatus: 'PROTOTYPE',
      description: 'Supplies potable chlorinated water supply to emergency hospital storage tanks.',
      provenance: 'Kanpur Jal Sansthan Water Network Diagram',
      isPrototypeInferred: true,
    },
  ];

  /**
   * Adapter: Map CivilInfrastructureAsset to TwinEntity
   */
  private mapAssetToTwinEntity(asset: CivilInfrastructureAsset): TwinEntity {
    let entityType: TwinEntityType = 'PUBLIC_FACILITY';
    switch (asset.assetType) {
      case 'ROAD':
        entityType = 'ROAD';
        break;
      case 'ROAD_JUNCTION':
        entityType = 'JUNCTION';
        break;
      case 'DRAIN':
        entityType = 'DRAIN';
        break;
      case 'DRAINAGE_NETWORK':
        entityType = 'DRAINAGE_CHANNEL';
        break;
      case 'PUMPING_STATION':
        entityType = 'PUMP_STATION';
        break;
      case 'WATER_PIPELINE':
        entityType = 'WATER_PIPELINE';
        break;
      case 'HOSPITAL':
      case 'HEALTH_FACILITY':
        entityType = 'HOSPITAL';
        break;
      case 'TRAFFIC_SIGNAL':
        entityType = 'TRAFFIC_ASSET';
        break;
      case 'CRITICAL_FACILITY':
        entityType = 'CRITICAL_FACILITY';
        break;
      case 'PUBLIC_BUILDING':
      case 'MUNICIPAL_ASSET':
        entityType = 'PUBLIC_FACILITY';
        break;
      case 'FLOOD_PRONE_ZONE':
        entityType = 'WARD';
        break;
      default:
        entityType = 'PUBLIC_FACILITY';
    }

    const verificationStatus: TwinVerificationStatus =
      asset.validationStatus === 'FULLY_VERIFIED' ? 'VERIFIED' : 'PROTOTYPE';

    return {
      entityId: asset.assetId,
      entityType,
      name: asset.assetName,
      description: `Civil Infrastructure Asset managed by ${asset.department}`,
      location: asset.location,
      department: asset.department,
      departmentCode: asset.departmentId,
      operationalStatus: asset.status as TwinOperationalStatus,
      condition: asset.condition as TwinCondition,
      criticality: asset.criticality as TwinCriticality,
      capacity: asset.capacity,
      currentLoad: asset.attributes?.waterloggingDepth_cm
        ? `Waterlogged: ${asset.attributes.waterloggingDepth_cm} cm`
        : asset.capacity,
      dataQuality: {
        completenessPercent: asset.quality?.completenessPercent ?? 90,
        qualityLevel: asset.quality?.qualityLevel ?? 'HIGH',
        qualityScore: asset.quality?.qualityScore ?? 88,
      },
      dataFreshness: 'REAL_TIME_SIMULATED',
      provenance: asset.provenance,
      lastUpdated: asset.lastUpdated,
      sourceAssetId: asset.assetId,
      governance: {
        ...DEFAULT_GOVERNANCE,
        verificationStatus,
      },
      attributes: asset.attributes || {},
    };
  }

  /**
   * Retrieve all Digital Twin entities (synchronized with infrastructureStore)
   */
  public getAllEntities(): TwinEntity[] {
    const rawAssets = infrastructureStore.getAllAssets();
    const mappedEntities = rawAssets.map((asset) => this.mapAssetToTwinEntity(asset));
    return [...mappedEntities, ...this.supplementaryEntities];
  }

  /**
   * Retrieve a specific entity by ID
   */
  public getEntity(entityId: string): TwinEntity | undefined {
    const all = this.getAllEntities();
    return all.find((e) => e.entityId === entityId);
  }

  /**
   * Retrieve entities filtered by type
   */
  public getEntitiesByType(entityType: TwinEntityType): TwinEntity[] {
    return this.getAllEntities().filter((e) => e.entityType === entityType);
  }

  /**
   * Retrieve outgoing dependencies (what this entity depends on or affects)
   */
  public getDependencies(entityId: string): TwinDependency[] {
    return this.prototypeDependencies.filter(
      (dep) => dep.sourceEntityId === entityId || (dep.direction === 'BIDIRECTIONAL' && dep.targetEntityId === entityId)
    );
  }

  /**
   * Retrieve incoming dependents (what entities depend on this entity)
   */
  public getDependents(entityId: string): TwinDependency[] {
    return this.prototypeDependencies.filter(
      (dep) => dep.targetEntityId === entityId || (dep.direction === 'BIDIRECTIONAL' && dep.sourceEntityId === entityId)
    );
  }

  /**
   * Retrieve spatial relationships for an entity using the Haversine spatial engine
   */
  public getSpatialRelationships(
    entityId: string,
    radiusMeters: number = 2500
  ): TwinSpatialRelationship[] {
    const targetEntity = this.getEntity(entityId);
    if (!targetEntity) return [];

    const allEntities = this.getAllEntities().filter((e) => e.entityId !== entityId);
    const nearby = filterByProximity(
      targetEntity.location.latitude,
      targetEntity.location.longitude,
      allEntities,
      radiusMeters
    );

    return nearby.map((res, index) => {
      let spatialType = 'PROXIMITY_NEIGHBOR';
      if (res.item.entityType === 'HOSPITAL' && targetEntity.entityType === 'ROAD') {
        spatialType = 'CORRIDOR_ACCESS_TO_HOSPITAL';
      } else if (res.item.entityType === 'DRAIN' && targetEntity.entityType === 'ROAD') {
        spatialType = 'SURFACE_RUNOFF_DISCHARGE';
      } else if (res.item.entityType === 'PUMP_STATION' && targetEntity.entityType === 'DRAIN') {
        spatialType = 'PUMP_DRAINAGE_OUTLET';
      }

      return {
        relationshipId: `SPATIAL-${entityId}-${res.item.entityId}-${index}`,
        sourceEntityId: entityId,
        targetEntityId: res.item.entityId,
        targetEntityName: res.item.name,
        targetEntityType: res.item.entityType,
        spatialType,
        distanceMeters: res.distanceMeters,
        distanceKm: res.distanceKm,
        isWithinCriticalBuffer: res.distanceMeters <= 1000,
        verificationStatus: 'VERIFIED',
      };
    });
  }

  /**
   * Dynamically derived operational state for an entity
   */
  public getOperationalState(entityId: string): TwinOperationalState | undefined {
    const entity = this.getEntity(entityId);
    if (!entity) return undefined;

    // Check active incidents in incidentStore
    const allIncidents = incidentStore.getAllIncidents();
    const associatedIncidents = allIncidents.filter((inc) => {
      // Direct asset reference or spatial proximity (< 1500m)
      const dist = calculateHaversineDistance(
        entity.location.latitude,
        entity.location.longitude,
        inc.latitude,
        inc.longitude
      );
      return dist.distanceMeters <= 1500;
    });

    const activeIncidents = associatedIncidents.filter(
      (inc) => inc.current_status !== 'RESOLVED' && inc.current_status !== 'CLOSED'
    );

    // Predictive Risk Context
    const riskZones = predictionStore.getAllRiskZones();
    const matchingZone = riskZones.find((z) =>
      entity.location.ward.toLowerCase().includes(z.zone_name.toLowerCase()) ||
      z.zone_name.toLowerCase().includes(entity.location.ward.toLowerCase())
    );

    const directDependencies = this.getDependencies(entityId);
    const directDependents = this.getDependents(entityId);

    return {
      entityId: entity.entityId,
      entityName: entity.name,
      entityType: entity.entityType,
      operationalStatus: entity.operationalStatus,
      condition: entity.condition,
      criticality: entity.criticality,
      activeIncidentCount: activeIncidents.length,
      associatedIncidentIds: activeIncidents.map((i) => i.incident_id),
      predictiveRiskScore: matchingZone ? matchingZone.risk_score : 45,
      directDependenciesCount: directDependencies.length,
      directDependentsCount: directDependents.length,
      dataFreshness: entity.dataFreshness,
      governance: entity.governance,
    };
  }

  /**
   * Aggregate dynamic statistics for the Urban Digital Twin
   */
  public getTwinStatistics(): DigitalTwinStatistics {
    const entities = this.getAllEntities();
    const allIncidents = incidentStore.getAllIncidents();
    const activeIncidents = allIncidents.filter(
      (i) => i.current_status !== 'RESOLVED' && i.current_status !== 'CLOSED'
    );

    let criticalEntities = 0;
    let operationalEntities = 0;
    let degradedEntities = 0;
    let disruptedEntities = 0;
    let offlineEntities = 0;
    const depts = new Set<string>();

    for (const e of entities) {
      if (e.criticality === 'CRITICAL' || e.criticality === 'HIGH') criticalEntities++;
      if (e.operationalStatus === 'OPERATIONAL') operationalEntities++;
      else if (e.operationalStatus === 'DEGRADED' || e.operationalStatus === 'CLOGGED_RISK')
        degradedEntities++;
      else if (e.operationalStatus === 'DISRUPTED') disruptedEntities++;
      else if (e.operationalStatus === 'OFFLINE' || e.operationalStatus === 'MAINTENANCE')
        offlineEntities++;

      if (e.department) depts.add(e.department);
    }

    return {
      totalEntities: entities.length,
      totalRelationships: this.prototypeDependencies.length,
      criticalEntities,
      operationalEntities,
      degradedEntities,
      disruptedEntities,
      offlineEntities,
      departmentsRepresented: depts.size,
      activeIncidents: activeIncidents.length,
      dataFreshnessSummary: {
        freshCount: entities.filter((e) => e.dataFreshness === 'FRESH' || e.dataFreshness === 'REAL_TIME_SIMULATED').length,
        staleCount: entities.filter((e) => e.dataFreshness === 'STALE' || e.dataFreshness === 'EXPIRING').length,
        totalCount: entities.length,
        averageQualityScore: Math.round(
          entities.reduce((acc, curr) => acc + curr.dataQuality.qualityScore, 0) / (entities.length || 1)
        ),
      },
      governanceNotice:
        'SCOS URBAN DIGITAL TWIN — PROTOTYPE ENGINEERING MODEL. SIMULATED / PROTOTYPE DATA.',
    };
  }

  /**
   * Generate Scenario Baseline Snapshot
   */
  public getBaselineSnapshot(): TwinScenarioBaseline {
    const entities = this.getAllEntities();
    const stats = this.getTwinStatistics();

    const entitiesSummaryByType: Record<string, number> = {};
    for (const e of entities) {
      entitiesSummaryByType[e.entityType] = (entitiesSummaryByType[e.entityType] || 0) + 1;
    }

    const systemStatus =
      stats.disruptedEntities > 0
        ? 'DISRUPTED'
        : stats.degradedEntities > 0
        ? 'DEGRADED'
        : 'OPERATIONAL';

    return {
      snapshotId: `TWIN-BASE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-KN-01`,
      generatedAt: new Date().toISOString(),
      entityCount: entities.length,
      relationshipCount: this.prototypeDependencies.length,
      activeIncidentCount: stats.activeIncidents,
      criticalInfrastructureCount: stats.criticalEntities,
      systemStatus,
      dataClassification: 'SIMULATED / PROTOTYPE DATA',
      provenanceSummary: {
        totalSources: 6,
        verifiedSources: 2,
        simulatedSources: 4,
        freshnessRatePercent: 96,
      },
      entitiesSummaryByType,
      disclaimer:
        'SCOS DIGITAL TWIN — PROTOTYPE ENGINEERING MODEL. Not a complete physical representation of the city.',
    };
  }

  /**
   * Complete Urban Digital Twin State
   */
  public getTwinState(): UrbanDigitalTwinState {
    const entities = this.getAllEntities();
    const dependencies = this.prototypeDependencies;
    const baselineSnapshot = this.getBaselineSnapshot();
    const statistics = this.getTwinStatistics();

    return {
      stateId: `SCOS-TWIN-STATE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entities,
      dependencies,
      baselineSnapshot,
      statistics,
      governance: DEFAULT_GOVERNANCE,
    };
  }
}

export const urbanDigitalTwinService = new UrbanDigitalTwinService();
