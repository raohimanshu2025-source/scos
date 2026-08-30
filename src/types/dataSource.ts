// ====================================================
// SCOS URBAN DATA INTEGRATION FOUNDATION TYPE SYSTEM
// ====================================================

export type SourceType =
  | 'DEPARTMENT_SYSTEM'
  | 'GIS'
  | 'IOT_SENSOR'
  | 'TRAFFIC_SYSTEM'
  | 'WEATHER'
  | 'EMERGENCY_SYSTEM'
  | 'MANUAL_ENTRY'
  | 'HISTORICAL_DATA'
  | 'EXTERNAL_API'
  | 'SIMULATION';

export type DataMode =
  | 'SIMULATED'
  | 'PROTOTYPE'
  | 'HISTORICAL'
  | 'REAL_TIME'
  | 'STATIC'
  | 'EXTERNAL';

export type DataCategory =
  | 'INCIDENT'
  | 'ROAD'
  | 'DRAINAGE'
  | 'WATER'
  | 'TRAFFIC'
  | 'HEALTH'
  | 'PUBLIC_WORKS'
  | 'WEATHER'
  | 'CRITICAL_INFRASTRUCTURE'
  | 'EMERGENCY_RESPONSE'
  | 'POPULATION'
  | 'ENVIRONMENT'
  | 'FACILITY'
  | 'ASSET';

export type ValidationStatus =
  | 'VALIDATED'
  | 'UNVALIDATED'
  | 'STALE'
  | 'SIMULATED'
  | 'UNKNOWN';

export type DataQuality =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN';

export type FreshnessStatus =
  | 'FRESH'
  | 'AGING'
  | 'STALE'
  | 'UNKNOWN';

export type DataSourceStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'MAINTENANCE'
  | 'DEPRECATED';

export interface DataProvenance {
  sourceId: string;
  sourceName: string;
  department: string;
  timestamp: string;
  dataMode: DataMode;
  dataQuality: DataQuality;
  confidence?: number;
  lastValidated: string;
  validationStatus: ValidationStatus;
  civilEngineeringDomain?: string;
  dataPublisher?: string;
  publisherRole?: string;
  acquisitionMethod?: string;
  systemLineage?: string[];
}

export interface DataSource {
  sourceId: string;
  sourceName: string;
  sourceType: SourceType;
  department: string;
  description: string;
  dataCategory: DataCategory;
  updateFrequency: string; // e.g., 'Real-time (Simulated)', 'Hourly', 'Static', 'Daily'
  lastUpdated: string;
  status: DataSourceStatus;
  reliability: number; // 0-100 score
  dataMode: DataMode;
  provenance: DataProvenance;
  enabled: boolean;
  civilEngineeringDomain?: string; // Infrastructure element (e.g., 'Drainage Network', 'Pumping Station', 'Water Mains', 'Traffic Signals')
  isPrototypeNotice?: string;
}

export interface CreateDataSourceInput {
  sourceName: string;
  sourceType: SourceType;
  department: string;
  description: string;
  dataCategory: DataCategory;
  updateFrequency: string;
  status?: DataSourceStatus;
  reliability?: number;
  dataMode: DataMode;
  civilEngineeringDomain?: string;
}

export interface UpdateDataSourceInput {
  sourceName?: string;
  sourceType?: SourceType;
  department?: string;
  description?: string;
  dataCategory?: DataCategory;
  updateFrequency?: string;
  status?: DataSourceStatus;
  reliability?: number;
  dataMode?: DataMode;
  enabled?: boolean;
  civilEngineeringDomain?: string;
}
