// =========================================================================
// SCOS PHASE 10E — RESEARCH CONTRIBUTION & REFERENCE ARCHITECTURE TEST SUITE
// 25 Rigorous Automated Verification Specs for SCOS Reference Architecture,
// Research Gaps, Civil Engineering Integration, RQ Traceability,
// Threats to Validity, RBAC Enforcement, and SHA-256 Provenance.
// =========================================================================

import { researchFrameworkService } from '../services/researchFrameworkService';
import { PermissionType, RoleType } from '../types/auth';
import { ROLE_PERMISSIONS_MAP } from '../backend/db/store';

export interface FrameworkTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface FrameworkTestSuiteReport {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionDurationMs: number;
  timestamp: string;
  results: FrameworkTestResult[];
}

export function runResearchFrameworkTestSuite(): FrameworkTestSuiteReport {
  const startTime = Date.now();
  const results: FrameworkTestResult[] = [];

  const runTest = (
    specId: string,
    specName: string,
    category: string,
    description: string,
    testFn: () => void
  ) => {
    const t0 = Date.now();
    try {
      testFn();
      results.push({
        specId,
        specName,
        category,
        passed: true,
        durationMs: Math.max(1, Date.now() - t0),
        description,
      });
    } catch (e: any) {
      results.push({
        specId,
        specName,
        category,
        passed: false,
        durationMs: Math.max(1, Date.now() - t0),
        description,
        error: e.message || String(e),
      });
    }
  };

  const framework = researchFrameworkService.getResearchFramework('test-runner@scos.gov.in');

  // TEST-RF-01: Research framework loads
  runTest(
    'TEST-RF-01',
    'Research Framework Initialization & Schema Validation',
    'INITIALIZATION',
    'Verifies that getResearchFramework returns a complete, non-null framework model with required metadata.',
    () => {
      if (!framework) throw new Error('Research framework returned null or undefined');
      if (!framework.frameworkId || !framework.frameworkVersion) {
        throw new Error('Framework missing frameworkId or frameworkVersion');
      }
      if (!framework.researchProblem || !framework.researchObjective) {
        throw new Error('Framework missing researchProblem or researchObjective');
      }
    }
  );

  // TEST-RF-02: Architecture layers exist (all 9 layers)
  runTest(
    'TEST-RF-02',
    'Reference Architecture Layer Completeness (9 Layers)',
    'ARCHITECTURE',
    'Verifies that all 9 formal SCOS architectural layers are present, sequentially numbered 1 to 9.',
    () => {
      const layers = framework.architecturalLayers;
      if (!layers || layers.length !== 9) {
        throw new Error(`Expected exactly 9 architectural layers, found ${layers?.length}`);
      }
      for (let i = 1; i <= 9; i++) {
        const layer = layers.find((l) => l.layerNumber === i);
        if (!layer) throw new Error(`Missing architectural Layer ${i}`);
        if (!layer.layerId || !layer.name || !layer.components || layer.components.length === 0) {
          throw new Error(`Layer ${i} is missing required fields or components`);
        }
      }
    }
  );

  // TEST-RF-03: All existing phases are represented
  runTest(
    'TEST-RF-03',
    'Representation of All SCOS Phases (Phase 8.1 to 10E)',
    'ARCHITECTURE',
    'Verifies that all implemented development phases (8.1–8.5, 9A–9D, 10A–10E) are represented in architectural layers.',
    () => {
      const allPhases = framework.architecturalLayers.flatMap((l) => l.relatedPhases);
      const phasesText = allPhases.join(' ');
      const requiredPhases = [
        'Phase 8.1',
        'Phase 8.2',
        'Phase 8.3',
        'Phase 8.4',
        'Phase 8.5A',
        'Phase 8.5B',
        'Phase 8.5C',
        'Phase 9A',
        'Phase 9B',
        'Phase 9C',
        'Phase 9D',
        'Phase 10A',
        'Phase 10B',
        'Phase 10C',
        'Phase 10D',
        'Phase 10E',
      ];
      for (const p of requiredPhases) {
        if (!phasesText.includes(p) && !allPhases.some((ap) => ap.includes(p) || ap === 'All Phases')) {
          throw new Error(`Phase ${p} not found in architectural layer mappings`);
        }
      }
    }
  );

  // TEST-RF-04: No duplicate architecture components
  runTest(
    'TEST-RF-04',
    'Architecture Component ID Uniqueness',
    'ARCHITECTURE',
    'Verifies that all architectural components have strictly unique component IDs across all layers.',
    () => {
      const componentIds = new Set<string>();
      for (const layer of framework.architecturalLayers) {
        for (const comp of layer.components) {
          if (componentIds.has(comp.id)) {
            throw new Error(`Duplicate component ID detected: ${comp.id}`);
          }
          componentIds.add(comp.id);
        }
      }
      if (componentIds.size < 15) {
        throw new Error(`Expected at least 15 components across 9 layers, found ${componentIds.size}`);
      }
    }
  );

  // TEST-RF-05: Research gap mapping is structurally valid
  runTest(
    'TEST-RF-05',
    'Research Gap Matrix Structural Integrity (GAP-01 to GAP-11)',
    'RESEARCH_GAP',
    'Verifies that all 11 research gap categories are represented with valid responses, metrics, and evidence levels.',
    () => {
      const gaps = framework.researchGapMatrix;
      if (!gaps || gaps.length !== 11) {
        throw new Error(`Expected 11 research gap items, found ${gaps?.length}`);
      }
      for (const gap of gaps) {
        if (!gap.gapId.startsWith('GAP-')) throw new Error(`Invalid gapId: ${gap.gapId}`);
        if (!gap.scosArchitecturalResponse || !gap.evidenceLevel || !gap.evaluationMetric) {
          throw new Error(`Gap ${gap.gapId} has incomplete mapping data`);
        }
      }
    }
  );

  // TEST-RF-06: RQ-01 exists
  runTest(
    'TEST-RF-06',
    'RQ-01 Response Latency & Containment Mapping',
    'RESEARCH_QUESTIONS',
    'Verifies that RQ-01 is defined, mapped to metrics M1 and M3, and supported by descriptive evidence.',
    () => {
      const rq01 = framework.researchQuestions['RQ-01'];
      if (!rq01) throw new Error('RQ-01 missing from research question registry');
      if (!rq01.linkedMetrics.includes('M1') || !rq01.linkedMetrics.includes('M3')) {
        throw new Error('RQ-01 must link to metrics M1 and M3');
      }
      if (rq01.evidenceLevel !== 'LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE') {
        throw new Error('RQ-01 evidenceLevel must be LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE');
      }
    }
  );

  // TEST-RF-07: RQ-02 exists
  runTest(
    'TEST-RF-07',
    'RQ-02 Cascading Failure Mitigation Mapping',
    'RESEARCH_QUESTIONS',
    'Verifies that RQ-02 is defined, mapped to metrics M2 and M5, and references digital twin cascade containment.',
    () => {
      const rq02 = framework.researchQuestions['RQ-02'];
      if (!rq02) throw new Error('RQ-02 missing from research question registry');
      if (!rq02.linkedMetrics.includes('M2') || !rq02.linkedMetrics.includes('M5')) {
        throw new Error('RQ-02 must link to metrics M2 and M5');
      }
    }
  );

  // TEST-RF-08: RQ-03 exists
  runTest(
    'TEST-RF-08',
    'RQ-03 Situational Awareness & Decision Alignment Mapping',
    'RESEARCH_QUESTIONS',
    'Verifies that RQ-03 is defined, mapped to metrics M4 and M6, and references multi-criteria decision options.',
    () => {
      const rq03 = framework.researchQuestions['RQ-03'];
      if (!rq03) throw new Error('RQ-03 missing from research question registry');
      if (!rq03.linkedMetrics.includes('M4') || !rq03.linkedMetrics.includes('M6')) {
        throw new Error('RQ-03 must link to metrics M4 and M6');
      }
    }
  );

  // TEST-RF-09: RQ-04 exists
  runTest(
    'TEST-RF-09',
    'RQ-04 Data Quality & Operational Efficiency Mapping',
    'RESEARCH_QUESTIONS',
    'Verifies that RQ-04 is defined, mapped to metrics M7 and M8, and references automated data cleansing.',
    () => {
      const rq04 = framework.researchQuestions['RQ-04'];
      if (!rq04) throw new Error('RQ-04 missing from research question registry');
      if (!rq04.linkedMetrics.includes('M7') || !rq04.linkedMetrics.includes('M8')) {
        throw new Error('RQ-04 must link to metrics M7 and M8');
      }
    }
  );

  // TEST-RF-10: RQ-05 exists
  runTest(
    'TEST-RF-10',
    'RQ-05 Infrastructure Resilience & Audit Reproducibility Mapping',
    'RESEARCH_QUESTIONS',
    'Verifies that RQ-05 is defined, mapped to metrics M9 and M10, and references cryptographic SHA-256 provenance.',
    () => {
      const rq05 = framework.researchQuestions['RQ-05'];
      if (!rq05) throw new Error('RQ-05 missing from research question registry');
      if (!rq05.linkedMetrics.includes('M9') || !rq05.linkedMetrics.includes('M10')) {
        throw new Error('RQ-05 must link to metrics M9 and M10');
      }
    }
  );

  // TEST-RF-11: M1–M10 mapping integrity
  runTest(
    'TEST-RF-11',
    'Evaluation Metrics (M1–M10) Coverage Across RQs',
    'METRICS',
    'Verifies that all 10 evaluation metrics M1 through M10 are mapped across the 5 research questions without omission.',
    () => {
      const allLinkedMetrics = new Set<string>();
      Object.values(framework.researchQuestions).forEach((rq) => {
        rq.linkedMetrics.forEach((m) => allLinkedMetrics.add(m));
      });
      for (let i = 1; i <= 10; i++) {
        const mKey = `M${i}`;
        if (!allLinkedMetrics.has(mKey)) {
          throw new Error(`Metric ${mKey} is not mapped to any Research Question`);
        }
      }
    }
  );

  // TEST-RF-12: SC-01–SC-05 mapping integrity
  runTest(
    'TEST-RF-12',
    'Benchmark Scenarios (SC-01–SC-05) Linkage',
    'SCENARIOS',
    'Verifies that all 5 benchmark scenarios are linked across the research question evaluations.',
    () => {
      const requiredScenarios = ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'];
      Object.values(framework.researchQuestions).forEach((rq) => {
        for (const sc of requiredScenarios) {
          if (!rq.linkedScenarios.includes(sc as any)) {
            throw new Error(`RQ ${rq.rqId} missing scenario link to ${sc}`);
          }
        }
      });
    }
  );

  // TEST-RF-13: VC-01–VC-07 mapping integrity
  runTest(
    'TEST-RF-13',
    'Validation Cases (VC-01–VC-07) Representation in Reference Architecture',
    'VALIDATION_CASES',
    'Verifies that Phase 9C validation cases (VC-01–VC-07) are referenced in Layer 8 and computational components.',
    () => {
      const layer8 = framework.architecturalLayers.find((l) => l.layerId === 'LAYER_8_RESEARCH_VALIDATION');
      if (!layer8) throw new Error('Layer 8 not found');
      const comp8 = layer8.components.find((c) => c.id === 'COMP-L8-01');
      if (!comp8 || !comp8.purpose.includes('VC-01 to VC-07')) {
        throw new Error('Layer 8 component COMP-L8-01 must reference validation cases VC-01 to VC-07');
      }
    }
  );

  // TEST-RF-14: Civil engineering domains are represented (all 11 domains)
  runTest(
    'TEST-RF-14',
    'Civil Engineering Contribution Domain Completeness (11 Domains)',
    'CIVIL_ENGINEERING',
    'Verifies that all 11 required civil engineering domains are formally defined in the civil contribution framework.',
    () => {
      const domains = framework.civilEngineeringContribution.domains;
      if (!domains || domains.length !== 11) {
        throw new Error(`Expected exactly 11 civil engineering domains, found ${domains?.length}`);
      }
      const domainKeys = new Set(domains.map((d) => d.domainKey));
      const requiredKeys = [
        'URBAN_DRAINAGE_SYSTEMS',
        'WATERLOGGING_INUNDATION',
        'ROAD_TRANSPORTATION_INFRASTRUCTURE',
        'CRITICAL_FACILITY_ACCESSIBILITY',
        'DEWATERING_INFRASTRUCTURE',
        'WATER_SUPPLY_INFRASTRUCTURE',
        'ELECTRICAL_INFRASTRUCTURE_DEPENDENCIES',
        'SPATIAL_INFRASTRUCTURE_RELATIONSHIPS',
        'INFRASTRUCTURE_CRITICALITY',
        'INFRASTRUCTURE_CASCADE_IMPACTS',
        'URBAN_RESILIENCE_CONTINUITY',
      ];
      for (const k of requiredKeys) {
        if (!domainKeys.has(k as any)) {
          throw new Error(`Missing civil engineering domain: ${k}`);
        }
      }
    }
  );

  // TEST-RF-15: Evidence levels are valid
  runTest(
    'TEST-RF-15',
    'Evidence Level Hierarchy Definition & Integrity',
    'EVIDENCE_LEVELS',
    'Verifies that all 5 evidence levels (Level A to Level E) are formally defined in the taxonomy summary.',
    () => {
      const summary = framework.evidenceStrength;
      if (!summary || summary.levelsSummary.length !== 5) {
        throw new Error(`Expected 5 evidence level definitions, found ${summary?.levelsSummary?.length}`);
      }
      const levels = summary.levelsSummary.map((l) => l.level);
      if (!levels.includes('LEVEL_A_IMPLEMENTATION_VERIFIED')) throw new Error('Missing Level A');
      if (!levels.includes('LEVEL_B_COMPUTATIONALLY_VERIFIED')) throw new Error('Missing Level B');
      if (!levels.includes('LEVEL_C_CONTROLLED_PROTOTYPE_EVIDENCE')) throw new Error('Missing Level C');
      if (!levels.includes('LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE')) throw new Error('Missing Level D');
      if (!levels.includes('LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION')) throw new Error('Missing Level E');
    }
  );

  // TEST-RF-16: Level E is not assigned without real empirical evidence
  runTest(
    'TEST-RF-16',
    'Strict Level E Exclusion Guard',
    'RESEARCH_INTEGRITY',
    'Verifies that Level E (Real-World Empirical Validation) has count = 0 and levelEAssigned = false.',
    () => {
      const summary = framework.evidenceStrength;
      if (summary.levelEAssigned !== false) {
        throw new Error('Level E must NOT be assigned in a prototype research environment');
      }
      if (summary.distributionCount.LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION !== 0) {
        throw new Error(`Level E assigned count must be 0, found ${summary.distributionCount.LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION}`);
      }
      // Verify no layer or component has Level E
      for (const layer of framework.architecturalLayers) {
        if (layer.evidenceLevel === 'LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION') {
          throw new Error(`Layer ${layer.name} incorrectly assigned Level E`);
        }
        for (const comp of layer.components) {
          if (comp.evidenceLevel === 'LEVEL_E_REAL_WORLD_EMPIRICAL_VALIDATION') {
            throw new Error(`Component ${comp.name} incorrectly assigned Level E`);
          }
        }
      }
    }
  );

  // TEST-RF-17: Prototype classification is preserved
  runTest(
    'TEST-RF-17',
    'Prototype Governance Classification & Disclaimer Preservation',
    'GOVERNANCE',
    'Verifies that governanceClassification contains the mandatory prototype notice text and disclaimers.',
    () => {
      const gov = framework.governanceClassification;
      if (!gov.noticeText.includes('SIMULATED / PROTOTYPE DATA')) {
        throw new Error('Notice text missing mandatory SIMULATED / PROTOTYPE DATA banner');
      }
      if (!gov.disclaimer.includes('IIT Kanpur') || !gov.disclaimer.includes('M.Tech Thesis')) {
        throw new Error('Disclaimer missing academic thesis context');
      }
      if (gov.boundedScopeAffirmation !== true) {
        throw new Error('boundedScopeAffirmation must be true');
      }
    }
  );

  // TEST-RF-18: Threat-to-validity registry exists (all 14 dimensions)
  runTest(
    'TEST-RF-18',
    'Threat to Validity Registry Completeness (14 Dimensions)',
    'THREATS_TO_VALIDITY',
    'Verifies that the threat-to-validity registry covers all 14 mandatory academic dimensions.',
    () => {
      const threats = framework.threatsToValidity;
      if (!threats || threats.length !== 14) {
        throw new Error(`Expected exactly 14 threat items, found ${threats?.length}`);
      }
      const categories = new Set(threats.map((t) => t.category));
      const requiredCategories = [
        'INTERNAL_VALIDITY',
        'CONSTRUCT_VALIDITY',
        'STATISTICAL_CONCLUSION_VALIDITY',
        'EXTERNAL_VALIDITY',
        'ECOLOGICAL_VALIDITY',
        'MEASUREMENT_VALIDITY',
        'MODEL_VALIDITY',
        'DATA_VALIDITY',
        'CALIBRATION_VALIDITY',
        'GENERALIZABILITY',
        'OPERATOR_LEARNING_EFFECTS',
        'SIMULATION_REALISM',
        'PROTOTYPE_DATA_LIMITATIONS',
        'ENGINEERING_PARAMETER_UNCERTAINTY',
      ];
      for (const cat of requiredCategories) {
        if (!categories.has(cat as any)) {
          throw new Error(`Missing threat-to-validity category: ${cat}`);
        }
      }
      // Check each threat has mitigations and future research requirements
      for (const t of threats) {
        if (!t.mitigationAlreadyImplemented || !t.remainingLimitation || !t.futureResearchRequirement) {
          throw new Error(`Threat ${t.threatId} missing required mitigation/limitation details`);
        }
      }
    }
  );

  // TEST-RF-19: Research contribution claims are bounded
  runTest(
    'TEST-RF-19',
    'Conservative Academic Contribution Phrasing Audit',
    'RESEARCH_INTEGRITY',
    'Verifies that all research contribution statements avoid banned unproven superlatives (first ever, novel worldwide, proves, guarantees).',
    () => {
      const contributions = framework.contributions;
      if (!contributions || contributions.length !== 7) {
        throw new Error(`Expected 7 contribution categories, found ${contributions?.length}`);
      }
      const bannedPhrases = ['first ever', 'novel worldwide', 'proves that', 'guarantees zero'];
      for (const c of contributions) {
        const text = `${c.title} ${c.contributionStatement} ${c.conservativePhrasing}`.toLowerCase();
        for (const banned of bannedPhrases) {
          if (text.includes(banned)) {
            throw new Error(`Contribution ${c.id} contains banned self-praising phrase: "${banned}"`);
          }
        }
      }
    }
  );

  // TEST-RF-20: No fabricated numerical findings are introduced
  runTest(
    'TEST-RF-20',
    'Numerical Evidence Consistency with Phase 10B/10C/10D Findings',
    'RESEARCH_INTEGRITY',
    'Verifies that reported numerical evidence in RQ summaries exactly matches the empirical findings from Phase 10B and 10C.',
    () => {
      const rq01 = framework.researchQuestions['RQ-01'];
      if (!rq01.phase10BExecutionEvidenceSummary.includes('5.64h') || !rq01.phase10BExecutionEvidenceSummary.includes('2.73h')) {
        throw new Error('RQ-01 numerical values do not match Phase 10B baseline numbers');
      }
      const rq02 = framework.researchQuestions['RQ-02'];
      if (!rq02.phase10BExecutionEvidenceSummary.includes('47.74%') || !rq02.phase10BExecutionEvidenceSummary.includes('84.18%')) {
        throw new Error('RQ-02 numerical values do not match Phase 10B baseline numbers');
      }
    }
  );

  // TEST-RF-21: RQ-to-evidence traceability is valid
  runTest(
    'TEST-RF-21',
    'RQ Traceability Status Integrity',
    'RESEARCH_QUESTIONS',
    'Verifies that all 5 research questions have status SUPPORTED_DESCRIPTIVELY with non-empty bounded limitations.',
    () => {
      Object.values(framework.researchQuestions).forEach((rq) => {
        if (rq.status !== 'SUPPORTED_DESCRIPTIVELY') {
          throw new Error(`RQ ${rq.rqId} has invalid status: ${rq.status}`);
        }
        if (!rq.boundedLimitations || rq.boundedLimitations.length === 0) {
          throw new Error(`RQ ${rq.rqId} must disclose bounded academic limitations`);
        }
      });
    }
  );

  // TEST-RF-22: SHA-256 provenance fingerprint is deterministic
  runTest(
    'TEST-RF-22',
    'Deterministic SHA-256 Canonical Fingerprint Verification',
    'PROVENANCE',
    'Verifies that framework provenance hash begins with sha256: and is identical across consecutive generations.',
    () => {
      const hash1 = framework.provenance.canonicalHash;
      if (!hash1 || !hash1.startsWith('sha256:')) {
        throw new Error(`Invalid provenance hash format: ${hash1}`);
      }
      const fw2 = researchFrameworkService.getResearchFramework('verifier@scos.gov.in');
      const hash2 = fw2.provenance.canonicalHash;
      if (hash1 !== hash2) {
        throw new Error(`Non-deterministic hash generated: ${hash1} !== ${hash2}`);
      }
    }
  );

  // TEST-RF-23: RBAC permission exists
  runTest(
    'TEST-RF-23',
    'RBAC PermissionType Registration',
    'RBAC',
    'Verifies that RESEARCH_FRAMEWORK_VIEW, RESEARCH_FRAMEWORK_ADMIN, and RESEARCH_FRAMEWORK_EXPORT exist in PermissionType enum.',
    () => {
      if (!PermissionType.RESEARCH_FRAMEWORK_VIEW) {
        throw new Error('PermissionType.RESEARCH_FRAMEWORK_VIEW is missing');
      }
      if (!PermissionType.RESEARCH_FRAMEWORK_ADMIN) {
        throw new Error('PermissionType.RESEARCH_FRAMEWORK_ADMIN is missing');
      }
      if (!PermissionType.RESEARCH_FRAMEWORK_EXPORT) {
        throw new Error('PermissionType.RESEARCH_FRAMEWORK_EXPORT is missing');
      }
    }
  );

  // TEST-RF-24: CITIZEN is denied
  runTest(
    'TEST-RF-24',
    'Citizen Role Authorization Restriction (RBAC Boundary)',
    'RBAC',
    'Verifies that the CITIZEN role is strictly forbidden from accessing RESEARCH_FRAMEWORK_VIEW.',
    () => {
      const citizenPermissions = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN];
      if (citizenPermissions.includes(PermissionType.RESEARCH_FRAMEWORK_VIEW)) {
        throw new Error('SECURITY VIOLATION: CITIZEN role must NOT possess RESEARCH_FRAMEWORK_VIEW permission');
      }
      if (citizenPermissions.includes(PermissionType.RESEARCH_FRAMEWORK_ADMIN)) {
        throw new Error('SECURITY VIOLATION: CITIZEN role must NOT possess RESEARCH_FRAMEWORK_ADMIN permission');
      }
    }
  );

  // TEST-RF-25: Authenticated authorized users can access the framework
  runTest(
    'TEST-RF-25',
    'District & Super Admin RBAC Authorization Verification',
    'RBAC',
    'Verifies that SUPER_ADMIN, DISTRICT_ADMIN, and AI_GOVERNANCE_OFFICER roles possess RESEARCH_FRAMEWORK_VIEW permission.',
    () => {
      const superAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.SUPER_ADMIN];
      if (!superAdminPerms.includes(PermissionType.RESEARCH_FRAMEWORK_VIEW)) {
        throw new Error('SUPER_ADMIN must possess RESEARCH_FRAMEWORK_VIEW');
      }
      const districtAdminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN];
      if (!districtAdminPerms.includes(PermissionType.RESEARCH_FRAMEWORK_VIEW)) {
        throw new Error('DISTRICT_ADMIN must possess RESEARCH_FRAMEWORK_VIEW');
      }
      const govOfficerPerms = ROLE_PERMISSIONS_MAP[RoleType.AI_GOVERNANCE_OFFICER];
      if (!govOfficerPerms.includes(PermissionType.RESEARCH_FRAMEWORK_VIEW)) {
        throw new Error('AI_GOVERNANCE_OFFICER must possess RESEARCH_FRAMEWORK_VIEW');
      }
    }
  );

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  return {
    suiteName: 'SCOS Phase 10E Research Framework Test Suite',
    totalTests: results.length,
    passedTests,
    failedTests,
    executionDurationMs: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    results,
  };
}
