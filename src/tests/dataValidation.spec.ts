/**
 * SCOS DATA VALIDATION, NORMALIZATION & QUALITY ENGINE AUTOMATED TEST SUITE
 * Phase 8.2 Test Verification Scenarios
 */

import { validateRecord, normalizeRecord, assessQuality, processRecordThroughPipeline } from '../services/dataValidationEngine';
import { dataSourceStore } from '../services/dataSourceStore';
import { RawIngestionRecord } from '../types/dataValidation';

export async function runDataValidationTestSuite(): Promise<{ passed: number; total: number; logs: string[] }> {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`✅ [PASS] Scenario ${total}: ${testName}`);
    } else {
      logs.push(`❌ [FAIL] Scenario ${total}: ${testName} - ${detail || 'Assertion failed'}`);
    }
  };

  try {
    const validSource = dataSourceStore.getSourceById('DS-KNN-DRAINAGE-01');

    // Scenario 1: Valid Record Validation & Normalization
    const validRaw: RawIngestionRecord = {
      recordId: 'TEST-REC-001',
      sourceId: 'DS-KNN-DRAINAGE-01',
      timestamp: new Date().toISOString(),
      payload: {
        entityId: 'PUMP-TEST-01',
        entityType: 'pumping_station',
        water_level_cm: 150,
        flow_rate_lps: 300,
        pump_status: 'ON',
        ward: 'Ward 14 - Civil Lines',
        zone: 'Zone 1 Central Kanpur',
        latitude: 26.46,
        longitude: 80.34,
      },
    };

    const validation1 = validateRecord(validRaw, validSource);
    assert(validation1.isValid === true, 'Valid Record Validation', `Errors: ${validation1.errors.join(', ')}`);
    assert(
      validation1.validationStatus === 'FULLY_VERIFIED',
      'Validation Status FULLY_VERIFIED',
      `Got: ${validation1.validationStatus}`
    );

    const { normalized } = normalizeRecord(validRaw, validSource!, validation1);
    assert(normalized.attributes.waterLevelCm === 150, 'Water Level Normalization Mapping', 'Field mapping water_level_cm -> waterLevelCm');
    assert(normalized.attributes.pumpStatus === 'OPERATIONAL', 'Pump Status Enum Normalization', 'pump_status ON -> OPERATIONAL');

    // Scenario 2: Missing Entity ID Rejection
    const invalidRawNoEntity: RawIngestionRecord = {
      recordId: 'TEST-REC-002',
      sourceId: 'DS-KNN-DRAINAGE-01',
      timestamp: new Date().toISOString(),
      payload: {
        water_level_cm: 150,
        ward: 'Ward 14',
      },
    };

    const result2 = processRecordThroughPipeline(invalidRawNoEntity, validSource);
    assert(result2.rejected !== undefined, 'Missing Entity ID Rejection', 'Record without entity ID should be rejected');
    assert(
      result2.rejected?.validationErrors.some((e) => e.includes('Missing required entity identifier')) === true,
      'Rejection Reason Clarity',
      'Should mention missing required entity identifier'
    );

    // Scenario 3: Out of Bounds Latitude Rejection
    const invalidRawBadLat: RawIngestionRecord = {
      recordId: 'TEST-REC-003',
      sourceId: 'DS-KNN-DRAINAGE-01',
      timestamp: new Date().toISOString(),
      payload: {
        entityId: 'PUMP-TEST-03',
        latitude: 195.0, // Invalid lat > 90
        longitude: 80.34,
      },
    };

    const result3 = processRecordThroughPipeline(invalidRawBadLat, validSource);
    assert(result3.rejected !== undefined, 'Out-of-bounds Latitude Rejection', 'Lat 195 should be rejected');

    // Scenario 4: Future Timestamp Rejection
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString(); // 5 days in future
    const invalidRawFuture: RawIngestionRecord = {
      recordId: 'TEST-REC-004',
      sourceId: 'DS-KNN-DRAINAGE-01',
      timestamp: futureDate,
      payload: {
        entityId: 'PUMP-TEST-04',
        latitude: 26.46,
        longitude: 80.34,
      },
    };

    const result4 = processRecordThroughPipeline(invalidRawFuture, validSource);
    assert(result4.rejected !== undefined, 'Future Timestamp Rejection', 'Future date should be rejected');

    // Scenario 5: Unregistered Source ID Rejection
    const invalidRawUnknownSource: RawIngestionRecord = {
      recordId: 'TEST-REC-005',
      sourceId: 'DS-NONEXISTENT-SOURCE-99',
      timestamp: new Date().toISOString(),
      payload: {
        entityId: 'TEST-05',
      },
    };

    const result5 = processRecordThroughPipeline(invalidRawUnknownSource, undefined);
    assert(result5.rejected !== undefined, 'Unregistered Source Rejection', 'Unknown source ID should be rejected');

    // Scenario 6: Quality Assessment & Completeness Calculation
    const qualityAssess = assessQuality(normalized, validSource!);
    assert(qualityAssess.completenessPercent === 100, '100% Field Completeness', `Got: ${qualityAssess.completenessPercent}%`);
    assert(qualityAssess.qualityLevel === 'HIGH', 'High Quality Level Assignment', `Got: ${qualityAssess.qualityLevel}`);
    assert(
      qualityAssess.disclaimer.includes('Prototype data-quality assessment'),
      'Data Quality Disclaimer Presence',
      'Must contain explicit prototype data quality disclaimer'
    );

    // Scenario 7: Provenance Preservation
    assert(normalized.provenance.sourceId === 'DS-KNN-DRAINAGE-01', 'Provenance Source ID Preservation');
    assert(normalized.provenance.department === 'Kanpur Nagar Nigam', 'Provenance Department Preservation');

    // Scenario 8: Civil Engineering Domain Readiness
    assert(
      Boolean(normalized.civilEngineeringDomain?.includes('Drainage')),
      'Civil Engineering Domain Tagging',
      `Got domain: ${normalized.civilEngineeringDomain}`
    );

  } catch (err: any) {
    logs.push(`❌ [FATAL] Test execution error: ${err.message}`);
  }

  return { passed, total, logs };
}
