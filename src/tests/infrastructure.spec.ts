// =========================================================================
// SCOS PHASE 8.3 — GEOSPATIAL & CIVIL INFRASTRUCTURE INTELLIGENCE SPEC
// =========================================================================

import { calculateHaversineDistance, filterByProximity } from '../services/spatialEngine';
import { infrastructureStore } from '../services/infrastructureStore';
import { knowledgeGraphStore } from '../services/knowledgeGraphStore';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { RoleType, PermissionType } from '../types/auth';
import { CivilInfrastructureAsset } from '../types/infrastructure';

export function runInfrastructureTestSuite(): {
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  testResults: Array<{ id: string; title: string; passed: boolean; message?: string }>;
} {
  const testResults: Array<{ id: string; title: string; passed: boolean; message?: string }> = [];

  // Helper test runner
  const assert = (id: string, title: string, condition: boolean, failMessage?: string) => {
    testResults.push({
      id,
      title,
      passed: condition,
      message: condition ? undefined : failMessage || 'Assertion failed',
    });
  };

  try {
    // -----------------------------------------------------------------------
    // TEST 1: Haversine Spatial Proximity Calculation Accuracy
    // -----------------------------------------------------------------------
    const dist1 = calculateHaversineDistance(26.458, 80.342, 26.460, 80.346);
    assert(
      'TEST-INFRA-01',
      'Haversine distance calculation between Parade Crossing and Bada Chauraha',
      dist1.isValid && dist1.distanceMeters > 300 && dist1.distanceMeters < 800,
      `Calculated distance was ${dist1.distanceMeters}m (expected ~450m-500m)`
    );

    // -----------------------------------------------------------------------
    // TEST 2: Haversine Coordinate Boundary Validation
    // -----------------------------------------------------------------------
    const invalidDist = calculateHaversineDistance(95.0, 80.342, 26.46, 80.346);
    assert(
      'TEST-INFRA-02',
      'Haversine boundary validation rejects invalid latitude (>90 deg)',
      !invalidDist.isValid && invalidDist.distanceMeters === Infinity,
      'Invalid coordinates were not rejected properly'
    );

    // -----------------------------------------------------------------------
    // TEST 3: Haversine Positional Accuracy Disclaimer Assertion
    // -----------------------------------------------------------------------
    assert(
      'TEST-INFRA-03',
      'Haversine distance calculation includes positional accuracy disclaimer',
      dist1.disclaimer.includes('Not survey-grade positional accuracy'),
      'Disclaimer missing from spatial calculation result'
    );

    // -----------------------------------------------------------------------
    // TEST 4: Seeded Civil Infrastructure Asset Inventory Retrieval
    // -----------------------------------------------------------------------
    const allAssets = infrastructureStore.getAllAssets();
    assert(
      'TEST-INFRA-04',
      'Seeded Kanpur civil infrastructure assets count is at least 8',
      allAssets.length >= 8,
      `Retrieved ${allAssets.length} assets (expected >= 8)`
    );

    // -----------------------------------------------------------------------
    // TEST 5: Asset Type Filtering (Roads, Drainage, Hospitals)
    // -----------------------------------------------------------------------
    const roads = infrastructureStore.getAllAssets({ type: 'ROAD' });
    const drains = infrastructureStore.getAllAssets({ type: 'DRAIN' });
    const hospitals = infrastructureStore.getAllAssets({ type: 'HOSPITAL' });

    assert(
      'TEST-INFRA-05',
      'Asset type filtering accurately separates Roads, Drains, and Hospitals',
      roads.length >= 1 && drains.length >= 1 && hospitals.length >= 1,
      `Roads: ${roads.length}, Drains: ${drains.length}, Hospitals: ${hospitals.length}`
    );

    // -----------------------------------------------------------------------
    // TEST 6: Register Prototype Civil Asset with Quality & Validation
    // -----------------------------------------------------------------------
    const newAsset = infrastructureStore.createAsset({
      assetName: 'Swaroop Nagar Monsoon Discharge Channel',
      assetType: 'DRAIN',
      department: 'Kanpur Nagar Nigam',
      status: 'OPERATIONAL',
      condition: 'FAIR',
      criticality: 'HIGH',
      location: {
        latitude: 26.471,
        longitude: 80.328,
        ward: 'Ward 04 — Swaroop Nagar',
        zone: 'Zone 2 — North Corridor',
      },
    });

    assert(
      'TEST-INFRA-06',
      'Newly registered civil asset includes Phase 8.2 validation and prototype flag',
      newAsset.isSimulatedPrototype === true &&
        newAsset.dataMode === 'SIMULATED' &&
        newAsset.quality.qualityScore > 0,
      'Created asset missing quality score or simulated prototype flag'
    );

    // -----------------------------------------------------------------------
    // TEST 7: Asset Operational Status Update
    // -----------------------------------------------------------------------
    const updatedAsset = infrastructureStore.updateAsset(newAsset.assetId, {
      status: 'DISRUPTED',
      condition: 'CRITICAL',
    });

    assert(
      'TEST-INFRA-07',
      'Asset status update modifies status and condition correctly',
      updatedAsset?.status === 'DISRUPTED' && updatedAsset?.condition === 'CRITICAL',
      'Failed to update asset status or condition'
    );

    // -----------------------------------------------------------------------
    // TEST 8: Spatial Proximity Query (Nearby Assets)
    // -----------------------------------------------------------------------
    const nearby = infrastructureStore.getNearbyAssets(26.458, 80.342, 2000);
    assert(
      'TEST-INFRA-08',
      'Proximity query returns nearby assets sorted by distance within 2km',
      nearby.length >= 3 && nearby[0].distanceMeters <= nearby[nearby.length - 1].distanceMeters,
      'Proximity query failed or returned unsorted results'
    );

    // -----------------------------------------------------------------------
    // TEST 9: Incident Civil Infrastructure Impact Chain
    // -----------------------------------------------------------------------
    const impactChain = infrastructureStore.getIncidentImpactChain('SCOS-INC-1024', 26.458, 80.342);
    assert(
      'TEST-INFRA-09',
      'Incident impact chain contains 4 multi-step cascade triggers and decision disclaimer',
      impactChain.impactChain.length === 4 &&
        impactChain.disclaimer.includes('operational decisions require human officer authorization'),
      'Impact chain missing required steps or decision disclaimer'
    );

    // -----------------------------------------------------------------------
    // TEST 10: Knowledge Graph Entity & Relationship Synchronization
    // -----------------------------------------------------------------------
    const kgEntity = knowledgeGraphStore.getEntity(newAsset.assetId);
    assert(
      'TEST-INFRA-10',
      'Infrastructure asset automatically mirrors into SCOS Knowledge Graph as entity node',
      kgEntity !== undefined && kgEntity.id === newAsset.assetId,
      'Asset node missing from Knowledge Graph'
    );

    // -----------------------------------------------------------------------
    // TEST 11: RBAC Permission Mapping for Civil Infrastructure
    // -----------------------------------------------------------------------
    const adminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
    assert(
      'TEST-INFRA-11',
      'DISTRICT_ADMIN role possesses INFRASTRUCTURE_VIEW and SPATIAL_ANALYSIS_VIEW permissions',
      adminPerms.includes(PermissionType.INFRASTRUCTURE_VIEW) &&
        adminPerms.includes(PermissionType.SPATIAL_ANALYSIS_VIEW),
      'DISTRICT_ADMIN missing civil infrastructure permissions'
    );
  } catch (err: any) {
    testResults.push({
      id: 'TEST-INFRA-ERR',
      title: 'Infrastructure Test Suite Execution',
      passed: false,
      message: err.message || 'Unexpected exception during test execution',
    });
  }

  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = testResults.length - passedCount;

  return {
    success: failedCount === 0,
    totalTests: testResults.length,
    passedCount,
    failedCount,
    testResults,
  };
}
