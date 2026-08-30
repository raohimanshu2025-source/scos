// =========================================================================
// SCOS PHASE 10E — RESEARCH CONTRIBUTION & REFERENCE ARCHITECTURE VIEW
// Main User Interface for Research Problem Formulation, 9-Layer Architecture,
// Research Gap Matrix, Civil Engineering Contributions, RQ Traceability,
// Threats to Validity, Evidence Hierarchy & Automated Spec Verification.
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Award,
  BookOpen,
  FileCode,
  Download,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Compass,
  Building2,
  Cpu,
  Database,
  Search,
} from 'lucide-react';
import {
  ResearchContributionFramework,
  CivilEngineeringDomainItem,
  ThreatToValidityItem,
  EvidenceLevelDefinition,
  ResearchBlueprintStep,
} from '../../types/researchContribution';
import { ResearchQuestionId } from '../../types/researchEvidence';
import { researchFrameworkService } from '../../services/researchFrameworkService';
import { ArchitectureVisualizer } from './research/ArchitectureVisualizer';
import { FrameworkTestSuiteReport, runResearchFrameworkTestSuite } from '../../tests/researchFramework.spec';
import { useAuth } from '../../context/AuthContext';

export const ResearchFrameworkView: React.FC = () => {
  const { user } = useAuth();
  const [framework, setFramework] = useState<ResearchContributionFramework | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'architecture'
    | 'gaps'
    | 'civil_eng'
    | 'traceability'
    | 'threats'
    | 'evidence'
    | 'blueprint'
    | 'tests'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [testSuiteReport, setTestSuiteReport] = useState<FrameworkTestSuiteReport | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [selectedCivilDomain, setSelectedCivilDomain] = useState<CivilEngineeringDomainItem | null>(null);
  const [selectedRQ, setSelectedRQ] = useState<ResearchQuestionId>('RQ-01');
  const [threatSearch, setThreatSearch] = useState('');
  const [threatCategoryFilter, setThreatCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    loadFramework();
  }, []);

  const loadFramework = () => {
    setLoading(true);
    try {
      const data = researchFrameworkService.getResearchFramework(user?.email || 'researcher@scos.gov.in');
      setFramework(data);
      if (data.civilEngineeringContribution.domains.length > 0) {
        setSelectedCivilDomain(data.civilEngineeringContribution.domains[0]);
      }
    } catch (err) {
      console.error('Failed to load research framework data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = () => {
    setRunningTests(true);
    setTimeout(() => {
      try {
        const report = runResearchFrameworkTestSuite();
        setTestSuiteReport(report);
      } catch (e) {
        console.error('Error running test suite:', e);
      } finally {
        setRunningTests(false);
      }
    }, 400);
  };

  const handleExportJSON = () => {
    if (!framework) return;
    const jsonStr = JSON.stringify(framework, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos-research-framework-phase10e-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!framework) return;
    const csvStr = researchFrameworkService.exportFrameworkCSV(user?.email || 'researcher@scos.gov.in');
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scos-research-framework-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !framework) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 font-mono text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
        <span>Loading SCOS Phase 10E Research Contribution & Reference Architecture...</span>
      </div>
    );
  }

  const {
    frameworkVersion,
    researchProblem,
    researchObjective,
    academicAffiliation,
    architecturalLayers,
    researchGapMatrix,
    civilEngineeringContribution,
    researchQuestions,
    threatsToValidity,
    evidenceStrength,
    researchBlueprintFlow,
    governanceClassification,
    provenance,
  } = framework;

  const currentRQData = researchQuestions[selectedRQ];

  const filteredThreats = threatsToValidity.filter((t: ThreatToValidityItem) => {
    const matchesCat = threatCategoryFilter === 'ALL' || t.category === threatCategoryFilter;
    const dimensionText = t.academicDimension || t.categoryTitle || '';
    const descText = t.description || t.threatDescription || '';
    const matchesSearch =
      threatSearch === '' ||
      t.threatId.toLowerCase().includes(threatSearch.toLowerCase()) ||
      dimensionText.toLowerCase().includes(threatSearch.toLowerCase()) ||
      descText.toLowerCase().includes(threatSearch.toLowerCase()) ||
      t.mitigationAlreadyImplemented.toLowerCase().includes(threatSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner & Academic Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs px-2.5 py-0.5 rounded font-mono font-semibold uppercase">
                Phase 10E Synthesis
              </span>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">
                v{frameworkVersion}
              </span>
              <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs px-2 py-0.5 rounded font-mono">
                M.Tech Thesis Contribution
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              SCOS Reference Architecture & Research Contribution Synthesis
            </h1>
            <p className="text-sm text-slate-400 max-w-4xl">
              An integrated, multi-layered urban operating system reference architecture for
              civil-infrastructure-aware operational intelligence, cross-departmental coordination,
              and digital twin simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Download full framework synthesis in JSON format"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Download summary matrix in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setActiveTab('tests');
                handleRunTests();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              Run 25 Specs
            </button>
          </div>
        </div>

        {/* Governance & Prototype Warning */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3 flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-amber-300">
              {governanceClassification.noticeText}
            </div>
            <div className="text-amber-200/80 leading-relaxed">
              {governanceClassification.disclaimer} All claims are strictly bounded by controlled
              experimental evaluations in simulated test environments. Evidence Level E (Real-World
              Empirical Validation) is strictly prohibited and unassigned in this software prototype.
            </div>
          </div>
        </div>

        {/* Provenance & Academic Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <strong>Institution:</strong> {academicAffiliation.institution}
            </span>
            <span>•</span>
            <span>
              <strong>Degree:</strong> {academicAffiliation.degree} ({academicAffiliation.department})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SHA-256 Fingerprint:</span>
            <span className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {provenance.canonicalHash.slice(0, 24)}...
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
        {[
          { id: 'overview', label: '1. Problem & Thesis Scope', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'architecture', label: '2. 9-Layer Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'gaps', label: '3. Research Gap Matrix', icon: <Compass className="w-3.5 h-3.5" /> },
          { id: 'civil_eng', label: '4. Civil Eng. Contributions', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'traceability', label: '5. RQ Traceability', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'threats', label: '6. Threats to Validity (14)', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'evidence', label: '7. Evidence Hierarchy', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'blueprint', label: '8. 12-Step Blueprint', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'tests', label: '9. Automated Spec Runner', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: Overview & Problem Definition */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Formal Research Problem Statement
              </h2>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>Urban Management Dilemma:</strong> Traditional municipal command centers operate as
                  isolated, reactive silos. While disparate smart-city dashboards display telemetry, they lack
                  underlying physical and hydraulic awareness, leading to uncoordinated interventions and
                  unanticipated cascading infrastructure failures during severe urban flooding and municipal emergencies.
                </p>
                <p>
                  <strong>Research Focus:</strong> SCOS bridges urban data science, spatial topology, and civil
                  infrastructure physics (Manning's hydraulics, electrical dependency trees, road submergence criteria)
                  to synthesize a deterministic, verifiable operational intelligence operating system.
                </p>
              </div>

              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-4">
                Primary Research Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    title: 'RO-1: Physical Infrastructure Coupling',
                    desc: 'Ground urban decision intelligence in civil engineering models (hydraulics, electrical dependencies, transport impedances).',
                  },
                  {
                    title: 'RO-2: Automated Cross-Agency Coordination',
                    desc: 'Eliminate manual departmental friction via rule-based and knowledge-graph-driven multilateral SOP synthesis.',
                  },
                  {
                    title: 'RO-3: Predictive Digital Twin Simulation',
                    desc: 'Enable rapid what-if scenario simulations calibrated against empirical hydraulic and civil engineering validation cases.',
                  },
                  {
                    title: 'RO-4: Reproducible Scientific Evidence',
                    desc: 'Enforce cryptographic SHA-256 execution provenance and controlled experimental comparison protocols.',
                  },
                ].map((obj, i) => (
                  <div key={i} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300 mb-1">{obj.title}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">{obj.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Affiliation & Scope Constraints */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Academic Context & Scope
              </h2>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Institution</div>
                  <div className="font-semibold text-white">{academicAffiliation.institution}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Department & Degree</div>
                  <div className="font-semibold text-white">
                    {academicAffiliation.degree} — {academicAffiliation.department}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Supervision</div>
                  <div className="font-semibold text-white">{academicAffiliation.supervisor}</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Focus Area</div>
                  <div className="font-semibold text-white">{academicAffiliation.academicFocus}</div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="font-bold text-cyan-400">Strict Scope Boundaries:</div>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>Purely prototype & controlled simulation evaluation.</li>
                  <li>No real-time physical actuator telemetry or SCADA control.</li>
                  <li>All baseline comparisons use fixed benchmark datasets.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 9-Layer Architecture Visualizer */}
      {activeTab === 'architecture' && (
        <ArchitectureVisualizer layers={architecturalLayers} />
      )}

      {/* TAB CONTENT 3: Research Gap Matrix */}
      {activeTab === 'gaps' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Research Gap Matrix & SCOS Architectural Responses
              </h2>
              <p className="text-xs text-slate-400">
                Direct structural mapping from existing literature limitations to SCOS implemented solutions.
              </p>
            </div>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-300 border border-slate-700 font-mono">
              11 Formal Gap Mappings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Gap ID & Dimension</th>
                  <th className="p-3">Literature Limitation</th>
                  <th className="p-3">SCOS Architectural Response</th>
                  <th className="p-3">Evaluation Metric</th>
                  <th className="p-3">Evidence Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {researchGapMatrix.map((gap) => (
                  <tr key={gap.gapId} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-indigo-400">{gap.gapId}</div>
                      <div className="text-[10px] text-slate-400">{gap.dimension || gap.gapCategory}</div>
                    </td>
                    <td className="p-3 text-slate-300 max-w-xs">{gap.literatureLimitation || gap.gapDescription}</td>
                    <td className="p-3 text-slate-200 max-w-sm font-medium">
                      {gap.scosArchitecturalResponse}
                    </td>
                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300 font-bold">
                        {gap.evaluationMetric}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                        {gap.evidenceLevel.replace('LEVEL_', '').slice(0, 7)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Civil Engineering Domain Integration */}
      {activeTab === 'civil_eng' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Civil Engineering Domain Integration Framework
                </h2>
                <p className="text-xs text-slate-400">
                  {civilEngineeringContribution.overview}
                </p>
              </div>
              <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-300 border border-slate-700 font-mono">
                11 Critical Civil Domains
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Domain list */}
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Civil Domain
                </div>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {civilEngineeringContribution.domains.map((d) => (
                    <button
                      key={d.domainKey}
                      onClick={() => setSelectedCivilDomain(d)}
                      className={`w-full text-left p-3 rounded-lg border transition text-xs ${
                        selectedCivilDomain?.domainKey === d.domainKey
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-slate-400">{d.domainKey}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                          {(d.governingEquations || []).length} Eqs
                        </span>
                      </div>
                      <div className="font-medium text-white">{d.name || d.domainName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain Detail Inspector */}
              <div className="lg:col-span-8 space-y-4">
                {selectedCivilDomain && (
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <div className="text-xs font-mono text-amber-400 font-bold mb-1">
                        {selectedCivilDomain.domainKey}
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {selectedCivilDomain.name || selectedCivilDomain.domainName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {selectedCivilDomain.description || selectedCivilDomain.scosRepresentation}
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                          Civil Infrastructure Relevance
                        </span>
                        <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-300 leading-relaxed">
                          {selectedCivilDomain.civilRelevance || selectedCivilDomain.operationalRelevance}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                          SCOS Computational Implementation
                        </span>
                        <div className="bg-slate-900 p-3 rounded border border-slate-800 text-cyan-300 font-mono text-[11px] leading-relaxed">
                          {selectedCivilDomain.computationalRepresentation || selectedCivilDomain.computationalTreatment}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                          Governing Physical & Hydraulic Equations
                        </span>
                        <div className="space-y-1.5">
                          {(selectedCivilDomain.governingEquations || []).map((eq: string, idx: number) => (
                            <div
                              key={idx}
                              className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-amber-300 text-xs"
                            >
                              {eq}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-mono block">
                            Key Parameters
                          </span>
                          <div className="text-[11px] text-slate-200 mt-1 font-mono">
                            {(selectedCivilDomain.keyParameters || []).join(', ')}
                          </div>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-mono block">
                            Validation Cases
                          </span>
                          <div className="text-[11px] text-indigo-300 mt-1 font-mono">
                            {(selectedCivilDomain.validationCases || []).join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: RQ Traceability */}
      {activeTab === 'traceability' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Research Question Traceability (RQ-01 to RQ-05)
                </h2>
                <p className="text-xs text-slate-400">
                  End-to-end evidence binding from research questions to benchmark scenarios, metrics, and empirical results.
                </p>
              </div>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['RQ-01', 'RQ-02', 'RQ-03', 'RQ-04', 'RQ-05'] as ResearchQuestionId[]).map((rqId) => (
                  <button
                    key={rqId}
                    onClick={() => setSelectedRQ(rqId)}
                    className={`px-3 py-1 text-xs font-mono rounded font-semibold transition ${
                      selectedRQ === rqId
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rqId}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected RQ Deep View */}
            {currentRQData && (
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300">
                      {currentRQData.rqId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                      {currentRQData.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Evidence Level: {currentRQData.evidenceLevel.replace('LEVEL_', '')}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">
                      Research Question Text:
                    </span>
                    <div className="text-white font-medium text-sm bg-slate-900 p-3 rounded border border-slate-800">
                      "{currentRQData.questionText || currentRQData.formalQuestion}"
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">
                        Linked Evaluation Metrics:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentRQData.linkedMetrics.map((m: string) => (
                          <span
                            key={m}
                            className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-mono font-bold text-xs"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">
                        Linked Benchmark Scenarios:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentRQData.linkedScenarios.map((s: string) => (
                          <span
                            key={s}
                            className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-indigo-300 font-mono font-bold text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">
                      Controlled Experimental Execution Evidence (Phase 10B/10C):
                    </span>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed font-mono text-[11px]">
                      {currentRQData.phase10BExecutionEvidenceSummary}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">
                      Statistical Analysis & Uncertainty Characterization:
                    </span>
                    <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed font-mono text-[11px]">
                      {currentRQData.phase10CStatisticalEvidenceSummary}
                    </div>
                  </div>

                  <div>
                    <span className="text-amber-400 font-semibold block mb-1">
                      Bounded Scope & Academic Limitations:
                    </span>
                    <ul className="list-disc list-inside bg-amber-950/20 border border-amber-500/30 p-3 rounded text-amber-200/90 text-xs space-y-1">
                      {currentRQData.boundedLimitations.map((lim: string, idx: number) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: Threats to Validity */}
      {activeTab === 'threats' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Threats to Validity Registry (14 Academic Dimensions)
              </h2>
              <p className="text-xs text-slate-400">
                Rigorous disclosure of academic threats, existing mitigations, remaining limitations, and future research requirements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter threats..."
                  value={threatSearch}
                  onChange={(e) => setThreatSearch(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-white pl-8 pr-3 py-1.5 rounded border border-slate-700 focus:outline-none"
                />
              </div>

              <select
                value={threatCategoryFilter}
                onChange={(e) => setThreatCategoryFilter(e.target.value)}
                className="bg-slate-950 text-xs text-slate-300 px-3 py-1.5 rounded border border-slate-700 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="INTERNAL_VALIDITY">Internal Validity</option>
                <option value="CONSTRUCT_VALIDITY">Construct Validity</option>
                <option value="STATISTICAL_CONCLUSION_VALIDITY">Statistical Conclusion</option>
                <option value="EXTERNAL_VALIDITY">External Validity</option>
                <option value="MODEL_VALIDITY">Model Validity</option>
                <option value="DATA_VALIDITY">Data Validity</option>
                <option value="CALIBRATION_VALIDITY">Calibration Validity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredThreats.map((threat: ThreatToValidityItem) => (
              <div
                key={threat.threatId}
                className="bg-slate-950 rounded-lg border border-slate-800 p-4 space-y-2.5 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-400">{threat.threatId}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {threat.category}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white">
                  {threat.academicDimension || threat.threatTitle || threat.categoryTitle}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {threat.description || threat.threatDescription}
                </p>

                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-2 rounded text-emerald-300">
                    <strong className="text-emerald-400 font-mono text-[10px] block">
                      IMPLEMENTED MITIGATION:
                    </strong>
                    {threat.mitigationAlreadyImplemented}
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 p-2 rounded text-amber-200">
                    <strong className="text-amber-400 font-mono text-[10px] block">
                      REMAINING LIMITATION:
                    </strong>
                    {threat.remainingLimitation}
                  </div>

                  <div className="bg-indigo-950/30 border border-indigo-500/30 p-2 rounded text-indigo-300">
                    <strong className="text-indigo-400 font-mono text-[10px] block">
                      FUTURE RESEARCH:
                    </strong>
                    {threat.futureResearchRequirement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: Evidence Hierarchy */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evidence Strength Hierarchy Taxonomy (Levels A to E)
            </h2>
            <p className="text-xs text-slate-400">
              Rigorous categorization of claim strength across the SCOS operating system codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {evidenceStrength.levelsSummary.map((lvl: EvidenceLevelDefinition) => (
              <div
                key={lvl.level}
                className={`p-4 rounded-xl border space-y-2 ${
                  lvl.assignedCount > 0
                    ? 'bg-slate-950 border-indigo-500/60 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    {lvl.level.replace('LEVEL_', '').slice(0, 7)}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      lvl.assignedCount > 0
                        ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {lvl.assignedCount} items
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">{lvl.name || lvl.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{lvl.description}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  <strong>Standard:</strong> {lvl.verificationStandard || lvl.criteria}
                </div>
              </div>
            ))}
          </div>

          {/* Level E Exclusion Notice */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-white">
                Academic Integrity Guard: Level E Strictly Excluded
              </div>
              <p className="text-slate-400 leading-relaxed">
                Level E represents real-world physical municipal field validation. In accordance with
                academic rigor and ethics, Level E is strictly unassigned in this thesis prototype, as no
                live municipal sensor actuator feedback was connected to physical municipal infrastructure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: 12-Step Blueprint Flow */}
      {activeTab === 'blueprint' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              12-Step End-to-End Research Lineage Blueprint
            </h2>
            <p className="text-xs text-slate-400">
              The full conceptual pipeline from urban data ingestion to SHA-256 provenance sealing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchBlueprintFlow.steps.map((step: ResearchBlueprintStep) => (
              <div
                key={step.stepNumber}
                className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                    STEP {step.stepNumber}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Phase {step.relatedPhase || step.stageName}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{step.name || step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
                <div className="space-y-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  {step.inputData && (
                    <div>
                      <strong className="text-slate-300">Inputs:</strong> {step.inputData}
                    </div>
                  )}
                  {step.outputSummary && (
                    <div>
                      <strong className="text-slate-300">Outputs:</strong> {step.outputSummary}
                    </div>
                  )}
                  {step.computationalKernel && (
                    <div>
                      <strong className="text-slate-300">Computational Kernel:</strong>{' '}
                      <span className="text-cyan-300">{step.computationalKernel}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 9: Automated Spec Runner */}
      {activeTab === 'tests' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Phase 10E Automated Spec Verification (25 Specs)
              </h2>
              <p className="text-xs text-slate-400">
                Executes 25 formal unit & integration specifications for architecture, gaps, civil engineering, RQs, threats, and RBAC.
              </p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
            >
              {runningTests ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {runningTests ? 'Running Specs...' : 'Re-Run All 25 Specs'}
            </button>
          </div>

          {testSuiteReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Total Specs</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {testSuiteReport.totalTests}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Passed</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {testSuiteReport.passedTests}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Failed</div>
                  <div className="text-lg font-bold text-rose-400 font-mono">
                    {testSuiteReport.failedTests}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Execution Time</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    {testSuiteReport.executionDurationMs}ms
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {testSuiteReport.results.map((spec) => (
                  <div
                    key={spec.specId}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono ${
                      spec.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {spec.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{spec.specId}:</span>
                          <span className="text-white font-sans">{spec.specName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                            {spec.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {spec.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">{spec.durationMs}ms</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-400">
                Click "Run 25 Specs" to execute automated verification of the reference architecture,
                research questions, gap matrices, civil engineering models, and security permissions.
              </div>
              <button
                onClick={handleRunTests}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
              >
                Execute Test Suite Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchFrameworkView;
