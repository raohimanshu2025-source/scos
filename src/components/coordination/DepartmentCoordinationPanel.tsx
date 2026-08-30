import React, { useState, useEffect } from 'react';
import { Incident, DepartmentTask, IncidentPriority } from '../../types/incident';
import {
  DepartmentImpactAnalysis,
  CoordinationMatrixRow,
  RecommendedTask,
} from '../../types/departmentCoordination';
import { coordinationService } from '../../services/coordinationService';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GitMerge,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DepartmentCoordinationPanelProps {
  incident: Incident;
  onTaskUpdated?: () => void;
}

export const DepartmentCoordinationPanel: React.FC<DepartmentCoordinationPanelProps> = ({
  incident,
  onTaskUpdated,
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<DepartmentImpactAnalysis | null>(null);
  const [matrix, setMatrix] = useState<CoordinationMatrixRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Review Modal State
  const [reviewingRec, setReviewingRec] = useState<RecommendedTask | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'MODIFY' | 'REJECT'>('APPROVE');
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modPriority, setModPriority] = useState<IncidentPriority>('P1');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resAnalysis, resMatrix] = await Promise.all([
        coordinationService.getDepartmentImpact(incident.incident_id),
        coordinationService.getCoordinationMatrix(incident.incident_id),
      ]);
      setAnalysis(resAnalysis);
      setMatrix(resMatrix);
    } catch (err) {
      console.error('Failed to load department coordination panel data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incident.incident_id]);

  const handleOpenReview = (rec: RecommendedTask, decision: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    setReviewingRec(rec);
    setReviewDecision(decision);
    setModTitle(rec.taskTitle);
    setModDesc(rec.taskDescription);
    setModPriority(rec.priority);
    setReviewNotes('');
  };

  const handleConfirmReview = async () => {
    if (!reviewingRec) return;
    setIsSubmitting(true);
    try {
      await coordinationService.reviewRecommendation(
        incident.incident_id,
        reviewingRec.recommendationId,
        reviewDecision,
        reviewDecision === 'MODIFY'
          ? {
              taskTitle: modTitle,
              taskDescription: modDesc,
              priority: modPriority,
            }
          : undefined,
        reviewNotes
      );
      setReviewingRec(null);
      await loadData();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      alert(`Error recording decision: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-xs flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <span>Analyzing Civil Infrastructure & Department Responsibility Mapping...</span>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">SCOS Multi-Department Operational Coordination</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PROTOTYPE OPERATIONAL LAYER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Infrastructure Trigger → Affected Departments → Responsibilities → Human Review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              analysis.coordinationStatus === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : analysis.coordinationStatus === 'COORDINATION_ACTIVE'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : analysis.coordinationStatus === 'AWAITING_DECISION'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            STATUS: {analysis.coordinationStatus.replace(/_/g, ' ')}
          </span>
          <button className="text-slate-400 hover:text-white">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-6">
          {/* Department Priority Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Primary */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Primary Lead</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">PRIMARY</span>
              </div>
              <p className="font-bold text-white text-xs">{analysis.primaryDepartment.departmentName}</p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{analysis.primaryDepartment.reason}</p>
            </div>

            {/* Secondary & Support */}
            {analysis.secondaryDepartments.map((sec) => (
              <div key={sec.departmentId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{sec.role}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      sec.role === 'SECONDARY'
                        ? 'bg-sky-500/20 text-sky-300'
                        : sec.role === 'SUPPORT'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {sec.role}
                  </span>
                </div>
                <p className="font-bold text-slate-200 text-xs">{sec.departmentName}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sec.reason}</p>
              </div>
            ))}
          </div>

          {/* SCOS Department Coordination Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
                SCOS Department Coordination Matrix
              </h4>
              <span className="text-[10px] text-slate-500">Live Prototype State Matrix</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-700">
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Affected Asset</th>
                    <th className="p-2.5">Operational Action</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">SLA Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {matrix.map((row) => (
                    <tr key={row.departmentId} className="hover:bg-slate-800/30 transition">
                      <td className="p-2.5 font-bold text-white">{row.departmentName}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.role === 'PRIMARY'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : row.role === 'SECONDARY'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {row.role}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300">{row.affectedAsset}</td>
                      <td className="p-2.5 text-slate-200">{row.recommendedAction}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : row.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : row.status === 'MODIFIED'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-400">{row.slaTargetMinutes}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Tasks & Human Decision Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Recommended Coordinated Tasks (Requires Authorized Human Decision)
              </h4>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Human-in-the-Loop Approval Mandatory
              </span>
            </div>

            <div className="space-y-3">
              {analysis.recommendedTasks.map((rec) => (
                <div
                  key={rec.recommendationId}
                  className={`border rounded-xl p-4 transition ${
                    rec.decisionStatus === 'APPROVED'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : rec.decisionStatus === 'MODIFIED'
                      ? 'bg-sky-950/20 border-sky-500/30'
                      : rec.decisionStatus === 'REJECTED'
                      ? 'bg-rose-950/20 border-rose-500/30 opacity-60'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700 text-slate-300">
                        {rec.recommendationId}
                      </span>
                      <span className="font-bold text-white text-sm">{rec.taskTitle}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {rec.departmentName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        Verification: {rec.verificationStatus}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rec.decisionStatus === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : rec.decisionStatus === 'MODIFIED'
                            ? 'bg-sky-500/20 text-sky-400'
                            : rec.decisionStatus === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {rec.decisionStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">{rec.taskDescription}</p>

                  {/* Reason & Infrastructure Trigger Explanation */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-400 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recommendation Trigger & Reasoning:</span>
                    </div>
                    <p>{rec.reason}</p>
                    <p className="text-[10px] text-indigo-400">
                      Source Infrastructure: {rec.sourceInfrastructure} ({rec.infrastructureType})
                    </p>
                  </div>

                  {/* Dependencies */}
                  {rec.dependsOnRecommendationIds && rec.dependsOnRecommendationIds.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-400 bg-slate-900/40 px-2.5 py-1 rounded">
                      <GitMerge className="w-3.5 h-3.5 text-sky-400" />
                      <span>DEPENDS ON: {rec.dependsOnRecommendationIds.join(', ')}</span>
                    </div>
                  )}

                  {/* Human Action Buttons if RECOMMENDED */}
                  {rec.decisionStatus === 'RECOMMENDED' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                      <button
                        onClick={() => handleOpenReview(rec, 'APPROVE')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Recommendation
                      </button>

                      <button
                        onClick={() => handleOpenReview(rec, 'MODIFY')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modify & Approve
                      </button>

                      <button
                        onClick={() => handleOpenReview(rec, 'REJECT')}
                        className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Reviewed Info if decision recorded */}
                  {rec.decisionStatus !== 'RECOMMENDED' && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span>Reviewed by {rec.reviewedBy} ({rec.reviewedAt?.slice(0, 16)})</span>
                      {rec.createdTaskId && (
                        <span className="font-mono text-emerald-400 font-bold">Created Task: #{rec.createdTaskId}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewingRec && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                Human Review: {reviewDecision} Recommendation
              </h3>
              <button onClick={() => setReviewingRec(null)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are authorizing a decision for recommendation <strong className="text-white">{reviewingRec.recommendationId}</strong> assigned to <strong className="text-indigo-400">{reviewingRec.departmentName}</strong>.
            </p>

            {reviewDecision === 'MODIFY' && (
              <div className="space-y-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Modified Task Title</label>
                  <input
                    type="text"
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Modified Task Description</label>
                  <textarea
                    value={modDesc}
                    onChange={(e) => setModDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Priority Level</label>
                  <select
                    value={modPriority}
                    onChange={(e) => setModPriority(e.target.value as IncidentPriority)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="P1">P1 — Critical Emergency</option>
                    <option value="P2">P2 — High Priority</option>
                    <option value="P3">P3 — Medium Priority</option>
                    <option value="P4">P4 — Low Priority</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Decision Justification / Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter justification notes for audit log..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReviewingRec(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 ${
                  reviewDecision === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : reviewDecision === 'MODIFY'
                    ? 'bg-sky-600 hover:bg-sky-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isSubmitting ? 'Processing Decision...' : `Confirm ${reviewDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
