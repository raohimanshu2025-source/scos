// =========================================================================
// SCOS PHASE 10D — RESEARCH RESULTS & EVIDENCE SYNTHESIS VIEW
// Interactive Evidence Matrix, Research Question Findings, and Benchmark Scenarios
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Zap,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResearchEvidenceSummary,
  ResearchQuestionDefinition,
  ScenarioEvidenceResult,
  ResearchQuestionId,
} from '../../types/researchEvidence';
import { researchEvidenceService } from '../../services/researchEvidenceService';

export const ResearchEvidenceView: React.FC = () => {
  const [summary, setSummary] = useState<ResearchEvidenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rqs' | 'scenarios' | 'taxonomy'>('rqs');
  const [selectedRQ, setSelectedRQ] = useState<ResearchQuestionId>('RQ-01');

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = () => {
    setLoading(true);
    try {
      const data = researchEvidenceService.getEvidenceSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load research evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos_research_evidence_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = researchEvidenceService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos_research_evidence_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading SCOS Research Evidence & Results...</p>
        </div>
      </div>
    );
  }

  const selectedQuestion = summary.researchQuestions.find((q) => q.rqId === selectedRQ) || summary.researchQuestions[0];

  return (
    <div id="research-evidence-root" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div id="evidence-header" className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                SCOS PHASE 10D
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-md">
                EMPIRICAL EVIDENCE & RESULTS SYNTHESIS
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                IIT KANPUR M.TECH THESIS
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Award className="w-7 h-7 text-emerald-400" />
              Research Evidence & Results Synthesis Layer
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl">
              Synthesized empirical conclusions, comparative hypothesis tests, and descriptive statistical findings for Research
              Questions RQ-01 through RQ-05 across paired experimental trials on Kanpur Municipal District benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="export-evidence-json-btn"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export JSON
            </button>
            <button
              id="export-evidence-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Latency Reduction</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.averageTimeReductionPercent}%</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Across 5 Benchmark Scenarios
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completeness Gain</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">+{summary.averageCompletenessGainPercent}%</p>
          <p className="mt-1 text-xs text-slate-500">Situational context accuracy</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Research Questions</span>
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">5 / 5 Supported</p>
          <p className="mt-1 text-xs text-slate-500">Hypotheses validated</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auditability Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">100%</p>
          <p className="mt-1 text-xs text-slate-500">Cryptographic tamper-evidence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-xs flex gap-1">
        <button
          onClick={() => setActiveTab('rqs')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'rqs'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          1. Research Questions Synthesis (RQ-01 to RQ-05)
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'scenarios'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          2. Benchmark Scenarios Comparative Evidence (SCN-01 to SCN-05)
        </button>

        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'taxonomy'
              ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          3. Evidence Strength & Governance Affirmation
        </button>
      </div>

      {/* TAB 1: RESEARCH QUESTIONS */}
      {activeTab === 'rqs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {summary.researchQuestions.map((rq) => (
                <button
                  key={rq.rqId}
                  onClick={() => setSelectedRQ(rq.rqId)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap ${
                    selectedRQ === rq.rqId
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {rq.rqId} — {rq.title}
                </button>
              ))}
            </div>

            {/* Selected RQ Card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700">{selectedQuestion.code}</span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedQuestion.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    +{selectedQuestion.percentageImprovement}% Advantage
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">
                    {selectedQuestion.significance}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Research Statement & Core Hypothesis:
                </span>
                <p className="text-sm text-slate-800 font-medium italic">"{selectedQuestion.statement}"</p>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900">Hypothesis:</span> {selectedQuestion.hypothesis}
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Synthesized Empirical Finding:
                </span>
                <p className="text-sm font-semibold text-slate-900">{selectedQuestion.synthesizedFinding}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700">Baseline Manual Practice:</span>
                  <p className="text-slate-600">{selectedQuestion.baselineSummary}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-emerald-800">Integrated SCOS Mechanism:</span>
                  <p className="text-slate-600">{selectedQuestion.scosSummary}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-200 text-slate-500">
                <span>
                  Primary Metrics: <span className="font-mono text-slate-800">{selectedQuestion.primaryMetrics.join(', ')}</span>
                </span>
                <span className="italic">{selectedQuestion.validityAffirmation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BENCHMARK SCENARIOS */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Benchmark Scenarios Paired Comparative Results (5 Scenarios)
            </h2>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Scenario ID</th>
                    <th className="p-3">Hazard Profile</th>
                    <th className="p-3">Manual Baseline (s)</th>
                    <th className="p-3">SCOS Response (s)</th>
                    <th className="p-3">Time Reduction</th>
                    <th className="p-3">Context Completeness</th>
                    <th className="p-3">Key Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.scenarioResults.map((s) => (
                    <tr key={s.scenarioId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold font-mono text-slate-900">
                        {s.scenarioId}
                        <div className="text-[11px] font-normal text-slate-600">{s.scenarioName}</div>
                      </td>
                      <td className="p-3 text-slate-700">{s.hazardType}</td>
                      <td className="p-3 font-mono text-slate-600">{s.baselineDurationSeconds}s</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{s.scosDurationSeconds}s</td>
                      <td className="p-3 font-bold">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          -{s.timeReductionPercent}%
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        {s.baselineCompleteness}% → <span className="font-bold text-blue-700">{s.scosCompleteness}%</span>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] max-w-xs">{s.keyObservation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TAXONOMY & GOVERNANCE */}
      {activeTab === 'taxonomy' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            Evidence Strength Taxonomy & Governance Notice
          </h2>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs text-slate-700">
            <span className="font-bold text-slate-900 uppercase tracking-wider block">Governance Notice & Disclaimer:</span>
            <p className="leading-relaxed">{summary.governanceNotice}</p>
            <p className="font-mono text-slate-500 text-[11px]">Deterministic Canonical SHA-256: {summary.canonicalHash}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/80 space-y-1.5">
              <span className="font-bold text-emerald-900">LEVEL D: Descriptive Experimental Evidence</span>
              <p className="text-slate-600">
                Derived from paired trials comparing traditional departmental silos with SCOS across M1–M10 metrics.
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/80 space-y-1.5">
              <span className="font-bold text-blue-900">LEVEL A: Implementation Verified</span>
              <p className="text-slate-600">
                Structural architectural barriers, RBAC middleware enforcement, and cryptographic audit hashing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
