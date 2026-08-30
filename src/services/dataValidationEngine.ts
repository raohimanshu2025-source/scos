// =========================================================================
// SCOS DATA VALIDATION, NORMALIZATION & QUALITY ENGINE (CORE PIPELINE)
// =========================================================================

import { DataSource } from '../types/dataSource';
import {
  RawIngestionRecord,
  StructuredValidationResult,
  NormalizedSCOSRecord,
  RejectedDataRecord,
  DataQualityAssessment,
  SCOSLocation,
  ValidationLevel,
  QualityLevel,
} from '../types/dataValidation';
import { computeFreshness } from './dataSourceStore';

/**
 * Validate raw ingestion record structure, field presence, types, ranges & source identity
 */
export function validateRecord(
  raw: RawIngestionRecord,
  dataSource?: DataSource
): StructuredValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validatedFields: string[] = [];
  const rejectedFields: string[] = [];

  // 1. Source Identity Validation
  if (!raw.sourceId) {
    errors.push('Missing required field: sourceId');
    rejectedFields.push('sourceId');
  } else if (!dataSource) {
    errors.push(`Unrecognized sourceId: '${raw.sourceId}' is not registered in SCOS DataSourceRegistry`);
    rejectedFields.push('sourceId');
  } else {
    validatedFields.push('sourceId');
    if (!dataSource.enabled) {
      warnings.push(`Data source '${raw.sourceId}' is currently disabled in registry`);
    }
  }

  // 2. Payload Validation
  if (!raw.payload || typeof raw.payload !== 'object' || Array.isArray(raw.payload)) {
    errors.push('Invalid or missing payload object');
    return {
      isValid: false,
      validationStatus: 'UNVERIFIED',
      errors,
      warnings,
      validatedFields,
      rejectedFields: ['payload'],
    };
  }
  validatedFields.push('payload');

  const payload = raw.payload;

  // 3. Entity Identity Validation
  const entityIdCandidate =
    payload.entityId ||
    payload.entity_id ||
    payload.ticket_id ||
    payload.complaint_id ||
    payload.junction_id ||
    payload.basin_code ||
    payload.feeder_id ||
    payload.structure_id ||
    payload.station_id ||
    payload.id;

  if (!entityIdCandidate || String(entityIdCandidate).trim() === '') {
    errors.push('Missing required entity identifier (entityId, ticket_id, junction_id, feeder_id, etc.)');
    rejectedFields.push('entityId');
  } else {
    validatedFields.push('entityId');
  }

  // 4. Timestamp Validation
  const tsCandidate = raw.timestamp || payload.timestamp || payload.last_updated || payload.created_at;
  if (!tsCandidate) {
    warnings.push('Record timestamp missing; defaulting to current system UTC timestamp');
  } else {
    const parsedTs = new Date(String(tsCandidate)).getTime();
    if (isNaN(parsedTs)) {
      errors.push(`Invalid timestamp format: '${tsCandidate}' is not a valid ISO date string`);
      rejectedFields.push('timestamp');
    } else {
      const now = Date.now();
      if (parsedTs > now + 300000) {
        // 5 mins clock skew margin
        errors.push(`Future timestamp rejected: timestamp '${tsCandidate}' is ahead of system clock`);
        rejectedFields.push('timestamp');
      } else {
        validatedFields.push('timestamp');
      }
    }
  }

  // 5. Spatial Location Fields & Coordinate Bounds Validation
  const latCandidate = payload.latitude ?? payload.lat ?? payload.lat_deg;
  const lonCandidate = payload.longitude ?? payload.lng ?? payload.lon ?? payload.lon_deg;

  if (latCandidate !== undefined && latCandidate !== null) {
    const latNum = Number(latCandidate);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errors.push(`Latitude value '${latCandidate}' out of valid geographic range [-90, 90]`);
      rejectedFields.push('latitude');
    } else {
      validatedFields.push('latitude');
      // Kanpur district bounding box check (26.0 to 27.2 N)
      if (latNum < 25.5 || latNum > 27.5) {
        warnings.push(`Latitude ${latNum}° is outside expected Kanpur district metropolitan bounding box`);
      }
    }
  }

  if (lonCandidate !== undefined && lonCandidate !== null) {
    const lonNum = Number(lonCandidate);
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      errors.push(`Longitude value '${lonCandidate}' out of valid geographic range [-180, 180]`);
      rejectedFields.push('longitude');
    } else {
      validatedFields.push('longitude');
      // Kanpur district bounding box check (79.8 to 80.8 E)
      if (lonNum < 79.5 || lonNum > 81.2) {
        warnings.push(`Longitude ${lonNum}° is outside expected Kanpur district metropolitan bounding box`);
      }
    }
  }

  // 6. Domain Specific Range Checks
  if (payload.water_level_cm !== undefined && Number(payload.water_level_cm) < 0) {
    warnings.push('Negative water_level_cm detected; physical parameter anomaly warning');
  }
  if (payload.speed_kmph !== undefined && Number(payload.speed_kmph) < 0) {
    errors.push(`Invalid negative speed_kmph: ${payload.speed_kmph}`);
    rejectedFields.push('speed_kmph');
  }
  if (payload.risk_score !== undefined) {
    const rs = Number(payload.risk_score);
    if (isNaN(rs) || rs < 0 || rs > 100) {
      errors.push(`Risk score '${payload.risk_score}' outside allowed [0, 100] range`);
      rejectedFields.push('risk_score');
    }
  }

  // Determine Validation Level
  const isValid = errors.length === 0;
  let validationStatus: ValidationLevel = 'UNVERIFIED';

  if (!isValid) {
    validationStatus = validatedFields.length > 0 ? 'SYNTAX_VALIDATED' : 'UNVERIFIED';
  } else if (warnings.length > 0) {
    validationStatus = 'SCHEMA_VALIDATED';
  } else {
    validationStatus = 'FULLY_VERIFIED';
  }

  return {
    isValid,
    validationStatus,
    errors,
    warnings,
    validatedFields,
    rejectedFields,
  };
}

