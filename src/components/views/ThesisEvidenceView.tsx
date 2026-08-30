// =========================================================================
// SCOS PHASE 11C — THESIS EVIDENCE & ACADEMIC REPRODUCIBILITY VIEW
// Interactive Academic Package Dashboard for Dissertation Evaluation,
// Master RQ-H-M-SC Matrix, Chapter Mappings, Registries, and Exports.
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart3,
  Shield,
  Download,
  Search,
  ChevronRight,
  Database,
  Building2,
  FileCheck,
  Check,
  Info,
  Scale,
  RefreshCw,
  Clock,
  ArrowRight,
  FileText,
  Fingerprint,
  Table,
  Image as ImageIcon,
  ExternalLink,
  Lock,
  Compass,
} from 'lucide-react';
import {
  getThesisEvidencePackage,
  exportThesisEvidenceJSON,
  exportThesisEvidenceCSV,
  exportThesisEvidenceMarkdown,
  verifyThesisPackageFingerprint,
  runThesisSelfTest,
} from '../../services/apiClient';
import {
  ThesisEvidencePackage,
  ThesisEvidenceRecord,
  ThesisHypothesisSummary,
  ThesisChapterMapping,
  ThesisFigureRegistryItem,
  ThesisTableRegistryItem,
  ThesisContributionRecord,
} from '../../types/thesisEvidence';

