import React from 'react';
import { ResearchMetrics } from '../../types/prediction';
import { BarChart3, CheckCircle2, Zap, ShieldCheck, Cpu, Clock, Award, LineChart } from 'lucide-react';

export interface ResearchMetricsViewProps {
  metrics: ResearchMetrics | null;
}

export const ResearchMetricsView: React.FC<ResearchMetricsViewProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Research Metrics & Scientific Evaluation
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              IIT Kanpur PhD Thesis Evaluation Framework — Smart City Operating System
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
          Empirical Sandbox Data
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Risks Detected</span>
          <span className="text-xl font-black text-white font-mono">{metrics.total_risks_detected}</span>
          <span className="text-[9px] text-indigo-400 block mt-0.5">
            {metrics.high_critical_risks_count} High/Critical Risks
          </span>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Prediction Response Time</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{metrics.prediction_response_time_ms} ms</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Sub-Second Scoring Latency</span>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Officer Acceptance Rate</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {metrics.recommendation_acceptance_rate_percent}%
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Human Alignment Index</span>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">System Uptime Reliability</span>
          <span className="text-xl font-black text-indigo-300 font-mono">
            {metrics.system_reliability_uptime_percent}%
          </span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">Fault-Tolerant Engine</span>
        </div>
      </div>

      {/* Scientific Evaluation Dimensions */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
          <LineChart className="w-4 h-4 text-indigo-400" />
          Thesis Scientific Evaluation Dimensions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-white block">
              1. Prediction Lead-Time vs Response Latency
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Measures time elapsed between early warning generation and physical preventive task dispatch. Target: &lt; 15 minutes.
            </p>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-white block">
              2. Multi-Department Recommendation Accuracy
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Evaluates correctness of affected department assignment and appropriateness of task actions across Municipal, Traffic, Jal Sansthan, and Health.
            </p>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-white block">
              3. Human-in-the-Loop Override Rate
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Quantifies how often district officers approve, modify, or reject AI recommendations, establishing governance accountability.
            </p>
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-white block">
              4. Fallback & Fault-Tolerance Rate
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Verifies seamless failover from LLM AI services to deterministic SCOS Rule Engine during network partition or API latency spikes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
