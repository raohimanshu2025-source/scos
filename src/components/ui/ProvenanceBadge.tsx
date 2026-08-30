import React, { useState, useRef, useEffect } from 'react';
import { DataMode, DataQuality, ValidationStatus } from '../../types/dataSource';
import { Database, ShieldAlert, CheckCircle2, Clock, Info, X } from 'lucide-react';

export interface ProvenanceBadgeProps {
  sourceName: string;
  sourceId?: string;
  department?: string;
  dataMode: DataMode;
  timestamp?: string;
  dataQuality?: DataQuality;
  confidence?: number;
  validationStatus?: ValidationStatus;
  civilEngineeringDomain?: string;
  compact?: boolean;
  align?: 'left' | 'right';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  sourceName,
  sourceId,
  department = 'SCOS Integrated System',
  dataMode = 'PROTOTYPE',
  timestamp,
  dataQuality = 'HIGH',
  confidence = 90,
  validationStatus = 'SIMULATED',
  civilEngineeringDomain,
  compact = false,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getModeBadgeStyle = (mode: DataMode) => {
    switch (mode) {
      case 'SIMULATED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'PROTOTYPE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
      case 'HISTORICAL':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'STATIC':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/40';
      case 'EXTERNAL':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'REAL_TIME':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/40';
    }
  };

  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-md border font-mono transition cursor-pointer hover:opacity-90 ${getModeBadgeStyle(
          dataMode
        )} ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'}`}
        title="Click to view data source provenance details"
      >
        <Database className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span className="font-extrabold tracking-wider uppercase">{dataMode}</span>
        <span className="opacity-75 font-sans font-medium max-w-[120px] truncate">{sourceName}</span>
        <Info className={compact ? 'w-2.5 h-2.5 opacity-60' : 'w-3 h-3 opacity-60'} />
      </button>

      {/* Provenance Detail Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-xs font-sans text-slate-200 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">Data Provenance Record</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Source</span>
              <p className="font-semibold text-white">{sourceName}</p>
              {sourceId && <span className="text-[10px] font-mono text-indigo-400 block">{sourceId}</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Department</span>
                <p className="font-medium text-slate-200 truncate">{department}</p>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Data Mode</span>
                <span
                  className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${getModeBadgeStyle(
                    dataMode
                  )}`}
                >
                  {dataMode}
                </span>
              </div>
            </div>

            {civilEngineeringDomain && (
              <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Civil Infra Domain</span>
                <p className="font-medium text-emerald-300 text-[11px]">{civilEngineeringDomain}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Quality</span>
                <span className="font-semibold text-emerald-400 font-mono">{dataQuality}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Validation</span>
                <span className="font-semibold text-indigo-300 font-mono">{validationStatus}</span>
              </div>
            </div>

            <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Timestamp: {formattedTime}</span>
            </div>

            {/* Prototype Notice Disclaimer */}
            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 flex items-start gap-1.5 leading-snug">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>PROTOTYPE NOTICE:</strong> This record is part of the SCOS Demonstration & Research dataset. No actual live government API connection is claimed.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
