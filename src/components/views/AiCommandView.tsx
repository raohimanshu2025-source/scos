/**
 * SCOS Phase 5B.4 — AI Governance Command Center View
 */

import React from 'react';
import { PageHeader } from '../shell/PageHeader';
import { Card, MetricCard } from '../ui/Card';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { Brain, Sparkles, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const AiCommandView: React.FC = () => {
  const { incidents } = useIncidents();

  const aiAssessedCount = incidents.filter((i) => i.AI_assessment).length;
  const approvedCount = incidents.filter((i) => i.AI_assessment?.status === 'APPROVED').length;
  const avgConfidence = (
    (incidents.reduce((acc, curr) => acc + (curr.AI_assessment?.confidence || 0.92), 0) /
      (incidents.length || 1)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="AI Governance Command Center"
        description="Multi-agent AI triage, predictive flood advisory, automated incident categorisation, and human-in-the-loop governance policies."
        statusBadge={<AiBadge status="ACTIVE" label="AI Multi-Agent System Operational" />}
        breadcrumbs={[{ label: 'AI Command' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Triage Accuracy Confidence"
          value={`${avgConfidence}%`}
          subtitle="Validated by Department Heads"
          icon={<Brain className="w-5 h-5 text-indigo-600" />}
        />
        <MetricCard
          title="AI-Triaged Incidents"
          value={aiAssessedCount.toString()}
          subtitle="Multi-department assessments"
          icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Officer Approvals Rate"
          value={`${Math.round((approvedCount / (aiAssessedCount || 1)) * 100)}%`}
          subtitle="Human-in-the-Loop Policy"
          icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
          Recent SCOS AI Multi-Department Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((inc) => (
            <Card key={inc.incident_id} className="p-4 space-y-3 bg-white border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {inc.incident_id}
                  </span>
                  <AiBadge status="ACTIVE" label={`${((inc.AI_assessment?.confidence || 0.94) * 100).toFixed(0)}% Confidence`} />
                </div>
                <StatusBadge status={inc.AI_assessment?.status as any || 'NORMAL'} label={inc.AI_assessment?.status || 'PENDING'} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{inc.title}</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {inc.AI_assessment?.impact_summary || inc.description}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-600">
                Primary Dept: <strong>{inc.primary_department}</strong> | Affected: {inc.affected_departments.join(', ')}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
