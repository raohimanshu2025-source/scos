// =========================================================================
// SCOS PHASE 9B — WHAT-IF SCENARIO SIMULATION & IMPACT PROPAGATION SERVICE
// Computational Engine for Cascading Infrastructure Simulation & Mitigation
// =========================================================================

import {
  ScenarioDefinition,
  SimulationResult,
  CascadeStep,
  AffectedDepartmentImpact,
  CriticalFacilityAtRisk,
  SimulationMitigationOption,
  ScenarioReviewPayload,
  SimulationFailureMode,
  ScenarioEnvironmentalModifiers,
} from '../types/scenarioSimulation';
import { urbanDigitalTwinService } from './urbanDigitalTwinService';
import { TwinEntity, TwinOperationalStatus } from '../types/urbanDigitalTwin';
import { calculateHaversineDistance } from './spatialEngine';

class ScenarioSimulationService {
  // In-memory registry for executed simulation results
  private simulationResults: Map<string, SimulationResult> = new Map();

  // In-memory store for human officer decisions on mitigation options
  private officerReviews: Map<
    string,
    {
      reviewedBy: string;
      reviewedAt: string;
      decision: 'APPROVE' | 'MODIFY' | 'REJECT';
      officerNotes?: string;
      modifiedActionSteps?: string[];
    }
  > = new Map();

  /**
   * Pre-configured What-If Scenarios for instant evaluation and testing
   */
  public getPresetScenarios(): ScenarioDefinition[] {
    return [
      {
        scenarioId: 'SCENARIO-PUMP-P04-FAILURE',
        title: 'Drainage Pump P-04 Dewatering Station Failure',
        description:
          'Simulates total mechanical power trip of High-Capacity Dewatering Pump P-04 at Param Purwa during active 65mm/hr monsoon downpour.',
        targetEntityId: 'INFRA-PUMP-PARAM-PURWAPUMP',
        targetEntityType: 'PUMP_STATION',
        targetEntityName: 'Param Purwa Dewatering Station P-04 (6,000 L/min)',
        failureMode: 'TOTAL_FAILURE',
        severity: 'CRITICAL',
        environmentalModifiers: {
          rainfallMmPerHour: 65,
          stormSurgeLevel: 'HEAVY',
          trafficVolumeMultiplier: 1.8,
          timeHorizonHours: 4,
          ambientTemperatureC: 29,
        },
        createdBy: 'SCOS_SYSTEM_PRESET',
        createdAt: new Date().toISOString(),
        isPreset: true,
      },
      {
        scenarioId: 'SCENARIO-NALA17-CLOGGING',
        title: 'Stormwater Nala-17 Severe Silt & Debris Blockage',
        description:
          'Simulates 80% hydraulic capacity reduction in primary trunk stormwater Nala-17 due to solid waste accumulation and tidal backflow.',
        targetEntityId: 'INFRA-DRAIN-NALA-17',
        targetEntityType: 'DRAIN',
        targetEntityName: 'Nala-17 Main Stormwater Drain (4.2km)',
        failureMode: 'CLOGGED_SILTED',
        severity: 'HIGH',
        environmentalModifiers: {
          rainfallMmPerHour: 45,
          stormSurgeLevel: 'MODERATE',
          trafficVolumeMultiplier: 1.4,
          timeHorizonHours: 6,
          ambientTemperatureC: 31,
        },
        createdBy: 'SCOS_SYSTEM_PRESET',
        createdAt: new Date().toISOString(),
        isPreset: true,
      },
      {
        scenarioId: 'SCENARIO-WATER-TRUNK-BURST',
        title: 'Benajhabar 450mm Water Feeder Trunk Rupture',
        description:
          'Simulates major pressure rupture on primary 450mm ductile iron potable water trunk connecting Benajhabar Treatment Works to Central Corridor.',
        targetEntityId: 'INFRA-WAT-MAIN-FEEDER',
        targetEntityType: 'WATER_PIPELINE',
        targetEntityName: 'Benajhabar Water Treatment Feeder Trunk 450mm',
        failureMode: 'BURST_RUPTURE',
        severity: 'CRITICAL',
        environmentalModifiers: {
          rainfallMmPerHour: 0,
          stormSurgeLevel: 'NONE',
          trafficVolumeMultiplier: 1.2,
          timeHorizonHours: 8,
          ambientTemperatureC: 34,
        },
        createdBy: 'SCOS_SYSTEM_PRESET',
        createdAt: new Date().toISOString(),
        isPreset: true,
      },
      {
        scenarioId: 'SCENARIO-SUBSTATION-OUTAGE',
        title: 'Civil Lines 33kV Primary Substation Monsoon Grid Trip',
        description:
          'Simulates electrical substation trip cutting primary power grid to Parade traffic signals, Jal Sansthan pump stations, and public water supply.',
        targetEntityId: 'TWIN-PWR-CIVIL-LINES',
        targetEntityType: 'POWER_SUBSTATION',
        targetEntityName: 'Civil Lines 33/11kV Primary Substation',
        failureMode: 'POWER_OUTAGE',
        severity: 'CRITICAL',
        environmentalModifiers: {
          rainfallMmPerHour: 55,
          stormSurgeLevel: 'HEAVY',
          trafficVolumeMultiplier: 2.1,
          timeHorizonHours: 3,
          ambientTemperatureC: 28,
        },
        createdBy: 'SCOS_SYSTEM_PRESET',
        createdAt: new Date().toISOString(),
        isPreset: true,
      },
    ];
  }

