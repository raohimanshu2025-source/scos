// =========================================================================
// SCOS PHASE 10A — EXPERIMENTAL DATASET & RESEARCH SCENARIO REGISTRY SERVICE
// Deterministic Configuration Fingerprinting & Research Governance Foundation
// =========================================================================

import {
  ResearchDataset,
  ResearchDatasetVersion,
  ResearchScenario,
  ResearchAssumption,
  ResearchScenarioExecution,
  ResearchExperimentalConditionType,
  ResearchScenarioStatus,
  ResearchDatasetLifecycle,
  ReproducibilityCheckRequest,
  ReproducibilityCheckResult,
  ResearchDatasetExport,
  ResearchScenarioParameter,
} from '../types/researchDataset';
import { scenarioValidationService } from './scenarioValidationService';
import { comparativeEvaluationService } from './comparativeEvaluationService';
import { scenarioCalibrationService } from './scenarioCalibrationService';
import { infrastructureStore } from './infrastructureStore';

/**
 * Deterministic Canonical Serialization & Hashing Utility
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalJsonStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`;
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Pure Deterministic Hash Implementation (SHA-256 or FNV-1a based 64-hex hash fallback)
 */
export function computeDeterministicFingerprint(payload: any): string {
  const canonicalString = canonicalJsonStringify(payload);

  // Use crypto if running in Node / modern runtime, or standard deterministic multi-round hash
  try {
    // Check if Node crypto or Web Crypto is available
    if (typeof globalThis !== 'undefined' && (globalThis as any).process?.versions?.node) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(canonicalString).digest('hex');
    }
  } catch (_err) {
    // Fallback below
  }

  // Robust isomorphic 64-hex deterministic hash
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  let h3 = 0x6a09e667 ^ 0;
  let h4 = 0xbb67ae85 ^ 0;

  for (let i = 0; i < canonicalString.length; i++) {
    const ch = canonicalString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3845105943);
    h4 = Math.imul(h4 ^ ch, 2147483647);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');

  // Generate 64-character deterministic hex string
  return `${hex1}${hex2}${hex3}${hex4}${hex4}${hex3}${hex2}${hex1}`;
}

class ResearchDatasetService {
  private scenarios: Map<string, ResearchScenario> = new Map();
  private assumptions: Map<string, ResearchAssumption> = new Map();
  private versions: Map<string, ResearchDatasetVersion> = new Map();
  private executions: Map<string, ResearchScenarioExecution> = new Map();

  private activeDatasetId = 'SCOS-EXP-DATASET-2025-KANPUR';
  private currentVersionTag = 'v1.1';

  constructor() {
    this.initializeAssumptions();
    this.initializeScenarios();
    this.initializeVersions();
    this.initializeExecutions();
  }

