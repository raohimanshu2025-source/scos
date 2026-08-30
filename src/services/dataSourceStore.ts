import {
  DataSource,
  CreateDataSourceInput,
  UpdateDataSourceInput,
  DataProvenance,
  FreshnessStatus,
} from '../types/dataSource';

// Helper to compute freshness status based on last updated ISO string & update frequency
export function computeFreshness(lastUpdatedIso: string, updateFrequency: string): FreshnessStatus {
  try {
    const updated = new Date(lastUpdatedIso).getTime();
    const now = Date.now();
    const diffHours = (now - updated) / (1000 * 60 * 60);

    const freqLower = updateFrequency.toLowerCase();
    if (freqLower.includes('real-time') || freqLower.includes('15 mins') || freqLower.includes('hourly')) {
      if (diffHours < 2) return 'FRESH';
      if (diffHours < 12) return 'AGING';
      return 'STALE';
    }
    if (freqLower.includes('daily')) {
      if (diffHours < 28) return 'FRESH';
      if (diffHours < 72) return 'AGING';
      return 'STALE';
    }
    if (freqLower.includes('static') || freqLower.includes('monthly')) {
      return 'FRESH'; // Static / Historical datasets are static references
    }
    if (diffHours < 24) return 'FRESH';
    if (diffHours < 168) return 'AGING';
    return 'STALE';
  } catch {
    return 'UNKNOWN';
  }
}

class DataSourceStore {
  private sources: Map<string, DataSource> = new Map();

  constructor() {
    this.seedInitialSources();
  }

