/**
 * SCOS Phase 5B.6 — SCOS Knowledge Graph & Contextual Intelligence Main View
 * Primary tabbed interface encompassing Visual Graph Explorer, Incident Context Engine,
 * Cascade Impact Analysis, Graph Statistics/Admin, 11-Step Demo Scenario, and Thesis Architecture.
 */

import React, { useState } from 'react';
import {
  Share2,
  Brain,
  ShieldAlert,
  BarChart2,
  Play,
  Layers,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { KnowledgeGraphExplorer } from '../graph/KnowledgeGraphExplorer';
import { IncidentContextEngine } from '../graph/IncidentContextEngine';
import { CascadeImpactView } from '../graph/CascadeImpactView';
import { GraphStatsView } from '../graph/GraphStatsView';
import { GraphScenarioPlayer } from '../graph/GraphScenarioPlayer';
import { ThesisArchitectureView } from '../graph/ThesisArchitectureView';

interface KnowledgeGraphViewProps {
  onNavigateToGis?: (lat: number, lng: number, title: string) => void;
  onBack?: () => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ onNavigateToGis, onBack }) => {
  const [activeTab, setActiveTab] = useState<
    'EXPLORER' | 'INCIDENT_CONTEXT' | 'CASCADE_IMPACT' | 'STATS_ADMIN' | 'SCENARIO' | 'THESIS'
  >('EXPLORER');

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <PageHeader
        title="SCOS Knowledge Graph & Contextual Intelligence Layer"
        description="Phase 5B.6 — Graph-based spatial, infrastructure, historical, and multi-department relationship reasoning."
        statusBadge={
          <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Active Context Engine
          </span>
        }
        breadcrumbs={[{ label: 'Urban Command' }, { label: 'Knowledge Graph' }]}
        primaryAction={
          onBack
            ? {
                label: 'Back to Dashboard',
                icon: <ArrowLeft className="w-4 h-4" />,
                onClick: onBack,
              }
            : undefined
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 font-medium text-xs overflow-x-auto pb-0.5">
        {[
          { id: 'EXPLORER', label: 'Graph Explorer', icon: <Share2 className="w-3.5 h-3.5" /> },
          { id: 'INCIDENT_CONTEXT', label: 'Incident Context Engine', icon: <Brain className="w-3.5 h-3.5" /> },
          { id: 'CASCADE_IMPACT', label: 'Cascade Impact Analysis', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
          { id: 'STATS_ADMIN', label: 'Graph Stats & Governance', icon: <BarChart2 className="w-3.5 h-3.5" /> },
          { id: 'SCENARIO', label: '11-Step Demo Scenario', icon: <Play className="w-3.5 h-3.5" /> },
          { id: 'THESIS', label: 'Thesis Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'EXPLORER' && (
        <KnowledgeGraphExplorer
          onViewOnMap={(lat, lng, name) => {
            if (onNavigateToGis) onNavigateToGis(lat, lng, name);
          }}
        />
      )}

      {activeTab === 'INCIDENT_CONTEXT' && <IncidentContextEngine />}

      {activeTab === 'CASCADE_IMPACT' && <CascadeImpactView />}

      {activeTab === 'STATS_ADMIN' && <GraphStatsView />}

      {activeTab === 'SCENARIO' && <GraphScenarioPlayer />}

      {activeTab === 'THESIS' && <ThesisArchitectureView />}
    </div>
  );
};
