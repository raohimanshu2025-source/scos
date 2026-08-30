// =========================================================================
// SCOS CIVIL INFRASTRUCTURE & SPATIAL INTELLIGENCE STORE
// =========================================================================

import {
  CivilInfrastructureAsset,
  AssetType,
  AssetCondition,
  AssetCriticality,
  AssetStatus,
  NearbyAssetResult,
  CivilCascadeImpact,
  InfrastructureSummaryMetrics,
  SpatialRelationshipType,
} from '../types/infrastructure';
import { calculateHaversineDistance, filterByProximity } from './spatialEngine';
import { knowledgeGraphStore } from './knowledgeGraphStore';
import { EntityType, GraphEntity, GraphRelationship } from '../types/knowledgeGraph';

class InfrastructureStore {
  private assets: Map<string, CivilInfrastructureAsset> = new Map();

  constructor() {
    this.seedInitialAssets();
  }

  /**
   * Seed Kanpur Smart City Civil Infrastructure Asset Database
   */
  private seedInitialAssets() {
    const now = new Date().toISOString();

    const seedAssets: CivilInfrastructureAsset[] = [
      {
        assetId: 'INFRA-ROAD-PARADE-CORRIDOR',
        assetType: 'ROAD',
        assetName: 'Major Road A (Parade Crossing Corridor)',
        department: 'Kanpur Nagar Nigam',
        departmentId: 'dept-nagar',
        status: 'DISRUPTED',
        location: {
          latitude: 26.458,
          longitude: 80.342,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Near Parade Market & Christ Church College',
          address: 'Parade Crossing Main Arterial Road, Kanpur',
          geometryReference: {
            type: 'LINESTRING',
            coordinates: [
              [80.34, 26.456],
              [80.342, 26.458],
              [80.345, 26.46],
            ],
          },
        },
        criticality: 'HIGH',
        capacity: '4 Lanes (24,000 PCU/hr)',
        condition: 'POOR',
        dataSource: 'DS-KNN-CIVIL-01',
        provenance: {
          sourceId: 'DS-KNN-CIVIL-01',
          sourceName: 'Kanpur Nagar Nigam Works Department',
          department: 'Kanpur Nagar Nigam',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Nagar Nigam Works Department',
          publisherRole: 'MUNICIPAL',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 95,
          qualityLevel: 'HIGH',
          qualityScore: 92,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          surfaceType: 'Asphalt Concrete',
          lastResurfaced: '2024-11-15',
          waterloggingDepth_cm: 35,
        },
      },
      {
        assetId: 'INFRA-JNC-PARADE-CHAURAHA',
        assetType: 'ROAD_JUNCTION',
        assetName: 'Parade Chauraha Traffic Junction',
        department: 'Kanpur Traffic Police',
        departmentId: 'dept-traffic',
        status: 'DISRUPTED',
        location: {
          latitude: 26.4582,
          longitude: 80.3422,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Parade Junction Signal Post',
          address: 'Parade Chauraha, Civil Lines Crossing, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '60,000 Vehicles/Day',
        condition: 'POOR',
        dataSource: 'DS-KTP-TRAFFIC-01',
        provenance: {
          sourceId: 'DS-KTP-TRAFFIC-01',
          sourceName: 'Kanpur Traffic Police Control Center',
          department: 'Kanpur Traffic Police',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Traffic Police Control Center',
          publisherRole: 'TRAFFIC',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 92,
          qualityLevel: 'HIGH',
          qualityScore: 90,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          signalController: 'ITMS Smart Adaptive Controller #4',
          diversionActive: true,
        },
      },
      {
        assetId: 'INFRA-DRAIN-PARADE-NALA-17',
        assetType: 'DRAIN',
        assetName: 'Drainage Nala Point 17 (Parade Secondary Channel)',
        department: 'Kanpur Nagar Nigam',
        departmentId: 'dept-nagar',
        status: 'CLOGGED_RISK',
        location: {
          latitude: 26.4575,
          longitude: 80.3415,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Parallel to Parade Market Alley',
          address: 'Parade Drainage Arterial Nala, Kanpur',
        },
        criticality: 'HIGH',
        capacity: '14.5 Cumec Flow',
        condition: 'POOR',
        dataSource: 'DS-KNN-DRAINAGE-01',
        provenance: {
          sourceId: 'DS-KNN-DRAINAGE-01',
          sourceName: 'Kanpur Nagar Nigam Drainage Wing',
          department: 'Kanpur Nagar Nigam',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Nagar Nigam Drainage Wing',
          publisherRole: 'MUNICIPAL',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 98,
          qualityLevel: 'HIGH',
          qualityScore: 95,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          siltationPercent: 68,
          debrisObstruction: 'HIGH',
          lastDesilted: '2025-05-10',
        },
      },
      {
        assetId: 'INFRA-PUMP-PARADE-SQ-01',
        assetType: 'PUMPING_STATION',
        assetName: 'Dewatering Pump Station B (Parade Square)',
        department: 'Kanpur Nagar Nigam',
        departmentId: 'dept-nagar',
        status: 'OPERATIONAL',
        location: {
          latitude: 26.4585,
          longitude: 80.3425,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Parade Square Dewatering Shed',
          address: 'Parade Square Mobile Pumping Unit, Kanpur',
        },
        criticality: 'HIGH',
        capacity: '120 HP Heavy Diesel Pump',
        condition: 'GOOD',
        dataSource: 'DS-KNN-PUMP-01',
        provenance: {
          sourceId: 'DS-KNN-PUMP-01',
          sourceName: 'Kanpur Nagar Nigam Emergency Dewatering Cell',
          department: 'Kanpur Nagar Nigam',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Nagar Nigam Emergency Dewatering Cell',
          publisherRole: 'MUNICIPAL',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 90,
          qualityLevel: 'HIGH',
          qualityScore: 88,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          fuelReservePercent: 88,
          pumpPumpsActive: 1,
          maxDischargeLPS: 450,
        },
      },
      {
        assetId: 'INFRA-HOSP-URSULA-MEMORIAL',
        assetType: 'HOSPITAL',
        assetName: 'Ursula Horsman Memorial Hospital',
        department: 'District Health Services',
        departmentId: 'dept-health',
        status: 'OPERATIONAL',
        location: {
          latitude: 26.4592,
          longitude: 80.3435,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Mall Road Near Parade Crossing',
          address: 'Mall Road, Civil Lines, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '450 Beds, Apex Trauma Unit',
        condition: 'GOOD',
        dataSource: 'DS-HEALTH-GOV-01',
        provenance: {
          sourceId: 'DS-HEALTH-GOV-01',
          sourceName: 'District Health & Family Welfare Office',
          department: 'District Health Services',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'District Health & Family Welfare Office',
          publisherRole: 'HEALTH',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 100,
          qualityLevel: 'HIGH',
          qualityScore: 98,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          ambulanceCorridorAccess: 'IMPEDED_BY_WATERLOGGING',
          emergencyBedsAvailable: 24,
        },
      },
      {
        assetId: 'INFRA-WATER-BENAJHABAR-MAIN',
        assetType: 'WATER_PIPELINE',
        assetName: 'Benajhabar Trunk Water Feeder Pipeline',
        department: 'Kanpur Jal Sansthan',
        departmentId: 'dept-jal',
        status: 'OPERATIONAL',
        location: {
          latitude: 26.464,
          longitude: 80.336,
          ward: 'Ward 18 — Benajhabar',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Benajhabar Water Works Complex',
          address: 'Benajhabar Road, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '450 MLD Distribution Trunk',
        condition: 'FAIR',
        dataSource: 'DS-JAL-WATER-01',
        provenance: {
          sourceId: 'DS-JAL-WATER-01',
          sourceName: 'Kanpur Jal Sansthan Engineering Division',
          department: 'Kanpur Jal Sansthan',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Jal Sansthan Engineering Division',
          publisherRole: 'WATER',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 94,
          qualityLevel: 'HIGH',
          qualityScore: 91,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          pipeDiameter_mm: 1200,
          operatingPressure_bar: 3.8,
        },
      },
      {
        assetId: 'INFRA-FLOOD-ZONE-PARADE-LOW',
        assetType: 'FLOOD_PRONE_ZONE',
        assetName: 'Parade Low-Lying Monsoon Basin',
        department: 'District Administration',
        departmentId: 'dept-dist',
        status: 'DISRUPTED',
        location: {
          latitude: 26.458,
          longitude: 80.3418,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Basement Arcade & Market Courtyard',
          address: 'Parade Ground Depression Zone, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: 'N/A — Inundation Hotspot',
        condition: 'CRITICAL',
        dataSource: 'DS-DIST-CIVIL-01',
        provenance: {
          sourceId: 'DS-DIST-CIVIL-01',
          sourceName: 'Kanpur Disaster Management Authority',
          department: 'District Administration',
          timestamp: now,
          dataMode: 'HISTORICAL',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Disaster Management Authority',
          publisherRole: 'ADMINISTRATION',
          acquisitionMethod: 'HISTORICAL',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 96,
          qualityLevel: 'HIGH',
          qualityScore: 94,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'HISTORICAL',
        isSimulatedPrototype: true,
        attributes: {
          historicalFloods: ['2023-07-18', '2024-08-12', '2025-07-24'],
          vulnerabilityScore: 9.4,
        },
      },
      {
        assetId: 'INFRA-KESCO-SUBSTATION-PARADE',
        assetType: 'CRITICAL_FACILITY',
        assetName: 'Parade 11kV Electric Feeder Substation',
        department: 'Kanpur Electricity Supply Company (KESCO)',
        departmentId: 'dept-kesco',
        status: 'OPERATIONAL',
        location: {
          latitude: 26.459,
          longitude: 80.343,
          ward: 'Ward 12 — Parade Crossing',
          zone: 'Zone 1 — Central Corridor',
          landmark: 'Substation Yard Adjacent to Hospital',
          address: 'Mall Road Feeder Enclosure, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '11 kV / 415 V Grid Step-Down',
        condition: 'FAIR',
        dataSource: 'DS-KESCO-GRID-01',
        provenance: {
          sourceId: 'DS-KESCO-GRID-01',
          sourceName: 'KESCO Operations & Grid Control',
          department: 'KESCO',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'KESCO Operations & Grid Control',
          publisherRole: 'ELECTRICITY',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 92,
          qualityLevel: 'HIGH',
          qualityScore: 89,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          feederLinesConnected: 4,
          substationElevation_m: 124.5,
        },
      },
      {
        assetId: 'INFRA-HOSP-LLR-HALLETT',
        assetType: 'HOSPITAL',
        assetName: 'LLR (Hallett) District Government Hospital',
        department: 'District Health Services',
        departmentId: 'dept-health',
        status: 'OPERATIONAL',
        location: {
          latitude: 26.475,
          longitude: 80.322,
          ward: 'Ward 04 — Swaroop Nagar',
          zone: 'Zone 2 — North Corridor',
          landmark: 'GSVM Medical College Campus',
          address: 'Swaroop Nagar, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '1,200 Beds, Apex Regional Medical Center',
        condition: 'GOOD',
        dataSource: 'DS-HEALTH-GOV-01',
        provenance: {
          sourceId: 'DS-HEALTH-GOV-01',
          sourceName: 'District Health & Family Welfare Office',
          department: 'District Health Services',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'District Health & Family Welfare Office',
          publisherRole: 'HEALTH',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 98,
          qualityLevel: 'HIGH',
          qualityScore: 96,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          traumaCenterLevel: 1,
          icuBedsAvailable: 18,
        },
      },
      {
        assetId: 'INFRA-PUMP-JUHI-CULVERT',
        assetType: 'PUMPING_STATION',
        assetName: 'Juhi Underground Dewatering Pump Unit',
        department: 'Kanpur Jal Sansthan',
        departmentId: 'dept-jal',
        status: 'MAINTENANCE',
        location: {
          latitude: 26.438,
          longitude: 80.331,
          ward: 'Ward 24 — Juhi Bridge',
          zone: 'Zone 3 — South Corridor',
          landmark: 'Juhi Railway Culvert Underpass',
          address: 'Juhi Culvert, Kanpur',
        },
        criticality: 'CRITICAL',
        capacity: '180 HP Heavy Pumping Engine',
        condition: 'POOR',
        dataSource: 'DS-JAL-WATER-01',
        provenance: {
          sourceId: 'DS-JAL-WATER-01',
          sourceName: 'Kanpur Jal Sansthan Dewatering Maintenance Unit',
          department: 'Kanpur Jal Sansthan',
          timestamp: now,
          dataMode: 'SIMULATED',
          dataQuality: 'MEDIUM',
          lastValidated: now,
          validationStatus: 'VALIDATED',
          dataPublisher: 'Kanpur Jal Sansthan Dewatering Maintenance Unit',
          publisherRole: 'WATER',
          acquisitionMethod: 'SIMULATED',
          systemLineage: ['SCOS-Ingestion-v1.2', 'Phase8-Civil-Spatial-Engine'],
        },
        quality: {
          completenessPercent: 88,
          qualityLevel: 'MEDIUM',
          qualityScore: 82,
        },
        validationStatus: 'FULLY_VERIFIED',
        lastUpdated: now,
        dataMode: 'SIMULATED',
        isSimulatedPrototype: true,
        attributes: {
          underpassDepressionDepth_m: 2.8,
        },
      },
    ];

    for (const asset of seedAssets) {
      this.assets.set(asset.assetId, asset);
      this.syncAssetToKnowledgeGraph(asset);
    }
  }

  /**
   * Sync infrastructure asset node into existing Knowledge Graph store
   */
  private syncAssetToKnowledgeGraph(asset: CivilInfrastructureAsset) {
    try {
      const entityTypeMap: Record<AssetType, EntityType> = {
        ROAD: 'ROAD',
        ROAD_JUNCTION: 'TRAFFIC_POINT',
        DRAIN: 'DRAINAGE_ASSET',
        DRAINAGE_NETWORK: 'DRAINAGE_ASSET',
        PUMPING_STATION: 'WATER_ASSET',
        WATER_PIPELINE: 'WATER_ASSET',
        HOSPITAL: 'HOSPITAL',
        HEALTH_FACILITY: 'FACILITY',
        BRIDGE: 'INFRASTRUCTURE',
        TRAFFIC_SIGNAL: 'TRAFFIC_POINT',
        PUBLIC_BUILDING: 'INFRASTRUCTURE',
        CRITICAL_FACILITY: 'INFRASTRUCTURE',
        FLOOD_PRONE_ZONE: 'LOCATION',
        MUNICIPAL_ASSET: 'ASSET',
      };

      const kgEntity: GraphEntity = {
        id: asset.assetId,
        type: entityTypeMap[asset.assetType] || 'INFRASTRUCTURE',
        name: asset.assetName,
        description: `Civil Asset (${asset.assetType}) managed by ${asset.department}. Status: ${asset.status}`,
        source: asset.dataMode === 'HISTORICAL' ? 'PUBLIC_DATA' : 'SIMULATED',
        confidence: asset.quality.qualityScore / 100,
        status: asset.status,
        latitude: asset.location.latitude,
        longitude: asset.location.longitude,
        attributes: {
          assetType: asset.assetType,
          department: asset.department,
          condition: asset.condition,
          criticality: asset.criticality,
          ward: asset.location.ward,
          zone: asset.location.zone,
          capacity: asset.capacity,
          isSimulatedPrototype: true,
          ...asset.attributes,
        },
      };

      knowledgeGraphStore.createEntity(kgEntity);

      // Add default spatial edge if near Parade Corridor
      if (asset.assetId !== 'INFRA-ROAD-PARADE-CORRIDOR') {
        const dist = calculateHaversineDistance(
          asset.location.latitude,
          asset.location.longitude,
          26.458,
          80.342
        );
        if (dist.isValid && dist.distanceMeters <= 2000) {
          const kgRel: GraphRelationship = {
            id: `REL-${asset.assetId}-NEAR-PARADE`,
            source_id: asset.assetId,
            source_type: kgEntity.type,
            relationship_type: 'NEAR',
            target_id: 'INFRA-ROAD-PARADE-CORRIDOR',
            target_type: 'ROAD',
            source: 'SIMULATED',
            weight: Math.max(10, 100 - Math.round(dist.distanceMeters / 20)),
            attributes: { distanceMeters: dist.distanceMeters, distanceKm: dist.distanceKm },
          };
          knowledgeGraphStore.createRelationship(kgRel);
        }
      }
    } catch (err) {
      console.warn('Failed to sync asset to Knowledge Graph:', err);
    }
  }

  // --- PUBLIC QUERY & MANAGEMENT APIs ---

  public getAllAssets(filters?: {
    type?: string;
    department?: string;
    condition?: string;
    criticality?: string;
    zone?: string;
    ward?: string;
  }): CivilInfrastructureAsset[] {
    let result = Array.from(this.assets.values());

    if (filters) {
      if (filters.type) {
        result = result.filter(
          (a) => a.assetType.toUpperCase() === filters.type!.toUpperCase()
        );
      }
      if (filters.department) {
        result = result.filter((a) =>
          a.department.toLowerCase().includes(filters.department!.toLowerCase())
        );
      }
      if (filters.condition) {
        result = result.filter(
          (a) => a.condition.toUpperCase() === filters.condition!.toUpperCase()
        );
      }
      if (filters.criticality) {
        result = result.filter(
          (a) => a.criticality.toUpperCase() === filters.criticality!.toUpperCase()
        );
      }
      if (filters.zone) {
        result = result.filter((a) =>
          a.location.zone.toLowerCase().includes(filters.zone!.toLowerCase())
        );
      }
      if (filters.ward) {
        result = result.filter((a) =>
          a.location.ward.toLowerCase().includes(filters.ward!.toLowerCase())
        );
      }
    }

    return result;
  }

  public getAssetById(assetId: string): CivilInfrastructureAsset | undefined {
    return this.assets.get(assetId);
  }

  public createAsset(
    rawAsset: Partial<CivilInfrastructureAsset>
  ): CivilInfrastructureAsset {
    const now = new Date().toISOString();
    const assetId = rawAsset.assetId || `INFRA-ASSET-${Date.now()}`;

    const newAsset: CivilInfrastructureAsset = {
      assetId,
      assetType: rawAsset.assetType || 'MUNICIPAL_ASSET',
      assetName: rawAsset.assetName || 'Unregistered Civil Asset',
      department: rawAsset.department || 'Kanpur Nagar Nigam',
      departmentId: rawAsset.departmentId || 'dept-nagar',
      status: rawAsset.status || 'OPERATIONAL',
      location: {
        latitude: rawAsset.location?.latitude ?? 26.458,
        longitude: rawAsset.location?.longitude ?? 80.342,
        ward: rawAsset.location?.ward || 'Ward 12 — Parade Crossing',
        zone: rawAsset.location?.zone || 'Zone 1 — Central Corridor',
        landmark: rawAsset.location?.landmark,
        address: rawAsset.location?.address,
      },
      criticality: rawAsset.criticality || 'MEDIUM',
      capacity: rawAsset.capacity || 'Standard Operational Capacity',
      condition: rawAsset.condition || 'FAIR',
      dataSource: rawAsset.dataSource || 'DS-SIMULATED-01',
      provenance: rawAsset.provenance || {
        sourceId: 'DS-SIMULATED-01',
        sourceName: 'SCOS Ingestion Engine',
        department: rawAsset.department || 'Kanpur Nagar Nigam',
        timestamp: now,
        dataMode: 'SIMULATED',
        dataQuality: 'HIGH',
        lastValidated: now,
        validationStatus: 'VALIDATED',
        dataPublisher: 'SCOS Ingestion Engine',
        publisherRole: 'MUNICIPAL',
        acquisitionMethod: 'SIMULATED',
        systemLineage: ['SCOS-Manual-Create', 'Phase8-Civil-Spatial-Engine'],
      },
      quality: rawAsset.quality || {
        completenessPercent: 90,
        qualityLevel: 'HIGH',
        qualityScore: 90,
      },
      validationStatus: rawAsset.validationStatus || 'FULLY_VERIFIED',
      lastUpdated: now,
      dataMode: rawAsset.dataMode || 'SIMULATED',
      isSimulatedPrototype: true,
      attributes: rawAsset.attributes || {},
    };

    this.assets.set(assetId, newAsset);
    this.syncAssetToKnowledgeGraph(newAsset);
    return newAsset;
  }

  public updateAsset(
    assetId: string,
    updates: Partial<CivilInfrastructureAsset>
  ): CivilInfrastructureAsset | undefined {
    const existing = this.assets.get(assetId);
    if (!existing) return undefined;

    const updated: CivilInfrastructureAsset = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString(),
      location: {
        ...existing.location,
        ...(updates.location || {}),
      },
      quality: {
        ...existing.quality,
        ...(updates.quality || {}),
      },
    };

    this.assets.set(assetId, updated);
    this.syncAssetToKnowledgeGraph(updated);
    return updated;
  }

  /**
   * Spatial Proximity Query using Haversine Engine
   */
  public getNearbyAssets(
    latitude: number,
    longitude: number,
    radiusMeters: number = 2000
  ): NearbyAssetResult[] {
    const all = Array.from(this.assets.values());
    const proximityResults = filterByProximity(latitude, longitude, all, radiusMeters);

    return proximityResults.map((res) => {
      let spatialRelType: SpatialRelationshipType | string = 'NEAR';
      if (res.item.assetType === 'ROAD') spatialRelType = 'INCIDENT_AFFECTS_ROAD';
      else if (res.item.assetType === 'DRAIN') spatialRelType = 'INCIDENT_AFFECTS_DRAIN';
      else if (res.item.assetType === 'HOSPITAL') spatialRelType = 'ROAD_SERVES_HOSPITAL';
      else if (res.item.assetType === 'PUMPING_STATION') spatialRelType = 'PUMP_SERVES_ZONE';

      return {
        distanceMeters: res.distanceMeters,
        distanceKm: res.distanceKm,
        asset: res.item,
        assetType: res.item.assetType,
        source: res.item.dataSource,
        dataMode: res.item.dataMode,
        quality: res.item.quality.qualityLevel,
        spatialRelType,
      };
    });
  }

  /**
   * Incident Infrastructure Impact & Cascade Analysis
   */
  public getIncidentImpactChain(
    incidentId: string,
    latitude: number = 26.458,
    longitude: number = 80.342
  ): CivilCascadeImpact {
    const nearby = this.getNearbyAssets(latitude, longitude, 2500);

    const impactChain = [
      {
        step: 1,
        trigger: 'Severe Monsoon Waterlogging / Canal Overflow',
        affectedAsset: 'Major Road A (Parade Crossing Corridor)',
        assetType: 'ROAD' as AssetType,
        potentialImpact:
          'Road inundated up to 35cm depth causing vehicular traffic stagnation and transit delays.',
        verificationStatus: 'POTENTIAL' as const,
        mitigationAction:
          'Propose traffic diversion to Mall Road; request field verification from Traffic Police.',
      },
      {
        step: 2,
        trigger: 'Primary Channel Silt Accumulation (68%)',
        affectedAsset: 'Drainage Nala Point 17 (Parade Channel)',
        assetType: 'DRAIN' as AssetType,
        potentialImpact:
          'Reduced gravity discharge capacity prolonging inundation across Ward 12 low-lying basins.',
        verificationStatus: 'POSSIBLE' as const,
        mitigationAction:
          'Dispatch Kanpur Nagar Nigam suction gully emptier unit to clear clogged culvert.',
      },
      {
        step: 3,
        trigger: 'Arterial Corridor Impairment',
        affectedAsset: 'Ursula Horsman Memorial Hospital Access Corridor',
        assetType: 'HOSPITAL' as AssetType,
        potentialImpact:
          'Ambulance ingress/egress from Parade Gate delayed by an estimated 15-20 minutes.',
        verificationStatus: 'REQUIRES_VERIFICATION' as const,
        mitigationAction:
          'Coordinate dedicated priority emergency corridor with Traffic Command Center.',
      },
      {
        step: 4,
        trigger: 'Auxiliary Dewatering Engagement',
        affectedAsset: 'Dewatering Pump Station B (Parade Square)',
        assetType: 'PUMPING_STATION' as AssetType,
        potentialImpact:
          'High diesel discharge load; fuel reserve at 88% requiring monitoring during prolonged storm.',
        verificationStatus: 'POTENTIAL' as const,
        mitigationAction:
          'Alert Kanpur Jal Sansthan fueling team to ensure auxiliary diesel tanker readiness.',
      },
    ];

    return {
      incidentId,
      incidentTitle: 'Monsoon Inundation & Corridor Disruption at Parade Crossing',
      location: {
        latitude,
        longitude,
        ward: 'Ward 12 — Parade Crossing',
        zone: 'Zone 1 — Central Corridor',
      },
      nearbyAssets: nearby,
      impactChain,
      disclaimer:
        'SIMULATED / PROTOTYPE INFRASTRUCTURE IMPACT ANALYSIS — Operational decisions require human officer authorization.',
    };
  }

  /**
   * Summary Metrics for Dashboard
   */
  public getSummaryMetrics(): InfrastructureSummaryMetrics {
    const assets = Array.from(this.assets.values());

    const conditionDistribution: Record<AssetCondition, number> = {
      GOOD: 0,
      FAIR: 0,
      POOR: 0,
      CRITICAL: 0,
      UNKNOWN: 0,
    };

    const criticalityDistribution: Record<AssetCriticality, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    let roadCount = 0;
    let drainageCount = 0;
    let healthCount = 0;
    let criticalFacilityCount = 0;
    let pumpingStationCount = 0;
    let trafficCount = 0;

    for (const a of assets) {
      conditionDistribution[a.condition] = (conditionDistribution[a.condition] || 0) + 1;
      criticalityDistribution[a.criticality] = (criticalityDistribution[a.criticality] || 0) + 1;

      if (a.assetType === 'ROAD') roadCount++;
      else if (a.assetType === 'DRAIN' || a.assetType === 'DRAINAGE_NETWORK') drainageCount++;
      else if (a.assetType === 'HOSPITAL' || a.assetType === 'HEALTH_FACILITY') healthCount++;
      else if (a.assetType === 'CRITICAL_FACILITY' || a.assetType === 'PUBLIC_BUILDING')
        criticalFacilityCount++;
      else if (a.assetType === 'PUMPING_STATION') pumpingStationCount++;
      else if (a.assetType === 'ROAD_JUNCTION' || a.assetType === 'TRAFFIC_SIGNAL') trafficCount++;
    }

    return {
      totalAssets: assets.length,
      roadCount,
      drainageCount,
      healthCount,
      criticalFacilityCount,
      pumpingStationCount,
      trafficCount,
      conditionDistribution,
      criticalityDistribution,
      disclaimer:
        'SIMULATED / PROTOTYPE DATA — SCOS Civil Infrastructure & Geospatial Intelligence Layer.',
    };
  }
}

export const infrastructureStore = new InfrastructureStore();
