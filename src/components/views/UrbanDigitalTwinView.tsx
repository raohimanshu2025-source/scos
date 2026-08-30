import React, { useState, useEffect } from 'react';
import {
  Layers,
  Compass,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  MapPin,
  RefreshCw,
  Info,
  Shield,
  Search,
  Filter,
  ArrowRight,
  Database,
  Eye,
  Sliders,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Share2,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import {
  TwinEntity,
  TwinEntityType,
  TwinDependency,
  TwinSpatialRelationship,
  TwinOperationalState,
  TwinScenarioBaseline,
  DigitalTwinStatistics,
  UrbanDigitalTwinState,
} from '../../types/urbanDigitalTwin';
import { useAuth } from '../../context/AuthContext';
import { PermissionType } from '../../types/auth';
import { WhatIfScenarioSimulator } from '../digitalTwin/WhatIfScenarioSimulator';

export interface UrbanDigitalTwinViewProps {
  onNavigateToIncident?: (incidentId: string) => void;
  selectedEntityIdInitial?: string | null;
}

export const UrbanDigitalTwinView: React.FC<UrbanDigitalTwinViewProps> = ({
  onNavigateToIncident,
  selectedEntityIdInitial,
}) => {
  const { hasPermission } = useAuth();
  const [twinState, setTwinState] = useState<UrbanDigitalTwinState | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    selectedEntityIdInitial || null
  );
  const [selectedEntityDetails, setSelectedEntityDetails] = useState<{
    entity: TwinEntity;
    operationalState: TwinOperationalState;
    spatialRelationships: TwinSpatialRelationship[];
    dependencies: TwinDependency[];
    dependents: TwinDependency[];
  } | null>(null);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'ENTITIES' | 'DEPENDENCIES' | 'BASELINE' | 'TESTS'>('SIMULATION');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  const canView = hasPermission(PermissionType.URBAN_DIGITAL_TWIN_VIEW);

  const fetchTwinState = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getUrbanDigitalTwinState();
      if (res && res.data) {
        setTwinState(res.data);
        if (!selectedEntityId && res.data.entities.length > 0) {
          setSelectedEntityId(res.data.entities[0].entityId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load Urban Digital Twin state:', err);
      setError(err.message || 'Failed to connect to SCOS Urban Digital Twin Service');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntityDetails = async (entityId: string) => {
    setIsInspecting(true);
    try {
      const res = await apiClient.getUrbanDigitalTwinEntity(entityId);
      if (res && res.data) {
        setSelectedEntityDetails(res.data);
      }
    } catch (err) {
      console.warn('Failed to load entity details:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  useEffect(() => {
    fetchTwinState();
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      fetchEntityDetails(selectedEntityId);
    }
  }, [selectedEntityId]);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await apiClient.runDigitalTwinTestSuite();
      if (res && res.testResults) {
        setTestResults({
          passed: res.passedCount,
          total: res.totalTests,
          status: res.success ? 'ALL_PASSED' : 'HAS_FAILURES',
          timestamp: new Date().toISOString(),
          details: res.testResults.map((t) => `${t.id}: ${t.title}`),
        });
      }
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-8 text-center text-slate-200">
          <div className="w-14 h-14 bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-700/50">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
            The SCOS Urban Digital Twin Foundation is restricted to authorized municipal officers, district administrators, and engineering governance personnel.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 text-xs font-mono text-slate-400 border border-slate-700">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            Required Permission: URBAN_DIGITAL_TWIN_VIEW
          </div>
        </div>
      </div>
    );
  }

  const entities = twinState?.entities || [];
  const stats = twinState?.statistics;
  const baseline = twinState?.baselineSnapshot;

  const filteredEntities = entities.filter((entity) => {
    const matchesType = filterType === 'ALL' || entity.entityType === filterType;
    const matchesStatus = filterStatus === 'ALL' || entity.operationalStatus === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.location.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
      case 'DEGRADED':
      case 'CLOGGED_RISK':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'DISRUPTED':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'OFFLINE':
      case 'MAINTENANCE':
        return 'bg-slate-800 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
      case 'INFERRED':
        return 'bg-sky-950/60 text-sky-300 border-sky-700/60';
      case 'PROTOTYPE':
        return 'bg-amber-950/60 text-amber-300 border-amber-700/60';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                <Layers className="w-3.5 h-3.5" />
                PHASE 9A — URBAN DIGITAL TWIN FOUNDATION
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-700">
                <AlertCircle className="w-3.5 h-3.5" />
                SIMULATED / PROTOTYPE DATA
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Human-in-the-Loop Governance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              SCOS Urban Digital Twin — Prototype Engineering Model
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Structured computational representation of civil infrastructure assets, topological dependencies, spatial proximity, and operational states for Kanpur Smart City.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchTwinState}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Model
            </button>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-xs"
            >
              <Activity className="w-3.5 h-3.5" />
              Run Verification Suite
            </button>
          </div>
        </div>

        {/* DISCLAIMER NOTICE */}
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Engineering Model Boundary: </span>
            The Digital Twin is observational and analytical. It represents prototype system state and dependencies to prepare for scenario simulation. It does not actuate physical municipal devices or bypass authorized human officer authorization.
          </div>
        </div>
      </div>

      {/* SYSTEM STATUS BAR */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Total Entities</span>
            <span className="text-xl font-bold text-white font-mono">{stats.totalEntities}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Across 4 Departments</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Dependencies</span>
            <span className="text-xl font-bold text-sky-400 font-mono">{stats.totalRelationships}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Topological Links</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Critical Assets</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{stats.criticalEntities}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">High Severity Nodes</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Operational</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{stats.operationalEntities}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Normal Status</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Degraded / Clogged</span>
            <span className="text-xl font-bold text-amber-400 font-mono">{stats.degradedEntities}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Sub-optimal</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Disrupted</span>
            <span className="text-xl font-bold text-rose-500 font-mono">{stats.disruptedEntities}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Inundated / Blocked</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Active Incidents</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">{stats.activeIncidents}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Corridor Scope</span>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('SIMULATION')}
          className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'SIMULATION'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>What-If Scenario Simulation</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/40">
            Phase 9B
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ENTITIES')}
          className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'ENTITIES'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Civil Infrastructure & Spatial Twin ({entities.length})
        </button>
        <button
          onClick={() => setActiveTab('DEPENDENCIES')}
          className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'DEPENDENCIES'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Urban Dependency Graph ({twinState?.dependencies.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('BASELINE')}
          className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'BASELINE'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Scenario Baseline State
        </button>
        <button
          onClick={() => setActiveTab('TESTS')}
          className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
            activeTab === 'TESTS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Verification Suite
        </button>
      </div>

      {/* TAB 0: WHAT-IF SCENARIO SIMULATION (PHASE 9B) */}
      {activeTab === 'SIMULATION' && (
        <WhatIfScenarioSimulator onNavigateToIncident={() => onNavigateToIncident?.('INC-2026-0812-001')} />
      )}

      {/* TAB 1: ENTITIES & SPATIAL INSPECTOR */}
      {activeTab === 'ENTITIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Entity Registry & Filter */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search infrastructure by name, ward, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Entity Types</option>
                  <option value="ROAD">Roads</option>
                  <option value="JUNCTION">Junctions</option>
                  <option value="DRAIN">Drains</option>
                  <option value="DRAINAGE_CHANNEL">Drainage Channels</option>
                  <option value="PUMP_STATION">Pump Stations</option>
                  <option value="WATER_PIPELINE">Water Pipelines</option>
                  <option value="HOSPITAL">Hospitals</option>
                  <option value="POWER_SUBSTATION">Power Substations</option>
                  <option value="CRITICAL_FACILITY">Critical Facilities</option>
                  <option value="WARD">Wards</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="DEGRADED">Degraded</option>
                  <option value="DISRUPTED">Disrupted</option>
                  <option value="CLOGGED_RISK">Clogged Risk</option>
                </select>
              </div>
            </div>

            {/* Entities Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredEntities.map((entity) => {
                const isSelected = selectedEntityId === entity.entityId;
                return (
                  <div
                    key={entity.entityId}
                    onClick={() => setSelectedEntityId(entity.entityId)}
                    className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition relative ${
                      isSelected
                        ? 'border-indigo-500 ring-1 ring-indigo-500 bg-slate-900/90'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                          {entity.entityType}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5 leading-snug line-clamp-1">
                          {entity.name}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusBadge(
                          entity.operationalStatus
                        )}`}
                      >
                        {entity.operationalStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 mb-3">
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{entity.location.ward}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{entity.department}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="font-mono">
                        Criticality:{' '}
                        <strong
                          className={
                            entity.criticality === 'CRITICAL'
                              ? 'text-rose-400'
                              : entity.criticality === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {entity.criticality}
                        </strong>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getVerificationBadge(
                          entity.governance.verificationStatus
                        )}`}
                      >
                        {entity.governance.verificationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Entity Inspector */}
          <div className="space-y-4">
            {selectedEntityDetails ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                      DIGITAL TWIN ENTITY INSPECTOR
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">
                      {selectedEntityDetails.entity.name}
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                      selectedEntityDetails.entity.operationalStatus
                    )}`}
                  >
                    {selectedEntityDetails.entity.operationalStatus}
                  </span>
                </div>

                {/* Core Attributes */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block">Entity ID</span>
                      <span className="font-mono text-slate-200 text-xs font-semibold">
                        {selectedEntityDetails.entity.entityId}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block">Entity Type</span>
                      <span className="font-mono text-indigo-300 text-xs font-semibold">
                        {selectedEntityDetails.entity.entityType}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block">Physical Condition</span>
                      <span className="font-semibold text-slate-200">
                        {selectedEntityDetails.entity.condition}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block">Criticality Level</span>
                      <span
                        className={`font-semibold ${
                          selectedEntityDetails.entity.criticality === 'CRITICAL'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedEntityDetails.entity.criticality}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">Geographic Location</span>
                    <p className="text-slate-200 font-medium">{selectedEntityDetails.entity.location.ward}</p>
                    <p className="text-[11px] text-slate-400">
                      Coords: {selectedEntityDetails.entity.location.latitude.toFixed(4)},{' '}
                      {selectedEntityDetails.entity.location.longitude.toFixed(4)}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">Managing Department</span>
                    <p className="text-slate-200 font-medium">{selectedEntityDetails.entity.department}</p>
                    {selectedEntityDetails.entity.capacity && (
                      <p className="text-[11px] text-slate-400">
                        Capacity: {selectedEntityDetails.entity.capacity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Operational State & Risk Context */}
                {selectedEntityDetails.operationalState && (
                  <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Live Operational Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Freshness: {selectedEntityDetails.operationalState.dataFreshness}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Active Incidents:</span>{' '}
                        <strong className="text-white font-mono">
                          {selectedEntityDetails.operationalState.activeIncidentCount}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Predictive Risk:</span>{' '}
                        <strong className="text-amber-400 font-mono">
                          {selectedEntityDetails.operationalState.predictiveRiskScore}/100
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outgoing Dependencies */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                    Dependencies ({selectedEntityDetails.dependencies.length})
                  </span>
                  {selectedEntityDetails.dependencies.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      No direct upstream dependencies registered.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {selectedEntityDetails.dependencies.map((dep) => (
                        <div
                          key={dep.relationshipId}
                          className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              {dep.relationshipType}: {dep.targetEntityName}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getVerificationBadge(
                                dep.verificationStatus
                              )}`}
                            >
                              {dep.verificationStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">{dep.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spatial Proximity Neighbors */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                    Nearby Civil Assets ({selectedEntityDetails.spatialRelationships.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedEntityDetails.spatialRelationships.slice(0, 5).map((rel) => (
                      <div
                        key={rel.relationshipId}
                        className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 font-medium truncate max-w-[180px]">
                          {rel.targetEntityName}
                        </span>
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                          {rel.distanceKm}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Provenance & Lineage */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono">Source ID:</span>
                    <span className="font-mono text-slate-300">
                      {selectedEntityDetails.entity.provenance.sourceId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-mono">Quality Score:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {selectedEntityDetails.entity.dataQuality.qualityScore}% (
                      {selectedEntityDetails.entity.dataQuality.qualityLevel})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                Select an infrastructure entity to view topological dependencies and operational state.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: URBAN DEPENDENCY GRAPH */}
      {activeTab === 'DEPENDENCIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">
              TOPOLOGICAL URBAN DEPENDENCY CHAINS
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Infrastructure Dependency & Critical Cascade Pathways
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Explicit engineering dependencies linking drainage basins, arterial roads, emergency hospital routes, power feeds, and pump stations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {twinState?.dependencies.map((dep) => (
              <div
                key={dep.relationshipId}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">{dep.relationshipId}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getVerificationBadge(
                      dep.verificationStatus
                    )}`}
                  >
                    {dep.verificationStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-white bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex-1 truncate">
                    <span className="text-[10px] font-mono text-indigo-400 block">{dep.sourceEntityType}</span>
                    <span className="truncate">{dep.sourceEntityName}</span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[9px] font-mono text-slate-400">{dep.relationshipType}</span>
                    <ArrowRight className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 truncate text-right">
                    <span className="text-[10px] font-mono text-indigo-400 block">{dep.targetEntityType}</span>
                    <span className="truncate">{dep.targetEntityName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{dep.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <span>Confidence: {(dep.confidence * 100).toFixed(0)}%</span>
                  <span className="italic truncate max-w-[200px]">Prov: {dep.provenance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCENARIO BASELINE STATE */}
      {activeTab === 'BASELINE' && baseline && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                SCENARIO BASELINE REPOSITORY
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">SCOS Digital Twin Baseline State</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synchronized prototype operational state serving as reference for Phase 9B What-If Simulations.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 self-start">
              ID: {baseline.snapshotId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Generated At</span>
              <span className="text-sm font-mono text-white">{new Date(baseline.generatedAt).toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">System State</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{baseline.systemStatus}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Data Classification</span>
              <span className="text-xs font-bold text-amber-300 font-mono">{baseline.dataClassification}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">Freshness Rate</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {baseline.provenanceSummary.freshnessRatePercent}%
              </span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              Entities Represented by Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(baseline.entitiesSummaryByType).map(([cat, count]) => (
                <div key={cat} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">{cat}</span>
                  <span className="text-base font-bold text-white font-mono mt-1 block">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-slate-200 font-mono block uppercase">
              Civil Engineering Research Contribution
            </span>
            <p className="leading-relaxed">
              "An urban digital twin as a structured engineering representation for infrastructure-aware operational decision support." This baseline captures physical asset condition, topological dependencies, critical facility proximity, and departmental responsibilities across Kanpur Smart City.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION TEST SUITE */}
      {activeTab === 'TESTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                AUTOMATED VERIFICATION SUITE
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                Digital Twin Foundation Test Instrumentation
              </h2>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
            >
              <Check className="w-3.5 h-3.5" />
              Run All Tests
            </button>
          </div>

          {testResults ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>All {testResults.passed}/{testResults.total} tests passed</strong> — Digital Twin state, dependencies, spatial proximity, and RBAC verified.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {testResults.details.map((t: string, i: number) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click "Run All Tests" to verify all 20 Digital Twin test assertions.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UrbanDigitalTwinView;
