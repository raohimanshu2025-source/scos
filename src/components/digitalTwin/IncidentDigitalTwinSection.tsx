import React, { useState, useEffect } from 'react';
import {
  Layers,
  MapPin,
  Building2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Incident } from '../../types/incident';
import { TwinEntity, TwinDependency } from '../../types/urbanDigitalTwin';

interface IncidentDigitalTwinSectionProps {
  incident: Incident;
  onNavigateToTwin?: (entityId?: string) => void;
}

export const IncidentDigitalTwinSection: React.FC<IncidentDigitalTwinSectionProps> = ({
  incident,
  onNavigateToTwin,
}) => {
  const [entities, setEntities] = useState<TwinEntity[]>([]);
  const [dependencies, setDependencies] = useState<TwinDependency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadTwinContext = async () => {
      setIsLoading(true);
      try {
        const stateRes = await apiClient.getUrbanDigitalTwinState();
        if (stateRes && stateRes.data && isMounted) {
          setEntities(stateRes.data.entities);
          setDependencies(stateRes.data.dependencies);
        }
      } catch (err) {
        console.warn('Could not load digital twin context for incident:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadTwinContext();
    return () => {
      isMounted = false;
    };
  }, [incident.incident_id]);

  // Find nearby or matching entities
  const matchingEntities = entities.filter((e) => {
    const nameMatch =
      (incident.title && e.name.toLowerCase().includes(incident.title.toLowerCase())) ||
      (incident.location && e.location.ward.toLowerCase().includes(incident.location.toLowerCase())) ||
      (incident.location && incident.location.toLowerCase().includes(e.location.ward.toLowerCase()));

    // Approximate distance check if coords are present
    if (e.location.latitude && incident.latitude) {
      const latDiff = Math.abs(e.location.latitude - incident.latitude);
      const lngDiff = Math.abs(e.location.longitude - incident.longitude);
      return nameMatch || (latDiff < 0.03 && lngDiff < 0.03);
    }
    return nameMatch;
  });

  const relevantEntities = matchingEntities.length > 0 ? matchingEntities.slice(0, 4) : entities.slice(0, 3);
  const relevantEntityIds = new Set(relevantEntities.map((e) => e.entityId));

  const relevantDependencies = dependencies.filter(
    (dep) => relevantEntityIds.has(dep.sourceEntityId) || relevantEntityIds.has(dep.targetEntityId)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              SCOS URBAN DIGITAL TWIN CONTEXT
            </h4>
            <p className="text-[11px] text-slate-500">
              Civil infrastructure state & topological dependencies for this incident zone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            SIMULATED / PROTOTYPE DATA
          </span>
          {onNavigateToTwin && (
            <button
              onClick={() => onNavigateToTwin(relevantEntities[0]?.entityId)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition border border-indigo-200"
            >
              Explore Twin
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-400">
          Loading digital twin infrastructure context...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Nearby Infrastructure Nodes */}
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Nearby Infrastructure Assets & Operational Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relevantEntities.map((entity) => (
                <div
                  key={entity.entityId}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase block">
                        {entity.entityType}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {entity.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        entity.operationalStatus === 'OPERATIONAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : entity.operationalStatus === 'DEGRADED' ||
                            entity.operationalStatus === 'CLOGGED_RISK'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {entity.operationalStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="truncate">{entity.department}</span>
                    <span className="font-mono text-slate-600">{entity.criticality}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urban Dependency Cascade Pathways */}
          {relevantDependencies.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Topological Infrastructure Dependencies
              </span>
              <div className="space-y-1.5">
                {relevantDependencies.slice(0, 2).map((dep) => (
                  <div
                    key={dep.relationshipId}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 text-[11px]">
                      <span className="truncate">
                        {dep.sourceEntityName} ({dep.sourceEntityType})
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {dep.relationshipType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{dep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncidentDigitalTwinSection;
