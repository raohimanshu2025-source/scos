/**
 * SCOS Phase 5B.4 — Comprehensive Incident Detail Page / View
 * Includes Incident Summary, GIS Viewport, Impact Assessment, AI Triage, Human Decision Controls,
 * Department Task Matrix, Event Timeline, Escalation Engine, and Audit Trail.
 */

import React, { useState } from 'react';
import {
  Activity,
  MapPin,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  MessageSquare,
  FileText,
  User,
  SlidersHorizontal,
  Zap,
  ArrowLeft,
  XCircle,
  Plus,
  Share2,
  Compass,
  Droplets,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Card } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapContainer } from '../ui/MapContainer';
import { Input, Textarea } from '../ui/FormControls';
import { useIncidents } from '../../context/IncidentContext';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';
import { usePredictive, IncidentPredictiveAssessment } from '../../context/PredictiveContext';
import { useEvaluation } from '../../context/EvaluationContext';
import { Incident, TaskStatus } from '../../types/incident';
import { DEPARTMENT_MAP } from '../../services/impactMappingRules';
import { spatialService } from '../../services/spatialService';
import { CivilCascadeImpact } from '../../types/infrastructure';
import { DepartmentCoordinationPanel } from '../coordination/DepartmentCoordinationPanel';
import { IncidentDecisionSupportSection } from '../coordination/IncidentDecisionSupportSection';
import { IncidentDigitalTwinSection } from '../digitalTwin/IncidentDigitalTwinSection';

