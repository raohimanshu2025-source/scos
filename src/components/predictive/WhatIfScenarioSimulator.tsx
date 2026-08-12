import React, { useState } from 'react';
import { WhatIfScenarioInput, WhatIfScenarioResult, RiskZone } from '../../types/prediction';
import { Sliders, Play, Brain, CheckCircle, AlertTriangle, CloudRain, Car, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export interface WhatIfScenarioSimulatorProps {
  zones: RiskZone[];
  onRunSimulation: (input: WhatIfScenarioInput) => Promise<WhatIfScenarioResult | null>;
}

export const WhatIfScenarioSimulator: React.FC<WhatIfScenarioSimulatorProps> = ({
  zones,
  onRunSimulation,
}) => {
  const [targetZoneId, setTargetZoneId] = useState<string>(zones[0]?.zone_id || 'ZONE-PARADE-CROSSING');
  const [rainfall, setRainfall] = useState<number>(75);
  const [duration, setDuration] = useState<number>(2);
  const [blockage, setBlockage] = useState<'NONE' | 'PARTIAL' | 'TOTAL'>('PARTIAL');
  const [clogging, setClogging] = useState<number>(50);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfScenarioResult | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    const selectedZone = zones.find((z) => z.zone_id === targetZoneId);
    const input: WhatIfScenarioInput = {
      scenario_title: `What-If Analysis: ${rainfall}mm/hr Rain on ${selectedZone?.zone_name || targetZoneId}`,
      rainfall_intensity_mm_hr: rainfall,
      duration_hours: duration,
      road_blockage_severity: blockage,
      drainage_clogging_percent: clogging,
      target_zone_id: targetZoneId,
    };

    const simResult = await onRunSimulation(input);
    setResult(simResult);
    setIsSimulating(false);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-indigo-500/30 p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              What-If Scenario Simulation Tool
            </h3>
            <span className="text-[10px] text-amber-400/90 font-mono font-bold block">
              Scenario Simulation — What-If Analysis (Predictive Modeling)
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
          AI & Rule Engine Active
        </span>
      </div>

      {/* Input Form Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Target Zone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block font-mono">Target Urban Zone</label>
          <select
            value={targetZoneId}
            onChange={(e) => setTargetZoneId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            {zones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.zone_name} ({z.ward_zone})
              </option>
            ))}
          </select>
        </div>

        {/* Rainfall Intensity Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Precipitation Rate
            </label>
            <span className="text-xs font-black font-mono text-cyan-400">{rainfall} mm/hr</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>10mm Light</span>
            <span>60mm Heavy</span>
            <span>150mm Cloudburst</span>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 font-mono">Duration (Hours)</label>
            <span className="text-xs font-black font-mono text-indigo-400">{duration} hrs</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="6"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Drainage Clogging Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 font-mono">Drainage Obstruction</label>
            <span className="text-xs font-black font-mono text-amber-400">{clogging}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={clogging}
            onChange={(e) => setClogging(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Road Blockage */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block font-mono flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-rose-400" />
            Corridor Blockage Level
          </label>
          <select
            value={blockage}
            onChange={(e) => setBlockage(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 font-mono"
          >
            <option value="NONE">NONE — Clear Flow</option>
            <option value="PARTIAL">PARTIAL — 1 Lane Restricted</option>
            <option value="TOTAL">TOTAL — Corridor Blocked</option>
          </select>
        </div>

        {/* Action Run Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSimulate}
            isLoading={isSimulating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold py-2.5 text-xs rounded-xl"
          >
            <Play className="w-4 h-4 mr-1.5 text-emerald-300 fill-emerald-300" />
            Execute What-If Simulation
          </Button>
        </div>
      </div>

      {/* Simulation Result Drawer Card */}
      {result && (
        <div className="bg-slate-800/80 rounded-xl border border-indigo-500/40 p-4 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              Simulation Result: {result.title}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                result.predicted_risk_level === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : result.predicted_risk_level === 'HIGH'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              Simulated Risk: {result.predicted_risk_level} ({result.predicted_risk_score}/100)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {result.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Projected Service Impacts */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono block">
                Projected Service Impacts
              </span>
              <ul className="space-y-1">
                {result.possible_service_impacts.map((imp, i) => (
                  <li key={i} className="text-[11px] text-slate-300 font-mono flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Preparations */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono block">
                Recommended Preventive Preparation
              </span>
              <ul className="space-y-1">
                {result.recommended_preparation.map((prep, i) => (
                  <li key={i} className="text-[11px] text-slate-300 font-mono flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{prep}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
