/**
 * SCOS Phase 5B.4 — District Command & Cross-Department Operations Center View
 */

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Card, MetricCard } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormControls';
import { useIncidents } from '../../context/IncidentContext';
import { IncidentCreateModal } from '../operational/IncidentCreateModal';
import { DemoScenarioPlayer } from '../operational/DemoScenarioPlayer';
import { IncidentDetailView } from './IncidentDetailView';
import { Incident } from '../../types/incident';
import { DEPARTMENT_MAP } from '../../services/impactMappingRules';

export const OperationsView: React.FC = () => {
  const { incidents, selectedIncident, selectIncidentById, isLoading } = useIncidents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingDetailId, setViewingDetailId] = useState<string | null>(null);

  if (viewingDetailId) {
    return (
      <IncidentDetailView
        incidentId={viewingDetailId}
        onBack={() => setViewingDetailId(null)}
      />
    );
  }

  // Filter logic
  const filteredIncidents = incidents.filter((inc) => {
    if (filterDept !== 'ALL' && !inc.affected_departments.includes(filterDept)) {
      return false;
    }
    if (filterCategory !== 'ALL' && inc.category !== filterCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchLoc = inc.location.toLowerCase().includes(q);
      const matchId = inc.incident_id.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchId) return false;
    }
    return true;
  });

  // Metrics
  const totalIncidents = incidents.length;
  const pendingAiReview = incidents.filter((i) => i.AI_assessment?.status === 'PENDING_REVIEW').length;
  const escalatedCount = incidents.filter((i) => i.escalation_level > 0 || i.current_status === 'ESCALATED').length;
  const resolvedCount = incidents.filter((i) => i.current_status === 'RESOLVED').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <PageHeader
        title="District Command & Cross-Department Operations Center"
        description="Unified urban event triage engine, multi-department task dispatch, human governance workflow, and SLA escalation tracking."
        statusBadge={<StatusBadge status="NORMAL" label="Operations Active" />}
        breadcrumbs={[{ label: 'Operations' }]}
        primaryAction={{
          label: 'Create Incident',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setShowCreateModal(true),
        }}
      />

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Incidents"
          value={totalIncidents.toString()}
          subtitle="Cross-Department Scope"
          icon={<Activity className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Pending Officer Approvals"
          value={pendingAiReview.toString()}
          subtitle="AI Triage Review Queue"
          icon={<Sparkles className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Demo SLA Escalated"
          value={escalatedCount.toString()}
          subtitle="Level 1/2 Officer Escalations"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />
        <MetricCard
          title="Resolved Incidents"
          value={resolvedCount.toString()}
          subtitle="All Tasks Completed"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Heavy Rainfall Thesis Demonstration Scenario Interactive Player */}
      <DemoScenarioPlayer />

      {/* Search & Queue Controls */}
      <Card className="p-4 space-y-3 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, location, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Departments' },
                { value: 'MUNICIPAL', label: 'Kanpur Nagar Nigam' },
                { value: 'WATER', label: 'Kanpur Jal Sansthan' },
                { value: 'TRAFFIC', label: 'Traffic Police' },
                { value: 'HEALTH', label: 'District Health' },
              ]}
              className="text-xs"
            />

            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'WATERLOGGING', label: 'Waterlogging' },
                { value: 'FLOODING', label: 'Flooding' },
                { value: 'WATER_SUPPLY_DISRUPTION', label: 'Water Supply' },
                { value: 'TRAFFIC_ACCIDENT', label: 'Traffic Accident' },
              ]}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Incidents Queue Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Active Urban Incidents Queue ({filteredIncidents.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Showing simulated Kanpur Nagar operational data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredIncidents.map((inc) => {
            const isDemo = inc.is_demo_scenario;
            return (
              <Card
                key={inc.incident_id}
                className="p-5 bg-white border-slate-200 hover:border-indigo-300 transition-all shadow-2xs space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        {inc.incident_id}
                      </span>
                      <StatusBadge status={inc.current_status as any} label={inc.current_status} />
                      {isDemo && (
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
                          Demo Scenario
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{inc.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      Priority: {inc.priority}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        selectIncidentById(inc.incident_id);
                        setViewingDetailId(inc.incident_id);
                      }}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Coordinate & View
                    </Button>
                  </div>
                </div>

                {/* Impact Summary */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {inc.AI_assessment?.impact_summary || inc.description}
                </p>

                {/* Cross-Department Live Status Matrix */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Cross-Department Status Matrix:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {inc.affected_departments.map((deptCode) => {
                      const deptName = DEPARTMENT_MAP[deptCode]?.name || deptCode;
                      const tasks = inc.assigned_tasks.filter((t) => t.department_id === deptCode);
                      const isCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');
                      const isInProgress = tasks.some((t) => t.status === 'IN_PROGRESS');

                      let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
                      let statusDot = 'bg-slate-400';
                      let statusText = 'Pending';

                      if (isCompleted) {
                        badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                        statusDot = 'bg-emerald-500';
                        statusText = 'Completed';
                      } else if (isInProgress) {
                        badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
                        statusDot = 'bg-amber-500';
                        statusText = 'In Progress';
                      }

                      return (
                        <div
                          key={deptCode}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badgeColor}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                          <span className="font-semibold">{deptCode}:</span>
                          <span>{statusText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
                  <span>Location: {inc.location} ({inc.ward_zone})</span>
                  <span>Reported: {new Date(inc.reported_at).toLocaleTimeString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Incident Creation Modal */}
      <IncidentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
