import React from 'react';
import { ContributingFactor } from '../../types/prediction';
import { CheckCircle2, Layers, AlertCircle } from 'lucide-react';

export interface ContributingFactorsListProps {
  factors: ContributingFactor[];
}

export const ContributingFactorsList: React.FC<ContributingFactorsListProps> = ({ factors }) => {
  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Contributing Risk Factors & Indicators
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          Composite Weights Summed
        </span>
      </div>

      <div className="space-y-2.5">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-start gap-3"
          >
            <div className="mt-0.5">
              {factor.is_present ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">
                  ✓ {factor.factor_name}
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Weight: {factor.weight}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {factor.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
