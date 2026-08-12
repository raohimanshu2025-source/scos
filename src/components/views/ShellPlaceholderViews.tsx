import React from 'react';
import {
  Activity,
  MapPin,
  Brain,
  BarChart3,
  FileText,
  Bell,
  HelpCircle,
  Sparkles,
  Layers,
  Inbox,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Card, MetricCard } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/Feedback';
import { IncidentCard } from '../operational/OperationalCards';
import { MapContainer } from '../ui/MapContainer';

// 1. OperationsView
export const OperationsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="District Grievances & Dispatch Operations"
        description="Unified operations queue for civic grievance resolution, field squad dispatching, and cross-departmental SLA tracking."
        statusBadge={<StatusBadge status="NORMAL" label="Operations Active" />}
        breadcrumbs={[{ label: 'Operations' }]}
        primaryAction={{
          label: 'Create New Incident',
          icon: <Activity className="w-4 h-4" />,
          onClick: () => alert('Incident Creation Dialog (Phase 5B.4)'),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <IncidentCard
          id="INC-7842"
          title="Overflowing Sewage Line & Water Contamination Zone 4"
          department="Kanpur Jal Sansthan"
          location="Jajmau Sector 2"
          status="CRITICAL"
          timeAgo="14 mins ago"
          assignedTeam="Jal Squad #3"
          priority="CRITICAL"
          onActionClick={(id) => alert(`Reviewing ${id}`)}
        />
        <IncidentCard
          id="INC-7845"
          title="Traffic Signal Sensor Communication Timeout"
          department="Traffic Police Dept"
          location="Parade Crossing"
          status="WARNING"
          timeAgo="32 mins ago"
          assignedTeam="Signal Unit #1"
          priority="HIGH"
          onActionClick={(id) => alert(`Reviewing ${id}`)}
        />
        <IncidentCard
          id="INC-7848"
          title="Solid Waste Collection Backlog - Kalyanpur Market"
          department="Kanpur Nagar Nigam"
          location="Kalyanpur Main Road"
          status="NORMAL"
          timeAgo="1 hour ago"
          assignedTeam="Sanitation Crew #12"
          priority="MEDIUM"
          onActionClick={(id) => alert(`Reviewing ${id}`)}
        />
      </div>
    </div>
  );
};

// 2. GisView
export const GisView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="GIS Spatial Intelligence Platform"
        description="Multi-layer geospatial command interface. Spatial analytics for water outfalls, traffic corridors, and municipal assets."
        breadcrumbs={[{ label: 'GIS' }]}
      />

      <MapContainer
        title="Kanpur Nagar GIS Spatial Command Viewport"
        subtitle="Live GeoJSON Layers & IoT Asset Nodes — WGS84 Spatial Projection"
        height="500px"
      />
    </div>
  );
};

// 3. AiCommandView
export const AiCommandView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Governance Command Center"
        description="Multi-agent AI triage, predictive flood advisory, automated grievance categorisation, and human-in-the-loop governance policies."
        statusBadge={<AiBadge status="ACTIVE" label="AI Multi-Agent System Operational" />}
        breadcrumbs={[{ label: 'AI Command' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Triage Accuracy"
          value="98.4%"
          subtitle="Validated by Department Heads"
          icon={<Brain className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="Auto-Routed Cases"
          value="1,420"
          subtitle="Cases processed automatically"
          icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Human Oversight SLA"
          value="100%"
          subtitle="Compliance with AI ethics policy"
          icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <Card>
        <EmptyState
          title="AI Multi-Agent Simulation Engine (Phase 5B.5)"
          description="The AI Multi-Agent orchestration workspace, Ganges flood neural predictor, and LLM triage pipeline will be activated in Phase 5B.5."
          icon={<Brain className="w-8 h-8 text-indigo-600" />}
        />
      </Card>
    </div>
  );
};

// 4. AnalyticsView
export const AnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="District Governance Analytics & SLAs"
        description="Longitudinal metrics, department response efficiency, citizen satisfaction index, and predictive urban trends."
        breadcrumbs={[{ label: 'Analytics' }]}
      />

      <Card>
        <EmptyState
          title="Executive Analytics Module (Phase 5B.6)"
          description="Detailed district analytics and cross-departmental trend visualizations will be rendered in Phase 5B.6."
          icon={<BarChart3 className="w-8 h-8 text-sky-600" />}
        />
      </Card>
    </div>
  );
};

// 5. ReportsView
export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Reports & Thesis Briefs"
        description="Automated briefing documents for District Magistrate meetings, CPGRAMS compliance summaries, and IIT Kanpur thesis evaluation exports."
        breadcrumbs={[{ label: 'Reports' }]}
      />

      <Card>
        <EmptyState
          title="Automated Report Builder"
          description="Generate PDF and CSV executive reports for district administration reviews."
          icon={<FileText className="w-8 h-8 text-slate-600" />}
        />
      </Card>
    </div>
  );
};

// 6. NotificationsView
export const NotificationsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Stream & Security Audits"
        description="Real-time alert log, system event stream, RBAC access logs, and critical operational broadcasts."
        breadcrumbs={[{ label: 'Notifications' }]}
      />

      <Card>
        <EmptyState
          title="Notifications Stream"
          description="All system notifications are accessible via the top bar Notification Center."
          icon={<Bell className="w-8 h-8 text-amber-600" />}
        />
      </Card>
    </div>
  );
};

// 7. HelpView
export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Help, SCOS Manual & Thesis Context"
        description="IIT Kanpur M.Tech Thesis Architecture Overview for Smart City Operating System (AI-SCOS)."
        breadcrumbs={[{ label: 'Help & Manual' }]}
      />

      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Project Architecture & Principles
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          AI-SCOS is an enterprise-grade Smart City Operating System designed for Indian District Administration. It connects municipal departments (Water, Sanitation, Traffic, Health) through a unified RBAC-protected application shell with real-time AI triage and GIS spatial awareness.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
          <p><strong>Thesis Title:</strong> AI-SCOS: Urban Governance Operating System</p>
          <p><strong>Institution:</strong> IIT Kanpur — Department of Computer Science & Automation</p>
          <p><strong>Context Scope:</strong> Kanpur Nagar District Administration</p>
          <p><strong>Phase Completed:</strong> Phase 5B.3 — Design System & Application Shell</p>
        </div>
      </Card>
    </div>
  );
};
