/**
 * SCOS Phase 5B.6 — Knowledge Graph Statistics & Admin Governance
 * Visual metrics, connection density analytics, data quality audit,
 * and JSON graph import/export mechanics for research evaluation.
 */

import React, { useState } from 'react';
import {
  Database,
  Share2,
  Layers,
  BarChart2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/FormControls';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';

export const GraphStatsView: React.FC = () => {
  const { stats, importGraphData } = useKnowledgeGraph();
  const [jsonInput, setJsonInput] = useState<string>('');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  if (!stats) {
    return <Card className="p-8 text-center text-xs text-slate-500">Loading graph statistics...</Card>;
  }

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      const res = importGraphData(parsed);
      setImportMessage(`Successfully imported ${res.importedEntities} entities and ${res.importedRelationships} relationships.`);
      setJsonInput('');
    } catch (err: any) {
      setImportMessage(`Import Error: ${err.message}`);
    }
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      entities: [
        {
          id: 'ASSET-DRAIN-99',
          type: 'DRAINAGE_ASSET',
          name: 'Nala Point 99 Kidwai Nagar',
          description: 'Secondary drainage asset',
          source: 'SIMULATED',
          attributes: { capacity: '10 cumec' },
        },
      ],
      relationships: [
        {
          id: 'R-NEW-01',
          source_id: 'ASSET-DRAIN-99',
          source_type: 'DRAINAGE_ASSET',
          relationship_type: 'LOCATED_IN',
          target_id: 'WARD-12',
          target_type: 'WARD',
          source: 'SIMULATED',
        },
      ],
    },
    null,
    2
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Graph Entities</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalEntities}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Relationships</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalRelationships}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Data Provenance</p>
            <p className="text-sm font-bold text-slate-900">
              {stats.dataSourcesBreakdown.SIMULATED || 0} Simulated / {stats.dataSourcesBreakdown.PUBLIC_DATA || 0} Public
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-200">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Graph Density</p>
            <p className="text-sm font-bold text-slate-900">
              {(stats.totalRelationships / Math.max(stats.totalEntities, 1)).toFixed(2)} edges / node
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Connected Nodes (Degree Centrality) */}
        <Card className="p-5 border-slate-200 space-y-4 bg-white">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            Top Connected Hub Nodes (Degree Centrality)
          </h4>

          <div className="space-y-2.5">
            {stats.mostConnectedEntities.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <span className="text-[10px] font-mono text-slate-500">ID: {item.id} ({item.type})</span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {item.connectionCount} edges
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Entity Breakdown by Type */}
        <Card className="p-5 border-slate-200 space-y-4 bg-white">
          <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600" />
            Entity Category Breakdown
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            {Object.entries(stats.entitiesByType).map(([type, count]) => (
              <div key={type} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-mono font-bold text-slate-600 uppercase text-[10px]">{type}</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* JSON Import Mechanism */}
      <Card className="p-5 border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              Import Structured Knowledge Graph Payload (JSON)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste custom JSON payload to dynamically seed or extend SCOS Knowledge Graph entities and relationships.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setJsonInput(sampleJsonTemplate)}
            className="text-xs text-indigo-700 border-indigo-300"
          >
            Load Demo Template JSON
          </Button>
        </div>

        <form onSubmit={handleImport} className="space-y-3 font-sans">
          <Textarea
            rows={6}
            placeholder="Paste JSON payload here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="font-mono text-xs"
          />

          <div className="flex items-center justify-between">
            {importMessage && (
              <span className={`text-xs font-mono font-bold ${importMessage.startsWith('Error') ? 'text-rose-600' : 'text-emerald-700'}`}>
                {importMessage}
              </span>
            )}
            <Button type="submit" variant="primary" icon={<Upload className="w-4 h-4" />}>
              Import Payload
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
