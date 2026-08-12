import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Sparkles,
  MapPin,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Brain,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { MetricCard, Card } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapContainer, MapMarker } from '../ui/MapContainer';
import { LineChartCard, BarChartCard, DonutChartCard } from '../ui/charts/Charts';
import {
  IncidentCard,
  AIRecommendationCard,
  DepartmentStatusCard,
  SystemHealthCard,
} from '../operational/OperationalCards';

export interface DashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Synthetic Demo Data for SCOS Urban Command Dashboard
  const DEMO_MARKERS: MapMarker[] = [
    {
      id: 'm1',
      lat: 26.4499,
      lng: 80.3319,
      title: 'Zone 4 Sewage Pipeline Main Overcapacity',
      category: 'WATER',
      status: 'CRITICAL',
      details: 'Flow rate: 142 L/s. Hydraulic pressure exceeding 4.2 bar threshold.',
    },
    {
      id: 'm2',
      lat: 26.46,
      lng: 80.32,
      title: 'Parade Crossing Traffic Light Signal Outage',
      category: 'TRAFFIC',
      status: 'WARNING',
      details: 'Intersection sensor communication timeout (14 mins).',
    },
    {
      id: 'm3',
      lat: 26.43,
      lng: 80.35,
      title: 'Bithoor Ganga Outfall Turbidity Node #02',
      category: 'WATER',
      status: 'NORMAL',
      details: 'Turbidity: 18 NTU. Dissolved Oxygen: 6.8 mg/L.',
    },
    {
      id: 'm4',
      lat: 26.48,
      lng: 80.30,
      title: 'Kalyanpur Solid Waste Transfer Station',
      category: 'MUNICIPAL',
      status: 'NORMAL',
      details: 'Compactor vehicle #14 dispatched.',
    },
  ];

  const HOURLY_INCIDENTS_DATA = [
    { time: '06:00', water: 4, traffic: 12, municipal: 8, health: 1 },
    { time: '09:00', water: 9, traffic: 28, municipal: 19, health: 3 },
    { time: '12:00', water: 15, traffic: 34, municipal: 22, health: 5 },
    { time: '15:00', water: 12, traffic: 26, municipal: 18, health: 2 },
    { time: '18:00', water: 8, traffic: 31, municipal: 14, health: 4 },
    { time: '21:00', water: 5, traffic: 14, municipal: 9, health: 1 },
  ];

  const INCIDENT_DISTRIBUTION = [
    { name: 'Water & Sewage', value: 42, color: '#2563eb' },
    { name: 'Traffic & Road', value: 28, color: '#f59e0b' },
    { name: 'Sanitation & Solid Waste', value: 20, color: '#10b981' },
    { name: 'Health & Sanitation', value: 10, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="District Command & Operational Center"
        description="Unified urban operating canvas for Kanpur District Administration. Real-time telemetry, AI triage, predictive intelligence, and cross-departmental coordination."
        statusBadge={<StatusBadge status="NORMAL" label="District Operations Normal" pulse />}
        breadcrumbs={[{ label: 'Urban Command Dashboard' }]}
        primaryAction={{
          label: 'Predictive Intelligence',
          icon: <Brain className="w-4 h-4" />,
          onClick: () => onNavigateTab('predictive'),
        }}
        secondaryActions={
          <Button variant="outline" size="md" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={() => onNavigateTab('reports')}>
            Export Brief
          </Button>
        }
      />

      {/* Predictive Intelligence Command Alert Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-indigo-500/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                SCOS Predictive Engine Active
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                1 Early Warning Pending Review
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              Parade Crossing Waterlogging Risk: HIGH (78/100) — Expected in Next 2 Hours
            </h4>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onNavigateTab('predictive')}
          className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs"
        >
          Review Early Warning & Decision Support →
        </Button>
      </div>

      {/* KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active District Incidents"
          value={42}
          unit="Cases"
          subtitle="Cross-departmental grievances"
          trend={{ value: '12%', direction: 'down', label: 'vs yesterday' }}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          badge={<StatusBadge status="WARNING" size="sm" label="4 Critical" />}
        />

        <MetricCard
          title="AI Triage Efficiency"
          value="94.2"
          unit="%"
          subtitle="Auto-categorized grievances"
          trend={{ value: '3.8%', direction: 'up', label: 'this week' }}
          icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
          badge={<AiBadge status="ACTIVE" size="sm" />}
        />

        <MetricCard
          title="SLA Resolution Time"
          value="4.2"
          unit="Hours"
          subtitle="Average turnaround time"
          trend={{ value: '18 mins', direction: 'down', label: 'improved' }}
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
          badge={<StatusBadge status="NORMAL" size="sm" label="On Track" />}
        />

        <MetricCard
          title="IoT Spatial Nodes"
          value="184"
          unit="Sensors"
          subtitle="Water, Traffic & Waste GIS"
          trend={{ value: '100%', direction: 'neutral', label: 'reporting' }}
          icon={<Activity className="w-5 h-5 text-sky-600" />}
          badge={<StatusBadge status="NORMAL" size="sm" label="100% Online" />}
        />
      </div>

      {/* Center Grid: GIS Canvas Map + Active AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapContainer
            title="District Spatial Telemetry Canvas"
            subtitle="Live GIS Asset Markers — Kanpur Nagar Command Grid"
            markers={DEMO_MARKERS}
            height="380px"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Active AI Advisory
          </h3>

          <AIRecommendationCard
            id="rec-101"
            title="Auto-Reroute Zone 4 Water Discharge to Buffer Trunk #2"
            reason="Pressure at Jajmau outflow reached 4.2 bar (over 3.8 bar threshold). Redirecting 25% flow reduces pipe burst probability by 88%."
            confidence={96}
            affectedDepartment="Kanpur Jal Sansthan"
            requiredReview={true}
            actionText="Approve Flow Redirect"
            onApplyRecommendation={(id) => alert(`Approved AI Recommendation ${id}`)}
          />

          <SystemHealthCard
            services={[
              { name: 'Grievance Triage Engine', status: 'OPERATIONAL', latencyMs: 24 },
              { name: 'GIS Spatial Server', status: 'OPERATIONAL', latencyMs: 42 },
              { name: 'Ganga Flood Predictor', status: 'OPERATIONAL', latencyMs: 68 },
              { name: 'CPGRAMS Sync Gateway', status: 'DEGRADED', latencyMs: 180 },
            ]}
            lastUpdated="1 min ago"
          />
        </div>
      </div>

      {/* Grid Section: Department Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-600" /> Municipal Department Status Overview
          </h3>
          <button
            onClick={() => onNavigateTab('departments')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Manage Departments & Teams →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DepartmentStatusCard
            id="dept- जल"
            code="KJS-01"
            departmentName="Kanpur Jal Sansthan (Water Works)"
            status="OPERATIONAL"
            activeIncidentsCount={18}
            pendingTasksCount={12}
            slaPercent={92}
            officerInCharge="Dr. R. K. Verma"
            onClick={() => onNavigateTab('departments')}
          />

          <DepartmentStatusCard
            id="dept- नगर"
            code="KNN-01"
            departmentName="Kanpur Nagar Nigam (Municipal Corp)"
            status="OPERATIONAL"
            activeIncidentsCount={14}
            pendingTasksCount={8}
            slaPercent={95}
            officerInCharge="Shri S. K. Gupta"
            onClick={() => onNavigateTab('departments')}
          />

          <DepartmentStatusCard
            id="dept- traffic"
            code="KTP-01"
            departmentName="Traffic Police & Transport Dept"
            status="DEGRADED"
            activeIncidentsCount={8}
            pendingTasksCount={14}
            slaPercent={84}
            officerInCharge="ACP M. P. Singh"
            onClick={() => onNavigateTab('departments')}
          />

          <DepartmentStatusCard
            id="dept- health"
            code="CMO-01"
            departmentName="District Health & Emergency Services"
            status="OPERATIONAL"
            activeIncidentsCount={2}
            pendingTasksCount={3}
            slaPercent={98}
            officerInCharge="Dr. Alok Kumar"
            onClick={() => onNavigateTab('departments')}
          />
        </div>
      </div>

      {/* SCOS Knowledge Graph Contextual Intelligence Quick Access Banner */}
      <Card className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md font-sans">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-500/50 text-indigo-300">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">SCOS Knowledge Graph & Contextual Intelligence Layer</h4>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/40">
                Phase 5B.6 Active
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              18 Graph Entities • 20 Relationship Edges • Multi-tier Cascade Impact Analysis Engine
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => onNavigateTab('knowledge-graph')}
          icon={<Sparkles className="w-3.5 h-3.5" />}
          className="text-xs shrink-0"
        >
          Explore Knowledge Graph
        </Button>
      </Card>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChartCard
            title="Hourly Grievance Inflow by Department"
            subtitle="Real-time incident rate across 24-hour cycle"
            data={HOURLY_INCIDENTS_DATA}
            xKey="time"
            lines={[
              { key: 'water', name: 'Water Works', color: '#2563eb' },
              { key: 'traffic', name: 'Traffic Police', color: '#f59e0b' },
              { key: 'municipal', name: 'Sanitation', color: '#10b981' },
            ]}
          />
        </div>

        <div>
          <DonutChartCard
            title="Incident Category Distribution"
            subtitle="Percentage share of active cases"
            data={INCIDENT_DISTRIBUTION}
          />
        </div>
      </div>
    </div>
  );
};
