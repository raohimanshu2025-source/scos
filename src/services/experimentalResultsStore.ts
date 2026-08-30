// =========================================================================
// SCOS PHASE 10B — EXPERIMENTAL RESULTS STORE
// In-Memory Persistence & Query Interface for Controlled Research Execution
// =========================================================================

import {
  ExperimentalExecutionSession,
  ExperimentalRun,
  ExperimentalComparisonResult,
  ExperimentalResearchSummary,
  ExperimentalMetricKey,
} from '../types/experimentalExecution';

class ExperimentalResultsStore {
  private sessions: Map<string, ExperimentalExecutionSession> = new Map();
  private runs: Map<string, ExperimentalRun> = new Map();
  private comparisons: Map<string, ExperimentalComparisonResult> = new Map();

  // =========================================================================
  // SESSION OPERATIONS
  // =========================================================================

  public saveSession(session: ExperimentalExecutionSession): void {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);
  }

  public getSession(sessionId: string): ExperimentalExecutionSession | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(): ExperimentalExecutionSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSessionsByScenario(scenarioId: string): ExperimentalExecutionSession[] {
    return this.getAllSessions().filter(
      (s) => s.scenarioId === scenarioId || s.scenarioCode === scenarioId
    );
  }

  public deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // =========================================================================
  // RUN OPERATIONS
  // =========================================================================

  public saveRun(run: ExperimentalRun): void {
    this.runs.set(run.runId, run);

    // Also update parent session if present
    const session = this.sessions.get(run.sessionId);
    if (session) {
      const existingIdx = session.runs.findIndex((r) => r.runId === run.runId);
      if (existingIdx >= 0) {
        session.runs[existingIdx] = run;
      } else {
        session.runs.push(run);
      }

      if (run.condition === 'BASELINE_MANUAL') {
        session.baselineRunId = run.runId;
      } else if (run.condition === 'SCOS_INTEGRATED') {
        session.scosRunId = run.runId;
      }

      session.updatedAt = new Date().toISOString();
      this.sessions.set(session.sessionId, session);
    }
  }

  public getRun(runId: string): ExperimentalRun | undefined {
    return this.runs.get(runId);
  }

  public getAllRuns(): ExperimentalRun[] {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.executionTimestamp).getTime() - new Date(a.executionTimestamp).getTime()
    );
  }

  public getRunsByScenario(scenarioId: string): ExperimentalRun[] {
    return this.getAllRuns().filter(
      (r) => r.scenarioId === scenarioId || r.scenarioCode === scenarioId
    );
  }

  public getRunsBySession(sessionId: string): ExperimentalRun[] {
    return this.getAllRuns().filter((r) => r.sessionId === sessionId);
  }

  // =========================================================================
  // COMPARISON OPERATIONS
  // =========================================================================

  public saveComparison(comparison: ExperimentalComparisonResult): void {
    this.comparisons.set(comparison.comparisonId, comparison);

    const session = this.sessions.get(comparison.sessionId);
    if (session) {
      session.comparisonId = comparison.comparisonId;
      session.updatedAt = new Date().toISOString();
      this.sessions.set(session.sessionId, session);
    }
  }

  public getComparison(comparisonId: string): ExperimentalComparisonResult | undefined {
    return this.comparisons.get(comparisonId);
  }

  public getAllComparisons(): ExperimentalComparisonResult[] {
    return Array.from(this.comparisons.values()).sort(
      (a, b) =>
        new Date(b.provenance.generatedAt).getTime() -
        new Date(a.provenance.generatedAt).getTime()
    );
  }

  public getComparisonsByScenario(scenarioId: string): ExperimentalComparisonResult[] {
    return this.getAllComparisons().filter(
      (c) => c.scenarioId === scenarioId || c.scenarioCode === scenarioId
    );
  }

  // =========================================================================
  // AGGREGATION & RESEARCH SUMMARY
  // =========================================================================

  public getResearchSummary(datasetVersion = 'SCOS-RESEARCH-DATASET-v1.0'): ExperimentalResearchSummary {
    const allSessions = this.getAllSessions();
    const allRuns = this.getAllRuns();
    const allComparisons = this.getAllComparisons();

    const baselineRuns = allRuns.filter((r) => r.condition === 'BASELINE_MANUAL');
    const scosRuns = allRuns.filter((r) => r.condition === 'SCOS_INTEGRATED');
    const completedExecutions = allRuns.filter((r) => r.executionStatus === 'COMPLETED' || r.executionStatus === 'VALIDATED');
    const validatedExecutions = allRuns.filter((r) => r.executionStatus === 'VALIDATED');
    const invalidExecutions = allRuns.filter((r) => r.executionStatus === 'INVALIDATED');

    const comparablePairs = allComparisons.filter((c) => c.isValid).length;
    const reproducibilityMatches = allComparisons.filter(
      (c) => c.reproducibilityStatus?.isReproducible
    ).length;
    const reproducibilityMismatches = allComparisons.filter(
      (c) => c.reproducibilityStatus && !c.reproducibilityStatus.isReproducible
    ).length;

    // Metric coverage counts
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

    const metricCoverage: Record<ExperimentalMetricKey, number> = {} as any;
    for (const key of metricKeys) {
      metricCoverage[key] = allRuns.filter(
        (r) => r.metricResults && r.metricResults[key] && r.metricResults[key].isAvailable
      ).length;
    }

    return {
      datasetVersion,
      totalScenarios: 5,
      totalSessions: allSessions.length,
      totalExecutions: allRuns.length,
      completedExecutions: completedExecutions.length,
      validatedExecutions: validatedExecutions.length,
      invalidExecutions: invalidExecutions.length,
      baselineRuns: baselineRuns.length,
      scosRuns: scosRuns.length,
      comparablePairs,
      reproducibilityMatches,
      reproducibilityMismatches,
      metricCoverage,
      classificationNotice: 'SIMULATED / PROTOTYPE DATA — Descriptive research metrics only.',
      limitations: [
        'Experimental observations are generated in simulated prototype environments.',
        'No actuation of live municipal equipment or SCADA control exists.',
        'Human review remains mandatory for all real municipal decision-support tasks.',
        'Observed workflow differences may be affected by operator learning or order effects.',
      ],
    };
  }

  /**
   * Reset store (for clean test execution)
   */
  public clear(): void {
    this.sessions.clear();
    this.runs.clear();
    this.comparisons.clear();
  }
}

export const experimentalResultsStore = new ExperimentalResultsStore();
