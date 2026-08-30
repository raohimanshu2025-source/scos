// =========================================================================
// SCOS GEOSPATIAL & CIVIL INFRASTRUCTURE INTELLIGENCE DASHBOARD
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Activity,
  AlertTriangle,
  Shield,
  Layers,
  Search,
  Filter,
  Plus,
  Compass,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  ExternalLink,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Droplets,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { infrastructureService } from '../../services/infrastructureService';
import { spatialService } from '../../services/spatialService';
import {
  CivilInfrastructureAsset,
  AssetType,
  AssetCondition,
  AssetCriticality,
  AssetStatus,
  NearbyAssetResult,
  InfrastructureSummaryMetrics,
} from '../../types/infrastructure';
import { useAuth } from '../../context/AuthContext';
import { PermissionType } from '../../types/auth';

export const CivilInfrastructureDashboard: React.FC = () => {
  const { hasPermission, user } = useAuth();

  // State Management
  const [assets, setAssets] = useState<CivilInfrastructureAsset[]>([]);
  const [metrics, setMetrics] = useState<InfrastructureSummaryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<CivilInfrastructureAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'MAP' | 'REGISTRY' | 'PROXIMITY'>('MAP');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');

  // Proximity Search State
  const [proxLat, setProxLat] = useState<number>(26.458);
  const [proxLon, setProxLon] = useState<number>(80.342);
  const [proxRadius, setProxRadius] = useState<number>(2000);
  const [proxResults, setProxResults] = useState<NearbyAssetResult[]>([]);
  const [proxLoading, setProxLoading] = useState<boolean>(false);

  // New Asset Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newAssetData, setNewAssetData] = useState<Partial<CivilInfrastructureAsset>>({
    assetName: '',
    assetType: 'ROAD',
    department: 'Kanpur Nagar Nigam',
    status: 'OPERATIONAL',
    condition: 'GOOD',
    criticality: 'MEDIUM',
    capacity: 'Standard Capacity',
    location: {
      latitude: 26.458,
      longitude: 80.342,
      ward: 'Ward 12 — Parade Crossing',
      zone: 'Zone 1 — Central Corridor',
    },
  });

  const canCreate = hasPermission(PermissionType.INFRASTRUCTURE_CREATE);
  const canUpdate = hasPermission(PermissionType.INFRASTRUCTURE_UPDATE);

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedCondition, selectedCriticality]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, metricsRes] = await Promise.all([
        infrastructureService.getAllAssets({
          type: selectedType !== 'ALL' ? selectedType : undefined,
          condition: selectedCondition !== 'ALL' ? selectedCondition : undefined,
          criticality: selectedCriticality !== 'ALL' ? selectedCriticality : undefined,
        }),
        infrastructureService.getMetrics(),
      ]);

      if (assetsRes.success) setAssets(assetsRes.data);
      if (metricsRes.success) setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Failed to load civil infrastructure data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProximitySearch = async () => {
    setProxLoading(true);
    try {
      const res = await spatialService.getNearbyAssets(proxLat, proxLon, proxRadius);
      if (res.success) {
        setProxResults(res.data);
      }
    } catch (err) {
      console.error('Proximity search failed:', err);
    } finally {
      setProxLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetData.assetName || !newAssetData.assetType) return;

    try {
      const res = await infrastructureService.createAsset(newAssetData);
      if (res.success) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create asset:', err);
    }
  };

  const handleUpdateStatus = async (assetId: string, newStatus: AssetStatus, newCondition: AssetCondition) => {
    try {
      const res = await infrastructureService.updateAsset(assetId, {
        status: newStatus,
        condition: newCondition,
      });
      if (res.success && res.data) {
        setSelectedAsset(res.data);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update asset status:', err);
    }
  };

  // Filtered Assets for Table & Map
  const filteredAssets = assets.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.assetName.toLowerCase().includes(query) ||
      a.department.toLowerCase().includes(query) ||
      a.location.ward.toLowerCase().includes(query) ||
      a.assetType.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OPERATIONAL</span>;
      case 'DISRUPTED':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">DISRUPTED</span>;
      case 'CLOGGED_RISK':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">CLOGGED RISK</span>;
      case 'MAINTENANCE':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">MAINTENANCE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case 'GOOD':
        return <span className="text-emerald-400 font-semibold">GOOD</span>;
      case 'FAIR':
        return <span className="text-blue-400 font-semibold">FAIR</span>;
      case 'POOR':
        return <span className="text-amber-400 font-semibold">POOR</span>;
      case 'CRITICAL':
        return <span className="text-rose-400 font-semibold">CRITICAL</span>;
      default:
        return <span className="text-slate-400">UNKNOWN</span>;
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'ROAD':
      case 'ROAD_JUNCTION':
      case 'BRIDGE':
        return <Truck className="w-4 h-4 text-sky-400" />;
      case 'DRAIN':
      case 'DRAINAGE_NETWORK':
      case 'PUMPING_STATION':
      case 'WATER_PIPELINE':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'HOSPITAL':
      case 'HEALTH_FACILITY':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'CRITICAL_FACILITY':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Building2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-300 uppercase tracking-wide">
            Simulated / Prototype Data — Urban Civil Infrastructure Layer
          </p>
          <p className="text-amber-200/80">
            Spatial representations and Haversine proximity calculations are operational decision-support prototypes. No live Kanpur GIS or survey-grade government infrastructure integration is claimed. All assets are marked as simulated/historical.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-sky-400" />
            SCOS Geospatial & Civil Infrastructure Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Urban spatial asset inventory, proximity modeling, and cascading civil infrastructure risk analysis for Kanpur Nagar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center gap-2 text-xs font-semibold shadow-lg shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Total Assets</p>
            <p className="text-2xl font-bold text-slate-100">{metrics.totalAssets}</p>
            <p className="text-[10px] text-slate-500">Kanpur District Grid</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Roads & Corridors</p>
            <p className="text-2xl font-bold text-sky-400">{metrics.roadCount}</p>
            <p className="text-[10px] text-slate-500">Arterials & Junctions</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Drainage Assets</p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.drainageCount}</p>
            <p className="text-[10px] text-slate-500">Nala Channels & Trunks</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Dewatering Pumps</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics.pumpingStationCount}</p>
            <p className="text-[10px] text-slate-500">Auxiliary Stations</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Health Facilities</p>
            <p className="text-2xl font-bold text-rose-400">{metrics.healthCount}</p>
            <p className="text-[10px] text-slate-500">Hospitals & Centers</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <p className="text-xs text-slate-400 font-medium">Critical Grids</p>
            <p className="text-2xl font-bold text-amber-400">{metrics.criticalFacilityCount}</p>
            <p className="text-[10px] text-slate-500">Power & Water Hubs</p>
          </div>
        </div>
      )}

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('MAP')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'MAP'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Spatial GIS Canvas View
          </button>

          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'REGISTRY'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Asset Registry Table
          </button>

          <button
            onClick={() => setActiveTab('PROXIMITY')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'PROXIMITY'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Haversine Proximity Calculator
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets, ward, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 w-64"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="ROAD">Roads</option>
            <option value="DRAIN">Drainage</option>
            <option value="PUMPING_STATION">Pumping Stations</option>
            <option value="HOSPITAL">Hospitals</option>
            <option value="WATER_PIPELINE">Water Lines</option>
            <option value="CRITICAL_FACILITY">Critical Facilities</option>
          </select>
        </div>
      </div>

      {/* TAB 1: SPATIAL GIS CANVAS VIEW */}
      {activeTab === 'MAP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spatial Canvas Map Simulation */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  Kanpur Urban Corridor Spatial Layer
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                CENTER: 26.4580 N, 80.3420 E (Parade Crossing Ward 12)
              </span>
            </div>

            {/* Simulated Map Graphical Canvas */}
            <div className="relative w-full h-[480px] bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Map Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

              {/* Simulated Road Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Mall Road line */}
                <line x1="10%" y1="20%" x2="90%" y2="40%" stroke="#0284c7" strokeWidth="4" strokeDasharray="8 4" opacity="0.6" />
                {/* Parade Road line */}
                <line x1="30%" y1="80%" x2="70%" y2="10%" stroke="#e11d48" strokeWidth="5" opacity="0.7" />
                {/* Benajhabar Branch */}
                <line x1="20%" y1="40%" x2="80%" y2="80%" stroke="#0891b2" strokeWidth="3" opacity="0.5" />
              </svg>

              {/* Map Asset Markers */}
              <div className="absolute inset-0 p-8">
                {filteredAssets.map((asset, idx) => {
                  // Normalize coordinates onto canvas percentage
                  const normX = Math.min(85, Math.max(15, ((asset.location.longitude - 80.31) / 0.05) * 100));
                  const normY = Math.min(85, Math.max(15, (1 - (asset.location.latitude - 26.43) / 0.05) * 100));

                  const isSelected = selectedAsset?.assetId === asset.assetId;

                  return (
                    <div
                      key={asset.assetId}
                      onClick={() => setSelectedAsset(asset)}
                      style={{ left: `${normX}%`, top: `${normY}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-200 z-10`}
                    >
                      <div
                        className={`p-2 rounded-xl border shadow-xl flex items-center gap-2 transition-transform hover:scale-110 ${
                          isSelected
                            ? 'bg-sky-500 text-white border-white ring-4 ring-sky-500/30'
                            : asset.status === 'DISRUPTED'
                            ? 'bg-rose-950/90 text-rose-300 border-rose-500'
                            : asset.status === 'CLOGGED_RISK'
                            ? 'bg-amber-950/90 text-amber-300 border-amber-500'
                            : 'bg-slate-900/90 text-slate-200 border-slate-700'
                        }`}
                      >
                        {getAssetIcon(asset.assetType)}
                        <span className="text-[11px] font-semibold whitespace-nowrap max-w-[120px] truncate hidden md:inline">
                          {asset.assetName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Legend Bar */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-slate-300 backdrop-blur">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-sky-400" /> Road</span>
                  <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-cyan-400" /> Drainage</span>
                  <span className="flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Hospital</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Power Grid</span>
                </div>
                <span className="text-[10px] text-slate-500">Interactive SCOS Prototype Overlay</span>
              </div>
            </div>
          </div>

          {/* Selected Asset Inspector Panel */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            {selectedAsset ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                      ASSET INSPECTOR
                    </span>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                      {getAssetIcon(selectedAsset.assetType)}
                      {selectedAsset.assetName}
                    </h3>
                  </div>
                  {getStatusBadge(selectedAsset.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <p className="text-[10px] text-slate-500">Asset Type</p>
                    <p className="font-semibold text-slate-200">{selectedAsset.assetType}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <p className="text-[10px] text-slate-500">Condition</p>
                    <p className="font-semibold">{getConditionBadge(selectedAsset.condition)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <p className="text-[10px] text-slate-500">Criticality Level</p>
                    <p className="font-semibold text-amber-400">{selectedAsset.criticality}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-0.5">
                    <p className="text-[10px] text-slate-500">Managing Dept</p>
                    <p className="font-semibold text-slate-200 truncate">{selectedAsset.department}</p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Spatial Location</p>
                  <p className="text-slate-300 font-medium">{selectedAsset.location.address || 'Kanpur Nagar Ward Corridor'}</p>
                  <p className="text-slate-400 text-[11px]">{selectedAsset.location.ward} ({selectedAsset.location.zone})</p>
                  <p className="text-slate-500 text-[10px] font-mono">
                    COORDINATES: {selectedAsset.location.latitude}, {selectedAsset.location.longitude}
                  </p>
                </div>

                {/* Quality & Provenance */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase">Data Quality Score</span>
                    <span className="font-bold text-emerald-400">{selectedAsset.quality.qualityScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${selectedAsset.quality.qualityScore}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Publisher: {selectedAsset.provenance.dataPublisher} ({selectedAsset.dataMode})
                  </p>
                </div>

                {/* Quick Status Update Controls */}
                {canUpdate && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Update Operational Status</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedAsset.assetId, 'OPERATIONAL', 'GOOD')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30 hover:bg-emerald-500/30"
                      >
                        Set Operational
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAsset.assetId, 'DISRUPTED', 'CRITICAL')}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/30 hover:bg-rose-500/30"
                      >
                        Set Disrupted
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAsset.assetId, 'CLOGGED_RISK', 'POOR')}
                        className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30 hover:bg-amber-500/30"
                      >
                        Set Clogged
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Compass className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
                <p className="text-xs font-medium">Select any spatial marker on the map to inspect asset details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ASSET REGISTRY TABLE */}
      {activeTab === 'REGISTRY' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Asset ID & Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Ward / Zone</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Criticality</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quality</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.map((asset) => (
                  <tr key={asset.assetId} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(asset.assetType)}
                        <div>
                          <p className="font-semibold text-slate-200">{asset.assetName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{asset.assetId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-sky-400">{asset.assetType}</td>
                    <td className="px-4 py-3 text-slate-300">{asset.department}</td>
                    <td className="px-4 py-3 text-slate-400">{asset.location.ward}</td>
                    <td className="px-4 py-3">{getConditionBadge(asset.condition)}</td>
                    <td className="px-4 py-3 font-semibold text-amber-400">{asset.criticality}</td>
                    <td className="px-4 py-3">{getStatusBadge(asset.status)}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{asset.quality.qualityScore}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setActiveTab('MAP');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-medium transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HAVERSINE PROXIMITY CALCULATOR */}
      {activeTab === 'PROXIMITY' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              Haversine Spatial Proximity Query Engine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={proxLat}
                  onChange={(e) => setProxLat(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={proxLon}
                  onChange={(e) => setProxLon(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  step="100"
                  value={proxRadius}
                  onChange={(e) => setProxRadius(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleProximitySearch}
                  disabled={proxLoading}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition text-xs flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {proxLoading ? 'Calculating...' : 'Run Proximity Query'}
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 text-xs pt-2">
              <span className="text-slate-500">Presets:</span>
              <button
                onClick={() => {
                  setProxLat(26.458);
                  setProxLon(80.342);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                Parade Crossing (SCOS-INC-1024)
              </button>
              <button
                onClick={() => {
                  setProxLat(26.475);
                  setProxLon(80.322);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                Swaroop Nagar Hospital
              </button>
            </div>
          </div>

          {/* Results List */}
          {proxResults.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Assets Within {proxRadius}m Radius ({proxResults.length} Found)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proxResults.map((res) => (
                  <div
                    key={res.asset.assetId}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getAssetIcon(res.assetType)}
                        <h4 className="font-semibold text-slate-200">{res.asset.assetName}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {res.distanceKm}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{res.asset.location.ward}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      <span>Spatial Rel: {res.spatialRelType}</span>
                      <span>Quality: {res.quality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                Register Prototype Civil Infrastructure Asset
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={newAssetData.assetName}
                    onChange={(e) => setNewAssetData({ ...newAssetData, assetName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    placeholder="e.g. Swaroop Nagar Drainage Culvert"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Asset Type</label>
                  <select
                    value={newAssetData.assetType}
                    onChange={(e) => setNewAssetData({ ...newAssetData, assetType: e.target.value as AssetType })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="ROAD">ROAD</option>
                    <option value="DRAIN">DRAIN</option>
                    <option value="PUMPING_STATION">PUMPING_STATION</option>
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="WATER_PIPELINE">WATER_PIPELINE</option>
                    <option value="CRITICAL_FACILITY">CRITICAL_FACILITY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Managing Department</label>
                  <input
                    type="text"
                    value={newAssetData.department}
                    onChange={(e) => setNewAssetData({ ...newAssetData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Criticality</label>
                  <select
                    value={newAssetData.criticality}
                    onChange={(e) => setNewAssetData({ ...newAssetData, criticality: e.target.value as AssetCriticality })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
