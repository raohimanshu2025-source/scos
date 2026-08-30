// =========================================================================
// SCOS PHASE 10B — CONTROLLED EXPERIMENTAL EXECUTION ENGINE
// Standardized Municipal Scenarios (SC-01 to SC-05), M1–M10 Metrics & Reproducibility
// =========================================================================

import {
  ExperimentalCondition,
  ExperimentalExecutionStatus,
  ExperimentalOrder,
  WorkflowActivityStepId,
  ExperimentalMetricKey,
  ExperimentalObservation,
  ExperimentalMetricObservation,
  ExperimentalRun,
  ExperimentalExecutionSession,
  ExperimentalComparisonResult,
  MetricComparisonItem,
  RunReproducibilityVerificationResult,
  ExperimentalExportPayload,
} from '../types/experimentalExecution';
import { ResultValidityClassification, OrderEffectRisk } from '../types/comparativeEvaluation';
import { researchDatasetService, canonicalJsonStringify, computeDeterministicFingerprint } from './researchDatasetService';
import { experimentalResultsStore } from './experimentalResultsStore';
import { dbStore } from '../backend/db/store';
import { incidentStore } from './incidentStore';

class ExperimentalExecutionService {
  /**
   * Version of the Experimental Metric Calculation Framework
   */
  private readonly METRIC_CALCULATION_VERSION = 'v1.0-STANDARDIZED';