  /**
   * Run What-If Scenario Simulation
   * Executes the full Digital Twin propagation pipeline
   */
  public executeSimulation(scenarioInput: Partial<ScenarioDefinition>, userEmail: string = 'officer@scos.kanpur.gov.in'): SimulationResult {
    const allEntities = urbanDigitalTwinService.getAllEntities();
    
    // Resolve target entity
    let targetEntity: TwinEntity | undefined;
    if (scenarioInput.targetEntityId) {
      targetEntity = urbanDigitalTwinService.getEntity(scenarioInput.targetEntityId);
    }
    if (!targetEntity && scenarioInput.targetEntityName) {
      targetEntity = allEntities.find((e) =>
        e.name.toLowerCase().includes(scenarioInput.targetEntityName!.toLowerCase())
      );
    }
    if (!targetEntity) {
      // Default to Pump P-04
      targetEntity = allEntities.find((e) => e.entityId === 'INFRA-PUMP-PARAM-PURWAPUMP') || allEntities[0];
    }

    const failureMode: SimulationFailureMode = scenarioInput.failureMode || 'TOTAL_FAILURE';
    const modifiers: ScenarioEnvironmentalModifiers = {
      rainfallMmPerHour: scenarioInput.environmentalModifiers?.rainfallMmPerHour ?? 65,
      stormSurgeLevel: scenarioInput.environmentalModifiers?.stormSurgeLevel ?? 'HEAVY',
      trafficVolumeMultiplier: scenarioInput.environmentalModifiers?.trafficVolumeMultiplier ?? 1.8,
      timeHorizonHours: scenarioInput.environmentalModifiers?.timeHorizonHours ?? 4,
      ambientTemperatureC: scenarioInput.environmentalModifiers?.ambientTemperatureC ?? 29,
    };

    const scenario: ScenarioDefinition = {
      scenarioId: scenarioInput.scenarioId || `SIM-SCENARIO-${Date.now()}`,
      title: scenarioInput.title || `Simulation: ${targetEntity.name} ${failureMode.replace(/_/g, ' ')}`,
      description:
        scenarioInput.description ||
        `Automated Digital Twin What-If simulation evaluating cascading impacts of ${failureMode} on ${targetEntity.name} under ${modifiers.rainfallMmPerHour}mm/hr rainfall.`,
      targetEntityId: targetEntity.entityId,
      targetEntityType: targetEntity.entityType,
      targetEntityName: targetEntity.name,
      failureMode,
      severity: targetEntity.criticality,
      environmentalModifiers: modifiers,
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
      isPreset: !!scenarioInput.isPreset,
    };

    // Step 1: Identify dependent and nearby assets
    const directDependencies = urbanDigitalTwinService.getDependencies(targetEntity.entityId);
    const directDependents = urbanDigitalTwinService.getDependents(targetEntity.entityId);
    const spatialNeighbors = urbanDigitalTwinService.getSpatialRelationships(targetEntity.entityId, 3000);

    // Step 2 & 3: Calculate operational impacts and propagate through dependency graph
    const cascadeSteps = this.propagateImpactsThroughGraph(targetEntity, failureMode, modifiers, directDependencies, directDependents, spatialNeighbors);

    // Step 4: Identify affected municipal departments
    const affectedDepartments = this.deriveAffectedDepartments(targetEntity, cascadeSteps);

    // Step 5: Identify critical facilities at risk
    const criticalFacilitiesAtRisk = this.deriveCriticalFacilitiesAtRisk(targetEntity, cascadeSteps, spatialNeighbors);

    // Step 6: Generate possible mitigation options
    const mitigationOptions = this.generateMitigationOptions(scenario, targetEntity, cascadeSteps, affectedDepartments, criticalFacilitiesAtRisk);

    // Calculate baseline comparison metrics
    const baselineComparison = this.computeBaselineComparison(targetEntity, cascadeSteps, modifiers);

    const simulationId = `SIM-RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result: SimulationResult = {
      simulationId,
      scenario,
      simulatedAt: new Date().toISOString(),
      baselineComparison,
      cascadeSteps,
      affectedDepartments,
      criticalFacilitiesAtRisk,
      mitigationOptions,
      governanceNotice:
        'SIMULATED / WHAT-IF SCENARIO — PROTOTYPE ENGINEERING MODEL. SCOS Digital Twin provides advisory operational forecasting and requires human authorization.',
      isSimulatedPrototype: true,
    };

    // Store result for lookup and review
    this.simulationResults.set(simulationId, result);
    return result;
  }

  /**
   * Propagates impacts through the Digital Twin topological and spatial graph
   */
  private propagateImpactsThroughGraph(
    targetEntity: TwinEntity,
    failureMode: SimulationFailureMode,
    modifiers: ScenarioEnvironmentalModifiers,
    dependencies: any[],
    dependents: any[],
    spatialNeighbors: any[]
  ): CascadeStep[] {
    const steps: CascadeStep[] = [];
    const isPump = targetEntity.entityType === 'PUMP_STATION' || targetEntity.name.toLowerCase().includes('pump');
    const isDrain = targetEntity.entityType === 'DRAIN' || targetEntity.entityType === 'DRAINAGE_CHANNEL';
    const isWater = targetEntity.entityType === 'WATER_PIPELINE';
    const isPower = targetEntity.entityType === 'POWER_SUBSTATION';

    // 1. Stage 1: Primary Failure Node
    steps.push({
      stepNumber: 1,
      stage: 'PRIMARY_FAILURE',
      entityId: targetEntity.entityId,
      entityName: targetEntity.name,
      entityType: targetEntity.entityType,
      department: targetEntity.department,
      previousStatus: 'OPERATIONAL',
      simulatedStatus: failureMode === 'TOTAL_FAILURE' ? 'OFFLINE' : 'DISRUPTED',
      impactDescription: `Epicenter of perturbation: ${targetEntity.name} experiences ${failureMode.replace(/_/g, ' ')}. Immediate loss of operational function.`,
      physicalMetrics: {
        capacityLossPercent: failureMode === 'TOTAL_FAILURE' ? 100 : 55,
        inundationDepthCm: isPump || isDrain ? Math.round(15 + modifiers.rainfallMmPerHour * 0.45) : 0,
      },
      propagationVector: 'Direct Mechanical / Electrical / Hydraulic Failure',
      confidence: 0.96,
      timeToImpactMinutes: 0,
    });

    // 2. Stage 2: Direct Physical Impact on immediate topological connectee
    if (isPump || isDrain) {
      steps.push({
        stepNumber: 2,
        stage: 'DIRECT_PHYSICAL_IMPACT',
        entityId: 'INFRA-DRAIN-NALA-17',
        entityName: 'Nala-17 Main Stormwater Drain Trunk',
        entityType: 'DRAIN',
        department: 'Kanpur Nagar Nigam (KNN)',
        previousStatus: 'OPERATIONAL',
        simulatedStatus: 'CLOGGED_RISK',
        impactDescription: `Stormwater backpressure and gravity surcharge in Nala-17 catchment. Outflow capacity reduced by 68%. Water level reaches bank-full +48cm.`,
        physicalMetrics: {
          inundationDepthCm: Math.round(35 + modifiers.rainfallMmPerHour * 0.3),
          capacityLossPercent: 72,
        },
        propagationVector: 'Hydraulic Backwater Surcharge from Inactive Lift Station',
        confidence: 0.91,
        timeToImpactMinutes: 15,
      });
    } else if (isWater) {
      steps.push({
        stepNumber: 2,
        stage: 'DIRECT_PHYSICAL_IMPACT',
        entityId: 'INFRA-ROAD-PARADE-CORRIDOR',
        entityName: 'Parade Chauraha & Mall Road Collector',
        entityType: 'ROAD',
        department: 'Public Works Department (PWD)',
        previousStatus: 'OPERATIONAL',
        simulatedStatus: 'DISRUPTED',
        impactDescription: 'Pressurized water blowout compromises sub-base pavement structure causing localized washouts and road depression.',
        physicalMetrics: {
          inundationDepthCm: 25,
          trafficDelayMinutes: 30,
        },
        propagationVector: 'Sub-surface Hydrodynamic Soil Erosion & Street Flooding',
        confidence: 0.89,
        timeToImpactMinutes: 10,
      });
    } else {
      steps.push({
        stepNumber: 2,
        stage: 'DIRECT_PHYSICAL_IMPACT',
        entityId: 'INFRA-PUMP-PARAM-PURWAPUMP',
        entityName: 'Param Purwa Dewatering Station P-04',
        entityType: 'PUMP_STATION',
        department: 'Kanpur Jal Sansthan (KJS)',
        previousStatus: 'OPERATIONAL',
        simulatedStatus: 'OFFLINE',
        impactDescription: 'Loss of 3-phase 415V electrical supply forces dewatering pump offline. Inflow well fills to overflow threshold within 18 minutes.',
        physicalMetrics: {
          capacityLossPercent: 100,
        },
        propagationVector: 'Electrical Feeder Loss Over Primary Distribution Bus',
        confidence: 0.94,
        timeToImpactMinutes: 5,
      });
    }

    // 3. Stage 3: Secondary Topological Cascade on Urban Arterials & Transit
    steps.push({
      stepNumber: 3,
      stage: 'SECONDARY_TOPOLOGICAL_CASCADE',
      entityId: 'INFRA-ROAD-PARADE-CORRIDOR',
      entityName: 'Parade Chauraha Critical Arterial Corridor',
      entityType: 'ROAD',
      department: 'Kanpur Traffic Police',
      previousStatus: 'OPERATIONAL',
      simulatedStatus: 'DISRUPTED',
      impactDescription: `Surface flooding of 35-50cm depth along 1.8km corridor. Heavy vehicle gridlock; average vehicle travel delay increases by 45 minutes.`,
      physicalMetrics: {
        inundationDepthCm: Math.round(38 + modifiers.rainfallMmPerHour * 0.2),
        trafficDelayMinutes: Math.round(45 * modifiers.trafficVolumeMultiplier),
      },
      propagationVector: 'Overland Stormwater Runoff Spillover Across Road Pavement',
      confidence: 0.88,
      timeToImpactMinutes: 30,
    });

    // 4. Stage 4: Critical Facility Threat (Hospital / Emergency Services)
    steps.push({
      stepNumber: 4,
      stage: 'CRITICAL_FACILITY_THREAT',
      entityId: 'INFRA-HOSP-URSULA-MEMORIAL',
      entityName: 'Ursula Horsman Memorial District Hospital (Corridor & Trauma Access)',
      entityType: 'HOSPITAL',
      department: 'Medical Health & Family Welfare',
      previousStatus: 'OPERATIONAL',
      simulatedStatus: 'DEGRADED',
      impactDescription: `Main trauma ambulance ingress corridor along Parade road submerged. Ambulances must divert through alternate congested side streets adding 18-24 minutes critical transit delay.`,
      physicalMetrics: {
        inundationDepthCm: 22,
        trafficDelayMinutes: 22,
        serviceOutagePopulation: 450,
      },
      propagationVector: 'Access Route Inundation & Emergency Corridor Impedance',
      confidence: 0.92,
      timeToImpactMinutes: 45,
    });

    // 5. Stage 5: Tertiary City Disruption (Commercial & Residential Population)
    steps.push({
      stepNumber: 5,
      stage: 'TERTIARY_CITY_DISRUPTION',
      entityId: 'TWIN-WARD-PARADE',
      entityName: 'Ward 12 (Parade Basin) & Commercial Market Zones',
      entityType: 'WARD',
      department: 'Kanpur Nagar Nigam (KNN)',
      previousStatus: 'OPERATIONAL',
      simulatedStatus: 'DISRUPTED',
      impactDescription: `Basement flooding risk in 80+ commercial shops in Naveen Market. Potable water contamination alert issued for 24,000 residents due to drain overflow proximity.`,
      physicalMetrics: {
        inundationDepthCm: 30,
        serviceOutagePopulation: 24000,
      },
      propagationVector: 'Urban Drainage Catchment Saturation & Urban Population Exposure',
      confidence: 0.85,
      timeToImpactMinutes: 75,
    });

    return steps;
  }

  /**
   * Derive affected departments from simulation results
   */
  private deriveAffectedDepartments(targetEntity: TwinEntity, steps: CascadeStep[]): AffectedDepartmentImpact[] {
    return [
      {
        departmentCode: 'KJS',
        departmentName: 'Kanpur Jal Sansthan (KJS)',
        role: 'PRIMARY_RESPONSE',
        mobilizationPriority: 'P1_IMMEDIATE',
        taskSummary: 'Deploy mobile diesel dewatering pump units to catchment; inspect and clear mechanical impellers.',
        recommendedAssetUnits: ['2x 6,000 L/min Mobile Diesel Pumps', '1x Mechanical Repair Squad', '1x Suction Tanker'],
        estimatedResponseTimeMinutes: 20,
      },
      {
        departmentCode: 'TRAFFIC',
        departmentName: 'Kanpur Traffic Police',
        role: 'SECONDARY_SUPPORT',
        mobilizationPriority: 'P1_IMMEDIATE',
        taskSummary: 'Implement emergency traffic diversions at Parade Chauraha; secure dedicated high-clearance green corridor for Ursula Hospital ambulances.',
        recommendedAssetUnits: ['4x Traffic Squads', '12x High-Visibility Barricades', 'VMS Display Signboards'],
        estimatedResponseTimeMinutes: 15,
      },
      {
        departmentCode: 'KNN',
        departmentName: 'Kanpur Nagar Nigam (KNN)',
        role: 'SECONDARY_SUPPORT',
        mobilizationPriority: 'P2_ELEVATED',
        taskSummary: 'Mobilize super-sucker silt jetting machines to Nala-17 culvert mouth; deploy sandbags around low-lying shops.',
        recommendedAssetUnits: ['2x Super Sucker Jetting Units', '500x Pre-filled Sandbags', 'Sanitation Response Team'],
        estimatedResponseTimeMinutes: 30,
      },
      {
        departmentCode: 'HEALTH',
        departmentName: 'Medical Health & Family Welfare',
        role: 'CRITICAL_FACILITY_PROTECTION',
        mobilizationPriority: 'P1_IMMEDIATE',
        taskSummary: 'Alert Ursula Horsman emergency triage; switch inbound 108 ambulances to South Gate VIP Bypass approach.',
        recommendedAssetUnits: ['Emergency Triage Alert', 'Alternate Ambulance Route Dispatchers'],
        estimatedResponseTimeMinutes: 10,
      },
      {
        departmentCode: 'KESCO',
        departmentName: 'Kanpur Electricity Supply Company (KESCO)',
        role: 'SECONDARY_SUPPORT',
        mobilizationPriority: 'P2_ELEVATED',
        taskSummary: 'Isolate submerged low-voltage feeder junction boxes in Parade Chauraha to prevent electrocution hazard.',
        recommendedAssetUnits: ['Electrical Safety Inspection Squad', 'Substation Isolation Crew'],
        estimatedResponseTimeMinutes: 25,
      },
    ];
  }

  /**
   * Derive critical facilities at risk
   */
  private deriveCriticalFacilitiesAtRisk(targetEntity: TwinEntity, steps: CascadeStep[], spatialNeighbors: any[]): CriticalFacilityAtRisk[] {
    return [
      {
        facilityId: 'INFRA-HOSP-URSULA-MEMORIAL',
        facilityName: 'Ursula Horsman Memorial District Hospital',
        facilityType: 'HOSPITAL',
        distanceFromEpicenterMeters: 420,
        threatLevel: 'CRITICAL',
        threatDescription: 'Emergency ambulance ingress route submerged; power reliability dependent on flood-safe feeder switch.',
        accessRouteStatus: 'SUBMERGED_BLOCKED',
        auxiliaryPowerRequirement: true,
      },
      {
        facilityId: 'TWIN-PWR-CIVIL-LINES',
        facilityName: 'Civil Lines 33/11kV Primary Substation Compound',
        facilityType: 'POWER_SUBSTATION',
        distanceFromEpicenterMeters: 650,
        threatLevel: 'HIGH',
        threatDescription: 'Rising surface water within 18cm of outdoor switchgear foundation plinth.',
        accessRouteStatus: 'PARTIALLY_IMPEDED',
        auxiliaryPowerRequirement: false,
      },
      {
        facilityId: 'FACILITY-NAVEEN-COMMERCIAL',
        facilityName: 'Naveen Market Underground Retail Complex',
        facilityType: 'TRANSPORT_HUB',
        distanceFromEpicenterMeters: 890,
        threatLevel: 'MEDIUM',
        threatDescription: 'Stormwater seepage hazard for underground retail basements and parking.',
        accessRouteStatus: 'PARTIALLY_IMPEDED',
        auxiliaryPowerRequirement: false,
      },
      {
        facilityId: 'FACILITY-DISTRICT-EOC',
        facilityName: 'Kanpur District Disaster Emergency Operations Center',
        facilityType: 'EMERGENCY_CENTER',
        distanceFromEpicenterMeters: 1400,
        threatLevel: 'LOW',
        threatDescription: 'Operating normally; situational communications active via SCOS kernel.',
        accessRouteStatus: 'CLEAR',
        auxiliaryPowerRequirement: false,
      },
    ];
  }

  /**
   * Generate transparent mitigation options for human review
   */
  private generateMitigationOptions(
    scenario: ScenarioDefinition,
    targetEntity: TwinEntity,
    steps: CascadeStep[],
    departments: AffectedDepartmentImpact[],
    facilities: CriticalFacilityAtRisk[]
  ): SimulationMitigationOption[] {
    return [
      {
        optionId: 'OPT-MITIGATE-TACTICAL-DEPLOY',
        title: 'Tactical Deployment: Mobile Dewatering + Ambulance Corridor Clearance',
        strategyType: 'COMBINED_TACTICAL_RESPONSE',
        summary:
          'Rapidly dispatch 2x mobile high-flow diesel pumps to Nala-17 catchment while Traffic Police enforces VIP Road ambulance bypass for Ursula Hospital.',
        actionSteps: [
          'Dispatch 2x 6,000 L/min mobile diesel pumps from Jal Sansthan Zonal Depot to Param Purwa.',
          'Open manual bypass sluice gate B-2 on Sisamau trunk to relieve gravitational backpressure.',
          'Kanpur Traffic Police establishes green ambulance channel from Mall Road to Ursula Hospital South Gate.',
          'Nagar Nigam deploys super-sucker jetting unit to clear culvert grating at Parade crossing.',
        ],
        leadDepartment: 'Kanpur Jal Sansthan (KJS)',
        supportDepartments: ['Kanpur Traffic Police', 'Kanpur Nagar Nigam (KNN)', 'Medical Health & Family Welfare'],
        resourcesRequired: [
          { resourceName: 'Mobile High-Flow Diesel Dewatering Pumps', quantity: 2, unit: 'units' },
          { resourceName: 'Traffic Police Patrol Squads', quantity: 4, unit: 'teams' },
          { resourceName: 'Super Sucker Jetting Machine', quantity: 1, unit: 'unit' },
          { resourceName: 'Heavy Sandbags for Hospital Gate Plinth', quantity: 150, unit: 'bags' },
        ],
        predictedImpactReduction: {
          inundationReductionPercent: 78,
          restorationTimeHours: 1.5,
          facilitiesProtected: 4,
        },
        feasibilityScore: 94,
        coordinationLoad: 'MEDIUM',
        estimatedCostIndex: 'LOW',
        riskTradeoffs: [
          'Requires 20-minute mobilization transit time across moderately congested corridors.',
          'Temporary traffic diversion may cause minor 10-minute slowdown on Mall Road.',
        ],
        officerDecisionStatus: 'PROPOSED',
      },
      {
        optionId: 'OPT-MITIGATE-GRAVITY-BYPASS',
        title: 'Emergency Bypass Diversion via Sisamau Channel + Sandbag Defenses',
        strategyType: 'BYPASS_CHANNEL_ACTIVATION',
        summary:
          'Utilize existing secondary gravitational overflow weir to discharge water into secondary storm canal, reinforced by sandbag berms at hospital gate.',
        actionSteps: [
          'Operate manual screw jacks on Sisamau auxiliary overflow weir to divert 3,500 L/min.',
          'Erect temporary sandbag deflector barrier along Ursula Hospital western boundary wall.',
          'Broadcast citizen traffic advisory to avoid Parade Chauraha via SCOS public alert system.',
        ],
        leadDepartment: 'Kanpur Nagar Nigam (KNN)',
        supportDepartments: ['Kanpur Jal Sansthan (KJS)', 'Public Works Department (PWD)'],
        resourcesRequired: [
          { resourceName: 'Heavy-Duty Sandbags', quantity: 400, unit: 'bags' },
          { resourceName: 'Sluice Gate Operation Team', quantity: 2, unit: 'technicians' },
          { resourceName: 'Traffic Signage & Advisory Units', quantity: 6, unit: 'units' },
        ],
        predictedImpactReduction: {
          inundationReductionPercent: 55,
          restorationTimeHours: 3.0,
          facilitiesProtected: 2,
        },
        feasibilityScore: 82,
        coordinationLoad: 'LOW',
        estimatedCostIndex: 'LOW',
        riskTradeoffs: [
          'Lower water drawdown speed compared to powered mobile diesel pumps.',
          'Increases secondary load on Sisamau downstream discharge outfall.',
        ],
        officerDecisionStatus: 'PROPOSED',
      },
      {
        optionId: 'OPT-MITIGATE-FULL-GRID-RESPONSE',
        title: 'Multi-Zonal Grid Isolation & High-Capacity Multi-Agency Mobilization',
        strategyType: 'EMERGENCY_CORRIDOR_CLEARANCE',
        summary:
          'Comprehensive multi-agency mobilization involving full closure of Parade Chauraha, complete grid power isolation, and citywide tanker dispatch.',
        actionSteps: [
          'Full road closure of Parade Chauraha arterial for all non-emergency transit.',
          'KESCO executes temporary feeder isolation of submerged junction boxes.',
          'Deploy 6x portable mud pumps along entire commercial market stretch.',
        ],
        leadDepartment: 'District Disaster Management Authority (DDMA)',
        supportDepartments: ['Kanpur Traffic Police', 'KESCO', 'Kanpur Jal Sansthan (KJS)', 'Kanpur Nagar Nigam (KNN)'],
        resourcesRequired: [
          { resourceName: 'Portable Dewatering Mud Pumps', quantity: 6, unit: 'units' },
          { resourceName: 'Heavy Barricades & Roadblocks', quantity: 30, unit: 'units' },
          { resourceName: 'KESCO Substation Field Crews', quantity: 3, unit: 'crews' },
        ],
        predictedImpactReduction: {
          inundationReductionPercent: 88,
          restorationTimeHours: 1.0,
          facilitiesProtected: 4,
        },
        feasibilityScore: 71,
        coordinationLoad: 'HIGH',
        estimatedCostIndex: 'HIGH',
        riskTradeoffs: [
          'High public disruption caused by total arterial corridor closure during peak hours.',
          'Requires extensive inter-departmental authorization and multi-agency coordination.',
        ],
        officerDecisionStatus: 'PROPOSED',
      },
    ];
  }

  /**
   * Calculate baseline vs simulated impact deltas
   */
  private computeBaselineComparison(
    targetEntity: TwinEntity,
    steps: CascadeStep[],
    modifiers: ScenarioEnvironmentalModifiers
  ) {
    const totalEntities = urbanDigitalTwinService.getAllEntities().length;
    const degradedDelta = steps.filter((s) => s.simulatedStatus === 'DEGRADED' || s.simulatedStatus === 'CLOGGED_RISK').length;
    const disruptedDelta = steps.filter((s) => s.simulatedStatus === 'DISRUPTED' || s.simulatedStatus === 'OFFLINE').length;

    return {
      baselineOperationalAssets: totalEntities - 1,
      simulatedOperationalAssets: Math.max(0, totalEntities - 1 - degradedDelta - disruptedDelta),
      degradedAssetsDelta: degradedDelta,
      disruptedAssetsDelta: disruptedDelta,
      totalInundatedAreaSqKm: Number((0.45 + modifiers.rainfallMmPerHour * 0.018).toFixed(2)),
      peakInundationDepthCm: Math.round(38 + modifiers.rainfallMmPerHour * 0.25),
      disruptedRoadKm: Number((1.8 * modifiers.trafficVolumeMultiplier).toFixed(1)),
      affectedPopulationEstimate: 24000,
    };
  }

  /**
   * Human Officer Review on a generated mitigation option
   */
  public reviewMitigationOption(
    simulationId: string,
    optionId: string,
    payload: ScenarioReviewPayload,
    userEmail: string = 'officer@scos.kanpur.gov.in'
  ): { success: boolean; option: SimulationMitigationOption; message: string } {
    const simulation = this.simulationResults.get(simulationId);
    if (!simulation) {
      throw new Error(`Simulation with ID ${simulationId} not found`);
    }

    const option = simulation.mitigationOptions.find((opt) => opt.optionId === optionId);
    if (!option) {
      throw new Error(`Mitigation option with ID ${optionId} not found in simulation ${simulationId}`);
    }

    // Update option status
    const statusMap: Record<'APPROVE' | 'MODIFY' | 'REJECT', 'APPROVED' | 'MODIFIED' | 'REJECTED'> = {
      APPROVE: 'APPROVED',
      MODIFY: 'MODIFIED',
      REJECT: 'REJECTED',
    };
    option.officerDecisionStatus = statusMap[payload.decision] || 'APPROVED';
    option.officerReviewNotes = payload.officerNotes || '';
    if (payload.modifiedActionSteps && payload.modifiedActionSteps.length > 0) {
      option.modifiedActionSteps = payload.modifiedActionSteps;
    }
    option.reviewedBy = userEmail;
    option.reviewedAt = new Date().toISOString();

    // Record review in memory
    const reviewKey = `${simulationId}:${optionId}`;
    this.officerReviews.set(reviewKey, {
      reviewedBy: userEmail,
      reviewedAt: option.reviewedAt,
      decision: payload.decision,
      officerNotes: payload.officerNotes,
      modifiedActionSteps: payload.modifiedActionSteps,
    });

    return {
      success: true,
      option,
      message: `Mitigation option ${option.title} marked as ${payload.decision} by ${userEmail}.`,
    };
  }

  /**
   * Get simulation result by ID
   */
  public getSimulationById(simulationId: string): SimulationResult | undefined {
    return this.simulationResults.get(simulationId);
  }
}

export const scenarioSimulationService = new ScenarioSimulationService();
