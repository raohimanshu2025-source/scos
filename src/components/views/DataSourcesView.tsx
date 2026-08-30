import React, { useState } from 'react';
import { useDataSources } from '../../context/DataSourceContext';
import { DataSource, SourceType, DataCategory, DataMode, DataSourceStatus } from '../../types/dataSource';
import { DataQualityIndicator } from '../ui/DataQualityIndicator';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
  Database,
  Search,
  Filter,
  Plus,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Building2,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const { sources, loading, error, refreshSources, toggleSource, createSource } = useDataSources();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Source Form State
  const [newSourceName, setNewSourceName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Kanpur Nagar Nigam');
  const [newSourceType, setNewSourceType] = useState<SourceType>('DEPARTMENT_SYSTEM');
  const [newDataCategory, setNewDataCategory] = useState<DataCategory>('DRAINAGE');
  const [newDataMode, setNewDataMode] = useState<DataMode>('PROTOTYPE');
  const [newUpdateFreq, setNewUpdateFreq] = useState('Daily');
  const [newCivilDomain, setNewCivilDomain] = useState('Municipal Infrastructure');
  const [newDescription, setNewDescription] = useState('');

  const filteredSources = sources.filter((src) => {
    const matchesSearch =
      src.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (src.civilEngineeringDomain && src.civilEngineeringDomain.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || src.dataCategory === selectedCategory;
    const matchesMode = selectedMode === 'ALL' || src.dataMode === selectedMode;

    return matchesSearch && matchesCategory && matchesMode;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    try {
      await createSource({
        sourceName: newSourceName,
        sourceType: newSourceType,
        department: newDepartment,
        description: newDescription || 'Prototype urban dataset registered for SCOS integration.',
        dataCategory: newDataCategory,
        updateFrequency: newUpdateFreq,
        dataMode: newDataMode,
        civilEngineeringDomain: newCivilDomain,
        reliability: 90,
      });

      setShowCreateModal(false);
      setNewSourceName('');
      setNewDescription('');
    } catch (err: any) {
      alert('Failed to register data source: ' + err.message);
    }
  };

  const getFreshnessBadge = (freshness?: string) => {
    switch (freshness) {
      case 'FRESH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">FRESH</span>;
      case 'AGING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">AGING</span>;
      case 'STALE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">STALE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">UNKNOWN</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-widest">
              Phase 8.1 Foundation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
              Prototype Registry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-7 h-7 text-indigo-400" />
            SCOS Urban Data Sources
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Centralized data integration foundation mapping operational systems, civil infrastructure domains, data mode classifications, and provenance fidelity across municipal departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshSources()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
            title="Refresh Data Source Registry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Register Data Source
          </button>
        </div>
      </div>

      {/* Mandatory Architecture Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300 text-sm">
            ARCHITECTURE NOTICE — PROTOTYPE & SIMULATED DATA FOUNDATION
          </p>
          <p className="text-slate-300 leading-relaxed">
            All registered sources below represent baseline prototype models, synthetic simulation feeds, or static spatial datasets for research and demonstration. No live external government connections or live real-time IoT physical hardware feeds are claimed or active in this environment.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search data sources, departments, civil domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Data Categories</option>
            <option value="DRAINAGE">DRAINAGE</option>
            <option value="WATER">WATER</option>
            <option value="TRAFFIC">TRAFFIC</option>
            <option value="HEALTH">HEALTH</option>
            <option value="PUBLIC_WORKS">PUBLIC WORKS</option>
            <option value="WEATHER">WEATHER</option>
            <option value="CRITICAL_INFRASTRUCTURE">CRITICAL INFRASTRUCTURE</option>
            <option value="INCIDENT">INCIDENT</option>
          </select>
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Data Modes</option>
            <option value="SIMULATED">SIMULATED</option>
            <option value="PROTOTYPE">PROTOTYPE</option>
            <option value="HISTORICAL">HISTORICAL</option>
            <option value="STATIC">STATIC</option>
            <option value="EXTERNAL">EXTERNAL</option>
            <option value="REAL_TIME">REAL_TIME</option>
          </select>
        </div>
      </div>

      {/* Main Grid / Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Data Source Cards / Table List */}
        <div className={selectedSource ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>SHOWING {filteredSources.length} OF {sources.length} REGISTERED SOURCES</span>
            <span>PROVENANCE VERIFIED</span>
          </div>

          <div className="space-y-3">
            {filteredSources.map((source) => (
              <div
                key={source.sourceId}
                onClick={() => setSelectedSource(source)}
                className={`group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 ${
                  selectedSource?.sourceId === source.sourceId
                    ? 'border-indigo-500/80 bg-indigo-950/20 shadow-lg shadow-indigo-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ProvenanceBadge
                        sourceName={source.sourceName}
                        sourceId={source.sourceId}
                        department={source.department}
                        dataMode={source.dataMode}
                        timestamp={source.lastUpdated}
                        dataQuality={source.provenance.dataQuality}
                        validationStatus={source.provenance.validationStatus}
                        civilEngineeringDomain={source.civilEngineeringDomain}
                        compact
                      />
                      {getFreshnessBadge((source as any).freshness)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {source.dataCategory}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-2">
                      {source.sourceName}
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {source.description}
                    </p>
                  </div>

                  {/* Actions / Metadata right side */}
                  <div className="sm:text-right shrink-0 space-y-1.5 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="flex items-center sm:justify-end gap-2">
                      <DataQualityIndicator quality={source.provenance.dataQuality} size="sm" />
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center sm:justify-end gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{source.department}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span>Freq: {source.updateFrequency}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredSources.length === 0 && (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
                <Database className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="font-semibold text-white text-sm">No data sources match your filter criteria</p>
                <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Data Categories".</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Data Source Detail Panel */}
        {selectedSource && (
          <div className="lg:col-span-5 space-y-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sticky top-6 self-start shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                  DATA SOURCE SPECIFICATION
                </span>
                <h2 className="text-lg font-bold text-white">{selectedSource.sourceName}</h2>
                <span className="text-xs font-mono text-slate-400">{selectedSource.sourceId}</span>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Prototype Disclaimer Banner */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-indigo-200">Prototype Data Source</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {selectedSource.isPrototypeNotice || 'SCOS Demonstration & Research Dataset Entry'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Description</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 leading-relaxed">
                  {selectedSource.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Department</span>
                  <span className="font-semibold text-slate-200">{selectedSource.department}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Data Category</span>
                  <span className="font-semibold text-indigo-300 font-mono">{selectedSource.dataCategory}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Data Mode</span>
                  <span className="font-bold text-amber-300 font-mono">{selectedSource.dataMode}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Update Frequency</span>
                  <span className="font-semibold text-slate-200">{selectedSource.updateFrequency}</span>
                </div>
              </div>

              {selectedSource.civilEngineeringDomain && (
                <div className="bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/40">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block">Civil Engineering Domain</span>
                  <span className="font-semibold text-emerald-200">{selectedSource.civilEngineeringDomain}</span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
                  PROVENANCE METRICS
                </span>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-slate-400">Quality Indicator</span>
                  <DataQualityIndicator quality={selectedSource.provenance.dataQuality} size="sm" />
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-slate-400">Validation Status</span>
                  <span className="font-mono font-bold text-indigo-300">{selectedSource.provenance.validationStatus}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-slate-400">Reliability Score</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedSource.reliability}%</span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-slate-400">Registry Status</span>
                  <button
                    onClick={() => toggleSource(selectedSource.sourceId, !selectedSource.enabled)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedSource.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {selectedSource.enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedSource.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>Last Updated: {new Date(selectedSource.lastUpdated).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Register Source Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Register Urban Data Source</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kanpur Jal Sansthan Sensor Feed"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department *</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kanpur Nagar Nigam">Kanpur Nagar Nigam</option>
                    <option value="Kanpur Jal Sansthan">Kanpur Jal Sansthan</option>
                    <option value="Kanpur Traffic Police">Kanpur Traffic Police</option>
                    <option value="Health Services">Health Services</option>
                    <option value="Public Works Department">Public Works Department</option>
                    <option value="GIS Infrastructure">GIS Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data Category *</label>
                  <select
                    value={newDataCategory}
                    onChange={(e) => setNewDataCategory(e.target.value as DataCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DRAINAGE">DRAINAGE</option>
                    <option value="WATER">WATER</option>
                    <option value="TRAFFIC">TRAFFIC</option>
                    <option value="HEALTH">HEALTH</option>
                    <option value="PUBLIC_WORKS">PUBLIC_WORKS</option>
                    <option value="WEATHER">WEATHER</option>
                    <option value="CRITICAL_INFRASTRUCTURE">CRITICAL_INFRASTRUCTURE</option>
                    <option value="INCIDENT">INCIDENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data Mode *</label>
                  <select
                    value={newDataMode}
                    onChange={(e) => setNewDataMode(e.target.value as DataMode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PROTOTYPE">PROTOTYPE</option>
                    <option value="SIMULATED">SIMULATED</option>
                    <option value="HISTORICAL">HISTORICAL</option>
                    <option value="STATIC">STATIC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Update Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g., Daily, Hourly, Event-driven"
                    value={newUpdateFreq}
                    onChange={(e) => setNewUpdateFreq(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Civil Engineering Domain</label>
                <input
                  type="text"
                  placeholder="e.g., Dewatering Pumps & Stormwater Main"
                  value={newCivilDomain}
                  onChange={(e) => setNewCivilDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the operational dataset scope..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  All registered sources will be classified under prototype/simulated data rules in accordance with SCOS Phase 8.1 guidelines.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Register Data Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
