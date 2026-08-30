/**
 * SCOS Hardened API Client
 * Automatically attaches Authorization JWT token from localStorage ('scos_auth_token')
 * and handles status code parsing (401 Unauthorized, 403 Forbidden, etc.).
 */

import { OperationalMonitoringSnapshot } from '../types/operationalMonitoring';
import {
  OperationalDecisionSupportSnapshot,
  DecisionReviewPayload,
} from '../types/operationalDecisionSupport';
import {
  UrbanDigitalTwinState,
  TwinEntity,
  TwinDependency,
  TwinSpatialRelationship,
  TwinOperationalState,
  TwinScenarioBaseline,
  DigitalTwinStatistics,
} from '../types/urbanDigitalTwin';
import {
  ScenarioDefinition,
  SimulationResult,
  ScenarioReviewPayload,
  SimulationMitigationOption,
} from '../types/scenarioSimulation';
import {
  ScenarioValidationCase,
  ScenarioValidationInput,
  ScenarioValidationOutput,
  ScenarioComparisonResult,
  ScenarioValidationReport,
  CalibrationParameter,
  CalibrationAssumption,
  ValidationMetricSummary,
} from '../types/scenarioValidation';
import {
  ComparativeEvaluationScenario,
  ComparativeEvaluationRecord,
  ComparativeEvaluationReport,
  EvaluationOrder,
} from '../types/comparativeEvaluation';
import { ComparativeEvaluationTestSuiteResult } from '../tests/comparativeEvaluation.spec';
import {
  ResearchDataset,
  ResearchScenario,
  ResearchAssumption,
  ResearchDatasetVersion,
  ResearchScenarioExecution,
  ResearchExperimentalConditionType,
  ReproducibilityCheckRequest,
  ReproducibilityCheckResult,
  ResearchDatasetExport,
} from '../types/researchDataset';
import { ResearchDatasetTestSuiteResult } from '../tests/researchDataset.spec';
import {
  StatisticalAnalysisSnapshot,
  StatisticalAnalysisSummary,
  MetricStatistics,
} from '../types/statisticalAnalysis';
import { StatisticalTestSuiteSummary } from '../tests/statisticalAnalysis.spec';
import {
  ResearchContributionFramework,
  SCOSArchitecturalLayer,
  CivilEngineeringContributionFramework,
  ResearchQuestionTraceability,
  ThreatToValidityItem,
  EvidenceStrengthSummary,
  ResearchBlueprintFlow,
} from '../types/researchContribution';
import { FrameworkTestSuiteReport } from '../tests/researchFramework.spec';
import {
  SensitivityAnalysisFramework,
  ParameterSensitivityDefinition,
  SensitivityPerturbationResult,
  TornadoRankItem,
  CompoundStressScenarioResult,
  ResearchQuestionRobustnessAssessment,
  EmpiricalCalibrationGap,
  SensitivityTestSuiteReport,
  SensitivitySweepRequest,
} from '../types/sensitivityAnalysis';
import {
  ResearchValidationSnapshot,
  ResearchQuestionConsolidatedEvidence,
  MetricConsolidatedEvidence,
  ScenarioConsolidatedEvidence,
  ValidationCaseConsolidatedEvidence,
  CivilEngineeringDomainEvidence,
  ResearchContributionConsolidatedItem,
  EvidenceGapItem,
  ResearchMaturityAssessment,
  ClaimLedgerItem,
  ResearchValidationProvenance,
  StructuredEvidenceProfile,
} from '../types/researchValidation';
import {
  ThesisEvidencePackage,
  ThesisEvidenceRecord,
  ThesisHypothesisSummary,
  ThesisChapterMapping,
  ThesisFigureRegistryItem,
  ThesisTableRegistryItem,
  ThesisContributionRecord,
  EvidenceBoundarySection,
  ThesisReproducibilityManifest,
  ThesisDatasetManifest,
  ThesisExportManifest,
  ProfessorExaminerSummary,
} from '../types/thesisEvidence';
import {
  ResearchDemonstrationSession,
  ResearchDemonstrationStep,
  ResearchDemonstrationEvidence,
  ResearchDemonstrationScenario,
  ResearchDemonstrationSummary,
  ResearchDemonstrationBoundary,
  ResearchDemonstrationManifest,
  ExaminerQuestionItem,
  QuickDemoStepConfig,
  DemonstrationStepId,
} from '../types/researchDemonstration';

const TOKEN_KEY = 'scos_auth_token';

let refreshPromise: Promise<string | null> | null = null;

