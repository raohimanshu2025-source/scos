import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Table as TableIcon,
  MousePointer,
  Info,
  Sliders,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Button } from '../ui/Button';
import { StatusBadge, AiBadge, DepartmentBadge } from '../ui/Badge';
import { Card, MetricCard } from '../ui/Card';
import { Input, Select, SearchInput, Checkbox, Toggle, Textarea } from '../ui/FormControls';
import { Table, Pagination } from '../ui/Table';
import { Alert, Modal, Drawer, Skeleton, EmptyState, ErrorState, ConfirmationDialog, Accordion } from '../ui/Feedback';
import { IncidentCard, AIRecommendationCard, DepartmentStatusCard, SystemHealthCard } from '../operational/OperationalCards';
import { SCOSTokens } from '../../design-system/tokens';

export const DesignSystemView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'operational' | 'forms'>('tokens');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggleVal, setToggleVal] = useState(true);

  const sampleTableData = [
    { id: 'REC-01', name: 'Jajmau Outfall Sensor #12', type: 'Water Pressure Node', status: 'NORMAL', val: '4.2 bar' },
    { id: 'REC-02', name: 'Parade Crossing Camera #04', type: 'Traffic Optical Node', status: 'WARNING', val: 'Timeout' },
    { id: 'REC-03', name: 'Bithoor Pumping Station B-1', type: 'Water Flow Asset', status: 'CRITICAL', val: '0 L/s' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SCOS Centralized Design System & UI Kit"
        description="Institutional design language, atomic controls, operational cards, and data visualization tokens for Smart City Operating System (IIT Kanpur Thesis)."
        statusBadge={<StatusBadge status="NORMAL" label="Design System v5B.3 Active" />}
        breadcrumbs={[{ label: 'Design System' }]}
      >
        <div className="flex items-center gap-2 pt-2">
          {['tokens', 'components', 'operational', 'forms'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* SECTION 1: DESIGN TOKENS */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Colors */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" /> Operational Status Tokens
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['NORMAL', 'WATCH', 'WARNING', 'CRITICAL', 'OFFLINE'] as const).map((st) => (
                <div key={st} className="p-3 rounded-xl border space-y-2 bg-slate-50">
                  <StatusBadge status={st} size="sm" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{st}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Advisory Status Tokens
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['ACTIVE', 'RECOMMENDATION', 'REVIEW_REQUIRED', 'CONFIDENCE_LOW'] as const).map((st) => (
                <div key={st} className="p-3 rounded-xl border space-y-2 bg-slate-50">
                  <AiBadge status={st} size="sm" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">{st}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Typography */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-600" /> Typography Scale
            </h3>
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Display (32px / 700)</span>
                <span className="text-2xl font-bold text-slate-900">SCOS Command Canvas</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">H1 (24px / 700)</span>
                <span className="text-xl font-bold text-slate-900">District Magistrate Dashboard</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">H2 (20px / 600)</span>
                <span className="text-lg font-semibold text-slate-900">Municipal Water & Sewage Operations</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">Body (14px / 400)</span>
                <p className="text-xs text-slate-700">
                  The interface balances institutional clarity with real-time operational awareness for Kanpur District Administration.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 2: UI COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* Buttons */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-indigo-600" /> Buttons & Action Controls
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="danger">Danger Action</Button>
              <Button variant="success">Success Action</Button>
              <Button variant="primary" isLoading>
                Loading State
              </Button>
            </div>
          </Card>

          {/* Feedback & Alerts */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" /> Institutional Alert Banners
            </h3>
            <div className="space-y-3">
              <Alert type="info" title="System Notice">
                Ganga Flood Predictor telemetry synchronization complete for Bithoor Reach.
              </Alert>
              <Alert type="warning" title="Watch Status">
                Parade Crossing Traffic Signal Sensor experiencing high communication latency.
              </Alert>
              <Alert type="error" title="Critical Incident">
                Zone 4 Jajmau Sewage Trunk pressure drop detected (2.1 bar).
              </Alert>
            </div>
          </Card>

          {/* Modals & Dialog Triggers */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Modal & Drawer Controls</h3>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Open Sample Modal
              </Button>
              <Button variant="outline" onClick={() => setDrawerOpen(true)}>
                Open Sample Drawer
              </Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Open Confirmation Dialog
              </Button>
            </div>
          </Card>

          {/* Table */}
          <Card padding="none">
            <div className="p-4 border-b border-slate-100 font-bold text-xs">Sample Data Table Component</div>
            <Table
              data={sampleTableData}
              columns={[
                { header: 'ID', accessor: 'id' },
                { header: 'Asset Name', accessor: 'name' },
                { header: 'Category', accessor: 'type' },
                { header: 'Status', accessor: (r) => <StatusBadge status={r.status as any} size="sm" /> },
                { header: 'Telemetry', accessor: 'val' },
              ]}
              keyExtractor={(r) => r.id}
            />
          </Card>
        </div>
      )}

      {/* SECTION 3: OPERATIONAL CARDS */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IncidentCard
              id="INC-8901"
              title="Pipeline Leakage & Water Disturbance at Kidwai Nagar"
              department="Kanpur Jal Sansthan"
              location="Kidwai Nagar Block C"
              status="CRITICAL"
              timeAgo="12 mins ago"
              assignedTeam="Squad #4"
              priority="CRITICAL"
              onActionClick={(id) => alert(`Action on ${id}`)}
            />

            <AIRecommendationCard
              id="rec-202"
              title="Disallow Heavy Commercial Vehicles on Ganga Bridge Route"
              reason="Traffic congestion model predicts 42 min delay if trucks enter during 08:00 peak hours."
              confidence={92}
              affectedDepartment="Traffic Police"
              requiredReview={true}
            />
          </div>
        </div>
      )}

      {/* SECTION 4: FORMS */}
      {activeTab === 'forms' && (
        <Card className="space-y-4 max-w-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Form Controls Showcase</h3>
          <Input label="Grievance Subject Title" placeholder="e.g. Overflowing water pipe" required />
          <Select
            label="Responsible Department"
            options={[
              { value: 'water', label: 'Kanpur Jal Sansthan' },
              { value: 'municipal', label: 'Kanpur Nagar Nigam' },
            ]}
          />
          <Textarea label="Incident Detailed Description" placeholder="Enter full details..." />
          <div className="flex items-center gap-6 pt-2">
            <Checkbox label="Mandatory Escalation" description="Route directly to District Magistrate" />
            <Toggle checked={toggleVal} onChange={setToggleVal} label="Enable AI Auto-Triage" />
          </div>
        </Card>
      )}

      {/* Interactive Modals */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Sample Governance Modal">
        <p className="text-xs text-slate-600 mb-4">This is a standardized SCOS dialog box following design system guidelines.</p>
        <Button variant="primary" onClick={() => setModalOpen(false)}>
          Dismiss
        </Button>
      </Modal>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Sample Drawer Panel">
        <p className="text-xs text-slate-600">Sample drawer panel content.</p>
      </Drawer>

      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Escalate Incident to District Magistrate"
        message="Are you sure you want to escalate this critical grievance directly to DM Kanpur Nagar?"
        onConfirm={() => {
          setConfirmOpen(false);
          alert('Escalated!');
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};
