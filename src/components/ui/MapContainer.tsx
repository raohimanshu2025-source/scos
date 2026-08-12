import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  AlertTriangle,
  Loader2,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './Badge';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: 'WATER' | 'TRAFFIC' | 'MUNICIPAL' | 'HEALTH' | 'INCIDENT';
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  details?: string;
}

export interface MapLayer {
  id: string;
  name: string;
  active: boolean;
  count: number;
}

export interface MapContainerProps {
  title?: string;
  subtitle?: string;
  markers?: MapMarker[];
  layers?: MapLayer[];
  height?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  title = 'GIS Urban Command Canvas',
  subtitle = 'Spatial GIS Intelligence & IoT Asset Tracking — Kanpur District',
  markers = [],
  layers: initialLayers = [
    { id: 'water', name: 'Water Pumping & Outfalls', active: true, count: 18 },
    { id: 'traffic', name: 'Traffic Junctions & Cameras', active: true, count: 24 },
    { id: 'municipal', name: 'Sanitation & Solid Waste Vehicles', active: true, count: 42 },
    { id: 'health', name: 'Emergency Health Facilities', active: false, count: 12 },
  ],
  height = '420px',
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to fetch GIS spatial layers from district GIS server.',
  className = '',
  onMarkerClick,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [layers, setLayers] = useState<MapLayer[]>(initialLayers);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'satellite' | 'heatmap'>('map');

  const toggleLayer = (layerId: string) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, active: !l.active } : l)));
  };

  return (
    <Card className={`relative overflow-hidden p-0 border border-slate-300 ${className}`}>
      {/* Map Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h4>
            <p className="text-[11px] text-slate-300">{subtitle}</p>
          </div>
        </div>

        {/* Map Type Switcher */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[11px] font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded-md transition ${activeTab === 'map' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
          >
            Vector Map
          </button>
          <button
            onClick={() => setActiveTab('satellite')}
            className={`px-2.5 py-1 rounded-md transition ${activeTab === 'satellite' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-2.5 py-1 rounded-md transition ${activeTab === 'heatmap' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
          >
            Heatmap Layer
          </button>
        </div>
      </div>

      {/* Main Map Canvas Viewport */}
      <div className="relative bg-slate-950 overflow-hidden flex items-center justify-center" style={{ height }}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Loading GIS Vector Tiles & Layer Feeds...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center text-center p-6 bg-slate-900/90 rounded-2xl border border-rose-500/30 max-w-md">
            <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
            <h5 className="text-sm font-bold text-white mb-1">GIS Layer Load Error</h5>
            <p className="text-xs text-rose-200">{errorMessage}</p>
          </div>
        ) : (
          <>
            {/* Synthetic Vector Grid Simulation Background */}
            <div
              className={`absolute inset-0 opacity-30 ${
                activeTab === 'satellite'
                  ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900'
                  : 'bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950'
              }`}
            />

            {/* Stylized River Ganga Contour line simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="none">
              <path
                d="M 0,220 Q 200,180 400,240 T 800,200 T 1200,280"
                fill="none"
                stroke="#0284c7"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>

            {/* Interactive Markers Overlay */}
            <div className="absolute inset-0 p-8 relative">
              {markers.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>No spatial incidents or markers logged in active viewport.</span>
                  </div>
                </div>
              ) : (
                markers.map((m, idx) => {
                  // Distribute markers across canvas
                  const leftPos = `${15 + ((idx * 17 + 23) % 70)}%`;
                  const topPos = `${20 + ((idx * 23 + 19) % 60)}%`;

                  const colorMap = {
                    CRITICAL: 'bg-rose-500 text-white shadow-rose-500/50',
                    WARNING: 'bg-amber-500 text-white shadow-amber-500/50',
                    NORMAL: 'bg-emerald-500 text-white shadow-emerald-500/50',
                  };

                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMarker(m);
                        if (onMarkerClick) onMarkerClick(m);
                      }}
                      style={{ left: leftPos, top: topPos }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg border-2 border-white transition-all hover:scale-125 cursor-pointer z-20 ${colorMap[m.status]}`}
                      title={m.title}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Map Floating Control Controls */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-xl">
              <button
                onClick={() => setZoomLevel(Math.min(18, zoomLevel + 1))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(8, zoomLevel - 1))}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Layer Control Panel Floating Right */}
            <div className="absolute top-4 right-4 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl w-60">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-2 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Active GIS Layers
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Zoom: {zoomLevel}x</span>
              </div>
              <div className="space-y-1.5">
                {layers.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => toggleLayer(l.id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      l.active ? 'bg-indigo-950/60 text-indigo-200 border border-indigo-800/60' : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {l.active ? <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                      <span className="truncate text-[11px]">{l.name}</span>
                    </span>
                    <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] font-mono text-slate-300 rounded-md">{l.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Marker Detail Card Popover */}
            {selectedMarker && (
              <div className="absolute bottom-4 left-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl max-w-sm text-white">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="text-xs font-bold text-white">{selectedMarker.title}</h5>
                  <StatusBadge status={selectedMarker.status} size="sm" />
                </div>
                <p className="text-[11px] text-slate-300 mb-2">{selectedMarker.details || 'Active GIS node reporting telemetry updates.'}</p>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>LAT: {selectedMarker.lat.toFixed(4)}° N</span>
                  <span>LNG: {selectedMarker.lng.toFixed(4)}° E</span>
                  <button onClick={() => setSelectedMarker(null)} className="text-slate-400 hover:text-white underline">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Coordinates & Scale Status Bar */}
            <div className="absolute bottom-2 right-4 z-20 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-3">
              <span>KANPUR NAGAR (26.4499° N, 80.3319° E)</span>
              <span className="text-emerald-400">EPSG:4326 (WGS84)</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
