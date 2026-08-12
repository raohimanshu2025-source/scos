import React from 'react';
import { HistoricalPatternSummary, TrendDirection } from '../../types/prediction';
import { History, TrendingUp, TrendingDown, Minus, Clock, CheckCircle, Database } from 'lucide-react';

export interface HistoricalPatternViewProps {
  pattern: HistoricalPatternSummary;
  trend: TrendDirection;
  zoneName: string;
}

export const HistoricalPatternView: React.FC<HistoricalPatternViewProps> = ({
  pattern,
  trend,
  zoneName,
}) => {
  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Historical Pattern & Trend Analysis
            </h4>
            <span className="text-[10px] text-amber-400/90 font-mono italic">
              Simulated historical dataset — Kanpur Smart City
            </span>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold font-mono">
          <span className="text-slate-400 text-[10px]">Trend:</span>
          {trend === 'INCREASING' && (
            <span className="text-rose-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ↑ Increasing
            </span>
          )}
          {trend === 'STABLE' && (
            <span className="text-amber-400 flex items-center gap-1">
              <Minus className="w-3.5 h-3.5" />
              → Stable
            </span>
          )}
          {trend === 'DECREASING' && (
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              ↓ Decreasing
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Prior Events Logged</span>
          <span className="text-lg font-black text-white font-mono">{pattern.previous_incidents_count}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Past 2 Monsoon Cycles</span>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Pattern Similarity Index</span>
          <span className="text-lg font-black text-amber-400 font-mono">{pattern.similarity_score}%</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">High Confidence Match</span>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Target Zone</span>
          <span className="text-xs font-bold text-slate-200 truncate block mt-1">{zoneName}</span>
        </div>
      </div>

      {/* Recurring Categories */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
          Recurring Incident Categories
        </span>
        <div className="flex flex-wrap gap-1.5">
          {pattern.recurring_categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              #{cat}
            </span>
          ))}
        </div>
      </div>

      {/* Time Patterns */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Temporal Pattern & Context:
        </span>
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono pl-5">{pattern.time_patterns}</p>
      </div>

      {/* Previous Response Outcome */}
      <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/40 text-xs text-emerald-200 space-y-1">
        <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Historical Response Outcome Comparative:
        </span>
        <p className="text-[11px] text-slate-300 leading-relaxed font-mono pl-5">
          {pattern.previous_response_outcomes}
        </p>
      </div>
    </div>
  );
};