  private seedInitialSources(): void {
    const nowIso = new Date().toISOString();

    const initialList: DataSource[] = [
      {
        sourceId: 'DS-KNN-DRAINAGE-01',
        sourceName: 'Kanpur Nagar Nigam Drainage Registry',
        sourceType: 'DEPARTMENT_SYSTEM',
        department: 'Kanpur Nagar Nigam',
        description: 'Stormwater drainage lines, culverts, and pumping station capacity registry in Kanpur district.',
        dataCategory: 'DRAINAGE',
        updateFrequency: 'Daily',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 88,
        dataMode: 'PROTOTYPE',
        enabled: true,
        civilEngineeringDomain: 'Stormwater Drainage Network & Dewatering Pumps',
        isPrototypeNotice: 'PROTOTYPE DATA SOURCE — Demonstration Dataset',
        provenance: {
          sourceId: 'DS-KNN-DRAINAGE-01',
          sourceName: 'Kanpur Nagar Nigam Drainage Registry',
          department: 'Kanpur Nagar Nigam',
          timestamp: nowIso,
          dataMode: 'PROTOTYPE',
          dataQuality: 'HIGH',
          confidence: 90,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Stormwater Drainage Network & Dewatering Pumps',
        },
      },
      {
        sourceId: 'DS-KJS-WATER-02',
        sourceName: 'Kanpur Jal Sansthan Water Infrastructure',
        sourceType: 'DEPARTMENT_SYSTEM',
        department: 'Kanpur Jal Sansthan',
        description: 'Potable water mains, pressure valves, and chlorination plant status logs.',
        dataCategory: 'WATER',
        updateFrequency: 'Hourly',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 92,
        dataMode: 'PROTOTYPE',
        enabled: true,
        civilEngineeringDomain: 'Water Pipeline Network & Reservoir Storage',
        isPrototypeNotice: 'PROTOTYPE DATA SOURCE — Demonstration Dataset',
        provenance: {
          sourceId: 'DS-KJS-WATER-02',
          sourceName: 'Kanpur Jal Sansthan Water Infrastructure',
          department: 'Kanpur Jal Sansthan',
          timestamp: nowIso,
          dataMode: 'PROTOTYPE',
          dataQuality: 'HIGH',
          confidence: 92,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Water Pipeline Network & Reservoir Storage',
        },
      },
      {
        sourceId: 'DS-KTP-TRAFFIC-03',
        sourceName: 'Traffic Police Congestion & Incident Feed',
        sourceType: 'TRAFFIC_SYSTEM',
        department: 'Kanpur Traffic Police',
        description: 'Intersection signal timing, congestion choke points, and temporary diversions.',
        dataCategory: 'TRAFFIC',
        updateFrequency: 'Real-time (Simulated)',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 85,
        dataMode: 'SIMULATED',
        enabled: true,
        civilEngineeringDomain: 'Traffic Signal Subsystem & Arterial Corridors',
        isPrototypeNotice: 'SIMULATED DATA SOURCE — Synthetic Traffic Telemetry',
        provenance: {
          sourceId: 'DS-KTP-TRAFFIC-03',
          sourceName: 'Traffic Police Congestion & Incident Feed',
          department: 'Kanpur Traffic Police',
          timestamp: nowIso,
          dataMode: 'SIMULATED',
          dataQuality: 'MEDIUM',
          confidence: 85,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Traffic Signal Subsystem & Arterial Corridors',
        },
      },
      {
        sourceId: 'DS-DHS-HEALTH-04',
        sourceName: 'District Health & Emergency Services Feed',
        sourceType: 'EMERGENCY_SYSTEM',
        department: 'Health Services',
        description: 'Emergency hospital bed availability, ambulance dispatch logs, and ICU capacity.',
        dataCategory: 'HEALTH',
        updateFrequency: 'Hourly',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 90,
        dataMode: 'PROTOTYPE',
        enabled: true,
        civilEngineeringDomain: 'Hospital Emergency Facilities & Ambulance Access',
        isPrototypeNotice: 'PROTOTYPE DATA SOURCE — Demonstration Dataset',
        provenance: {
          sourceId: 'DS-DHS-HEALTH-04',
          sourceName: 'District Health & Emergency Services Feed',
          department: 'Health Services',
          timestamp: nowIso,
          dataMode: 'PROTOTYPE',
          dataQuality: 'HIGH',
          confidence: 90,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Hospital Emergency Facilities & Ambulance Access',
        },
      },
      {
        sourceId: 'DS-GIS-INFRA-05',
        sourceName: 'GIS Urban Infrastructure Spatial Layers',
        sourceType: 'GIS',
        department: 'GIS Infrastructure',
        description: 'Geo-spatial ward boundaries, topography contours, road network vectors, and flood elevation zones.',
        dataCategory: 'CRITICAL_INFRASTRUCTURE',
        updateFrequency: 'Static',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 98,
        dataMode: 'STATIC',
        enabled: true,
        civilEngineeringDomain: 'Spatial Topography & Critical Infrastructure Mapping',
        isPrototypeNotice: 'PROTOTYPE DATA SOURCE — Static GIS Layers',
        provenance: {
          sourceId: 'DS-GIS-INFRA-05',
          sourceName: 'GIS Urban Infrastructure Spatial Layers',
          department: 'GIS Infrastructure',
          timestamp: nowIso,
          dataMode: 'STATIC',
          dataQuality: 'HIGH',
          confidence: 98,
          lastValidated: nowIso,
          validationStatus: 'VALIDATED',
          civilEngineeringDomain: 'Spatial Topography & Critical Infrastructure Mapping',
        },
      },
      {
        sourceId: 'DS-SCOS-SIM-06',
        sourceName: 'SCOS Demonstration Simulation Engine',
        sourceType: 'SIMULATION',
        department: 'SCOS Demonstration Dataset',
        description: 'Synthesized multi-department urban crisis scenario datasets for SCOS research evaluations.',
        dataCategory: 'INCIDENT',
        updateFrequency: 'Event-Driven',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 95,
        dataMode: 'SIMULATED',
        enabled: true,
        civilEngineeringDomain: 'Urban Multi-Hazard Crisis Simulation',
        isPrototypeNotice: 'SIMULATED DATA SOURCE — Research Evaluation Scenario',
        provenance: {
          sourceId: 'DS-SCOS-SIM-06',
          sourceName: 'SCOS Demonstration Simulation Engine',
          department: 'SCOS Demonstration Dataset',
          timestamp: nowIso,
          dataMode: 'SIMULATED',
          dataQuality: 'HIGH',
          confidence: 95,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Urban Multi-Hazard Crisis Simulation',
        },
      },
      {
        sourceId: 'DS-WTH-FEEDS-07',
        sourceName: 'Weather Prototype Feed',
        sourceType: 'WEATHER',
        department: 'Weather Prototype Feed',
        description: 'District precipitation, radar rainfall forecasts, and urban heat island telemetry.',
        dataCategory: 'WEATHER',
        updateFrequency: 'Every 15 mins (Simulated)',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 82,
        dataMode: 'SIMULATED',
        enabled: true,
        civilEngineeringDomain: 'Meteorological & Flood Warning System',
        isPrototypeNotice: 'SIMULATED DATA SOURCE — Weather Model Simulation',
        provenance: {
          sourceId: 'DS-WTH-FEEDS-07',
          sourceName: 'Weather Prototype Feed',
          department: 'Weather Prototype Feed',
          timestamp: nowIso,
          dataMode: 'SIMULATED',
          dataQuality: 'MEDIUM',
          confidence: 82,
          lastValidated: nowIso,
          validationStatus: 'SIMULATED',
          civilEngineeringDomain: 'Meteorological & Flood Warning System',
        },
      },
      {
        sourceId: 'DS-PWD-LOGS-08',
        sourceName: 'Public Works PWD & Bridge Inspection Logs',
        sourceType: 'HISTORICAL_DATA',
        department: 'Public Works Department',
        description: 'Historical structural health audits of Ganga Barrage access bridges and flyovers.',
        dataCategory: 'PUBLIC_WORKS',
        updateFrequency: 'Monthly',
        lastUpdated: nowIso,
        status: 'ACTIVE',
        reliability: 94,
        dataMode: 'HISTORICAL',
        enabled: true,
        civilEngineeringDomain: 'Bridges, Flyovers & Structural Assets',
        isPrototypeNotice: 'HISTORICAL DATA SOURCE — Prototype Audit Records',
        provenance: {
          sourceId: 'DS-PWD-LOGS-08',
          sourceName: 'Public Works PWD & Bridge Inspection Logs',
          department: 'Public Works Department',
          timestamp: nowIso,
          dataMode: 'HISTORICAL',
          dataQuality: 'HIGH',
          confidence: 94,
          lastValidated: nowIso,
          validationStatus: 'VALIDATED',
          civilEngineeringDomain: 'Bridges, Flyovers & Structural Assets',
        },
      },
    ];

    for (const src of initialList) {
      this.sources.set(src.sourceId, src);
    }
  }

