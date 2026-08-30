import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  Compass,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers,
  MapPin,
  AlertCircle,
  FileText,
  UserCheck,
  Zap,
  Info,
  Check,
  ChevronRight,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { OperationalMonitoringSnapshot } from '../../types/operationalMonitoring';
import { useAuth } from '../../context/AuthContext';
import { PermissionType } from '../../types/auth';

export interface SituationalAwarenessViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export const SituationalAwarenessView: React.FC<SituationalAwarenessViewProps> = ({
  onNavigateTab,
}) => {
  const { hasPermission } = useAuth();
  const [snapshot, setSnapshot] = useState<OperationalMonitoringSnapshot | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [departmentProfiles, setDepartmentProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const canViewMonitoring = hasPermission(PermissionType.SITUATIONAL_AWARENESS_VIEW) ||
    hasPermission(PermissionType.OPERATIONAL_MONITORING_VIEW);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Primary Operational Monitoring Snapshot
      const res = await apiClient.getOperationalMonitoringSummary();
      if (res && res.data) {
        setSnapshot(res.data);
      }

      // Supporting detail data via service API client endpoints
      try {
        const [incRes, assetRes, deptRes] = await Promise.all([
          apiClient.getIncidents().catch(() => ({ status: 'SUCCESS', incidents: [] })),
          apiClient.getInfrastructureAssets().catch(() => ({ success: true, data: [] })),
          apiClient.getDepartmentProfiles().catch(() => ({ status: 'SUCCESS', profiles: [] })),
        ]);

        if (incRes?.incidents) setIncidents(incRes.incidents);
        if (assetRes?.data) setAssets(assetRes.data);
        if (deptRes?.profiles) setDepartmentProfiles(deptRes.profiles);
      } catch (subErr) {
        console.warn('Non-fatal error loading supporting situational awareness details:', subErr);
      }

      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to load situational awareness summary:', err);
      setError(err.message || 'Failed to connect to SCOS Operational Monitoring Service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!canViewMonitoring) {
    return (
      <div id="scos-unauthorized-container" className="p-8 max-w-4xl mx-auto">
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-8 text-center text-slate-200">
          <div className="w-14 h-14 bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-700/50">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            The SCOS Situational Awareness layer is restricted to authorized municipal officers, district administrators, and AI governance officials.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 text-xs font-mono text-slate-400 border border-slate-700">
            <span>Required Permission:</span>
            <span className="text-amber-400 font-semibold">SITUATIONAL_AWARENESS_VIEW</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !snapshot) {
    return (
      <div id="scos-loading-container" className="p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-300">Aggregating Urban Operational Situational State...</p>
        <span className="text-xs text-slate-500 mt-1">Cross-referencing Incidents, Infrastructure, Predictive Risk & SLAs</span>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div id="scos-error-container" className="p-8 max-w-4xl mx-auto">
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-6 text-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            <h3 className="font-semibold text-lg text-white">Monitoring Service Unavailable</h3>
          </div>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <button
            id="retry-fetch-btn"
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    NORMAL: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-700/60', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    WATCH: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-700/60', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    WARNING: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-700/60', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    CRITICAL: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-700/60', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  };

  const currentStatus = snapshot?.overallSystemStatus || 'NORMAL';
  const statusTheme = statusColors[currentStatus] || statusColors.NORMAL;

  // Derive Attention Items
  const attentionItems: Array<{ id: string; type: string; title: string; reason: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; actionTab?: string }> = [];

  if (snapshot) {
    if (snapshot.incidents.criticalSeverityCount > 0) {
      attentionItems.push({
        id: 'att-crit-inc',
        type: 'CRITICAL_INCIDENT',
        title: `${snapshot.incidents.criticalSeverityCount} Critical Severity Incident(s) Active`,
        reason: 'Immediate multi-department tactical response required to mitigate urban disruption',
        severity: 'CRITICAL',
        actionTab: 'operations',
      });
    }
    if (snapshot.infrastructure.disruptedCount > 0) {
      attentionItems.push({
        id: 'att-infra-disrupt',
        type: 'INFRASTRUCTURE_DISRUPTION',
        title: `${snapshot.infrastructure.disruptedCount} Civil Asset(s) in Disrupted State`,
        reason: 'Critical infrastructure failure identified near active municipal incident zone',
        severity: 'CRITICAL',
        actionTab: 'civil-infrastructure',
      });
    }
    if (snapshot.predictiveRisk.criticalRiskCount > 0) {
      attentionItems.push({
        id: 'att-pred-risk',
        type: 'PREDICTIVE_RISK',
        title: `${snapshot.predictiveRisk.criticalRiskCount} High/Critical Risk Zones Under Early Warning`,
        reason: 'Predictive assessment indicates elevated cascading flood/traffic risk requiring review',
        severity: 'HIGH',
        actionTab: 'predictive',
      });
    }
    if (snapshot.sla.breachedCount > 0) {
      attentionItems.push({
        id: 'att-sla-breach',
        type: 'SLA_BREACH',
        title: `${snapshot.sla.breachedCount} Task Response SLA(s) Breached`,
        reason: 'Department task resolution time exceeded mandated municipal service window',
        severity: 'HIGH',
        actionTab: 'coordination-ops',
      });
    }
    if (snapshot.tasks.overdueCount > 0) {
      attentionItems.push({
        id: 'att-tasks-overdue',
        type: 'TASK_OVERDUE',
        title: `${snapshot.tasks.overdueCount} Department Task(s) Past Due Time`,
        reason: 'Execution delay in field operations requiring supervisory reassignment',
        severity: 'MEDIUM',
        actionTab: 'coordination-ops',
      });
    }
    if (snapshot.dataFreshness.staleSourcesCount > 0 || snapshot.dataSourceHealth.degradedSourcesCount > 0) {
      attentionItems.push({
        id: 'att-data-stale',
        type: 'DATA_STALENESS',
        title: `${snapshot.dataFreshness.staleSourcesCount + snapshot.dataSourceHealth.degradedSourcesCount} Data Source(s) Stale / Degraded`,
        reason: 'Underlying prototype data feed update window expired; operational confidence degraded',
        severity: 'MEDIUM',
        actionTab: 'data-sources',
      });
    }
  }

  // Sorted incidents for Priority Situations
  const priorityIncidents = [...incidents].sort((a, b) => {
    const sevOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sevA = sevOrder[a.severity] || 0;
    const sevB = sevOrder[b.severity] || 0;
    return sevB - sevA;
  });

  const selectedIncident = priorityIncidents.find((i) => i.incident_id === selectedIncidentId) || priorityIncidents[0] || null;

  return (
    <div id="situational-awareness-view" className="space-y-6 pb-12">
      {/* 3. EXECUTIVE HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Compass className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SCOS SITUATIONAL AWARENESS</h1>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                SIMULATED / PROTOTYPE DATA
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Unified Urban Operational Situation View &bull; Kanpur Nagar District Intelligence Kernel
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* System Status Badge */}
            <div className={`px-3.5 py-2 rounded-lg border ${statusTheme.border} ${statusTheme.bg} flex items-center gap-2.5`}>
              <div className={`w-2.5 h-2.5 rounded-full ${statusTheme.text} animate-pulse bg-current`} />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Overall System Status</div>
                <div className={`text-sm font-bold ${statusTheme.text}`}>{currentStatus}</div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-950/60 text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Last Aggregated</div>
              <div className="text-xs font-mono text-slate-200">{lastRefreshed.toLocaleTimeString()}</div>
            </div>

            {/* Decision Support Quick Action */}
            {onNavigateTab && (
              <>
                <button
                  id="launch-decision-support-btn"
                  onClick={() => onNavigateTab('operational-decision-support')}
                  className="px-3 py-2 rounded-lg border border-indigo-500 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Decision Support</span>
                </button>
                <button
                  id="launch-digital-twin-btn"
                  onClick={() => onNavigateTab('urban-digital-twin')}
                  className="px-3 py-2 rounded-lg border border-sky-500 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Digital Twin</span>
                </button>
              </>
            )}

            {/* Refresh button */}
            <button
              id="refresh-situational-data-btn"
              onClick={fetchData}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
              title="Refresh Operational State"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Prototype Classification & Governance Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              {snapshot?.classificationNotice ||
                'SIMULATED / PROTOTYPE DATA — Academic Demonstration & Evaluation Environment.'}
            </span>
          </div>
          <span className="font-mono text-slate-500 shrink-0">District: {snapshot?.districtCode || 'KANPUR_NAGAR'}</span>
        </div>
      </div>

      {/* 4. OPERATIONAL STATUS SUMMARY CARDS (Derived directly from 8.5A snapshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Active Incidents */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Active Incidents</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {snapshot ? snapshot.incidents.openCount + snapshot.incidents.inProgressCount : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-rose-400 font-semibold">{snapshot?.incidents.criticalSeverityCount || 0}</span> Critical
          </div>
        </div>

        {/* Critical/High Risk Situations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Risk Zones</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {snapshot ? snapshot.predictiveRisk.highRiskCount + snapshot.predictiveRisk.criticalRiskCount : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg Score: <span className="text-slate-200 font-mono">{snapshot?.predictiveRisk.averageRiskScore || 0}</span>
          </div>
        </div>

        {/* Affected Infrastructure */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Impacted Assets</span>
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300">
            {snapshot ? snapshot.infrastructure.degradedCount + snapshot.infrastructure.disruptedCount + snapshot.infrastructure.offlineCount : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-rose-400 font-semibold">{snapshot?.infrastructure.disruptedCount || 0}</span> Disrupted
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Active Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {snapshot ? snapshot.tasks.assignedCount + snapshot.tasks.inProgressCount : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400">{snapshot?.tasks.completedCount || 0}</span> Done
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Overdue Tasks</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {snapshot?.tasks.overdueCount ?? '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Execution Bottleneck
          </div>
        </div>

        {/* SLA Breaches */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">SLA Breaches</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {snapshot?.sla.breachedCount ?? '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400">{snapshot?.sla.overallComplianceRatePercent || 0}%</span> Compliant
          </div>
        </div>

        {/* Active Escalations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Escalations</span>
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {snapshot?.escalations.totalEscalations ?? '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-rose-400 font-semibold">{snapshot?.escalations.level3Count || 0}</span> Level 3
          </div>
        </div>

        {/* Data Sources Requiring Attention */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium truncate">Data Attention</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {snapshot ? snapshot.dataFreshness.staleSourcesCount + snapshot.dataSourceHealth.degradedSourcesCount : '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Freshness: <span className="font-semibold text-slate-200">{snapshot?.dataFreshness.overallFreshnessState || 'UNKNOWN'}</span>
          </div>
        </div>
      </div>

      {/* 9. ESCALATION & ATTENTION PANEL ("REQUIRES ATTENTION") */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">REQUIRES ATTENTION</h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {attentionItems.length} Active Notice{attentionItems.length === 1 ? '' : 's'}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Derived directly from active operational metrics and SLA thresholds
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            All operational indicators and SLA metrics are currently within nominal thresholds.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                  item.severity === 'CRITICAL'
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : item.severity === 'HIGH'
                    ? 'bg-amber-950/30 border-amber-800/60'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    <span className="text-slate-400 font-medium">Rationale:</span> {item.reason}
                  </p>
                </div>

                {item.actionTab && onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(item.actionTab!)}
                    className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Investigate in {item.actionTab.replace('-', ' ')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 11. INCIDENT → INFRASTRUCTURE → DEPARTMENT CHAIN */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Operational Causality & Response Chain
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Cross-system impact trace (Knowledge Graph &bull; Civil Assets &bull; Inter-Agency Dispatch)
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2 text-xs">
            {/* Step 1: Incident */}
            <div className="flex-1 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-center">
              <div className="text-[10px] text-indigo-300 uppercase font-semibold">1. Incident</div>
              <div className="font-bold text-white truncate mt-0.5">
                {selectedIncident ? selectedIncident.title : 'Active Grievance / Inundation'}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                {selectedIncident?.location || 'GT Road / Sisamau Ward'}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* Step 2: Infrastructure */}
            <div className="flex-1 p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/50 text-center">
              <div className="text-[10px] text-sky-300 uppercase font-semibold">2. Affected Infrastructure</div>
              <div className="font-bold text-white truncate mt-0.5">Primary Storm Drain / Feeder Trunk</div>
              <div className="text-[10px] text-sky-400 font-mono mt-0.5">Sisamau Trunk Drain (DEGRADED)</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* Step 3: Service Impact */}
            <div className="flex-1 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-center">
              <div className="text-[10px] text-amber-300 uppercase font-semibold">3. Potential Service Impact</div>
              <div className="font-bold text-white truncate mt-0.5">Arterial Corridor Bottleneck</div>
              <div className="text-[10px] text-amber-400 mt-0.5">Traffic Speed -65% &bull; Substation Risk</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* Step 4: Department */}
            <div className="flex-1 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/50 text-center">
              <div className="text-[10px] text-purple-300 uppercase font-semibold">4. Lead Department</div>
              <div className="font-bold text-white truncate mt-0.5">
                {selectedIncident?.lead_department || 'Nagar Nigam (Civil Works)'}
              </div>
              <div className="text-[10px] text-purple-400 mt-0.5">Coordinating: Traffic & Jal Sansthan</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* Step 5: Active Task */}
            <div className="flex-1 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-center">
              <div className="text-[10px] text-emerald-300 uppercase font-semibold">5. Response Status</div>
              <div className="font-bold text-emerald-300 truncate mt-0.5">High-Capacity Pump Deployed</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Status: IN_PROGRESS (SLA: Nominal)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5. PRIORITY SITUATIONS (Left Column: 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">PRIORITY OPERATIONAL SITUATIONS</h2>
                <p className="text-xs text-slate-400">Ranked by severity, infrastructure impact, and escalation state</p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('operations')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>Operations Module</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {priorityIncidents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No active incidents recorded in operational repository.
                </div>
              ) : (
                priorityIncidents.map((inc) => {
                  const isSelected = inc.incident_id === (selectedIncident?.incident_id || '');
                  const severityBadge =
                    inc.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                      : inc.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700';

                  return (
                    <div
                      key={inc.incident_id}
                      onClick={() => setSelectedIncidentId(inc.incident_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs text-indigo-400 font-semibold">{inc.incident_id}</span>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${severityBadge}`}>
                              {inc.severity || 'UNAVAILABLE'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {inc.current_status || 'UNAVAILABLE'}
                            </span>
                            {inc.escalation_level && inc.escalation_level > 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                Escalation L{inc.escalation_level}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1.5">{inc.title}</h4>
                        </div>

                        {onNavigateTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateTab('operations');
                            }}
                            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Detail Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <div className="text-slate-500">Location</div>
                          <div className="font-medium text-slate-300 truncate">{inc.location || 'UNAVAILABLE'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Lead Dept</div>
                          <div className="font-medium text-slate-300 truncate">{inc.lead_department || 'UNAVAILABLE'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Secondary Depts</div>
                          <div className="font-medium text-slate-300 truncate">
                            {inc.secondary_departments?.length ? inc.secondary_departments.join(', ') : 'NONE'}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Assigned Tasks</div>
                          <div className="font-medium text-slate-300">
                            {inc.assigned_tasks ? `${inc.assigned_tasks.length} task(s)` : 'UNAVAILABLE'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 7. DEPARTMENT SITUATION MATRIX */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">DEPARTMENT OPERATIONAL MATRIX</h3>
                <p className="text-xs text-slate-400">Inter-agency status, task allocation, and SLA compliance</p>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('coordination-ops')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>Coordination View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-2">Active Incidents</th>
                    <th className="py-2.5 px-2">Assigned Tasks</th>
                    <th className="py-2.5 px-2">Completed</th>
                    <th className="py-2.5 px-2">Overdue</th>
                    <th className="py-2.5 px-2">SLA Compliance</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {departmentProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500">
                        Loading department operational records...
                      </td>
                    </tr>
                  ) : (
                    departmentProfiles.map((dept) => {
                      const deptIncidents = incidents.filter(
                        (i) => i.lead_department?.includes(dept.code) || i.secondary_departments?.includes(dept.code)
                      );
                      const allTasks = deptIncidents.flatMap((i) => i.assigned_tasks || []);
                      const deptAssigned = allTasks.filter((t) => t.status !== 'COMPLETED').length;
                      const deptCompleted = allTasks.filter((t) => t.status === 'COMPLETED').length;
                      const deptOverdue = allTasks.filter((t) => t.status !== 'COMPLETED' && new Date(t.due_time).getTime() < Date.now()).length;

                      return (
                        <tr key={dept.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{dept.name}</div>
                            <div className="font-mono text-[10px] text-slate-500">{dept.code}</div>
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-200">{deptIncidents.length}</td>
                          <td className="py-3 px-2 font-mono text-slate-200">{deptAssigned}</td>
                          <td className="py-3 px-2 font-mono text-emerald-400">{deptCompleted}</td>
                          <td className="py-3 px-2 font-mono text-rose-400 font-semibold">{deptOverdue}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-200">
                                {deptOverdue === 0 ? '98%' : `${Math.max(65, 100 - deptOverdue * 12)}%`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {dept.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SPATIAL & DATA TRUST PANEL (Right Column: 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 6. SPATIAL AWARENESS PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white tracking-tight">SPATIAL AWARENESS</h3>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('gis')}
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  <span>GIS Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Proximity distribution of civil infrastructure assets and active incident centroids (Kanpur Ward Grid).
            </p>

            {/* Lightweight Spatial Coordinate Matrix Map View */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-slate-400 border border-slate-700">
                PROTOTYPE SPATIAL GRID
              </div>

              {/* Synthetic Visual Grid Canvas */}
              <div className="h-44 w-full bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] rounded-lg relative flex items-center justify-center border border-slate-850">
                {/* Visual Centroids */}
                <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping opacity-75" />
                  <div className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white -mt-3.5" />
                  <span className="text-[9px] font-mono text-rose-300 mt-1 bg-slate-900/90 px-1 rounded">
                    INC-01 (GT Road)
                  </span>
                </div>

                <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
                  <span className="text-[9px] font-mono text-amber-300 mt-1 bg-slate-900/90 px-1 rounded">
                    Drainage Trunk
                  </span>
                </div>

                <div className="absolute top-1/2 right-1/3 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-sky-500 border border-white" />
                  <span className="text-[9px] font-mono text-sky-300 mt-1 bg-slate-900/90 px-1 rounded">
                    Pumping Station
                  </span>
                </div>

                <div className="absolute bottom-1/4 left-1/4 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                  <span className="text-[9px] font-mono text-emerald-300 mt-1 bg-slate-900/90 px-1 rounded">
                    Feeder Pillar
                  </span>
                </div>
              </div>

              {/* Nearby Assets Summary */}
              <div className="mt-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Critical Infrastructure in Proximity
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {assets.slice(0, 3).map((asset: any) => (
                    <div
                      key={asset.id}
                      className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 truncate">{asset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {asset.type} &bull; {asset.zone || 'Zone 1'}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          asset.status === 'OPERATIONAL'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 8. TASK & RESPONSE STATUS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white tracking-tight">TASK & RESPONSE STATUS</h3>
              </div>
              <span className="text-xs text-slate-400">Tactical Execution</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Assigned</div>
                  <div className="text-lg font-bold text-white font-mono">{snapshot?.tasks.assignedCount || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40">
                  <div className="text-indigo-300 text-[11px]">In Progress</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono">{snapshot?.tasks.inProgressCount || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <div className="text-emerald-300 text-[11px]">Completed</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{snapshot?.tasks.completedCount || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                  <div className="text-rose-300 text-[11px]">Overdue</div>
                  <div className="text-lg font-bold text-rose-400 font-mono">{snapshot?.tasks.overdueCount || 0}</div>
                </div>
              </div>

              {/* Progress Bar */}
              {snapshot && snapshot.tasks.totalTasks > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Task Resolution Progress</span>
                    <span>
                      {Math.round((snapshot.tasks.completedCount / snapshot.tasks.totalTasks) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${(snapshot.tasks.completedCount / snapshot.tasks.totalTasks) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-indigo-500 h-full"
                      style={{
                        width: `${(snapshot.tasks.inProgressCount / snapshot.tasks.totalTasks) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${(snapshot.tasks.overdueCount / snapshot.tasks.totalTasks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 10. DATA QUALITY & TRUST INDICATOR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">DATA TRUST & FRESHNESS</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PROVENANCE AUDITED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold">Fresh</div>
                  <div className="text-base font-bold text-white font-mono">
                    {snapshot?.dataFreshness.freshSourcesCount || 0}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">Aging</div>
                  <div className="text-base font-bold text-white font-mono">
                    {snapshot?.dataFreshness.agingSourcesCount || 0}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-rose-400 uppercase font-semibold">Stale</div>
                  <div className="text-base font-bold text-white font-mono">
                    {snapshot?.dataFreshness.staleSourcesCount || 0}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed text-[11px]">
                <span className="font-semibold text-slate-200">Provenance Notice:</span> Operational conclusions
                and automated escalations depend strictly on the quality and freshness of the underlying prototype data feeds.
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('data-sources')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5 font-medium"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Data Source Registry</span>
                </button>
              )}
            </div>
          </div>

          {/* 12. HUMAN-IN-THE-LOOP BOUNDARY */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-800/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Human-in-the-Loop Governance Guardrails
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              The Situational Awareness layer functions strictly as executive decision support. All dispatch recommendations, task reassignments, and SLA overrides require explicit manual officer authorization.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {onNavigateTab && (
                <>
                  <button
                    onClick={() => onNavigateTab('operations')}
                    className="py-1.5 px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors text-center"
                  >
                    Resolve Incidents
                  </button>
                  <button
                    onClick={() => onNavigateTab('coordination-ops')}
                    className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
                  >
                    Coordinate Teams
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
