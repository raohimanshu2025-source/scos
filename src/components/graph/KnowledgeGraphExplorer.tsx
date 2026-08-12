/**
 * SCOS Phase 5B.6 — Knowledge Graph Visual Explorer
 * Interactive node-link topology diagram rendering city entities, relationships,
 * and contextual neighborhoods with search, filter, and detail focus panels.
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Share2,
  Building2,
  MapPin,
  AlertTriangle,
  Hospital,
  Shield,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { GraphEntity, GraphRelationship, EntityType } from '../../types/knowledgeGraph';
import { EntityDetailPanel } from './EntityDetailPanel';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';

interface KnowledgeGraphExplorerProps {
  onViewOnMap?: (lat: number, lng: number, name: string) => void;
}

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({ onViewOnMap }) => {
  const {
    entities,
    relationships,
    selectedEntity,
    selectedNeighborhood,
    searchQuery,
    typeFilter,
    selectEntity,
    setSearchQuery,
    setTypeFilter,
  } = useKnowledgeGraph();

  // Position coordinates for node rendering on visual canvas
  const getNodeCoordinates = (index: number, total: number, type: EntityType) => {
    // Group by category angle clusters
    let baseAngle = 0;
    switch (type) {
      case 'CITY':
      case 'ZONE':
      case 'WARD':
        baseAngle = 0;
        break;
      case 'INCIDENT':
      case 'RISK':
        baseAngle = Math.PI / 3;
        break;
      case 'ROAD':
      case 'INFRASTRUCTURE':
      case 'DRAINAGE_ASSET':
      case 'WATER_ASSET':
        baseAngle = (2 * Math.PI) / 3;
        break;
      case 'HOSPITAL':
      case 'FACILITY':
        baseAngle = Math.PI;
        break;
      case 'DEPARTMENT':
        baseAngle = (4 * Math.PI) / 3;
        break;
      default:
        baseAngle = (5 * Math.PI) / 3;
    }

    const radius = 220 + (index % 3) * 60;
    const spread = (index / Math.max(total, 1)) * 0.8 - 0.4;
    const angle = baseAngle + spread;

    const centerX = 360;
    const centerY = 280;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return { x: Math.max(60, Math.min(660, x)), y: Math.max(60, Math.min(500, y)) };
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'INCIDENT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'HOSPITAL':
      case 'FACILITY':
        return <Hospital className="w-4 h-4 text-emerald-600" />;
      case 'DEPARTMENT':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'ROAD':
      case 'DRAINAGE_ASSET':
      case 'WATER_ASSET':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'RISK':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEntityColorClass = (type: EntityType, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-indigo-600 text-white ring-4 ring-indigo-300 border-indigo-700 shadow-lg';
    }
    switch (type) {
      case 'INCIDENT':
        return 'bg-rose-50 text-rose-900 border-rose-300 hover:border-rose-500';
      case 'HOSPITAL':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500';
      case 'DEPARTMENT':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:border-indigo-500';
      case 'ROAD':
      case 'DRAINAGE_ASSET':
      case 'WATER_ASSET':
        return 'bg-cyan-50 text-cyan-900 border-cyan-300 hover:border-cyan-500';
      case 'RISK':
        return 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500';
      default:
        return 'bg-slate-50 text-slate-900 border-slate-300 hover:border-slate-500';
    }
  };

  const entityPositions = new Map<string, { x: number; y: number }>();
  entities.forEach((ent, idx) => {
    entityPositions.set(ent.id, getNodeCoordinates(idx, entities.length, ent.type));
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Visual Canvas Column */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search & Filter Header Bar */}
        <Card className="p-4 bg-white border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Search entities, roads, assets, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className="text-xs"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: undefined, label: 'All' },
                { id: 'INCIDENT', label: 'Incidents' },
                { id: 'ROAD', label: 'Roads/Assets' },
                { id: 'DEPARTMENT', label: 'Depts' },
                { id: 'HOSPITAL', label: 'Hospitals' },
                { id: 'RISK', label: 'Risks' },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={() => setTypeFilter(f.id as any)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    typeFilter === f.id
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Visual Graph Canvas Container */}
        <Card className="p-4 border-slate-200 bg-slate-900 text-white min-h-[520px] relative overflow-hidden rounded-2xl shadow-inner">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* SVG Connecting Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {relationships.map((rel) => {
              const srcPos = entityPositions.get(rel.source_id);
              const tgtPos = entityPositions.get(rel.target_id);
              if (!srcPos || !tgtPos) return null;

              const isConnectedToSelected =
                selectedEntity && (rel.source_id === selectedEntity.id || rel.target_id === selectedEntity.id);

              return (
                <g key={rel.id}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isConnectedToSelected ? '#818cf8' : '#334155'}
                    strokeWidth={isConnectedToSelected ? '2.5' : '1.2'}
                    strokeDasharray={rel.relationship_type === 'AFFECTS' ? '4,4' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Relationship Label for Selected Node */}
                  {isConnectedToSelected && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 4}
                      fill="#cbd5e1"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-slate-900 px-1 py-0.5 rounded"
                    >
                      {rel.relationship_type}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Graph Node Badges */}
          <div className="relative z-10 w-full h-[500px]">
            {entities.map((ent) => {
              const pos = entityPositions.get(ent.id) || { x: 100, y: 100 };
              const isSelected = selectedEntity?.id === ent.id;

              return (
                <div
                  key={ent.id}
                  style={{ left: `${pos.x - 70}px`, top: `${pos.y - 20}px` }}
                  onClick={() => selectEntity(ent.id)}
                  className={`absolute w-36 cursor-pointer p-2 rounded-xl border transition-all duration-200 shadow-md ${getEntityColorClass(
                    ent.type,
                    isSelected
                  )}`}
                >
                  <div className="flex items-center gap-1.5">
                    {getEntityIcon(ent.type)}
                    <span className="text-[10px] font-mono font-bold uppercase truncate">{ent.type}</span>
                  </div>
                  <p className="text-xs font-bold leading-tight truncate mt-0.5">{ent.name}</p>
                </div>
              );
            })}
          </div>

          {/* Canvas Legend Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Incidents
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Assets & Roads
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Facilities
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Departments
              </span>
            </div>
            <span className="font-mono text-slate-400">Click node to inspect neighborhood</span>
          </div>
        </Card>
      </div>

      {/* Right Column: Active Entity Detail Focus Panel */}
      <div className="space-y-4">
        {selectedEntity ? (
          <EntityDetailPanel
            entity={selectedEntity}
            neighborhood={selectedNeighborhood}
            onSelectEntity={selectEntity}
            onViewOnMap={onViewOnMap}
          />
        ) : (
          <Card className="p-8 text-center space-y-3 border-slate-200">
            <Share2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Select any node on the graph</p>
            <p className="text-xs text-slate-500">
              Click on an incident, road, department, hospital, or asset to inspect direct relationships and contextual intelligence.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