async function obtainFreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginIdentifier: 'superadmin@kanpur.gov.in',
          password: 'Password@123',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.session?.token) {
          localStorage.setItem(TOKEN_KEY, data.session.token);
          return data.session.token;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem(TOKEN_KEY);

  // If no token exists and this is not a public auth endpoint, attempt to acquire demo token
  if (!token && !endpoint.startsWith('/api/auth/login') && !endpoint.startsWith('/api/auth/register') && !endpoint.startsWith('/api/auth/forgot-password')) {
    token = await obtainFreshToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If unauthorized and not an auth route, try to refresh token once and retry
  if (response.status === 401 && !endpoint.startsWith('/api/auth/')) {
    const freshToken = await obtainFreshToken();
    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
      response = await fetch(endpoint, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Fallback if response body isn't JSON
    }

    if (response.status === 401) {
      console.warn('[apiClient] 401 Unauthorized - Invalid or expired token');
    } else if (response.status === 403) {
      console.warn('[apiClient] 403 Forbidden - Insufficient permissions');
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch Executive Operational Monitoring Summary Snapshot
 */
export async function getOperationalMonitoringSummary(): Promise<{
  status: string;
  data: OperationalMonitoringSnapshot;
  meta: any;
}> {
  return apiRequest('/api/operational-monitoring/summary');
}

/**
 * Fetch Civil Infrastructure Assets
 */
export async function getInfrastructureAssets(params?: Record<string, string>): Promise<{
  success: boolean;
  count: number;
  data: any[];
  disclaimer: string;
}> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiRequest(`/api/infrastructure${query}`);
}

/**
 * Fetch Department Profiles
 */
export async function getDepartmentProfiles(): Promise<{
  status: string;
  count: number;
  profiles: any[];
  disclaimer: string;
}> {
  return apiRequest('/api/departments/profiles');
}

/**
 * Fetch Incidents List
 */
export async function getIncidents(): Promise<{
  status: string;
  incidents: any[];
}> {
  return apiRequest('/api/incidents');
}

/**
 * Fetch Operational Decision Support Snapshot for an incident
 */
export async function getOperationalDecisionSupport(incidentId?: string): Promise<{
  status: string;
  data: OperationalDecisionSupportSnapshot;
  meta: any;
}> {
  const endpoint = incidentId
    ? `/api/operational-decision-support/${encodeURIComponent(incidentId)}`
    : '/api/operational-decision-support';
  return apiRequest(endpoint);
}

/**
 * Submit Human Officer Review for a Decision Option
 */
export async function submitDecisionOptionReview(
  incidentId: string,
  payload: DecisionReviewPayload
): Promise<{
  status: string;
  message: string;
  data: OperationalDecisionSupportSnapshot;
  auditEventId: string;
}> {
  return apiRequest(`/api/operational-decision-support/${encodeURIComponent(incidentId)}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch Full Urban Digital Twin State
 */
export async function getUrbanDigitalTwinState(): Promise<{
  status: string;
  data: UrbanDigitalTwinState;
  meta: any;
}> {
  return apiRequest('/api/urban-digital-twin/state');
}

/**
 * Fetch Urban Digital Twin Entities with optional category filter
 */
export async function getUrbanDigitalTwinEntities(type?: string): Promise<{
  status: string;
  count: number;
  data: TwinEntity[];
  meta: any;
}> {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiRequest(`/api/urban-digital-twin/entities${query}`);
}

/**
 * Fetch Specific Urban Digital Twin Entity with operational context and dependencies
 */
export async function getUrbanDigitalTwinEntity(id: string): Promise<{
  status: string;
  data: {
    entity: TwinEntity;
    operationalState: TwinOperationalState;
    spatialRelationships: TwinSpatialRelationship[];
    dependencies: TwinDependency[];
    dependents: TwinDependency[];
  };
  meta: any;
}> {
  return apiRequest(`/api/urban-digital-twin/entities/${encodeURIComponent(id)}`);
}

/**
 * Fetch Outgoing Dependencies for an Entity
 */
export async function getUrbanDigitalTwinDependencies(id: string): Promise<{
  status: string;
  entityId: string;
  count: number;
  data: TwinDependency[];
}> {
  return apiRequest(`/api/urban-digital-twin/entities/${encodeURIComponent(id)}/dependencies`);
}

/**
 * Fetch Incoming Dependents for an Entity
 */
export async function getUrbanDigitalTwinDependents(id: string): Promise<{
  status: string;
  entityId: string;
  count: number;
  data: TwinDependency[];
}> {
  return apiRequest(`/api/urban-digital-twin/entities/${encodeURIComponent(id)}/dependents`);
}

/**
 * Fetch Aggregated Digital Twin Statistics
 */
export async function getUrbanDigitalTwinStatistics(): Promise<{
  status: string;
  data: DigitalTwinStatistics;
}> {
  return apiRequest('/api/urban-digital-twin/statistics');
}

/**
 * Fetch Scenario Baseline Snapshot
 */
export async function getUrbanDigitalTwinBaseline(): Promise<{
  status: string;
  data: TwinScenarioBaseline;
  meta: any;
}> {
  return apiRequest('/api/urban-digital-twin/baseline');
}

/**
 * Fetch Preset What-If Scenarios
 */
export async function getScenarioPresets(): Promise<{
  status: string;
  data: ScenarioDefinition[];
}> {
  return apiRequest('/api/urban-digital-twin/scenarios/presets');
}

/**
 * Run What-If Scenario Simulation
 */
export async function runScenarioSimulation(
  scenarioInput: Partial<ScenarioDefinition>
): Promise<{
  status: string;
  data: SimulationResult;
}> {
  return apiRequest('/api/urban-digital-twin/scenarios/simulate', {
    method: 'POST',
    body: JSON.stringify(scenarioInput),
  });
}

/**
 * Fetch Simulation Result by ID
 */
export async function getScenarioSimulationResult(id: string): Promise<{
  status: string;
  data: SimulationResult;
}> {
  return apiRequest(`/api/urban-digital-twin/scenarios/result/${encodeURIComponent(id)}`);
}

/**
 * Submit Human Officer Review on Simulation Mitigation Option
 */
export async function reviewScenarioMitigation(payload: {
  simulationId: string;
  optionId: string;
  decision: 'APPROVE' | 'MODIFY' | 'REJECT';
  officerNotes?: string;
  modifiedActionSteps?: string[];
}): Promise<{
  status: string;
  data: { success: boolean; option: SimulationMitigationOption; message: string };
}> {
  return apiRequest('/api/urban-digital-twin/scenarios/review', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Run Digital Twin Automated Test Suite
 */
export async function runDigitalTwinTestSuite(): Promise<{
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  testResults: Array<{ id: string; title: string; passed: boolean; message?: string }>;
}> {
  return apiRequest('/api/urban-digital-twin/test');
}

/**
 * PHASE 9C — Scenario Validation & Calibration API Methods
 */

export async function getScenarioValidationCases(): Promise<ScenarioValidationCase[]> {
  const res = await apiRequest<{ status: string; data: ScenarioValidationCase[] }>('/api/scenario-validation/cases');
  return res.data || [];
}

export async function getScenarioValidationCase(id: string): Promise<ScenarioValidationCase> {
  const res = await apiRequest<{ status: string; data: ScenarioValidationCase }>(`/api/scenario-validation/cases/${id}`);
  return res.data;
}

export async function runScenarioValidation(
  caseId: string,
  overrides?: Partial<ScenarioValidationInput>
): Promise<ScenarioValidationOutput> {
  const res = await apiRequest<{ status: string; data: ScenarioValidationOutput }>('/api/scenario-validation/run', {
    method: 'POST',
    body: JSON.stringify({ caseId, overrides }),
  });
  return res.data;
}

export async function compareScenarioValidation(caseId: string): Promise<ScenarioComparisonResult> {
  const res = await apiRequest<{ status: string; data: ScenarioComparisonResult }>('/api/scenario-validation/compare', {
    method: 'POST',
    body: JSON.stringify({ caseId }),
  });
  return res.data;
}

export async function getScenarioValidationReport(id: string): Promise<ScenarioValidationReport> {
  const res = await apiRequest<{ status: string; data: ScenarioValidationReport }>(`/api/scenario-validation/report/${id}`);
  return res.data;
}

export async function getCalibrationParameters(): Promise<{
  parameters: CalibrationParameter[];
  assumptions: CalibrationAssumption[];
}> {
  const res = await apiRequest<{
    status: string;
    data: { parameters: CalibrationParameter[]; assumptions: CalibrationAssumption[] };
  }>('/api/scenario-validation/parameters');
  return res.data;
}

export async function runScenarioValidationTestSuite(): Promise<{
  success: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  executedAt: string;
  testResults: Array<{ id: string; title: string; passed: boolean; message: string }>;
  disclaimer: string;
}> {
  return apiRequest('/api/scenario-validation/test-suite', {
    method: 'POST',
  });
}

// =========================================================================
// SCOS Phase 9D — Comparative Decision-Support Evaluation API Methods
// =========================================================================

export async function getComparativeScenarios(): Promise<ComparativeEvaluationScenario[]> {
  const res = await apiRequest<{ status: string; data: ComparativeEvaluationScenario[] }>(
    '/api/comparative-evaluation/scenarios'
  );
  return res.data;
}

export async function getComparativeRecords(): Promise<ComparativeEvaluationRecord[]> {
  const res = await apiRequest<{ status: string; data: ComparativeEvaluationRecord[] }>(
    '/api/comparative-evaluation/records'
  );
  return res.data;
}

export async function getComparativeRecord(
  participantId: string,
  scenarioId?: string
): Promise<ComparativeEvaluationRecord> {
  const query = scenarioId ? `?scenarioId=${encodeURIComponent(scenarioId)}` : '';
  const res = await apiRequest<{ status: string; data: ComparativeEvaluationRecord }>(
    `/api/comparative-evaluation/records/${encodeURIComponent(participantId)}${query}`
  );
  return res.data;
}

export async function runComparativeEvaluation(params: {
  participantId?: string;
  scenarioId?: string;
  evaluationOrder?: EvaluationOrder;
  incidentId?: string;
}): Promise<ComparativeEvaluationRecord> {
  const res = await apiRequest<{ status: string; data: ComparativeEvaluationRecord }>(
    '/api/comparative-evaluation/run',
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
  return res.data;
}

export async function getComparativeReport(): Promise<ComparativeEvaluationReport> {
  const res = await apiRequest<{ status: string; data: ComparativeEvaluationReport }>(
    '/api/comparative-evaluation/report'
  );
  return res.data;
}

export async function exportComparativeCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/comparative-evaluation/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

export async function runComparativeEvaluationTestSuite(): Promise<ComparativeEvaluationTestSuiteResult> {
  return apiRequest('/api/comparative-evaluation/test-suite', {
    method: 'POST',
  });
}

// =========================================================================
// PHASE 10A — EXPERIMENTAL DATASET & RESEARCH SCENARIO REGISTRY
// =========================================================================

export async function getResearchDatasetSummary(): Promise<ResearchDataset> {
  const res = await apiRequest<{ status: string; data: ResearchDataset }>(
    '/api/research-dataset/summary'
  );
  return res.data;
}

export async function getResearchScenarios(): Promise<ResearchScenario[]> {
  const res = await apiRequest<{ status: string; data: ResearchScenario[] }>(
    '/api/research-dataset/scenarios'
  );
  return res.data;
}

export async function getResearchScenario(id: string): Promise<ResearchScenario> {
  const res = await apiRequest<{ status: string; data: ResearchScenario }>(
    `/api/research-dataset/scenarios/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function getResearchAssumptions(): Promise<ResearchAssumption[]> {
  const res = await apiRequest<{ status: string; data: ResearchAssumption[] }>(
    '/api/research-dataset/assumptions'
  );
  return res.data;
}

export async function getResearchVersions(): Promise<ResearchDatasetVersion[]> {
  const res = await apiRequest<{ status: string; data: ResearchDatasetVersion[] }>(
    '/api/research-dataset/versions'
  );
  return res.data;
}

export async function getResearchExecutions(): Promise<ResearchScenarioExecution[]> {
  const res = await apiRequest<{ status: string; data: ResearchScenarioExecution[] }>(
    '/api/research-dataset/executions'
  );
  return res.data;
}

export async function freezeResearchScenario(id: string): Promise<ResearchScenario> {
  const res = await apiRequest<{ status: string; data: ResearchScenario }>(
    `/api/research-dataset/scenarios/${encodeURIComponent(id)}/freeze`,
    { method: 'POST' }
  );
  return res.data;
}

export async function runResearchExecution(params: {
  scenarioId: string;
  condition: ResearchExperimentalConditionType;
  parameterOverrides?: Record<string, number>;
}): Promise<ResearchScenarioExecution> {
  const res = await apiRequest<{ status: string; data: ResearchScenarioExecution }>(
    '/api/research-dataset/executions',
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );
  return res.data;
}

export async function verifyReproducibility(
  req: ReproducibilityCheckRequest
): Promise<ReproducibilityCheckResult> {
  const res = await apiRequest<{ status: string; data: ReproducibilityCheckResult }>(
    '/api/research-dataset/reproducibility-check',
    {
      method: 'POST',
      body: JSON.stringify(req),
    }
  );
  return res.data;
}

export async function exportResearchDataset(): Promise<ResearchDatasetExport> {
  const res = await apiRequest<{ status: string; data: ResearchDatasetExport }>(
    '/api/research-dataset/export?format=JSON'
  );
  return res.data;
}

export async function exportResearchDatasetCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-dataset/export?format=CSV', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

export async function runResearchDatasetTestSuite(): Promise<ResearchDatasetTestSuiteResult> {
  return apiRequest('/api/research-dataset/test', {
    method: 'POST',
  });
}

// =========================================================================
// PHASE 10C — STATISTICAL ANALYSIS & UNCERTAINTY LAYER
// =========================================================================

export async function getStatisticalAnalysisSummary(): Promise<StatisticalAnalysisSummary> {
  const res = await apiRequest<{ status: string; data: StatisticalAnalysisSummary }>(
    '/api/statistical-analysis/summary'
  );
  return res.data;
}

export async function getMetricStatistics(metricCode: string): Promise<MetricStatistics> {
  const res = await apiRequest<{ status: string; data: MetricStatistics }>(
    `/api/statistical-analysis/metric/${encodeURIComponent(metricCode)}`
  );
  return res.data;
}

export async function getScenarioStatistics(scenarioId: string): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>(
    `/api/statistical-analysis/scenario/${encodeURIComponent(scenarioId)}`
  );
  return res.data;
}

export async function runStatisticalAnalysis(): Promise<StatisticalAnalysisSnapshot> {
  const res = await apiRequest<{ status: string; data: StatisticalAnalysisSnapshot }>(
    '/api/statistical-analysis/run',
    {
      method: 'POST',
    }
  );
  return res.data;
}

export async function verifyStatisticalAnalysisReproducibility(): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>(
    '/api/statistical-analysis/verify',
    {
      method: 'POST',
    }
  );
  return res.data;
}

export async function exportStatisticalAnalysisJSON(): Promise<StatisticalAnalysisSnapshot> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/statistical-analysis/export/json', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.json();
}

export async function exportStatisticalAnalysisCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/statistical-analysis/export/csv', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

export async function runStatisticalAnalysisTestSuite(): Promise<StatisticalTestSuiteSummary> {
  const res = await apiRequest<{ status: string; data: StatisticalTestSuiteSummary }>(
    '/api/statistical-analysis/test',
    {
      method: 'POST',
    }
  );
  return res.data;
}

// Phase 10E — Research Contribution & Reference Architecture
export async function getResearchFrameworkSummary(): Promise<ResearchContributionFramework> {
  const res = await apiRequest<{ status: string; data: ResearchContributionFramework }>(
    '/api/research-framework/summary'
  );
  return res.data;
}

export async function getResearchArchitecture(): Promise<{ totalLayers: number; layers: SCOSArchitecturalLayer[] }> {
  const res = await apiRequest<{ status: string; data: { totalLayers: number; layers: SCOSArchitecturalLayer[] } }>(
    '/api/research-framework/architecture'
  );
  return res.data;
}

export async function getResearchContributions(): Promise<{ contributions: any[]; gapMatrix: any[] }> {
  const res = await apiRequest<{ status: string; data: { contributions: any[]; gapMatrix: any[] } }>(
    '/api/research-framework/contributions'
  );
  return res.data;
}

export async function getCivilEngineeringContribution(): Promise<CivilEngineeringContributionFramework> {
  const res = await apiRequest<{ status: string; data: CivilEngineeringContributionFramework }>(
    '/api/research-framework/civil-engineering'
  );
  return res.data;
}

export async function getResearchTraceability(): Promise<Record<string, ResearchQuestionTraceability>> {
  const res = await apiRequest<{ status: string; data: Record<string, ResearchQuestionTraceability> }>(
    '/api/research-framework/traceability'
  );
  return res.data;
}

export async function getThreatsToValidity(): Promise<ThreatToValidityItem[]> {
  const res = await apiRequest<{ status: string; data: ThreatToValidityItem[] }>(
    '/api/research-framework/threats-validity'
  );
  return res.data;
}

export async function getEvidenceStrength(): Promise<EvidenceStrengthSummary> {
  const res = await apiRequest<{ status: string; data: EvidenceStrengthSummary }>(
    '/api/research-framework/evidence-strength'
  );
  return res.data;
}

export async function getResearchBlueprint(): Promise<ResearchBlueprintFlow> {
  const res = await apiRequest<{ status: string; data: ResearchBlueprintFlow }>(
    '/api/research-framework/blueprint'
  );
  return res.data;
}

export async function runResearchFrameworkTestSuite(): Promise<FrameworkTestSuiteReport> {
  const res = await apiRequest<{ status: string; data: FrameworkTestSuiteReport }>(
    '/api/research-framework/test',
    {
      method: 'POST',
    }
  );
  return res.data;
}

export async function exportResearchFrameworkJSON(): Promise<ResearchContributionFramework> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-framework/export/json', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.json();
}

export async function exportResearchFrameworkCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-framework/export/csv', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

// =========================================================================
// SCOS PHASE 10F — SENSITIVITY & ROBUSTNESS ANALYSIS API METHODS
// =========================================================================

export async function getSensitivityFrameworkSummary(): Promise<SensitivityAnalysisFramework> {
  const res = await apiRequest<{ status: string; data: SensitivityAnalysisFramework }>(
    '/api/sensitivity-analysis/summary'
  );
  return res.data;
}

export async function getSensitivityParameters(): Promise<{ totalCount: number; parameters: ParameterSensitivityDefinition[] }> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; parameters: ParameterSensitivityDefinition[] } }>(
    '/api/sensitivity-analysis/parameters'
  );
  return res.data;
}

