import React, { useState } from 'react';
import { RiskZone } from '../../types/prediction';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  Building2,
  Brain,
  HelpCircle,
  FileCheck,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface DecisionSupportPanelProps {
  zone: RiskZone;
  onApprove: (zoneId: string) => Promise<boolean | void>;
  onDismiss: (zoneId: string, reason: string) => Promise<boolean | void>;
  onModify: (zoneId: string, updatedActions: string[]) => Promise<boolean | void>;
}

export const DecisionSupportPanel: React.FC<DecisionSupportPanelProps> = ({
  zone,
  onApprove,
  onDismiss,
  onModify,
}) => {
  const [isModifying, setIsModifying] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissReason, setDismissReason] = useState('');
  const [actions, setActions] = useState<string[]>([...zone.recommended_preventive_actions]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ds = zone.decision_support;

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onApprove(zone.zone_id);
    setIsSubmitting(false);
  };

  const handleDismissSubmit = async () => {
    if (!dismissReason.trim()) return;
    setIsSubmitting(true);
    await onDismiss(zone.zone_id, dismissReason);
    setIsSubmitting(false);
    setIsDismissing(false);
  };

  const handleModifySubmit = async () => {
    setIsSubmitting(true);
    await onModify(zone.zone_id, actions);
    setIsSubmitting(false);
    setIsModifying(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/30 p-5 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
                SCOS Decision Support Panel
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Human-in-the-Loop Required
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{zone.zone_name}</h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Risk Level</span>
          <span
            className={`text-xs font-black font-mono px-2.5 py-1 rounded-md border ${
              zone.risk_level === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : zone.risk_level === 'HIGH'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : zone.risk_level === 'MEDIUM'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {zone.risk_level} ({zone.risk_score}/100)
          </span>
        </div>
      </div>

      {/* Grid: Situation, Risk, Impact, Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Situation */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-1">
            1. Observed Situation
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{ds.situation}</p>
        </div>

        {/* Risk Forecast */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block font-mono mb-1">
            2. AI Predicted Risk ({zone.time_horizon})
          </span>
          <p className="text-xs text-indigo-200 font-semibold">{ds.risk_summary}</p>
        </div>

        {/* Impact Projection */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block font-mono mb-1">
            3. Projected Urban Impact
          </span>
          <p className="text-xs text-slate-300">{ds.impact_projection}</p>
        </div>

        {/* Affected Depts */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-1">
            4. Affected Municipal Depts
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {ds.affected_departments.map((d) => (
              <span
                key={d}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 border border-slate-600"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Options */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/80 space-y-3">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">
          5. Action Options Matrix
        </span>

        <div className="space-y-2.5">
          {ds.options.map((opt) => (
            <div
              key={opt.option_id}
              className={`p-3 rounded-xl border transition ${
                opt.is_scos_recommended
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-100'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  {opt.title}
                  {opt.is_scos_recommended && (
                    <span className="text-[9px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                      SCOS Recommended
                    </span>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2">{opt.description}</p>
              <div className="space-y-1 pl-2 border-l-2 border-indigo-500/30">
                {opt.preventive_actions.map((act, i) => (
                  <p key={i} className="text-[11px] text-slate-300 font-mono">
                    • {act}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Rationale */}
        <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-800/50 text-xs text-indigo-200">
          <span className="font-bold text-indigo-300 block mb-0.5">SCOS Engine Rationale:</span>
          {ds.rationale}
        </div>
      </div>

      {/* Human Action Workflow Controls */}
      <div className="border-t border-slate-800 pt-4">
        {zone.early_warning_status === 'APPROVED' ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Early Warning Approved</span>
                <span className="text-[11px] text-slate-300 font-mono">
                  Reviewed by {zone.reviewed_by || 'District Officer'} at{' '}
                  {zone.reviewed_at ? new Date(zone.reviewed_at).toLocaleTimeString() : 'Recently'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              PREVENTIVE TASKS DISPATCHED
            </span>
          </div>
        ) : zone.early_warning_status === 'DISMISSED' ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">Early Warning Dismissed by Officer</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Status: Dismissed</span>
          </div>
        ) : isDismissing ? (
          <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-200 block">
              Reason for Dismissing Early Warning:
            </label>
            <input
              type="text"
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="e.g. Field inspection confirmed physical drainage clearance..."
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsDismissing(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDismissSubmit} isLoading={isSubmitting}>
                Confirm Dismissal
              </Button>
            </div>
          </div>
        ) : isModifying ? (
          <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-200 block">
              Modify Preventive Actions Before Dispatch:
            </label>
            {actions.map((act, idx) => (
              <input
                key={idx}
                type="text"
                value={act}
                onChange={(e) => {
                  const newActs = [...actions];
                  newActs[idx] = e.target.value;
                  setActions(newActs);
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            ))}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsModifying(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleModifySubmit} isLoading={isSubmitting}>
                Save & Dispatch Modified Actions
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Officer Verification Required Before Dispatching Preventive Tasks</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsDismissing(true)}>
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Dismiss
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsModifying(true)}>
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Modify
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleApprove}
                isLoading={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-300" />
                Approve Preventive Actions
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