export interface IncidentDetailViewProps {
  incidentId: string;
  onBack: () => void;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({ incidentId, onBack }) => {
  const {
    selectedIncident,
    selectedTimeline,
    approveRecommendation,
    modifyRecommendation,
    rejectRecommendation,
    updateTaskStatus,
    triggerSlaEscalation,
    resolveIncident,
    launchDemoScenario,
    reAnalyzeWithAi,
    isLoading,
  } = useIncidents();

  const { loadIncidentContext, incidentContext } = useKnowledgeGraph();
  const { evaluateIncidentPrediction } = usePredictive();
  const { recordAccessEvent } = useEvaluation();

  const [predictiveAssessment, setPredictiveAssessment] = useState<IncidentPredictiveAssessment | null>(null);
  const [isEvaluatingPredictive, setIsEvaluatingPredictive] = useState(false);
  const [predictiveError, setPredictiveError] = useState(false);
  const [civilImpact, setCivilImpact] = useState<CivilCascadeImpact | null>(null);

  React.useEffect(() => {
    if (selectedIncident) {
      loadIncidentContext(selectedIncident.incident_id);
      recordAccessEvent('INCIDENT_VIEW', selectedIncident.incident_id);
      recordAccessEvent('GRAPH_CONTEXT_VIEW', `GRAPH:${selectedIncident.incident_id}`);
      recordAccessEvent('AI_ANALYSIS_VIEW', `AI:${selectedIncident.incident_id}`);
      recordAccessEvent('CASCADE_VIEW', `CASCADE:${selectedIncident.incident_id}`);
      recordAccessEvent('DEPARTMENT_VIEW', `DEPTS:${selectedIncident.affected_departments.join(',')}`);
      // Reset predictive state on incident switch
      setPredictiveAssessment(null);
      setPredictiveError(false);

      // Fetch Civil Infrastructure Proximity & Impact Analysis
      spatialService
        .getIncidentImpact(
          selectedIncident.incident_id,
          selectedIncident.latitude,
          selectedIncident.longitude
        )
        .then((res) => {
          if (res.success) setCivilImpact(res.data);
        })
        .catch((err) => console.warn('Failed to load civil infrastructure impact:', err));
    }
  }, [selectedIncident?.incident_id]);

  const handleRunPredictiveAssessment = async () => {
    if (!selectedIncident) return;
    setIsEvaluatingPredictive(true);
    setPredictiveError(false);
    try {
      const result = await evaluateIncidentPrediction(selectedIncident.incident_id);
      if (result) {
        setPredictiveAssessment(result);
        recordAccessEvent('PREDICTIVE_ASSESSMENT', `PREDICT:${selectedIncident.incident_id}`);
      } else {
        setPredictiveError(true);
      }
    } catch (err) {
      setPredictiveError(true);
    } finally {
      setIsEvaluatingPredictive(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TASKS' | 'TIMELINE' | 'GOVERNANCE'>('OVERVIEW');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [taskNoteText, setTaskNoteText] = useState<Record<string, string>>({});
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifiedActionsText, setModifiedActionsText] = useState('');

  if (!selectedIncident) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-slate-600 text-sm">Loading incident context...</p>
        <Button variant="outline" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Operations Dashboard
        </Button>
      </div>
    );
  }

  const inc = selectedIncident;
  const isApproved = inc.AI_assessment?.status === 'APPROVED' || inc.AI_assessment?.status === 'MODIFIED';

  const handleApprove = async () => {
    await approveRecommendation(inc.incident_id);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) return;
    await rejectRecommendation(inc.incident_id, rejectReason);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const note = taskNoteText[taskId] || '';
    await updateTaskStatus(inc.incident_id, taskId, newStatus, note);
    setTaskNoteText((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleSimulateSlaEscalation = async (taskId?: string) => {
    await triggerSlaEscalation(inc.incident_id, taskId);
  };

  const handleResolveIncident = async () => {
    await resolveIncident(inc.incident_id);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* SCOS Demonstration Mode Top Banner */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-amber-600 text-white font-mono font-bold text-[10px] rounded uppercase tracking-wider">
            SCOS DEMONSTRATION MODE
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold">
            <span className="bg-white/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              SIMULATED DEMONSTRATION DATA
            </span>
            <span className="bg-white/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              SIMULATED TIMELINE
            </span>
            <span className="bg-white/80 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              SIMULATED PREDICTIVE INPUTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => launchDemoScenario()}
            isLoading={isLoading}
            icon={<Zap className="w-3.5 h-3.5 text-amber-600" />}
            className="text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
          >
            Reset Demo Scenario
          </Button>
          {inc.current_status !== 'RESOLVED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleResolveIncident}
              isLoading={isLoading}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              className="text-xs bg-emerald-700 hover:bg-emerald-800"
            >
              Resolve Incident
            </Button>
          )}
        </div>
      </div>

      {/* Top Breadcrumb & Page Header */}
      <PageHeader
        title={`${inc.title} (${inc.incident_id})`}
        description={`Category: ${inc.category.replace(/_/g, ' ')} | Location: ${inc.location} | Ward: ${inc.ward_zone}`}
        statusBadge={<StatusBadge status={inc.current_status as any} label={inc.current_status} />}
        breadcrumbs={[
          { label: 'Operations', onClick: onBack },
          { label: `Incident ${inc.incident_id}` },
        ]}
        primaryAction={{
          label: 'Back to Operations',
          icon: <ArrowLeft className="w-4 h-4" />,
          onClick: onBack,
        }}
      />

      {/* SCOS UNIFIED DECISION SUPPORT PANEL */}
      <Card className="p-5 border-indigo-300 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-700" />
            <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider">
              SCOS DECISION SUPPORT
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200">
            Unified Operational Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Incident & Risk Level */}
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Incident Risk Level</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{predictiveAssessment?.risk_level || inc.severity}</span>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                Score: {predictiveAssessment?.risk_score ?? (inc.severity === 'CRITICAL' ? 82 : 65)} / 100
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{inc.location}</p>
          </div>

          {/* AI Summary */}
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">AI Summary</span>
            <p className="text-xs font-medium text-slate-800 line-clamp-2">
              {inc.AI_assessment?.impact_summary || inc.estimated_impact}
            </p>
          </div>

          {/* Key Context & Cascade */}
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Context & Cascade</span>
            <p className="text-[11px] text-slate-700 font-medium">
              Waterlogging → Road Obstruction → Hospital Access & Drainage Overflow
            </p>
          </div>

          {/* Decision Status & Affected Depts */}
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Human Decision Status</span>
            <div className="flex items-center justify-between mt-0.5">
              <StatusBadge status={isApproved ? 'NORMAL' : 'WARNING'} label={inc.AI_assessment?.status || 'PENDING'} />
              <span className="text-[10px] font-mono text-slate-600">{inc.affected_departments.length} Depts</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Key Operational Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Severity / Priority</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-slate-900">{inc.severity}</span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {inc.priority}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Primary Dept</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {DEPARTMENT_MAP[inc.primary_department]?.name || inc.primary_department}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Governance Status</p>
            <p className="text-sm font-bold text-emerald-800">
              {inc.AI_assessment?.status || 'PENDING'}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Demo SLA Level</p>
            <p className="text-sm font-bold text-amber-900">
              {inc.escalation_level > 0 ? `Level ${inc.escalation_level} Escalated` : 'Normal SLA'}
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 font-medium text-xs">
        {[
          { id: 'OVERVIEW', label: 'Incident Overview & GIS' },
          { id: 'TASKS', label: `Department Tasks (${inc.assigned_tasks.length})` },
          { id: 'TIMELINE', label: `Event Timeline (${selectedTimeline.length})` },
          { id: 'GOVERNANCE', label: 'AI Ethics & Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 border-b-2 font-bold transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & GIS */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI Impact Assessment & Decision Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Assessment Card */}
            <Card className="p-5 border-indigo-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AiBadge status="ACTIVE" label="SCOS AI Triage & Impact Engine" />
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Confidence: {((inc.AI_assessment?.confidence || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reAnalyzeWithAi(inc.incident_id)}
                  isLoading={isLoading}
                  icon={<Brain className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Re-Analyze
                </Button>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">AI Impact Assessment Summary</h4>
                <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
                  {inc.AI_assessment?.impact_summary || inc.estimated_impact}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Operational Officer Explanation</h4>
                <p className="text-xs text-slate-700 italic mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  "{inc.AI_assessment?.explanation || 'Evaluated via SCOS Cross-Department Spatial Rules.'}"
                </p>
              </div>

              {/* Recommended Actions List */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Recommended Cross-Department Actions
                </h4>
                <div className="space-y-2">
                  {(inc.AI_assessment?.recommended_actions || []).map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Approval Controls Panel */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Human-in-the-Loop Decision
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Status: {inc.AI_assessment?.status || 'PENDING_REVIEW'}
                  </span>
                </div>

                {!isApproved ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      As authorized officer, review the AI recommendation above and choose an action:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        onClick={handleApprove}
                        isLoading={isLoading}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Approve & Generate Tasks
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        icon={<XCircle className="w-4 h-4 text-rose-600" />}
                      >
                        Reject Recommendation
                      </Button>
                    </div>

                    {showRejectForm && (
                      <form onSubmit={handleRejectSubmit} className="pt-2 space-y-2 border-t border-slate-200">
                        <Input
                          label="Rejection Reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Inaccurate location estimate / duplicate report..."
                          required
                        />
                        <Button type="submit" variant="outline" className="text-xs text-rose-700">
                          Confirm Rejection
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Recommendation approved by <strong>{inc.AI_assessment?.reviewed_by || 'Officer'}</strong> at{' '}
                      {new Date(inc.AI_assessment?.reviewed_at || Date.now()).toLocaleTimeString()}. Tasks are active in department queues.
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* GIS Location Viewport */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  GIS Spatial Context Viewport
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Lat: {inc.latitude}, Long: {inc.longitude}
                </span>
              </div>
              <MapContainer
                title={`${inc.location} (${inc.ward_zone})`}
                subtitle={`Affected Buffer Zone Radius: 500m — ${inc.affected_departments.length} Departments In Scope`}
                height="320px"
              />
            </Card>

            {/* Knowledge Graph Contextual Intelligence Card */}
            {incidentContext && (
              <Card className="p-5 border-indigo-200 bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                      SCOS Knowledge Graph Context
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Active Graph Topology
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Nearby Infrastructure Assets
                    </span>
                    <ul className="space-y-1 font-medium text-slate-800">
                      {incidentContext.nearbyAssets.map((a) => (
                        <li key={a.id} className="flex items-center justify-between">
                          <span>{a.name}</span>
                          <span className="text-[9px] font-mono text-slate-500">{a.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Nearby Critical Facilities
                    </span>
                    <ul className="space-y-1 font-medium text-slate-800">
                      {incidentContext.nearbyFacilities.map((f) => (
                        <li key={f.id} className="flex items-center justify-between">
                          <span>{f.name}</span>
                          <span className="text-[9px] font-mono text-emerald-700 font-bold">450 Beds</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Historical Events */}
                {incidentContext.historicalEvents.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                        Correlated Historical Events
                      </span>
                      <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Simulated historical data
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {incidentContext.historicalEvents.map((h) => (
                        <div key={h.id} className="p-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
                          <p className="font-bold">{h.name}</p>
                          <p className="text-[11px] text-amber-800">{h.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* SCOS Civil Infrastructure & Spatial Intelligence Impact Card */}
            {civilImpact && (
              <Card className="p-5 border-sky-200 bg-white space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                      SCOS CIVIL INFRASTRUCTURE & SPATIAL IMPACT
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Proximity & Cascade Engine
                  </span>
                </div>

                {/* Nearby Infrastructure Assets */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Nearby Civil Infrastructure ({civilImpact.nearbyAssets.length} Assets within 2.5km)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {civilImpact.nearbyAssets.slice(0, 4).map((res) => (
                      <div
                        key={res.asset.assetId}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">{res.asset.assetName}</span>
                          <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                            {res.distanceKm}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{res.asset.department} • Status: {res.asset.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cascade Impact Chain */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Civil Infrastructure Cascade Chain
                  </span>
                  <div className="space-y-2">
                    {civilImpact.impactChain.map((step) => (
                      <div
                        key={step.step}
                        className="p-3 bg-sky-50/40 border border-sky-100 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Step {step.step}: {step.affectedAsset}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {step.verificationStatus}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px]">{step.potentialImpact}</p>
                        {step.mitigationAction && (
                          <p className="text-[10px] text-sky-800 font-medium">
                            Proposed Action: {step.mitigationAction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 font-medium">
                  {civilImpact.disclaimer}
                </div>
              </Card>
            )}

            {/* SCOS Multi-Department Operational Coordination Section */}
            <DepartmentCoordinationPanel incident={inc} />

            {/* SCOS Operational Decision Support Section */}
            <IncidentDecisionSupportSection incidentId={inc.incident_id} incident={inc} />

            {/* SCOS Urban Digital Twin Foundation Context */}
            <IncidentDigitalTwinSection incident={inc} />

            {/* SCOS Predictive Risk Assessment Section */}
            <Card className="p-5 border-amber-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                    SCOS PREDICTIVE RISK ASSESSMENT
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Prototype Predictive Assessment
                </span>
              </div>

              {!predictiveAssessment && !predictiveError && (
                <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Evaluate predictive risk model for this incident location, severity, and telemetry context.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunPredictiveAssessment}
                    isLoading={isEvaluatingPredictive}
                    icon={<Zap className="w-3.5 h-3.5 text-amber-600" />}
                    className="text-xs border-amber-300 text-amber-900 hover:bg-amber-50"
                  >
                    Run Predictive Assessment
                  </Button>
                </div>
              )}

              {predictiveError && (
                <div className="p-4 text-center bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-rose-800">
                    Predictive assessment currently unavailable.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunPredictiveAssessment}
                    isLoading={isEvaluatingPredictive}
                    className="text-xs text-rose-700 border-rose-300"
                  >
                    Retry Assessment
                  </Button>
                </div>
              )}

              {predictiveAssessment && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Risk Level</span>
                      <span className="text-sm font-bold text-amber-900">{predictiveAssessment.risk_level}</span>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Risk Score</span>
                      <span className="text-sm font-bold text-amber-900">{predictiveAssessment.risk_score} / 100</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Key Risk Factors</h5>
                    <ul className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                      {predictiveAssessment.key_risk_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Potential Service Impact</h5>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 space-y-1">
                      {predictiveAssessment.potential_service_impacts.map((impact, idx) => (
                        <p key={idx}>{impact}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1.5">Preventive Actions</h5>
                    <div className="space-y-1.5">
                      {predictiveAssessment.preventive_actions.map((act, idx) => (
                        <div key={idx} className="p-2 bg-indigo-50/50 border border-indigo-200 rounded-lg text-indigo-950 font-medium">
                          {act}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Evaluated: {new Date(predictiveAssessment.evaluated_at).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRunPredictiveAssessment}
                      isLoading={isEvaluatingPredictive}
                      className="text-[11px] h-7"
                    >
                      Re-Run
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            {/* SCOS CASCADE IMPACT ANALYSIS CARD */}
            <Card className="p-5 border-rose-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
                    SCOS CASCADE IMPACT ANALYSIS
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Multi-Tier Ripple Simulation
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-sans">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">Primary Trigger</span>
                  <p className="font-bold text-slate-900">Heavy Rainfall & Standing Surface Inundation</p>
                  <p className="text-[11px] text-slate-600">0.65m standing water at Parade Crossing & Mall Road</p>
                </div>

                <div className="relative pl-4 border-l-2 border-rose-300 space-y-2 py-1">
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-amber-900 uppercase">Tier 1 Cascade (Potential)</span>
                    <p className="font-bold text-amber-950 text-[11px]">Roadway Conduit Obstruction & Traffic Diversion</p>
                    <p className="text-[10px] text-amber-800">Commercial traffic blockage requires verification by Traffic Police.</p>
                  </div>

                  <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-rose-900 uppercase">Tier 2 Cascade (Possible)</span>
                    <p className="font-bold text-rose-950 text-[11px]">Critical Facility Access Route Disruption</p>
                    <p className="text-[10px] text-rose-800">Hospital ambulance access to Ursula Horsman Casualty ward potentially constrained.</p>
                  </div>
                </div>

                <p className="text-[10px] italic text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                  * Note: Operational cascades are simulated estimates for decision support. Field verification required before dispatching emergency units.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Affected Departments & Quick Actions */}
          <div className="space-y-6">
            {/* PROTOTYPE DEMONSTRATION METRICS CARD */}
            <Card className="p-5 border-indigo-200 bg-indigo-50/20 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase text-indigo-900 tracking-wider">
                    PROTOTYPE DEMONSTRATION METRICS
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                  Live Telemetry
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Departments</span>
                  <span className="text-sm font-bold text-slate-900">{inc.affected_departments.length} Involved</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Tasks Generated</span>
                  <span className="text-sm font-bold text-indigo-700">{inc.assigned_tasks.length} Active</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Graph Entities</span>
                  <span className="text-sm font-bold text-slate-900">
                    {incidentContext ? incidentContext.nearbyAssets.length + incidentContext.nearbyFacilities.length : 3} Nodes
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Audit Events</span>
                  <span className="text-sm font-bold text-slate-900">{selectedTimeline.length} Logs</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Predictive Compute</span>
                  <span className="text-xs font-bold text-amber-800">~120 ms</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">AI Triage Compute</span>
                  <span className="text-xs font-bold text-indigo-800">~450 ms</span>
                </div>
              </div>
            </Card>

            {/* Affected Departments Summary */}
            <Card className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                Affected Department Matrix
              </h4>

              <div className="space-y-2.5">
                {inc.affected_departments.map((deptCode) => {
                  const dept = DEPARTMENT_MAP[deptCode] || { name: deptCode, code: deptCode, color: '#6366f1' };
                  const isPrimary = deptCode === inc.primary_department;
                  const deptTasks = inc.assigned_tasks.filter((t) => t.department_id === deptCode);
                  const isDone = deptTasks.length > 0 && deptTasks.every((t) => t.status === 'COMPLETED');

                  return (
                    <div
                      key={deptCode}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: dept.color }}
                          />
                          <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                          {isPrimary ? 'Primary Lead Dept' : 'Secondary Coordinated Dept'}
                        </span>
                      </div>

                      <StatusBadge
                        status={isDone ? 'NORMAL' : deptTasks.length > 0 ? 'WARNING' : 'NEUTRAL'}
                        label={isDone ? 'Completed' : deptTasks.length > 0 ? 'Active' : 'Standby'}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Demo SLA Escalation Control Card */}
            <Card className="p-5 space-y-3 bg-amber-50/50 border-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                <Clock className="w-4 h-4 text-amber-600" />
                Demo SLA & Escalation Engine
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                For thesis validation, click below to simulate an SLA timeout and observe automatic escalation to Department Head and District Magistrate.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateSlaEscalation()}
                isLoading={isLoading}
                icon={<Zap className="w-3.5 h-3.5 text-amber-600" />}
                className="w-full text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Simulate SLA Timeout & Escalate
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT TASKS */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Cross-Department Coordination Tasks
            </h3>
            <span className="text-xs text-slate-500">
              {inc.assigned_tasks.filter((t) => t.status === 'COMPLETED').length} of {inc.assigned_tasks.length} Completed
            </span>
          </div>

          {inc.assigned_tasks.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-xs text-slate-600">No active tasks created yet.</p>
              <p className="text-xs text-slate-400">Approve the AI Recommendation above to generate tasks.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inc.assigned_tasks.map((task) => (
                <Card key={task.task_id} className="p-4 border-slate-200 space-y-3 bg-white">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {task.task_id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{task.department_name}</h4>
                    </div>
                    <StatusBadge status={task.status as any} label={task.status} />
                  </div>

                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    {task.task_description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                    <span>Demo SLA: {task.demo_sla_minutes} mins</span>
                    <span>Due: {new Date(task.due_time).toLocaleTimeString()}</span>
                  </div>

                  {/* Task Notes */}
                  {task.notes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] font-bold uppercase text-slate-500">Field Updates:</p>
                      {task.notes.map((n) => (
                        <div key={n.id} className="p-2 bg-slate-50 rounded text-[11px] text-slate-700">
                          <span className="font-bold">{n.authorName}:</span> "{n.text}"
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Note Input & Status Control */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Input
                      placeholder="Add field note or update..."
                      value={taskNoteText[task.task_id] || ''}
                      onChange={(e) =>
                        setTaskNoteText((prev) => ({ ...prev, [task.task_id]: e.target.value }))
                      }
                      className="text-xs"
                    />

                    <div className="flex flex-wrap gap-2">
                      {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskStatusChange(task.task_id, 'IN_PROGRESS')}
                          className="text-xs"
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {task.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleTaskStatusChange(task.task_id, 'COMPLETED')}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Mark Completed
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSimulateSlaEscalation(task.task_id)}
                        className="text-xs text-amber-700 border-amber-300"
                      >
                        Escalate Task
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Incident Event Audit Timeline
            </h3>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              SIMULATED DEMONSTRATION TIMELINE
            </span>
          </div>

          <div className="relative border-l-2 border-indigo-200 ml-3 space-y-6 pl-5 font-sans">
            {selectedTimeline.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-2xs" />
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{ev.event_type}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">{ev.title}</h4>
                <p className="text-xs text-slate-700 mt-0.5">{ev.description}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Actor: {ev.actor_name} ({ev.actor_role}) {ev.department_name ? `• ${ev.department_name}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: GOVERNANCE & ETHICS */}
      {activeTab === 'GOVERNANCE' && (
        <Card className="p-5 space-y-4 font-sans">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            SCOS AI Governance & Research Compliance Architecture
          </h3>

          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2 text-xs text-slate-800">
            <p className="font-bold text-indigo-900">M.Tech Thesis System Mapping:</p>
            <p>
              <strong>Data Layer:</strong> Multi-sensor IoT telemetry, citizen complaint feeds, and GIS spatial layer maps.
            </p>
            <p>
              <strong>Intelligence Layer:</strong> Gemini AI multi-agent triage combined with SCOS deterministic impact rules.
            </p>
            <p>
              <strong>Decision Layer:</strong> Strict Human-in-the-Loop policy requiring authorized officer approval for cross-department task dispatch.
            </p>
            <p>
              <strong>Coordination Engine:</strong> Role-based department task queues with automated Demo SLA escalation tiers.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