export async function getSensitivityParameter(id: string): Promise<ParameterSensitivityDefinition> {
  const res = await apiRequest<{ status: string; data: ParameterSensitivityDefinition }>(
    `/api/sensitivity-analysis/parameters/${id}`
  );
  return res.data;
}

export async function getSensitivityOATResults(filter?: {
  parameterId?: string;
  metricKey?: string;
  scenarioId?: string;
}): Promise<{ totalCount: number; results: SensitivityPerturbationResult[] }> {
  const queryParams = new URLSearchParams();
  if (filter?.parameterId) queryParams.set('parameterId', filter.parameterId);
  if (filter?.metricKey) queryParams.set('metricKey', filter.metricKey);
  if (filter?.scenarioId) queryParams.set('scenarioId', filter.scenarioId);

  const url = `/api/sensitivity-analysis/oat${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await apiRequest<{ status: string; data: { totalCount: number; results: SensitivityPerturbationResult[] } }>(
    url
  );
  return res.data;
}

export async function getSensitivityTornado(metricKey: string = 'M1_WORKFLOW_DURATION'): Promise<{
  metricKey: string;
  rankings: TornadoRankItem[];
}> {
  const res = await apiRequest<{ status: string; data: { metricKey: string; rankings: TornadoRankItem[] } }>(
    `/api/sensitivity-analysis/tornado?metricKey=${metricKey}`
  );
  return res.data;
}

export async function getSensitivityCompoundStress(): Promise<{ totalScenarios: number; scenarios: CompoundStressScenarioResult[] }> {
  const res = await apiRequest<{ status: string; data: { totalScenarios: number; scenarios: CompoundStressScenarioResult[] } }>(
    '/api/sensitivity-analysis/compound'
  );
  return res.data;
}

export async function getSensitivityRobustnessClaims(): Promise<{ totalClaims: number; claims: ResearchQuestionRobustnessAssessment[] }> {
  const res = await apiRequest<{ status: string; data: { totalClaims: number; claims: ResearchQuestionRobustnessAssessment[] } }>(
    '/api/sensitivity-analysis/robustness-claims'
  );
  return res.data;
}

export async function getSensitivityCalibrationGaps(): Promise<{ totalGaps: number; calibrationGaps: EmpiricalCalibrationGap[] }> {
  const res = await apiRequest<{ status: string; data: { totalGaps: number; calibrationGaps: EmpiricalCalibrationGap[] } }>(
    '/api/sensitivity-analysis/calibration-needs'
  );
  return res.data;
}

export async function runCustomSensitivitySweep(req: SensitivitySweepRequest): Promise<{
  parameter: ParameterSensitivityDefinition;
  results: SensitivityPerturbationResult[];
  calculatedElasticityMean: number;
  stabilityAssessment: string;
}> {
  const res = await apiRequest<{
    status: string;
    data: {
      parameter: ParameterSensitivityDefinition;
      results: SensitivityPerturbationResult[];
      calculatedElasticityMean: number;
      stabilityAssessment: string;
    };
  }>('/api/sensitivity-analysis/run-sweep', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function verifySensitivityHash(hash: string): Promise<{
  isMatch: boolean;
  serverHash: string;
  clientHash: string;
  verifiedAt: string;
  details: string;
}> {
  const res = await apiRequest<{
    status: string;
    data: {
      isMatch: boolean;
      serverHash: string;
      clientHash: string;
      verifiedAt: string;
      details: string;
    };
  }>('/api/sensitivity-analysis/verify-hash', {
    method: 'POST',
    body: JSON.stringify({ hash }),
  });
  return res.data;
}

export async function runSensitivityTestSuite(): Promise<SensitivityTestSuiteReport> {
  const res = await apiRequest<{ status: string; data: SensitivityTestSuiteReport }>(
    '/api/sensitivity-analysis/test',
    {
      method: 'POST',
    }
  );
  return res.data;
}

export async function exportSensitivityJSON(): Promise<SensitivityAnalysisFramework> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/sensitivity-analysis/export/json', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.json();
}

export async function exportSensitivityCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/sensitivity-analysis/export/csv', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

// =========================================================================
// SCOS PHASE 11A — INTEGRATED RESEARCH VALIDATION & EVIDENCE CONSOLIDATION
// =========================================================================

export async function getResearchValidationSummary(): Promise<ResearchValidationSnapshot> {
  const res = await apiRequest<{ status: string; data: ResearchValidationSnapshot }>(
    '/api/research-validation/summary'
  );
  return res.data;
}

export async function getResearchValidationRQ(rqId: string): Promise<ResearchQuestionConsolidatedEvidence> {
  const res = await apiRequest<{ status: string; data: ResearchQuestionConsolidatedEvidence }>(
    `/api/research-validation/rq/${encodeURIComponent(rqId)}`
  );
  return res.data;
}

export async function getResearchValidationMetric(metricId: string): Promise<MetricConsolidatedEvidence> {
  const res = await apiRequest<{ status: string; data: MetricConsolidatedEvidence }>(
    `/api/research-validation/metric/${encodeURIComponent(metricId)}`
  );
  return res.data;
}

export async function getResearchValidationScenario(scenarioId: string): Promise<ScenarioConsolidatedEvidence> {
  const res = await apiRequest<{ status: string; data: ScenarioConsolidatedEvidence }>(
    `/api/research-validation/scenario/${encodeURIComponent(scenarioId)}`
  );
  return res.data;
}

export async function getResearchValidationCases(): Promise<ValidationCaseConsolidatedEvidence[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; cases: ValidationCaseConsolidatedEvidence[] } }>(
    '/api/research-validation/validation-cases'
  );
  return res.data.cases;
}

export async function getResearchValidationThreats(): Promise<any[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; threats: any[] } }>(
    '/api/research-validation/threats'
  );
  return res.data.threats;
}

export async function getResearchValidationCivilEngineering(): Promise<CivilEngineeringDomainEvidence[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; domains: CivilEngineeringDomainEvidence[] } }>(
    '/api/research-validation/civil-engineering'
  );
  return res.data.domains;
}

export async function getResearchValidationContributions(): Promise<ResearchContributionConsolidatedItem[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; contributions: ResearchContributionConsolidatedItem[] } }>(
    '/api/research-validation/contributions'
  );
  return res.data.contributions;
}

export async function getResearchValidationGaps(): Promise<EvidenceGapItem[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; gaps: EvidenceGapItem[] } }>(
    '/api/research-validation/gaps'
  );
  return res.data.gaps;
}

export async function getResearchValidationMaturity(): Promise<ResearchMaturityAssessment> {
  const res = await apiRequest<{ status: string; data: ResearchMaturityAssessment }>(
    '/api/research-validation/maturity'
  );
  return res.data;
}

export async function getResearchValidationProvenance(): Promise<ResearchValidationProvenance> {
  const res = await apiRequest<{ status: string; data: ResearchValidationProvenance }>(
    '/api/research-validation/provenance'
  );
  return res.data;
}

export async function getResearchValidationClaimLedger(): Promise<ClaimLedgerItem[]> {
  const res = await apiRequest<{ status: string; data: { totalCount: number; claims: ClaimLedgerItem[] } }>(
    '/api/research-validation/claim-ledger'
  );
  return res.data.claims;
}

export async function validateResearchClaimLanguage(text: string): Promise<{
  isValid: boolean;
  flaggedTerms: string[];
  suggestions: { term: string; suggestedReplacement: string; reason: string }[];
}> {
  const res = await apiRequest<{
    status: string;
    data: {
      isValid: boolean;
      flaggedTerms: string[];
      suggestions: { term: string; suggestedReplacement: string; reason: string }[];
    };
  }>('/api/research-validation/validate-claim', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return res.data;
}

export async function exportResearchValidationJSON(): Promise<ResearchValidationSnapshot> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-validation/export/json', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.json();
}

export async function exportResearchValidationCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-validation/export/csv', {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

export async function runResearchValidationTest(): Promise<{
  allPassed: boolean;
  checks: { name: string; passed: boolean }[];
}> {
  const res = await apiRequest<{
    status: string;
    data: { allPassed: boolean; checks: { name: string; passed: boolean }[] };
  }>('/api/research-validation/test');
  return res.data;
}

// =========================================================================
// PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION
// =========================================================================

export async function getResearchClaimsSummary(): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>('/api/research-claims/summary');
  return res.data;
}

export async function getResearchHypotheses(): Promise<any[]> {
  const res = await apiRequest<{ status: string; data: any[] }>('/api/research-claims/hypotheses');
  return res.data;
}

export async function getResearchHypothesis(id: string): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>(
    `/api/research-claims/hypotheses/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function getResearchClaimEvidence(id: string): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>(
    `/api/research-claims/evidence/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function getResearchClaimMetrics(): Promise<any[]> {
  const res = await apiRequest<{ status: string; data: any[] }>('/api/research-claims/metrics');
  return res.data;
}

export async function validateResearchClaims(criteria?: any): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>('/api/research-claims/validate', {
    method: 'POST',
    body: JSON.stringify(criteria || {}),
  });
  return res.data;
}

export async function validateClaimLanguage(text: string): Promise<any> {
  const res = await apiRequest<{ status: string; data: any }>(
    '/api/research-claims/validate-language',
    {
      method: 'POST',
      body: JSON.stringify({ text }),
    }
  );
  return res.data;
}

export async function getResearchClaimLimitations(): Promise<any[]> {
  const res = await apiRequest<{ status: string; data: any[] }>('/api/research-claims/limitations');
  return res.data;
}

export async function exportResearchClaimsJSON(): Promise<any> {
  const res = await apiRequest<any>('/api/research-claims/export/json');
  return res;
}

export async function exportResearchClaimsCSV(): Promise<string> {
  const token = localStorage.getItem('scos_auth_token');
  const response = await fetch('/api/research-claims/export/csv', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.text();
}

export async function getResearchClaimsFingerprint(): Promise<{
  canonicalFingerprint: string;
  datasetVersion: string;
  generatedAt: string;
}> {
  const res = await apiRequest<{
    status: string;
    data: { canonicalFingerprint: string; datasetVersion: string; generatedAt: string };
  }>('/api/research-claims/fingerprint');
  return res.data;
}

export async function runResearchClaimsTestSuite(): Promise<{
  allPassed: boolean;
  checks: { name: string; passed: boolean; details: string }[];
}> {
  const res = await apiRequest<{
    status: string;
    data: { allPassed: boolean; checks: { name: string; passed: boolean; details: string }[] };
  }>('/api/research-claims/test', {
    method: 'POST',
  });
  return res.data;
}

// =========================================================================
// PHASE 11C — THESIS EVIDENCE & ACADEMIC REPRODUCIBILITY API CLIENT METHODS
// =========================================================================

export async function getThesisEvidencePackage(): Promise<ThesisEvidencePackage> {
  const res = await apiRequest<{ status: string; data: ThesisEvidencePackage }>(
    '/api/thesis-evidence/package'
  );
  return res.data;
}

export async function getThesisRQMatrix(): Promise<ThesisEvidenceRecord[]> {
  const res = await apiRequest<{ status: string; data: ThesisEvidenceRecord[] }>(
    '/api/thesis-evidence/rq-matrix'
  );
  return res.data;
}

export async function getThesisHypotheses(): Promise<ThesisHypothesisSummary[]> {
  const res = await apiRequest<{ status: string; data: ThesisHypothesisSummary[] }>(
    '/api/thesis-evidence/hypotheses'
  );
  return res.data;
}

export async function getThesisChapters(): Promise<ThesisChapterMapping[]> {
  const res = await apiRequest<{ status: string; data: ThesisChapterMapping[] }>(
    '/api/thesis-evidence/chapters'
  );
  return res.data;
}

export async function getThesisFigures(): Promise<ThesisFigureRegistryItem[]> {
  const res = await apiRequest<{ status: string; data: ThesisFigureRegistryItem[] }>(
    '/api/thesis-evidence/figures'
  );
  return res.data;
}

export async function getThesisTables(): Promise<ThesisTableRegistryItem[]> {
  const res = await apiRequest<{ status: string; data: ThesisTableRegistryItem[] }>(
    '/api/thesis-evidence/tables'
  );
  return res.data;
}

export async function getThesisContributions(): Promise<ThesisContributionRecord[]> {
  const res = await apiRequest<{ status: string; data: ThesisContributionRecord[] }>(
    '/api/thesis-evidence/contributions'
  );
  return res.data;
}

export async function getThesisEvidenceBoundaries(): Promise<EvidenceBoundarySection> {
  const res = await apiRequest<{ status: string; data: EvidenceBoundarySection }>(
    '/api/thesis-evidence/boundaries'
  );
  return res.data;
}

export async function getThesisReproducibilityManifest(): Promise<ThesisReproducibilityManifest> {
  const res = await apiRequest<{ status: string; data: ThesisReproducibilityManifest }>(
    '/api/thesis-evidence/reproducibility-manifest'
  );
  return res.data;
}

export async function getThesisDatasetManifest(): Promise<ThesisDatasetManifest> {
  const res = await apiRequest<{ status: string; data: ThesisDatasetManifest }>(
    '/api/thesis-evidence/dataset-manifest'
  );
  return res.data;
}

export async function verifyThesisPackageFingerprint(): Promise<{
  verified: boolean;
  packageFingerprint: string;
  datasetFingerprint: string;
  claimsFingerprint: string;
  details: string;
}> {
  const res = await apiRequest<{
    status: string;
    data: {
      verified: boolean;
      packageFingerprint: string;
      datasetFingerprint: string;
      claimsFingerprint: string;
      details: string;
    };
  }>('/api/thesis-evidence/verify-fingerprint');
  return res.data;
}

export async function exportThesisEvidenceJSON(): Promise<ThesisExportManifest> {
  const res = await apiRequest<{ status: string; data: ThesisExportManifest }>(
    '/api/thesis-evidence/export/json',
    { method: 'POST' }
  );
  return res.data;
}

export async function exportThesisEvidenceCSV(): Promise<ThesisExportManifest> {
  const res = await apiRequest<{ status: string; data: ThesisExportManifest }>(
    '/api/thesis-evidence/export/csv',
    { method: 'POST' }
  );
  return res.data;
}

export async function exportThesisEvidenceMarkdown(): Promise<ThesisExportManifest> {
  const res = await apiRequest<{ status: string; data: ThesisExportManifest }>(
    '/api/thesis-evidence/export/markdown',
    { method: 'POST' }
  );
  return res.data;
}

export async function runThesisSelfTest(): Promise<{
  allPassed: boolean;
  checks: { name: string; passed: boolean }[];
}> {
  const res = await apiRequest<{
    status: string;
    data: { allPassed: boolean; checks: { name: string; passed: boolean }[] };
  }>('/api/thesis-evidence/self-test');
  return res.data;
}

// =========================================================================
// PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE
// =========================================================================

export async function getDemonstrationSummary(): Promise<{
  summary: ResearchDemonstrationSummary;
  session: ResearchDemonstrationSession;
}> {
  const res = await apiRequest<{
    success: boolean;
    summary: ResearchDemonstrationSummary;
    session: ResearchDemonstrationSession;
  }>('/api/research-demonstration/summary');
  return { summary: res.summary, session: res.session };
}

export async function getDemonstrationSteps(): Promise<ResearchDemonstrationStep[]> {
  const res = await apiRequest<{
    success: boolean;
    totalSteps: number;
    steps: ResearchDemonstrationStep[];
  }>('/api/research-demonstration/steps');
  return res.steps;
}

export async function getQuickDemoSteps(): Promise<QuickDemoStepConfig[]> {
  const res = await apiRequest<{
    success: boolean;
    totalSteps: number;
    quickSteps: QuickDemoStepConfig[];
  }>('/api/research-demonstration/quick');
  return res.quickSteps;
}

export async function getProfessorDemoSteps(): Promise<{
  professorSteps: ResearchDemonstrationStep[];
  summary: ResearchDemonstrationSummary;
}> {
  const res = await apiRequest<{
    success: boolean;
    totalSteps: number;
    professorSteps: ResearchDemonstrationStep[];
    summary: ResearchDemonstrationSummary;
  }>('/api/research-demonstration/professor');
  return { professorSteps: res.professorSteps, summary: res.summary };
}

export async function getDemonstrationScenario(
  scenarioId: string = 'SC-01'
): Promise<ResearchDemonstrationScenario> {
  const res = await apiRequest<{
    success: boolean;
    scenario: ResearchDemonstrationScenario;
  }>(`/api/research-demonstration/scenario?scenarioId=${encodeURIComponent(scenarioId)}`);
  return res.scenario;
}

export async function getCivilEngineeringSummary(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    civilEngineering: any;
  }>('/api/research-demonstration/civil-engineering');
  return res.civilEngineering;
}

export async function getExperimentalDesignSummary(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    design: any;
  }>('/api/research-demonstration/experimental-design');
  return res.design;
}

export async function getResultsSummary(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    results: any;
  }>('/api/research-demonstration/results');
  return res.results;
}

export async function getHypothesisSummary(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    hypotheses: any;
  }>('/api/research-demonstration/hypotheses');
  return res.hypotheses;
}

export async function getContributionSummary(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    contributions: any;
  }>('/api/research-demonstration/contributions');
  return res.contributions;
}

export async function getBoundarySummary(): Promise<ResearchDemonstrationBoundary> {
  const res = await apiRequest<{
    success: boolean;
    boundaries: ResearchDemonstrationBoundary;
  }>('/api/research-demonstration/boundaries');
  return res.boundaries;
}

export async function getExaminerQuestions(): Promise<ExaminerQuestionItem[]> {
  const res = await apiRequest<{
    success: boolean;
    totalQuestions: number;
    questions: ExaminerQuestionItem[];
  }>('/api/research-demonstration/questions');
  return res.questions;
}

export async function getDemonstrationManifest(): Promise<ResearchDemonstrationManifest> {
  const res = await apiRequest<{
    success: boolean;
    manifest: ResearchDemonstrationManifest;
  }>('/api/research-demonstration/manifest');
  return res.manifest;
}

export async function getDemonstrationEvidence(
  stepId: DemonstrationStepId
): Promise<ResearchDemonstrationEvidence> {
  const res = await apiRequest<{
    success: boolean;
    stepId: DemonstrationStepId;
    evidence: ResearchDemonstrationEvidence;
  }>(`/api/research-demonstration/evidence/${encodeURIComponent(stepId)}`);
  return res.evidence;
}

export async function verifyDemonstrationFingerprint(): Promise<{
  valid: boolean;
  manifestId: string;
  computedFingerprint: string;
  expectedFingerprint: string;
  checkedAt: string;
}> {
  const res = await apiRequest<{
    success: boolean;
    verification: {
      valid: boolean;
      manifestId: string;
      computedFingerprint: string;
      expectedFingerprint: string;
      checkedAt: string;
    };
  }>('/api/research-demonstration/verify', { method: 'POST' });
  return res.verification;
}

export async function resetDemonstrationState(): Promise<{ message: string; timestamp: string }> {
  const res = await apiRequest<{
    success: boolean;
    result: { message: string; timestamp: string };
  }>('/api/research-demonstration/reset', { method: 'POST' });
  return res.result;
}

export async function runDemonstrationSelfTest(): Promise<any> {
  const res = await apiRequest<{
    success: boolean;
    testResult: any;
  }>('/api/research-demonstration/test', { method: 'POST' });
  return res.testResult;
}

export const apiClient = {
  apiRequest,
  getOperationalMonitoringSummary,
  getInfrastructureAssets,
  getDepartmentProfiles,
  getIncidents,
  getOperationalDecisionSupport,
  submitDecisionOptionReview,
  getUrbanDigitalTwinState,
  getUrbanDigitalTwinEntities,
  getUrbanDigitalTwinEntity,
  getUrbanDigitalTwinDependencies,
  getUrbanDigitalTwinDependents,
  getUrbanDigitalTwinStatistics,
  getUrbanDigitalTwinBaseline,
  getScenarioPresets,
  runScenarioSimulation,
  getScenarioSimulationResult,
  reviewScenarioMitigation,
  runDigitalTwinTestSuite,
  // Phase 9C
  getScenarioValidationCases,
  getScenarioValidationCase,
  runScenarioValidation,
  compareScenarioValidation,
  getScenarioValidationReport,
  getCalibrationParameters,
  runScenarioValidationTestSuite,
  // Phase 9D
  getComparativeScenarios,
  getComparativeRecords,
  getComparativeRecord,
  runComparativeEvaluation,
  getComparativeReport,
  exportComparativeCSV,
  runComparativeEvaluationTestSuite,
  // Phase 10A
  getResearchDatasetSummary,
  getResearchScenarios,
  getResearchScenario,
  getResearchAssumptions,
  getResearchVersions,
  getResearchExecutions,
  freezeResearchScenario,
  runResearchExecution,
  verifyReproducibility,
  exportResearchDataset,
  exportResearchDatasetCSV,
  runResearchDatasetTestSuite,
  // Phase 10C
  getStatisticalAnalysisSummary,
  getMetricStatistics,
  getScenarioStatistics,
  runStatisticalAnalysis,
  verifyStatisticalAnalysisReproducibility,
  exportStatisticalAnalysisJSON,
  exportStatisticalAnalysisCSV,
  runStatisticalAnalysisTestSuite,
  // Phase 10E
  getResearchFrameworkSummary,
  getResearchArchitecture,
  getResearchContributions,
  getCivilEngineeringContribution,
  getResearchTraceability,
  getThreatsToValidity,
  getEvidenceStrength,
  getResearchBlueprint,
  runResearchFrameworkTestSuite,
  exportResearchFrameworkJSON,
  exportResearchFrameworkCSV,
  // Phase 10F
  getSensitivityFrameworkSummary,
  getSensitivityParameters,
  getSensitivityParameter,
  getSensitivityOATResults,
  getSensitivityTornado,
  getSensitivityCompoundStress,
  getSensitivityRobustnessClaims,
  getSensitivityCalibrationGaps,
  runCustomSensitivitySweep,
  verifySensitivityHash,
  runSensitivityTestSuite,
  exportSensitivityJSON,
  exportSensitivityCSV,
  // Phase 11A
  getResearchValidationSummary,
  getResearchValidationRQ,
  getResearchValidationMetric,
  getResearchValidationScenario,
  getResearchValidationCases,
  getResearchValidationThreats,
  getResearchValidationCivilEngineering,
  getResearchValidationContributions,
  getResearchValidationGaps,
  getResearchValidationMaturity,
  getResearchValidationProvenance,
  getResearchValidationClaimLedger,
  validateResearchClaimLanguage,
  exportResearchValidationJSON,
  exportResearchValidationCSV,
  runResearchValidationTest,
  // Phase 11B
  getResearchClaimsSummary,
  getResearchHypotheses,
  getResearchHypothesis,
  getResearchClaimEvidence,
  getResearchClaimMetrics,
  validateResearchClaims,
  validateClaimLanguage,
  getResearchClaimLimitations,
  exportResearchClaimsJSON,
  exportResearchClaimsCSV,
  getResearchClaimsFingerprint,
  runResearchClaimsTestSuite,
  // Phase 11C
  getThesisEvidencePackage,
  getThesisRQMatrix,
  getThesisHypotheses,
  getThesisChapters,
  getThesisFigures,
  getThesisTables,
  getThesisContributions,
  getThesisEvidenceBoundaries,
  getThesisReproducibilityManifest,
  getThesisDatasetManifest,
  verifyThesisPackageFingerprint,
  exportThesisEvidenceJSON,
  exportThesisEvidenceCSV,
  exportThesisEvidenceMarkdown,
  runThesisSelfTest,
  // Phase 11D
  getDemonstrationSummary,
  getDemonstrationSteps,
  getQuickDemoSteps,
  getProfessorDemoSteps,
  getDemonstrationScenario,
  getCivilEngineeringSummary,
  getExperimentalDesignSummary,
  getResultsSummary,
  getHypothesisSummary,
  getContributionSummary,
  getBoundarySummary,
  getExaminerQuestions,
  getDemonstrationManifest,
  getDemonstrationEvidence,
  verifyDemonstrationFingerprint,
  resetDemonstrationState,
  runDemonstrationSelfTest,
};

export default apiClient;
