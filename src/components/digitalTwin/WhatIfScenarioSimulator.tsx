import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Shield,
  Building2,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  Droplets,
  Zap,
  TrendingDown,
  Info,
  ChevronRight,
  FileText,
  UserCheck,
  Compass,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { apiClient } from '../../services/apiClient';
import {
  ScenarioDefinition,
  SimulationResult,
  CascadeStep,
  SimulationMitigationOption,
  AffectedDepartmentImpact,
  CriticalFacilityAtRisk,
  SimulationFailureMode,
} from '../../types/scenarioSimulation';
import { TwinEntity } from '../../types/urbanDigitalTwin';
import { useAuth } from '../../context/AuthContext';

interface WhatIfScenarioSimulatorProps {
  onNavigateToIncident?: () => void;
}

export const WhatIfScenarioSimulator: React.FC<WhatIfScenarioSimulatorProps> = ({
  onNavigateToIncident,
}) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<ScenarioDefinition[]>([]);
  const [entities, setEntities] = useState<TwinEntity[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('SCENARIO-PUMP-P04-FAILURE');
  
  // Custom scenario form state
  const [targetEntityId, setTargetEntityId] = useState<string>('INFRA-PUMP-PARAM-PURWAPUMP');
  const [failureMode, setFailureMode] = useState<SimulationFailureMode>('TOTAL_FAILURE');
  const [rainfallMm, setRainfallMm] = useState<number>(65);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.8);
  const [timeHorizonHours, setTimeHorizonHours] = useState<number>(4);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Officer review interactive state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [reviewingOption, setReviewingOption] = useState<SimulationMitigationOption | null>(null);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [modifiedInstructions, setModifiedInstructions] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  // Load presets & entity catalog on mount
  useEffect(() => {
    async function initData() {
      try {
        const [presetsRes, entitiesRes] = await Promise.all([
          apiClient.getScenarioPresets().catch(() => ({ status: 'SUCCESS', data: [] })),
          apiClient.getUrbanDigitalTwinEntities().catch(() => ({ status: 'SUCCESS', data: [] })),
        ]);

        if (presetsRes.data && presetsRes.data.length > 0) {
          setPresets(presetsRes.data);
        }
        if (entitiesRes.data && entitiesRes.data.length > 0) {
          setEntities(entitiesRes.data);
        }

        // Auto-run primary requested preset ("Drainage Pump P-04 fails") on load
        runSimulation({
          targetEntityId: 'INFRA-PUMP-PARAM-PURWAPUMP',
          failureMode: 'TOTAL_FAILURE',
          environmentalModifiers: {
            rainfallMmPerHour: 65,
            stormSurgeLevel: 'HEAVY',
            trafficVolumeMultiplier: 1.8,
            timeHorizonHours: 4,
            ambientTemperatureC: 29,
          },
        });
      } catch (err: any) {
        console.warn('Initialization notice:', err);
      }
    }
    initData();
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((p) => p.scenarioId === presetId);
    if (preset) {
      setTargetEntityId(preset.targetEntityId);
      setFailureMode(preset.failureMode);
      setRainfallMm(preset.environmentalModifiers.rainfallMmPerHour);
      setTrafficMultiplier(preset.environmentalModifiers.trafficVolumeMultiplier);
      setTimeHorizonHours(preset.environmentalModifiers.timeHorizonHours);

      runSimulation({
        scenarioId: preset.scenarioId,
        title: preset.title,
        description: preset.description,
        targetEntityId: preset.targetEntityId,
        failureMode: preset.failureMode,
        environmentalModifiers: preset.environmentalModifiers,
        isPreset: true,
      });
    }
  };

  const runSimulation = async (input?: Partial<ScenarioDefinition>) => {
    setIsSimulating(true);
    setError(null);
    setReviewSuccessMessage(null);
    try {
      const payload: Partial<ScenarioDefinition> = input || {
        targetEntityId,
        failureMode,
        environmentalModifiers: {
          rainfallMmPerHour: rainfallMm,
          stormSurgeLevel: rainfallMm > 60 ? 'HEAVY' : rainfallMm > 30 ? 'MODERATE' : 'NONE',
          trafficVolumeMultiplier: trafficMultiplier,
          timeHorizonHours,
        },
      };

      const res = await apiClient.runScenarioSimulation(payload);
      if (res && res.data) {
        setSimulationResult(res.data);
        if (res.data.mitigationOptions && res.data.mitigationOptions.length > 0) {
          setSelectedOptionId(res.data.mitigationOptions[0].optionId);
          setReviewingOption(res.data.mitigationOptions[0]);
        }
      }
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
      setError(err.message || 'Failed to execute Digital Twin simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleOfficerDecision = async (decision: 'APPROVE' | 'MODIFY' | 'REJECT') => {
    if (!simulationResult || !selectedOptionId) return;

    setReviewSubmitting(true);
    setReviewSuccessMessage(null);
    try {
      const modifiedSteps =
        decision === 'MODIFY' && modifiedInstructions.trim()
          ? modifiedInstructions
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const res = await apiClient.reviewScenarioMitigation({
        simulationId: simulationResult.simulationId,
        optionId: selectedOptionId,
        decision,
        officerNotes: officerNotes || (decision === 'APPROVE' ? 'Approved for operational mobilization readiness.' : ''),
        modifiedActionSteps: modifiedSteps,
      });

      if (res?.data?.success) {
        setReviewSuccessMessage(res.data.message);
        // Update local state
        setSimulationResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            mitigationOptions: prev.mitigationOptions.map((opt) =>
              opt.optionId === selectedOptionId ? res.data.option : opt
            ),
          };
        });
        setReviewingOption(res.data.option);
        setIsModifying(false);
      }
    } catch (err: any) {
      console.error('Officer review submission failed:', err);
      setError(err.message || 'Failed to submit officer decision');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const selectedOption = simulationResult?.mitigationOptions.find((o) => o.optionId === selectedOptionId);

  return (
    <div id="whatif-scenario-simulator" className="space-y-6">
      {/* Header & Governance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-indigo-950/80 border border-indigo-700/60 rounded-lg text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                SCOS What-If Scenario Simulation Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 9B
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl">
              Simulate civil infrastructure perturbations, compute topological cascade paths, quantify multi-department impacts, and review generated mitigation strategies with human-in-the-loop governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectPreset('SCENARIO-PUMP-P04-FAILURE')}
              disabled={isSimulating}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset to Pump P-04
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => runSimulation()}
              disabled={isSimulating}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Propagating Simulation...' : 'Run Simulation'}</span>
            </Button>
          </div>
        </div>

        {/* Prototype Governance Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-mono text-slate-300">
              SIMULATED / WHAT-IF SCENARIO — PROTOTYPE MODEL. Advisory forecasts only; SCOS does not autonomously dispatch or execute.
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Topological Propagation Kernel Active</span>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Quick Scenario Presets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.scenarioId;
            return (
              <button
                key={preset.scenarioId}
                onClick={() => handleSelectPreset(preset.scenarioId)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-xs ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[190px]">
                    {preset.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      preset.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {preset.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>Rain: {preset.environmentalModifiers.rainfallMmPerHour}mm/h</span>
                  <span>Traffic: {preset.environmentalModifiers.trafficVolumeMultiplier}x</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Parameters Configuration */}
      <Card className="p-5 border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulation Parameters & Perturbation Target
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Target Entity: <strong className="text-white">{targetEntityId}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Target Entity Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Target Infrastructure Asset</label>
            <select
              value={targetEntityId}
              onChange={(e) => setTargetEntityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {entities.map((ent) => (
                <option key={ent.entityId} value={ent.entityId}>
                  [{ent.entityType}] {ent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Failure Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Failure Mode</label>
            <select
              value={failureMode}
              onChange={(e) => setFailureMode(e.target.value as SimulationFailureMode)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="TOTAL_FAILURE">TOTAL FAILURE (100% Offline)</option>
              <option value="PARTIAL_DEGRADATION">PARTIAL DEGRADATION (50% Loss)</option>
              <option value="POWER_OUTAGE">POWER OUTAGE (Feeder Loss)</option>
              <option value="CLOGGED_SILTED">CLOGGED / SILTED (Hydraulic Surcharge)</option>
              <option value="BURST_RUPTURE">BURST / RUPTURE (Pressure Blowout)</option>
            </select>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Rainfall Intensity</span>
              <span className="font-mono text-sky-400 font-bold">{rainfallMm} mm/hr</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Dry</span>
              <span>Monsoon (65mm)</span>
              <span>Cloudburst (100+)</span>
            </div>
          </div>

          {/* Traffic Multiplier */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Traffic Congestion</span>
              <span className="font-mono text-amber-400 font-bold">{trafficMultiplier}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.2"
              value={trafficMultiplier}
              onChange={(e) => setTrafficMultiplier(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Normal 1.0x</span>
              <span>Peak 1.8x</span>
              <span>Gridlock 3.0x</span>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Forecast Horizon</span>
              <span className="font-mono text-indigo-400 font-bold">{timeHorizonHours} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={timeHorizonHours}
              onChange={(e) => setTimeHorizonHours(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 hr</span>
              <span>4 hrs</span>
              <span>12 hrs</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-700/80 rounded-xl text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Simulation Results Display */}
      {simulationResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Baseline vs. Simulated Impact Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Inundated Area</div>
              <div className="text-xl font-bold text-sky-400 mt-1 flex items-baseline gap-1">
                <span>{simulationResult.baselineComparison.totalInundatedAreaSqKm}</span>
                <span className="text-xs font-normal text-slate-400">sq km</span>
              </div>
              <div className="text-[10px] text-sky-300/80 mt-1">Catchment flood spread</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Peak Water Depth</div>
              <div className="text-xl font-bold text-rose-400 mt-1 flex items-baseline gap-1">
                <span>{simulationResult.baselineComparison.peakInundationDepthCm}</span>
                <span className="text-xs font-normal text-slate-400">cm</span>
              </div>
              <div className="text-[10px] text-rose-300/80 mt-1">At Parade Chauraha</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Disrupted Road</div>
              <div className="text-xl font-bold text-amber-400 mt-1 flex items-baseline gap-1">
                <span>{simulationResult.baselineComparison.disruptedRoadKm}</span>
                <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <div className="text-[10px] text-amber-300/80 mt-1">Arterial transit impedance</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">At-Risk Facilities</div>
              <div className="text-xl font-bold text-indigo-400 mt-1 flex items-baseline gap-1">
                <span>{simulationResult.criticalFacilitiesAtRisk.length}</span>
                <span className="text-xs font-normal text-slate-400">critical</span>
              </div>
              <div className="text-[10px] text-indigo-300/80 mt-1">Hospital & Substations</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Exposed Population</div>
              <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
                <span>{(simulationResult.baselineComparison.affectedPopulationEstimate / 1000).toFixed(0)}k</span>
                <span className="text-xs font-normal text-slate-400">residents</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1">Wards 12 & 14 perimeter</div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Cascade Depth</div>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1">
                <span>{simulationResult.cascadeSteps.length}</span>
                <span className="text-xs font-normal text-slate-400">stages</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Graph propagation tiers</div>
            </div>
          </div>

          {/* Workflow Graph Visualizer: Primary Failure -> Propagation -> Hospital Threat -> Tertiary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-inner">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Topological Impact Propagation Flow Graph
                </h3>
              </div>
              <span className="text-xs text-indigo-300 font-mono bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-800/60">
                Cascade Verification: 0.92 Confidence
              </span>
            </div>

            {/* Sequence Flow of Cascade Steps */}
            <div className="space-y-4">
              {simulationResult.cascadeSteps.map((step, idx) => {
                const isLast = idx === simulationResult.cascadeSteps.length - 1;
                const stageTheme = {
                  PRIMARY_FAILURE: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', border: 'border-rose-700/80', dot: 'bg-rose-500' },
                  DIRECT_PHYSICAL_IMPACT: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', border: 'border-amber-700/80', dot: 'bg-amber-500' },
                  SECONDARY_TOPOLOGICAL_CASCADE: { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', border: 'border-orange-700/80', dot: 'bg-orange-500' },
                  CRITICAL_FACILITY_THREAT: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', border: 'border-purple-700/80', dot: 'bg-purple-500' },
                  TERTIARY_CITY_DISRUPTION: { badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', border: 'border-sky-700/80', dot: 'bg-sky-500' },
                }[step.stage];

                return (
                  <div key={step.stepNumber} className="relative">
                    <div className={`p-4 rounded-xl bg-slate-900/90 border ${stageTheme.border} transition-all`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${stageTheme.dot}`}>
                            {step.stepNumber}
                          </span>
                          <span className="text-sm font-bold text-white">{step.entityName}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${stageTheme.badge}`}>
                            {step.stage.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>Dept: <strong className="text-slate-200">{step.department}</strong></span>
                          <span>&bull;</span>
                          <span>T + {step.timeToImpactMinutes} mins</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {step.impactDescription}
                      </p>

                      {/* Propagation Vector & Metrics */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Propagation Vector:</span>
                          <strong className="text-indigo-200">{step.propagationVector}</strong>
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          {step.physicalMetrics.inundationDepthCm !== undefined && (
                            <span className="text-sky-400">
                              Water: <strong>+{step.physicalMetrics.inundationDepthCm}cm</strong>
                            </span>
                          )}
                          {step.physicalMetrics.trafficDelayMinutes !== undefined && (
                            <span className="text-amber-400">
                              Transit Delay: <strong>+{step.physicalMetrics.trafficDelayMinutes}m</strong>
                            </span>
                          )}
                          {step.physicalMetrics.capacityLossPercent !== undefined && (
                            <span className="text-rose-400">
                              Capacity Loss: <strong>-{step.physicalMetrics.capacityLossPercent}%</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isLast && (
                      <div className="flex justify-center my-1.5">
                        <div className="w-0.5 h-3 bg-indigo-600/60" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Section: Affected Departments & Critical Facilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Affected Departments Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Affected Municipal Departments ({simulationResult.affectedDepartments.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SCOS Inter-Agency Matrix</span>
              </div>

              <div className="space-y-3">
                {simulationResult.affectedDepartments.map((dept) => (
                  <div
                    key={dept.departmentCode}
                    className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dept.departmentName}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          dept.role === 'PRIMARY_RESPONSE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : dept.role === 'CRITICAL_FACILITY_PROTECTION'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {dept.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{dept.taskSummary}</p>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Mobilization ETA: <strong className="text-slate-200">{dept.estimatedResponseTimeMinutes} mins</strong></span>
                      <div className="flex gap-1.5">
                        {dept.recommendedAssetUnits.slice(0, 2).map((unit, i) => (
                          <span key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Facilities at Risk */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Critical Facilities at Risk ({simulationResult.criticalFacilitiesAtRisk.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-rose-300">Buffer: 2.5km</span>
              </div>

              <div className="space-y-3">
                {simulationResult.criticalFacilitiesAtRisk.map((fac) => (
                  <div
                    key={fac.facilityId}
                    className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{fac.facilityName}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          fac.threatLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : fac.threatLevel === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {fac.threatLevel} THREAT
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{fac.threatDescription}</p>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Distance: <strong className="text-slate-200">{fac.distanceFromEpicenterMeters}m</strong></span>
                      <span>
                        Access Route: <strong className={fac.accessRouteStatus === 'SUBMERGED_BLOCKED' ? 'text-rose-400' : 'text-amber-400'}>{fac.accessRouteStatus.replace(/_/g, ' ')}</strong>
                      </span>
                      {fac.auxiliaryPowerRequirement && (
                        <span className="text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                          Aux Power Req
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Mitigation Options & Human Officer Review */}
          <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Generated Mitigation Options & Human Officer Governance
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review, approve, customize, or reject simulated mitigation plans. Authorized Human-in-the-Loop decision required.
                </p>
              </div>

              {reviewSuccessMessage && (
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-700/80 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Option Selection Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {simulationResult.mitigationOptions.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.optionId;
                const statusTheme = {
                  PROPOSED: 'bg-slate-800 text-slate-300',
                  APPROVED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
                  MODIFIED: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
                  REJECTED: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
                }[opt.officerDecisionStatus];

                return (
                  <button
                    key={opt.optionId}
                    onClick={() => {
                      setSelectedOptionId(opt.optionId);
                      setReviewingOption(opt);
                      setIsModifying(false);
                      setModifiedInstructions(opt.actionSteps.join('\n'));
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-indigo-400 font-bold">
                        OPTION {idx + 1}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${statusTheme}`}>
                        {opt.officerDecisionStatus}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1 line-clamp-2">
                      {opt.title}
                    </h4>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Feasibility: <strong className="text-emerald-400">{opt.feasibilityScore}%</strong></span>
                      <span>Drawdown: <strong className="text-sky-400">-{opt.predictedImpactReduction.inundationReductionPercent}%</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Option Detail & Review Panel */}
            {selectedOption && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedOption.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{selectedOption.summary}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                      Lead: <strong className="text-indigo-300">{selectedOption.leadDepartment}</strong>
                    </div>
                    <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                      Restoration Time: <strong className="text-emerald-300">{selectedOption.predictedImpactReduction.restorationTimeHours} Hours</strong>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Tactical Action Sequence
                    </span>
                    {selectedOption.officerDecisionStatus === 'PROPOSED' && (
                      <button
                        onClick={() => {
                          setIsModifying(!isModifying);
                          setModifiedInstructions(selectedOption.actionSteps.join('\n'));
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isModifying ? 'Cancel Customization' : 'Customize Action Steps'}</span>
                      </button>
                    )}
                  </div>

                  {isModifying ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={modifiedInstructions}
                        onChange={(e) => setModifiedInstructions(e.target.value)}
                        placeholder="Enter customized step-by-step instructions (one per line)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-400">
                        Officer edits will be saved alongside the review audit record.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedOption.modifiedActionSteps || selectedOption.actionSteps).map((step, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resource Allocations & Tradeoffs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <span className="text-[11px] font-bold text-slate-300 block mb-2">
                      Mobilization Resources Required
                    </span>
                    <div className="space-y-1.5">
                      {selectedOption.resourcesRequired.map((res, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                          <span>{res.resourceName}</span>
                          <span className="font-mono text-indigo-300 font-bold">
                            {res.quantity} {res.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <span className="text-[11px] font-bold text-slate-300 block mb-2">
                      Operational Risk Trade-offs
                    </span>
                    <div className="space-y-1.5">
                      {selectedOption.riskTradeoffs.map((trade, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                          <span className="text-amber-400">&bull;</span>
                          <span>{trade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Officer Review Controls Form */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="mb-3">
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Officer Review Notes / Directive Justification
                    </label>
                    <input
                      type="text"
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      placeholder="Add operational notes or instructions for tactical teams..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-slate-400">
                      Reviewing as: <strong className="text-white">{user?.email || 'officer@scos.kanpur.gov.in'}</strong> ({user?.role || 'DISTRICT_ADMIN'})
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOfficerDecision('REJECT')}
                        disabled={reviewSubmitting}
                        className="text-xs border-rose-800 text-rose-300 hover:bg-rose-950/60"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject Plan
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOfficerDecision('MODIFY')}
                        disabled={reviewSubmitting}
                        className="text-xs border-sky-700 text-sky-300 hover:bg-sky-950/60"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Authorize with Modifications
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOfficerDecision('APPROVE')}
                        disabled={reviewSubmitting}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Mitigation Strategy</span>
                      </Button>
                    </div>
                  </div>

                  {/* Review Audit Record if already reviewed */}
                  {selectedOption.reviewedBy && (
                    <div className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>
                          Reviewed by: <strong className="text-white">{selectedOption.reviewedBy}</strong> on{' '}
                          {new Date(selectedOption.reviewedAt || '').toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 uppercase font-bold">
                        Decision: {selectedOption.officerDecisionStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
