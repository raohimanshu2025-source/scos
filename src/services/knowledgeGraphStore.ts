/**
 * SCOS Phase 5B.6 — Knowledge Graph & Contextual Intelligence Store
 * In-memory graph database containing entities, relationships, historical events,
 * cascade impact rules, and contextual graph traversal methods for Kanpur Smart City.
 */

import {
  GraphEntity,
  GraphRelationship,
  GraphNeighborhood,
  IncidentContext,
  CascadeImpactResult,
  CascadeImpactItem,
  GraphStats,
  GraphDemoStep,
  EntityType,
  RelationshipType,
} from '../types/knowledgeGraph';

class KnowledgeGraphStore {
  private entities: Map<string, GraphEntity> = new Map();
  private relationships: Map<string, GraphRelationship> = new Map();
  private demoStepIndex: number = 0;

  constructor() {
    this.seedInitialGraph();
  }

  /**
   * Seed Initial Kanpur Smart City Knowledge Graph
   */
  private seedInitialGraph() {
    const initialEntities: GraphEntity[] = [
      // 1. City & Administrative Hierarchy
      {
        id: 'CITY-KANPUR',
        type: 'CITY',
        name: 'Kanpur Smart City',
        description: 'Metropolitan district of Kanpur, Uttar Pradesh',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { state: 'Uttar Pradesh', country: 'India', population: '3.1M', area_sq_km: 403 },
      },
      {
        id: 'ZONE-A',
        type: 'ZONE',
        name: 'Zone 1 — Central Urban Corridor',
        description: 'High-density commercial and civic hub of Kanpur',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { zone_code: 'Z-01', total_wards: 18, administrator: 'Zonal Officer Verma' },
      },
      {
        id: 'WARD-12',
        type: 'WARD',
        name: 'Ward 12 — Parade Crossing Ward',
        description: 'Monsoon vulnerability hotspot near Parade Market',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { ward_no: 12, population: '42,000', elevation_m: 124, vulnerability_index: 'HIGH' },
      },

      // 2. Roads & Physical Infrastructure
      {
        id: 'ROAD-PARADE-A',
        type: 'ROAD',
        name: 'Major Road A (Parade Crossing Corridor)',
        description: 'Arterial 4-lane urban corridor connecting Mall Road to Parade Ground',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        latitude: 26.458,
        longitude: 80.342,
        attributes: { width_m: 24, daily_traffic_pcu: 68000, drainage_capacity: 'MARGINAL' },
      },
      {
        id: 'DRAIN-POINT-17',
        type: 'DRAINAGE_ASSET',
        name: 'Drainage Nala Point 17',
        description: 'Primary stormwater discharge arterial channel servicing Ward 12',
        source: 'PUBLIC_DATA',
        confidence: 0.98,
        status: 'CLOGGED_RISK',
        latitude: 26.4575,
        longitude: 80.3415,
        attributes: { capacity_cumec: 14.5, siltation_percent: 65, last_cleaned: '2026-05-10' },
      },
      {
        id: 'PUMP-STATION-B',
        type: 'WATER_ASSET',
        name: 'Mobile Dewatering Pump Station B',
        description: 'Auxiliary diesel dewatering pump unit stationed at Parade Square',
        source: 'OBSERVED',
        confidence: 0.95,
        status: 'OPERATIONAL',
        latitude: 26.4585,
        longitude: 80.3425,
        attributes: { discharge_hp: 120, fuel_level_percent: 90, operator: 'Jal Sansthan Crew 3' },
      },

      // 3. Health & Critical Facilities
      {
        id: 'HOSPITAL-1',
        type: 'HOSPITAL',
        name: 'Ursula Horsman Memorial Hospital (Hospital 1)',
        description: '450-bed apex emergency regional healthcare facility',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'OPERATIONAL',
        latitude: 26.4592,
        longitude: 80.3435,
        attributes: { bed_capacity: 450, emergency_trauma: true, ambulance_count: 12 },
      },

      // 4. Municipal Departments
      {
        id: 'DEPT-MUNICIPAL',
        type: 'DEPARTMENT',
        name: 'Kanpur Municipal Corporation (KMC)',
        description: 'Civic sanitation, stormwater drainage, and solid waste authority',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { code: 'MUNICIPAL', nodal_officer: 'Er. A. K. Gupta', contact: '+91-512-2580001' },
      },
      {
        id: 'DEPT-TRAFFIC',
        type: 'DEPARTMENT',
        name: 'Kanpur Traffic Police (KTP)',
        description: 'Urban traffic enforcement, corridor diversions, and signal management',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { code: 'TRAFFIC', nodal_officer: 'Insp. R. P. Singh', contact: '+91-512-2580002' },
      },
      {
        id: 'DEPT-JAL-SANSTHAN',
        type: 'DEPARTMENT',
        name: 'Kanpur Jal Sansthan (KJS)',
        description: 'Water supply infrastructure and emergency dewatering pumps authority',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { code: 'JAL_SANSTHAN', nodal_officer: 'Er. S. K. Roy', contact: '+91-512-2580003' },
      },
      {
        id: 'DEPT-HEALTH',
        type: 'DEPARTMENT',
        name: 'District Health Department (KHD)',
        description: 'Emergency health services, epidemic prevention, and ambulance routing',
        source: 'PUBLIC_DATA',
        confidence: 1.0,
        status: 'ACTIVE',
        attributes: { code: 'HEALTH', nodal_officer: 'Dr. Neeta Sharma', contact: '+91-512-2580004' },
      },

      // 5. Active Incidents & Predictive Risks
      {
        id: 'INCIDENT-1024',
        type: 'INCIDENT',
        name: 'Waterlogging Incident #1024',
        description: 'Severe stormwater inundation at Major Road A Parade Crossing Corridor',
        source: 'OBSERVED',
        confidence: 0.96,
        status: 'IN_PROGRESS',
        latitude: 26.458,
        longitude: 80.342,
        attributes: { severity: 'CRITICAL', priority: 'P1', reported_by: 'IoT Sensor KNP-302 & Citizen Reports' },
      },
      {
        id: 'RISK-PARADE',
        type: 'RISK',
        name: 'Predictive Risk Zone Parade Crossing',
        description: 'AI Predicted monsoon waterlogging probability 78/100 (HIGH)',
        source: 'DERIVED',
        confidence: 0.92,
        status: 'AWAITING_REVIEW',
        attributes: { risk_score: 78, time_horizon: '2 Hours', cause: 'Heavy rain + Clogged Nala 17' },
      },

      // 6. Tasks & Recommendations
      {
        id: 'TASK-501',
        type: 'TASK',
        name: 'Task #501: Deploy Mobile Dewatering Pumps',
        description: 'Dispatch Jal Sansthan crew to clear Nala 17 and operate Pump B',
        source: 'DERIVED',
        confidence: 0.95,
        status: 'IN_PROGRESS',
        attributes: { assigned_dept: 'JAL_SANSTHAN', sla_minutes: 30, priority: 'HIGH' },
      },
      {
        id: 'TASK-502',
        type: 'TASK',
        name: 'Task #502: Issue Emergency Traffic Advisory',
        description: 'Divert non-essential traffic away from Major Road A Parade Corridor',
        source: 'DERIVED',
        confidence: 0.95,
        status: 'ASSIGNED',
        attributes: { assigned_dept: 'TRAFFIC', sla_minutes: 20, priority: 'HIGH' },
      },

      // 7. Simulated Historical Events (For Pattern Matching)
      {
        id: 'HIST-2025-01',
        type: 'HISTORICAL_EVENT',
        name: '2025 Monsoon Severe Waterlogging — Parade Road',
        description: 'Simulated historical event: 85mm rainfall caused 2.5ft inundation for 4 hours',
        source: 'SIMULATED',
        confidence: 1.0,
        status: 'RESOLVED',
        attributes: { year: 2025, rainfall_mm: 85, duration_hrs: 4, resolution_time_hrs: 2.5 },
      },
      {
        id: 'HIST-2024-02',
        type: 'HISTORICAL_EVENT',
        name: '2024 Drainage Failure — Ward 12 Nala Blockage',
        description: 'Simulated historical event: Silt accumulation blocked discharge during monsoon peak',
        source: 'SIMULATED',
        confidence: 1.0,
        status: 'RESOLVED',
        attributes: { year: 2024, root_cause: 'Solid Waste Obstruction', impact: 'Hospital Corridor Blocked' },
      },
    ];

    const initialRelationships: GraphRelationship[] = [
      // Geographical Containment
      { id: 'R1', source_id: 'ZONE-A', source_type: 'ZONE', relationship_type: 'LOCATED_IN', target_id: 'CITY-KANPUR', target_type: 'CITY', source: 'PUBLIC_DATA' },
      { id: 'R2', source_id: 'WARD-12', source_type: 'WARD', relationship_type: 'LOCATED_IN', target_id: 'ZONE-A', target_type: 'ZONE', source: 'PUBLIC_DATA' },
      { id: 'R3', source_id: 'ROAD-PARADE-A', source_type: 'ROAD', relationship_type: 'LOCATED_IN', target_id: 'WARD-12', target_type: 'WARD', source: 'PUBLIC_DATA' },
      { id: 'R4', source_id: 'DRAIN-POINT-17', source_type: 'DRAINAGE_ASSET', relationship_type: 'LOCATED_IN', target_id: 'WARD-12', target_type: 'WARD', source: 'PUBLIC_DATA' },
      { id: 'R5', source_id: 'HOSPITAL-1', source_type: 'HOSPITAL', relationship_type: 'LOCATED_IN', target_id: 'WARD-12', target_type: 'WARD', source: 'PUBLIC_DATA' },

      // Infrastructure Connectivity & Proximity
      { id: 'R6', source_id: 'ROAD-PARADE-A', source_type: 'ROAD', relationship_type: 'CONNECTED_TO', target_id: 'DRAIN-POINT-17', target_type: 'DRAINAGE_ASSET', source: 'PUBLIC_DATA' },
      { id: 'R7', source_id: 'ROAD-PARADE-A', source_type: 'ROAD', relationship_type: 'NEAR', target_id: 'HOSPITAL-1', target_type: 'HOSPITAL', source: 'PUBLIC_DATA' },
      { id: 'R8', source_id: 'DRAIN-POINT-17', source_type: 'DRAINAGE_ASSET', relationship_type: 'CONNECTED_TO', target_id: 'PUMP-STATION-B', target_type: 'WATER_ASSET', source: 'OBSERVED' },

      // Departmental Ownership
      { id: 'R9', source_id: 'DEPT-MUNICIPAL', source_type: 'DEPARTMENT', relationship_type: 'MANAGED_BY', target_id: 'DRAIN-POINT-17', target_type: 'DRAINAGE_ASSET', source: 'PUBLIC_DATA' },
      { id: 'R10', source_id: 'DEPT-JAL-SANSTHAN', source_type: 'DEPARTMENT', relationship_type: 'MANAGED_BY', target_id: 'PUMP-STATION-B', target_type: 'WATER_ASSET', source: 'PUBLIC_DATA' },
      { id: 'R11', source_id: 'DEPT-TRAFFIC', source_type: 'DEPARTMENT', relationship_type: 'RESPONSIBLE_FOR', target_id: 'ROAD-PARADE-A', target_type: 'ROAD', source: 'PUBLIC_DATA' },
      { id: 'R12', source_id: 'DEPT-HEALTH', source_type: 'DEPARTMENT', relationship_type: 'SERVES', target_id: 'HOSPITAL-1', target_type: 'HOSPITAL', source: 'PUBLIC_DATA' },

      // Incidents & Risk Connections
      { id: 'R13', source_id: 'INCIDENT-1024', source_type: 'INCIDENT', relationship_type: 'OCCURRED_AT', target_id: 'ROAD-PARADE-A', target_type: 'ROAD', source: 'OBSERVED' },
      { id: 'R14', source_id: 'INCIDENT-1024', source_type: 'INCIDENT', relationship_type: 'AFFECTS', target_id: 'DRAIN-POINT-17', target_type: 'DRAINAGE_ASSET', source: 'OBSERVED' },
      { id: 'R15', source_id: 'INCIDENT-1024', source_type: 'INCIDENT', relationship_type: 'AFFECTS', target_id: 'HOSPITAL-1', target_type: 'HOSPITAL', source: 'DERIVED' },
      { id: 'R16', source_id: 'RISK-PARADE', source_type: 'RISK', relationship_type: 'HAS_RISK', target_id: 'ROAD-PARADE-A', target_type: 'ROAD', source: 'DERIVED' },

      // Task Dependencies
      { id: 'R17', source_id: 'INCIDENT-1024', source_type: 'INCIDENT', relationship_type: 'HAS_TASK', target_id: 'TASK-501', target_type: 'TASK', source: 'DERIVED' },
      { id: 'R18', source_id: 'INCIDENT-1024', source_type: 'INCIDENT', relationship_type: 'HAS_TASK', target_id: 'TASK-502', target_type: 'TASK', source: 'DERIVED' },

      // Historical Correlations
      { id: 'R19', source_id: 'HIST-2025-01', source_type: 'HISTORICAL_EVENT', relationship_type: 'OCCURRED_AT', target_id: 'ROAD-PARADE-A', target_type: 'ROAD', source: 'SIMULATED' },
      { id: 'R20', source_id: 'HIST-2024-02', source_type: 'HISTORICAL_EVENT', relationship_type: 'OCCURRED_AT', target_id: 'DRAIN-POINT-17', target_type: 'DRAINAGE_ASSET', source: 'SIMULATED' },
    ];

    initialEntities.forEach((e) => this.entities.set(e.id, e));
    initialRelationships.forEach((r) => this.relationships.set(r.id, r));
  }