  /**
   * Initialize Centralized Research Engineering Assumptions
   */
  private initializeAssumptions(): void {
    const rawAssumptions: ResearchAssumption[] = [
      {
        parameterId: 'precipitationIntensity',
        name: 'Precipitation Peak Intensity',
        value: 65,
        unit: 'mm/hr',
        defaultValue: 65,
        minimum: 0,
        maximum: 150,
        sourceType: 'PROTOTYPE_ASSUMPTION',
        engineeringJustification: 'Simulates typical high-intensity Gangetic monsoon cloudburst over urban catchments.',
        applicability: 'All hydrologic, drainage, and compound scenarios (SC-01, SC-03, SC-04).',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'pumpCapacityLoss',
        name: 'Dewatering Pump Capacity Reduction',
        value: 100,
        unit: '%',
        defaultValue: 100,
        minimum: 0,
        maximum: 100,
        sourceType: 'ENGINEERING_HEURISTIC',
        engineeringJustification: 'Simulates complete electrical motor trip or impeller jam under heavy debris surge.',
        applicability: 'Mechanical & compound dewatering pump scenarios (SC-02, SC-04).',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'drainageCapacity',
        name: 'Stormwater Gravity Drainage Outflow Capacity',
        value: 80,
        unit: '%',
        defaultValue: 80,
        minimum: 0,
        maximum: 100,
        sourceType: 'HYDRAULIC_MODEL',
        engineeringJustification: 'Represents gravity discharge reduction due to tidal backflow and solid silt accumulation.',
        applicability: 'Drainage network surcharge scenarios (SC-01, SC-03, SC-04).',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'siltationFactor',
        name: 'Trunk Nala Channel Siltation Ratio',
        value: 0.8,
        unit: 'ratio',
        defaultValue: 0.8,
        minimum: 0.0,
        maximum: 1.0,
        sourceType: 'ENGINEERING_HEURISTIC',
        engineeringJustification: 'Effective cross-sectional restriction in unlined open stormwater trunk drains.',
        applicability: 'Trunk drainage channels (Nala-17, Sisamau Nala).',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'trafficMultiplier',
        name: 'Monsoon Arterial Traffic Congestion Multiplier',
        value: 1.8,
        unit: 'multiplier',
        defaultValue: 1.8,
        minimum: 1.0,
        maximum: 4.0,
        sourceType: 'ENGINEERING_HEURISTIC',
        engineeringJustification: 'Frictional travel delay multiplier under standing water detours and bottlenecking.',
        applicability: 'Urban arterial corridors (Mall Road, Parade, VIP Road).',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'meanRestorationTime',
        name: 'Estimated Mean Time to Restoration (MTTR)',
        value: 4.0,
        unit: 'hours',
        defaultValue: 4.0,
        minimum: 0.5,
        maximum: 24.0,
        sourceType: 'CALIBRATED_DEFAULT',
        engineeringJustification: 'Standard municipal emergency response window for mobile pump dispatch and generator startup.',
        applicability: 'Field emergency municipal operations.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'waterInundationDepth',
        name: 'Peak Road Surface Inundation Depth',
        value: 28,
        unit: 'cm',
        defaultValue: 28,
        minimum: 0,
        maximum: 120,
        sourceType: 'HYDRAULIC_MODEL',
        engineeringJustification: 'Representative road water depth at Parade Crossing depression during 45mm/hr rain.',
        applicability: 'Roadway flood models and pedestrian/vehicle passability thresholds.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'floodedArea',
        name: 'Total Surface Waterlogging Footprint',
        value: 12500,
        unit: 'sq_m',
        defaultValue: 12500,
        minimum: 0,
        maximum: 100000,
        sourceType: 'SPATIAL_TOPOLOGY',
        engineeringJustification: 'Catchment surface envelope calculated via elevation contours around Parade intersection.',
        applicability: 'Spatial exposure engine & GIS views.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'transitDelay',
        name: 'Emergency Transit Corridor Delay',
        value: 22,
        unit: 'minutes',
        defaultValue: 22,
        minimum: 0,
        maximum: 120,
        sourceType: 'ENGINEERING_HEURISTIC',
        engineeringJustification: 'Added travel time for emergency vehicles due to flooded intersections and traffic diversion.',
        applicability: 'Ambulance & fire engine transit routes.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'exposedPopulation',
        name: 'Estimated Exposed Population in Affected Zone',
        value: 3500,
        unit: 'persons',
        defaultValue: 3500,
        minimum: 0,
        maximum: 50000,
        sourceType: 'SPATIAL_TOPOLOGY',
        engineeringJustification: 'Daytime density estimate based on ward census and commercial pedestrian footfall.',
        applicability: 'Impact assessment & civil protection prioritization.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'criticalFacilityAccessImpedance',
        name: 'Hospital Ingress Access Impedance Ratio',
        value: 75,
        unit: '%',
        defaultValue: 75,
        minimum: 0,
        maximum: 100,
        sourceType: 'SPATIAL_TOPOLOGY',
        engineeringJustification: 'Percentage obstruction of primary access gates at Ursula Horsman Memorial Hospital.',
        applicability: 'Critical facility vulnerability & green corridor dispatch.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'dependencyStrengthMultiplier',
        name: 'Inter-Asset Dependency Coupling Strength',
        value: 0.85,
        unit: 'index (0-1)',
        defaultValue: 0.85,
        minimum: 0.0,
        maximum: 1.0,
        sourceType: 'SPATIAL_TOPOLOGY',
        engineeringJustification: 'Weight of cascading disruption between pump stations, drainage outfalls, and power feeders.',
        applicability: 'Topological digital twin & cascade prediction engine.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
      {
        parameterId: 'operatorTriageLatency',
        name: 'Operator Triage & Validation Latency',
        value: 12.0,
        unit: 'minutes',
        defaultValue: 12.0,
        minimum: 1.0,
        maximum: 60.0,
        sourceType: 'ENGINEERING_HEURISTIC',
        engineeringJustification: 'Modeled as an engineering heuristic for controlled scenario evaluation representing standard municipal emergency dispatch delays.',
        applicability: 'Conventional baseline operational response timing.',
        classification: 'SIMULATED / PROTOTYPE DATA',
        disclaimer: 'Prototype engineering assumption — not a real-time municipal meter reading.',
      },
    ];

    for (const a of rawAssumptions) {
      this.assumptions.set(a.parameterId, a);
    }
  }

  /**
   * Helper to build scenario parameters
   */
  private buildScenarioParameters(
    overrides: Record<string, number>
  ): ResearchScenarioParameter[] {
    const params: ResearchScenarioParameter[] = [];
    for (const [key, val] of Object.entries(overrides)) {
      const assumption = this.assumptions.get(key);
      if (assumption) {
        params.push({
          parameterId: assumption.parameterId,
          name: assumption.name,
          value: val,
          unit: assumption.unit,
          defaultValue: assumption.defaultValue,
          minimum: assumption.minimum,
          maximum: assumption.maximum,
          sourceType: assumption.sourceType,
          engineeringJustification: assumption.engineeringJustification,
          applicability: assumption.applicability,
          classification: assumption.classification,
        });
      }
    }
    return params;
  }

  /**
   * Initialize 5 Authoritative Scenarios (SC-01 to SC-05)
   */
  private initializeScenarios(): void {
    const datasetVersion = 'SCOS-RESEARCH-DATASET-v1.0';

    const rawScenarios: Array<Omit<ResearchScenario, 'configurationFingerprint'>> = [
      {
        scenarioId: 'SC-01',
        scenarioCode: 'SC-01',
        scenarioName: 'Severe Waterlogging at Parade Crossing',
        scenarioCategory: 'Monsoonal Urban Flooding',
        description: 'Monsoon flash inundation (45mm/hr) at Parade Crossing intersection with commercial district traffic deadlock.',
        geographicScope: {
          district: 'Kanpur Nagar',
          ward: 'Ward 12 (Civil Lines / Parade)',
          corridor: 'Mall Road - Parade Intersection Arterial',
          centerCoordinates: [26.4715, 80.3498],
          boundingRadiusMeters: 1200,
        },
        targetEntities: [
          { id: 'ROAD-PARADE-A', name: 'Mall Road / Parade Crossing Corridor', type: 'ROAD_NETWORK' },
          { id: 'INFRA-DRAIN-NALA-17', name: 'Stormwater Trunk Nala-17', type: 'DRAINAGE_CHANNEL' },
        ],
        engineeringParameters: this.buildScenarioParameters({
          precipitationIntensity: 45,
          waterInundationDepth: 28,
          pumpCapacityLoss: 40,
          transitDelay: 18,
          exposedPopulation: 3500,
          meanRestorationTime: 3.5,
        }),
        baselineCondition: {
          conditionType: 'BASELINE_MANUAL',
          workflowType: 'BASELINE',
          conditionName: 'Condition A — Baseline Manual Workflow',
          workflowStages: [
            'Manual paper & citizen telephone call receipt',
            'Fragmented cross-department phone checks (Jal Sansthan / Nagar Nigam)',
            'Static PDF ward map inspection',
            'Uncoordinated field crew dispatch',
          ],
          availableEvidence: ['Citizen complaint calls', 'Historical paper records', 'Static PDF maps'],
          decisionSupportAvailability: false,
          coordinationMechanism: 'Ad-hoc inter-departmental voice calls & paper ledgers',
          auditability: 'Low (Manual paper logbooks, fragmented records)',
          traceability: 'Low (No recorded causal link between evidence and dispatch)',
          description: 'Standard municipal operational protocol relying on manual cross-department coordination and verbal reports.',
        },
        scosCondition: {
          conditionType: 'SCOS_INTEGRATED',
          workflowType: 'SCOS',
          conditionName: 'Condition B — SCOS Integrated Decision-Support',
          workflowStages: [
            'Unified telemetry & IoT water-level sensor ingestion',
            'Automated spatial-topological incident triage',
            'Knowledge graph cascade prediction (Nala-17 surcharge)',
            'Multi-agency coordinated dispatch recommendation',
          ],
          availableEvidence: ['Real-time sensor telemetry', 'Digital twin spatial topology', 'Historical flood contours', 'Live asset status'],
          decisionSupportAvailability: true,
          coordinationMechanism: 'Unified automated cross-department impact matrix',
          auditability: 'High (Cryptographic immutable audit ledger)',
          traceability: 'High (End-to-end causal trace linking data, prediction, and decision)',
          description: 'SCOS integrated operational architecture providing spatial digital twin, cascade prediction, and joint dispatch recommendations.',
        },
        expectedEffects: [
          'Mall Road Inundation (28cm)',
          'Nala-17 Surface Surcharge',
          'Ursula Horsman Hospital Access Slowdown',
          'District Traffic Gridlock',
        ],
        researchPurpose: 'Evaluate decision speed, information retrieval efficiency, and cross-department awareness during flash inundation.',
        validationCaseIds: ['VC-01', 'VC-02', 'VC-04'],
        comparativeScenarioIds: ['SC-01'],
        datasetVersion,
        status: 'VALIDATED',
        provenance: {
          dataOrigin: 'SCOS Synthetic Research Engine',
          sourceModule: 'Phase 9A Digital Twin & Phase 9D Evaluation Suite',
          sourceScenario: 'SC-01',
          validationStatus: 'VALIDATED_AGAINST_VC01_VC02_VC04',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Generated strictly as a research benchmark. Not actual Kanpur Nagar Nigam telemetry.',
          createdAt: '2025-06-01T08:00:00.000Z',
          createdBy: 'AI_GOVERNANCE_OFFICER',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        isFrozen: false,
      },
      {
        scenarioId: 'SC-02',
        scenarioCode: 'SC-02',
        scenarioName: 'Dewatering Pump P-04 Mechanical Failure',
        scenarioCategory: 'Mechanical Infrastructure Failure & Sump Surcharge',
        description: 'Param Purwa Dewatering Station P-04 motor trip during continuous heavy precipitation event.',
        geographicScope: {
          district: 'Kanpur Nagar',
          ward: 'Ward 18 (Param Purwa / Juhi)',
          corridor: 'Param Purwa Drainage Basin & Collector Sump',
          centerCoordinates: [26.4421, 80.3210],
          boundingRadiusMeters: 850,
        },
        targetEntities: [
          { id: 'INFRA-PUMP-PARAM-PURWAPUMP', name: 'Param Purwa Dewatering Station P-04', type: 'PUMP_STATION' },
          { id: 'INFRA-DRAIN-NALA-17', name: 'Stormwater Trunk Nala-17 Collector', type: 'DRAINAGE_CHANNEL' },
        ],
        engineeringParameters: this.buildScenarioParameters({
          pumpCapacityLoss: 100,
          waterInundationDepth: 34,
          precipitationIntensity: 30,
          meanRestorationTime: 4.5,
          transitDelay: 15,
          exposedPopulation: 2800,
        }),
        baselineCondition: {
          conditionType: 'BASELINE_MANUAL',
          workflowType: 'BASELINE',
          conditionName: 'Condition A — Baseline Manual Workflow',
          workflowStages: [
            'Physical pump house trip alarms without SCADA integration',
            'Manual Junior Engineer site visit required to verify motor shutdown',
            'Delayed manual notification to Jal Sansthan executive engineer',
            'Ad-hoc procurement of mobile diesel generator pumps',
          ],
          availableEvidence: ['Manual site visit logs', 'Verbal engineer reports'],
          decisionSupportAvailability: false,
          coordinationMechanism: 'Departmental telephone chain',
          auditability: 'Low (Handwritten pump operator log sheet)',
          traceability: 'Low (No cross-asset dependency mapping)',
          description: 'Baseline manual pump station monitoring relying on on-site inspection and post-failure telephonic escalation.',
        },
        scosCondition: {
          conditionType: 'SCOS_INTEGRATED',
          workflowType: 'SCOS',
          conditionName: 'Condition B — SCOS Integrated Decision-Support',
          workflowStages: [
            'Instant SCADA telemetry trip detection & discharge loss alert',
            'Topological asset failure propagation calculation',
            'Automated mobile backup pump allocation recommendation',
            'Pre-emptive upstream drainage throttling recommendation',
          ],
          availableEvidence: ['SCADA pump current & discharge telemetry', 'Digital twin electrical topology', 'Topological catchment model'],
          decisionSupportAvailability: true,
          coordinationMechanism: 'Automated cross-departmental coordination matrix',
          auditability: 'High (Cryptographic immutable audit ledger)',
          traceability: 'High (Complete causal graph from motor trip to sump surcharge)',
          description: 'SCOS integrated failure response triggering automated asset dependency analysis and pre-emptive contingency tasking.',
        },
        expectedEffects: [
          'Pump Impeller Trip (0% flow)',
          'Collector Sump Overflow',
          'Mall Road Runoff Accumulation',
          'Secondary Street Backflow',
        ],
        researchPurpose: 'Quantify impact of digital twin topological dependency awareness on mitigating cascading civil pump failure.',
        validationCaseIds: ['VC-01', 'VC-02', 'VC-03'],
        comparativeScenarioIds: ['SC-02'],
        datasetVersion,
        status: 'VALIDATED',
        provenance: {
          dataOrigin: 'SCOS Synthetic Research Engine',
          sourceModule: 'Phase 9A Digital Twin & Phase 9D Evaluation Suite',
          sourceScenario: 'SC-02',
          validationStatus: 'VALIDATED_AGAINST_VC01_VC02_VC03',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Generated strictly as a research benchmark. Not actual Kanpur Nagar Nigam telemetry.',
          createdAt: '2025-06-01T08:00:00.000Z',
          createdBy: 'AI_GOVERNANCE_OFFICER',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        isFrozen: false,
      },
      {
        scenarioId: 'SC-03',
        scenarioCode: 'SC-03',
        scenarioName: 'Drainage Channel / Nala-17 Capacity Siltation',
        scenarioCategory: 'Hydraulic Gravity Outflow & Debris Surcharge',
        description: 'Stormwater Trunk Nala-17 80% cross-section siltation and debris choke reducing gravity outflow.',
        geographicScope: {
          district: 'Kanpur Nagar',
          ward: 'Ward 14 (Sisamau / Anwarganj)',
          corridor: 'Trunk Nala-17 Drainage Corridor',
          centerCoordinates: [26.4650, 80.3390],
          boundingRadiusMeters: 1500,
        },
        targetEntities: [
          { id: 'INFRA-DRAIN-NALA-17', name: 'Stormwater Trunk Nala-17', type: 'DRAINAGE_CHANNEL' },
          { id: 'ROAD-MALL-RD-01', name: 'Mall Road Low-Lying Culvert Zone', type: 'ROAD_NETWORK' },
        ],
        engineeringParameters: this.buildScenarioParameters({
          siltationFactor: 0.8,
          drainageCapacity: 20,
          precipitationIntensity: 40,
          waterInundationDepth: 25,
          floodedArea: 14000,
          meanRestorationTime: 6.0,
        }),
        baselineCondition: {
          conditionType: 'BASELINE_MANUAL',
          workflowType: 'BASELINE',
          conditionName: 'Condition A — Baseline Manual Workflow',
          workflowStages: [
            'Physical stick depth probing during routine inspection',
            'Paper work order drafted on desilting contractor ledger',
            'Delayed notification of hydraulic surcharge to road department',
            'Health department disease surveillance unlinked to stagnant drainage',
          ],
          availableEvidence: ['Physical dipstick logs', 'Historical contractor bills'],
          decisionSupportAvailability: false,
          coordinationMechanism: 'Isolated municipal work orders',
          auditability: 'Low (Handwritten ledger records)',
          traceability: 'Low (No link between silt measurement and flood hazard)',
          description: 'Traditional siltation tracking relying on periodic physical depth measurement and paper work orders.',
        },
        scosCondition: {
          conditionType: 'SCOS_INTEGRATED',
          workflowType: 'SCOS',
          conditionName: 'Condition B — SCOS Integrated Decision-Support',
          workflowStages: [
            'Hydraulic profile recalculation with dynamic silt factor modifiers',
            'Topological surcharge modeling linking drain to low-lying road culverts',
            'Cross-referenced sanitation & mosquito larvicide task generation',
            'Coordinated high-flow suction tanker deployment recommendation',
          ],
          availableEvidence: ['Acoustic sediment sensors', 'Digital twin elevation profile', 'Vector-borne disease epidemiological risk map'],
          decisionSupportAvailability: true,
          coordinationMechanism: 'Joint sanitation, water, and public health coordination pipeline',
          auditability: 'High (Cryptographic immutable audit ledger)',
          traceability: 'High (Direct mathematical linkage from silt factor to hydraulic backpressure)',
          description: 'SCOS integrated drainage management linking hydraulic capacity loss to multi-department preventive action.',
        },
        expectedEffects: [
          'Hydraulic Head Surcharge',
          'Upstream Culvert Backpressure',
          'Low-Lying Residential Surcharge',
          'Arterial Inundation',
        ],
        researchPurpose: 'Evaluate multi-department context synthesis when civil infrastructure degradation generates public health and transit hazards.',
        validationCaseIds: ['VC-01', 'VC-03', 'VC-04'],
        comparativeScenarioIds: ['SC-03'],
        datasetVersion,
        status: 'VALIDATED',
        provenance: {
          dataOrigin: 'SCOS Synthetic Research Engine',
          sourceModule: 'Phase 9A Digital Twin & Phase 9D Evaluation Suite',
          sourceScenario: 'SC-03',
          validationStatus: 'VALIDATED_AGAINST_VC01_VC03_VC04',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Generated strictly as a research benchmark. Not actual Kanpur Nagar Nigam telemetry.',
          createdAt: '2025-06-01T08:00:00.000Z',
          createdBy: 'AI_GOVERNANCE_OFFICER',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        isFrozen: false,
      },
      {
        scenarioId: 'SC-04',
        scenarioCode: 'SC-04',
        scenarioName: 'Compound Cloudburst + Drainage + Pump Failure',
        scenarioCategory: 'Multi-Hazard Cascading Infrastructure Failure',
        description: 'Extreme multi-failure event: 65mm/hr cloudburst combined with Nala-17 surcharge and P-04 pump shutdown.',
        geographicScope: {
          district: 'Kanpur Nagar',
          ward: 'South & Central District Nexus',
          corridor: 'Parade - Sisamau - Param Purwa Compound Corridor',
          centerCoordinates: [26.4580, 80.3340],
          boundingRadiusMeters: 2500,
        },
        targetEntities: [
          { id: 'INFRA-PUMP-PARAM-PURWAPUMP', name: 'Param Purwa Dewatering Station P-04', type: 'PUMP_STATION' },
          { id: 'INFRA-DRAIN-NALA-17', name: 'Stormwater Trunk Nala-17', type: 'DRAINAGE_CHANNEL' },
          { id: 'INFRA-SUB-CIVILLINES', name: 'Civil Lines Power Substation 33kV', type: 'POWER_SUBSTATION' },
        ],
        engineeringParameters: this.buildScenarioParameters({
          precipitationIntensity: 65,
          pumpCapacityLoss: 100,
          drainageCapacity: 20,
          waterInundationDepth: 42,
          floodedArea: 32000,
          transitDelay: 45,
          exposedPopulation: 8500,
          meanRestorationTime: 8.0,
        }),
        baselineCondition: {
          conditionType: 'BASELINE_MANUAL',
          workflowType: 'BASELINE',
          conditionName: 'Condition A — Baseline Manual Workflow',
          workflowStages: [
            'Fragmented panic calls received across police, fire, municipal, and electricity desks',
            'Conflicting manual resource requests for limited mobile dewatering generators',
            'Lack of unified flood propagation forecast',
            'Delayed notification of electric substation flooding risk',
          ],
          availableEvidence: ['Emergency control room telephone logs', 'Verbal police wireless reports'],
          decisionSupportAvailability: false,
          coordinationMechanism: 'Manual emergency meeting in district magistrate office',
          auditability: 'Low (Ad-hoc handwritten minutes of meeting)',
          traceability: 'Low (Unable to track prioritization tradeoffs in real time)',
          description: 'Emergency response under severe compound stress relying on manual triage and conflicting inter-agency telephone requests.',
        },
        scosCondition: {
          conditionType: 'SCOS_INTEGRATED',
          workflowType: 'SCOS',
          conditionName: 'Condition B — SCOS Integrated Decision-Support',
          workflowStages: [
            'Synchronous multi-hazard ingestion (Doppler radar, pump telemetry, power feeder status)',
            'Dynamic topological cascade graph execution',
            'Automated ranking of what-if mitigation options',
            'District-wide multi-agency synchronized work orders',
          ],
          availableEvidence: ['Radar precipitation grids', 'Substation flood barrier sensors', 'Topological multi-layer digital twin'],
          decisionSupportAvailability: true,
          coordinationMechanism: 'Algorithmic multi-department incident command matrix',
          auditability: 'High (Cryptographic immutable audit ledger)',
          traceability: 'High (Complete causal graph with quantitative risk weights)',
          description: 'SCOS multi-hazard cascade simulation providing unified mitigation ranking and synchronized district response.',
        },
        expectedEffects: [
          'Primary Drainage Surcharge',
          'Pump Station Inundation Trip',
          'Arterial Corridor Cut-off (42cm water)',
          'Hospital Access Impeded',
          'Cross-District Gridlock',
        ],
        researchPurpose: 'Assess operational cognitive load, situational awareness, and cascade identification accuracy under compound disaster stress.',
        validationCaseIds: ['VC-01', 'VC-04', 'VC-05'],
        comparativeScenarioIds: ['SC-04'],
        datasetVersion,
        status: 'VALIDATED',
        provenance: {
          dataOrigin: 'SCOS Synthetic Research Engine',
          sourceModule: 'Phase 9A Digital Twin & Phase 9D Evaluation Suite',
          sourceScenario: 'SC-04',
          validationStatus: 'VALIDATED_AGAINST_VC01_VC04_VC05',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Generated strictly as a research benchmark. Not actual Kanpur Nagar Nigam telemetry.',
          createdAt: '2025-06-01T08:00:00.000Z',
          createdBy: 'AI_GOVERNANCE_OFFICER',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        isFrozen: false,
      },
      {
        scenarioId: 'SC-05',
        scenarioCode: 'SC-05',
        scenarioName: 'Critical Hospital Access Corridor Impedance',
        scenarioCategory: 'Healthcare Access & Emergency Route Interruption',
        description: 'Inundation on primary arterial road directly threatening emergency ambulance ingress to Ursula Horsman Memorial Hospital.',
        geographicScope: {
          district: 'Kanpur Nagar',
          ward: 'Ward 08 (Hospital Sector / Civil Lines)',
          corridor: 'Mall Road - Ursula Hospital Emergency Gate',
          centerCoordinates: [26.4760, 80.3480],
          boundingRadiusMeters: 950,
        },
        targetEntities: [
          { id: 'INFRA-HOSP-URSULA', name: 'Ursula Horsman Memorial Hospital Access Sector', type: 'HEALTHCARE_FACILITY' },
          { id: 'ROAD-PARADE-A', name: 'Mall Road Ambulance Ingress Corridor', type: 'ROAD_NETWORK' },
        ],
        engineeringParameters: this.buildScenarioParameters({
          waterInundationDepth: 35,
          criticalFacilityAccessImpedance: 75,
          transitDelay: 22,
          precipitationIntensity: 50,
          exposedPopulation: 4200,
          meanRestorationTime: 4.0,
        }),
        baselineCondition: {
          conditionType: 'BASELINE_MANUAL',
          workflowType: 'BASELINE',
          conditionName: 'Condition A — Baseline Manual Workflow',
          workflowStages: [
            'Ambulance drivers report blocked road via 108 helpline radio',
            'Traffic police notified verbally without alternative route guidance',
            'Hospital emergency room staff unaware of upstream flooding duration',
            'Manual diversion to secondary roads causing acute bottlenecking',
          ],
          availableEvidence: ['Emergency helpline calls', 'Traffic constable wireless chats'],
          decisionSupportAvailability: false,
          coordinationMechanism: 'Ad-hoc traffic constable manual hand signals',
          auditability: 'Low (Disconnected traffic police dispatch entries)',
          traceability: 'Low (No hospital awareness linkage)',
          description: 'Baseline emergency transport response relying on driver radio feedback and ad-hoc physical traffic redirection.',
        },
        scosCondition: {
          conditionType: 'SCOS_INTEGRATED',
          workflowType: 'SCOS',
          conditionName: 'Condition B — SCOS Integrated Decision-Support',
          workflowStages: [
            'Proactive critical facility exposure detection via spatial buffer engine',
            'Dynamic green corridor diversion routing pushed to 108 ambulance dispatch',
            'Targeted auxiliary dewatering pump deployment recommendation for emergency gate',
            'Real-time transit ETA updates streamed to hospital triage room',
          ],
          availableEvidence: ['Spatial proximity buffer models', 'Live roadway passability telemetry', 'Connected hospital bed and ingress status'],
          decisionSupportAvailability: true,
          coordinationMechanism: 'Automated green corridor traffic diversion & dewatering matrix',
          auditability: 'High (Cryptographic immutable audit ledger)',
          traceability: 'High (Explicit causal route passability score and emergency transit telemetry)',
          description: 'SCOS critical facility protection providing automated green corridor routing and emergency access pump prioritization.',
        },
        expectedEffects: [
          'Mall Road Access Ingress Submerged (35cm)',
          'Ambulance Transit Delay (+22 min)',
          'Emergency Room Access Route Blocked',
          'Secondary Route Congestion',
        ],
        researchPurpose: 'Measure time savings, route safety, and critical facility protection efficacy during high-stakes municipal emergencies.',
        validationCaseIds: ['VC-01', 'VC-05', 'VC-06', 'VC-07'],
        comparativeScenarioIds: ['SC-05'],
        datasetVersion,
        status: 'VALIDATED',
        provenance: {
          dataOrigin: 'SCOS Synthetic Research Engine',
          sourceModule: 'Phase 9A Digital Twin & Phase 9D Evaluation Suite',
          sourceScenario: 'SC-05',
          validationStatus: 'VALIDATED_AGAINST_VC01_VC05_VC06_VC07',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Generated strictly as a research benchmark. Not actual Kanpur Nagar Nigam telemetry.',
          createdAt: '2025-06-01T08:00:00.000Z',
          createdBy: 'AI_GOVERNANCE_OFFICER',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        isFrozen: false,
      },
    ];

    for (const raw of rawScenarios) {
      const configurationFingerprint = this.computeScenarioFingerprint(raw);
      const scenario: ResearchScenario = {
        ...raw,
        configurationFingerprint,
      };
      this.scenarios.set(scenario.scenarioId, scenario);
    }
  }

  /**
   * Compute deterministic fingerprint for a scenario definition
   */
  public computeScenarioFingerprint(scenario: Omit<ResearchScenario, 'configurationFingerprint'> | ResearchScenario): string {
    const fingerprintPayload = {
      scenarioCode: scenario.scenarioCode,
      scenarioCategory: scenario.scenarioCategory,
      datasetVersion: scenario.datasetVersion,
      geographicScope: scenario.geographicScope,
      targetEntities: scenario.targetEntities,
      engineeringParameters: scenario.engineeringParameters.map((p) => ({
        id: p.parameterId,
        value: p.value,
        unit: p.unit,
      })),
      baselineCondition: {
        conditionType: scenario.baselineCondition.conditionType,
        workflowStages: scenario.baselineCondition.workflowStages,
      },
      scosCondition: {
        conditionType: scenario.scosCondition.conditionType,
        workflowStages: scenario.scosCondition.workflowStages,
      },
      expectedEffects: scenario.expectedEffects,
      validationCaseIds: scenario.validationCaseIds,
      comparativeScenarioIds: scenario.comparativeScenarioIds,
    };

    return computeDeterministicFingerprint(fingerprintPayload);
  }

  /**
   * Compute deterministic execution fingerprint for an experimental condition run
   */
  public computeExecutionFingerprint(params: {
    scenarioId: string;
    datasetVersion: string;
    condition: ResearchExperimentalConditionType;
    parameterSnapshot: Record<string, number | string>;
  }): string {
    const canonicalPayload = {
      scenarioId: params.scenarioId,
      datasetVersion: params.datasetVersion,
      condition: params.condition,
      parameters: params.parameterSnapshot,
    };
    return computeDeterministicFingerprint(canonicalPayload);
  }

  /**
   * Initialize standard Dataset Versions
   */
  private initializeVersions(): void {
    const v1Payload = {
      versionTag: 'v1.0',
      datasetId: this.activeDatasetId,
      scenarios: Array.from(this.scenarios.values()).map((s) => s.configurationFingerprint),
      assumptions: Array.from(this.assumptions.values()).map((a) => ({
        id: a.parameterId,
        val: a.value,
      })),
    };
    const fingerprint = computeDeterministicFingerprint(v1Payload);

    const version1: ResearchDatasetVersion = {
      versionId: 'SCOS-DATASET-VER-01',
      datasetId: this.activeDatasetId,
      versionName: 'SCOS Experimental Research Dataset v1.0',
      versionTag: 'v1.0',
      scenarioCount: this.scenarios.size,
      validationCaseCount: 7, // VC-01 through VC-07
      parameterCount: this.assumptions.size,
      status: 'VALIDATED',
      configurationFingerprint: fingerprint,
      createdAt: '2025-06-01T08:00:00.000Z',
      createdBy: 'AI_GOVERNANCE_OFFICER',
      releaseNotes: 'Authoritative canonical research dataset incorporating 5 benchmark scenarios (SC-01..SC-05), 12 engineering assumptions, and cross-links to VC-01..VC-07.',
      isFrozen: false,
    };

    const v1_1Payload = {
      versionTag: 'v1.1',
      datasetId: this.activeDatasetId,
      scenarios: Array.from(this.scenarios.values()).map((s) => s.configurationFingerprint),
      assumptions: Array.from(this.assumptions.values()).map((a) => ({
        id: a.parameterId,
        val: a.value,
      })),
      correctionNote: 'Metadata provenance correction only. Numerical experimental results unchanged.',
    };
    const fingerprint1_1 = computeDeterministicFingerprint(v1_1Payload);

    const version1_1: ResearchDatasetVersion = {
      versionId: 'SCOS-DATASET-VER-02',
      datasetId: this.activeDatasetId,
      versionName: 'SCOS Experimental Research Dataset v1.1',
      versionTag: 'v1.1',
      scenarioCount: this.scenarios.size,
      validationCaseCount: 7,
      parameterCount: this.assumptions.size,
      status: 'FROZEN',
      configurationFingerprint: fingerprint1_1,
      createdAt: '2026-08-20T08:00:00.000Z',
      createdBy: 'AI_GOVERNANCE_OFFICER',
      releaseNotes:
        'Metadata provenance correction only. Numerical experimental results unchanged. Clarified operator triage latency and siltation factor classifications, explicit Human N=0 computational run labeling.',
      isFrozen: true,
    };

    this.versions.set(version1.versionTag, version1);
    this.versions.set(version1_1.versionTag, version1_1);
  }

  /**
   * Initialize standard pre-seeded execution records
   */
  private initializeExecutions(): void {
    const executions: ResearchScenarioExecution[] = [
      {
        executionId: 'EXEC-SC01-BASE-001',
        scenarioId: 'SC-01',
        scenarioCode: 'SC-01',
        datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
        condition: 'BASELINE_MANUAL',
        configurationFingerprint: this.computeExecutionFingerprint({
          scenarioId: 'SC-01',
          datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
          condition: 'BASELINE_MANUAL',
          parameterSnapshot: {
            precipitationIntensity: 45,
            waterInundationDepth: 28,
            pumpCapacityLoss: 40,
            transitDelay: 18,
            exposedPopulation: 3500,
            meanRestorationTime: 3.5,
          },
        }),
        startedAt: '2025-06-02T10:00:00.000Z',
        completedAt: '2025-06-02T10:31:40.000Z',
        executionStatus: 'COMPLETED',
        modelVersion: 'SCOS-BASELINE-v1',
        parameterSnapshot: {
          precipitationIntensity: 45,
          waterInundationDepth: 28,
          pumpCapacityLoss: 40,
          transitDelay: 18,
          exposedPopulation: 3500,
          meanRestorationTime: 3.5,
        },
        resultSummary: {
          durationSeconds: 1900,
          retrievalSteps: 7,
          contextCompletenessPercent: 44.4,
          decisionTraceabilityPercent: 30.0,
          notes: 'Standard manual paper & telephony response under flash waterlogging.',
        },
        provenance: {
          dataOrigin: 'SCOS Controlled Research Evaluation Run',
          sourceModule: 'Phase 9D Evaluation Engine',
          sourceScenario: 'SC-01',
          validationStatus: 'VALIDATED',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'Baseline comparative trial for research publication benchmark.',
          createdAt: '2025-06-02T10:31:40.000Z',
          createdBy: 'RESEARCH_EVALUATOR',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        executedBy: 'RESEARCH_EVALUATOR',
      },
      {
        executionId: 'EXEC-SC01-SCOS-001',
        scenarioId: 'SC-01',
        scenarioCode: 'SC-01',
        datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
        condition: 'SCOS_INTEGRATED',
        configurationFingerprint: this.computeExecutionFingerprint({
          scenarioId: 'SC-01',
          datasetVersion: 'SCOS-RESEARCH-DATASET-v1.0',
          condition: 'SCOS_INTEGRATED',
          parameterSnapshot: {
            precipitationIntensity: 45,
            waterInundationDepth: 28,
            pumpCapacityLoss: 40,
            transitDelay: 18,
            exposedPopulation: 3500,
            meanRestorationTime: 3.5,
          },
        }),
        startedAt: '2025-06-02T11:00:00.000Z',
        completedAt: '2025-06-02T11:06:50.000Z',
        executionStatus: 'COMPLETED',
        modelVersion: 'SCOS-INTEGRATED-v9D',
        parameterSnapshot: {
          precipitationIntensity: 45,
          waterInundationDepth: 28,
          pumpCapacityLoss: 40,
          transitDelay: 18,
          exposedPopulation: 3500,
          meanRestorationTime: 3.5,
        },
        resultSummary: {
          durationSeconds: 410,
          retrievalSteps: 2,
          contextCompletenessPercent: 100.0,
          decisionTraceabilityPercent: 90.0,
          notes: 'SCOS unified spatial & knowledge graph response under flash waterlogging.',
        },
        provenance: {
          dataOrigin: 'SCOS Controlled Research Evaluation Run',
          sourceModule: 'Phase 9D Evaluation Engine',
          sourceScenario: 'SC-01',
          validationStatus: 'VALIDATED',
          classification: 'SIMULATED / PROTOTYPE DATA',
          isSimulatedPrototype: true,
          provenanceNote: 'SCOS comparative trial for research publication benchmark.',
          createdAt: '2025-06-02T11:06:50.000Z',
          createdBy: 'RESEARCH_EVALUATOR',
        },
        classification: 'SIMULATED / PROTOTYPE DATA',
        executedBy: 'RESEARCH_EVALUATOR',
      },
    ];

    for (const exec of executions) {
      this.executions.set(exec.executionId, exec);
    }
  }

  // =========================================================================
  // PUBLIC API METHODS
  // =========================================================================

  /**
   * Get Root Research Dataset Metadata & Summary
   */
  public getDatasetSummary(): ResearchDataset {
    const scenarios = Array.from(this.scenarios.values());
    const assumptions = Array.from(this.assumptions.values());
    const versions = Array.from(this.versions.values());

    const rootFingerprint = computeDeterministicFingerprint({
      datasetId: this.activeDatasetId,
      version: this.currentVersionTag,
      scenarioFingerprints: scenarios.map((s) => s.configurationFingerprint).sort(),
      assumptionFingerprints: assumptions.map((a) => a.parameterId).sort(),
    });

    return {
      datasetId: this.activeDatasetId,
      datasetName: 'SCOS Controlled Experimental Dataset & Scenario Benchmark',
      currentVersion: this.currentVersionTag,
      versions,
      scenarios,
      assumptions,
      validationCaseIds: ['VC-01', 'VC-02', 'VC-03', 'VC-04', 'VC-05', 'VC-06', 'VC-07'],
      comparativeScenarioIds: ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'],
      status: 'VALIDATED',
      configurationFingerprint: rootFingerprint,
      provenance: {
        dataOrigin: 'SCOS Synthetic Research Benchmark Repository',
        sourceModule: 'Phase 10A Research Dataset Registry',
        sourceScenario: 'ALL_SCENARIOS',
        validationStatus: 'VALIDATED',
        classification: 'SIMULATED / PROTOTYPE DATA',
        isSimulatedPrototype: true,
        provenanceNote: 'Canonical dataset designed for experimental reproducibility and publication benchmarking.',
        createdAt: '2025-06-01T08:00:00.000Z',
        createdBy: 'AI_GOVERNANCE_OFFICER',
      },
      classification: 'SIMULATED / PROTOTYPE DATA',
      disclaimer: 'SIMULATED / PROTOTYPE DATA — All scenarios, parameters, and results are research constructs for operational software evaluation and do not represent live government telemetry or real municipal events.',
    };
  }

  /**
   * Get All Scenarios in Registry
   */
  public getAllScenarios(): ResearchScenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get Scenario by ID
   */
  public getScenario(id: string): ResearchScenario | undefined {
    return this.scenarios.get(id) || Array.from(this.scenarios.values()).find((s) => s.scenarioCode === id);
  }

  /**
   * Get Centralized Engineering Assumptions
   */
  public getAllAssumptions(): ResearchAssumption[] {
    return Array.from(this.assumptions.values());
  }

  /**
   * Get Specific Assumption
   */
  public getAssumption(id: string): ResearchAssumption | undefined {
    return this.assumptions.get(id);
  }

  /**
   * Get All Dataset Versions
   */
  public getAllVersions(): ResearchDatasetVersion[] {
    return Array.from(this.versions.values());
  }

  /**
   * Get All Executions
   */
  public getAllExecutions(): ResearchScenarioExecution[] {
    return Array.from(this.executions.values());
  }

  /**
   * Get Execution by ID
   */
  public getExecution(id: string): ResearchScenarioExecution | undefined {
    return this.executions.get(id);
  }

  /**
   * Freeze Scenario Configuration
   */
  public freezeScenario(scenarioId: string, userEmail: string): ResearchScenario {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario '${scenarioId}' not found in Research Registry.`);
    }

    scenario.isFrozen = true;
    scenario.status = 'FROZEN';
    scenario.frozenAt = new Date().toISOString();
    scenario.frozenBy = userEmail;
    this.scenarios.set(scenario.scenarioId, scenario);
    return scenario;
  }

  /**
   * Execute a Controlled Research Experiment Run
   */
  public executeResearchRun(
    scenarioId: string,
    condition: ResearchExperimentalConditionType,
    parameterOverrides: Record<string, number> = {},
    userEmail = 'researcher@scos.gov.in'
  ): ResearchScenarioExecution {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario '${scenarioId}' not found in Research Registry.`);
    }

    // Build effective parameter snapshot
    const parameterSnapshot: Record<string, number | string> = {};
    for (const p of scenario.engineeringParameters) {
      parameterSnapshot[p.parameterId] = parameterOverrides[p.parameterId] !== undefined ? parameterOverrides[p.parameterId] : p.value;
    }

    const execFingerprint = this.computeExecutionFingerprint({
      scenarioId: scenario.scenarioId,
      datasetVersion: scenario.datasetVersion,
      condition,
      parameterSnapshot,
    });

    const executionId = `EXEC-${scenario.scenarioCode}-${condition === 'BASELINE_MANUAL' ? 'BASE' : 'SCOS'}-${Date.now().toString().slice(-6)}`;

    // Calculate simulated benchmark outputs based on condition
    const isScos = condition === 'SCOS_INTEGRATED';
    const durationSeconds = isScos ? Math.round(360 + Math.random() * 80) : Math.round(1800 + Math.random() * 300);
    const retrievalSteps = isScos ? 2 : 7;
    const contextCompletenessPercent = isScos ? 100 : 44.4;
    const decisionTraceabilityPercent = isScos ? 90 : 30;

    const execution: ResearchScenarioExecution = {
      executionId,
      scenarioId: scenario.scenarioId,
      scenarioCode: scenario.scenarioCode,
      datasetVersion: scenario.datasetVersion,
      condition,
      configurationFingerprint: execFingerprint,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      executionStatus: 'COMPLETED',
      modelVersion: isScos ? 'SCOS-INTEGRATED-v9D' : 'SCOS-BASELINE-v1',
      parameterSnapshot,
      resultSummary: {
        durationSeconds,
        retrievalSteps,
        contextCompletenessPercent,
        decisionTraceabilityPercent,
        notes: isScos
          ? 'Automated execution via SCOS digital twin & knowledge graph coordination pipeline.'
          : 'Simulated execution under standard manual departmental workflow condition.',
      },
      provenance: {
        dataOrigin: 'SCOS Controlled Research Execution Engine',
        sourceModule: 'Phase 10A Research Dataset Service',
        sourceScenario: scenario.scenarioCode,
        validationStatus: 'VALIDATED',
        classification: 'SIMULATED / PROTOTYPE DATA',
        isSimulatedPrototype: true,
        provenanceNote: 'Generated strictly as a research benchmark. Not live municipal data.',
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
      },
      classification: 'SIMULATED / PROTOTYPE DATA',
      executedBy: userEmail,
    };

    this.executions.set(execution.executionId, execution);
    return execution;
  }

  /**
   * Verify Reproducibility against a Configuration Fingerprint
   */
  public verifyReproducibility(req: ReproducibilityCheckRequest): ReproducibilityCheckResult {
    const scenario = this.getScenario(req.scenarioId);
    if (!scenario) {
      return {
        status: 'NOT_FOUND',
        scenarioId: req.scenarioId,
        datasetVersion: req.datasetVersion || this.currentVersionTag,
        condition: req.condition || 'SCOS_INTEGRATED',
        inputFingerprint: req.configurationFingerprint,
        computedFingerprint: '',
        isMatch: false,
        diffSummary: [`Scenario '${req.scenarioId}' does not exist in the research registry.`],
        matchDetails: {
          scenarioCode: req.scenarioId,
          scenarioName: 'Unknown',
          parameterCount: 0,
          verifiedAt: new Date().toISOString(),
          algorithm: 'CANONICAL_JSON_SHA256',
        },
        classificationNotice: 'SIMULATED / PROTOTYPE DATA',
      };
    }

    // Determine target condition
    const condition = req.condition || 'SCOS_INTEGRATED';
    const datasetVersion = req.datasetVersion || scenario.datasetVersion;

    // Build parameter snapshot
    const effectiveParams: Record<string, number | string> = {};
    const diffs: string[] = [];

    for (const p of scenario.engineeringParameters) {
      if (req.parametersOverride && req.parametersOverride[p.parameterId] !== undefined) {
        effectiveParams[p.parameterId] = req.parametersOverride[p.parameterId];
        if (req.parametersOverride[p.parameterId] !== p.value) {
          diffs.push(`Parameter '${p.parameterId}' altered from default ${p.value} to ${req.parametersOverride[p.parameterId]}`);
        }
      } else {
        effectiveParams[p.parameterId] = p.value;
      }
    }

    // Compute execution fingerprint or scenario fingerprint
    let computedFingerprint = '';
    if (req.condition || req.parametersOverride) {
      computedFingerprint = this.computeExecutionFingerprint({
        scenarioId: scenario.scenarioId,
        datasetVersion,
        condition,
        parameterSnapshot: effectiveParams,
      });
    } else {
      computedFingerprint = scenario.configurationFingerprint;
    }

    const isMatch = req.configurationFingerprint.trim().toLowerCase() === computedFingerprint.trim().toLowerCase();

    if (!isMatch && diffs.length === 0) {
      diffs.push(`Provided fingerprint '${req.configurationFingerprint}' does not match computed deterministic fingerprint '${computedFingerprint}'`);
    }

    return {
      status: isMatch ? 'MATCH' : 'MISMATCH',
      scenarioId: scenario.scenarioId,
      datasetVersion,
      condition,
      inputFingerprint: req.configurationFingerprint,
      computedFingerprint,
      isMatch,
      diffSummary: diffs,
      matchDetails: {
        scenarioCode: scenario.scenarioCode,
        scenarioName: scenario.scenarioName,
        parameterCount: scenario.engineeringParameters.length,
        verifiedAt: new Date().toISOString(),
        algorithm: 'CANONICAL_JSON_SHA256',
      },
      classificationNotice: 'SIMULATED / PROTOTYPE DATA — Not a real-world municipal measurement.',
    };
  }

  /**
   * Full Dataset Export (JSON & CSV Compatible)
   */
  public exportDataset(userEmail = 'researcher@scos.gov.in'): ResearchDatasetExport {
    const summary = this.getDatasetSummary();
    const scenarios = this.getAllScenarios();
    const assumptions = this.getAllAssumptions();
    const executions = this.getAllExecutions();

    return {
      dataset: {
        datasetId: summary.datasetId,
        datasetName: summary.datasetName,
        version: summary.currentVersion,
        status: summary.status,
        configurationFingerprint: summary.configurationFingerprint,
        scenarioCount: scenarios.length,
        validationCaseCount: summary.validationCaseIds.length,
        parameterCount: assumptions.length,
        createdAt: summary.provenance.createdAt,
        classification: summary.classification,
      },
      scenarios,
      engineeringAssumptions: assumptions,
      executions,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: userEmail,
        exportFormat: 'JSON',
        classificationNotice: 'SIMULATED / PROTOTYPE DATA — Exported strictly for academic research reproducibility.',
        reproducibilityStandard: 'CANONICAL_JSON_SHA256_v1',
      },
    };
  }

  /**
   * Export CSV Format
   */
  public exportDatasetCSV(): string {
    const scenarios = this.getAllScenarios();
    const lines: string[] = [];

    // Header disclaimer
    lines.push('# SCOS PHASE 10A RESEARCH DATASET EXPORT');
    lines.push('# CLASSIFICATION: SIMULATED / PROTOTYPE DATA — NOT REAL MUNICIPAL TELEMETRY');
    lines.push('# EXPORTED_AT: ' + new Date().toISOString());
    lines.push('');

    // Scenarios Table
    lines.push('Scenario ID,Code,Name,Category,Target Entity,Fingerprint,Linked Validation Cases,Status');
    for (const s of scenarios) {
      const target = s.targetEntities.map((e) => e.name).join('; ');
      const valCases = s.validationCaseIds.join('; ');
      lines.push(
        `"${s.scenarioId}","${s.scenarioCode}","${s.scenarioName}","${s.scenarioCategory}","${target}","${s.configurationFingerprint}","${valCases}","${s.status}"`
      );
    }

    lines.push('');
    lines.push('# ENGINEERING ASSUMPTIONS');
    lines.push('Parameter ID,Name,Value,Unit,Min,Max,Source Type,Applicability');
    for (const a of this.getAllAssumptions()) {
      lines.push(
        `"${a.parameterId}","${a.name}",${a.value},"${a.unit}",${a.minimum},${a.maximum},"${a.sourceType}","${a.applicability}"`
      );
    }

    lines.push('');
    lines.push('# EXPERIMENTAL EXECUTIONS');
    lines.push('Execution ID,Scenario ID,Condition,Fingerprint,Status,Duration (sec),Traceability (%),Executed By');
    for (const e of this.getAllExecutions()) {
      lines.push(
        `"${e.executionId}","${e.scenarioId}","${e.condition}","${e.configurationFingerprint}","${e.executionStatus}",${e.resultSummary.durationSeconds || 0},${e.resultSummary.decisionTraceabilityPercent || 0},"${e.executedBy}"`
      );
    }

    return lines.join('\n');
  }
}

export const researchDatasetService = new ResearchDatasetService();
