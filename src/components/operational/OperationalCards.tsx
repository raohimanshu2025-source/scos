import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Building2,
  Clock,
  MapPin,
  UserCheck,
  ShieldAlert,
  Activity,
  ArrowRight,
  CheckCircle2,
  Brain,
  Server,
  Zap,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge, AiBadge, DepartmentBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OperationalStatusType, DepartmentStatusType } from '../../design-system/tokens';

// 1. IncidentCard
export interface IncidentCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  status: OperationalStatusType;
  timeAgo: string;
  assignedTeam?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  onActionClick?: (id: string) => void;
  className?: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  id,
  title,
  department,
  location,
  status,
  timeAgo,
  assignedTeam,
  priority,
  onActionClick,
  className = '',
}) => {
  return (
    <Card variant="interactive" className={`border-l-4 ${priority === 'CRITICAL' ? 'border-l-rose-600' : 'border-l-amber-500'} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{id}</span>
            <StatusBadge status={status} size="sm" pulse={status === 'CRITICAL'} />
          </div>
          <h4 className="text-xs font-bold text-slate-900 leading-snug">{title}</h4>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-slate-100 text-slate-700">
          {priority}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 my-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{department}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{assignedTeam || 'Unassigned'}</span>
        </div>
      </div>

      {onActionClick && (
        <div className="flex justify-end pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(id);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Review & Dispatch <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Card>
  );
};

// 2. AIRecommendationCard
export interface AIRecommendationCardProps {
  id: string;
  title: string;
  reason: string;
  confidence: number; // 0 - 100
  affectedDepartment: string;
  requiredReview: boolean;
  actionText?: string;
  onApplyRecommendation?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  id,
  title,
  reason,
  confidence,
  affectedDepartment,
  requiredReview,
  actionText = 'Approve AI Action',
  onApplyRecommendation,
  onDismiss,
  className = '',
}) => {
  return (
    <Card className={`border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/30 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <AiBadge status="RECOMMENDATION" label="AI Governance Advisory" size="sm" />
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">{title}</h4>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-extrabold font-mono text-indigo-700">{confidence}%</span>
          <span className="block text-[9px] font-bold text-slate-400 uppercase">Confidence</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 my-3 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80">
        {reason}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
        <span className="text-slate-500">
          Target: <strong className="text-slate-800">{affectedDepartment}</strong>
        </span>

        {requiredReview && (
          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Human Approval Mandatory
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200/80">
        {onDismiss && (
          <Button variant="outline" size="sm" onClick={() => onDismiss(id)}>
            Dismiss
          </Button>
        )}
        {onApplyRecommendation && (
          <Button variant="secondary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />} onClick={() => onApplyRecommendation(id)}>
            {actionText}
          </Button>
        )}
      </div>
    </Card>
  );
};

// 3. DepartmentStatusCard
export interface DepartmentStatusCardProps {
  id: string;
  departmentName: string;
  code: string;
  status: DepartmentStatusType;
  activeIncidentsCount: number;
  pendingTasksCount: number;
  slaPercent: number;
  officerInCharge?: string;
  onClick?: () => void;
  className?: string;
}

export const DepartmentStatusCard: React.FC<DepartmentStatusCardProps> = ({
  departmentName,
  code,
  status,
  activeIncidentsCount,
  pendingTasksCount,
  slaPercent,
  officerInCharge,
  onClick,
  className = '',
}) => {
  return (
    <Card variant="interactive" onClick={onClick} className={className}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">{code}</span>
          <h4 className="text-xs font-bold text-slate-900">{departmentName}</h4>
        </div>
        <DepartmentBadge status={status} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center my-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <div>
          <span className="block text-sm font-extrabold text-slate-900 font-mono">{activeIncidentsCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Incidents</span>
        </div>
        <div>
          <span className="block text-sm font-extrabold text-slate-900 font-mono">{pendingTasksCount}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Pending</span>
        </div>
        <div>
          <span className={`block text-sm font-extrabold font-mono ${slaPercent >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {slaPercent}%
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase">SLA Adherence</span>
        </div>
      </div>

      {officerInCharge && (
        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Head Officer:</span>
          <span className="font-semibold text-slate-800">{officerInCharge}</span>
        </div>
      )}
    </Card>
  );
};

// 4. SystemHealthCard
export interface SystemHealthCardProps {
  services: { name: string; status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN'; latencyMs: number }[];
  lastUpdated: string;
  className?: string;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  services,
  lastUpdated,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">SCOS Core Services Health</h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Updated {lastUpdated}</span>
      </div>

      <div className="space-y-2">
        {services.map((svc, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  svc.status === 'OPERATIONAL' ? 'bg-emerald-500' : svc.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
              <span className="font-semibold text-slate-800">{svc.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">{svc.latencyMs}ms</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  svc.status === 'OPERATIONAL'
                    ? 'bg-emerald-50 text-emerald-700'
                    : svc.status === 'DEGRADED'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {svc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
