// =========================================================================
// SCOS PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE TEST SUITE
// 45+ Comprehensive Automated Tests for 15-Step Research Story,
// Professor Mode, Quick Demo, Scenarios, Examiner Q&A, Manifest & Safety
// Academic Affiliation: IIT Kanpur — Department of Civil Engineering
// =========================================================================

import { researchDemonstrationService } from '../services/researchDemonstrationService';
import {
  DemonstrationStepId,
  ScenarioId,
  ResearchDemonstrationStep,
} from '../types/researchDemonstration';

export interface DemonstrationTestResult {
  specId: string;
  specName: string;
  category: string;
  passed: boolean;
  durationMs: number;
  description: string;
  error?: string;
}

export interface DemonstrationTestSuiteReport {
  suiteId: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  durationMs: number;
  executedAt: string;
  allPassed: boolean;
  results: DemonstrationTestResult[];
  manifestFingerprint: string;
  mandatoryNotice: string;
}

/**
 * Assertion helper functions
 */
function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

export function runResearchDemonstrationTestSuite(): DemonstrationTestSuiteReport {
  const startTime = Date.now();
  const results: DemonstrationTestResult[] = [];

  const runTest = (
    specId: string,
    specName: string,
    category: string,
    description: string,
    testFn: () => boolean | void
  ) => {
    const t0 = Date.now();
    try {
      const outcome = testFn();
      const passed = outcome === undefined || outcome === true;
      results.push({
        specId,
        specName,
        category,
        passed,
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
        error: e?.message || String(e),
      });
    }
  };

  // Reset state before tests
  researchDemonstrationService.resetDemonstrationState();

  // -------------------------------------------------------------
  // 1. Session Builder & Mode Tests (1–5)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-01',
    'Build Default Professor Mode Session',
    'SESSION_MGMT',
    'Verifies creation of active research demonstration session with default professor mode and canonical SC-01 scenario.',
    () => {
      const session = researchDemonstrationService.buildResearchDemonstration();
      assertTrue(!!session, 'Session must be created');
      assertEqual(session.sessionId, 'SESSION-SCOS-VIVA-01', 'Default session ID match');
      assertEqual(session.selectedMode, 'PROFESSOR_MODE', 'Default mode match');
      assertEqual(session.selectedScenario, 'SC-01', 'Default scenario match');
      assertEqual(session.currentStep, 'STEP-01', 'Default step match');
      assertEqual(session.fieldValidationStatus, 'NOT_ESTABLISHED', 'Field validation status match');
    }
  );

  runTest(
    'TEST-RD-02',
    'Build Quick Demo Mode Session with Scenario SC-02',
    'SESSION_MGMT',
    'Verifies creation of demonstration session in Quick Demo mode with alternative scenario SC-02.',
    () => {
      const session = researchDemonstrationService.buildResearchDemonstration(
        'SESSION-QUICK-02',
        'QUICK_DEMO',
        'SC-02'
      );
      assertEqual(session.selectedMode, 'QUICK_DEMO', 'Mode is QUICK_DEMO');
      assertEqual(session.selectedScenario, 'SC-02', 'Scenario is SC-02');
      assertEqual(session.researchQuestionLinks.length, 5, 'Must link 5 RQs');
      assertEqual(session.hypothesisLinks.length, 5, 'Must link 5 Hypotheses');
    }
  );

  runTest(
    'TEST-RD-03',
    'Session Idempotency and Preservation',
    'SESSION_MGMT',
    'Ensures repeated calls with existing sessionId preserve session state without recreation.',
    () => {
      const s1 = researchDemonstrationService.buildResearchDemonstration('SESSION-PERSIST-01');
      const s2 = researchDemonstrationService.buildResearchDemonstration('SESSION-PERSIST-01');
      assertTrue(s1 === s2, 'Repeated call with same ID returns existing session reference');
    }
  );

  runTest(
    'TEST-RD-04',
    'All 10 Core Metrics M1-M10 Linked in Session',
    'SESSION_MGMT',
    'Verifies that demonstration session links all 10 evaluated experimental metrics M1 through M10.',
    () => {
      const session = researchDemonstrationService.buildResearchDemonstration();
      assertEqual(session.metricLinks.length, 10, 'Must contain 10 metric links');
      assertEqual(session.metricLinks[0], 'M1', 'First metric M1');
      assertEqual(session.metricLinks[9], 'M10', 'Last metric M10');
    }
  );

  runTest(
    'TEST-RD-05',
    'Upstream Research Phase Provenance Links',
    'SESSION_MGMT',
    'Verifies evidence references cover all foundational research phases 8 through 11C.',
    () => {
      const session = researchDemonstrationService.buildResearchDemonstration();
      assertTrue(session.evidenceReferences.includes('PHASE-8-SECURITY-COORDINATION'), 'Must include Phase 8');
      assertTrue(session.evidenceReferences.includes('PHASE-9-DIGITAL-TWIN-SIMULATION'), 'Must include Phase 9');
      assertTrue(session.evidenceReferences.includes('PHASE-10-EXPERIMENTAL-BENCHMARKS'), 'Must include Phase 10');
      assertTrue(session.evidenceReferences.includes('PHASE-11A-RESEARCH-VALIDATION-HUB'), 'Must include Phase 11A');
      assertTrue(session.evidenceReferences.includes('PHASE-11B-CLAIMS-GOVERNANCE'), 'Must include Phase 11B');
      assertTrue(session.evidenceReferences.includes('PHASE-11C-THESIS-EVIDENCE-PACKAGE'), 'Must include Phase 11C');
    }
  );

  // -------------------------------------------------------------
  // 2. 15-Step Master Research Story Integrity Tests (6–12)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-06',
    '15 Sequential Research Steps Count',
    'RESEARCH_STORY',
    'Verifies that exactly 15 sequential demonstration steps are retrieved.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      assertEqual(steps.length, 15, 'Must contain exactly 15 steps');
    }
  );

  runTest(
    'TEST-RD-07',
    'Step Order and Identifiers 1 to 15',
    'RESEARCH_STORY',
    'Verifies sequential ordering of steps from STEP-01 to STEP-15 without gaps.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((step, index) => {
        assertEqual(step.stepNumber, index + 1, `Step ${index + 1} number match`);
        const expectedId = `STEP-${(index + 1).toString().padStart(2, '0')}`;
        assertEqual(step.stepId, expectedId, `Step ${index + 1} ID match`);
      });
    }
  );

  runTest(
    'TEST-RD-08',
    'Step Narrative and Key Takeaways Completeness',
    'RESEARCH_STORY',
    'Verifies all 15 steps provide comprehensive narratives, takeaways, civil context, and limitation notices.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((step) => {
        assertTrue(step.title.length > 5, `Step ${step.stepId} title length`);
        assertTrue(step.shortTitle.length > 2, `Step ${step.stepId} shortTitle length`);
        assertTrue(step.subtitle.length > 5, `Step ${step.stepId} subtitle length`);
        assertTrue(step.keyTakeaway.length > 15, `Step ${step.stepId} keyTakeaway length`);
        assertTrue(step.primaryNarrative.length > 50, `Step ${step.stepId} narrative length`);
        assertTrue((step.civilEngineeringContext || '').length > 15, `Step ${step.stepId} civil context length`);
        assertTrue(step.limitationsNotice.length > 15, `Step ${step.stepId} limitationsNotice length`);
      });
    }
  );

  runTest(
    'TEST-RD-09',
    'Permitted Statements vs Prohibited Overclaims in Every Step',
    'RESEARCH_STORY',
    'Ensures every demonstration step contrasts permitted academic statements against prohibited overclaims.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((step) => {
        assertTrue(step.permittedStatements.length >= 1, `Step ${step.stepId} permitted statements`);
        assertTrue(step.prohibitedOverclaims.length >= 1, `Step ${step.stepId} prohibited overclaims`);
      });
    }
  );

  runTest(
    'TEST-RD-10',
    'Artifact Mappings (Figures, Tables, Phases)',
    'RESEARCH_STORY',
    'Ensures all 15 steps link to valid dissertation figures, tables, and historical phases.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((step) => {
        assertTrue(step.mappedArtifacts.figures.length > 0, `Step ${step.stepId} figures mapping`);
        assertTrue(step.mappedArtifacts.tables.length > 0, `Step ${step.stepId} tables mapping`);
        assertTrue(step.mappedArtifacts.phases.length > 0, `Step ${step.stepId} phases mapping`);
      });
    }
  );

  runTest(
    'TEST-RD-11',
    'Step 1 Problem Dimensions Matrix',
    'RESEARCH_STORY',
    'Verifies Step 1 details the 4 core municipal problem dimensions.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s1 = steps.find((s) => s.stepId === 'STEP-01')!;
      assertTrue(!!s1, 'Step 1 exists');
      assertEqual(s1.stepData.coreProblemDimensions.length, 4, '4 problem dimensions');
      assertEqual(s1.stepData.coreProblemDimensions[0].dim, 'Data Fragmentation', 'Dimension 1 Data Fragmentation');
    }
  );

  runTest(
    'TEST-RD-12',
    'Step 4 SCOS 9-Layer Architecture Definition',
    'RESEARCH_STORY',
    'Verifies Step 4 defines all 9 layers from L1 Sensing to L9 Governance.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s4 = steps.find((s) => s.stepId === 'STEP-04')!;
      assertTrue(!!s4, 'Step 4 exists');
      assertEqual(s4.stepData.layers.length, 9, '9 architectural layers');
      assertEqual(s4.stepData.layers[0].level, 'L1', 'First layer L1');
      assertEqual(s4.stepData.layers[8].level, 'L9', 'Last layer L9');
    }
  );

  // -------------------------------------------------------------
  // 3. Quick Demo & Professor Mode Tests (13–17)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-13',
    'Quick Demo Configuration 10 Steps',
    'MODE_CONFIG',
    'Verifies Quick Demo mode is configured with exactly 10 high-impact steps (~5 minutes).',
    () => {
      const quickSteps = researchDemonstrationService.getQuickDemoSteps();
      assertEqual(quickSteps.length, 10, 'Quick demo must contain exactly 10 steps');
    }
  );

  runTest(
    'TEST-RD-14',
    'Quick Demo Core Step Inclusions',
    'MODE_CONFIG',
    'Verifies that Quick Demo includes Problem, Gap, Architecture, Civil, Scenario, Twin, Experiment, Results, Contributions, and Limitations steps.',
    () => {
      const quickSteps = researchDemonstrationService.getQuickDemoSteps();
      const ids = quickSteps.map((q) => q.stepId);
      assertTrue(ids.includes('STEP-01'), 'Includes STEP-01');
      assertTrue(ids.includes('STEP-02'), 'Includes STEP-02');
      assertTrue(ids.includes('STEP-04'), 'Includes STEP-04');
      assertTrue(ids.includes('STEP-05'), 'Includes STEP-05');
      assertTrue(ids.includes('STEP-06'), 'Includes STEP-06');
      assertTrue(ids.includes('STEP-07'), 'Includes STEP-07');
      assertTrue(ids.includes('STEP-10'), 'Includes STEP-10');
      assertTrue(ids.includes('STEP-11'), 'Includes STEP-11');
      assertTrue(ids.includes('STEP-14'), 'Includes STEP-14');
      assertTrue(ids.includes('STEP-15'), 'Includes STEP-15');
    }
  );

  runTest(
    'TEST-RD-15',
    'Professor Review Mode Step Filtering',
    'MODE_CONFIG',
    'Verifies all steps returned for professor mode have isIncludedInProfessorMode flag set to true.',
    () => {
      const profSteps = researchDemonstrationService.getProfessorDemoSteps();
      assertTrue(profSteps.length >= 10, 'Professor steps length >= 10');
      profSteps.forEach((s) => {
        assertTrue(s.isIncludedInProfessorMode, `Step ${s.stepId} is in professor mode`);
      });
    }
  );

  runTest(
    'TEST-RD-16',
    'Research Story Summary for Examiner Briefing',
    'MODE_CONFIG',
    'Verifies structured story summary provides complete overview with mandatory field limitation notice.',
    () => {
      const summary = researchDemonstrationService.getResearchStorySummary();
      assertTrue(summary.researchProblem.length > 20, 'Research problem defined');
      assertTrue(summary.researchGap.length > 20, 'Research gap defined');
      assertTrue(summary.proposedReferenceArchitecture.length > 20, 'Reference architecture defined');
      assertTrue(summary.civilEngineeringFoundation.length > 20, 'Civil engineering foundation defined');
      assertTrue(summary.observedResultsSummary.length > 20, 'Observed results defined');
      assertTrue(summary.mandatoryNotice.includes('REAL-WORLD MUNICIPAL FIELD VALIDATION NOT ESTABLISHED'), 'Notice contains field validation status');
    }
  );

  runTest(
    'TEST-RD-17',
    'Bounded Time Estimates for Presentation Steps',
    'MODE_CONFIG',
    'Verifies every step time estimate is reasonable (1-3 minutes) to ensure 10-15 minute defense timing.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((s) => {
        assertTrue(s.timeEstimateMinutes >= 1 && s.timeEstimateMinutes <= 3, `Step ${s.stepId} duration 1-3 mins`);
      });
    }
  );

  // -------------------------------------------------------------
  // 4. Benchmark Scenario Tests (18–22)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-18',
    'Canonical Scenario SC-01 (Monsoon Inundation)',
    'BENCHMARK_SCENARIOS',
    'Verifies retrieval of canonical demonstration scenario SC-01 with 65 mm/hr rainfall and Sisamau Nala drain.',
    () => {
      const sc = researchDemonstrationService.getDemonstrationScenario('SC-01');
      assertEqual(sc.scenarioId, 'SC-01', 'Scenario ID SC-01');
      assertTrue(sc.isCanonicalDemoScenario, 'Is canonical demo scenario');
      assertEqual(sc.rainfallMmPerHr, 65, '65 mm/hr rainfall');
      assertEqual(sc.durationHours, 6, '6 hours duration');
      assertTrue(sc.infrastructureInvolved.includes('Sisamau Nala Open Storm Drain'), 'Includes Sisamau Nala drain');
    }
  );

  runTest(
    'TEST-RD-19',
    'All 5 Benchmark Scenarios SC-01 to SC-05 Retrieval',
    'BENCHMARK_SCENARIOS',
    'Verifies retrieval of all 5 benchmark scenarios with simulated data classification.',
    () => {
      const scenarios: ScenarioId[] = ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'];
      scenarios.forEach((scId) => {
        const sc = researchDemonstrationService.getDemonstrationScenario(scId);
        assertEqual(sc.scenarioId, scId, `Scenario ${scId} match`);
        assertTrue(sc.departmentsInvolved.length > 1, `Scenario ${scId} multi-agency`);
        assertEqual(sc.dataClassification, 'CONTROLLED_SYNTHETIC_SIMULATION', `Scenario ${scId} classification`);
      });
    }
  );

  runTest(
    'TEST-RD-20',
    'Multi-Department Engagement in SC-01',
    'BENCHMARK_SCENARIOS',
    'Ensures SC-01 engages Nagar Nigam, KDA, Traffic Police, and KESCO.',
    () => {
      const sc = researchDemonstrationService.getDemonstrationScenario('SC-01');
      assertTrue(sc.departmentsInvolved.includes('Nagar Nigam'), 'Nagar Nigam included');
      assertTrue(sc.departmentsInvolved.includes('KDA'), 'KDA included');
      assertTrue(sc.departmentsInvolved.includes('Traffic Police'), 'Traffic Police included');
      assertTrue(sc.departmentsInvolved.includes('KESCO'), 'KESCO included');
    }
  );

  runTest(
    'TEST-RD-21',
    'Engineering Assumptions Stated for SC-01',
    'BENCHMARK_SCENARIOS',
    'Ensures Manning roughness and pump curve engineering assumptions are documented.',
    () => {
      const sc = researchDemonstrationService.getDemonstrationScenario('SC-01');
      assertTrue(sc.engineeringAssumptions.length >= 2, 'Engineering assumptions >= 2');
      assertTrue(sc.engineeringAssumptions[0].includes('Manning roughness'), 'Manning roughness documented');
    }
  );

  runTest(
    'TEST-RD-22',
    'Fallback to SC-01 for Unknown Scenario',
    'BENCHMARK_SCENARIOS',
    'Verifies graceful fallback to canonical SC-01 when an unknown scenario identifier is requested.',
    () => {
      const sc = researchDemonstrationService.getDemonstrationScenario('SC-UNKNOWN' as any);
      assertEqual(sc.scenarioId, 'SC-01', 'Fallback to SC-01');
    }
  );

  // -------------------------------------------------------------
  // 5. Civil Engineering & Experimental Design Tests (23–27)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-23',
    'Civil Engineering Domain Summary Grounding',
    'CIVIL_GROUNDING',
    'Verifies Civil Engineering domain summary with 4 parameter classifications (ENGINEERING_MODEL, HEURISTIC, SIMULATED, EMPIRICAL).',
    () => {
      const civil = researchDemonstrationService.getCivilEngineeringSummary();
      assertEqual(civil.title, 'Civil Engineering Grounding in SCOS', 'Title match');
      assertTrue(civil.department.includes('IIT Kanpur'), 'Department match');
      assertEqual(civil.engineeringClassifications.length, 4, '4 classifications');
    }
  );

  runTest(
    'TEST-RD-24',
    'Experimental Design Condition A vs Condition B',
    'EXPERIMENTAL_DESIGN',
    'Verifies Condition A is synthetic baseline and Condition B is controlled prototype simulation.',
    () => {
      const design = researchDemonstrationService.getExperimentalDesignSummary();
      assertEqual(design.conditionA.code, 'CONDITION_A', 'Condition A code');
      assertEqual(design.conditionA.dataClassification, 'SYNTHETIC BENCHMARK BASELINE', 'Condition A classification');
      assertEqual(design.conditionB.code, 'CONDITION_B', 'Condition B code');
      assertEqual(design.conditionB.dataClassification, 'CONTROLLED PROTOTYPE SIMULATION', 'Condition B classification');
      assertEqual(design.scenariosCovered.length, 5, '5 scenarios covered');
      assertEqual(design.metricsEvaluated.length, 10, '10 metrics evaluated');
    }
  );

  runTest(
    'TEST-RD-25',
    'Benchmark Results M1 Workflow Duration Improvement',
    'EXPERIMENTAL_DESIGN',
    'Verifies M1 shows significant workflow duration reduction from baseline to SCOS.',
    () => {
      const res = researchDemonstrationService.getResultsSummary();
      assertEqual(res.sampleSizeTotal, 75, '75 total runs');
      const m1 = res.metrics.find((m: any) => m.code === 'M1');
      assertTrue(!!m1, 'M1 exists');
      assertTrue(m1.baselineMean > m1.scosMean, 'Baseline mean > SCOS mean');
      assertTrue(m1.relativeChangePercent < 0, 'Negative change = duration reduction');
    }
  );

  runTest(
    'TEST-RD-26',
    'Benchmark Results M6 Cascade Identification Improvement',
    'EXPERIMENTAL_DESIGN',
    'Verifies M6 cascade identification shows >100% relative improvement under SCOS.',
    () => {
      const res = researchDemonstrationService.getResultsSummary();
      const m6 = res.metrics.find((m: any) => m.code === 'M6');
      assertTrue(!!m6, 'M6 exists');
      assertTrue(m6.scosMean > m6.baselineMean, 'SCOS mean > baseline mean');
      assertTrue(m6.relativeChangePercent > 100, 'Over 100% improvement');
    }
  );

  runTest(
    'TEST-RD-27',
    'Benchmark Results M10 Audit Traceability 100%',
    'EXPERIMENTAL_DESIGN',
    'Verifies M10 cryptographic ledger verification achieves 100% traceability.',
    () => {
      const res = researchDemonstrationService.getResultsSummary();
      const m10 = res.metrics.find((m: any) => m.code === 'M10');
      assertTrue(!!m10, 'M10 exists');
      assertEqual(m10.scosMean, 100, 'SCOS mean is 100%');
    }
  );

  // -------------------------------------------------------------
  // 6. Hypotheses, Robustness & Contributions Tests (28–32)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-28',
    'Hypothesis Summary H01 through H05',
    'HYPOTHESES',
    'Verifies H01-H05 statuses, evidence strength scores (>=80), and permitted academic statements.',
    () => {
      const hyp = researchDemonstrationService.getHypothesisSummary();
      assertEqual(hyp.hypotheses.length, 5, '5 hypotheses');
      hyp.hypotheses.forEach((h: any) => {
        assertTrue(h.score >= 80, `Hypothesis ${h.hypothesisId} score >= 80`);
        assertTrue(h.permittedStatement.length > 10, `Hypothesis ${h.hypothesisId} statement length`);
        assertTrue(h.primaryLimitation.length > 5, `Hypothesis ${h.hypothesisId} limitation length`);
      });
    }
  );

  runTest(
    'TEST-RD-29',
    '8 Formal Research Contributions Registry',
    'CONTRIBUTIONS',
    'Verifies all 8 formal research contributions are classified across academic domains.',
    () => {
      const contr = researchDemonstrationService.getContributionSummary();
      assertEqual(contr.totalContributions, 8, '8 total contributions');
      assertEqual(contr.contributions.length, 8, '8 contribution items');
    }
  );

  runTest(
    'TEST-RD-30',
    'Evidence Boundaries (Supported vs Unestablished)',
    'BOUNDARIES',
    'Verifies boundary disclosures separate supported achievements from unestablished real-world field claims.',
    () => {
      const b = researchDemonstrationService.getBoundarySummary();
      assertTrue(b.supportedAspects.length >= 5, 'Supported aspects >= 5');
      assertTrue(b.unestablishedAspects.length >= 5, 'Unestablished aspects >= 5');
      assertEqual(b.bindingStatus, 'REAL-WORLD MUNICIPAL FIELD VALIDATION: NOT ESTABLISHED', 'Binding status match');
    }
  );

  runTest(
    'TEST-RD-31',
    'Step 8 Cascade Timeline Sequence',
    'RESEARCH_STORY',
    'Verifies Step 8 cascade timeline documents 5 sequential milestone events from T+00m to T+62m.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s8 = steps.find((s) => s.stepId === 'STEP-08')!;
      assertTrue(!!s8, 'Step 8 exists');
      assertEqual(s8.stepData.cascadeSteps.length, 5, '5 cascade steps');
      assertEqual(s8.stepData.cascadeSteps[0].delay, 'T+00m', 'Start T+00m');
      assertEqual(s8.stepData.cascadeSteps[4].delay, 'T+62m', 'End T+62m');
    }
  );

  runTest(
    'TEST-RD-32',
    'Step 9 Human-in-the-Loop Triage Governance Flow',
    'RESEARCH_STORY',
    'Verifies Step 9 details 5 governance stages including human approval and audit logging.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s9 = steps.find((s) => s.stepId === 'STEP-09')!;
      assertTrue(!!s9, 'Step 9 exists');
      assertEqual(s9.stepData.triageFlow.length, 5, '5 triage steps');
      const stepNames = s9.stepData.triageFlow.map((t: any) => t.step);
      assertTrue(stepNames.includes('Detection'), 'Includes Detection');
      assertTrue(stepNames.includes('Human Review'), 'Includes Human Review');
      assertTrue(stepNames.includes('Dispatch & Audit'), 'Includes Dispatch & Audit');
    }
  );

  // -------------------------------------------------------------
  // 7. Examiner Questions Matrix Tests (33–37)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-33',
    '17 Examiner Questions Count',
    'EXAMINER_QUESTIONS',
    'Verifies matrix contains exactly 17 research-grounded examiner questions.',
    () => {
      const questions = researchDemonstrationService.getExaminerQuestions();
      assertEqual(questions.length, 17, 'Must contain 17 examiner questions');
    }
  );

  runTest(
    'TEST-RD-34',
    'Examiner Questions Complete Disclosures',
    'EXAMINER_QUESTIONS',
    'Ensures each examiner question contains short answer, detailed grounding, evidence link, and primary limitation.',
    () => {
      const questions = researchDemonstrationService.getExaminerQuestions();
      questions.forEach((q, idx) => {
        assertEqual(q.questionNumber, idx + 1, `Question ${idx + 1} numbering`);
        assertTrue(q.questionText.length > 10, `Question ${q.questionId} text`);
        assertTrue(q.shortAnswer.length > 15, `Question ${q.questionId} short answer`);
        assertTrue(q.detailedAnswer.length > 30, `Question ${q.questionId} detailed answer`);
        assertTrue(q.evidenceLink.length > 5, `Question ${q.questionId} evidence link`);
        assertTrue(q.primaryLimitation.length > 10, `Question ${q.questionId} limitation`);
        assertTrue(q.fieldValidationRequirement.length > 10, `Question ${q.questionId} field requirement`);
      });
    }
  );

  runTest(
    'TEST-RD-35',
    'Question 4 Civil Engineering Physical Grounding',
    'EXAMINER_QUESTIONS',
    'Verifies Q-04 specifically details physical grounding in Manning equation and pump curves.',
    () => {
      const questions = researchDemonstrationService.getExaminerQuestions();
      const q4 = questions.find((q) => q.questionId === 'Q-04')!;
      assertTrue(!!q4, 'Q-04 exists');
      assertTrue(q4.questionText.includes('Civil Engineering'), 'Q-04 mentions Civil Engineering');
      assertTrue(q4.shortAnswer.includes('drainage catchments (Manning equation)'), 'Q-04 references Manning equation');
    }
  );

  runTest(
    'TEST-RD-36',
    'Question 12 Human-in-the-Loop vs Autonomous AI',
    'EXAMINER_QUESTIONS',
    'Verifies Q-12 articulates why administrative accountability prohibits autonomous actuation.',
    () => {
      const questions = researchDemonstrationService.getExaminerQuestions();
      const q12 = questions.find((q) => q.questionId === 'Q-12')!;
      assertTrue(!!q12, 'Q-12 exists');
      assertTrue(q12.questionText.includes('human-in-the-loop'), 'Q-12 mentions human-in-the-loop');
      assertTrue(q12.shortAnswer.includes('administrative accountability'), 'Q-12 explains accountability');
    }
  );

  runTest(
    'TEST-RD-37',
    'Question 16 Field Validation Limitation Disclosure',
    'EXAMINER_QUESTIONS',
    'Verifies Q-16 prominently highlights that real-world field validation is NOT ESTABLISHED.',
    () => {
      const questions = researchDemonstrationService.getExaminerQuestions();
      const q16 = questions.find((q) => q.questionId === 'Q-16')!;
      assertTrue(!!q16, 'Q-16 exists');
      assertTrue(q16.shortAnswer.includes('Real-World Field Validation: NOT ESTABLISHED'), 'Q-16 discloses field limitation');
    }
  );

  // -------------------------------------------------------------
  // 8. Evidence Drawer & Manifest Cryptographic Tests (38–42)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-38',
    'Evidence Records for all 15 Steps',
    'EVIDENCE_DRAWER',
    'Verifies valid SHA-256 fingerprint and audit summary for every demonstration step.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      steps.forEach((step) => {
        const evid = researchDemonstrationService.getDemonstrationEvidence(step.stepId);
        assertTrue(!!evid, `Evidence for step ${step.stepId} exists`);
        assertEqual(evid.stepId, step.stepId, `Evidence stepId matches`);
        assertTrue(evid.cryptographicFingerprint.startsWith('sha256:'), `Evidence has sha256 prefix`);
        assertEqual(evid.cryptographicFingerprint.length, 71, `Evidence sha256 64-char hex length`);
        assertTrue(evid.primaryLimitation.length > 5, `Evidence has limitation`);
      });
    }
  );

  runTest(
    'TEST-RD-39',
    'Demonstration Manifest Canonical Structure',
    'MANIFEST',
    'Verifies Manifest ID, SHA-256 fingerprint, and included steps, scenarios, metrics, hypotheses.',
    () => {
      const manifest = researchDemonstrationService.getDemonstrationManifest();
      assertEqual(manifest.manifestId, 'MANIFEST-SCOS-DEMO-v1.0', 'Manifest ID match');
      assertTrue(manifest.demoFingerprint.startsWith('sha256:'), 'Manifest fingerprint sha256 prefix');
      assertEqual(manifest.includedSteps.length, 15, '15 steps included');
      assertEqual(manifest.includedScenarios.length, 5, '5 scenarios included');
      assertEqual(manifest.includedMetrics.length, 10, '10 metrics included');
      assertEqual(manifest.includedHypotheses.length, 5, '5 hypotheses included');
      assertTrue(manifest.academicNotice.includes('REAL-WORLD MUNICIPAL FIELD VALIDATION NOT ESTABLISHED'), 'Notice present');
    }
  );

  runTest(
    'TEST-RD-40',
    'Deterministic Manifest Fingerprint Verification',
    'MANIFEST',
    'Verifies that verifyDemonstrationFingerprint() computes and confirms valid SHA-256 match.',
    () => {
      const verify = researchDemonstrationService.verifyDemonstrationFingerprint();
      assertTrue(verify.valid, 'Verification is valid');
      assertEqual(verify.computedFingerprint, verify.expectedFingerprint, 'Computed matches expected fingerprint');
      assertEqual(verify.manifestId, 'MANIFEST-SCOS-DEMO-v1.0', 'Manifest ID match');
    }
  );

  // -------------------------------------------------------------
  // 9. Claim Safety Linter & Reset Invariance Tests (41–45)
  // -------------------------------------------------------------
  runTest(
    'TEST-RD-41',
    'Claim Safety Linter Flags Prohibited Overclaims',
    'CLAIM_LINTER',
    'Ensures terms like "proven", "guarantees", "field validated" are flagged with academic replacements.',
    () => {
      const res = researchDemonstrationService.validatePresentationClaim(
        'SCOS proves disaster reduction in real cities with guaranteed outcomes and field validated success.'
      );
      assertEqual(res.isValid, false, 'Overclaimed text is invalid');
      assertTrue(res.hasOverclaims, 'hasOverclaims is true');
      assertTrue(res.flaggedTerms.length >= 2, 'Flagged terms >= 2');
    }
  );

  runTest(
    'TEST-RD-42',
    'Claim Safety Linter Accepts Bounded Academic Phrasing',
    'CLAIM_LINTER',
    'Ensures bounded phrasing like "observed in prototype simulations" is classified as compliant.',
    () => {
      const res = researchDemonstrationService.validatePresentationClaim(
        'SCOS was observed to show response time reductions under evaluated prototype scenarios.'
      );
      assertEqual(res.isValid, true, 'Bounded text is valid');
      assertEqual(res.hasOverclaims, false, 'hasOverclaims is false');
    }
  );

  runTest(
    'TEST-RD-43',
    'Non-Destructive State Reset Invariance',
    'NON_DESTRUCTIVE',
    'Verifies that resetting demonstration state does not modify underlying research datasets or benchmark metrics.',
    () => {
      const reset = researchDemonstrationService.resetDemonstrationState();
      assertTrue(reset.message.includes('Demonstration presentation state reset successfully'), 'Reset confirmation message');

      // Verify underlying steps and results remain intact
      const steps = researchDemonstrationService.getDemonstrationSteps();
      assertEqual(steps.length, 15, 'Steps remain 15 after reset');
      const res = researchDemonstrationService.getResultsSummary();
      assertEqual(res.sampleSizeTotal, 75, 'Results sample size remains 75');
    }
  );

  runTest(
    'TEST-RD-44',
    'Step 7 Digital Twin Entity & Edge Metrics',
    'RESEARCH_STORY',
    'Verifies Step 7 Digital Twin records 128 entities and 214 dependency edges.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s7 = steps.find((s) => s.stepId === 'STEP-07')!;
      assertTrue(!!s7, 'Step 7 exists');
      assertEqual(s7.stepData.twinMetrics.totalEntities, 128, '128 total entities');
      assertEqual(s7.stepData.twinMetrics.dependencyEdges, 214, '214 dependency edges');
      assertEqual(s7.stepData.twinMetrics.catchmentZones, 18, '18 catchment zones');
    }
  );

  runTest(
    'TEST-RD-45',
    'Step 12 Sensitivity Factor Dominance',
    'RESEARCH_STORY',
    'Verifies Step 12 confirms Operator Triage Latency as the dominant sensitivity factor.',
    () => {
      const steps = researchDemonstrationService.getDemonstrationSteps();
      const s12 = steps.find((s) => s.stepId === 'STEP-12')!;
      assertTrue(!!s12, 'Step 12 exists');
      assertTrue(s12.stepData.sensitivitySummary.dominantParameters[0].includes('Operator Triage Latency'), 'Operator triage is dominant factor');
      assertTrue(s12.stepData.sensitivitySummary.robustMetrics.includes('M6 Cascade Identification'), 'M6 is robust metric');
    }
  );

  const durationMs = Date.now() - startTime;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const manifest = researchDemonstrationService.getDemonstrationManifest();

  return {
    suiteId: 'SUITE-SCOS-PHASE-11D-DEMO-VIVA-DEFENSE',
    totalTests: results.length,
    passedCount,
    failedCount,
    durationMs,
    executedAt: new Date().toISOString(),
    allPassed: failedCount === 0,
    results,
    manifestFingerprint: manifest.demoFingerprint,
    mandatoryNotice: manifest.academicNotice,
  };
}

export default runResearchDemonstrationTestSuite;