  // --- ENTITY & RELATIONSHIP CRUD ---

  public getEntity(id: string): GraphEntity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): GraphEntity[] {
    return Array.from(this.entities.values());
  }

  public getAllRelationships(): GraphRelationship[] {
    return Array.from(this.relationships.values());
  }

  public createEntity(entity: GraphEntity): GraphEntity {
    this.entities.set(entity.id, {
      ...entity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return entity;
  }

  public createRelationship(rel: GraphRelationship): GraphRelationship {
    this.relationships.set(rel.id, {
      ...rel,
      created_at: new Date().toISOString(),
    });
    return rel;
  }

  // --- GRAPH NEIGHBORHOOD TRAVERSAL ---

  public getNeighborhood(entityId: string, depth: number = 1): GraphNeighborhood {
    const centerEntity = this.getEntity(entityId);
    if (!centerEntity) {
      throw new Error(`Entity with ID ${entityId} not found in Knowledge Graph`);
    }

    const directRels: GraphRelationship[] = [];
    const connectedEntityIds = new Set<string>();

    for (const rel of this.relationships.values()) {
      if (rel.source_id === entityId) {
        directRels.push(rel);
        connectedEntityIds.add(rel.target_id);
      } else if (rel.target_id === entityId) {
        directRels.push(rel);
        connectedEntityIds.add(rel.source_id);
      }
    }

    const connectedEntities: GraphEntity[] = [];
    connectedEntityIds.forEach((id) => {
      const ent = this.getEntity(id);
      if (ent) connectedEntities.push(ent);
    });

    return {
      centerEntity,
      directRelationships: directRels,
      connectedEntities,
    };
  }

  // --- SEARCH ENTITIES ---

  public searchEntities(query: string, filterType?: EntityType): GraphEntity[] {
    const cleanQuery = query.trim().toLowerCase();
    return Array.from(this.entities.values()).filter((e) => {
      const matchesType = filterType ? e.type === filterType : true;
      if (!matchesType) return false;
      if (!cleanQuery) return true;

      const nameMatch = e.name.toLowerCase().includes(cleanQuery);
      const descMatch = (e.description || '').toLowerCase().includes(cleanQuery);
      const idMatch = e.id.toLowerCase().includes(cleanQuery);
      const attrMatch = JSON.stringify(e.attributes).toLowerCase().includes(cleanQuery);

      return nameMatch || descMatch || idMatch || attrMatch;
    });
  }

  // --- CONTEXT ENGINE FOR INCIDENTS ---

  public getContextForIncident(incidentId: string): IncidentContext {
    const incEntity = this.getEntity(incidentId) || Array.from(this.entities.values()).find((e) => e.id === incidentId);

    const fallbackTitle = incEntity ? incEntity.name : `Waterlogging Incident #${incidentId}`;
    const roadEntity = this.getEntity('ROAD-PARADE-A');
    const wardEntity = this.getEntity('WARD-12');
    const zoneEntity = this.getEntity('ZONE-A');
    const drainEntity = this.getEntity('DRAIN-POINT-17');
    const pumpEntity = this.getEntity('PUMP-STATION-B');
    const hospitalEntity = this.getEntity('HOSPITAL-1');

    const municipalDept = this.getEntity('DEPT-MUNICIPAL');
    const trafficDept = this.getEntity('DEPT-TRAFFIC');
    const jalDept = this.getEntity('DEPT-JAL-SANSTHAN');
    const healthDept = this.getEntity('DEPT-HEALTH');

    const hist1 = this.getEntity('HIST-2025-01');
    const hist2 = this.getEntity('HIST-2024-02');

    const riskEntity = this.getEntity('RISK-PARADE');
    const task1 = this.getEntity('TASK-501');
    const task2 = this.getEntity('TASK-502');

    const cascadeResult = this.getCascadeImpact(incidentId);

    return {
      incidentId,
      incidentTitle: fallbackTitle,
      incidentEntity: incEntity,
      locationEntity: roadEntity,
      wardEntity,
      zoneEntity,
      nearbyAssets: [drainEntity, pumpEntity].filter(Boolean) as GraphEntity[],
      nearbyFacilities: [hospitalEntity].filter(Boolean) as GraphEntity[],
      responsibleDepartments: [municipalDept, trafficDept, jalDept, healthDept].filter(Boolean) as GraphEntity[],
      historicalEvents: [hist1, hist2].filter(Boolean) as GraphEntity[],
      currentRisk: riskEntity,
      openTasks: [task1, task2].filter(Boolean) as GraphEntity[],
      cascadeImpacts: cascadeResult.cascadeChain,
      aiContextSummary:
        'Graph Context Analysis: Waterlogging at Major Road A directly threatens Emergency Hospital 1 access. Requires immediate joint deployment of Municipal Nala desilting, Jal Sansthan Dewatering Pump B, and Traffic Police corridor diversion.',
    };
  }

  // --- CASCADE IMPACT ANALYSIS ---

  public getCascadeImpact(primaryEntityId: string): CascadeImpactResult {
    const primaryEnt = this.getEntity(primaryEntityId) || this.getEntity('INCIDENT-1024') || Array.from(this.entities.values())[0];

    const cascadeChain: CascadeImpactItem[] = [
      {
        level: 1,
        event: 'Primary Trigger: Stormwater Drainage Blockage at Nala Point 17',
        downstreamImpacts: [
          'Surface water overflow accumulating to 2.0+ feet',
          'Reduced stormwater runoff flow velocity along Ward 12 channel',
        ],
        affectedDepartments: ['Municipal Services (KMC)', 'Jal Sansthan (KJS)'],
        probability: 'HIGH',
        severity: 'HIGH',
        verificationStatus: 'Requires verification',
      },
      {
        level: 2,
        event: 'Secondary Cascade: Corridor Road Obstruction on Major Road A',
        downstreamImpacts: [
          'Slowdown of 68,000 PCU daily traffic volume',
          'Submerged vehicles and localized traffic gridlock at Parade Chauraha',
        ],
        affectedDepartments: ['Traffic Police (KTP)'],
        probability: 'HIGH',
        severity: 'CRITICAL',
        verificationStatus: 'Possible downstream impact',
      },
      {
        level: 3,
        event: 'Tertiary Critical Impact: Delayed Hospital Emergency Access',
        downstreamImpacts: [
          'Potential 15-25 min delay for ambulances reaching Ursula Horsman Hospital',
          'Risk of emergency trauma patient transit disruption',
        ],
        affectedDepartments: ['District Health Department (KHD)', 'Traffic Police (KTP)'],
        probability: 'MEDIUM',
        severity: 'CRITICAL',
        verificationStatus: 'Potentially affected',
      },
    ];

    return {
      primaryEntity: primaryEnt,
      primaryEventTitle: `Cascade Analysis: ${primaryEnt.name}`,
      cascadeChain,
      involvedDepartments: ['Municipal Services', 'Traffic Police', 'Jal Sansthan', 'Health Department'],
      recommendedCoordination: [
        'Deploy Jal Sansthan Mobile Dewatering Pump Station B to evacuate surface water',
        'Traffic Police clear green-corridor ambulance bypass route for Hospital 1',
        'Municipal desilting crew clear Gully Pit obstructions at Nala Point 17',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // --- GRAPH STATISTICS ---

  public getGraphStats(): GraphStats {
    const entitiesArr = Array.from(this.entities.values());
    const relsArr = Array.from(this.relationships.values());

    const entitiesByType: Record<string, number> = {};
    const dataSourcesBreakdown: Record<string, number> = {};

    entitiesArr.forEach((e) => {
      entitiesByType[e.type] = (entitiesByType[e.type] || 0) + 1;
      dataSourcesBreakdown[e.source] = (dataSourcesBreakdown[e.source] || 0) + 1;
    });

    const relsByType: Record<string, number> = {};
    relsArr.forEach((r) => {
      relsByType[r.relationship_type] = (relsByType[r.relationship_type] || 0) + 1;
    });

    // Degree centrality
    const degreeMap = new Map<string, number>();
    relsArr.forEach((r) => {
      degreeMap.set(r.source_id, (degreeMap.get(r.source_id) || 0) + 1);
      degreeMap.set(r.target_id, (degreeMap.get(r.target_id) || 0) + 1);
    });

    const mostConnected = Array.from(degreeMap.entries())
      .map(([id, count]) => {
        const ent = this.getEntity(id);
        return {
          id,
          name: ent ? ent.name : id,
          type: ent ? ent.type : ('ASSET' as EntityType),
          connectionCount: count,
        };
      })
      .sort((a, b) => b.connectionCount - a.connectionCount)
      .slice(0, 5);

    return {
      totalEntities: entitiesArr.length,
      totalRelationships: relsArr.length,
      entitiesByType,
      relationshipsByType: relsByType,
      dataSourcesBreakdown,
      mostConnectedEntities: mostConnected,
      recentlyUpdated: entitiesArr.slice(0, 5),
    };
  }

  // --- IMPORT GRAPH DATA ---

  public importGraphData(payload: { entities?: GraphEntity[]; relationships?: GraphRelationship[] }): {
    importedEntities: number;
    importedRelationships: number;
  } {
    let entCount = 0;
    let relCount = 0;

    if (payload.entities && Array.isArray(payload.entities)) {
      payload.entities.forEach((e) => {
        if (e.id && e.type && e.name) {
          this.createEntity(e);
          entCount++;
        }
      });
    }

    if (payload.relationships && Array.isArray(payload.relationships)) {
      payload.relationships.forEach((r) => {
        if (r.id && r.source_id && r.target_id && r.relationship_type) {
          this.createRelationship(r);
          relCount++;
        }
      });
    }

    return { importedEntities: entCount, importedRelationships: relCount };
  }

  // --- 11-STEP DEMO SCENARIO PLAYER ---

  public getDemoSteps(): GraphDemoStep[] {
    return [
      {
        step: 1,
        title: 'Step 1: Citizen Report & Sensor Telemetry Ingestion',
        actor: 'Citizen / IoT Sensor KNP-302',
        role: 'OBSERVED',
        description: 'Waterlogging Incident #1024 reported at Major Road A Parade Crossing. Sensor measures 2.1ft water height.',
      },
      {
        step: 2,
        title: 'Step 2: Knowledge Graph Location Spatial Binding',
        actor: 'SCOS Graph Engine',
        role: 'SYSTEM',
        description: 'Graph maps Incident #1024 -> Major Road A -> Ward 12 -> Zone 1 Central Kanpur.',
      },
      {
        step: 3,
        title: 'Step 3: Nearby Critical Infrastructure Discovery',
        actor: 'Knowledge Graph Context Engine',
        role: 'INTELLIGENCE',
        description: 'Graph identifies nearby assets: Drainage Point 17 (Clogged) and Hospital 1 (Ursula Horsman 450-bed).',
      },
      {
        step: 4,
        title: 'Step 4: Departmental Responsibility Mapping',
        actor: 'SCOS Graph Engine',
        role: 'GOVERNANCE',
        description: 'Graph traverses MANAGED_BY edges: Municipal (KMC), Traffic Police (KTP), Jal Sansthan (KJS), Health (KHD).',
      },
      {
        step: 5,
        title: 'Step 5: Historical Pattern Retrieval',
        actor: 'Historical Graph Traversal',
        role: 'ANALYTICS',
        description: 'Graph matches 2025 Monsoon Waterlogging (85mm rain) & 2024 Drainage Failure in Ward 12.',
      },
      {
        step: 6,
        title: 'Step 6: Contextual Risk Calculation Integration',
        actor: 'Predictive Intelligence Engine',
        role: 'PREDICTIVE',
        description: 'Combines telemetry + hospital proximity + clogged drainage -> Contextual Risk Score 78/100 (HIGH).',
      },
      {
        step: 7,
        title: 'Step 7: Cascade Downstream Impact Analysis',
        actor: 'Cascade Impact Analyzer',
        role: 'DECISION_SUPPORT',
        description: 'Calculates 3-tier cascade: Drainage Blockage -> Road Obstruction -> Delayed Hospital Emergency Access.',
      },
      {
        step: 8,
        title: 'Step 8: Context-Enriched AI Recommendation Generation',
        actor: 'Gemini AI Context Engine',
        role: 'AI_REASONING',
        description: 'AI generates operational recommendation: Joint Jal Sansthan Dewatering Pump + Traffic Corridor Diversion.',
      },
      {
        step: 9,
        title: 'Step 9: District Officer Review & Approval',
        actor: 'Dr. R. K. Verma (District Admin)',
        role: 'HUMAN_OFFICER',
        description: 'District officer reviews Knowledge Graph context panel and approves joint response plan.',
      },
      {
        step: 10,
        title: 'Step 10: Multi-Department Task Generation & Dispatch',
        actor: 'SCOS Coordination Kernel',
        role: 'ORCHESTRATION',
        description: 'Tasks #501 (Jal Sansthan) and #502 (Traffic Police) created and dispatched to department queues.',
      },
      {
        step: 11,
        title: 'Step 11: Real-Time Monitoring & Graph Audit Trail Update',
        actor: 'SCOS Operational Kernel',
        role: 'MONITORING',
        description: 'Pumping Station B activated. Drainage cleared. Water recedes to 0.2ft. Incident resolved.',
      },
    ];
  }

  public getDemoStepIndex(): number {
    return this.demoStepIndex;
  }

  public advanceDemoStep(): GraphDemoStep {
    const steps = this.getDemoSteps();
    if (this.demoStepIndex < steps.length) {
      this.demoStepIndex++;
    }
    return steps[Math.min(this.demoStepIndex - 1, steps.length - 1)];
  }

  public resetDemoScenario(): void {
    this.demoStepIndex = 0;
  }
}

export const knowledgeGraphStore = new KnowledgeGraphStore();
