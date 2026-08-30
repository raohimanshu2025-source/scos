// ===================================================================
// SCOS DATA VALIDATION, NORMALIZATION & QUALITY ENGINE TYPE SYSTEM
// ===================================================================

import type {
  SourceType,
  DataCategory,
  DataMode,
  DataQuality,
  FreshnessStatus,
  DataProvenance,
} from './dataSource';

export type { FreshnessStatus, DataCategory, SourceType, DataMode, DataQuality, DataProvenance };

export type ValidationLevel =
  | 'UNVERIFIED'
  | 'SYNTAX_VALIDATED'
  | 'SCHEMA_VALIDATED'
  | 'FULLY_VERIFIED';

export type QualityLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'DEGRADED'
  | 'UNKNOWN';

export interface SCOSLocation {
  latitude: number | null;
  longitude: number | null;
  ward: string;
  zone: string;
  landmark?: string;
  address?: string;
  geometryReference?: string;
}

export interface RawIngestionRecord {
  recordId?: string;
  sourceId: string;
  timestamp?: string;
  payload: Record<string, unknown>;
}

export interface StructuredValidationResult {
  isValid: boolean;
  validationStatus: ValidationLevel;
  errors: string[];
  warnings: string[];
  validatedFields: string[];
  rejectedFields: string[];
}

export interface DataQualityAssessment {
  qualityScore: number; // 0-100 prototype data-quality assessment (not sensor measurement accuracy)
  qualityLevel: QualityLevel;
  completenessPercent: number; // 0-100% field completeness based on valid required fields present
  validity: boolean;
  freshness: FreshnessStatus;
  consistency: boolean;
  issues: string[];
  warnings: string[];
  disclaimer: string;
}

export interface NormalizedSCOSRecord {
  recordId: string;
  sourceId: string;
  sourceType: SourceType;
  dataCategory: DataCategory;
  entityType: string; // e.g. 'pumping_station', 'water_level_gauge', 'traffic_junction', 'drain_basin', 'hospital', 'power_feeder', 'grievance_ticket'
  entityId: string;
  timestamp: string;
  location: SCOSLocation;
  attributes: Record<string, unknown>;
  provenance: DataProvenance;
  quality: DataQualityAssessment;
  validation: StructuredValidationResult;
  freshness: FreshnessStatus;
  originalPayload: Record<string, unknown>;
  civilEngineeringDomain?: string;
}

export interface RejectedDataRecord {
  recordId: string;
  sourceId: string;
  rejectionReason: string;
  validationErrors: string[];
  timestamp: string;
  originalPayload: Record<string, unknown>;
}

export interface DataQualityMetricsSummary {
  totalRecords: number;
  validRecords: number;
  rejectedRecords: number;
  averageCompleteness: number;
  qualityDistribution: Record<QualityLevel, number>;
  freshnessDistribution: Record<FreshnessStatus, number>;
  validationStatusDistribution: Record<ValidationLevel, number>;
  disclaimer: string;
}

export interface ProcessRecordsResult {
  acceptedRecords: NormalizedSCOSRecord[];
  rejectedRecords: RejectedDataRecord[];
  summary: {
    totalIngested: number;
    acceptedCount: number;
    rejectedCount: number;
  };
}
