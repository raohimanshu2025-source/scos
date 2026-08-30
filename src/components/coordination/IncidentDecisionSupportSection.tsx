/**
 * SCOS Phase 8.5C — Incident Decision Support Section
 * Compact, interactive decision support panel embedded in IncidentDetailView.
 * Provides multi-factor prioritization, transparent evidence-linked options,
 * and Human-in-the-Loop review controls.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { apiClient } from '../../services/apiClient';
import {
  OperationalDecisionSupportSnapshot,
  DecisionOption,
  DecisionPriority,
} from '../../types/operationalDecisionSupport';
import { Incident } from '../../types/incident';

export interface IncidentDecisionSupportSectionProps {
  incidentId: string;
  incident: Incident;
}

export const IncidentDecisionSupportSection: React.FC<IncidentDecisionSupportSectionProps> = ({
  incidentId,
  incident,
}) => {
  const [snapshot, setSnapshot] = useState<OperationalDecisionSupportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'MODIFY' | 'REJECT'>('APPROVE');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDecisionSupport = () => {
    setIsLoading(true);
    apiClient
      .getOperationalDecisionSupport(incidentId)
      .then((res) => {
        if (res && res.data) {
          setSnapshot(res.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load incident decision support:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDecisionSupport();
  }, [incidentId]);

  const handleReviewSubmit = async () => {
    if (!selectedOption || !snapshot) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.submitDecisionOptionReview(incidentId, {
        optionId: selectedOption.optionId,
        action: reviewAction,
        officerNotes: officerNotes.trim(),
      });
      if (res && res.data) {
        setSnapshot(res.data);
        setFeedback(`Decision recorded: ${selectedOption.optionCode} marked as ${reviewAction}.`);
        setSelectedOption(null);
        setOfficerNotes('');
      }
    } catch (err: any) {
      alert(`Review submission failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (p: DecisionPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'MEDIUM':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoading && !snapshot) {
    return (
      <Card className="p-4 border-indigo-200 bg-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
          <span>Generating SCOS Decision Support Options...</span>
        </div>
      </Card>
    );
  }

  if (!snapshot) return null;

  return (
    <Card className="p-5 border-indigo-200 bg-gradient-to-br from-indigo-50/30 via-white to-amber-50/20 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-700" />
          <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
            SCOS OPERATIONAL DECISION SUPPORT
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            PROTOTYPE HEURISTIC
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getPriorityColor(snapshot.prioritizationSummary.priorityLevel)}`}>
            {snapshot.prioritizationSummary.overallPriorityScore}/100 — {snapshot.prioritizationSummary.priorityLevel}
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Decision Rationale Summary */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Decision Support Rationale</span>
        <p className="text-slate-800 leading-relaxed font-medium">
          {snapshot.evidenceSummary.whyScosSuggestsAction}
        </p>
      </div>

      {/* Decision Options Cards */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
          Candidate Operational Options ({snapshot.options.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {snapshot.options.map((opt) => (
            <div
              key={opt.optionId}
              className={`p-3.5 rounded-xl border space-y-2.5 flex flex-col justify-between transition-all ${
                opt.executionStatus === 'APPROVED'
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : opt.executionStatus === 'MODIFIED'
                  ? 'bg-indigo-50/40 border-indigo-300'
                  : opt.executionStatus === 'REJECTED'
                  ? 'bg-rose-50/40 border-rose-300 opacity-80'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-bold rounded">
                    {opt.optionCode}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border ${getPriorityColor(opt.priority)}`}>
                    {opt.priority}
                  </span>
                </div>

                <p className="font-bold text-slate-900 leading-snug">{opt.title}</p>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">{opt.rationale}</p>

                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1">
                  {opt.affectedDepartments.map((d) => (
                    <span
                      key={d.departmentCode}
                      className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-700"
                    >
                      {d.departmentCode}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge
                  status={
                    opt.executionStatus === 'APPROVED'
                      ? 'NORMAL'
                      : opt.executionStatus === 'MODIFIED'
                      ? 'WARNING'
                      : opt.executionStatus === 'REJECTED'
                      ? 'CRITICAL'
                      : 'NORMAL'
                  }
                  label={opt.executionStatus}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOption(opt);
                    setReviewAction('APPROVE');
                    setOfficerNotes('');
                  }}
                  className="text-[10px] h-6 px-2"
                >
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {selectedOption && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">
              Officer Review: {selectedOption.optionCode} — {selectedOption.title}
            </span>
            <button onClick={() => setSelectedOption(null)} className="text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewAction('APPROVE')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                reviewAction === 'APPROVE'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setReviewAction('MODIFY')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                reviewAction === 'MODIFY'
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Modify
            </button>
            <button
              type="button"
              onClick={() => setReviewAction('REJECT')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                reviewAction === 'REJECT'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              Reject
            </button>
          </div>

          <textarea
            rows={2}
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            placeholder="Officer authorization notes..."
            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedOption(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReviewSubmit}
              isLoading={isSubmitting}
              className={
                reviewAction === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-xs'
                  : reviewAction === 'MODIFY'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-xs'
                  : 'bg-rose-600 hover:bg-rose-700 text-xs'
              }
            >
              Record {reviewAction}
            </Button>
          </div>
        </div>
      )}

      {/* Governance Note */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 flex items-center justify-between">
        <span>SCOS Human-in-the-Loop decision boundary. Autonomous emergency execution is strictly prohibited.</span>
        <span className="font-mono font-bold text-indigo-700">{snapshot.governance.frameworkVersion}</span>
      </div>
    </Card>
  );
};
