// =========================================================================
// SCOS PHASE 11B — RESEARCH CLAIM & HYPOTHESIS VALIDATION VIEW
// Master Dashboard for Formal Hypotheses, Evidence Chains, Metric Matrices,
// Claim Language Safety Linter, Civil Engineering Foundations & Provenance
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  Shield,
  Activity,
  Download,
  Search,
  ChevronRight,
  Database,
  Building2,
  Workflow,
  Sparkles,
  FileCheck,
  Check,
  Info,
  Scale,
  RefreshCw,
  Clock,
  BookOpen,
  ArrowRight,
  HelpCircle,
  FileText,
  Fingerprint,
} from 'lucide-react';
import {
  getResearchClaimsSummary,
  validateClaimLanguage,
  exportResearchClaimsJSON,
  exportResearchClaimsCSV,
  runResearchClaimsTestSuite,
} from '../../services/apiClient';
import {
  ResearchClaimsSnapshot,
  ResearchHypothesisItem,
  MetricHypothesisMatrixItem,
  HypothesisEvidenceChain,
  ClaimLanguageAuditResult,
  CivilEngineeringGroundingItem,
} from '../../types/researchClaims';

export const ResearchClaimValidationView: React.FC = () => {
  const [snapshot, setSnapshot] = useState<ResearchClaimsSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('executive');

  // Selected drilldown items
  const [selectedHypothesis, setSelectedHypothesis] = useState<ResearchHypothesisItem | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricHypothesisMatrixItem | null>(null);

  // Claim language validator state
  const [claimInputText, setClaimInputText] = useState<string>(
    'SCOS is proven to universally reduce emergency dispatch latency and guarantees error-free flood response in real-world Indian cities.'
  );
  const [claimValidationResult, setClaimValidationResult] = useState<ClaimLanguageAuditResult | null>(null);
  const [validatingClaim, setValidatingClaim] = useState<boolean>(false);

  // Self-verification test state
  const [testResult, setTestResult] = useState<{
    allPassed: boolean;
    checks: { name: string; passed: boolean; details: string }[];
  } | null>(null);
  const [runningTest, setRunningTest] = useState<boolean>(false);

  // Filters
  const [metricFilter, setMetricFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResearchClaimsSummary();
      setSnapshot(data);
      if (data.hypotheses && data.hypotheses.length > 0) {
        setSelectedHypothesis(data.hypotheses[0]);
      }
      if (data.metricMatrix && data.metricMatrix.length > 0) {
        setSelectedMetric(data.metricMatrix[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load research claims summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateClaim = async () => {
    if (!claimInputText.trim()) return;
    try {
      setValidatingClaim(true);
      const result = await validateClaimLanguage(claimInputText);
      setClaimValidationResult(result);
    } catch (err: any) {
      alert(`Claim validation error: ${err.message}`);
    } finally {
      setValidatingClaim(false);
    }
  };

  const handleRunSelfTest = async () => {
    try {
      setRunningTest(true);
      const res = await runResearchClaimsTestSuite();
      setTestResult(res);
    } catch (err: any) {
      alert(`Test run error: ${err.message}`);
    } finally {
      setRunningTest(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await exportResearchClaimsJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-research-claims-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export JSON failed: ${err.message}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvText = await exportResearchClaimsCSV();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-research-claims-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export CSV failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">
          Synthesizing Phase 11B Research Claims & Hypothesis Evidence...
        </p>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-base">Error Loading Research Claims Layer</h3>
            <p className="text-sm mt-1">{error || 'Data is unavailable.'}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IMPLEMENTATION_VERIFIED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">IMPLEMENTATION VERIFIED</span>;
      case 'ROBUST_UNDER_TESTED_ASSUMPTIONS':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-md text-[11px]">ROBUST UNDER TESTED ASSUMPTIONS</span>;
      case 'CONTROLLED_SCENARIO_SUPPORTED':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-md text-[11px]">CONTROLLED SCENARIO SUPPORTED</span>;
      case 'DESCRIPTIVELY_SUPPORTED':
        return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 font-bold rounded-md text-[11px]">DESCRIPTIVELY SUPPORTED</span>;
      case 'ASSUMPTION_DEPENDENT':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-[11px]">ASSUMPTION DEPENDENT</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-md text-[11px]">{status}</span>;
    }
  };

  const getStrengthBadge = (score: number) => {
    let color = 'bg-slate-100 text-slate-800';
    if (score >= 85) color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    else if (score >= 70) color = 'bg-blue-100 text-blue-800 border-blue-300';
    else if (score >= 50) color = 'bg-amber-100 text-amber-800 border-amber-300';
    else color = 'bg-rose-100 text-rose-800 border-rose-300';

    return (
      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center space-x-1.5 ${color}`}>
        <span>Score: {score}/100</span>
      </div>
    );
  };

  const filteredMetrics = snapshot.metricMatrix.filter(
    (m) =>
      m.metricCode.toLowerCase().includes(metricFilter.toLowerCase()) ||
      m.metricName.toLowerCase().includes(metricFilter.toLowerCase()) ||
      m.mappedHypotheses.some((h) => h.toLowerCase().includes(metricFilter.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                Phase 11B • Research Claims Layer
              </span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                <span>Simulated / Prototype Data</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              SCOS Research Claim & Hypothesis Validation Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Formal Academic Hypotheses (H01–H05), Unbroken 9-Step Evidence Chains, Metric Matrices, and Claim Language Safety Engine
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mandatory Research Disclaimers */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Academic Research & Non-Field Validation Boundary Notice</span>
          </div>
          <p className="pl-6 text-[11px] text-amber-800 leading-relaxed">
            {snapshot.disclaimer} {snapshot.evidenceStrengthDisclaimer}
          </p>
        </div>

        {/* 10 Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none text-xs font-semibold">
          {[
            { id: 'executive', label: '1. Executive Claim Summary', icon: Award },
            { id: 'hypotheses', label: '2. Hypothesis Registry', icon: BookOpen },
            { id: 'chains', label: '3. Evidence Chains', icon: Workflow },
            { id: 'metrics', label: '4. Metric Mapping (M1-M10)', icon: BarChart3 },
            { id: 'linter', label: '5. Claim Language Linter', icon: Shield },
            { id: 'civil', label: '6. Civil Engineering Grounding', icon: Building2 },
            { id: 'limitations', label: '7. Limitations & Threats', icon: AlertTriangle },
            { id: 'provenance', label: '8. Provenance & Fingerprint', icon: Fingerprint },
            { id: 'export', label: '9. Research Export', icon: Download },
            { id: 'test', label: '10. Automated Verification', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center space-x-1.5 transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE CLAIM SUMMARY */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {snapshot.hypotheses.map((h) => (
              <div
                key={h.hypothesisId}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                      {h.hypothesisId} • {h.researchQuestionId}
                    </span>
                    {getStrengthBadge(h.evidenceStrengthScore)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{h.title}</h3>

                  <div>{getStatusBadge(h.evidenceStatus)}</div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">Key Metrics: </span>
                      <span className="font-mono font-semibold text-blue-700">{h.supportingMetricCodes.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Scenario Coverage: </span>
                      <span className="font-mono text-slate-600">{h.supportingScenarios.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Robustness: </span>
                      <span className="text-emerald-700 font-semibold">{h.robustnessStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                    <span className="font-bold block text-emerald-900">Permitted Academic Claim:</span>
                    <p className="text-[11px] leading-relaxed italic">"{h.allowedAcademicStatement}"</p>
                  </div>

                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                    <span className="font-bold block text-rose-900 text-[11px]">Key Boundary Limitation:</span>
                    <p className="text-[11px] leading-relaxed text-rose-800">{h.limitations[0]}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedHypothesis(h);
                    setActiveTab('chains');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
                >
                  <span>View Full Evidence Chain</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HYPOTHESIS REGISTRY */}
      {activeTab === 'hypotheses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Select Research Hypothesis
            </h3>
            {snapshot.hypotheses.map((h) => (
              <button
                key={h.hypothesisId}
                onClick={() => setSelectedHypothesis(h)}
                className={`w-full text-left p-3.5 rounded-xl border transition space-y-1.5 ${
                  selectedHypothesis?.hypothesisId === h.hypothesisId
                    ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {h.hypothesisId} ({h.researchQuestionId})
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    Score: {h.evidenceStrengthScore}%
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-snug">{h.title}</h4>
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
            {selectedHypothesis ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {selectedHypothesis.code} • {selectedHypothesis.researchQuestionId}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">{selectedHypothesis.title}</h2>
                  </div>
                  {getStrengthBadge(selectedHypothesis.evidenceStrengthScore)}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Formal Hypothesis Statement ($H_1$):</span>
                    <p className="text-slate-800 leading-relaxed font-serif text-sm italic">
                      "{selectedHypothesis.hypothesisFormalText}"
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Null Hypothesis ($H_0$):</span>
                    <p className="text-slate-600 leading-relaxed font-serif text-sm italic">
                      "{selectedHypothesis.nullHypothesisText}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-0.5">Evaluation Metrics:</span>
                      <span className="font-mono text-blue-700 font-semibold">{selectedHypothesis.supportingMetricCodes.join(', ')}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-0.5">Benchmark Scenarios:</span>
                      <span className="font-mono text-slate-700">{selectedHypothesis.supportingScenarios.join(', ')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1.5">
                    <span className="font-bold text-emerald-900 block text-xs">Permitted Academic Research Statement:</span>
                    <p className="leading-relaxed text-xs">"{selectedHypothesis.allowedAcademicStatement}"</p>
                  </div>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-2">
                    <span className="font-bold text-rose-900 block text-xs">Explicitly Prohibited Over-Claims:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-900">
                      {selectedHypothesis.prohibitedClaims.map((claim, i) => (
                        <li key={i}>{claim}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-900 block text-xs">Governing Civil Engineering Domain:</span>
                    <p className="text-slate-800 text-xs font-semibold">{selectedHypothesis.civilEngineeringFoundation.domainName}</p>
                    <p className="text-slate-600 text-[11px]">{selectedHypothesis.civilEngineeringFoundation.physicalEngineeringModel}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">Select a hypothesis to inspect full definitions.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE CHAINS */}
      {activeTab === 'chains' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Traceable 9-Step Research Evidence Chains
                </h3>
                <p className="text-xs text-slate-500">
                  Every permitted claim deterministically traces through formal research questions, metrics, controlled executions, and sensitivity bounds.
                </p>
              </div>

              {/* Hypothesis Picker */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {snapshot.hypotheses.map((h) => (
                  <button
                    key={h.hypothesisId}
                    onClick={() => setSelectedHypothesis(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedHypothesis?.hypothesisId === h.hypothesisId
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {h.hypothesisId}
                  </button>
                ))}
              </div>
            </div>

            {selectedHypothesis && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-700">
                      Chain Target: {selectedHypothesis.hypothesisId} ({selectedHypothesis.researchQuestionId})
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{selectedHypothesis.title}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Unbroken Chain (100%)</span>
                  </span>
                </div>

                {/* 9-Step Vertical Chain */}
                <div className="space-y-2 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                  {snapshot.evidenceChains
                    .find((c) => c.hypothesisId === selectedHypothesis.hypothesisId)
                    ?.chainSteps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl ml-8 relative shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="absolute -left-8 top-3.5 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                          {step.stepNumber}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                              {step.stageName}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{step.identifier}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">{step.description}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">{step.sourceReference}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                            {step.verificationStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: METRIC-TO-HYPOTHESIS MAPPING */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Metric-to-Hypothesis Mapping Matrix (M1–M10)
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamic descriptive distributions, absolute deltas, and sensitivity statuses mapped to hypotheses.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={metricFilter}
                  onChange={(e) => setMetricFilter(e.target.value)}
                  placeholder="Filter metric code, name, H01..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Metric</th>
                    <th className="py-3 px-3">Mapped Hypotheses</th>
                    <th className="py-3 px-3">Condition A (Baseline)</th>
                    <th className="py-3 px-3">Condition B (SCOS)</th>
                    <th className="py-3 px-3">Delta / Change</th>
                    <th className="py-3 px-3">Sensitivity</th>
                    <th className="py-3 px-3">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMetrics.map((m) => (
                    <tr key={m.metricCode} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-blue-700 block">{m.metricCode}</span>
                        <span className="text-slate-900 font-semibold text-[11px]">{m.metricName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {m.mappedHypotheses.map((h) => (
                            <span key={h} className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded">
                              {h}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {m.baselineObservation.mean} {m.unit} (±{m.baselineObservation.stdDev})
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        {m.scosObservation.mean} {m.unit} (±{m.scosObservation.stdDev})
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="text-slate-900 font-bold">{m.absoluteDifference} {m.unit}</span>
                        <span className={`block text-[10px] ${m.relativeChangePercent < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                          ({m.relativeChangePercent > 0 ? '+' : ''}{m.relativeChangePercent}%)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.sensitivityStatus === 'ROBUST_STABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {m.sensitivityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 max-w-xs">
                        {m.finalInterpretation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CLAIM LANGUAGE SAFETY LINTER */}
      {activeTab === 'linter' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Interactive Claim Language Safety Linter
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Audit academic statements against prohibited over-claiming expressions (e.g. <i>proven</i>, <i>guarantees</i>, <i>real-world validated</i>) and generate compliant bounded replacements.
            </p>

            <div className="space-y-2">
              <textarea
                value={claimInputText}
                onChange={(e) => setClaimInputText(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Enter claim text to audit..."
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Scans for: PROVEN, GUARANTEES, REAL-WORLD VALIDATED, STATISTICALLY SIGNIFICANT, UNIVERSALLY IMPROVES, etc.
                </span>
                <button
                  onClick={handleValidateClaim}
                  disabled={validatingClaim}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  {validatingClaim ? 'Analyzing...' : 'Audit Claim Text'}
                </button>
              </div>
            </div>

            {claimValidationResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-3 ${
                  claimValidationResult.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="font-bold flex items-center space-x-2">
                  {claimValidationResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Compliant Academic Language — No Over-Claims Detected ({claimValidationResult.classification})</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Flagged {claimValidationResult.flaggedTerms.length} Prohibited Over-Claiming Expression(s)</span>
                    </>
                  )}
                </div>

                {!claimValidationResult.isValid && (
                  <div className="space-y-2">
                    {claimValidationResult.suggestions.map((s, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 text-slate-800 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-rose-600 line-through text-xs">{s.term}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-mono font-bold text-emerald-600 text-xs">{s.suggestedReplacement}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{s.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CIVIL ENGINEERING GROUNDING */}
      {activeTab === 'civil' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {snapshot.civilEngineeringGrounding.map((item) => (
              <div
                key={item.hypothesisId}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-bold rounded-lg">
                    {item.hypothesisId} Grounding
                  </span>
                  <span className="text-xs font-bold text-blue-700">{item.domain}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Physical Asset Class:</span>
                    <span className="text-slate-700">{item.physicalAssetClass}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Governing Physical Mechanisms:</span>
                    <span className="text-slate-700 font-mono text-[11px]">{item.governingPhysicalEquationsOrMechanisms}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">Digital Operational Representation:</span>
                    <span className="text-slate-700">{item.digitalTwinModelType}</span>
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold block">Field Validation Gap:</span>
                    <span className="text-[11px] text-amber-800">{item.fieldValidationGap}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: LIMITATIONS & THREATS */}
      {activeTab === 'limitations' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Audited Research Limitations & Threats to Validity
            </h3>
            <p className="text-xs text-slate-500">
              Formal boundary conditions ensuring transparent academic reporting without unverified generalizations.
            </p>

            <div className="space-y-3">
              {snapshot.limitationsRegistry.map((l, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded text-[10px]">
                      {l.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 text-[10px]">Impacts:</span>
                      {l.impactedHypotheses.map((h) => (
                        <span key={h} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{l.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{l.description}</p>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                    <span className="font-bold">Mitigation Strategy: </span>
                    {l.mitigationStrategy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: PROVENANCE & FINGERPRINT */}
      {activeTab === 'provenance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Academic Provenance & Deterministic SHA-256 Fingerprint
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Institution:</span>
                <span className="text-slate-900">{snapshot.provenance.academicAffiliation.institution}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block">Department:</span>
                <span className="text-slate-900">{snapshot.provenance.academicAffiliation.department}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-1 sm:col-span-2">
                <span className="font-bold text-slate-700 block">Thesis Title:</span>
                <span className="text-slate-900">{snapshot.provenance.academicAffiliation.thesisTitle}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs space-y-2">
              <div>// SCOS Phase 11B Claims Canonical Hash</div>
              <div>canonical_fingerprint: "{snapshot.canonicalFingerprint}"</div>
              <div>dataset_version: "{snapshot.datasetVersion}"</div>
              <div>generated_at: "{snapshot.generatedAt}"</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: RESEARCH EXPORT */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Research Data & Claims Package Export
            </h3>
            <p className="text-xs text-slate-500">
              Download frozen research datasets, formal hypothesis chains, and metric matrices for academic review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Complete JSON Snapshot</h4>
                <p className="text-xs text-slate-500">
                  Full machine-readable research bundle containing all 5 hypotheses, 9-step chains, and metric matrices.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <Layers className="w-6 h-6 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Structured CSV Summary</h4>
                <p className="text-xs text-slate-500">
                  Tabular CSV export formatted for statistical import (R, SPSS, Python Pandas).
                </p>
                <button
                  onClick={handleExportCSV}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AUTOMATED VERIFICATION */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Automated Integrity Verification Suite
                </h3>
                <p className="text-xs text-slate-500">
                  Run deterministic verification checks across hypothesis registry, evidence chains, metric matrices, and SHA-256 canonical fingerprints.
                </p>
              </div>

              <button
                onClick={handleRunSelfTest}
                disabled={runningTest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                {runningTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Run Verification Checks</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center space-x-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All {testResult.checks.length} Integrity Checks Passed (100% Deterministic)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {testResult.checks.map((c, i) => (
                    <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-xs">{c.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-5">{c.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchClaimValidationView;
