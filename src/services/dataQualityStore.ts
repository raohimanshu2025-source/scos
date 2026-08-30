// =========================================================================
// SCOS DATA QUALITY & VALIDATION IN-MEMORY STORE
// =========================================================================

import { dataSourceStore } from './dataSourceStore';
import {
  RawIngestionRecord,
  NormalizedSCOSRecord,
  RejectedDataRecord,
  DataQualityMetricsSummary,
  ProcessRecordsResult,
  QualityLevel,
  FreshnessStatus,
  ValidationLevel,
} from '../types/dataValidation';
import { processRecordThroughPipeline } from './dataValidationEngine';

class DataQualityStore {
  private normalizedRecords: Map<string, NormalizedSCOSRecord> = new Map();
  private rejectedRecords: Map<string, RejectedDataRecord> = new Map();

  constructor() {
    this.seedPrototypePipelineRecords();
  }

  /**
   * Process and store a batch of raw records through the validation & normalization pipeline
   */
  public ingestRecords(rawRecords: RawIngestionRecord[]): ProcessRecordsResult {
    const accepted: NormalizedSCOSRecord[] = [];
    const rejected: RejectedDataRecord[] = [];

    for (const raw of rawRecords) {
      const dataSource = dataSourceStore.getSourceById(raw.sourceId);
      const result = processRecordThroughPipeline(raw, dataSource);

      if (result.accepted) {
        this.normalizedRecords.set(result.accepted.recordId, result.accepted);
        accepted.push(result.accepted);
      } else if (result.rejected) {
        this.rejectedRecords.set(result.rejected.recordId, result.rejected);
        rejected.push(result.rejected);
      }
    }

    return {
      acceptedRecords: accepted,
      rejectedRecords: rejected,
      summary: {
        totalIngested: rawRecords.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
      },
    };
  }

