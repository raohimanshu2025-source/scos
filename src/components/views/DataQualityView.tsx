import React, { useState } from 'react';
import { useDataValidation } from '../../context/DataValidationContext';
import { ProvenanceBadge } from '../ui/ProvenanceBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  Eye,
  Database,
  ArrowRight,
  Sliders,
  Layers,
  FileCode,
  Check,
  X,
  Play,
  Activity,
  Cpu,
} from 'lucide-react';
import { RawIngestionRecord, NormalizedSCOSRecord } from '../../types/dataValidation';

export const DataQualityView: React.FC = () => {
  const {
    normalizedRecords,
    rejectedRecords,
    metrics,
    loading,
    error,
    filters,
    selectedRecordForInspection,
    setFilters,
    refreshAll,
    processRawRecords,
    simulatePipeline,
    inspectRecord,
    clearInspection,
  } = useDataValidation();

  const [activeTab, setActiveTab] = useState<'normalized' | 'rejected' | 'simulator'>('normalized');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processNotification, setProcessNotification] = useState<string | null>(null);

  // Custom Raw Record Ingestion State
  const [customSourceId, setCustomSourceId] = useState<string>('DS-KNN-DRAINAGE-01');
  const [customJsonPayload, setCustomJsonPayload] = useState<string>(
    JSON.stringify(
      {
        entityId: 'PUMP-STN-KANPUR-TEST-01',
        entityType: 'pumping_station',
        water_level_cm: 210,
        flow_rate_lps: 380,
        pump_status: 'ON',
        ward: 'Ward 14 - Parade Market',
        zone: 'Zone 1 Central Kanpur',
        latitude: 26.4631,
        longitude: 80.3472,
      },
      null,
      2
    )
  );

  const handleRunSimulation = async () => {
    setIsProcessing(true);
    setProcessNotification(null);
    try {
      await simulatePipeline();
      setProcessNotification('Pipeline simulation executed successfully! Refreshed records & quality metrics.');
    } catch (err: any) {
      setProcessNotification(`Simulation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestCustomPayload = async () => {
    setIsProcessing(true);
    setProcessNotification(null);
    try {
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = JSON.parse(customJsonPayload);
      } catch (jsonErr: any) {
        setProcessNotification(`JSON Parsing Error: ${jsonErr.message}`);
        setIsProcessing(false);
        return;
      }

      const rawRecord: RawIngestionRecord = {
        recordId: `CUSTOM-INGEST-${Date.now()}`,
        sourceId: customSourceId,
        timestamp: new Date().toISOString(),
        payload: parsedPayload,
      };

      const result = await processRawRecords([rawRecord]);

      if (result.acceptedRecords.length > 0) {
        setProcessNotification(
          `Record ACCEPTED into SCOS Normalized Store (ID: ${result.acceptedRecords[0].recordId})`
        );
      } else if (result.rejectedRecords.length > 0) {
        setProcessNotification(
          `Record REJECTED by Validation Engine: ${result.rejectedRecords[0].rejectionReason}`
        );
      }
    } catch (err: any) {
      setProcessNotification(`Ingestion failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter normalized records by search term
  const filteredNormalized = normalizedRecords.filter((rec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.recordId.toLowerCase().includes(term) ||
      rec.sourceId.toLowerCase().includes(term) ||
      rec.entityId.toLowerCase().includes(term) ||
      rec.entityType.toLowerCase().includes(term) ||
      rec.dataCategory.toLowerCase().includes(term) ||
      rec.location.ward.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">
                AI-SCOS Phase 8.2
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">
                Data Validation, Normalization & Quality Engine
              </span>
              <ProvenanceBadge
                sourceName="SCOS Data Validation Engine"
                sourceId="DS-SCOS-VAL-82"
                department="SCOS Data Processing Layer"
                dataMode="PROTOTYPE"
                dataQuality="HIGH"
                civilEngineeringDomain="Heterogeneous Data Normalization"
                compact
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
              SCOS Data Quality & Validation Engine
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Controlled processing pipeline between raw municipal datasets and SCOS Operational Intelligence. Performs schema validation, field normalization, consistency checks, completeness scoring, and provenance preservation.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRunSimulation}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Run Pipeline Simulation
            </button>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all"
              title="Refresh Data Quality Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Prototype Notice Disclaimer */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-amber-400/90 font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            SCOS provides a prototype validation and normalization framework for heterogeneous urban data sources. Prototype data-quality assessment (field completeness & record validity, not physical sensor measurement accuracy).
          </span>
        </div>
      </div>

      {processNotification && (
        <div className="bg-slate-900/90 border border-cyan-500/40 text-cyan-200 p-4 rounded-xl text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            {processNotification}
          </span>
          <button onClick={() => setProcessNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Metrics Overview Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider font-mono">
              Total Processed Records
            </div>
            <div className="mt-2 text-3xl font-black text-white flex items-baseline gap-2">
              {metrics.totalRecords}
              <span className="text-xs font-normal text-slate-400">records</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{metrics.validRecords} Valid</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">{metrics.rejectedRecords} Rejected</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider font-mono">
              Average Field Completeness
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-400 flex items-baseline gap-1">
              {metrics.averageCompleteness}%
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Field presence score based on required schema definitions
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider font-mono">
              Quality Score Distribution
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                HIGH: {metrics.qualityDistribution.HIGH || 0}
              </span>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                MED: {metrics.qualityDistribution.MEDIUM || 0}
              </span>
              <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded">
                LOW: {metrics.qualityDistribution.LOW || 0}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Degraded: {metrics.qualityDistribution.DEGRADED || 0} records
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider font-mono">
              Freshness Distribution
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                FRESH: {metrics.freshnessDistribution.FRESH || 0}
              </span>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                AGING: {metrics.freshnessDistribution.AGING || 0}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                STALE: {metrics.freshnessDistribution.STALE || 0}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Evaluated against source SLA frequencies
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('normalized')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'normalized'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Normalized SCOS Store ({normalizedRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'rejected'
                ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejected Buffer ({rejectedRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Ingestion & Validation Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: NORMALIZED SCOS STORE */}
      {activeTab === 'normalized' && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search record ID, entity, ward..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="WATER">Water</option>
                <option value="DRAINAGE">Drainage</option>
                <option value="TRAFFIC">Traffic</option>
                <option value="HEALTH">Health</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="WEATHER">Weather</option>
                <option value="PUBLIC_WORKS">Public Works</option>
                <option value="CRITICAL_INFRASTRUCTURE">GIS / Infra</option>
              </select>

              {/* Quality Filter */}
              <select
                value={filters.quality}
                onChange={(e) => setFilters((prev) => ({ ...prev, quality: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Quality Levels</option>
                <option value="HIGH">High Quality</option>
                <option value="MEDIUM">Medium Quality</option>
                <option value="LOW">Low Quality</option>
                <option value="DEGRADED">Degraded</option>
              </select>

              {/* Freshness Filter */}
              <select
                value={filters.freshness}
                onChange={(e) => setFilters((prev) => ({ ...prev, freshness: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Freshness</option>
                <option value="FRESH">Fresh</option>
                <option value="AGING">Aging</option>
                <option value="STALE">Stale</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 text-xs font-mono uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-4">Record & Entity</th>
                    <th className="py-3.5 px-4">Source ID & Domain</th>
                    <th className="py-3.5 px-4">Location & Ward</th>
                    <th className="py-3.5 px-4">Quality & Score</th>
                    <th className="py-3.5 px-4">Validation Status</th>
                    <th className="py-3.5 px-4">Freshness</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {filteredNormalized.map((rec) => (
                    <tr key={rec.recordId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-cyan-400 font-bold">{rec.recordId}</div>
                        <div className="text-xs text-slate-200 font-medium">{rec.entityId}</div>
                        <div className="text-[11px] text-slate-500">{rec.entityType}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-300 font-mono">{rec.sourceId}</div>
                        <div className="text-xs text-slate-400 font-medium">{rec.dataCategory}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-200">{rec.location.ward}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {rec.location.latitude?.toFixed(4)}°, {rec.location.longitude?.toFixed(4)}°
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                              rec.quality.qualityLevel === 'HIGH'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : rec.quality.qualityLevel === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {rec.quality.qualityLevel} ({rec.quality.qualityScore}/100)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Completeness: {rec.quality.completenessPercent}%
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            rec.validation.validationStatus === 'FULLY_VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : rec.validation.validationStatus === 'SCHEMA_VALIDATED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {rec.validation.validationStatus === 'FULLY_VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.validation.validationStatus === 'SCHEMA_VALIDATED' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {rec.validation.validationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            rec.freshness === 'FRESH'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : rec.freshness === 'AGING'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {rec.freshness}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => inspectRecord(rec.recordId)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Transformation
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredNormalized.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                        No normalized records match current filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REJECTED RECORDS BUFFER */}
      {activeTab === 'rejected' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Rejected Data Records Buffer
              </h2>
              <p className="text-xs text-slate-400">
                Invalid records rejected during pipeline validation. Rejections are preserved for inspection rather than silently accepted.
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-mono text-xs rounded-full font-bold">
              {rejectedRecords.length} Rejections Buffered
            </span>
          </div>

          <div className="space-y-3">
            {rejectedRecords.map((rej) => (
              <div
                key={rej.recordId}
                className="bg-slate-950 border border-rose-500/30 p-4 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-rose-400 font-bold">{rej.recordId}</span>
                    <span className="text-xs text-slate-400 font-mono">Source: {rej.sourceId}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(rej.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-xs text-rose-200 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-lg font-mono">
                  <strong>Rejection Reason:</strong> {rej.rejectionReason}
                </div>

                {rej.validationErrors.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">Validation Error List:</div>
                    <ul className="list-disc list-inside text-xs text-rose-300 font-mono space-y-0.5">
                      {rej.validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <details className="text-xs text-slate-400">
                  <summary className="cursor-pointer hover:text-slate-200 font-mono text-[11px]">
                    View Raw Rejected Payload JSON
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {JSON.stringify(rej.originalPayload, null, 2)}
                  </pre>
                </details>
              </div>
            ))}

            {rejectedRecords.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                No records currently in rejection buffer.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INGESTION & VALIDATION SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-purple-400" />
              SCOS Interactive Data Ingestion & Validation Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Inject a custom raw payload to test schema validation, field mapping, completeness scoring, and rejection handling in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                Select Source ID:
              </label>
              <select
                value={customSourceId}
                onChange={(e) => setCustomSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50 font-mono"
              >
                <option value="DS-KNN-DRAINAGE-01">DS-KNN-DRAINAGE-01 (Kanpur Nagar Nigam Drainage)</option>
                <option value="DS-KJS-WATER-02">DS-KJS-WATER-02 (Kanpur Jal Sansthan Water)</option>
                <option value="DS-KTP-TRAFFIC-03">DS-KTP-TRAFFIC-03 (Kanpur Traffic Police)</option>
                <option value="DS-DHS-HEALTH-04">DS-DHS-HEALTH-04 (District Health Services)</option>
                <option value="DS-KESCO-POWER-05">DS-KESCO-POWER-05 (KESCO Electricity Grid)</option>
                <option value="DS-GIS-INFRA-05">DS-GIS-INFRA-05 (GIS Spatial Infrastructure)</option>
                <option value="DS-FAKE-UNREGISTERED-99">DS-FAKE-UNREGISTERED-99 (Trigger Rejection Test)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                Raw Record Payload (JSON):
              </label>
              <textarea
                rows={10}
                value={customJsonPayload}
                onChange={(e) => setCustomJsonPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleIngestCustomPayload}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Ingest & Run Pipeline
            </button>
          </div>
        </div>
      )}

      {/* RECORD INSPECTION COMPARISON MODAL */}
      {selectedRecordForInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Data Transformation & Provenance Inspection
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Record ID: {selectedRecordForInspection.record.recordId}
                </h2>
              </div>
              <button
                onClick={clearInspection}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality & Validation Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-mono">Validation Status:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {selectedRecordForInspection.record.validation.validationStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Quality Score & Level:</span>
                <span className="text-cyan-400 font-bold font-mono text-sm">
                  {selectedRecordForInspection.record.quality.qualityLevel} (
                  {selectedRecordForInspection.record.quality.qualityScore}/100)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">Field Completeness:</span>
                <span className="text-emerald-300 font-bold font-mono text-sm">
                  {selectedRecordForInspection.record.quality.completenessPercent}%
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Original Source Payload */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Original Source Representation
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto max-h-96">
                  {JSON.stringify(selectedRecordForInspection.originalRepresentation, null, 2)}
                </pre>
              </div>

              {/* Right Column: Normalized SCOS Representation */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 font-bold uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Normalized SCOS Record Representation
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-96">
                  {JSON.stringify(selectedRecordForInspection.normalizedRepresentation, null, 2)}
                </pre>
              </div>
            </div>

            {/* Provenance Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400 font-mono font-bold uppercase">Origin & Provenance Traceability:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono">
                <div>Source: {selectedRecordForInspection.record.provenance.sourceName}</div>
                <div>Dept: {selectedRecordForInspection.record.provenance.department}</div>
                <div>Mode: {selectedRecordForInspection.record.provenance.dataMode}</div>
                <div>Domain: {selectedRecordForInspection.record.civilEngineeringDomain || 'N/A'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={clearInspection}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
