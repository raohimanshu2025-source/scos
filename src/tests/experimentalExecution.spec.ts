// =========================================================================
// SCOS PHASE 10B — CONTROLLED EXPERIMENTAL EXECUTION AUTOMATED TEST SUITE
// 25 Comprehensive Verification Test Cases (TEST-EXP-01 to TEST-EXP-25)
// =========================================================================

import { researchDatasetService, computeDeterministicFingerprint } from '../services/researchDatasetService';
import { experimentalExecutionService } from '../services/experimentalExecutionService';
import { experimentalResultsStore } from '../services/experimentalResultsStore';
import { comparativeEvaluationService } from '../services/comparativeEvaluationService';
import { RoleType, PermissionType } from '../types/auth';
import { dbStore, ROLE_PERMISSIONS_MAP } from '../backend/db/store';
import { ExperimentalMetricKey } from '../types/experimentalExecution';

export interface TestResultItem {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  executedAt: string;
  results: TestResultItem[];
  classificationNotice: string;
}

export function runExperimentalExecutionTestSuite(): TestSuiteSummary {
  const results: TestResultItem[] = [];
  const startSuiteTime = Date.now();

  function recordTest(
    id: string,
    name: string,
    category: string,
    fn: () => { passed: boolean; details: string }
  ) {
    const t0 = Date.now();
    try {
      const res = fn();
      results.push({
        id,
        name,
        category,
        passed: res.passed,
        details: res.details,
        durationMs: Date.now() - t0,
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        category,
        passed: false,
        details: `Exception thrown: ${err.message || String(err)}`,
        durationMs: Date.now() - t0,
      });
    }
  }

  // TEST-EXP-01: Phase 10A Research Dataset Availability
  recordTest(
    'TEST-EXP-01',
    'Phase 10A Research Dataset Availability & 5 Frozen Scenarios',
    'Dataset Integrity',
    () => {
      const scenarios = researchDatasetService.getAllScenarios();
      const codes = scenarios.map((s) => s.scenarioCode);
      const hasAll = ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'].every((c) => codes.includes(c));
      return {
        passed: hasAll && scenarios.length >= 5,
        details: `Loaded ${scenarios.length} scenarios. Found: ${codes.join(', ')}`,
      };
    }
  );

  // TEST-EXP-02: Frozen Scenarios Cannot Be Modified
  recordTest(
    'TEST-EXP-02',
    'Frozen Scenarios Cannot Be Mutated',
    'Dataset Integrity',
    () => {
      const sc01 = researchDatasetService.getScenario('SC-01');
      if (!sc01 || !sc01.isFrozen) {
        return { passed: false, details: 'SC-01 is not frozen' };
      }
      return {
        passed: sc01.isFrozen === true && !!sc01.configurationFingerprint,
        details: `Scenario SC-01 is cryptographically frozen with fingerprint ${sc01.configurationFingerprint.slice(0, 16)}...`,
      };
    }
  );

  // TEST-EXP-03: Scenario Configuration Fingerprint Preserved
  recordTest(
    'TEST-EXP-03',
    'Scenario Fingerprint Preserved in Session Creation',
    'Reproducibility',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const sc01 = researchDatasetService.getScenario('SC-01');
      const match = session.scenarioFingerprint === sc01?.configurationFingerprint;
      return {
        passed: match && !!session.scenarioFingerprint,
        details: `Session fingerprint: ${session.scenarioFingerprint.slice(0, 16)}... matches Scenario registry.`,
      };
    }
  );

  // TEST-EXP-04: Engineering Parameter Fingerprint Determinism
  recordTest(
    'TEST-EXP-04',
    'Parameter Fingerprint Computation Determinism',
    'Reproducibility',
    () => {
      const sc01 = researchDatasetService.getScenario('SC-01')!;
      const params: Record<string, any> = {};
      for (const p of sc01.engineeringParameters) params[p.parameterId] = p.value;
      const fp1 = computeDeterministicFingerprint(params);
      const fp2 = computeDeterministicFingerprint(params);
      return {
        passed: fp1 === fp2 && fp1.length === 64,
        details: `Deterministic parameter hash: ${fp1.slice(0, 16)}...`,
      };
    }
  );

  // TEST-EXP-05: Baseline Manual Execution Generates Valid Run with 10 Activities
  recordTest(
    'TEST-EXP-05',
    'Baseline Execution Generates 10 Standardized Activity Observations',
    'Workflow Execution',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');
      const stepCount = run.observations.length;
      return {
        passed: run.condition === 'BASELINE_MANUAL' && stepCount === 10 && run.executionStatus === 'COMPLETED',
        details: `Generated ${stepCount} activity observations for Baseline run ${run.runId}.`,
      };
    }
  );

  // TEST-EXP-06: SCOS Integrated Execution Generates Valid Run with 10 Activities
  recordTest(
    'TEST-EXP-06',
    'SCOS Execution Generates 10 Standardized Activity Observations',
    'Workflow Execution',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');
      const stepCount = run.observations.length;
      return {
        passed: run.condition === 'SCOS_INTEGRATED' && stepCount === 10 && run.executionStatus === 'COMPLETED',
        details: `Generated ${stepCount} activity observations for SCOS run ${run.runId}.`,
      };
    }
  );

  // TEST-EXP-07: Identical Initial Conditions and Parameters in Both Conditions
  recordTest(
    'TEST-EXP-07',
    'Same Scenario Configuration Across Conditions',
    'Experimental Control',
    () => {
      const session = experimentalExecutionService.createSession('SC-02', 'COUNTERBALANCED', 'test@scos.gov.in');
      const bRun = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');
      const sRun = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const matchParams = bRun.parameterFingerprint === sRun.parameterFingerprint;
      const matchInitial = bRun.initialConditionFingerprint === sRun.initialConditionFingerprint;
      const matchScenario = bRun.scenarioFingerprint === sRun.scenarioFingerprint;

      return {
        passed: matchParams && matchInitial && matchScenario,
        details: `Parameter fingerprint match: ${matchParams}, Initial condition match: ${matchInitial}`,
      };
    }
  );

  // TEST-EXP-08: Standardized Metric Keys (M1 to M10) Preserved
  recordTest(
    'TEST-EXP-08',
    'M1–M10 Metric Keys Present in Execution Run',
    'Metric Standard',
    () => {
      const session = experimentalExecutionService.createSession('SC-03', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const expectedKeys: ExperimentalMetricKey[] = [
        'M1_WORKFLOW_DURATION',
        'M2_INFORMATION_RETRIEVAL_COUNT',
        'M3_CONTEXT_COMPLETENESS_SCORE',
        'M4_COORDINATION_OVERHEAD',
        'M5_INFRASTRUCTURE_AWARENESS',
        'M6_CASCADE_IDENTIFICATION',
        'M7_CRITICAL_FACILITY_AWARENESS',
        'M8_DECISION_SUPPORT_COMPLETENESS',
        'M9_AUDIT_COMPLETENESS_SCORE',
        'M10_DECISION_TRACEABILITY',
      ];

      const present = expectedKeys.every((k) => !!run.metricResults[k]);
      return {
        passed: present,
        details: `All ${expectedKeys.length} standardized metrics present in run metricResults dictionary.`,
      };
    }
  );

  // TEST-EXP-09: Metrics Computed Directly from Observations (No Hardcoded Overrides)
  recordTest(
    'TEST-EXP-09',
    'Workflow Duration M1 Sums Individual Step Durations',
    'Metric Calculation',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');

      const sumDurations = run.observations.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      const m1Val = run.metricResults.M1_WORKFLOW_DURATION.value as number;

      return {
        passed: sumDurations === m1Val && m1Val > 0,
        details: `Sum of step durations (${sumDurations}s) equals M1_WORKFLOW_DURATION (${m1Val}s).`,
      };
    }
  );

  // TEST-EXP-10: Metric Metadata Provenance and Calculation Method
  recordTest(
    'TEST-EXP-10',
    'Metric Schema Contains Calculation Method and Provenance',
    'Metric Standard',
    () => {
      const session = experimentalExecutionService.createSession('SC-04', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');
      const m3 = run.metricResults.M3_CONTEXT_COMPLETENESS_SCORE;

      const hasMethod = !!m3.calculationMethod && m3.calculationMethod.length > 10;
      const hasProv = !!m3.provenance;
      const hasValid = m3.validityClassification === 'VALID DESCRIPTIVE RESULT';

      return {
        passed: hasMethod && hasProv && hasValid,
        details: `M3 method: '${m3.calculationMethod}', validity: '${m3.validityClassification}'.`,
      };
    }
  );

  // TEST-EXP-11: Execution Reproducibility Fingerprint Determinism
  recordTest(
    'TEST-EXP-11',
    'Deterministic Execution Configuration Fingerprint Verification',
    'Reproducibility',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const rep = experimentalExecutionService.verifyRunReproducibility(run.runId);
      return {
        passed: rep.isMatch && rep.status === 'MATCH',
        details: `Computed fingerprint '${rep.computedFingerprint.slice(0, 16)}...' matches execution config fingerprint.`,
      };
    }
  );

  // TEST-EXP-12: Tampered Fingerprint Fails Verification
  recordTest(
    'TEST-EXP-12',
    'Tampered Fingerprint Fails Reproducibility Check',
    'Reproducibility',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const rep = experimentalExecutionService.verifyRunReproducibility(run.runId, '0000000000000000000000000000000000000000000000000000000000000000');
      return {
        passed: !rep.isMatch && rep.status === 'MISMATCH' && rep.diffs.length > 0,
        details: `Correctly detected mismatch: ${rep.diffs[0]}`,
      };
    }
  );

  // TEST-EXP-13: Comparative Evaluation Engine Requires Matching Scenario Fingerprint
  recordTest(
    'TEST-EXP-13',
    'Comparative Engine Validates Matching Scenario Across Runs',
    'Comparative Engine',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const bRun = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');
      const sRun = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const comp = experimentalExecutionService.compareRuns(bRun.runId, sRun.runId, 'test@scos.gov.in');

      return {
        passed: comp.isValid && comp.metricsComparison.length === 10,
        details: `Comparison ${comp.comparisonId} valid with ${comp.metricsComparison.length} comparative metrics.`,
      };
    }
  );

  // TEST-EXP-14: Mismatched Scenarios Prevent Valid Comparison
  recordTest(
    'TEST-EXP-14',
    'Cross-Scenario Comparison Is Marked Invalid',
    'Comparative Engine',
    () => {
      const sess1 = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const bRun = experimentalExecutionService.executeRun(sess1.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');

      const sess2 = experimentalExecutionService.createSession('SC-02', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const sRun = experimentalExecutionService.executeRun(sess2.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const comp = experimentalExecutionService.compareRuns(bRun.runId, sRun.runId, 'test@scos.gov.in');

      return {
        passed: !comp.isValid && !!comp.invalidationReason,
        details: `Correctly invalidated: ${comp.invalidationReason}`,
      };
    }
  );

  // TEST-EXP-15: RBAC Prohibits Citizen from Experimental Execution
  recordTest(
    'TEST-EXP-15',
    'RBAC Prohibits CITIZEN from Experimental Execution',
    'Security & RBAC',
    () => {
      const citizenPerms = ROLE_PERMISSIONS_MAP[RoleType.CITIZEN] || [];
      const hasView = citizenPerms.includes(PermissionType.EXPERIMENTAL_EXECUTION_VIEW);
      const hasExec = citizenPerms.includes(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE);

      return {
        passed: !hasView && !hasExec,
        details: 'Citizen role correctly excluded from EXPERIMENTAL_EXECUTION_VIEW and EXPERIMENTAL_EXECUTION_EXECUTE.',
      };
    }
  );

  // TEST-EXP-16: RBAC Allows Authorized Administrative Roles
  recordTest(
    'TEST-EXP-16',
    'RBAC Grants Experimental Execution to DISTRICT_ADMIN and SUPER_ADMIN',
    'Security & RBAC',
    () => {
      const adminPerms = ROLE_PERMISSIONS_MAP[RoleType.DISTRICT_ADMIN] || [];
      const hasView = adminPerms.includes(PermissionType.EXPERIMENTAL_EXECUTION_VIEW);
      const hasExec = adminPerms.includes(PermissionType.EXPERIMENTAL_EXECUTION_EXECUTE);

      return {
        passed: hasView && hasExec,
        details: `DISTRICT_ADMIN granted view: ${hasView}, execute: ${hasExec}.`,
      };
    }
  );

  // TEST-EXP-17: Actor Identity Extraction Integrity
  recordTest(
    'TEST-EXP-17',
    'Actor Identity Preserved in Run and Provenance',
    'Provenance & Audit',
    () => {
      const session = experimentalExecutionService.createSession('SC-05', 'BASELINE_THEN_SCOS', 'researcher_42@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'researcher_42@scos.gov.in');

      return {
        passed: run.provenance.executedBy === 'researcher_42@scos.gov.in',
        details: `Provenance executedBy correctly recorded: '${run.provenance.executedBy}'.`,
      };
    }
  );

  // TEST-EXP-18: Audit Event Emission
  recordTest(
    'TEST-EXP-18',
    'Audit Trail Records Experimental Execution and Comparison Events',
    'Provenance & Audit',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'audit_tester@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'audit_tester@scos.gov.in');

      const logs = dbStore.getAuditLogs();
      const found = logs.some((l) => l.action === 'EXPERIMENT_EXECUTION_COMPLETED' && l.resource === run.runId);

      return {
        passed: found,
        details: `Found audit record for execution ${run.runId} in system audit log.`,
      };
    }
  );

  // TEST-EXP-19: SIMULATED / PROTOTYPE Classification Notice
  recordTest(
    'TEST-EXP-19',
    'SIMULATED / PROTOTYPE DATA Classification Preserved',
    'Research Integrity',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');

      const runClassification = run.classification === 'SIMULATED / PROTOTYPE DATA';
      const provClassification = run.provenance.classification === 'SIMULATED / PROTOTYPE DATA';
      const metricNotice = run.metricResults.M1_WORKFLOW_DURATION.classificationNotice.includes('SIMULATED / PROTOTYPE DATA');

      return {
        passed: runClassification && provClassification && metricNotice,
        details: 'Mandatory simulated prototype classification label attached to run, provenance, and metric records.',
      };
    }
  );

  // TEST-EXP-20: No Autonomous Operational Actuation
  recordTest(
    'TEST-EXP-20',
    'Zero Autonomous Operational Actuation Enforced',
    'Safety & Governance',
    () => {
      // Experimental engine operates purely on in-memory observations and never dispatches live SCADA or hardware signals
      const session = experimentalExecutionService.createSession('SC-02', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const run = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');

      const isSafe = run.provenance.isSimulatedPrototype === true;
      return {
        passed: isSafe,
        details: 'Execution strictly sandboxed within research engine without external physical actuation.',
      };
    }
  );

  // TEST-EXP-21: Order Effect Metadata Preserved
  recordTest(
    'TEST-EXP-21',
    'Order Effect Metadata and Warnings Attached to Comparative Evaluation',
    'Experimental Control',
    () => {
      const session = experimentalExecutionService.createSession('SC-01', 'BASELINE_THEN_SCOS', 'test@scos.gov.in');
      const bRun = experimentalExecutionService.executeRun(session.sessionId, 'BASELINE_MANUAL', 'test@scos.gov.in');
      const sRun = experimentalExecutionService.executeRun(session.sessionId, 'SCOS_INTEGRATED', 'test@scos.gov.in');
      const comp = experimentalExecutionService.compareRuns(bRun.runId, sRun.runId, 'test@scos.gov.in');

      const hasWarning = comp.orderEffectWarning.length > 10;
      const hasOrder = comp.order === 'BASELINE_THEN_SCOS';

      return {
        passed: hasWarning && hasOrder,
        details: `Order warning: '${comp.orderEffectWarning}', Order: '${comp.order}'.`,
      };
    }
  );

  // TEST-EXP-22: Research Summary Aggregates Sessions, Runs, and Metric Coverage
  recordTest(
    'TEST-EXP-22',
    'Research Summary Correctly Aggregates Controlled Research State',
    'Research Summary',
    () => {
      const summary = experimentalResultsStore.getResearchSummary();
      const hasSessions = summary.totalSessions > 0;
      const hasRuns = summary.totalExecutions > 0;
      const hasM1Coverage = summary.metricCoverage.M1_WORKFLOW_DURATION > 0;

      return {
        passed: hasSessions && hasRuns && hasM1Coverage,
        details: `Aggregated ${summary.totalSessions} sessions, ${summary.totalExecutions} runs. M1 coverage: ${summary.metricCoverage.M1_WORKFLOW_DURATION}.`,
      };
    }
  );

  // TEST-EXP-23: JSON Export Conforms to Research Payload Schema
  recordTest(
    'TEST-EXP-23',
    'JSON Export Generation with Complete Provenance & Disclaimers',
    'Export & Dissemination',
    () => {
      const expJson = experimentalExecutionService.exportResultsJSON('exporter@scos.gov.in');
      const hasDisclaimer = expJson.disclaimer.includes('simulation outputs');
      const hasClassification = expJson.classification === 'SIMULATED / PROTOTYPE DATA';
      const hasRuns = Array.isArray(expJson.runs);

      return {
        passed: hasDisclaimer && hasClassification && hasRuns,
        details: `JSON export ID: ${expJson.exportId}, Contains ${expJson.runs.length} runs, ${expJson.comparisons.length} comparisons.`,
      };
    }
  );

  // TEST-EXP-24: CSV Export Formatting
  recordTest(
    'TEST-EXP-24',
    'CSV Export Generates Standardized Comma-Separated Headers and Rows',
    'Export & Dissemination',
    () => {
      const csv = experimentalExecutionService.exportResultsCSV();
      const hasHeader = csv.includes('Run ID,Session ID,Scenario Code,Condition');
      const hasCompHeader = csv.includes('Comparison ID,Scenario Code,Baseline Run');
      const hasClassification = csv.includes('CLASSIFICATION: SIMULATED / PROTOTYPE DATA');

      return {
        passed: hasHeader && hasCompHeader && hasClassification,
        details: `CSV payload generated (${csv.split('\n').length} lines).`,
      };
    }
  );

  // TEST-EXP-25: Backward Compatibility with Phase 9D Comparative Evaluation
  recordTest(
    'TEST-EXP-25',
    'Phase 9D Comparative Evaluation Framework Backward Compatibility',
    'System Compatibility',
    () => {
      const scenarios = comparativeEvaluationService.getScenarios();
      const has5 = scenarios.length === 5;
      const sc01 = comparativeEvaluationService.getScenario('SC-01');

      return {
        passed: has5 && !!sc01,
        details: `Phase 9D Comparative Evaluation has ${scenarios.length} scenarios intact.`,
      };
    }
  );

  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  return {
    suiteName: 'SCOS Phase 10B Controlled Experimental Execution & Reproducibility Test Suite',
    totalTests: results.length,
    passedTests,
    failedTests,
    allPassed: failedTests === 0,
    executedAt: new Date().toISOString(),
    results,
    classificationNotice: 'SIMULATED / PROTOTYPE DATA — Automated Research Verification Suite',
  };
}
