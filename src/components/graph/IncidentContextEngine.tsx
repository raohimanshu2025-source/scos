/**
 * SCOS Phase 5B.6 — Incident Context Engine Component
 * Automatically queries Knowledge Graph relationships when an incident is selected
 * and compiles spatial, infrastructure, historical, and multi-department context.
 */

import React, { useEffect, useState } from 'react';
import {
  Brain,
  MapPin,
  Building2,
  AlertTriangle,
  History,
  CheckCircle2,
  Shield,
  Layers,
  Hospital,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';
import { useIncidents } from '../../context/IncidentContext';

export const IncidentContextEngine: React.FC = () => {
  const { incidentContext, loadIncidentContext, selectEntity } = useKnowledgeGraph();
  const { incidents } = useIncidents();
  const [selectedIncId, setSelectedIncId] = useState<string>('INCIDENT-1024');

  useEffect(() => {
    loadIncidentContext(selectedIncId);
  }, [selectedIncId]);

  const ctx = incidentContext;

  return (
    <div className="space-y-6 font-sans">
      {/* Incident Selector Bar */}
      <Card className="p-4 bg-white border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">SCOS Incident Context Retrieval Engine</h3>
          <p className="text-xs text-slate-500">
            Select an active or historical incident to inspect graph-derived spatial, infrastructure, and historical intelligence.
          </p>
        </div>

        <select
          value={selectedIncId}
          onChange={(e) => setSelectedIncId(e.target.value)}
          className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shrink-0"
        >
          <option value="INCIDENT-1024">Waterlogging Incident #1024 (Parade Crossing)</option>
          {incidents.map((inc) => (
            <option key={inc.incident_id} value={inc.incident_id}>
              {inc.title} ({inc.incident_id})
            </option>
          ))}
        </select>
      </Card>

      {!ctx ? (
        <Card className="p-8 text-center text-slate-500 text-xs">Loading incident context graph...</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Context Card Matrix */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Operational Graph Summary */}
            <Card className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Graph-Enriched Contextual AI Rationale
                </span>
              </div>
              <p className="text-sm font-medium leading-relaxed text-indigo-50">{ctx.aiContextSummary}</p>
            </Card>

            {/* Spatial & Administrative Hierarchy */}
            <Card className="p-5 border-slate-200 space-y-4 bg-white">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Spatial & Administrative Hierarchy
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Road Corridor</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{ctx.locationEntity?.name || 'Major Road A'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Ward Level</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{ctx.wardEntity?.name || 'Ward 12 Parade'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Administrative Zone</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{ctx.zoneEntity?.name || 'Zone 1 Central'}</p>
                </div>
              </div>
            </Card>

            {/* Nearby Infrastructure Assets & Critical Facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  Nearby Assets ({ctx.nearbyAssets.length})
                </h4>
                <div className="space-y-2">
                  {ctx.nearbyAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => selectEntity(asset.id)}
                      className="p-3 bg-cyan-50/50 hover:bg-cyan-100/50 border border-cyan-200 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{asset.name}</p>
                        <span className="text-[10px] font-mono text-cyan-800">Status: {asset.status}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-600" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-emerald-600" />
                  Nearby Facilities ({ctx.nearbyFacilities.length})
                </h4>
                <div className="space-y-2">
                  {ctx.nearbyFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => selectEntity(fac.id)}
                      className="p-3 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-200 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{fac.name}</p>
                        <span className="text-[10px] font-mono text-emerald-800">Type: {fac.type}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Historical Correlated Incidents */}
            <Card className="p-5 border-slate-200 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  Historical Similar Events ({ctx.historicalEvents.length})
                </h4>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Simulated historical data
                </span>
              </div>

              <div className="space-y-2.5">
                {ctx.historicalEvents.map((hist) => (
                  <div key={hist.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hist.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">ID: {hist.id}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{hist.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Responsible Departments & Tasks */}
          <div className="space-y-6">
            <Card className="p-5 border-slate-200 space-y-4 bg-white">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Responsible Departments ({ctx.responsibleDepartments.length})
              </h4>

              <div className="space-y-2">
                {ctx.responsibleDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => selectEntity(dept.id)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{dept.name}</p>
                      <span className="text-[10px] font-mono text-slate-500">Nodal Officer: {dept.attributes.nodal_officer}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-slate-200 space-y-3 bg-white">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Graph-Linked Open Tasks ({ctx.openTasks.length})
              </h4>

              <div className="space-y-2">
                {ctx.openTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900">{task.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{task.attributes.assigned_dept}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{task.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
