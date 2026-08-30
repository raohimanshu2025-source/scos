/**
 * SCOS Phase 8.5C — Operational Decision Support View
 * Executive Decision Support Workspace for Municipal Officers & Incident Commanders.
 * 
 * Provides evidence-linked operational options, multi-factor prioritization breakdown,
 * civil infrastructure cascade context, and transparent Human-in-the-Loop approval workflows.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Info,
  Layers,
  Activity,
  Droplets,
  Share2,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { Textarea } from '../ui/FormControls';
import { apiClient } from '../../services/apiClient';
import {
  OperationalDecisionSupportSnapshot,
  DecisionOption,
  DecisionPriority,
} from '../../types/operationalDecisionSupport';
import { Incident } from '../../types/incident';

export interface OperationalDecisionSupportViewProps {
  initialIncidentId?: string;
  onNavigateToIncident?: (incidentId: string) => void;
}

export const OperationalDecisionSupportView: React.FC<OperationalDecisionSupportViewProps> = ({
  initialIncidentId = 'SCOS-INC-1024',
  onNavigateToIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(initialIncidentId);
  const [incidentsList, setIncidentsList] = useState<Incident[]>([]);
  const [snapshot, setSnapshot] = useState<OperationalDecisionSupportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [selectedOptionForReview, setSelectedOptionForReview] = useState<DecisionOption | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'MODIFY' | 'REJECT'>('APPROVE');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [modifiedInstructions, setModifiedInstructions] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Load Incidents List
  useEffect(() => {
    apiClient
      .getIncidents()
      .then((res) => {
        if (res.incidents && res.incidents.length > 0) {
          setIncidentsList(res.incidents);
        }
      })
      .catch((err) => console.warn('Failed to load incidents list:', err));
  }, []);

  // Fetch Decision Support Snapshot
  const loadDecisionSupportData = (incidentId: string) => {
    setIsLoading(true);
    setError(null);
    setReviewSuccessMessage(null);

    apiClient
      .getOperationalDecisionSupport(incidentId)
      .then((res) => {
        if (res && res.data) {
          setSnapshot(res.data);
        } else {
          setError('Failed to receive decision support data.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error communicating with SCOS Decision Support service');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadDecisionSupportData(selectedIncidentId);
  }, [selectedIncidentId]);

  // Handle Review Submission
  const handleSubmitReview = async () => {
    if (!selectedOptionForReview || !snapshot) return;
    setIsSubmittingReview(true);
    try {
      const payload = {
        optionId: selectedOptionForReview.optionId,
        action: reviewAction,
        officerNotes: officerNotes.trim(),
        modifiedInstructions:
          reviewAction === 'MODIFY' && modifiedInstructions.trim()
            ? modifiedInstructions.split('\n').filter((l) => l.trim().length > 0)
            : undefined,
      };

      const res = await apiClient.submitDecisionOptionReview(snapshot.situation.incidentId, payload);
      if (res && res.data) {
        setSnapshot(res.data);
        setReviewSuccessMessage(
          `Decision successfully recorded: ${selectedOptionForReview.optionCode} marked as ${reviewAction}. (Audit ID: ${res.auditEventId})`
        );
        setSelectedOptionForReview(null);
        setOfficerNotes('');
        setModifiedInstructions('');
      }
    } catch (err: any) {
      alert(`Review submission failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getPriorityBadgeColor = (p: DecisionPriority) => {
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

  return (
    <div className="space-y-6 font-sans">
      {/* SCOS DECISION SUPPORT EXECUTIVE TOP BANNER */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-indigo-300 uppercase tracking-wider">
                SCOS OPERATIONAL DECISION SUPPORT LAYER
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                PROTOTYPE HEURISTIC
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Transparent, evidence-linked decision options. Human-in-the-Loop review mandatory prior to operational task execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDecisionSupportData(selectedIncidentId)}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Refresh Snapshot
          </Button>
        </div>
      </div>

      {/* Page Header with Incident Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Decision Support Engine</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Kanpur Smart City Operating System
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-agency synthesis of incident severity, predictive risk zones, and civil infrastructure impact.
          </p>
        </div>

        {/* Incident Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Incident:</label>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            {incidentsList.map((inc) => (
              <option key={inc.incident_id} value={inc.incident_id}>
                {inc.incident_id} — {inc.title.slice(0, 35)}... ({inc.severity})
              </option>
            ))}
            {incidentsList.length === 0 && (
              <option value="SCOS-INC-1024">SCOS-INC-1024 — Parade Ground Waterlogging (CRITICAL)</option>
            )}
          </select>
        </div>
      </div>

      {/* Feedback Banner */}
      {reviewSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs font-medium text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reviewSuccessMessage}</span>
          </div>
          <button
            onClick={() => setReviewSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Error loading decision support snapshot</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !snapshot && (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-600">
            Synthesizing spatial intelligence, predictive risk models, and department capability matrices...
          </p>
        </div>
      )}

      {snapshot && (
        <div className="space-y-6">
          {/* TOP SECTION: SITUATION SUMMARY & MULTI-FACTOR PRIORITIZATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Situation Card */}
            <Card className="lg:col-span-2 p-5 bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                    Target Operational Situation
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getPriorityBadgeColor(snapshot.situation.severity as any)}`}>
                    {snapshot.situation.severity} SEVERITY
                  </span>
                  {onNavigateToIncident && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToIncident(snapshot.situation.incidentId)}
                      icon={<ChevronRight className="w-3.5 h-3.5" />}
                      className="text-[11px] h-6 px-2"
                    >
                      View Incident Details
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  {snapshot.situation.incidentTitle} ({snapshot.situation.incidentId})
                </h4>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{snapshot.situation.location} — Ward: {snapshot.situation.wardZone}</span>
                  <span className="text-slate-400">|</span>
                  <span>Coordinates: [{snapshot.situation.coordinates.latitude}, {snapshot.situation.coordinates.longitude}]</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Status</span>
                  <span className="font-bold text-slate-900">{snapshot.situation.currentStatus}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Primary Lead</span>
                  <span className="font-bold text-indigo-900">{snapshot.situation.primaryDepartment}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Escalation Tier</span>
                  <span className="font-bold text-slate-900">Tier {snapshot.situation.escalationLevel}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">SLA Risk</span>
                  <span className={`font-bold ${snapshot.situation.slaBreachRisk ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {snapshot.situation.slaBreachRisk ? 'Elevated Risk' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Critical Facilities Nearby */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Critical Facilities in Zone:</span>
                {snapshot.situation.criticalFacilitiesNearby.map((fac, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-medium">
                    {fac}
                  </span>
                ))}
              </div>
            </Card>

            {/* Multi-Factor Prioritization Summary */}
            <Card className="p-5 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/40 border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                    Decision Prioritization
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                  {snapshot.prioritizationSummary.prioritizationMethod}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Composite Priority Index</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-bold text-slate-900">
                      {snapshot.prioritizationSummary.overallPriorityScore}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getPriorityBadgeColor(snapshot.prioritizationSummary.priorityLevel)}`}>
                    {snapshot.prioritizationSummary.priorityLevel} PRIORITY
                  </span>
                </div>
              </div>

              {/* Contributing Factors Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  Contributing Heuristic Factors (Weighted)
                </span>
                <div className="space-y-1.5 text-xs">
                  {snapshot.prioritizationSummary.contributingFactors.map((f, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{f.label} ({f.weight * 100}%)</span>
                        <span className="font-mono font-bold text-slate-900">+{f.weightedContribution.toFixed(1)} pts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, f.score)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* EVIDENCE SYNTHESIS & REASONING SECTION */}
          <Card className="p-5 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                  Operational Evidence & Synthesis
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {snapshot.evidenceSummary.totalEvidenceItems} Verified Evidence Artifacts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <h5 className="text-[11px] font-bold uppercase text-indigo-900 tracking-wider">
                  Why SCOS Suggests Action
                </h5>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {snapshot.evidenceSummary.whyScosSuggestsAction}
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                <h5 className="text-[11px] font-bold uppercase text-amber-900 tracking-wider">
                  What We Know (Verified Telemetry & Graph)
                </h5>
                <ul className="space-y-1 text-slate-800 font-medium">
                  {snapshot.evidenceSummary.whatWeKnow.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary Evidence Artifacts */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                Primary Supporting Evidence Artifacts
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {snapshot.evidenceSummary.primaryEvidence.map((ev) => (
                  <div
                    key={ev.evidenceId}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                          {ev.sourceType}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-700 font-bold">
                          {Math.round(ev.confidenceScore * 100)}% Conf
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 line-clamp-1">{ev.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{ev.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span className="truncate">{ev.provenance}</span>
                      <span className="text-amber-700 bg-amber-50 px-1 rounded">SIMULATED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* PRIORITIZED OPERATIONAL DECISION OPTIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-700" />
                  <span>Prioritized Operational Decision Options</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select an option below for authorized Human-in-the-Loop review, modification, or approval.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {snapshot.options.length} Candidate Options
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {snapshot.options.map((opt) => (
                <Card
                  key={opt.optionId}
                  className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                    opt.executionStatus === 'APPROVED'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : opt.executionStatus === 'MODIFIED'
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : opt.executionStatus === 'REJECTED'
                      ? 'border-rose-300 bg-rose-50/20 opacity-75'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Option Code, Priority, Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded">
                        {opt.optionCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getPriorityBadgeColor(opt.priority)}`}>
                          {opt.priority}
                        </span>
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
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{opt.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{opt.description}</p>
                    </div>

                    {/* Rationale */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Rationale</span>
                      <p className="text-slate-800 italic">{opt.rationale}</p>
                    </div>

                    {/* Expected Impact & Coordination Load */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expected Operational Impact</span>
                      <p className="text-[11px] font-medium text-indigo-950 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                        {opt.expectedOperationalImpact}
                      </p>
                    </div>

                    {/* Affected Departments */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        Assigned Departments ({opt.affectedDepartments.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.affectedDepartments.map((dept) => (
                          <span
                            key={dept.departmentCode}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              dept.role === 'PRIMARY_LEAD'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {dept.departmentName} ({dept.role === 'PRIMARY_LEAD' ? 'Lead' : 'Support'})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Affected Infrastructure */}
                    {opt.affectedInfrastructure.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                          Civil Infrastructure In Scope
                        </span>
                        <div className="space-y-1">
                          {opt.affectedInfrastructure.map((inf) => (
                            <div
                              key={inf.assetId}
                              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-800 truncate">{inf.assetName}</span>
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border">
                                {inf.distanceKm}km
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review Metadata if Reviewed */}
                    {opt.reviewMetadata && (
                      <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Officer Review Recorded</span>
                          <span className="text-[10px] font-mono">{opt.reviewMetadata.reviewedAt ? new Date(opt.reviewMetadata.reviewedAt).toLocaleTimeString() : ''}</span>
                        </div>
                        <p className="text-[10px]">Officer: {opt.reviewMetadata.reviewedBy}</p>
                        {opt.reviewMetadata.notes && <p className="italic">"{opt.reviewMetadata.notes}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Human Decision Action Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      variant={opt.executionStatus === 'APPROVED' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => {
                        setSelectedOptionForReview(opt);
                        setReviewAction('APPROVE');
                        setOfficerNotes('');
                        setModifiedInstructions('');
                      }}
                      className="w-full text-xs justify-center"
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      {opt.executionStatus === 'PROPOSED' ? 'Review & Decide' : 'Update Officer Decision'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* UNCERTAINTIES & GOVERNANCE SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Uncertainties & Verification Needed */}
            <Card className="p-5 bg-white border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                  Uncertainties & Human Verification Needs
                </h4>
              </div>
              <p className="text-xs text-slate-600">
                The following operational assumptions require manual validation by on-site teams or control room dispatchers:
              </p>
              <div className="space-y-2">
                {snapshot.uncertainties.map((u) => (
                  <div
                    key={u.uncertaintyId}
                    className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">{u.category.replace(/_/g, ' ')}</span>
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        {u.blockingForExecution ? 'BLOCKING_FLAG' : 'ADVISORY'}
                      </span>
                    </div>
                    <p className="text-slate-700">{u.description}</p>
                    <p className="text-[11px] font-medium text-amber-900 mt-1">
                      Action: {u.mitigationRecommendation}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Governance & Human-in-the-Loop Safety Controls */}
            <Card className="p-5 bg-slate-900 text-slate-100 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase text-white tracking-wider">
                  Governance & System Provenance
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                    Data Classification
                  </span>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    {snapshot.governance.dataClassification}
                  </p>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                    Human-in-the-Loop Mandate
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {snapshot.governance.humanInTheLoopDisclaimer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Framework: {snapshot.governance.frameworkVersion}</div>
                  <div>District: {snapshot.governance.districtName}</div>
                  <div>Total Reviews Logged: {snapshot.humanGovernance.auditLogCount}</div>
                  <div>Timestamp: {new Date(snapshot.generatedAt).toLocaleTimeString()}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* HUMAN OFFICER DECISION REVIEW MODAL */}
      {selectedOptionForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Officer Decision Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedOptionForReview(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedOptionForReview.optionCode}</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getPriorityBadgeColor(selectedOptionForReview.priority)}`}>
                  {selectedOptionForReview.priority}
                </span>
              </div>
              <p className="font-medium text-slate-800">{selectedOptionForReview.title}</p>
            </div>

            {/* Action Selector: APPROVE / MODIFY / REJECT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Decision Action:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('APPROVE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('MODIFY')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'MODIFY'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Modify
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('REJECT')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    reviewAction === 'REJECT'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>

            {/* If Modify: Custom Instructions */}
            {reviewAction === 'MODIFY' && (
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Modified Operational Instructions (One per line):
                </label>
                <textarea
                  rows={3}
                  value={modifiedInstructions}
                  onChange={(e) => setModifiedInstructions(e.target.value)}
                  placeholder="e.g. Deploy pumps to North lane only&#10;Hold traffic diversion until 16:30..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}

            {/* Officer Notes */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 uppercase tracking-wider block">
                Officer Review Notes / Justification:
              </label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Add command notes or authorization comments..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 font-medium">
              Note: Submitting this review logs an immutable audit event in SCOS. Autonomous execution does not occur; field tasks remain subject to manual dispatch.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOptionForReview(null)}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitReview}
                isLoading={isSubmittingReview}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className={
                  reviewAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : reviewAction === 'MODIFY'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }
              >
                Confirm {reviewAction} Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalDecisionSupportView;