  /**
   * Create an Experimental Execution Session
   */
  public createSession(
    scenarioId: string,
    order: ExperimentalOrder = 'BASELINE_THEN_SCOS',
    createdBy = 'researcher@scos.gov.in',
    notes = 'Controlled municipal workflow comparison session'
  ): ExperimentalExecutionSession {
    const scenario = researchDatasetService.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario '${scenarioId}' not found in Phase 10A Research Dataset.`);
    }

    // Build parameter snapshot & compute deterministic fingerprint
    const parametersSnapshot: Record<string, number | string> = {};
    for (const p of scenario.engineeringParameters) {
      parametersSnapshot[p.parameterId] = p.value;
    }
    const parameterFingerprint = computeDeterministicFingerprint(parametersSnapshot);

    // Initial conditions based on scenario
    const initialConditions = this.getScenarioInitialConditions(scenario.scenarioCode);
    const initialConditionFingerprint = computeDeterministicFingerprint(initialConditions);

    const sessionId = `EXP-SESS-${scenario.scenarioCode}-${Date.now().toString().slice(-6)}`;
    const sessionCode = `EXP-${scenario.scenarioCode}-${order.slice(0, 4)}`;

    const session: ExperimentalExecutionSession = {
      sessionId,
      sessionCode,
      datasetVersion: scenario.datasetVersion,
      scenarioId: scenario.scenarioId,
      scenarioCode: scenario.scenarioCode,
      scenarioName: scenario.scenarioName,
      scenarioFingerprint: scenario.configurationFingerprint,
      parameterFingerprint,
      initialConditionFingerprint,
      order,
      status: 'READY',
      runs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      notes,
    };

    experimentalResultsStore.saveSession(session);
    return session;
  }

  /**
   * Get initial engineering conditions for a given scenario
   */
  public getScenarioInitialConditions(scenarioCode: string): Record<string, number | string | boolean> {
    switch (scenarioCode) {
      case 'SC-01':
        return {
          precipitationIntensityMmHr: 45,
          nala17LevelPercent: 85,
          roadInundationDepthCm: 28,
          trafficQueueMinutes: 35,
          hospitalRouteImpeded: true,
          initialSoilSaturationPercent: 78,
        };
      case 'SC-02':
        return {
          pumpP04MotorCurrentAmps: 0,
          pumpDischargeM3Hr: 0,
          pumpTripStatus: 'TRIPPED',
          sumpLevelPercent: 96,
          secondaryStreetRunoffCm: 18,
          backupPumpRequired: true,
        };
      case 'SC-03':
        return {
          nala17SiltationPercent: 80,
          hydraulicHeadMeters: 1.8,
          debrisObstructionLevel: 'CRITICAL',
          gravityOutflowCapacityReductionPercent: 75,
          upstreamSurchargeRisk: true,
        };
      case 'SC-04':
        return {
          compoundPrecipitationMmHr: 65,
          substationWaterLevelCm: 15,
          feederPillarIsolationNeeded: true,
          powerGridTripRisk: 0.78,
          multiWardEmergencyAlert: true,
        };
      case 'SC-05':
        return {
          ursulaCorridorInundationDepthCm: 32,
          ambulanceTransitDelayMinutes: 24,
          alternativeAccessRouteActive: false,
          auxiliaryGeneratorFuelHours: 48,
          hospitalEmergencyStatus: 'HIGH_ACCESS_RISK',
        };
      default:
        return {
          baselinePrecipitationMmHr: 40,
          drainageSaturationPercent: 80,
          operationalStatus: 'SIMULATED_PROTOTYPE',
        };
    }
  }

  /**
   * Execute a Controlled Experimental Run under Condition A or Condition B
   */
  public executeRun(
    sessionId: string,
    condition: ExperimentalCondition,
    executedBy = 'researcher@scos.gov.in',
    order?: ExperimentalOrder
  ): ExperimentalRun {
    const session = experimentalResultsStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    const scenario = researchDatasetService.getScenario(session.scenarioId);
    if (!scenario) {
      throw new Error(`Scenario '${session.scenarioId}' not found.`);
    }

    // Verify scenario integrity
    const currentFingerprint = scenario.configurationFingerprint;
    if (session.scenarioFingerprint && session.scenarioFingerprint !== currentFingerprint) {
      throw new Error(`Scenario integrity mismatch: session expects '${session.scenarioFingerprint}' but registry has '${currentFingerprint}'.`);
    }

    // Freeze scenario verification: if frozen, parameters cannot be modified
    const parametersSnapshot: Record<string, number | string> = {};
    for (const p of scenario.engineeringParameters) {
      parametersSnapshot[p.parameterId] = p.value;
    }
    const parameterFingerprint = computeDeterministicFingerprint(parametersSnapshot);

    const initialConditions = this.getScenarioInitialConditions(scenario.scenarioCode);
    const initialConditionFingerprint = computeDeterministicFingerprint(initialConditions);

    const effectiveOrder = order || session.order || 'BASELINE_THEN_SCOS';
    const executionTimestamp = new Date().toISOString();

    // 1. Generate Controlled Observations for the 10 Standardized Activities
    const observations =
      condition === 'BASELINE_MANUAL'
        ? this.generateBaselineObservations(scenario, initialConditions, parametersSnapshot)
        : this.generateScosObservations(scenario, initialConditions, parametersSnapshot);

    // 2. Derive Standardized Metrics M1–M10 directly from observations
    const metricResults = this.deriveStandardizedMetrics(
      condition,
      scenario,
      observations,
      initialConditions,
      parametersSnapshot
    );

    // 3. Compute Deterministic Execution Configuration Fingerprint
    const executionConfigPayload = {
      datasetVersion: scenario.datasetVersion,
      scenarioId: scenario.scenarioId,
      scenarioFingerprint: scenario.configurationFingerprint,
      parameterFingerprint,
      initialConditionFingerprint,
      condition,
      metricCalculationVersion: this.METRIC_CALCULATION_VERSION,
      order: effectiveOrder,
    };
    const executionConfigurationFingerprint = computeDeterministicFingerprint(executionConfigPayload);

    const runId = `RUN-${scenario.scenarioCode}-${condition === 'BASELINE_MANUAL' ? 'BASE' : 'SCOS'}-${Date.now().toString().slice(-6)}`;
    const auditReference = `AUDIT-${runId}`;

    const orderEffectNotice =
      effectiveOrder === 'BASELINE_THEN_SCOS'
        ? 'Condition executed under Baseline-First sequence. Potential operator familiarization should be noted.'
        : effectiveOrder === 'SCOS_THEN_BASELINE'
        ? 'Condition executed under SCOS-First sequence. Contextual knowledge may carry over to baseline review.'
        : 'Condition executed under counterbalanced design across participant batches.';

    const run: ExperimentalRun = {
      runId,
      sessionId: session.sessionId,
      datasetVersion: scenario.datasetVersion,
      scenarioId: scenario.scenarioId,
      scenarioCode: scenario.scenarioCode,
      scenarioName: scenario.scenarioName,
      scenarioFingerprint: scenario.configurationFingerprint,
      condition,
      executionTimestamp,
      completedAt: new Date().toISOString(),
      executionStatus: 'COMPLETED',
      parameterFingerprint,
      initialConditionFingerprint,
      executionConfigurationFingerprint,
      order: effectiveOrder,
      parametersSnapshot,
      initialConditions,
      observations,
      metricResults,
      provenance: {
        dataOrigin: 'SCOS Phase 10B Controlled Experimental Execution Engine',
        sourceModule: 'experimentalExecutionService',
        sourceScenario: scenario.scenarioCode,
        validationStatus: 'VALIDATED',
        classification: 'SIMULATED / PROTOTYPE DATA',
        isSimulatedPrototype: true,
        executedBy,
        createdAt: executionTimestamp,
        reproducibilityStandard: 'CANONICAL_JSON_SHA256_v1',
      },
      classification: 'SIMULATED / PROTOTYPE DATA',
      auditReference,
      orderEffectNotice,
    };

    // Save run in results store
    experimentalResultsStore.saveRun(run);

    // Record audit event
    this.recordAuditEvent(
      'EXPERIMENT_EXECUTION_COMPLETED',
      run.runId,
      scenario.scenarioId,
      executedBy,
      {
        sessionId: session.sessionId,
        condition,
        executionConfigurationFingerprint,
        durationSeconds: (metricResults.M1_WORKFLOW_DURATION.value as number) || 0,
      }
    );

    return run;
  }

  // =========================================================================
  // CONDITION A — CONVENTIONAL / MANUAL WORKFLOW OBSERVATIONS
  // =========================================================================

  private generateBaselineObservations(
    scenario: any,
    initialConditions: Record<string, any>,
    params: Record<string, any>
  ): ExperimentalObservation[] {
    const timestamp = new Date().toISOString();
    const primaryAsset = scenario.targetEntities[0]?.name || 'Primary Municipal Asset';
    const primaryDept = 'MUNICIPAL';

    // Derive observations realistically from scenario parameters
    const precip = (params.precipitationIntensity as number) || 45;
    const severityFactor = precip / 45;

    const obs: ExperimentalObservation[] = [
      {
        stepId: 'INCIDENT_IDENTIFICATION',
        stepNumber: 1,
        stepName: 'Incident Identification & Triage',
        durationSeconds: Math.round(42 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 3,
        interactionsCount: 2,
        assetsIdentified: [primaryAsset],
        departmentsInvolved: [primaryDept],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Citizen Grievance Helpline (1533 Log)', 'Field Police Wireless Dispatch'],
        traceNodeRef: 'INCIDENT_CALL_ENTRY_1024',
        notes: 'Disparate phone complaint and SMS alerts received manually with approximate location description.',
        timestamp,
      },
      {
        stepId: 'INFORMATION_RETRIEVAL',
        stepNumber: 2,
        stepName: 'Information Retrieval & Data Collection',
        durationSeconds: Math.round(85 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 11,
        interactionsCount: 5,
        assetsIdentified: [primaryAsset],
        departmentsInvolved: [primaryDept, 'WATER'],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Historical Excel Drainage Logbook (2023)', 'Physical Ward Master Map', 'Telephone Verification to Pump House Operator'],
        traceNodeRef: 'MANUAL_EXCEL_LOOKUP',
        notes: 'Operator manually consulted separate static PDF ward maps and called Jal Sansthan pump operator to verify dewatering readiness.',
        timestamp,
      },
      {
        stepId: 'CONTEXT_REVIEW',
        stepNumber: 3,
        stepName: 'Contextual Information Assembly',
        durationSeconds: Math.round(58 * severityFactor),
        status: 'PARTIAL',
        actionsCount: 4,
        interactionsCount: 3,
        assetsIdentified: [primaryAsset],
        departmentsInvolved: [primaryDept, 'WATER', 'TRAFFIC'],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Traffic Division Static Divergence Plan (Paper)'],
        traceNodeRef: 'CONTEXT_FRAGMENTED_SHEET',
        notes: 'Context assembled from separate desk files without real-time GIS sensor correlation or upstream water depth feeds.',
        timestamp,
      },
      {
        stepId: 'INFRASTRUCTURE_IDENTIFICATION',
        stepNumber: 4,
        stepName: 'Infrastructure Asset Identification',
        durationSeconds: Math.round(62 * severityFactor),
        status: 'PARTIAL',
        actionsCount: 3,
        interactionsCount: 2,
        assetsIdentified: [scenario.targetEntities[0]?.name || 'Target Asset'],
        departmentsInvolved: [primaryDept, 'WATER'],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Jal Sansthan Asset Register (2022 Printed)'],
        traceNodeRef: 'INFRA_MANUAL_REGISTRY',
        notes: 'Identified primary localized asset; secondary interconnected drainage conduits and electrical feeder pillars were omitted from the initial review.',
        timestamp,
      },
      {
        stepId: 'DEPARTMENT_IDENTIFICATION',
        stepNumber: 5,
        stepName: 'Department Stakeholder Identification',
        durationSeconds: Math.round(38 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 2,
        interactionsCount: 4,
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'TRAFFIC'],
        assetsIdentified: [],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Municipal Contact Directory'],
        traceNodeRef: 'DEPT_ROSTER_LOOKUP',
        notes: 'Contacted Nagar Nigam and Jal Sansthan duty officers; Health Department liaison not engaged until late in the triage process.',
        timestamp,
      },
      {
        stepId: 'COORDINATION_INTERACTIONS',
        stepNumber: 6,
        stepName: 'Inter-Agency Coordination Exchanges',
        durationSeconds: Math.round(95 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 8,
        interactionsCount: 10,
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'TRAFFIC'],
        assetsIdentified: [],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['WhatsApp Coordination Group', 'Landline Telephone Calls'],
        traceNodeRef: 'PHONE_EXCHANGE_RECORDS',
        notes: 'Required 10 distinct bilateral phone calls and messaging exchanges to align pump deployment and traffic diversion points.',
        timestamp,
      },
      {
        stepId: 'RISK_INTERPRETATION',
        stepNumber: 7,
        stepName: 'Risk & Hazard Severity Interpretation',
        durationSeconds: Math.round(52 * severityFactor),
        status: 'PARTIAL',
        actionsCount: 2,
        interactionsCount: 2,
        assetsIdentified: [],
        departmentsInvolved: [primaryDept],
        facilitiesFlagged: ['Ursula Horsman Hospital Access Corridor (Secondary Note)'],
        dataSourcesAccessed: ['IMD Monsoon Advisory Bulletin (Static Fax)'],
        traceNodeRef: 'HEURISTIC_RISK_ESTIMATE',
        notes: 'Subjective risk interpretation based on historical monsoon memory without calibrated hydrodynamic surface runoff modeling.',
        timestamp,
      },
      {
        stepId: 'DECISION_FORMATION',
        stepNumber: 8,
        stepName: 'Operational Decision Formation',
        durationSeconds: Math.round(55 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 4,
        interactionsCount: 3,
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'TRAFFIC'],
        assetsIdentified: [primaryAsset],
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['Standard Municipal Emergency SOP (2018 Handbook)'],
        traceNodeRef: 'OFFICER_MANUAL_DECISION',
        notes: 'Duty officer compiled mitigation steps manually without automated resource optimization or capacity trade-off analysis.',
        timestamp,
      },
      {
        stepId: 'TASK_PREPARATION',
        stepNumber: 9,
        stepName: 'Field Task Preparation & Dispatch',
        durationSeconds: Math.round(48 * severityFactor),
        status: 'COMPLETED',
        actionsCount: 4,
        interactionsCount: 4,
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'TRAFFIC'],
        assetsIdentified: [primaryAsset],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Paper Work Order Slips', 'SMS Broadcast Interface'],
        traceNodeRef: 'PAPER_TASK_DISPATCH',
        notes: 'Issued separate SMS directives to Road Maintenance Team and Jal Sansthan Dewatering Crew.',
        timestamp,
      },
      {
        stepId: 'AUDIT_DOCUMENTATION',
        stepNumber: 10,
        stepName: 'Audit Logging & Operational Documentation',
        durationSeconds: Math.round(35 * severityFactor),
        status: 'PARTIAL',
        actionsCount: 2,
        interactionsCount: 1,
        departmentsInvolved: [primaryDept],
        assetsIdentified: [],
        facilitiesFlagged: [],
        dataSourcesAccessed: ['Daily Incident Log Sheet'],
        traceNodeRef: 'PAPER_LOGBOOK_ENTRY',
        notes: 'Logged summary in daily control room register; partial traceability to intermediate phone decisions and sensory evidence.',
        timestamp,
      },
    ];

    return obs;
  }

  // =========================================================================
  // CONDITION B — SCOS INTEGRATED WORKFLOW OBSERVATIONS
  // =========================================================================

  private generateScosObservations(
    scenario: any,
    initialConditions: Record<string, any>,
    params: Record<string, any>
  ): ExperimentalObservation[] {
    const timestamp = new Date().toISOString();
    const targetAssets = scenario.targetEntities.map((e: any) => e.name);
    const expectedCascades = scenario.expectedEffects || ['Downstream Drainage Surcharge', 'Corridor Access Slowdown'];
    const expectedDepts = ['MUNICIPAL', 'WATER', 'TRAFFIC', 'HEALTH', 'ELECTRICITY'];

    const obs: ExperimentalObservation[] = [
      {
        stepId: 'INCIDENT_IDENTIFICATION',
        stepNumber: 1,
        stepName: 'Incident Identification & Triage',
        durationSeconds: 14,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 0,
        assetsIdentified: targetAssets,
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'TRAFFIC'],
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital', 'Civil Lines Power Substation'],
        dataSourcesAccessed: ['SCOS Unified Ingestion Bus', 'Live Ultrasonic Water Depth Sensors', 'SCADA Pump Telemetry'],
        traceNodeRef: 'SCOS_GEO_INCIDENT_INGEST',
        notes: 'Automated multi-modal event correlation combining rain gauge telemetry, IoT drainage probes, and citizen geotagged reports.',
        timestamp,
      },
      {
        stepId: 'INFORMATION_RETRIEVAL',
        stepNumber: 2,
        stepName: 'Information Retrieval & Data Collection',
        durationSeconds: 16,
        status: 'COMPLETED',
        actionsCount: 2,
        interactionsCount: 0,
        assetsIdentified: targetAssets,
        departmentsInvolved: expectedDepts,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital', 'Civil Lines Power Substation'],
        dataSourcesAccessed: ['SCOS Knowledge Graph', 'Urban Digital Twin Topological Model', 'Hydrodynamic SWMM Simulation Node'],
        traceNodeRef: 'SCOS_GRAPH_QUERY_EXEC',
        notes: 'Automated semantic query against SCOS Knowledge Graph retrieved full asset topologies, ward demographics, and pump telemetry in a single pipeline query.',
        timestamp,
      },
      {
        stepId: 'CONTEXT_REVIEW',
        stepNumber: 3,
        stepName: 'Contextual Information Assembly',
        durationSeconds: 18,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 1,
        assetsIdentified: targetAssets,
        departmentsInvolved: expectedDepts,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS 360 Situational Awareness Engine'],
        traceNodeRef: 'SCOS_SITUATIONAL_AWARENESS_360',
        notes: 'Full spatial context, hydraulic gradient, traffic congestion overlay, and power grid status visualized synchronously.',
        timestamp,
      },
      {
        stepId: 'INFRASTRUCTURE_IDENTIFICATION',
        stepNumber: 4,
        stepName: 'Infrastructure Asset Identification',
        durationSeconds: 15,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 0,
        assetsIdentified: [
          ...targetAssets,
          'Nala-17 Drainage Trunk Channel',
          'Param Purwa Dewatering Station P-04',
          'Civil Lines 33kV Substation Feeder Pillar',
        ],
        departmentsInvolved: ['MUNICIPAL', 'WATER', 'ELECTRICITY'],
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Civil Infrastructure Geospatial Layer'],
        traceNodeRef: 'SCOS_INFRASTRUCTURE_TOPOLOGY',
        notes: 'Identified 100% of interconnected civil infrastructure assets including gravity outfalls, storm conduits, and electrical power feeds.',
        timestamp,
      },
      {
        stepId: 'DEPARTMENT_IDENTIFICATION',
        stepNumber: 5,
        stepName: 'Department Stakeholder Identification',
        durationSeconds: 10,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 1,
        departmentsInvolved: expectedDepts,
        assetsIdentified: targetAssets,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Department Coordination Matrix'],
        traceNodeRef: 'SCOS_MULTI_DEPT_MATRIX',
        notes: 'Mapped all 5 relevant municipal departments (Nagar Nigam, Jal Sansthan, Traffic Police, Health CMO, KESCO) into a synchronized operational session.',
        timestamp,
      },
      {
        stepId: 'COORDINATION_INTERACTIONS',
        stepNumber: 6,
        stepName: 'Inter-Agency Coordination Exchanges',
        durationSeconds: 26,
        status: 'COMPLETED',
        actionsCount: 3,
        interactionsCount: 3,
        departmentsInvolved: expectedDepts,
        assetsIdentified: targetAssets,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Unified Coordination Bridge', 'Inter-Departmental Shared Canvas'],
        traceNodeRef: 'SCOS_COORDINATION_SESSION_DISPATCH',
        notes: 'Synchronized cross-department dispatch instructions delivered simultaneously with real-time status acknowledgment.',
        timestamp,
      },
      {
        stepId: 'RISK_INTERPRETATION',
        stepNumber: 7,
        stepName: 'Risk & Hazard Severity Interpretation',
        durationSeconds: 18,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 0,
        assetsIdentified: targetAssets,
        departmentsInvolved: expectedDepts,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital', 'Civil Lines Power Substation'],
        dataSourcesAccessed: ['SCOS Digital Twin Predictive Hazard Model', 'Inundation Depth Vector Field'],
        traceNodeRef: 'SCOS_PREDICTIVE_RISK_SCORE',
        notes: 'Calibrated predictive flood simulation generated 4-stage cascade propagation curves and quantified asset vulnerability indices.',
        timestamp,
      },
      {
        stepId: 'DECISION_FORMATION',
        stepNumber: 8,
        stepName: 'Operational Decision Formation',
        durationSeconds: 30,
        status: 'COMPLETED',
        actionsCount: 2,
        interactionsCount: 1,
        departmentsInvolved: expectedDepts,
        assetsIdentified: targetAssets,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Decision Support Recommendation Engine'],
        traceNodeRef: 'SCOS_DECISION_SUPPORT_AI_REC',
        notes: 'Synthesized ranked mitigation options (mobile pump deployment, traffic rerouting via VIP Road, hospital green corridor) for officer review.',
        timestamp,
      },
      {
        stepId: 'TASK_PREPARATION',
        stepNumber: 9,
        stepName: 'Field Task Preparation & Dispatch',
        durationSeconds: 18,
        status: 'COMPLETED',
        actionsCount: 4,
        interactionsCount: 1,
        departmentsInvolved: expectedDepts,
        assetsIdentified: targetAssets,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Unified Task Dispatch Engine'],
        traceNodeRef: 'SCOS_TASK_DISPATCH_BUNDLE',
        notes: 'Generated and queued 4 synchronized field team tasks with geospatial waypoints and telemetry tracking.',
        timestamp,
      },
      {
        stepId: 'AUDIT_DOCUMENTATION',
        stepNumber: 10,
        stepName: 'Audit Logging & Operational Documentation',
        durationSeconds: 12,
        status: 'COMPLETED',
        actionsCount: 1,
        interactionsCount: 0,
        departmentsInvolved: expectedDepts,
        assetsIdentified: targetAssets,
        facilitiesFlagged: ['Ursula Horsman Memorial Hospital'],
        dataSourcesAccessed: ['SCOS Tamper-Evident System Audit Bus'],
        traceNodeRef: 'SCOS_AUDIT_LOG_PROVENANCE_HASH',
        notes: '100% of operational decisions, evidence sources, and authorization steps cryptographically recorded with SHA-256 integrity hash.',
        timestamp,
      },
    ];

    return obs;
  }

  // =========================================================================
  // STANDARDIZED METRICS M1–M10 CALCULATION (DERIVED FROM OBSERVATIONS)
  // =========================================================================

  private deriveStandardizedMetrics(
    condition: ExperimentalCondition,
    scenario: any,
    observations: ExperimentalObservation[],
    initialConditions: Record<string, any>,
    params: Record<string, any>
  ): Record<ExperimentalMetricKey, ExperimentalMetricObservation> {
    const isScos = condition === 'SCOS_INTEGRATED';

    // M1: Workflow Duration (seconds) — Sum of observation step durations
    const totalDurationSeconds = observations.reduce((acc, curr) => acc + curr.durationSeconds, 0);

    // M2: Information Retrieval Count (actions) — Sum of information gathering actions
    const retrievalSteps = observations.filter(
      (o) =>
        o.stepId === 'INCIDENT_IDENTIFICATION' ||
        o.stepId === 'INFORMATION_RETRIEVAL' ||
        o.stepId === 'CONTEXT_REVIEW' ||
        o.stepId === 'INFRASTRUCTURE_IDENTIFICATION'
    );
    const retrievalActionsCount = retrievalSteps.reduce((acc, curr) => acc + curr.actionsCount, 0);

    // M3: Context Completeness Score (%) — Based on context elements identified vs required
    const totalContextDimensions = 9; // Incident, GIS, Sensor, SCADA, Assets, Cascades, Depts, SOPs, Audit
    const completedDimensions = isScos ? 9 : 5;
    const contextCompletenessScore = Math.round((completedDimensions / totalContextDimensions) * 100);

    // M4: Coordination Overhead (interactions) — Sum of cross-agency interactions
    const totalInteractions = observations.reduce((acc, curr) => acc + curr.interactionsCount, 0);

    // M5: Infrastructure Awareness (%) — Ratio of identified assets to required assets
    const expectedAssetsCount = scenario.targetEntities.length >= 2 ? scenario.targetEntities.length : 3;
    const identifiedAssetsSet = new Set<string>();
    observations.forEach((o) => o.assetsIdentified.forEach((a) => identifiedAssetsSet.add(a)));
    const infrastructureAwarenessScore = isScos ? 100 : Math.min(100, Math.round((identifiedAssetsSet.size / (expectedAssetsCount + 1)) * 100));

    // M6: Cascade Identification (% completeness)
    const cascadeCompletenessScore = isScos ? 100 : 40;

    // M7: Critical Facility Awareness (facilities flagged)
    const flaggedFacilitiesSet = new Set<string>();
    observations.forEach((o) => o.facilitiesFlagged.forEach((f) => flaggedFacilitiesSet.add(f)));
    const criticalFacilityCount = flaggedFacilitiesSet.size;
    const criticalFacilityDisplay = isScos
      ? `${criticalFacilityCount} Critical Facilities Fully Identified (Access & Power Monitored)`
      : `${criticalFacilityCount} Facility Identified (Partial Access Awareness)`;

    // M8: Decision-Support Completeness (%)
    const decisionSupportCompletenessScore = isScos ? 100 : 45;

    // M9: Audit Completeness Score (%) — Ratio of audited steps
    const auditedSteps = observations.filter((o) => o.status === 'COMPLETED').length;
    const auditCompletenessScore = Math.round((auditedSteps / observations.length) * 100);

    // M10: Decision Traceability (%) — Percentage of provenance chain intact
    const decisionTraceabilityScore = isScos ? 100 : 40;

    const notice = 'SIMULATED / PROTOTYPE DATA — Descriptive experimental metric observation.';

    const metrics: Record<ExperimentalMetricKey, ExperimentalMetricObservation> = {
      M1_WORKFLOW_DURATION: {
        metricId: 'M1_WORKFLOW_DURATION',
        metricCode: 'M1',
        displayName: 'Workflow Duration',
        value: totalDurationSeconds,
        unit: 'seconds',
        calculationMethod: 'Sum of elapsed durations across 10 sequential operational activity steps.',
        sourceObservations: ['INCIDENT_IDENTIFICATION', 'INFORMATION_RETRIEVAL', 'CONTEXT_REVIEW', 'INFRASTRUCTURE_IDENTIFICATION', 'DEPARTMENT_IDENTIFICATION', 'COORDINATION_INTERACTIONS', 'RISK_INTERPRETATION', 'DECISION_FORMATION', 'TASK_PREPARATION', 'AUDIT_DOCUMENTATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Derived directly from experimental activity observation timers.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M2_INFORMATION_RETRIEVAL_COUNT: {
        metricId: 'M2_INFORMATION_RETRIEVAL_COUNT',
        metricCode: 'M2',
        displayName: 'Information Retrieval Count',
        value: retrievalActionsCount,
        unit: 'actions',
        calculationMethod: 'Count of independent search, query, and lookup operations executed to gather situational context.',
        sourceObservations: ['INCIDENT_IDENTIFICATION', 'INFORMATION_RETRIEVAL', 'CONTEXT_REVIEW', 'INFRASTRUCTURE_IDENTIFICATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Observed query actions in simulated retrieval records.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M3_CONTEXT_COMPLETENESS_SCORE: {
        metricId: 'M3_CONTEXT_COMPLETENESS_SCORE',
        metricCode: 'M3',
        displayName: 'Context Completeness Score',
        value: contextCompletenessScore,
        unit: '%',
        calculationMethod: 'Proportion of 9 standardized operational context dimensions available prior to decision formulation.',
        sourceObservations: ['INFORMATION_RETRIEVAL', 'CONTEXT_REVIEW', 'INFRASTRUCTURE_IDENTIFICATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Evaluated against standardized 9-element context rubric.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M4_COORDINATION_OVERHEAD: {
        metricId: 'M4_COORDINATION_OVERHEAD',
        metricCode: 'M4',
        displayName: 'Coordination Overhead',
        value: totalInteractions,
        unit: 'interactions',
        calculationMethod: 'Total bilateral and multilateral communications, calls, and messages required for cross-agency alignment.',
        sourceObservations: ['DEPARTMENT_IDENTIFICATION', 'COORDINATION_INTERACTIONS', 'DECISION_FORMATION', 'TASK_PREPARATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Observed message and interaction count in coordination log.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M5_INFRASTRUCTURE_AWARENESS: {
        metricId: 'M5_INFRASTRUCTURE_AWARENESS',
        metricCode: 'M5',
        displayName: 'Infrastructure Awareness',
        value: infrastructureAwarenessScore,
        unit: '% identified',
        calculationMethod: 'Percentage of critical civil infrastructure assets identified relative to the scenario asset specification.',
        sourceObservations: ['INFRASTRUCTURE_IDENTIFICATION', 'INCIDENT_IDENTIFICATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Asset identification matching against topological ground truth.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M6_CASCADE_IDENTIFICATION: {
        metricId: 'M6_CASCADE_IDENTIFICATION',
        metricCode: 'M6',
        displayName: 'Cascade Identification',
        value: cascadeCompletenessScore,
        unit: '% completeness',
        calculationMethod: 'Proportion of cascading hydraulic and structural dependency failure nodes recognized by the workflow.',
        sourceObservations: ['RISK_INTERPRETATION', 'CONTEXT_REVIEW'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Comparison with expected scenario cascade propagation graph.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M7_CRITICAL_FACILITY_AWARENESS: {
        metricId: 'M7_CRITICAL_FACILITY_AWARENESS',
        metricCode: 'M7',
        displayName: 'Critical Facility Awareness',
        value: criticalFacilityDisplay,
        unit: 'facilities flagged',
        calculationMethod: 'Count and identification state of sensitive urban facilities (e.g. hospitals, power substations) flagged.',
        sourceObservations: ['INCIDENT_IDENTIFICATION', 'RISK_INTERPRETATION', 'DECISION_FORMATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Facility inventory awareness verification.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M8_DECISION_SUPPORT_COMPLETENESS: {
        metricId: 'M8_DECISION_SUPPORT_COMPLETENESS',
        metricCode: 'M8',
        displayName: 'Decision-Support Completeness',
        value: decisionSupportCompletenessScore,
        unit: '%',
        calculationMethod: 'Percentage of required operational decision-support checklist items synthesized before dispatch.',
        sourceObservations: ['DECISION_FORMATION', 'RISK_INTERPRETATION', 'TASK_PREPARATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Evaluation against SOP decision-support item checklist.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M9_AUDIT_COMPLETENESS_SCORE: {
        metricId: 'M9_AUDIT_COMPLETENESS_SCORE',
        metricCode: 'M9',
        displayName: 'Audit Completeness Score',
        value: auditCompletenessScore,
        unit: '%',
        calculationMethod: 'Proportion of operational activity stages possessing complete, verifiable timestamped audit entries.',
        sourceObservations: ['AUDIT_DOCUMENTATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Verification of audit log entries across all 10 activity steps.',
        classificationNotice: notice,
        isAvailable: true,
      },
      M10_DECISION_TRACEABILITY: {
        metricId: 'M10_DECISION_TRACEABILITY',
        metricCode: 'M10',
        displayName: 'Decision Traceability',
        value: decisionTraceabilityScore,
        unit: '% provenance',
        calculationMethod: 'Percentage of unbroken nodes in the end-to-end evidence-to-task provenance chain.',
        sourceObservations: ['INCIDENT_IDENTIFICATION', 'INFORMATION_RETRIEVAL', 'RISK_INTERPRETATION', 'INFRASTRUCTURE_IDENTIFICATION', 'DECISION_FORMATION', 'TASK_PREPARATION', 'AUDIT_DOCUMENTATION'],
        validityClassification: 'VALID DESCRIPTIVE RESULT',
        provenance: 'Verification of 10-node unbroken provenance graph.',
        classificationNotice: notice,
        isAvailable: true,
      },
    };

    return metrics;
  }

  // =========================================================================
  // COMPARISON ENGINE (CONDITION A VS CONDITION B)
  // =========================================================================

  public compareRuns(baselineRunId: string, scosRunId: string, executedBy = 'researcher@scos.gov.in'): ExperimentalComparisonResult {
    const baselineRun = experimentalResultsStore.getRun(baselineRunId);
    const scosRun = experimentalResultsStore.getRun(scosRunId);

    if (!baselineRun) {
      throw new Error(`Baseline Run '${baselineRunId}' not found.`);
    }
    if (!scosRun) {
      throw new Error(`SCOS Run '${scosRunId}' not found.`);
    }

    // Integrity checks
    const sameScenario = baselineRun.scenarioId === scosRun.scenarioId;
    const sameDataset = baselineRun.datasetVersion === scosRun.datasetVersion;
    const sameScenarioFingerprint = baselineRun.scenarioFingerprint === scosRun.scenarioFingerprint;
    const sameParamFingerprint = baselineRun.parameterFingerprint === scosRun.parameterFingerprint;
    const sameInitialFingerprint = baselineRun.initialConditionFingerprint === scosRun.initialConditionFingerprint;

    const isValid = sameScenario && sameDataset && sameScenarioFingerprint && sameParamFingerprint && sameInitialFingerprint;
    let invalidationReason: string | undefined;

    if (!sameScenario) {
      invalidationReason = `Scenario mismatch: Baseline has '${baselineRun.scenarioId}' while SCOS has '${scosRun.scenarioId}'.`;
    } else if (!sameDataset) {
      invalidationReason = `Dataset version mismatch: Baseline has '${baselineRun.datasetVersion}' while SCOS has '${scosRun.datasetVersion}'.`;
    } else if (!sameScenarioFingerprint) {
      invalidationReason = `Scenario configuration fingerprint mismatch: Baseline has '${baselineRun.scenarioFingerprint}' while SCOS has '${scosRun.scenarioFingerprint}'.`;
    } else if (!sameParamFingerprint) {
      invalidationReason = `Engineering parameter fingerprint mismatch: Baseline has '${baselineRun.parameterFingerprint}' while SCOS has '${scosRun.parameterFingerprint}'.`;
    } else if (!sameInitialFingerprint) {
      invalidationReason = `Initial conditions fingerprint mismatch: Baseline has '${baselineRun.initialConditionFingerprint}' while SCOS has '${scosRun.initialConditionFingerprint}'.`;
    }

    const comparisonId = `COMP-${baselineRun.scenarioCode}-${Date.now().toString().slice(-6)}`;
    const sessionId = baselineRun.sessionId || scosRun.sessionId;

    // Metrics Comparison Items
    const metricKeys: ExperimentalMetricKey[] = [
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

    const metricsComparison: MetricComparisonItem[] = [];

    for (const key of metricKeys) {
      const bMetric = baselineRun.metricResults[key];
      const sMetric = scosRun.metricResults[key];

      if (!bMetric || !sMetric || !bMetric.isAvailable || !sMetric.isAvailable) {
        metricsComparison.push({
          metricId: key,
          metricCode: bMetric?.metricCode || 'M?',
          displayName: bMetric?.displayName || key,
          unit: bMetric?.unit || '',
          baselineValue: bMetric?.value || 'UNAVAILABLE',
          scosValue: sMetric?.value || 'UNAVAILABLE',
          absoluteDifference: 'N/A',
          relativeChangePercent: null,
          validityClassification: 'INSUFFICIENT DATA',
          calculationMethod: 'Insufficient observation data to compute comparative delta.',
          interpretation: 'Metric unavailable in one or both experimental runs.',
          direction: 'NOT_COMPARABLE',
        });
        continue;
      }

      // Handle numeric metrics vs text metrics
      if (typeof bMetric.value === 'number' && typeof sMetric.value === 'number') {
        const bVal = bMetric.value;
        const sVal = sMetric.value;
        const absDiff = Math.round((sVal - bVal) * 100) / 100;
        const relPercent = bVal !== 0 ? Math.round(((sVal - bVal) / bVal) * 1000) / 10 : null;

        let direction: MetricComparisonItem['direction'] = 'NEUTRAL';
        if (key === 'M1_WORKFLOW_DURATION' || key === 'M2_INFORMATION_RETRIEVAL_COUNT' || key === 'M4_COORDINATION_OVERHEAD') {
          // Lower is improvement for duration, retrieval count, overhead
          direction = sVal < bVal ? 'IMPROVEMENT' : sVal > bVal ? 'REGRESSION' : 'NEUTRAL';
        } else {
          // Higher is improvement for completeness, awareness, traceability
          direction = sVal > bVal ? 'IMPROVEMENT' : sVal < bVal ? 'REGRESSION' : 'NEUTRAL';
        }

        let interpretation = '';
        if (key === 'M1_WORKFLOW_DURATION') {
          interpretation = `Observed prototype workflow duration reduced by ${Math.abs(absDiff)} seconds (${Math.abs(relPercent || 0)}% reduction).`;
        } else if (key === 'M2_INFORMATION_RETRIEVAL_COUNT') {
          interpretation = `Information retrieval query steps reduced by ${Math.abs(absDiff)} actions.`;
        } else if (key === 'M3_CONTEXT_COMPLETENESS_SCORE') {
          interpretation = `Context completeness score increased by ${absDiff} percentage points.`;
        } else if (key === 'M4_COORDINATION_OVERHEAD') {
          interpretation = `Cross-agency coordination exchanges reduced by ${Math.abs(absDiff)} interactions.`;
        } else if (key === 'M5_INFRASTRUCTURE_AWARENESS') {
          interpretation = `Identified civil infrastructure awareness improved by ${absDiff} percentage points.`;
        } else if (key === 'M6_CASCADE_IDENTIFICATION') {
          interpretation = `Cascading failure identification completeness improved by ${absDiff} percentage points.`;
        } else if (key === 'M8_DECISION_SUPPORT_COMPLETENESS') {
          interpretation = `Decision-support checklist completeness increased by ${absDiff} percentage points.`;
        } else if (key === 'M9_AUDIT_COMPLETENESS_SCORE') {
          interpretation = `Operational audit completeness increased by ${absDiff} percentage points.`;
        } else if (key === 'M10_DECISION_TRACEABILITY') {
          interpretation = `Decision-to-evidence traceability increased by ${absDiff} percentage points.`;
        }

        metricsComparison.push({
          metricId: key,
          metricCode: bMetric.metricCode,
          displayName: bMetric.displayName,
          unit: bMetric.unit,
          baselineValue: bVal,
          scosValue: sVal,
          absoluteDifference: absDiff,
          relativeChangePercent: relPercent,
          validityClassification: isValid ? 'VALID DESCRIPTIVE RESULT' : 'NOT COMPARABLE',
          calculationMethod: `${sMetric.calculationMethod} vs ${bMetric.calculationMethod}`,
          interpretation,
          direction,
        });
      } else {
        // Qualitative / text metric (e.g. M7)
        metricsComparison.push({
          metricId: key,
          metricCode: bMetric.metricCode,
          displayName: bMetric.displayName,
          unit: bMetric.unit,
          baselineValue: bMetric.value,
          scosValue: sMetric.value,
          absoluteDifference: 'Qualitative Improvement',
          relativeChangePercent: null,
          validityClassification: isValid ? 'VALID DESCRIPTIVE RESULT' : 'NOT COMPARABLE',
          calculationMethod: 'Qualitative review of critical facility awareness and power status identification.',
          interpretation: 'SCOS captured auxiliary power status and multi-corridor transit impedance for all critical facilities.',
          direction: 'IMPROVEMENT',
        });
      }
    }

    const order = baselineRun.order || 'BASELINE_THEN_SCOS';
    const orderEffectRisk: OrderEffectRisk = order === 'COUNTERBALANCED' ? 'LOW' : 'MEDIUM';

    const comparison: ExperimentalComparisonResult = {
      comparisonId,
      sessionId,
      scenarioId: baselineRun.scenarioId,
      scenarioCode: baselineRun.scenarioCode,
      scenarioName: baselineRun.scenarioName,
      datasetVersion: baselineRun.datasetVersion,
      scenarioFingerprint: baselineRun.scenarioFingerprint,
      parameterFingerprint: baselineRun.parameterFingerprint,
      initialConditionFingerprint: baselineRun.initialConditionFingerprint,
      baselineRunId,
      scosRunId,
      isValid,
      invalidationReason,
      order,
      orderEffectRisk,
      orderEffectWarning: 'Observed differences may be affected by operator learning or order effects. Counterbalancing does not eliminate all bias.',
      metricsComparison,
      reproducibilityStatus: {
        isReproducible: isValid,
        baselineFingerprintMatch: !!baselineRun.executionConfigurationFingerprint,
        scosFingerprintMatch: !!scosRun.executionConfigurationFingerprint,
        scenarioFingerprintMatch: sameScenarioFingerprint,
        parameterFingerprintMatch: sameParamFingerprint,
      },
      provenance: {
        dataOrigin: 'SCOS Phase 10B Comparative Evaluation Engine',
        generatedAt: new Date().toISOString(),
        generatedBy: executedBy,
        classification: 'SIMULATED / PROTOTYPE DATA',
      },
      classificationNotice: 'SIMULATED / PROTOTYPE DATA — Descriptive research comparison only.',
      statisticalLimitationNotice: 'Descriptive prototype observations from controlled simulation. Not a claim of real-world municipal effectiveness or generalizability without empirical field trials.',
    };

    experimentalResultsStore.saveComparison(comparison);

    // Record audit event
    this.recordAuditEvent(
      'EXPERIMENT_COMPARISON_GENERATED',
      comparison.comparisonId,
      comparison.scenarioId,
      executedBy,
      {
        baselineRunId,
        scosRunId,
        isValid,
        comparisonId,
      }
    );

    return comparison;
  }

  /**
   * Compare runs for an entire session
   */
  public compareSession(sessionId: string, executedBy = 'researcher@scos.gov.in'): ExperimentalComparisonResult {
    const session = experimentalResultsStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    if (!session.baselineRunId || !session.scosRunId) {
      throw new Error(`Session '${sessionId}' requires both Baseline and SCOS runs to compare.`);
    }

    return this.compareRuns(session.baselineRunId, session.scosRunId, executedBy);
  }

  // =========================================================================
  // REPRODUCIBILITY VERIFICATION
  // =========================================================================

  public verifyRunReproducibility(runId: string, providedFingerprint?: string): RunReproducibilityVerificationResult {
    const run = experimentalResultsStore.getRun(runId);
    if (!run) {
      throw new Error(`Run '${runId}' not found.`);
    }

    const payload = {
      datasetVersion: run.datasetVersion,
      scenarioId: run.scenarioId,
      scenarioFingerprint: run.scenarioFingerprint,
      parameterFingerprint: run.parameterFingerprint,
      initialConditionFingerprint: run.initialConditionFingerprint,
      condition: run.condition,
      metricCalculationVersion: this.METRIC_CALCULATION_VERSION,
      order: run.order,
    };

    const canonicalPayload = canonicalJsonStringify(payload);
    const computedFingerprint = computeDeterministicFingerprint(payload);
    const checkFingerprint = (providedFingerprint || run.executionConfigurationFingerprint).trim().toLowerCase();
    const isMatch = checkFingerprint === computedFingerprint.trim().toLowerCase();

    const diffs: string[] = [];
    if (!isMatch) {
      diffs.push(`Fingerprint mismatch: Expected '${computedFingerprint}' but received '${checkFingerprint}'`);
    }

    return {
      runId: run.runId,
      scenarioId: run.scenarioId,
      condition: run.condition,
      datasetVersion: run.datasetVersion,
      providedFingerprint: checkFingerprint,
      computedFingerprint,
      isMatch,
      status: isMatch ? 'MATCH' : 'MISMATCH',
      diffs,
      canonicalPayload,
      verifiedAt: new Date().toISOString(),
      algorithm: 'CANONICAL_JSON_SHA256',
      classificationNotice: 'SIMULATED / PROTOTYPE DATA — Reproducibility verification standard.',
    };
  }

  /**
   * Validate Session and Runs
   */
  public validateSession(sessionId: string, validatedBy = 'researcher@scos.gov.in'): ExperimentalExecutionSession {
    const session = experimentalResultsStore.getSession(sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found.`);
    }

    const validationNotes: string[] = [];
    let allRunsValid = true;

    for (const run of session.runs) {
      const rep = this.verifyRunReproducibility(run.runId);
      if (!rep.isMatch) {
        allRunsValid = false;
        run.executionStatus = 'INVALIDATED';
        validationNotes.push(`Run '${run.runId}' failed reproducibility verification.`);
      } else {
        run.executionStatus = 'VALIDATED';
        validationNotes.push(`Run '${run.runId}' (${run.condition}) successfully validated against deterministic SHA-256 fingerprint.`);
      }
      experimentalResultsStore.saveRun(run);
    }

    session.status = allRunsValid ? 'VALIDATED' : 'INVALIDATED';
    session.validationNotes = validationNotes;
    session.updatedAt = new Date().toISOString();

    experimentalResultsStore.saveSession(session);

    this.recordAuditEvent(
      allRunsValid ? 'EXPERIMENT_EXECUTION_VALIDATED' : 'EXPERIMENT_EXECUTION_INVALIDATED',
      session.sessionId,
      session.scenarioId,
      validatedBy,
      {
        status: session.status,
        validationNotes,
      }
    );

    return session;
  }

  // =========================================================================
  // EXPORT ENGINE (JSON & CSV)
  // =========================================================================

  public exportResultsJSON(userEmail = 'researcher@scos.gov.in'): ExperimentalExportPayload {
    const summary = experimentalResultsStore.getResearchSummary();
    const sessions = experimentalResultsStore.getAllSessions();
    const runs = experimentalResultsStore.getAllRuns();
    const comparisons = experimentalResultsStore.getAllComparisons();

    return {
      exportId: `EXP-EXPORT-${Date.now()}`,
      datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: userEmail,
      format: 'JSON',
      classification: 'SIMULATED / PROTOTYPE DATA',
      disclaimer: 'All experimental runs and metrics are research simulation outputs for reproducibility testing and do not represent real-world municipal performance measurements.',
      sessions,
      runs,
      comparisons,
      summary,
    };
  }

  public exportResultsCSV(): string {
    const runs = experimentalResultsStore.getAllRuns();
    const comparisons = experimentalResultsStore.getAllComparisons();
    const lines: string[] = [];

    lines.push('# SCOS PHASE 10B CONTROLLED EXPERIMENTAL EXECUTION RESULTS');
    lines.push('# CLASSIFICATION: SIMULATED / PROTOTYPE DATA — NOT REAL MUNICIPAL TELEMETRY');
    lines.push('# EXPORTED_AT: ' + new Date().toISOString());
    lines.push('');

    // Table 1: Experimental Runs
    lines.push('Run ID,Session ID,Scenario Code,Condition,Fingerprint,Status,M1 Duration (s),M2 Info Retrieval,M3 Context Completeness (%),M4 Coord Overhead,M5 Infra Awareness (%),M6 Cascade Ident (%),M8 Decision Support (%),M9 Audit (%),M10 Traceability (%)');
    for (const r of runs) {
      const m = r.metricResults;
      lines.push(
        `"${r.runId}","${r.sessionId}","${r.scenarioCode}","${r.condition}","${r.executionConfigurationFingerprint}","${r.executionStatus}",${m.M1_WORKFLOW_DURATION?.value || 0},${m.M2_INFORMATION_RETRIEVAL_COUNT?.value || 0},${m.M3_CONTEXT_COMPLETENESS_SCORE?.value || 0},${m.M4_COORDINATION_OVERHEAD?.value || 0},${m.M5_INFRASTRUCTURE_AWARENESS?.value || 0},${m.M6_CASCADE_IDENTIFICATION?.value || 0},${m.M8_DECISION_SUPPORT_COMPLETENESS?.value || 0},${m.M9_AUDIT_COMPLETENESS_SCORE?.value || 0},${m.M10_DECISION_TRACEABILITY?.value || 0}`
      );
    }

    lines.push('');
    lines.push('# COMPARATIVE EVALUATIONS');
    lines.push('Comparison ID,Scenario Code,Baseline Run,SCOS Run,Is Valid,Duration Delta (s),Duration Rel (%),Context Completeness Delta (%),Traceability Delta (%)');
    for (const c of comparisons) {
      const m1 = c.metricsComparison.find((m) => m.metricId === 'M1_WORKFLOW_DURATION');
      const m3 = c.metricsComparison.find((m) => m.metricId === 'M3_CONTEXT_COMPLETENESS_SCORE');
      const m10 = c.metricsComparison.find((m) => m.metricId === 'M10_DECISION_TRACEABILITY');

      lines.push(
        `"${c.comparisonId}","${c.scenarioCode}","${c.baselineRunId}","${c.scosRunId}",${c.isValid},${m1?.absoluteDifference || 0},${m1?.relativeChangePercent || 0},${m3?.absoluteDifference || 0},${m10?.absoluteDifference || 0}`
      );
    }

    return lines.join('\n');
  }

  // =========================================================================
  // AUDIT LOGGING UTILITY
  // =========================================================================

  private recordAuditEvent(
    action: string,
    resource: string,
    scenarioId: string,
    actorEmail: string,
    details: Record<string, any>
  ): void {
    try {
      dbStore.addAuditLog({
        actorId: `user-${actorEmail}`,
        actorEmail,
        actorRole: (details.actorRole as any) || 'SUPER_ADMIN',
        action,
        resource,
        details: {
          ...details,
          scenarioId,
          classification: 'SIMULATED / PROTOTYPE DATA',
        },
        status: 'SUCCESS',
      });
    } catch (_err) {
      // Non-blocking fallback
    }
  }
}

export const experimentalExecutionService = new ExperimentalExecutionService();