/**
 * Convert source-specific raw records into normalized SCOS representation
 */
export function normalizeRecord(
  raw: RawIngestionRecord,
  dataSource: DataSource,
  validation: StructuredValidationResult
): { normalized: NormalizedSCOSRecord; location: SCOSLocation; attributes: Record<string, unknown> } {
  const payload = raw.payload || {};

  // Extract Entity ID
  const entityId = String(
    payload.entityId ||
      payload.entity_id ||
      payload.ticket_id ||
      payload.complaint_id ||
      payload.junction_id ||
      payload.basin_code ||
      payload.feeder_id ||
      payload.structure_id ||
      payload.station_id ||
      payload.id ||
      `ENT-${Date.now()}`
  );

  // Extract Entity Type
  let entityType = String(payload.entityType || payload.entity_type || '').toLowerCase();
  if (!entityType) {
    switch (dataSource.dataCategory) {
      case 'WATER':
        entityType = 'water_level_gauge';
        break;
      case 'DRAINAGE':
        entityType = 'pumping_station';
        break;
      case 'TRAFFIC':
        entityType = 'traffic_junction';
        break;
      case 'HEALTH':
        entityType = 'hospital_facility';
        break;
      case 'CRITICAL_INFRASTRUCTURE':
        entityType = payload.feeder_id ? 'power_feeder' : 'gis_spatial_layer';
        break;
      case 'WEATHER':
        entityType = 'weather_station';
        break;
      case 'PUBLIC_WORKS':
        entityType = 'bridge_asset';
        break;
      case 'INCIDENT':
        entityType = 'incident_report';
        break;
      default:
        entityType = 'municipal_asset';
    }
  }

  // Timestamp
  const rawTs = raw.timestamp || payload.timestamp || payload.last_updated || payload.created_at;
  const timestamp = rawTs && !isNaN(new Date(String(rawTs)).getTime())
    ? new Date(String(rawTs)).toISOString()
    : new Date().toISOString();

  // Location Normalization
  const latVal = payload.latitude ?? payload.lat ?? payload.lat_deg;
  const lonVal = payload.longitude ?? payload.lng ?? payload.lon ?? payload.lon_deg;

  const location: SCOSLocation = {
    latitude: latVal !== undefined && latVal !== null && !isNaN(Number(latVal)) ? Number(latVal) : 26.4499,
    longitude: lonVal !== undefined && lonVal !== null && !isNaN(Number(lonVal)) ? Number(lonVal) : 80.3319,
    ward: String(payload.ward || payload.complainant_ward || payload.ward_name || 'Ward 14 - Civil Lines'),
    zone: String(payload.zone || payload.admin_zone || 'Zone 1 Central Kanpur'),
    landmark: payload.landmark ? String(payload.landmark) : undefined,
    address: payload.address ? String(payload.address) : undefined,
    geometryReference: payload.geometry_wkt || payload.basin_code || payload.corridor_id ? String(payload.geometry_wkt || payload.basin_code || payload.corridor_id) : undefined,
  };

  // Attribute Normalization & Field Mapping
  const attributes: Record<string, unknown> = {};

  // Preserve non-conflicting custom fields
  for (const [k, v] of Object.entries(payload)) {
    if (!['latitude', 'longitude', 'lat', 'lng', 'lon', 'ward', 'zone', 'timestamp'].includes(k)) {
      attributes[k] = v;
    }
  }

  // Apply explicit prototype domain mappings
  if (payload.water_level_cm !== undefined) {
    attributes.waterLevelCm = Number(payload.water_level_cm);
  }
  if (payload.flow_rate_lps !== undefined) {
    attributes.flowRateLps = Number(payload.flow_rate_lps);
  }
  if (payload.pump_status !== undefined) {
    attributes.pumpStatus = String(payload.pump_status).toUpperCase() === 'ON' ? 'OPERATIONAL' : 'OFFLINE';
  }
  if (payload.road_blocked !== undefined) {
    const isBlocked = payload.road_blocked === 'YES' || payload.road_blocked === true || payload.road_blocked === 1;
    attributes.roadStatus = isBlocked ? 'BLOCKED' : 'CLEAR';
  }
  if (payload.speed_kmph !== undefined) {
    attributes.averageSpeedKmph = Number(payload.speed_kmph);
  }
  if (payload.is_tripped !== undefined) {
    const isTripped = payload.is_tripped === true || payload.is_tripped === 'YES' || payload.is_tripped === 1;
    attributes.feederStatus = isTripped ? 'TRIPPED' : 'OPERATIONAL';
  }
  if (payload.ticket_status !== undefined) {
    attributes.ticketStatus = String(payload.ticket_status).toUpperCase();
  }
  if (payload.risk_score !== undefined) {
    attributes.riskScore = Number(payload.risk_score);
  }

  const recordId = raw.recordId || `REC-${dataSource.sourceId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const freshness = computeFreshness(timestamp, dataSource.updateFrequency);

  const normalized: NormalizedSCOSRecord = {
    recordId,
    sourceId: dataSource.sourceId,
    sourceType: dataSource.sourceType,
    dataCategory: dataSource.dataCategory,
    entityType,
    entityId,
    timestamp,
    location,
    attributes,
    provenance: {
      sourceId: dataSource.sourceId,
      sourceName: dataSource.sourceName,
      department: dataSource.department,
      timestamp,
      dataMode: dataSource.dataMode,
      dataQuality: dataSource.provenance?.dataQuality || 'HIGH',
      confidence: dataSource.provenance?.confidence || 85,
      lastValidated: new Date().toISOString(),
      validationStatus: validation.validationStatus === 'FULLY_VERIFIED' ? 'VALIDATED' : 'SIMULATED',
      civilEngineeringDomain: dataSource.civilEngineeringDomain,
    },
    quality: {
      qualityScore: 0, // Placeholder to be filled by assessQuality
      qualityLevel: 'UNKNOWN',
      completenessPercent: 0,
      validity: validation.isValid,
      freshness,
      consistency: true,
      issues: [],
      warnings: validation.warnings,
      disclaimer: 'Prototype data-quality assessment (not sensor measurement accuracy)',
    },
    validation,
    freshness,
    originalPayload: payload,
    civilEngineeringDomain: dataSource.civilEngineeringDomain,
  };

  return { normalized, location, attributes };
}

/**
 * Evaluate completeness, validity, freshness, consistency & provenance to assign Quality Score
 */
export function assessQuality(
  normalized: NormalizedSCOSRecord,
  dataSource: DataSource
): DataQualityAssessment {
  const validation = normalized.validation;
  const issues: string[] = [...validation.errors];
  const warnings: string[] = [...validation.warnings];

  // 1. Calculate Field Completeness %
  const expectedKeys = ['entityId', 'timestamp', 'location.latitude', 'location.longitude', 'location.ward', 'location.zone'];
  let validPresentCount = 0;

  if (normalized.entityId) validPresentCount++;
  if (normalized.timestamp) validPresentCount++;
  if (normalized.location.latitude !== null) validPresentCount++;
  if (normalized.location.longitude !== null) validPresentCount++;
  if (normalized.location.ward) validPresentCount++;
  if (normalized.location.zone) validPresentCount++;

  const completenessPercent = Math.round((validPresentCount / expectedKeys.length) * 100);

  // 2. Consistency Checks
  let consistency = true;

  // Consistency Check: negative numbers check
  for (const [key, val] of Object.entries(normalized.attributes)) {
    if (typeof val === 'number' && (key.toLowerCase().includes('speed') || key.toLowerCase().includes('level') || key.toLowerCase().includes('count'))) {
      if (val < 0) {
        consistency = false;
        issues.push(`Consistency error: field '${key}' has impossible negative value (${val})`);
      }
    }
  }

  // Consistency Check: Contradictory Pump Status vs Flow Rate
  if (normalized.attributes.pumpStatus === 'OFFLINE' && Number(normalized.attributes.flowRateLps) > 100) {
    consistency = false;
    warnings.push('Contradictory state: Pump status marked OFFLINE while flow rate exceeds 100 L/s');
  }

  // 3. Compute Quality Score (0 - 100)
  let score = 0;

  // Weightings: Completeness (40%), Validity (30%), Consistency (20%), Freshness (10%)
  score += (completenessPercent / 100) * 40;

  if (validation.isValid) score += 30;
  else score += 10;

  if (consistency) score += 20;
  else score += 5;

  if (normalized.freshness === 'FRESH') score += 10;
  else if (normalized.freshness === 'AGING') score += 5;
  else score += 0;

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Quality Level Classification
  let qualityLevel: QualityLevel = 'UNKNOWN';
  if (finalScore >= 85 && validation.isValid && normalized.freshness === 'FRESH') {
    qualityLevel = 'HIGH';
  } else if (finalScore >= 65) {
    qualityLevel = 'MEDIUM';
  } else if (finalScore >= 40) {
    qualityLevel = 'LOW';
  } else {
    qualityLevel = 'DEGRADED';
  }

  return {
    qualityScore: finalScore,
    qualityLevel,
    completenessPercent,
    validity: validation.isValid,
    freshness: normalized.freshness,
    consistency,
    issues,
    warnings,
    disclaimer: 'Prototype data-quality assessment (not sensor measurement accuracy)',
  };
}

/**
 * Process a single raw ingestion record through the complete Phase 8.2 pipeline
 */
export function processRecordThroughPipeline(
  raw: RawIngestionRecord,
  dataSource?: DataSource
): { accepted?: NormalizedSCOSRecord; rejected?: RejectedDataRecord } {
  // Step 1: Schema & Field Validation
  const validation = validateRecord(raw, dataSource);

  // If record is invalid, return structured rejection
  if (!validation.isValid || !dataSource) {
    const rejected: RejectedDataRecord = {
      recordId: raw.recordId || `REJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sourceId: raw.sourceId || 'UNKNOWN_SOURCE',
      rejectionReason: validation.errors.length > 0 ? validation.errors.join('; ') : 'Unregistered data source',
      validationErrors: validation.errors,
      timestamp: raw.timestamp || new Date().toISOString(),
      originalPayload: raw.payload || {},
    };
    return { rejected };
  }

  // Step 2 & 3: Normalization & Attribute Mapping
  const { normalized } = normalizeRecord(raw, dataSource, validation);

  // Step 4 & 5: Quality Assessment & Provenance Attachment
  const quality = assessQuality(normalized, dataSource);
  normalized.quality = quality;

  return { accepted: normalized };
}