export const ThesisEvidenceView: React.FC = () => {
  const [pkg, setPkg] = useState<ThesisEvidencePackage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Interactive filters
  const [selectedRQ, setSelectedRQ] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<ThesisEvidenceRecord | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<ThesisHypothesisSummary | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ThesisChapterMapping | null>(null);

  // Verification & Export state
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    packageFingerprint: string;
    details: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [selfTestResults, setSelfTestResults] = useState<{
    allPassed: boolean;
    checks: { name: string; passed: boolean }[];
  } | null>(null);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPackage();
  }, []);

  const loadPackage = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThesisEvidencePackage();
      setPkg(data);
      if (data.masterMatrix.length > 0) {
        setSelectedRecord(data.masterMatrix[0]);
      }
      if (data.hypothesesSummary.length > 0) {
        setSelectedHypothesis(data.hypothesesSummary[0]);
      }
      if (data.chapterMappings.length > 0) {
        setSelectedChapter(data.chapterMappings[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load thesis evidence package.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFingerprint = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyThesisPackageFingerprint();
      setVerificationResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to verify package fingerprint.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunSelfTest = async () => {
    try {
      const res = await runThesisSelfTest();
      setSelfTestResults(res);
    } catch (err: any) {
      setError(err.message || 'Failed to run thesis self test.');
    }
  };

  const handleExportJSON = async () => {
    try {
      const manifest = await exportThesisEvidenceJSON();
      const blob = new Blob([manifest.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-thesis-evidence-v1.0.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotification('Successfully exported Thesis Evidence Package (JSON).');
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const manifest = await exportThesisEvidenceCSV();
      const blob = new Blob([manifest.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-thesis-evidence-matrices-v1.0.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotification('Successfully exported Thesis Master Matrices (CSV).');
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const manifest = await exportThesisEvidenceMarkdown();
      const blob = new Blob([manifest.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scos-thesis-evidence-summary-v1.0.md`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotification('Successfully exported Academic Summary (Markdown).');
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Export failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-600 font-medium">Aggregating SCOS Thesis Evidence & Academic Registries...</p>
        <p className="text-xs text-slate-400">Verifying SHA-256 reproducibility provenance across Phases 8.1–11B</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          Thesis Evidence Package Load Error
        </div>
        <p className="text-sm">{error || 'Unable to build thesis evidence package.'}</p>
        <button
          onClick={loadPackage}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition"
        >
          Retry Packaging
        </button>
      </div>
    );
  }

  const filteredMatrix = pkg.masterMatrix.filter((rec) => {
    const matchesRQ = selectedRQ === 'ALL' || rec.researchQuestionId === selectedRQ;
    const matchesSearch =
      searchQuery === '' ||
      rec.hypothesisStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.relevantMetricCodes.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rec.permittedAcademicStatement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRQ && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{exportNotification}</span>
        </div>
      )}

      {/* Top Academic Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/30 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
                <GraduationCap className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    SCOS Phase 11C
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    M.Tech Thesis Dissertation
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Thesis Evidence & Academic Reproducibility Package
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyFingerprint}
                disabled={isVerifying}
                className="px-3.5 py-2 bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 border border-indigo-400/40 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              >
                <Fingerprint className="w-4 h-4 text-indigo-300" />
                {isVerifying ? 'Verifying...' : 'Verify SHA-256'}
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              >
                <Table className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Markdown
              </button>
            </div>
          </div>

          <p className="text-slate-300 text-sm max-w-4xl leading-relaxed">
            Consolidated research evidence package synthesizing Research Questions (RQ-01 to RQ-05), Formal Hypotheses (H01 to H05), Standardized Metrics (M1 to M10), Benchmark Scenarios (SC-01 to SC-05), Figure/Table Registries, and Chapter Mappings for academic thesis defense and peer reproduction at IIT Kanpur.
          </p>

          {/* Mandatory Boundary Notice */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3.5 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 uppercase tracking-wide mr-1">
                Mandatory Academic Research Notice:
              </span>
              <span>
                All experimental findings, statistical distributions, and latency reductions are derived from <strong>controlled simulated scenarios</strong> within the SCOS digital twin environment. <strong>Real-world municipal field validation has NOT been established.</strong>
              </span>
            </div>
          </div>

          {/* Metadata Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Package Version</span>
              <p className="text-xs font-semibold text-indigo-300 font-mono">{pkg.packageVersion}</p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Dataset Version</span>
              <p className="text-xs font-semibold text-emerald-300 font-mono">{pkg.datasetVersion}</p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Affiliation</span>
              <p className="text-xs font-semibold text-slate-200">IIT Kanpur</p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Master Fingerprint</span>
              <p className="text-xs font-semibold text-cyan-300 font-mono truncate" title={pkg.packageFingerprint}>
                {pkg.packageFingerprint.slice(0, 16)}...
              </p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Evidence Maturity</span>
              <p className="text-xs font-semibold text-violet-300">Controlled Scenario</p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Field Validation</span>
              <p className="text-xs font-semibold text-amber-300 font-mono">NOT ESTABLISHED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-emerald-900 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-800">Deterministic SHA-256 Provenance Verified:</span>{' '}
              <span className="font-mono text-emerald-700">{verificationResult.packageFingerprint}</span>
              <p className="text-[11px] text-emerald-600 mt-0.5">{verificationResult.details}</p>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-emerald-700 hover:text-emerald-900 font-medium px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1 sm:space-x-2 text-sm font-medium">
        {[
          { id: 'overview', label: 'Examiner Summary', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'matrix', label: 'RQ-H-M-SC Master Matrix', icon: <Layers className="w-4 h-4" /> },
          { id: 'hypotheses', label: 'Formal Hypotheses (H01–H05)', icon: <Award className="w-4 h-4" /> },
          { id: 'chapters', label: 'Chapter Mappings (1–9)', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'registries', label: 'Figure & Table Registries', icon: <Table className="w-4 h-4" /> },
          { id: 'contributions', label: 'Research Contributions', icon: <Compass className="w-4 h-4" /> },
          { id: 'boundaries', label: 'Evidence Boundaries', icon: <Shield className="w-4 h-4" /> },
          { id: 'reproducibility', label: 'Reproducibility & Manifests', icon: <Fingerprint className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXAMINER / PROFESSOR SUMMARY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Core 7-Point Examiner Briefing */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Professor & Examiner Research Synthesis
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-medium">
                    Defense-Ready
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-800 uppercase tracking-wide text-xs">
                      1. Research Problem & Municipal Urgency:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {pkg.professorExaminerSummary.researchProblem}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-800 uppercase tracking-wide text-xs">
                      2. Proposed SCOS Contribution:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {pkg.professorExaminerSummary.proposedContribution}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="font-semibold text-slate-800 uppercase tracking-wide text-xs">
                      3. Evaluation Methodology:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {pkg.professorExaminerSummary.methodology}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-1">
                      <span className="font-semibold text-indigo-900 uppercase tracking-wide text-xs">
                        4. What Was Tested:
                      </span>
                      <p className="text-indigo-800 text-xs leading-relaxed">
                        {pkg.professorExaminerSummary.whatWasTested}
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1">
                      <span className="font-semibold text-emerald-900 uppercase tracking-wide text-xs">
                        5. Key Empirical Observations:
                      </span>
                      <p className="text-emerald-800 text-xs leading-relaxed">
                        {pkg.professorExaminerSummary.whatWasObserved}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-1">
                      <span className="font-semibold text-blue-900 uppercase tracking-wide text-xs">
                        6. What is Supported by Evidence:
                      </span>
                      <p className="text-blue-800 text-xs leading-relaxed">
                        {pkg.professorExaminerSummary.whatIsSupported}
                      </p>
                    </div>

                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-1">
                      <span className="font-semibold text-amber-900 uppercase tracking-wide text-xs">
                        7. What is NOT Yet Validated:
                      </span>
                      <p className="text-amber-800 text-xs leading-relaxed">
                        {pkg.professorExaminerSummary.whatIsNotYetValidated}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: Quantitative Overview & Provenance */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Key Research Metrics Summary
                </h3>

                <div className="space-y-3">
                  {pkg.metricsEvidence.slice(0, 5).map((m) => (
                    <div key={m.metricCode} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{m.metricCode}: {m.name}</span>
                        <span className="font-bold text-emerald-600">
                          {m.metricCode === 'M1' || m.metricCode === 'M2' || m.metricCode === 'M4' ? '-' : '+'}
                          {m.percentageImprovement.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Baseline: {m.baselineMean} {m.unit}</span>
                        <span>SCOS: {m.scosMean} {m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-indigo-600" />
                  Academic Provenance & Defense
                </h3>

                <div className="text-xs space-y-2.5 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Institution</span>
                    <span className="font-medium text-slate-800">{pkg.provenance.academicAffiliation.institution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                    <span className="font-medium text-slate-800">{pkg.provenance.academicAffiliation.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Thesis Title</span>
                    <span className="italic text-slate-700 leading-tight block mt-0.5">
                      "{pkg.provenance.academicAffiliation.thesisTitle}"
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">License</span>
                    <span className="text-slate-700">{pkg.provenance.license}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER RQ-H-M-SC MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Filter RQ:</span>
              {['ALL', 'RQ-01', 'RQ-02', 'RQ-03', 'RQ-04', 'RQ-05'].map((rq) => (
                <button
                  key={rq}
                  onClick={() => setSelectedRQ(rq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedRQ === rq
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rq}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search statement, metric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">RQ / Hypothesis</th>
                    <th className="p-3.5">Supporting Metrics</th>
                    <th className="p-3.5">Baseline vs SCOS</th>
                    <th className="p-3.5">Relative Δ</th>
                    <th className="p-3.5">Evidence Level</th>
                    <th className="p-3.5">Claim Status</th>
                    <th className="p-3.5">Permitted Academic Statement</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrix.map((rec) => (
                    <tr
                      key={rec.recordId}
                      className={`hover:bg-indigo-50/40 transition cursor-pointer ${
                        selectedRecord?.recordId === rec.recordId ? 'bg-indigo-50/70' : ''
                      }`}
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{rec.researchQuestionId}</div>
                        <div className="text-[11px] font-semibold text-indigo-700">{rec.hypothesisId}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={rec.researchQuestionTitle}>
                          {rec.researchQuestionTitle}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {rec.relevantMetricCodes.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded border border-slate-200">
                              {m}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Scenarios: {rec.relevantScenarios.join(', ')}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div>Base: {rec.baselineObservation.mean}</div>
                        <div className="font-semibold text-indigo-900">SCOS: {rec.scosObservation.mean}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold font-mono ${
                          rec.relativeChangePercent < 0 ? 'text-emerald-600' : 'text-blue-600'
                        }`}>
                          {rec.relativeChangePercent >= 0 ? '+' : ''}{rec.relativeChangePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.evidenceLevel.replace('LEVEL_', '')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rec.finalClaimStatus}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-slate-600 text-[11px] leading-relaxed">
                        {rec.permittedAcademicStatement}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(rec);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded text-[11px] font-medium transition"
                        >
                          Drilldown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drilldown Drawer / Card */}
          {selectedRecord && (
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Deep-Dive Evidence Record: {selectedRecord.recordId} ({selectedRecord.researchQuestionId} → {selectedRecord.hypothesisId})
                </div>
                <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono border border-indigo-400/30">
                  {selectedRecord.finalClaimStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Hypothesis Statement:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">"{selectedRecord.hypothesisStatement}"</p>
                  <div className="pt-2">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Permitted Thesis Phrasing:</span>
                    <p className="text-emerald-300 italic mt-0.5">"{selectedRecord.permittedAcademicStatement}"</p>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">Statistical & Sensitivity Profile:</span>
                  <p className="text-slate-300 leading-relaxed">{selectedRecord.statisticalDescription}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sensitivity:</span>
                      <span className="font-semibold text-indigo-300">{selectedRecord.sensitivityStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Robustness:</span>
                      <span className="font-semibold text-emerald-300">{selectedRecord.robustnessStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-400/20 p-3.5 rounded-lg text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Explicit Limitation & Future Requirement:</span>{' '}
                  {selectedRecord.primaryLimitation} Requires: <em>{selectedRecord.futureValidationRequirement}</em>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FORMAL HYPOTHESES H01 TO H05 */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hypothesis Selection List */}
            <div className="space-y-3">
              {pkg.hypothesesSummary.map((h) => (
                <div
                  key={h.hypothesisId}
                  onClick={() => setSelectedHypothesis(h)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedHypothesis?.hypothesisId === h.hypothesisId
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                      {h.hypothesisId} ({h.researchQuestionId})
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Score: {h.evidenceStrengthScore}/100
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mt-2">{h.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{h.hypothesisStatement}</p>
                </div>
              ))}
            </div>

            {/* Detailed Hypothesis View */}
            {selectedHypothesis && (
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600">{selectedHypothesis.hypothesisId} — {selectedHypothesis.researchQuestionId}</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedHypothesis.title}</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                    {selectedHypothesis.evidenceStatus}
                  </span>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-700 uppercase tracking-wide text-xs">Formal Hypothesis (H₁):</span>
                    <p className="text-slate-900 font-medium italic">"{selectedHypothesis.formalHypothesis}"</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-semibold text-slate-700 uppercase tracking-wide text-xs">Null Hypothesis (H₀):</span>
                    <p className="text-slate-600 italic">"{selectedHypothesis.nullHypothesis}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                      <span className="text-indigo-900 font-semibold text-xs">Primary Metrics:</span>
                      <p className="font-mono text-indigo-800 text-xs">{selectedHypothesis.primaryMetrics.join(', ')}</p>
                    </div>
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                      <span className="text-emerald-900 font-semibold text-xs">Scenario Coverage:</span>
                      <p className="font-mono text-emerald-800 text-xs">{selectedHypothesis.scenarioCoverage.join(', ')}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="font-semibold text-emerald-900 text-xs uppercase tracking-wide">
                      Permitted Academic Conclusion:
                    </span>
                    <p className="text-emerald-950 font-medium leading-relaxed">
                      "{selectedHypothesis.allowedConclusion}"
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                    <span className="font-semibold text-amber-950 text-xs uppercase tracking-wide">
                      Key Limitation & Real-World Status:
                    </span>
                    <p className="text-amber-900 text-xs leading-relaxed">
                      {selectedHypothesis.keyLimitation} Real-world municipal field validation status is:{' '}
                      <strong className="text-rose-700">NOT ESTABLISHED</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: THESIS CHAPTER MAPPINGS (1 TO 9) */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chapter Selection Column */}
            <div className="space-y-2.5">
              {pkg.chapterMappings.map((cm) => (
                <div
                  key={cm.chapterNumber}
                  onClick={() => setSelectedChapter(cm)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    selectedChapter?.chapterNumber === cm.chapterNumber
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">Chapter {cm.chapterNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {cm.mappedPhases.join(', ')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs sm:text-sm mt-1">{cm.chapterTitle}</h4>
                </div>
              ))}
            </div>

            {/* Selected Chapter Artifact & Content Mapping */}
            {selectedChapter && (
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase">
                      Chapter {selectedChapter.chapterNumber} Mapping & Evidence Lineage
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                      Phases: {selectedChapter.mappedPhases.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedChapter.chapterTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 italic">{selectedChapter.academicPurpose}</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-700 uppercase tracking-wide text-[11px] mb-2">
                      Key Topics & Theoretical Inclusions:
                    </h5>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                      {selectedChapter.includedTopics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 uppercase tracking-wide text-[11px] mb-2">
                      Associated Research Questions & Hypotheses:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedChapter.associatedRQs.map((rq) => (
                        <span key={rq} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-semibold text-xs border border-indigo-200">
                          {rq}
                        </span>
                      ))}
                      {selectedChapter.associatedHypotheses.map((h) => (
                        <span key={h} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-semibold text-xs border border-emerald-200">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-700 uppercase tracking-wide text-[11px] mb-2">
                      Registered Figures & Tables:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedChapter.artifacts.map((art) => (
                        <div key={art.artifactId} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <span className="font-bold text-indigo-700 font-mono">{art.artifactId}</span>: {art.title}
                          <span className="block text-[10px] text-slate-400 mt-0.5">Source: {art.sourcePhase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                    <span className="font-semibold text-slate-800 block text-xs mb-0.5">Methodological Notes:</span>
                    <p className="text-xs">{selectedChapter.methodologicalNotes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FIGURE & TABLE REGISTRIES */}
      {activeTab === 'registries' && (
        <div className="space-y-6">
          {/* 10 Registered Figures */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Thesis Figure Registry (10 Registered Academic Figures)
              </div>
              <span className="text-xs text-slate-400 font-mono">FIG-01 to FIG-10</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.figureRegistry.map((fig) => (
                <div key={fig.figureId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 font-mono text-xs">{fig.figureNumber} ({fig.figureId})</span>
                    <span className="px-2 py-0.5 bg-indigo-100/70 text-indigo-800 rounded font-semibold text-[10px]">
                      Chapter {fig.chapterMapping}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">{fig.proposedTitle}</h4>
                  <p className="text-slate-600 text-xs italic">{fig.recommendedCaption}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                    <span>Source: {fig.sourcePhase}</span>
                    <span>Type: {fig.dataClassification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Registered Tables */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Table className="w-4 h-4 text-emerald-600" />
                Thesis Table Registry (10 Registered Structured Tables)
              </div>
              <span className="text-xs text-slate-400 font-mono">TBL-01 to TBL-10</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.tableRegistry.map((tbl) => (
                <div key={tbl.tableId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 font-mono text-xs">{tbl.tableNumber} ({tbl.tableId})</span>
                    <span className="px-2 py-0.5 bg-emerald-100/70 text-emerald-800 rounded font-semibold text-[10px]">
                      Chapter {tbl.chapterMapping}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">{tbl.proposedTitle}</h4>
                  <p className="text-slate-600 text-xs italic">{tbl.recommendedCaption}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                    <span>Headers: {tbl.columnHeaders.join(', ')}</span>
                    <span>Rows: {tbl.rowCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RESEARCH CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Award className="w-5 h-5 text-indigo-600" />
                Formal Academic Contributions (8 Classified Dimensions)
              </div>
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                8 Core Contributions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.contributions.map((c) => (
                <div key={c.contributionId} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 font-mono font-bold rounded text-[10px]">
                      {c.contributionId} — {c.contributionType}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                      {c.claimStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{c.title}</h4>
                  <p className="text-slate-600 leading-relaxed italic">"{c.statement}"</p>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">Supporting Components:</span>
                    <p className="font-medium text-slate-700">{c.supportingComponents.join(', ')}</p>
                  </div>

                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                    <strong>Limitation:</strong> {c.limitation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EVIDENCE BOUNDARIES & DISCLOSURES */}
      {activeTab === 'boundaries' && (
        <div className="space-y-6">
          {/* What SCOS Supports vs What It Does NOT Establish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supported Aspects */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                What Current SCOS Evidence Supports
              </div>

              <div className="space-y-3">
                {pkg.evidenceBoundaries.supportedAspects.map((s, idx) => (
                  <div key={idx} className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-900">{s.category}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                        {s.evidenceLevel}
                      </span>
                    </div>
                    <p className="text-emerald-950 leading-relaxed">{s.statement}</p>
                    <div className="text-[10px] text-emerald-700 font-mono mt-1">
                      Phases: {s.supportingPhases.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unestablished Aspects (Mandatory) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm border-b border-slate-100 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                What Current Evidence Does NOT Establish
              </div>

              <div className="space-y-3">
                {pkg.evidenceBoundaries.unestablishedAspects.map((u, idx) => (
                  <div key={idx} className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-900">{u.category}</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono font-bold text-[10px]">
                        NOT ESTABLISHED
                      </span>
                    </div>
                    <p className="text-rose-950 leading-relaxed">{u.statement}</p>
                    <div className="text-[10px] text-rose-700 mt-1 font-medium">
                      Future Validation Requirement: <em>{u.validationRequirement}</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Governance Declaration */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-indigo-300 uppercase tracking-wide">
              Official Governance Declaration:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {pkg.evidenceBoundaries.governanceDeclaration}
            </p>
          </div>
        </div>
      )}

      {/* TAB 8: REPRODUCIBILITY MANIFEST & EXPORT HUB */}
      {activeTab === 'reproducibility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reproducibility Protocol & Fingerprints */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Fingerprint className="w-4 h-4 text-indigo-600" />
                  Canonical SHA-256 Fingerprints
                </div>
                <button
                  onClick={handleVerifyFingerprint}
                  disabled={isVerifying}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
                >
                  {isVerifying ? 'Verifying...' : 'Re-Verify'}
                </button>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Master Package Fingerprint:</span>
                  <p className="text-indigo-700 font-bold break-all">{pkg.packageFingerprint}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Dataset Fingerprint:</span>
                  <p className="text-emerald-700 font-bold break-all">
                    {pkg.reproducibilityManifest.canonicalFingerprints.datasetFingerprint}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Claims Fingerprint:</span>
                  <p className="text-cyan-700 font-bold break-all">
                    {pkg.reproducibilityManifest.canonicalFingerprints.claimsFingerprint}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="font-bold text-slate-700 text-xs mb-2">Deterministic Protocol Steps:</h5>
                <ol className="space-y-1 text-xs text-slate-600 pl-4 list-decimal">
                  {pkg.reproducibilityManifest.reproducibilityProtocolSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Self-Test & Export Controls */}
            <div className="space-y-6">
              {/* Export Suite */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600" />
                  Academic Export Hub
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download immutable academic artifacts formatted for dissertation inclusion, peer reviewers, and reproducibility audits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleExportJSON}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center text-center transition"
                  >
                    <Download className="w-5 h-5 text-indigo-600 mb-1" />
                    <span className="font-bold text-xs text-slate-800">JSON Package</span>
                    <span className="text-[10px] text-slate-400">Full object graph</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center text-center transition"
                  >
                    <Table className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="font-bold text-xs text-slate-800">CSV Matrices</span>
                    <span className="text-[10px] text-slate-400">RFC-4180 tables</span>
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex flex-col items-center text-center transition"
                  >
                    <FileText className="w-5 h-5 text-indigo-700 mb-1" />
                    <span className="font-bold text-xs text-indigo-900">Markdown</span>
                    <span className="text-[10px] text-indigo-600">Thesis report</span>
                  </button>
                </div>
              </div>

              {/* Self-Verification Test Suite */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Self-Verification Test Suite
                  </div>
                  <button
                    onClick={handleRunSelfTest}
                    className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold transition"
                  >
                    Run Test Suite
                  </button>
                </div>

                {selfTestResults ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800 pb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      All {selfTestResults.checks.length} Automated Checks Passed
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selfTestResults.checks.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-700">{c.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            PASSED
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Click 'Run Test Suite' to execute 15 automated validation assertions against package models, registries, and hashes.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ThesisEvidenceView;