  /**
   * Retrieve normalized records with optional filtering
   */
  public getAllNormalizedRecords(filters?: {
    category?: string;
    quality?: string;
    freshness?: string;
    status?: string;
    domain?: string;
  }): NormalizedSCOSRecord[] {
    let list = Array.from(this.normalizedRecords.values());

    if (filters) {
      if (filters.category && filters.category !== 'ALL') {
        list = list.filter((r) => r.dataCategory === filters.category);
      }
      if (filters.quality && filters.quality !== 'ALL') {
        list = list.filter((r) => r.quality.qualityLevel === filters.quality);
      }
      if (filters.freshness && filters.freshness !== 'ALL') {
        list = list.filter((r) => r.freshness === filters.freshness);
      }
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((r) => r.validation.validationStatus === filters.status);
      }
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getRecordById(recordId: string): NormalizedSCOSRecord | undefined {
    return this.normalizedRecords.get(recordId);
  }

  public getRejectedRecords(): RejectedDataRecord[] {
    return Array.from(this.rejectedRecords.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Compute aggregated metrics summary for the SCOS Data Quality Dashboard
   */
  public getMetricsSummary(): DataQualityMetricsSummary {
    const records = Array.from(this.normalizedRecords.values());
    const rejections = Array.from(this.rejectedRecords.values());

    const totalRecords = records.length + rejections.length;
    const validRecords = records.filter((r) => r.validation.isValid).length;
    const rejectedCount = rejections.length;

    const totalCompleteness = records.reduce((sum, r) => sum + r.quality.completenessPercent, 0);
    const averageCompleteness = records.length > 0 ? Math.round(totalCompleteness / records.length) : 0;

    const qualityDistribution: Record<QualityLevel, number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      DEGRADED: 0,
      UNKNOWN: 0,
    };

    const freshnessDistribution: Record<FreshnessStatus, number> = {
      FRESH: 0,
      AGING: 0,
      STALE: 0,
      UNKNOWN: 0,
    };

    const validationStatusDistribution: Record<ValidationLevel, number> = {
      FULLY_VERIFIED: 0,
      SCHEMA_VALIDATED: 0,
      SYNTAX_VALIDATED: 0,
      UNVERIFIED: 0,
    };

    for (const r of records) {
      const qKey = r.quality.qualityLevel as QualityLevel;
      const fKey = r.freshness as FreshnessStatus;
      const vKey = r.validation.validationStatus as ValidationLevel;

      qualityDistribution[qKey] = (qualityDistribution[qKey] || 0) + 1;
      freshnessDistribution[fKey] = (freshnessDistribution[fKey] || 0) + 1;
      validationStatusDistribution[vKey] = (validationStatusDistribution[vKey] || 0) + 1;
    }

    return {
      totalRecords,
      validRecords,
      rejectedRecords: rejectedCount,
      averageCompleteness,
      qualityDistribution,
      freshnessDistribution,
      validationStatusDistribution,
      disclaimer: 'Prototype data-quality assessment (not sensor measurement accuracy)',
    };
  }

  /**
   * Seed prototype urban records across Kanpur civil engineering domains
   */
  public seedPrototypePipelineRecords(): void {
    const nowIso = new Date().toISOString();
    const staleIso = new Date(Date.now() - 30 * 3600 * 1000).toISOString(); // 30 hrs ago (AGING/STALE)

    const seedRawRecords: RawIngestionRecord[] = [
      // 1. Water Drainage Pumping Station (Fully Verified, High Quality)
      {
        recordId: 'REC-DRAIN-001',
        sourceId: 'DS-KNN-DRAINAGE-01',
        timestamp: nowIso,
        payload: {
          entityId: 'PUMP-STN-PARADE-01',
          entityType: 'pumping_station',
          water_level_cm: 185,
          flow_rate_lps: 450,
          pump_status: 'ON',
          ward: 'Ward 14 - Parade Market',
          zone: 'Zone 1 Central Kanpur',
          latitude: 26.4631,
          longitude: 80.3472,
          landmark: 'Parade Chauraha Dewatering Substation',
        },
      },
      // 2. Kanpur Water Supply Main (Schema Validated, High Quality)
      {
        recordId: 'REC-WATER-002',
        sourceId: 'DS-KJS-WATER-02',
        timestamp: nowIso,
        payload: {
          entityId: 'WTR-MAIN-BENAJHABAR-04',
          entityType: 'water_level_gauge',
          water_level_cm: 320,
          flow_rate_lps: 820,
          pressure_bar: 3.4,
          ward: 'Ward 22 - Benajhabar',
          zone: 'Zone 2 North Kanpur',
          latitude: 26.478,
          longitude: 80.321,
          landmark: 'Benajhabar Water Treatment Plant',
        },
      },
      // 3. Traffic Police Congestion Feed (Fully Verified, Fresh)
      {
        recordId: 'REC-TRAFFIC-003',
        sourceId: 'DS-KTP-TRAFFIC-03',
        timestamp: nowIso,
        payload: {
          junction_id: 'TRF-JNC-BADA-CHAURAHA',
          entityType: 'traffic_junction',
          road_blocked: 'YES',
          speed_kmph: 8,
          queue_length_m: 350,
          ward: 'Ward 18 - Bada Chauraha',
          zone: 'Zone 1 Central Kanpur',
          latitude: 26.4589,
          longitude: 80.3521,
        },
      },
      // 4. District Health Emergency Hospital Feed (High Quality, Fresh)
      {
        recordId: 'REC-HEALTH-004',
        sourceId: 'DS-DHS-HEALTH-04',
        timestamp: nowIso,
        payload: {
          entityId: 'HOSP-LLR-HALLETT-01',
          entityType: 'hospital_facility',
          available_icu_beds: 12,
          available_ventilators: 4,
          ambulance_status: 'ACTIVE_DISPATCH',
          ward: 'Ward 08 - Swaroop Nagar',
          zone: 'Zone 2 North Kanpur',
          latitude: 26.4812,
          longitude: 80.3098,
        },
      },
      // 5. KESCO Power Grid Substation (Warning: Tripped Status)
      {
        recordId: 'REC-POWER-005',
        sourceId: 'DS-KESCO-POWER-05',
        timestamp: nowIso,
        payload: {
          feeder_id: 'FDR-KESCO-SUJTEE-11KV',
          entityType: 'power_feeder',
          is_tripped: true,
          load_kw: 0,
          outage_count: 3,
          ward: 'Ward 31 - Sujaganj',
          zone: 'Zone 1 Central Kanpur',
          latitude: 26.4512,
          longitude: 80.3411,
        },
      },
      // 6. GIS Spatial Drainage Line (Static, Validated)
      {
        recordId: 'REC-GIS-006',
        sourceId: 'DS-GIS-INFRA-05',
        timestamp: nowIso,
        payload: {
          basin_code: 'BASIN-GANGA-BARRAGE-SOUTH',
          entityType: 'gis_spatial_layer',
          flood_risk_zone: 'HIGH_FLOOD_PLAIN',
          elevation_m: 124.5,
          ward: 'Ward 02 - Nawabganj',
          zone: 'Zone 2 North Kanpur',
          latitude: 26.5011,
          longitude: 80.3122,
        },
      },
      // 7. Weather Meteorological Feed (Schema Validated, Warning)
      {
        recordId: 'REC-WTH-007',
        sourceId: 'DS-WTH-FEEDS-07',
        timestamp: nowIso,
        payload: {
          station_id: 'WTH-STN-KANPUR-AERO',
          entityType: 'weather_station',
          rainfall_mm_hr: 42.5,
          humidity_percent: 94,
          ward: 'Ward 45 - Chakeri',
          zone: 'Zone 4 East Kanpur',
          latitude: 26.4022,
          longitude: 80.4101,
        },
      },
      // 8. Public Works PWD Structural Log (Historical, Fresh/Static)
      {
        recordId: 'REC-PWD-008',
        sourceId: 'DS-PWD-LOGS-08',
        timestamp: nowIso,
        payload: {
          structure_id: 'BRG-PWD-GANGA-BARRAGE-01',
          entityType: 'bridge_asset',
          structural_health_index: 86,
          last_inspection_year: 2025,
          ward: 'Ward 01 - Azad Nagar',
          zone: 'Zone 2 North Kanpur',
          latitude: 26.512,
          longitude: 80.301,
        },
      },
      // 9. Stale Telemetry Record (Stale timestamp, 30 hours old)
      {
        recordId: 'REC-STALE-009',
        sourceId: 'DS-KNN-DRAINAGE-01',
        timestamp: staleIso,
        payload: {
          entityId: 'PUMP-STN-JUHI-CULVERT',
          entityType: 'pumping_station',
          water_level_cm: 290,
          pump_status: 'OFF',
          ward: 'Ward 28 - Juhi Kalan',
          zone: 'Zone 3 South Kanpur',
          latitude: 26.4311,
          longitude: 80.3211,
        },
      },
      // 10. REJECTED RECORD 1: Out-of-bounds latitude
      {
        recordId: 'REC-REJ-010',
        sourceId: 'DS-KNN-DRAINAGE-01',
        timestamp: nowIso,
        payload: {
          entityId: 'PUMP-STN-INVALID-LAT',
          entityType: 'pumping_station',
          latitude: 145.0, // Invalid latitude
          longitude: 80.33,
          ward: 'Ward 10 - Kanpur',
        },
      },
      // 11. REJECTED RECORD 2: Missing Entity ID
      {
        recordId: 'REC-REJ-011',
        sourceId: 'DS-KJS-WATER-02',
        timestamp: nowIso,
        payload: {
          water_level_cm: 100,
          ward: 'Ward 05',
          latitude: 26.45,
          longitude: 80.33,
        },
      },
      // 12. REJECTED RECORD 3: Unregistered Source ID
      {
        recordId: 'REC-REJ-012',
        sourceId: 'DS-FAKE-UNKNOWN-SOURCE-99',
        timestamp: nowIso,
        payload: {
          entityId: 'FEDR-99',
          is_tripped: true,
        },
      },
    ];

    this.ingestRecords(seedRawRecords);
  }
}

export const dataQualityStore = new DataQualityStore();
