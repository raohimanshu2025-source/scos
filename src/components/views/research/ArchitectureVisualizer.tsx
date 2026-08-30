// =========================================================================
// SCOS PHASE 10E — INTERACTIVE 9-LAYER REFERENCE ARCHITECTURE VISUALIZER
// Interactive multi-layer exploration, component inspection, cross-layer flows,
// and civil engineering domain mappings.
// =========================================================================

import React, { useState } from 'react';
import {
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Database,
  Compass,
  Building2,
  Brain,
  Award,
  Activity,
  Search,
  Info,
  CheckCircle2,
  ArrowDown,
  Lock,
} from 'lucide-react';
import { SCOSArchitecturalLayer, SCOSComponentDefinition } from '../../../types/researchContribution';

export interface ArchitectureVisualizerProps {
  layers: SCOSArchitecturalLayer[];
  selectedLayerId?: string;
  onSelectLayer?: (layer: SCOSArchitecturalLayer) => void;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  layers,
  selectedLayerId: initialSelectedId,
  onSelectLayer,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<SCOSArchitecturalLayer>(
    layers.find((l) => l.layerId === initialSelectedId) || layers[0]
  );
  const [selectedComponent, setSelectedComponent] = useState<SCOSComponentDefinition | null>(
    selectedLayer?.components[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'stack' | 'flow'>('stack');

  const handleSelectLayer = (layer: SCOSArchitecturalLayer) => {
    setSelectedLayer(layer);
    setSelectedComponent(layer.components[0] || null);
    if (onSelectLayer) onSelectLayer(layer);
  };

  const getLayerIcon = (layerNumber: number) => {
    switch (layerNumber) {
      case 1:
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 2:
        return <Activity className="w-4 h-4 text-sky-400" />;
      case 3:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 4:
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 5:
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 6:
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 7:
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 8:
        return <Award className="w-4 h-4 text-rose-400" />;
      case 9:
        return <Lock className="w-4 h-4 text-blue-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEvidenceBadge = (level: string) => {
    switch (level) {
      case 'LEVEL_A_IMPLEMENTATION_VERIFIED':
        return {
          label: 'Level A: Verified Code',
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
        };
      case 'LEVEL_B_COMPUTATIONALLY_VERIFIED':
        return {
          label: 'Level B: Computational Test',
          bg: 'bg-sky-950/60 border-sky-500/40 text-sky-300',
        };
      case 'LEVEL_C_CONTROLLED_PROTOTYPE_EVIDENCE':
        return {
          label: 'Level C: Controlled Prototype',
          bg: 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300',
        };
      case 'LEVEL_D_DESCRIPTIVE_EXPERIMENTAL_EVIDENCE':
        return {
          label: 'Level D: Descriptive Experiments',
          bg: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
        };
      default:
        return {
          label: level,
          bg: 'bg-slate-800 border-slate-600 text-slate-300',
        };
    }
  };

  const filteredLayers = layers.filter((layer) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      layer.name.toLowerCase().includes(q) ||
      layer.description.toLowerCase().includes(q) ||
      layer.components.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.purpose.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Visualizer Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            SCOS 9-Layer Reference Architecture Stack
          </h3>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
            9 Formal Layers • 27 Core Components
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search layers & components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white pl-8 pr-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setActiveViewMode('stack')}
              className={`px-3 py-1 rounded transition-colors ${
                activeViewMode === 'stack'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Layer Stack
            </button>
            <button
              onClick={() => setActiveViewMode('flow')}
              className={`px-3 py-1 rounded transition-colors ${
                activeViewMode === 'flow'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Data Pipeline Flow
            </button>
          </div>
        </div>
      </div>

      {activeViewMode === 'flow' ? (
        /* Data Pipeline Flow Diagram */
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            End-to-End Operational Intelligence Dataflow Pipeline
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {layers.map((layer, idx) => (
              <div
                key={layer.layerId}
                onClick={() => handleSelectLayer(layer)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedLayer?.layerId === layer.layerId
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">
                    STEP {idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Layer {layer.layerNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {getLayerIcon(layer.layerNumber)}
                  <h4 className="text-xs font-semibold text-white line-clamp-1">{layer.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{layer.description}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  {layer.components.length} components • {layer.relatedPhases.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Layer Stack & Component Inspection (Two Column) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 9 Layer Stack */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Architectural Layers (Top-to-Bottom Stack)</span>
              <span className="text-slate-500 font-mono text-[10px]">9 Layers</span>
            </div>

            <div className="space-y-2">
              {filteredLayers
                // Render in reverse so Layer 9 is top, Layer 1 is physical base
                .slice()
                .reverse()
                .map((layer) => {
                  const isSelected = selectedLayer?.layerId === layer.layerId;
                  const badge = getEvidenceBadge(layer.evidenceLevel);

                  return (
                    <div
                      key={layer.layerId}
                      onClick={() => handleSelectLayer(layer)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                            {getLayerIcon(layer.layerNumber)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-400">
                                L{layer.layerNumber}
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  isSelected ? 'text-indigo-300' : 'text-slate-200'
                                }`}
                              >
                                {layer.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {layer.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${badge.bg}`}
                          >
                            {layer.evidenceLevel.replace('LEVEL_', '').slice(0, 7)}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-slate-500 transition-transform ${
                              isSelected ? 'rotate-90 text-indigo-400' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Layer Inspector & Component Details */}
          <div className="lg:col-span-7 space-y-4">
            {selectedLayer && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5">
                {/* Header info */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold">
                        LAYER {selectedLayer.layerNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedLayer.layerId}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border font-mono ${
                        getEvidenceBadge(selectedLayer.evidenceLevel).bg
                      }`}
                    >
                      {getEvidenceBadge(selectedLayer.evidenceLevel).label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{selectedLayer.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedLayer.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400">
                      <strong className="text-slate-300">Phase Mappings:</strong>{' '}
                      {selectedLayer.relatedPhases.join(', ')}
                    </span>
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400">
                      <strong className="text-slate-300">Components:</strong>{' '}
                      {selectedLayer.components.length} registered
                    </span>
                  </div>
                </div>

                {/* Sub-components list */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Architectural Components in Layer {selectedLayer.layerNumber}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLayer.components.map((comp) => {
                      const isCompSelected = selectedComponent?.id === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => setSelectedComponent(comp)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isCompSelected
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-400">
                              {comp.id}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {comp.evidenceLevel.replace('LEVEL_', '').slice(0, 7)}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white mb-1">{comp.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {comp.purpose}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Component Deep Dive */}
                {selectedComponent && (
                  <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Component Specification: {selectedComponent.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedComponent.id}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold">Purpose & Scope: </span>
                        <span className="text-slate-300">{selectedComponent.purpose}</span>
                      </div>

                      {selectedComponent.interfaces && selectedComponent.interfaces.length > 0 && (
                        <div>
                          <span className="text-slate-400 font-semibold">Key Interfaces & APIs:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedComponent.interfaces.map((iface, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-cyan-300"
                              >
                                {iface}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedComponent.civilEngModels && selectedComponent.civilEngModels.length > 0 && (
                        <div>
                          <span className="text-slate-400 font-semibold">Civil Engineering Foundations:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedComponent.civilEngModels.map((model, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-amber-300 font-mono"
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
