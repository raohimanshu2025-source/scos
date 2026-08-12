/**
 * SCOS Phase 5B.5 — GIS Spatial Intelligence Platform with Risk Layers & Decision Support
 */

import React, { useState } from 'react';
import { PageHeader } from '../shell/PageHeader';
import { Card } from '../ui/Card';
import { MapContainer, MapMarker, MapLayer } from '../ui/MapContainer';
import { StatusBadge } from '../ui/Badge';
import { MapPin, Layers, Brain, ShieldAlert, AlertTriangle, Building2, Eye, EyeOff } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { usePredictive } from '../../context/PredictiveContext';
import { RiskZone } from '../../types/prediction';
import { DecisionSupportPanel } from '../predictive/DecisionSupportPanel';

export const GisView: React.FC = () => {
  const { incidents } = useIncidents();
  const {
    risks,
    selectedRisk,
    selectRiskById,
    approveEarlyWarning,
    dismissEarlyWarning,
    modifyEarlyWarningActions,
  } = usePredictive();

  const [showIncidents, setShowIncidents] = useState(true);
  const [showRisks, setShowRisks] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);

  // Map markers constructed from incidents + predictive risks
  const incidentMarkers: MapMarker[] = showIncidents
    ? incidents.map((inc) => ({
        id: inc.incident_id,
        lat: inc.latitude,
        lng: inc.longitude,
        title: inc.title,
        category: 'INCIDENT' as const,
        status: inc.severity === 'CRITICAL' ? 'CRITICAL' : inc.severity === 'HIGH' ? 'WARNING' : 'NORMAL',
        details: `${inc.location} — ${inc.category} (${inc.current_status})`,
      }))
    : [];

  const riskMarkers: MapMarker[] = showRisks
    ? risks.map((r) => ({
        id: r.zone_id,
        lat: r.center_lat,
        lng: r.center_lng,
        title: `[PREDICTIVE RISK] ${r.zone_name}`,
        category: 'WATER' as const,
        status: r.risk_level === 'CRITICAL' ? 'CRITICAL' : r.risk_level === 'HIGH' ? 'WARNING' : 'NORMAL',
        details: `Risk Score: ${r.risk_score}/100 | Time Horizon: ${r.time_horizon} | ${r.use_case}`,
      }))
    : [];

  const combinedMarkers = [...incidentMarkers, ...riskMarkers];

  const gisLayers: MapLayer[] = [
    { id: 'incidents', name: 'Observed Incidents Layer', active: showIncidents, count: incidents.length },
    { id: 'risks', name: 'Predictive Risk Zones Layer', active: showRisks, count: risks.length },
    { id: 'infra', name: 'Critical Infrastructure (Hospitals/Pumps)', active: showInfrastructure, count: 18 },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      <PageHeader
        title="GIS Spatial Intelligence & Risk Layer Platform"
        description="Multi-layer geospatial command interface displaying observed urban incidents alongside predictive AI risk zones, critical infrastructure, and decision support overlays."
        breadcrumbs={[{ label: 'GIS Spatial Intelligence' }]}
        statusBadge={<StatusBadge status="NORMAL" label="GIS Risk Layer Active" />}
      />

      {/* Layer Toggle Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-800 uppercase tracking-wider">GIS Layer Toggles:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showIncidents ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {showIncidents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Observed Incidents ({incidents.length})
          </button>

          <button
            onClick={() => setShowRisks(!showRisks)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showRisks ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {showRisks ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Predictive Risk Zones ({risks.length})
          </button>

          <button
            onClick={() => setShowInfrastructure(!showInfrastructure)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showInfrastructure ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {showInfrastructure ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Critical Infrastructure (18)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Map Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <MapContainer
            title="Kanpur Smart City Multi-Layer Spatial Canvas"
            subtitle="Live Incident Pins & Predictive Risk Overlay Layers — WGS84 Spatial Projection"
            markers={combinedMarkers}
            layers={gisLayers}
            height="520px"
            onMarkerClick={(m) => {
              if (m.id.startsWith('ZONE-')) {
                selectRiskById(m.id);
              }
            }}
          />

          {/* Selected Risk Zone Decision Support Overlay */}
          {selectedRisk && (
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
                Selected GIS Risk Zone Decision Support
              </h3>
              <DecisionSupportPanel
                zone={selectedRisk}
                onApprove={approveEarlyWarning}
                onDismiss={dismissEarlyWarning}
                onModify={modifyEarlyWarningActions}
              />
            </div>
          )}
        </div>

        {/* Sidebar: Predictive Risk Zones list */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-2 font-mono">
              <Brain className="w-4 h-4 text-indigo-600" />
              GIS Predictive Risk Zones ({risks.length})
            </h4>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {risks.map((r) => {
                const isSelected = selectedRisk?.zone_id === r.zone_id;
                return (
                  <div
                    key={r.zone_id}
                    onClick={() => selectRiskById(r.zone_id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {r.use_case}
                      </span>
                      <span
                        className={`text-[10px] font-black font-mono px-2 py-0.5 rounded ${
                          r.risk_level === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-500'
                            : r.risk_level === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-600'
                            : 'bg-emerald-500/20 text-emerald-600'
                        }`}
                      >
                        {r.risk_level} ({r.risk_score}/100)
                      </span>
                    </div>

                    <p className="text-xs font-bold truncate">{r.zone_name}</p>
                    <p className="text-[11px] text-slate-500">{r.ward_zone}</p>

                    <div className="mt-2 text-[10px] font-mono flex items-center justify-between border-t border-slate-200/40 pt-1.5 text-slate-400">
                      <span>Horizon: {r.time_horizon}</span>
                      <span className="font-bold text-indigo-400">{r.early_warning_status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