  public getAllSources(): DataSource[] {
    return Array.from(this.sources.values());
  }

  public getSourceById(sourceId: string): DataSource | undefined {
    return this.sources.get(sourceId);
  }

  public createSource(input: CreateDataSourceInput): DataSource {
    const newId = `DS-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newSource: DataSource = {
      sourceId: newId,
      sourceName: input.sourceName,
      sourceType: input.sourceType,
      department: input.department,
      description: input.description,
      dataCategory: input.dataCategory,
      updateFrequency: input.updateFrequency || 'Daily',
      lastUpdated: nowIso,
      status: input.status || 'ACTIVE',
      reliability: input.reliability ?? 85,
      dataMode: input.dataMode || 'SIMULATED',
      enabled: true,
      civilEngineeringDomain: input.civilEngineeringDomain || 'Urban Infrastructure Dataset',
      isPrototypeNotice: `${input.dataMode || 'SIMULATED'} DATA SOURCE — Prototype Registry`,
      provenance: {
        sourceId: newId,
        sourceName: input.sourceName,
        department: input.department,
        timestamp: nowIso,
        dataMode: input.dataMode || 'SIMULATED',
        dataQuality: 'HIGH',
        confidence: input.reliability ?? 85,
        lastValidated: nowIso,
        validationStatus: input.dataMode === 'SIMULATED' ? 'SIMULATED' : 'UNVALIDATED',
        civilEngineeringDomain: input.civilEngineeringDomain || 'Urban Infrastructure Dataset',
      },
    };

    this.sources.set(newId, newSource);
    return newSource;
  }

  public updateSource(sourceId: string, input: UpdateDataSourceInput): DataSource | undefined {
    const existing = this.sources.get(sourceId);
    if (!existing) return undefined;

    const nowIso = new Date().toISOString();

    const updated: DataSource = {
      ...existing,
      sourceName: input.sourceName ?? existing.sourceName,
      sourceType: input.sourceType ?? existing.sourceType,
      department: input.department ?? existing.department,
      description: input.description ?? existing.description,
      dataCategory: input.dataCategory ?? existing.dataCategory,
      updateFrequency: input.updateFrequency ?? existing.updateFrequency,
      status: input.status ?? existing.status,
      reliability: input.reliability ?? existing.reliability,
      dataMode: input.dataMode ?? existing.dataMode,
      enabled: input.enabled !== undefined ? input.enabled : existing.enabled,
      civilEngineeringDomain: input.civilEngineeringDomain ?? existing.civilEngineeringDomain,
      lastUpdated: nowIso,
      provenance: {
        ...existing.provenance,
        sourceName: input.sourceName ?? existing.sourceName,
        department: input.department ?? existing.department,
        dataMode: input.dataMode ?? existing.dataMode,
        timestamp: nowIso,
        lastValidated: nowIso,
      },
    };

    this.sources.set(sourceId, updated);
    return updated;
  }

  public toggleSource(sourceId: string, enabled: boolean): DataSource | undefined {
    return this.updateSource(sourceId, { enabled });
  }
}

export const dataSourceStore = new DataSourceStore();
