/**
 * SCOS Phase 5B.6 — Technical Thesis Architecture & Research Significance
 * Visual system topology diagram and research documentation for M.Tech thesis evaluation.
 */

import React from 'react';
import {
  Layers,
  Share2,
  Brain,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { Card } from '../ui/Card';

export const ThesisArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <Card className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-indigo-800 space-y-2 shadow-md">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-300" />
          <h3 className="text-base font-bold">M.Tech Research Architecture — SCOS Contextual Intelligence Layer</h3>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed">
          System topology connecting heterogenous smart city entities, graph abstractions, predictive risk scoring, multi-agent triage, and human-in-the-loop decision support.
        </p>
      </Card>

      {/* Visual System Topology Diagram */}
      <Card className="p-6 border-slate-200 bg-white space-y-6 shadow-xs">
        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider text-center">
          SCOS High-Level Architecture Topology
        </h4>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          {/* Layer 1: Services & Inputs */}
          <div className="w-full md:w-1/5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-700 uppercase">1. Services & Data</span>
            <div className="space-y-1 text-[11px] text-slate-700">
              <p className="p-1.5 bg-white border border-slate-200 rounded">IoT Sensors</p>
              <p className="p-1.5 bg-white border border-slate-200 rounded">Citizen 1912 Feeds</p>
              <p className="p-1.5 bg-white border border-slate-200 rounded">GIS Layers</p>
            </div>
          </div>

          <div className="hidden md:block text-slate-400 font-bold text-lg">→</div>

          {/* Layer 2: Knowledge Graph */}
          <div className="w-full md:w-1/4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-center shadow-xs">
            <span className="text-[10px] font-bold text-indigo-900 uppercase">2. Knowledge Graph</span>
            <div className="space-y-1 text-[11px] text-slate-800 font-bold">
              <p className="p-1.5 bg-white border border-indigo-200 rounded">Nodes & Edges</p>
              <p className="p-1.5 bg-white border border-indigo-200 rounded">Spatial Binding</p>
              <p className="p-1.5 bg-white border border-indigo-200 rounded">Historical Matches</p>
            </div>
          </div>

          <div className="hidden md:block text-slate-400 font-bold text-lg">→</div>

          {/* Layer 3: Contextual AI */}
          <div className="w-full md:w-1/4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-2 text-center shadow-xs">
            <span className="text-[10px] font-bold text-cyan-900 uppercase">3. Intelligence Engine</span>
            <div className="space-y-1 text-[11px] text-slate-800 font-bold">
              <p className="p-1.5 bg-white border border-cyan-200 rounded">Gemini Triage</p>
              <p className="p-1.5 bg-white border border-cyan-200 rounded">Cascade Analysis</p>
              <p className="p-1.5 bg-white border border-cyan-200 rounded">Predictive Risk</p>
            </div>
          </div>

          <div className="hidden md:block text-slate-400 font-bold text-lg">→</div>

          {/* Layer 4: Decision & Outcome */}
          <div className="w-full md:w-1/5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center shadow-xs">
            <span className="text-[10px] font-bold text-emerald-900 uppercase">4. Outcome</span>
            <div className="space-y-1 text-[11px] text-slate-800 font-bold">
              <p className="p-1.5 bg-white border border-emerald-200 rounded">Officer Approval</p>
              <p className="p-1.5 bg-white border border-emerald-200 rounded">Task Dispatch</p>
              <p className="p-1.5 bg-white border border-emerald-200 rounded">Urban Resolution</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Research Significance & Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 border-slate-200 space-y-3 bg-white">
          <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            Why SCOS Requires a Knowledge Graph
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            Smart city operations inherently deal with highly heterogeneous, interdependent domain entities (roads, drainage nalas, hospital corridors, ward boundaries, municipal departments, and emergency tasks). Traditional relational or document schemas isolate these objects into disconnected silos.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            The Knowledge Graph provides a unified relational topology that allows SCOS to traverse connections in real time, discovering hidden dependencies (e.g. waterlogging on Road A threatening Hospital 1 emergency ambulance access).
          </p>
        </Card>

        <Card className="p-5 border-slate-200 space-y-3 bg-white">
          <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            Key Research Contributions
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Contextual AI Enrichment:</strong> Supplies structured graph context to LLM models, preventing hallucinations and grounding decisions in real city infrastructure.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Cascade Impact Modeling:</strong> Simulates multi-tier failure propagation from primary asset faults to emergency service delays.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Explainable Human-in-the-Loop Governance:</strong> Displays transparent graph edges justifying cross-department task dispatch.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
