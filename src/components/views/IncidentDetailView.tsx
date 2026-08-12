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
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Card } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapContainer } from '../ui/MapContainer';
import { Input, Textarea } from '../ui/FormControls';
import { useIncidents } from '../../context/IncidentContext';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';
import { Incident, TaskStatus } from '../../types/incident';
import { DEPARTMENT_MAP } from '../../services/impactMappingRules';

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
    reAnalyzeWithAi,
    isLoading,
  } = useIncidents();

  const { loadIncidentContext, incidentContext } = useKnowledgeGraph();

  React.useEffect(() => {
    if (selectedIncident) {
      loadIncidentContext(selectedIncident.incident_id);
    }
  }, [selectedIncident?.incident_id]);

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

  return (
    <div className="space-y-6 font-sans">
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
          </div>

          {/* Right Column: Affected Departments & Quick Actions */}
          <div className="space-y-6">
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
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Incident Event Audit Timeline
          </h3>

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
