// =========================================================================
// SCOS PHASE 9C — SCENARIO CALIBRATION & ENGINEERING ASSUMPTIONS SERVICE
// Lightweight Prototype Calibration Layer for Urban Infrastructure Modeling
// =========================================================================

import {
  CalibrationParameter,
  CalibrationAssumption,
  ScenarioValidationInput,
} from '../types/scenarioValidation';

class ScenarioCalibrationService {
  /**
   * Prototype Calibration Parameters Registry
   * Note: These are model parameters, not real municipal engineering measurements.
   */
  private calibrationParameters: Map<string, CalibrationParameter> = new Map();

  /**
   * Engineering Assumptions Registry
   */
  private assumptions: Map<string, CalibrationAssumption> = new Map();

  constructor() {
    this.initializeParameters();
    this.initializeAssumptions();
  }

  /**
   * Seed standard prototype calibration parameters
   */
  private initializeParameters(): void {
    const params: CalibrationParameter[] = [
      {
        parameterName: 'rainfallIntensity',
        displayName: 'Rainfall Precipitation Intensity',
        value: 65,
        unit: 'mm/hr',
        source: 'Prototype scenario environmental assumption',
        rationale: 'Representative of heavy monsoon cloudburst event in Gangetic plain urban catchments.',
        confidence: 'LOW',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'pumpCapacityReduction',
        displayName: 'Dewatering Pump Capacity Reduction',
        value: 100,
        unit: '%',
        source: 'Prototype mechanical failure profile',
        rationale: 'Simulates complete electrical power or mechanical impeller trip at high-capacity dewatering station.',
        confidence: 'PROTOTYPE_DEFAULT',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'drainageCapacityReduction',
        displayName: 'Stormwater Nala Silt & Surcharge Reduction',
        value: 80,
        unit: '%',
        source: 'Prototype hydraulic siltation assumption',
        rationale: 'Simulates debris choke and tidal river backflow during peak runoff periods.',
        confidence: 'LOW',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'trafficVolumeMultiplier',
        displayName: 'Monsoon Arterial Traffic Volume Multiplier',
        value: 1.8,
        unit: 'dimensionless',
        source: 'Prototype scenario assumption',
        rationale: 'Used to test increased traffic friction and detour bottlenecks during heavy inundation.',
        confidence: 'LOW',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'restorationTime',
        displayName: 'Estimated Mean Time to Restoration (MTTR)',
        value: 4.0,
        unit: 'hours',
        source: 'Prototype municipal response assumption',
        rationale: 'Standard window for Jal Sansthan mobile pump tractor deployment and generator start.',
        confidence: 'MEDIUM',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'infrastructureAvailability',
        displayName: 'Baseline Network Operational Availability',
        value: 95.0,
        unit: '%',
        source: 'Prototype system baseline',
        rationale: 'Assumed operational readiness of primary civil grid before shock perturbation.',
        confidence: 'MEDIUM',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'distanceToCriticalFacility',
        displayName: 'Hospital Proximity Vulnerability Buffer',
        value: 850,
        unit: 'meters',
        source: 'SCOS spatial proximity engine',
        rationale: 'Haversine distance from Parade road junction epicenter to Ursula Horsman Memorial Hospital.',
        confidence: 'HIGH',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
      {
        parameterName: 'dependencyStrength',
        displayName: 'Topological Inter-Asset Coupling Coefficient',
        value: 0.85,
        unit: 'dimensionless (0.0 - 1.0)',
        source: 'Urban Digital Twin Graph heuristic',
        rationale: 'Probability weight of hydraulic failure propagating downstream into primary road pavement.',
        confidence: 'LOW',
        classification: 'SIMULATED / PROTOTYPE',
        disclaimer: 'Prototype modelling parameter — not a real-time municipal measurement.',
      },
    ];

    params.forEach((p) => this.calibrationParameters.set(p.parameterName, p));
  }

  /**
   * Seed standard engineering assumptions
   */
  private initializeAssumptions(): void {
    const assumptionsList: CalibrationAssumption[] = [
      {
        assumptionId: 'ASSUMP-HYDRO-01',
        category: 'HYDROLOGIC',
        description: 'Gravity drainage surcharge occurs when pump discharge fails under >=45mm/hr precipitation.',
        basis: 'Empirical civil stormwater design standard for flat urban alluvial plains.',
        engineeringJustification: 'Without active pump lift, head loss causes backflow into connected arterial roads.',
        verificationMethod: 'Scenario Monotonicity & Spatial Cascade Validation',
        isSimulatedPrototype: true,
      },
      {
        assumptionId: 'ASSUMP-TOPO-01',
        category: 'TOPOLOGICAL',
        description: 'Cascade propagation follows directed dependency edges and spatial distance <= 3,000m.',
        basis: 'SCOS Digital Twin Graph Topology and Haversine spatial indexing.',
        engineeringJustification: 'Secondary impacts are constrained to topologically linked or adjacent infrastructure.',
        verificationMethod: 'Topological Traceability Audit',
        isSimulatedPrototype: true,
      },
      {
        assumptionId: 'ASSUMP-FACILITY-01',
        category: 'MOBILIZATION',
        description: 'Critical facility threat is evaluated as access route impedance, NOT structural collapse.',
        basis: 'Civil protection doctrine prioritizing emergency transit corridors to major hospitals.',
        engineeringJustification: 'Inundation at Parade Crossing impairs emergency medical vehicle transit to Ursula Hospital.',
        verificationMethod: 'Facility Sensitivity & Routing Impairment Criterion',
        isSimulatedPrototype: true,
      },
      {
        assumptionId: 'ASSUMP-DEPT-01',
        category: 'MOBILIZATION',
        description: 'Multi-department roles follow statutory jurisdictional assignments (KJS lead on dewatering, Traffic Police on diversions).',
        basis: 'Kanpur Municipal Corporation (KNN) Standard Operating Protocols.',
        engineeringJustification: 'Ensures realistic inter-agency response mapping without inventing artificial authorities.',
        verificationMethod: 'Department Mapping Consistency Check',
        isSimulatedPrototype: true,
      },
      {
        assumptionId: 'ASSUMP-TRAFFIC-01',
        category: 'TRAFFIC',
        description: 'Pavement submergence >=30cm causes complete vehicular diversion and +45 min arterial delay.',
        basis: 'Urban road capacity reduction under severe waterlogging.',
        engineeringJustification: 'Low-clearance vehicles and city buses cannot traverse deep standing water safely.',
        verificationMethod: 'Traffic Volume & Delay Multiplier Verification',
        isSimulatedPrototype: true,
      },
    ];

    assumptionsList.forEach((a) => this.assumptions.set(a.assumptionId, a));
  }

  /**
   * Get all calibration parameters
   */
  public getAllParameters(): CalibrationParameter[] {
    return Array.from(this.calibrationParameters.values());
  }

  /**
   * Get parameter by name
   */
  public getParameter(parameterName: string): CalibrationParameter | undefined {
    return this.calibrationParameters.get(parameterName);
  }

  /**
   * Update calibration parameter with prototype audit tracking
   */
  public updateParameter(parameterName: string, newValue: number | string, rationale?: string): CalibrationParameter | null {
    const param = this.calibrationParameters.get(parameterName);
    if (!param) return null;

    param.value = newValue;
    if (rationale) {
      param.rationale = rationale;
    }
    this.calibrationParameters.set(parameterName, param);
    return param;
  }

  /**
   * Get all engineering assumptions
   */
  public getAllAssumptions(): CalibrationAssumption[] {
    return Array.from(this.assumptions.values());
  }

  /**
   * Construct calibrated scenario input from defaults and overrides
   */
  public buildCalibratedInput(overrides: Partial<ScenarioValidationInput> = {}): ScenarioValidationInput {
    const rainfall = typeof overrides.rainfallIntensityMmPerHour === 'number'
      ? overrides.rainfallIntensityMmPerHour
      : (this.calibrationParameters.get('rainfallIntensity')?.value as number) || 65;

    const pumpReduction = typeof overrides.pumpCapacityReductionPercent === 'number'
      ? overrides.pumpCapacityReductionPercent
      : (this.calibrationParameters.get('pumpCapacityReduction')?.value as number) || 100;

    const drainReduction = typeof overrides.drainageCapacityReductionPercent === 'number'
      ? overrides.drainageCapacityReductionPercent
      : (this.calibrationParameters.get('drainageCapacityReduction')?.value as number) || 80;

    const trafficMult = typeof overrides.trafficVolumeMultiplier === 'number'
      ? overrides.trafficVolumeMultiplier
      : (this.calibrationParameters.get('trafficVolumeMultiplier')?.value as number) || 1.8;

    const restoration = typeof overrides.restorationTimeHours === 'number'
      ? overrides.restorationTimeHours
      : (this.calibrationParameters.get('restorationTime')?.value as number) || 4.0;

    const avail = typeof overrides.infrastructureAvailabilityPercent === 'number'
      ? overrides.infrastructureAvailabilityPercent
      : (this.calibrationParameters.get('infrastructureAvailability')?.value as number) || 95.0;

    const dist = typeof overrides.distanceToCriticalFacilityMeters === 'number'
      ? overrides.distanceToCriticalFacilityMeters
      : (this.calibrationParameters.get('distanceToCriticalFacility')?.value as number) || 850;

    const depStrength = typeof overrides.dependencyStrengthMultiplier === 'number'
      ? overrides.dependencyStrengthMultiplier
      : (this.calibrationParameters.get('dependencyStrength')?.value as number) || 0.85;

    return {
      rainfallIntensityMmPerHour: rainfall,
      failureSeverity: overrides.failureSeverity || 'CRITICAL',
      pumpCapacityReductionPercent: pumpReduction,
      drainageCapacityReductionPercent: drainReduction,
      restorationTimeHours: restoration,
      trafficVolumeMultiplier: trafficMult,
      infrastructureAvailabilityPercent: avail,
      distanceToCriticalFacilityMeters: dist,
      dependencyStrengthMultiplier: depStrength,
      ambientTemperatureC: overrides.ambientTemperatureC ?? 29,
    };
  }
}

export const scenarioCalibrationService = new ScenarioCalibrationService();
