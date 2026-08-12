/**
 * SCOS Phase 5B.6 — Knowledge Graph Entity Detail Panel
 * Contextual slide-over side panel displaying entity metadata, attributes,
 * data source provenance, connected edges, and GIS jump actions.
 */

import React from 'react';
import {
  Layers,
  MapPin,
  ExternalLink,
  Shield,
  Clock,
  ArrowRight,
  Database,
  Activity,
  X,
  Share2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GraphEntity, GraphNeighborhood } from '../../types/knowledgeGraph';

interface EntityDetailPanelProps {
  entity: GraphEntity;
  neighborhood: GraphNeighborhood | null;
  onClose?: () => void;
  onSelectEntity: (id: string) => void;
  onViewOnMap?: (lat: number, lng: number, name: string) => void;
}

export const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({
  entity,
  neighborhood,
  onClose,
  onSelectEntity,
  onViewOnMap,
}) => {
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'SIMULATED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'PUBLIC_DATA':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'OBSERVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DERIVED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'INCIDENT':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HOSPITAL':
      case 'FACILITY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ROAD':
      case 'INFRASTRUCTURE':
      case 'DRAINAGE_ASSET':
      case 'WATER_ASSET':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'DEPARTMENT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'RISK':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <Card className="p-5 border-slate-200 bg-white shadow-lg space-y-5 relative font-sans">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTypeBadgeColor(
                entity.type
              )}`}
            >
              {entity.type}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSourceBadgeColor(
                entity.source
              )}`}
            >
              {entity.source === 'SIMULATED' ? 'Simulated Data' : entity.source}
            </span>
            {entity.confidence && (
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Confidence: {(entity.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">{entity.name}</h3>
          <p className="text-xs text-slate-500 font-mono">ID: {entity.id}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Description */}
      {entity.description && (
        <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
          {entity.description}
        </p>
      )}

      {/* GIS Location Bar */}
      {entity.latitude && entity.longitude && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-medium">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Coordinates: {entity.latitude.toFixed(4)}, {entity.longitude.toFixed(4)}
            </span>
          </div>
          {onViewOnMap && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewOnMap(entity.latitude!, entity.longitude!, entity.name)}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs bg-white text-indigo-700 border-indigo-300"
            >
              View on GIS Map
            </Button>
          )}
        </div>
      )}

      {/* Entity Attributes Table */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          Entity Attributes & Metadata
        </h4>
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
          {Object.entries(entity.attributes || {}).map(([key, value]) => (
            <div key={key} className="px-3 py-2 flex items-center justify-between font-mono">
              <span className="text-slate-500 font-medium uppercase text-[10px]">{key.replace(/_/g, ' ')}</span>
              <span className="text-slate-900 font-bold text-right truncate max-w-[180px]">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Graph Neighborhood */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            Connected Graph Neighborhood ({neighborhood?.connectedEntities.length || 0})
          </span>
        </h4>

        {!neighborhood || neighborhood.connectedEntities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No connected nodes found.</p>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {neighborhood.directRelationships.map((rel) => {
              const targetId = rel.source_id === entity.id ? rel.target_id : rel.source_id;
              const targetEntity = neighborhood.connectedEntities.find((e) => e.id === targetId);
              if (!targetEntity) return null;

              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectEntity(targetEntity.id)}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs group"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                      {rel.relationship_type}
                    </span>
                    <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mt-1">
                      {targetEntity.name}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">Type: {targetEntity.type}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
