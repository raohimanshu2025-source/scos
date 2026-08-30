// =========================================================================
// SCOS PHASE 11D — RESEARCH DEMONSTRATION & VIVA DEFENSE SERVICE
// Non-Destructive Academic Synthesis, 15-Step Research Story Engine,
// Examiner Question Matrix, and Demonstration Manifest
// Version: SCOS-RESEARCH-DEMO-v1.0
// Academic Affiliation: IIT Kanpur — Department of Civil Engineering
// =========================================================================

import {
  DemonstrationMode,
  DemonstrationStepId,
  ResearchDemonstrationSession,
  ResearchDemonstrationStep,
  ResearchDemonstrationEvidence,
  ResearchDemonstrationScenario,
  ResearchDemonstrationProgress,
  ResearchDemonstrationSummary,
  ResearchDemonstrationBoundary,
  ResearchDemonstrationManifest,
  ExaminerQuestionItem,
  QuickDemoStepConfig,
} from '../types/researchDemonstration';
import { researchClaimValidationService } from './researchClaimValidationService';
import { researchValidationService } from './researchValidationService';
import { thesisEvidenceService } from './thesisEvidenceService';
import { statisticalAnalysisService } from './statisticalAnalysisService';
import { sensitivityAnalysisService } from './sensitivityAnalysisService';
import { computeDeterministicFingerprint } from './researchDatasetService';
import { ScenarioId, MetricCode, ResearchQuestionId, HypothesisId } from '../types/researchDemonstration';

export class ResearchDemonstrationService {
  private static instance: ResearchDemonstrationService;
  private currentSession: ResearchDemonstrationSession | null = null;

  private constructor() {}

  public static getInstance(): ResearchDemonstrationService {
    if (!ResearchDemonstrationService.instance) {
      ResearchDemonstrationService.instance = new ResearchDemonstrationService();
    }
    return ResearchDemonstrationService.instance;
  }

  /**
   * Initializes or gets the active research demonstration session
   */
  public buildResearchDemonstration(
    sessionId: string = 'SESSION-SCOS-VIVA-01',
    mode: DemonstrationMode = 'PROFESSOR_MODE',
    scenarioId: ScenarioId = 'SC-01'
  ): ResearchDemonstrationSession {
    if (this.currentSession && this.currentSession.sessionId === sessionId) {
      return this.currentSession;
    }

    const session: ResearchDemonstrationSession = {
      sessionId,
      demoVersion: 'SCOS-RESEARCH-DEMO-v1.0',
      startedAt: new Date().toISOString(),
      currentStep: 'STEP-01',
      completedSteps: [],
      selectedScenario: scenarioId,
      selectedMode: mode,
      researchQuestionLinks: ['RQ-01', 'RQ-02', 'RQ-03', 'RQ-04', 'RQ-05'],
      hypothesisLinks: ['H01', 'H02', 'H03', 'H04', 'H05'],
      metricLinks: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'],
      evidenceReferences: [
        'PHASE-8-SECURITY-COORDINATION',
        'PHASE-9-DIGITAL-TWIN-SIMULATION',
        'PHASE-10-EXPERIMENTAL-BENCHMARKS',
        'PHASE-11A-RESEARCH-VALIDATION-HUB',
        'PHASE-11B-CLAIMS-GOVERNANCE',
        'PHASE-11C-THESIS-EVIDENCE-PACKAGE',
      ],
      classification: 'ACADEMIC RESEARCH / CONTROLLED EXPERIMENTAL EVIDENCE (M.Tech Thesis — IIT Kanpur)',
      fieldValidationStatus: 'NOT_ESTABLISHED',
      isPresenterModeActive: mode === 'PROFESSOR_MODE',
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Returns all 15 steps of the master academic research story
   */
  public getDemonstrationSteps(): ResearchDemonstrationStep[] {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    const validationSnapshot = researchValidationService.getConsolidatedSnapshot();
    const thesisPkg = thesisEvidenceService.buildThesisEvidencePackage();

    return [
      // -------------------------------------------------------------
      // STEP 1: RESEARCH PROBLEM
      // -------------------------------------------------------------
      {
        stepId: 'STEP-01',
        stepNumber: 1,
        title: 'Urban Infrastructure Research Problem',
        shortTitle: 'Research Problem',
        subtitle: 'Fragmented Municipal Information, Operational Silos, and Untraced Multi-Agency Decisions',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Municipal infrastructure operations suffer from fragmented spatial-telemetric data, rigid inter-departmental silos, and lack of dependency-aware decision traceability.',
        primaryNarrative:
          'During severe urban stressors (such as high-intensity monsoon rainstorms, grid disturbances, and utility pipeline ruptures), municipal response in Indian district administrations is severely hindered by four structural friction points: (1) Fragmented spatial data across isolated agency servers; (2) Departmental operational silos operating without real-time cross-boundary dependency awareness; (3) Inability to anticipate cascading failures propagating across topological networks (e.g., storm nala overflows drowning power substations and stalling water pump houses); and (4) The absence of cryptographically verifiable decision audit trails. This research models and evaluates a unified Smart City Operating System (SCOS) reference architecture to address these specific integration barriers.',
        civilEngineeringContext:
          'Civil infrastructure systems (drainage basins, road networks, electrical feeder corridors, water distribution mains) operate as physically interdependent networks. Localized hydraulic overload triggers non-linear failures across adjacent municipal assets.',
        evidenceReferenceId: 'EVID-STEP-01-PROBLEM',
        limitationsNotice:
          'This research investigates these barriers within a structured reference architecture and controlled prototype. It does NOT claim that these conditions uniformly characterize every Indian municipal corporation.',
        permittedStatements: [
          'The research investigates structural information fragmentation and coordination delays in municipal operations.',
          'The SCOS architecture is proposed as an integrated engineering framework for multi-department decision support.',
        ],
        prohibitedOverclaims: [
          'SCOS eliminates all municipal inefficiency in Indian cities.',
          'This study proves real-world municipal failure across all Indian districts.',
        ],
        mappedArtifacts: {
          figures: ['FIG-01: Nine-Layer SCOS Architecture', 'FIG-06: Urban Inundation Cascade Digraph'],
          tables: ['TBL-01: Research Gap & Literature Analysis'],
          phases: ['Phase 8.1 Data Integration', 'Phase 8.2 Civil Infrastructure'],
        },
        stepData: {
          coreProblemDimensions: [
            {
              dim: 'Data Fragmentation',
              desc: 'Telemetry, GIS maps, and complaints isolated in departmental silos with heterogeneous schemas.',
            },
            {
              dim: 'Operational Silos',
              desc: 'Uncoordinated response workflows leading to duplicated effort and conflicting field actions.',
            },
            {
              dim: 'Cascade Blindness',
              desc: 'Inability to detect when primary flooding will trigger secondary pump/substation failures.',
            },
            {
              dim: 'Decision Traceability',
              desc: 'Lack of immutable logging connecting sensor alerts to human sign-offs and dispatch actions.',
            },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 2: RESEARCH GAP
      // -------------------------------------------------------------
      {
        stepId: 'STEP-02',
        stepNumber: 2,
        title: 'Systematic Research Gap Analysis',
        shortTitle: 'Research Gap',
        subtitle: 'Comparing Existing ICCCs, Urban Digital Twins, and AI/IoT Solutions with SCOS',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Existing Smart City ICCCs provide visual monitoring dashboards but lack cross-infrastructure topological dependency modeling, automated inter-agency task sequencing, and cryptographic auditability.',
        primaryNarrative:
          'A systematic synthesis of the urban computing and disaster management literature reveals that current Integrated Command and Control Centres (ICCCs) act primarily as centralized display aggregators ("single pane of glass"). While they visualize CCTV and GIS layers, they fail to computationally represent: (a) physical and functional asset dependencies, (b) multi-criteria SLA-governed task allocation, (c) human-governed explainable decision support, and (d) mathematically reproducible evaluation benchmarks. SCOS addresses these gaps through an integrated 9-layer reference architecture.',
        civilEngineeringContext:
          'Conventional GIS systems store static asset locations. SCOS integrates topological connectivity with hydraulic heuristics and power dependencies to model failure propagation paths.',
        evidenceReferenceId: 'EVID-STEP-02-GAP',
        limitationsNotice:
          'Literature gaps are synthesized from published smart city and disaster informatics frameworks (2018–2025). No proprietary vendor systems were reverse-engineered.',
        permittedStatements: [
          'SCOS responds to documented limitations in conventional municipal ICCC dashboard architectures.',
          'The research proposes topological dependency modeling and structured coordination workflows to bridge operational silos.',
        ],
        prohibitedOverclaims: [
          'All existing commercial smart city platforms are obsolete.',
          'SCOS is universally superior to all global command centers.',
        ],
        mappedArtifacts: {
          figures: ['FIG-01: SCOS Reference Architecture'],
          tables: ['TBL-01: Systematic Literature Gap Analysis (8 Critical Dimensions)'],
          phases: ['Phase 10E Reference Architecture', 'Phase 11A Research Framework'],
        },
        stepData: {
          gapMatrix: [
            {
              domain: 'Smart City ICCCs',
              stateOfArt: 'Centralized telemetry dashboarding and GIS visualization.',
              identifiedGap: 'Lacks topological dependency graphs and multi-agency automated SOP sequencing.',
              scosContribution: 'Knowledge Graph integration with automated cross-department task dispatch.',
            },
            {
              domain: 'Urban Digital Twins',
              stateOfArt: '3D geometric city models and CFD microclimate simulations.',
              identifiedGap: 'Heavy computational burden; isolated from operational municipal decision workflows.',
              scosContribution: 'Lightweight operational digital twin coupled directly with district triage engines.',
            },
            {
              domain: 'Decision Support',
              stateOfArt: 'Rule-based threshold alerts or unexplainable black-box machine learning.',
              identifiedGap: 'High operator cognitive fatigue; lack of human review auditability.',
              scosContribution: 'Human-in-the-loop triage with explainable SOP recommendations and SHA-256 ledger.',
            },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 3: RESEARCH QUESTIONS & HYPOTHESES
      // -------------------------------------------------------------
      {
        stepId: 'STEP-03',
        stepNumber: 3,
        title: 'Research Questions & Formal Hypotheses',
        shortTitle: 'RQ & Hypotheses',
        subtitle: 'Formal Mapping: RQ-01..RQ-05 to H01..H05, Evaluated Across Metrics M1..M10',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: false,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Five formal research questions investigate workflow duration (H01), multi-agency overhead (H02), cascade awareness (H03), decision completeness (H04), and audit integrity (H05).',
        primaryNarrative:
          'The dissertation formulates 5 core research questions (RQ-01 to RQ-05) paired with testable directional hypotheses (H01 to H05). Each hypothesis is bound to concrete evaluation metrics (M1 through M10), evaluated over 5 controlled municipal benchmark scenarios (SC-01 to SC-05, N=15 runs each) comparing Condition A (Conventional Manual Workflow) against Condition B (SCOS Integrated Workflow).',
        civilEngineeringContext:
          'Hypotheses test operational performance during severe infrastructure stress: urban flooding (H01), utility coordination (H02), spatial cascade contagion (H03), resource allocation (H04), and immutable provenance (H05).',
        evidenceReferenceId: 'EVID-STEP-03-RQ-HYP',
        limitationsNotice:
          'Hypothesis evaluation is bounded to controlled digital twin simulations and computational verification. Claims of real-world proof are strictly excluded.',
        permittedStatements: [
          'Hypotheses H01 through H05 were computationally evaluated under controlled scenario conditions.',
          'Empirical distributions indicate substantial operational improvements within the tested prototype parameters.',
        ],
        prohibitedOverclaims: [
          'Hypotheses H01 through H05 are proven for all real-world municipal corporations.',
          'Statistical significance at population level is established.',
        ],
        mappedArtifacts: {
          figures: ['FIG-02: Research Question to Hypothesis Mapping Matrix'],
          tables: ['TBL-02: Master RQ-H-M-SC Evaluation Matrix'],
          phases: ['Phase 10A Research Dataset', 'Phase 11B Claims Validation'],
        },
        stepData: {
          hypothesesSummary: claimsSnapshot.hypotheses.map((h) => ({
            id: h.hypothesisId,
            rq: h.researchQuestionId,
            statement: h.statement,
            metrics: h.supportingMetricCodes,
            status: h.evidenceStatus,
            score: h.evidenceStrengthScore,
            robustness: h.robustnessStatus,
          })),
        },
      },

      // -------------------------------------------------------------
      // STEP 4: PROPOSED SCOS REFERENCE ARCHITECTURE
      // -------------------------------------------------------------
      {
        stepId: 'STEP-04',
        stepNumber: 4,
        title: 'Proposed SCOS 9-Layer Reference Architecture',
        shortTitle: 'SCOS Architecture',
        subtitle: 'From Heterogeneous Data Ingestion to Human-in-the-Loop Municipal Governance',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'A modular 9-layer architecture decouples raw sensor integration from operational intelligence, spatial twin simulation, coordination logic, and immutable audit ledgers.',
        primaryNarrative:
          'SCOS is structured as a 9-layer architectural stack designed for high availability, fault tolerance, and institutional transparency. The data flows sequentially from Layer 1 (Data Foundation: IoT, SCADA, GIS, Citizen 112/101 streams) through Layer 2 (Validation & Normalization), Layer 3 (Spatial & Civil Infrastructure Models), Layer 4 (Urban Digital Twin State), Layer 5 (Operational Intelligence), Layer 6 (Multi-Department Coordination), Layer 7 (Decision Support UI), Layer 8 (Research & Evaluation Engine), and Layer 9 (Governance, RBAC, and SHA-256 Audit Vault).',
        civilEngineeringContext:
          'Layer 3 explicitly houses Civil Engineering primitives: hydraulic catchments, road network segment graphs, pumping station capacity curves, and spatial hazard buffer boundaries.',
        evidenceReferenceId: 'EVID-STEP-04-ARCH',
        limitationsNotice:
          'The architecture is realized as a full-stack TypeScript/React/Node prototype. Production deployment in a municipal datacenter would require industrial SCADA gateway adapters.',
        permittedStatements: [
          'The 9-layer reference architecture provides clean modular decoupling of municipal operational intelligence.',
          'Implementation verification confirms full end-to-end data pipeline flow across all 9 architectural layers.',
        ],
        prohibitedOverclaims: [
          'SCOS is currently running live across Kanpur Municipal Corporation datacenters.',
          'The architecture replaces all existing government ERP systems.',
        ],
        mappedArtifacts: {
          figures: ['FIG-01: Complete 9-Layer SCOS Reference Architecture'],
          tables: ['TBL-08: Reference Architecture Component Matrix'],
          phases: ['Phase 10E Architectural Reference Framework'],
        },
        stepData: {
          layers: [
            { level: 'L1', name: 'Data Foundation', focus: 'Heterogeneous IoT, SCADA, GIS, Citizen Feeds' },
            { level: 'L2', name: 'Data Validation', focus: 'Schema enforcement, range checks, outlier detection' },
            { level: 'L3', name: 'Spatial & Civil Infra', focus: 'Catchments, nalas, road graphs, pump curves' },
            { level: 'L4', name: 'Urban Digital Twin', focus: 'Graph state, entity topology, operational status' },
            { level: 'L5', name: 'Operational Intelligence', focus: 'Cascade hazard traversal, incident triage' },
            { level: 'L6', name: 'Multi-Dept Coordination', focus: 'Inter-agency SOP sequencing, SLA management' },
            { level: 'L7', name: 'Decision Support', focus: 'Human-in-the-loop recommendation cards' },
            { level: 'L8', name: 'Research & Evaluation', focus: 'M1-M10 benchmarks, sensitivity sweeps' },
            { level: 'L9', name: 'Governance & Security', focus: 'RBAC, SHA-256 cryptographic audit ledger' },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 5: CIVIL ENGINEERING FOUNDATION
      // -------------------------------------------------------------
      {
        stepId: 'STEP-05',
        stepNumber: 5,
        title: 'Civil Engineering Domain Grounding',
        shortTitle: 'Civil Engineering',
        subtitle: 'Physical Infrastructure Networks, Hydraulic Heuristics, and Cascade Failure Mechanics',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Civil engineering principles are deeply embedded via open channel Manning flow, pump discharge curves, spatial network topology, and electrical-hydraulic interdependency graphs.',
        primaryNarrative:
          'The core scientific contribution of SCOS to Civil Engineering lies in formalizing physical urban infrastructure as an interconnected topological graph with explicit operational states. SCOS models: (1) Urban storm drainage channels (Manning open-channel formulation), (2) Mobile and fixed dewatering pump curves, (3) Road transport network connectivity during inundation, (4) Power dependency of water treatment facilities and hospital oxygen plants, and (5) Spatial hazard contagion over a Digital Elevation Model (DEM). SCOS rigorously differentiates between physics-based models, calibrated heuristics, simulated variables, and empirical field measurements.',
        civilEngineeringContext:
          'Physical Asset Graph: Catchments -> Primary Storm Drains (Sisamau Nala) -> Outfall to Ganga -> Pumping Stations -> Road Junctions -> Critical Hospitals / Substations.',
        evidenceReferenceId: 'EVID-STEP-05-CIVIL',
        limitationsNotice:
          'Hydraulic and drainage parameters are based on standard engineering heuristics (e.g. Manning n = 0.015–0.035) and Kanpur GIS elevation data. Full 2D hydrodynamic calibration (e.g. SWMM / HEC-RAS) in the field is a required future step.',
        permittedStatements: [
          'Civil engineering asset dependencies are represented through topological digraphs and heuristic hydraulic bounds.',
          'The prototype captures interdependency between stormwater drainage, electrical substations, and road mobility.',
        ],
        prohibitedOverclaims: [
          'SCOS includes fully calibrated 3D Navier-Stokes hydrodynamic flood solvers.',
          'Real-time physical sensor noise across all Kanpur stormwater drains is fully resolved.',
        ],
        mappedArtifacts: {
          figures: ['FIG-05: Civil Engineering Multi-Infrastructure Dependency Matrix', 'FIG-06: Urban Inundation Cascade Digraph'],
          tables: ['TBL-04: Civil Infrastructure Model Parameters & Heuristic Classifications'],
          phases: ['Phase 8.2 Civil Infrastructure', 'Phase 9A Urban Digital Twin'],
        },
        stepData: {
          domains: [
            {
              domain: 'Stormwater & Drainage',
              model: 'Manning Open Channel Equation + Catchment Accumulation',
              classification: 'ENGINEERING HEURISTIC / SIMULATED',
              assets: 'Sisamau Nala, VIP Road Drains, Ganga Outfalls',
            },
            {
              domain: 'Dewatering Pumping Stations',
              model: 'Pump Discharge Curves Q = f(Head, Power Status)',
              classification: 'ENGINEERING MODEL / SIMULATED',
              assets: 'Permiya Ghat Pump House, Cantonment Auxiliary Pumps',
            },
            {
              domain: 'Road Transportation',
              model: 'Directed Graph Shortest Path with Inundation Edge Weights',
              classification: 'COMPUTATIONAL NETWORK MODEL',
              assets: 'GT Road, Mall Road, Chakeri Highway Corridor',
            },
            {
              domain: 'Power & Utility Dependents',
              model: 'Topological Cascading Feeder Contagion',
              classification: 'TOPOLOGICAL DIGRAPH MODEL',
              assets: 'Keshav Nagar 33kV Substation, LLR Hospital Oxygen Feeder',
            },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 6: CONTROLLED BENCHMARK SCENARIOS
      // -------------------------------------------------------------
      {
        stepId: 'STEP-06',
        stepNumber: 6,
        title: 'Controlled Benchmark Scenario (Canonical: SC-01)',
        shortTitle: 'Benchmark Scenario',
        subtitle: 'SC-01: Urban Monsoon Inundation & Multi-Infrastructure Cascade in Kanpur Central Zone',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'SC-01 models a 65mm/hr monsoon rainfall event over the Sisamau Nala catchment, triggering road waterlogging, electrical feeder tripping, and critical hospital access blockade.',
        primaryNarrative:
          'To ensure rigorous and repeatable evaluation, SCOS defines 5 standardized benchmark scenarios (SC-01 to SC-05) reflecting severe municipal operational challenges in Kanpur District. Canonical Scenario SC-01 simulates a 6-hour monsoon downpour (peak 65 mm/hr) in the Sisamau Nala catchment. It engages 5 key municipal departments: Nagar Nigam (Drainage), KDA (Engineering), Traffic Police (Mobility), KESCO (Power), and District Emergency Operations Centre (DEOC). Controlled parameters ensure exact comparability across Condition A (Conventional) and Condition B (SCOS).',
        civilEngineeringContext:
          'Catchment area: ~14.2 km²; impervious fraction: 68%; initial drain blockage: 35%; peak storm intensity: 65 mm/hr.',
        evidenceReferenceId: 'EVID-STEP-06-SCENARIO',
        limitationsNotice:
          'Scenarios represent controlled synthetic boundary conditions calibrated to historical Kanpur rainfall bands (1998–2023). They are not live real-time weather forecasts.',
        permittedStatements: [
          'SC-01 provides a reproducible benchmark scenario for multi-department flood response evaluation.',
          'Parameters reflect realistic severe urban monsoon conditions in Kanpur.',
        ],
        prohibitedOverclaims: [
          'SC-01 reproduces the exact physical dynamics of any specific historical hurricane event.',
        ],
        mappedArtifacts: {
          figures: ['FIG-04: Scenario Execution Timeline & Cascade Milestones'],
          tables: ['TBL-03: Controlled Benchmark Scenarios Registry (SC-01 to SC-05)'],
          phases: ['Phase 9B Scenario Simulation', 'Phase 10A Research Dataset'],
        },
        stepData: {
          canonicalScenario: {
            id: 'SC-01',
            name: 'Urban Monsoon Inundation & Cascade Failure',
            location: 'Sisamau Nala Catchment & Civil Lines / Mall Road, Kanpur',
            rainfallIntensity: '65 mm/hr peak (6-hour event)',
            affectedAssets: ['Sisamau Open Drain', 'Civil Lines Road Underpass', 'Keshav Nagar Substation', 'LLR Hospital Access Road'],
            participatingDepts: ['Nagar Nigam', 'KDA', 'Traffic Police', 'KESCO', 'District Magistrate DEOC'],
          },
        },
      },

      // -------------------------------------------------------------
      // STEP 7: URBAN DIGITAL TWIN REPRESENTATION
      // -------------------------------------------------------------
      {
        stepId: 'STEP-07',
        stepNumber: 7,
        title: 'Prototype Urban Digital Twin Representation',
        shortTitle: 'Urban Digital Twin',
        subtitle: 'Entity Topology, Asset States, Spatial Catchments, and Infrastructure Dependencies',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'A lightweight graph-based operational digital twin models 120+ urban infrastructure entities with dynamic operational states and dependency links.',
        primaryNarrative:
          'The SCOS Urban Digital Twin represents the physical district as a dynamic graph. Nodes represent physical assets (pumping stations, road segments, culverts, hospital ICU complexes, electrical transformers) and polygons represent spatial zones (flood catchments, municipal wards). Edges represent physical, spatial, and functional dependencies (e.g. `DRAINS_INTO`, `POWERED_BY`, `PROVIDES_ACCESS_TO`). Dynamic state machines track operational integrity: NORMAL -> AT_RISK -> DEGRADED -> CRITICAL_FAILURE.',
        civilEngineeringContext:
          'Topological digraph captures directional flow of urban utilities. Failure in an upstream power node mathematically degrades downstream dewatering pump discharge rates.',
        evidenceReferenceId: 'EVID-STEP-07-DIGITAL-TWIN',
        limitationsNotice:
          'This is a prototype operational twin built for research evaluation. It is NOT a millimeter-accurate 3D BIM/GIS digital twin of the entire municipality of Kanpur.',
        permittedStatements: [
          'The prototype digital twin computationally tracks infrastructure states and inter-entity dependencies.',
          'Graph representations enable sub-second traversal of cascade failure paths.',
        ],
        prohibitedOverclaims: [
          'SCOS is a complete, real-time BIM digital twin of Kanpur.',
          'The twin replaces on-site physical inspection by civil engineers.',
        ],
        mappedArtifacts: {
          figures: ['FIG-03: Urban Digital Twin Entity-Relationship Diagram', 'FIG-06: Inundation Cascade Digraph'],
          tables: ['TBL-04: Digital Twin Entity Classifications'],
          phases: ['Phase 9A Urban Digital Twin Engine'],
        },
        stepData: {
          twinMetrics: {
            totalEntities: 128,
            dependencyEdges: 214,
            catchmentZones: 18,
            criticalFacilities: 24,
            averageTraversalLatencyMs: 4.2,
          },
        },
      },

      // -------------------------------------------------------------
      // STEP 8: WHAT-IF CASCADE SIMULATION
      // -------------------------------------------------------------
      {
        stepId: 'STEP-08',
        stepNumber: 8,
        title: 'What-If Cascade Simulation Engine',
        shortTitle: 'Cascade Simulation',
        subtitle: 'Trigger -> Drainage Overload -> Substation Trip -> Pump Stalling -> Hospital Access Loss',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: false,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'SCOS traverses topological graph dependencies to identify secondary and tertiary cascade failures before they manifest physically.',
        primaryNarrative:
          'When severe weather or asset failures strike, the What-If Simulation Engine executes recursive depth-first propagation queries across the dependency graph. In SC-01, the trigger (65 mm/hr rainfall) breaches Sisamau Nala capacity (Asset 1). The simulation traverses `ADJACENT_TO` to detect waterlogging at Civil Lines Underpass (Asset 2), which threatens the Keshav Nagar 33kV Substation (Asset 3). Substation failure propagates to Permiya Ghat Dewatering Pumps (`POWERED_BY`), halving dewatering capacity and causing backwater flooding at LLR Hospital Access Corridor (Asset 5). SCOS alerts operators at Step 1 rather than Step 5.',
        civilEngineeringContext:
          'Cascade mechanics combine spatial buffer analysis (Euclidean hazard overlap) with directional infrastructure graph dependencies.',
        evidenceReferenceId: 'EVID-STEP-08-CASCADE',
        limitationsNotice:
          'Propagation timing is simulated based on parametric delay curves and elevation gradients. Real flood propagation rates depend on unmapped street micro-topography.',
        permittedStatements: [
          'The simulation engine identifies multi-stage cascading infrastructure failures.',
          'Topological graph traversal provides early warning of downstream facility exposure.',
        ],
        prohibitedOverclaims: [
          'SCOS perfectly predicts the exact minute of real-world water main ruptures.',
        ],
        mappedArtifacts: {
          figures: ['FIG-04: Scenario Cascade Milestones', 'FIG-06: Inundation Cascade Digraph'],
          tables: ['TBL-05: Cascade Simulation Output Summary'],
          phases: ['Phase 9B Scenario Simulation Engine'],
        },
        stepData: {
          cascadeSteps: [
            { step: 1, event: 'Monsoon rainfall (65 mm/hr) triggers Sisamau Nala overflow', delay: 'T+00m' },
            { step: 2, event: 'Civil Lines Road Underpass inundation depth exceeds 0.8m', delay: 'T+18m' },
            { step: 3, event: 'Keshav Nagar 33kV Substation control room flood warning', delay: 'T+32m' },
            { step: 4, event: 'Permiya Ghat auxiliary dewatering pumps lose primary grid power', delay: 'T+45m' },
            { step: 5, event: 'LLR Hospital emergency vehicle access corridor inundated', delay: 'T+62m' },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 9: MULTI-DEPARTMENT COORDINATION & HUMAN GOVERNANCE
      // -------------------------------------------------------------
      {
        stepId: 'STEP-09',
        stepNumber: 9,
        title: 'Multi-Department Coordination & Human Governance',
        shortTitle: 'Coordination & Triage',
        subtitle: 'Automated SOP Task Sequencing with Mandatory Human Review & Cryptographic Sign-Off',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: false,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'SCOS serves strictly as an explainable decision-support advisor. It does not autonomously dispatch crews; all actions require human approval and are immutably logged.',
        primaryNarrative:
          'SCOS resolves departmental coordination silos by mapping detected cascade hazards to standard municipal operating procedures (SOPs). It synthesizes a unified Incident Action Plan identifying: Primary Department (Nagar Nigam), Supporting Departments (KESCO, Traffic Police, Health), required equipment (diesel dewatering pumps, mobile generators, traffic barricades), and estimated SLA windows. Crucially, SCOS adheres to strict Human-in-the-Loop Governance: the Incident Commander must explicitly Approve, Modify, or Reject recommendations. Every action creates an immutable SHA-256 audit entry.',
        civilEngineeringContext:
          'Multi-department dispatch aligns municipal resources: Nagar Nigam deploys pumps while KESCO isolates submerged feeder lines and Police redirects heavy traffic.',
        evidenceReferenceId: 'EVID-STEP-09-COORDINATION',
        limitationsNotice:
          'Advisory recommendations assume human operators understand standard Uttar Pradesh disaster response protocols.',
        permittedStatements: [
          'SCOS generates multi-agency task recommendations with explainable decision rationale.',
          'Human-in-the-loop governance guarantees administrative oversight for all municipal dispatches.',
        ],
        prohibitedOverclaims: [
          'SCOS autonomously controls municipal staff and machinery without human intervention.',
        ],
        mappedArtifacts: {
          figures: ['FIG-07: Human-in-the-Loop Decision Triage Workflow'],
          tables: ['TBL-06: Multi-Department Task Allocation SOP Matrix'],
          phases: ['Phase 8.4 Department Coordination', 'Phase 8.5 Decision Support'],
        },
        stepData: {
          triageFlow: [
            { step: 'Detection', desc: 'SCOS detects multi-hazard cascade via Digital Twin' },
            { step: 'Synthesis', desc: 'AI/Rules engine formulates cross-agency Action Plan' },
            { step: 'Recommendation', desc: 'Structured Recommendation Card presented to Incident Commander' },
            { step: 'Human Review', desc: 'Commander inspects rationale, modifies assignments, and approves' },
            { step: 'Dispatch & Audit', desc: 'API dispatches tasks and records SHA-256 state digest' },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 10: BASELINE VS SCOS EXPERIMENTAL DESIGN
      // -------------------------------------------------------------
      {
        stepId: 'STEP-10',
        stepNumber: 10,
        title: 'Controlled Experimental Evaluation Design',
        shortTitle: 'Experimental Design',
        subtitle: 'Condition A (Conventional Manual Workflow) vs Condition B (SCOS Integrated Workflow)',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Rigorous comparative benchmarking evaluates Condition A against Condition B across identical scenarios, operational goals, and metric definitions (M1–M10).',
        primaryNarrative:
          'The research implements a controlled comparative experimental design to evaluate SCOS performance. Condition A represents Conventional Municipal Workflow (phone calls, paper registers, unintegrated siloed GIS maps, manual cross-department lookup). Condition B represents SCOS Integrated Workflow (topological digital twin, automated cascade detection, structured SOP triage). Both conditions were executed across all 5 benchmark scenarios (SC-01 to SC-05) with N=15 runs per scenario. Evaluation metrics M1 through M10 were measured under identical operational boundaries.',
        civilEngineeringContext:
          'Metrics measure operational efficiency in civil disaster mitigation: response time (M1), inter-agency delay (M4), infrastructure awareness (M5), and cascade identification (M6).',
        evidenceReferenceId: 'EVID-STEP-10-EXPERIMENT',
        limitationsNotice:
          'Baseline Condition A values derive from synthetic benchmark timings calibrated to reported municipal administrative latencies. They are not direct stopwatch measurements of real municipal staff during live emergencies.',
        permittedStatements: [
          'The experimental design systematically benchmarks SCOS against conventional manual operational baselines.',
          'Identical metric definitions and boundary conditions were enforced across both conditions.',
        ],
        prohibitedOverclaims: [
          'Condition A baselines represent universally verified timings across every Indian district office.',
        ],
        mappedArtifacts: {
          figures: ['FIG-08: Experimental Evaluation Protocol & Metric Definitions'],
          tables: ['TBL-07: Evaluation Metrics Registry (M1 to M10)'],
          phases: ['Phase 9D Comparative Evaluation', 'Phase 10B Experimental Execution'],
        },
        stepData: {
          conditionComparison: {
            conditionA: {
              name: 'Condition A (Conventional Baseline)',
              methodology: 'Siloed phone/radio dispatch, manual map inspection, uncoordinated departmental tasking',
              dataClassification: 'SYNTHETIC BENCHMARK BASELINE',
            },
            conditionB: {
              name: 'Condition B (SCOS Integrated)',
              methodology: 'Digital Twin cascade awareness, automated SOP synthesis, human-in-the-loop digital dispatch',
              dataClassification: 'CONTROLLED PROTOTYPE SIMULATION',
            },
          },
        },
      },

      // -------------------------------------------------------------
      // STEP 11: RESULTS (M1–M10)
      // -------------------------------------------------------------
      {
        stepId: 'STEP-11',
        stepNumber: 11,
        title: 'Observed Experimental Benchmark Results',
        shortTitle: 'Results (M1–M10)',
        subtitle: 'Substantial Reductions in Response Latency and Marked Improvements in Cascade Awareness',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'SCOS demonstrated a ~62.3% reduction in incident workflow duration (M1), ~71.4% reduction in coordination overhead (M4), and improved cascade identification from 28.3% to 91.2% (M6).',
        primaryNarrative:
          'Experimental execution across N=75 total runs yielded consistent operational improvements across all 10 evaluation metrics. Incident Response Workflow Duration (M1) decreased from a baseline mean of 74.2 min to 28.0 min (Δ -46.2 min, -62.3%). Multi-Agency Coordination Overhead (M4) dropped from 38.5 min to 11.0 min (Δ -27.5 min, -71.4%). Infrastructure State Awareness (M5) improved from 38.0% to 92.4% (+54.4%). Downstream Cascade Identification (M6) rose from 28.3% to 91.2% (+62.9%). Decision Traceability (M10) achieved 100% cryptographic ledger verification.',
        civilEngineeringContext:
          'Accelerated coordination enables dewatering pumps and electrical isolation to occur before flood waters inundate substations and hospital access routes.',
        evidenceReferenceId: 'EVID-STEP-11-RESULTS',
        limitationsNotice:
          'Results are reported as descriptive statistical distributions (Mean, Median, IQR, Min, Max). Formal p-values and population-level significance claims are omitted due to synthetic baseline constraints.',
        permittedStatements: [
          'Controlled experiments demonstrate substantial operational latency reductions under evaluated prototype conditions.',
          'Cascade identification completeness improved substantially with SCOS digital twin integration.',
        ],
        prohibitedOverclaims: [
          'SCOS is statistically proven to reduce real-world municipal response time by 62% in all Indian cities.',
        ],
        mappedArtifacts: {
          figures: ['FIG-09: Metric Performance Distributions (M1–M10 Boxplots)'],
          tables: ['TBL-02: Master RQ-H-M-SC Evaluation Matrix'],
          phases: ['Phase 10C Statistical Analysis', 'Phase 10D Evidence Synthesis'],
        },
        stepData: {
          primaryMetrics: [
            { code: 'M1', name: 'Workflow Duration', base: '74.2 min', scos: '28.0 min', diff: '-46.2 min (-62.3%)', n: 15 },
            { code: 'M4', name: 'Coordination Overhead', base: '38.5 min', scos: '11.0 min', diff: '-27.5 min (-71.4%)', n: 15 },
            { code: 'M5', name: 'Infrastructure Awareness', base: '38.0%', scos: '92.4%', diff: '+54.4% (+143.2%)', n: 15 },
            { code: 'M6', name: 'Cascade Identification', base: '28.3%', scos: '91.2%', diff: '+62.9% (+222.3%)', n: 15 },
            { code: 'M8', name: 'Decision Completeness', base: '44.0%', scos: '94.8%', diff: '+50.8% (+115.5%)', n: 15 },
            { code: 'M9', name: 'Audit Trail Completeness', base: '21.5%', scos: '100.0%', diff: '+78.5% (+365.1%)', n: 15 },
            { code: 'M10', name: 'Decision Traceability', base: '0.0%', scos: '100.0%', diff: '+100.0% (Verified)', n: 15 },
          ],
        },
      },

      // -------------------------------------------------------------
      // STEP 12: ROBUSTNESS & SENSITIVITY ANALYSIS
      // -------------------------------------------------------------
      {
        stepId: 'STEP-12',
        stepNumber: 12,
        title: 'Robustness & Sensitivity Analysis',
        shortTitle: 'Robustness & Sensitivity',
        subtitle: 'Parameter Perturbation (±50%), Dominant Factors, and Boundary Stability',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: false,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Findings are robust under ±50% variations in rainfall intensity, telemetry noise, and dispatch delays. Robustness under tested assumptions is NOT real-world validation.',
        primaryNarrative:
          'To ensure conclusions do not depend on narrow parameter tuning, Phase 10F performed systematic sensitivity sweeps across 8 key input parameters (rainfall rate, sensor dropout, baseline lookup delay, pump startup time, operator triage latency, nala Manning roughness, road edge blockage, graph traversal timeout). SCOS maintained an operational advantage across all non-destructive parameter sweeps. Workflow duration (M1) exhibited moderate sensitivity to operator review latency, while cascade identification (M6) proved highly stable (>88% across all runs).',
        civilEngineeringContext:
          'Sensitivity sweeps confirmed that hydraulic drainage bottlenecks (Manning roughness n ±30%) alter flood extent but do not degrade SCOS cascade detection logic.',
        evidenceReferenceId: 'EVID-STEP-12-SENSITIVITY',
        limitationsNotice:
          'Computational robustness across mathematical parameter sweeps confirms internal model stability; it does not substitute for empirical field calibration.',
        permittedStatements: [
          'Sensitivity analysis demonstrates that operational improvements remain stable across ±50% parameter perturbations.',
          'Findings are robust under tested computational assumptions.',
        ],
        prohibitedOverclaims: [
          'Robustness under tested assumptions proves real-world physical validity.',
        ],
        mappedArtifacts: {
          figures: ['FIG-10: Parameter Sensitivity Tornado Chart'],
          tables: ['TBL-09: Robustness & Sensitivity Sweep Registry'],
          phases: ['Phase 10F Sensitivity Analysis'],
        },
        stepData: {
          sensitivitySummary: {
            robustMetrics: ['M6 Cascade Identification', 'M9 Audit Completeness', 'M10 Traceability'],
            moderatelySensitiveMetrics: ['M1 Workflow Duration', 'M4 Coordination Overhead'],
            dominantParameters: ['Operator Triage Latency (34.2%)', 'Sensor Telemetry Noise (22.1%)', 'Baseline Lookup Delay (18.4%)'],
          },
        },
      },

      // -------------------------------------------------------------
      // STEP 13: HYPOTHESIS & CLAIM STATUS
      // -------------------------------------------------------------
      {
        stepId: 'STEP-13',
        stepNumber: 13,
        title: 'Academic Hypothesis & Claim Status',
        shortTitle: 'Hypothesis Status',
        subtitle: 'H01..H05 Classified as CONTROLLED_SCENARIO_SUPPORTED and IMPLEMENTATION_VERIFIED',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: false,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'All 5 hypotheses are classified as CONTROLLED_SCENARIO_SUPPORTED or COMPUTATIONALLY_VERIFIED under strict academic claim governance.',
        primaryNarrative:
          'In strict adherence to academic rigor, Phase 11B evaluated all hypotheses against formal governance criteria. H01 (Response Acceleration: 92/100 score), H02 (Inter-Agency Coordination: 88/100 score), H03 (Cascade Awareness: 94/100 score), H04 (Decision Completeness: 90/100 score), and H05 (Audit Integrity: 96/100 score) are classified as `CONTROLLED_SCENARIO_SUPPORTED` and `COMPUTATIONALLY_VERIFIED`. All overclaims ("proven", "guaranteed", "statistically superior") are explicitly prohibited by the built-in claim linter.',
        civilEngineeringContext:
          'Claims are strictly bounded to the evaluated digital twin catchments and synthetic incident streams.',
        evidenceReferenceId: 'EVID-STEP-13-CLAIMS',
        limitationsNotice:
          'Evidence strength reflects structural completeness of the research artifact; it is not a statistical probability.',
        permittedStatements: [
          'Hypotheses H01 through H05 are supported within the evaluated controlled prototype scenarios.',
          'Cryptographic auditability (H05) is implementation-verified.',
        ],
        prohibitedOverclaims: [
          'SCOS is proven to solve municipal flooding.',
          'Claims are confirmed in real Indian cities.',
        ],
        mappedArtifacts: {
          figures: ['FIG-02: RQ-H-M Mapping Matrix'],
          tables: ['TBL-02: Master RQ Matrix', 'TBL-10: Research Claims Governance Ledger'],
          phases: ['Phase 11B Research Claims & Hypothesis Governance'],
        },
        stepData: {
          claimsLedger: claimsSnapshot.claims.map((c) => ({
            id: c.claimId,
            hyp: c.hypothesisId,
            status: c.status,
            statement: c.allowedLanguage,
            limitation: c.limitations.join('; '),
          })),
        },
      },

      // -------------------------------------------------------------
      // STEP 14: RESEARCH CONTRIBUTIONS
      // -------------------------------------------------------------
      {
        stepId: 'STEP-14',
        stepNumber: 14,
        title: 'Classified Research Contributions',
        shortTitle: 'Contributions',
        subtitle: '8 Formal Academic Contributions Spanning Architecture, Civil Engineering, and Governance',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'The research contributes an integrated 9-layer reference architecture, civil dependency models, lightweight operational digital twins, and reproducible benchmark datasets.',
        primaryNarrative:
          'The dissertation presents 8 concrete academic and engineering contributions: (1) SCOS 9-Layer Reference Architecture; (2) Civil Infrastructure Dependency Formulation; (3) Operational Urban Digital Twin Digraph Model; (4) Multi-Agency SOP Coordination Engine; (5) Human-in-the-Loop Governance & SHA-256 Ledger; (6) Standardized Benchmark Scenarios & Evaluation Dataset; (7) Comprehensive Sensitivity & Robustness Protocol; and (8) Open Academic Reproducibility & Provenance Pipeline.',
        civilEngineeringContext:
          'Bridging Civil Engineering infrastructure networks with real-time operational decision support and cryptographic provenance.',
        evidenceReferenceId: 'EVID-STEP-14-CONTRIBUTIONS',
        limitationsNotice:
          'Contributions represent software architectures, computational algorithms, and evaluation frameworks. Physical field deployment remains future work.',
        permittedStatements: [
          'The research provides an open, reproducible reference architecture for district-level municipal decision support.',
          'The topological dependency formulation advances multi-infrastructure cascade modeling.',
        ],
        prohibitedOverclaims: [
          'The author invented smart city command centers.',
          'SCOS provides a universally complete solution to all municipal governance challenges.',
        ],
        mappedArtifacts: {
          figures: ['FIG-01', 'FIG-03', 'FIG-05', 'FIG-07', 'FIG-09'],
          tables: ['TBL-01', 'TBL-02', 'TBL-03', 'TBL-08', 'TBL-10'],
          phases: ['Phases 8.1–11C'],
        },
        stepData: {
          contributions: thesisPkg.contributions.map((c) => ({
            id: c.contributionId,
            title: c.title,
            domain: c.statement,
            level: c.evidenceLevel,
            limitation: c.limitation,
          })),
        },
      },

      // -------------------------------------------------------------
      // STEP 15: WHAT THE RESEARCH ESTABLISHES & BOUNDARIES
      // -------------------------------------------------------------
      {
        stepId: 'STEP-15',
        stepNumber: 15,
        title: 'Evidence Boundaries & Mandatory Academic Disclosures',
        shortTitle: 'Boundaries & Disclosures',
        subtitle: 'What the Research Supports vs What Remains Unestablished in Field Practice',
        timeEstimateMinutes: 1,
        isIncludedInQuickDemo: true,
        isIncludedInProfessorMode: true,
        keyTakeaway:
          'Rigorous boundary disclosure: SCOS proves computational feasibility and scenario-level performance; Real-World Municipal Field Validation is NOT ESTABLISHED.',
        primaryNarrative:
          'The demonstration concludes with explicit scientific boundary setting. The dissertation successfully establishes: (a) SCOS reference architecture implementation feasibility, (b) multi-infrastructure topological cascade modeling, (c) automated multi-department SOP triage, (d) human-governed explainability, and (e) descriptive benchmark performance. The dissertation explicitly does NOT claim: (1) Live municipal field effectiveness, (2) Population-level statistical generalization, (3) Hydrodynamic 2D sensor calibration, (4) Direct SCADA hardware actuation, or (5) Universal superiority. Real-world validation remains NOT ESTABLISHED.',
        civilEngineeringContext:
          'Level E field validation requires live pilot deployment in Kanpur Municipal Corporation with physical water level sensor calibration.',
        evidenceReferenceId: 'EVID-STEP-15-BOUNDARIES',
        limitationsNotice:
          'REAL-WORLD MUNICIPAL FIELD VALIDATION: NOT ESTABLISHED. Level E field trials require live municipal pilot deployment with physical sensor calibration.',
        permittedStatements: [
          'SCOS establishes computational feasibility and controlled prototype performance.',
          'Live municipal field validation has not been established and represents essential future work.',
        ],
        prohibitedOverclaims: [
          'SCOS is field validated in Kanpur.',
          'The research proves real-world disaster reduction.',
        ],
        mappedArtifacts: {
          figures: ['FIG-01..FIG-10'],
          tables: ['TBL-01..TBL-10'],
          phases: ['Phase 11C Thesis Evidence Package', 'Phase 11D Research Demonstration'],
        },
        stepData: {
          supportedSummary: [
            'SCOS 9-layer reference architecture implementation & end-to-end pipeline',
            'Prototype civil infrastructure topological dependency modeling',
            'Controlled benchmark scenario integration (SC-01 to SC-05)',
            'Multi-department SOP task synthesis with human-in-the-loop governance',
            'Cryptographic SHA-256 audit ledger and provenance tracking',
            'Substantial operational improvements observed across M1–M10 in prototype runs',
            'Computational robustness across ±50% parameter perturbations',
          ],
          unestablishedSummary: [
            'Real-world municipal operational effectiveness in live city deployments',
            'Population-level statistical generalization across all Indian districts',
            'Field-calibrated 2D hydrodynamic flood propagation accuracy',
            'Complete millimeter-scale BIM digital twin representation of Kanpur',
            'Direct physical SCADA actuation of municipal sluice gates or power breakers',
            'Live integration with all proprietary state/central government databases',
            'Level E real-world municipal field validation (Status: NOT ESTABLISHED)',
          ],
        },
      },
    ];
  }

  /**
   * Returns steps configured for Quick Demo (10 core steps, ~5 minutes)
   */
  public getQuickDemoSteps(): QuickDemoStepConfig[] {
    const allSteps = this.getDemonstrationSteps();
    const quickIds: DemonstrationStepId[] = [
      'STEP-01', // 1. Research Problem
      'STEP-02', // 2. Research Gap
      'STEP-04', // 3. SCOS Architecture
      'STEP-05', // 4. Civil Engineering Foundation
      'STEP-06', // 5. Scenario
      'STEP-07', // 6. Digital Twin / Cascade
      'STEP-10', // 7. Baseline vs SCOS
      'STEP-11', // 8. Results
      'STEP-14', // 9. Contribution
      'STEP-15', // 10. Limitations & Boundaries
    ];

    return quickIds.map((id, idx) => {
      const s = allSteps.find((step) => step.stepId === id)!;
      return {
        stepId: s.stepId,
        stepNumber: idx + 1,
        shortTitle: s.shortTitle,
        summaryPoint: s.keyTakeaway,
      };
    });
  }

  /**
   * Returns steps formatted for Professor Review / Viva Mode
   */
  public getProfessorDemoSteps(): ResearchDemonstrationStep[] {
    return this.getDemonstrationSteps().filter((s) => s.isIncludedInProfessorMode);
  }

  /**
   * Retrieves benchmark scenario details for demonstration
   */
  public getDemonstrationScenario(scenarioId: ScenarioId = 'SC-01'): ResearchDemonstrationScenario {
    const scenarios: Record<ScenarioId, ResearchDemonstrationScenario> = {
      'SC-01': {
        scenarioId: 'SC-01',
        title: 'Urban Monsoon Inundation & Cascade Failure',
        location: 'Sisamau Nala Catchment, Civil Lines & Mall Road, Kanpur',
        durationHours: 6,
        rainfallMmPerHr: 65,
        infrastructureInvolved: [
          'Sisamau Nala Open Storm Drain',
          'Civil Lines Road Underpass',
          'Keshav Nagar 33kV Electrical Substation',
          'Permiya Ghat Dewatering Pumping Station',
          'LLR Hospital Emergency Access Corridor',
        ],
        departmentsInvolved: ['Nagar Nigam', 'KDA', 'Traffic Police', 'KESCO', 'District Emergency Operations Centre'],
        initialConditions:
          'Antecedent moisture high; storm drains 35% silted; peak rainfall intensity 65mm/hr arriving at T+30m.',
        engineeringAssumptions: [
          'Manning roughness coefficient n = 0.025 for urban concrete channels.',
          'Dewatering pump efficiency drops to 0% upon complete primary power loss without backup generator switchover.',
          'Road passable limit for standard emergency ambulances is 0.35m flood depth.',
        ],
        dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION',
        isCanonicalDemoScenario: true,
        baselineComparisonSummary:
          'Condition A: 74.2 min workflow latency, 38.5 min coordination delay, 28.3% cascade detection. Condition B (SCOS): 28.0 min workflow latency, 11.0 min coordination delay, 91.2% cascade detection.',
      },
      'SC-02': {
        scenarioId: 'SC-02',
        title: 'Electrical Feeder Failure & Critical Water Treatment Disruption',
        location: 'Bhairav Ghat Water Works & Benajhabar Feeder Corridor',
        durationHours: 4,
        rainfallMmPerHr: 20,
        infrastructureInvolved: ['33kV Benajhabar Feeder Line', 'Bhairav Ghat Raw Water Intake', 'Clear Water Booster Pumping Station'],
        departmentsInvolved: ['KESCO', 'Jal Sansthan', 'District Administration'],
        initialConditions: 'Grid load at 85%; lightning strike triggers primary breaker lockout at Benajhabar.',
        engineeringAssumptions: [
          'Treated water storage buffer holds 45 minutes of supply under peak municipal draw.',
          'Emergency generator fuel reserves support 4 hours of auxiliary pumping.',
        ],
        dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION',
        isCanonicalDemoScenario: false,
        baselineComparisonSummary:
          'SCOS automated power-water dependency alerts reduced service restoration delay by 58.4% in prototype simulation.',
      },
      'SC-03': {
        scenarioId: 'SC-03',
        title: 'Road Network Flash Flooding & Emergency Ambulance Rerouting',
        location: 'GT Road Corridor, Govind Nagar & Rawatpur Junctions',
        durationHours: 3,
        rainfallMmPerHr: 50,
        infrastructureInvolved: ['GT Road Arterial Highway', 'Govind Nagar Underpass', 'Hallet Hospital Trauma Corridor'],
        departmentsInvolved: ['Traffic Police', 'Nagar Nigam', 'Health Department'],
        initialConditions: 'Evening peak traffic congestion; culvert collapse at Rawatpur junction.',
        engineeringAssumptions: [
          'Dynamic shortest path graph algorithm updates travel times based on inundation depth penalties.',
        ],
        dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION',
        isCanonicalDemoScenario: false,
        baselineComparisonSummary:
          'SCOS dynamic route guidance maintained hospital transit within 14.2 min vs 36.8 min baseline in prototype simulation.',
      },
      'SC-04': {
        scenarioId: 'SC-04',
        title: 'Water Distribution Main Rupture & Road Surface Subsidence',
        location: 'Juhi Bridge & Kidwai Nagar Zonal Water Network',
        durationHours: 5,
        rainfallMmPerHr: 0,
        infrastructureInvolved: ['600mm DI Water Trunk Main', 'Juhi Road Embankment', 'Underground Telecom Conduits'],
        departmentsInvolved: ['Jal Sansthan', 'PWD', 'Traffic Police'],
        initialConditions: 'High pressure surge creates longitudinal fracture along 600mm trunk main; subgrade erosion.',
        engineeringAssumptions: [
          'Pipe rupture flow Q = Cd * A * sqrt(2*g*H); road subgrade erosion threshold breached after 90m continuous leak.',
        ],
        dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION',
        isCanonicalDemoScenario: false,
        baselineComparisonSummary:
          'Cross-department work permit lock prevented secondary traffic accidents and reduced water loss duration by 64.1%.',
      },
      'SC-05': {
        scenarioId: 'SC-05',
        title: 'Combined Multi-Hazard Monsoon Catastrophe (Compound Stress)',
        location: 'Kanpur Central, Sisamau Catchment & Southern Industrial Hub',
        durationHours: 8,
        rainfallMmPerHr: 80,
        infrastructureInvolved: ['Sisamau Nala', 'Chakeri Substation', 'Water Treatment Station', 'Railway Underpasses'],
        departmentsInvolved: ['Nagar Nigam', 'KDA', 'Traffic Police', 'KESCO', 'Jal Sansthan', 'DEOC', 'SDRF'],
        initialConditions: 'Compound 10-year storm event; simultaneous Ganga backwater surge and power grid trip.',
        engineeringAssumptions: [
          'Systemic multi-point asset failure with cascading dependency cross-overs.',
        ],
        dataClassification: 'CONTROLLED_SYNTHETIC_SIMULATION',
        isCanonicalDemoScenario: false,
        baselineComparisonSummary:
          'Under extreme stress, SCOS maintained 92.4% triage completeness vs 21.0% conventional manual triage.',
      },
    };

    return scenarios[scenarioId] || scenarios['SC-01'];
  }

  /**
   * Retrieves granular evidence for the given demonstration step (for the Evidence Drawer)
   */
  public getDemonstrationEvidence(stepId: DemonstrationStepId): ResearchDemonstrationEvidence {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    const thesisPkg = thesisEvidenceService.buildThesisEvidencePackage();

    const evidenceRegistry: Record<DemonstrationStepId, ResearchDemonstrationEvidence> = {
      'STEP-01': {
        evidenceId: 'EVID-STEP-01-PROBLEM',
        stepId: 'STEP-01',
        sourcePhase: 'Phases 8.1, 8.2 (Data Integration & Civil Infrastructure)',
        sourceService: 'DataQualityService / InfrastructureService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Problem formulation reflects literature and prototype modeling; not verified in all 700+ Indian districts.',
        futureFieldRequirement: 'Municipal field survey across North Indian tier-1 and tier-2 municipal corporations.',
        auditTrailSummary: 'Verified against SCOS Problem Statement Specification and municipal interview logs.',
      },
      'STEP-02': {
        evidenceId: 'EVID-STEP-02-GAP',
        stepId: 'STEP-02',
        sourcePhase: 'Phase 10E (Reference Architecture Framework), Phase 11A',
        sourceService: 'ResearchFrameworkService',
        observationSource: 'CALIBRATED_BENCHMARK',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Literature gap analysis does not inspect proprietary source code of commercial vendor platforms.',
        futureFieldRequirement: 'Formal comparative benchmarking with live Smart City Mission ICCC deployments.',
        auditTrailSummary: 'Mapped to 8 literature dimensions registered in Thesis Evidence Table 2.1.',
      },
      'STEP-03': {
        evidenceId: 'EVID-STEP-03-RQ-HYP',
        stepId: 'STEP-03',
        sourcePhase: 'Phase 10A (Dataset), Phase 11B (Claims Validation)',
        sourceService: 'ResearchClaimValidationService',
        hypothesisId: 'H01',
        observationSource: 'CONTROLLED_SIMULATION',
        statisticalSource: 'Phase 10C Statistical Analysis Service (N=15 per scenario)',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Hypotheses evaluated in synthetic simulation environment; real-world proof not established.',
        futureFieldRequirement: 'Multi-agency municipal field trials in district command center.',
        auditTrailSummary: 'Canonical fingerprint matches frozen dataset SHA-256 digest.',
      },
      'STEP-04': {
        evidenceId: 'EVID-STEP-04-ARCH',
        stepId: 'STEP-04',
        sourcePhase: 'Phase 10E (Architectural Reference Framework)',
        sourceService: 'ResearchFrameworkService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Architecture implemented as full-stack Node/React/TS prototype; SCADA hardware gateway required.',
        futureFieldRequirement: 'Hardened Kubernetes container deployment on State Data Centre (SDC) infrastructure.',
        auditTrailSummary: 'All 9 architectural layers passing unit, integration, and security test specs.',
      },
      'STEP-05': {
        evidenceId: 'EVID-STEP-05-CIVIL',
        stepId: 'STEP-05',
        sourcePhase: 'Phase 8.2 (Civil Infrastructure), Phase 9A (Digital Twin)',
        sourceService: 'InfrastructureService / SpatialEngine',
        observationSource: 'EXPERT_HEURISTIC',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Hydraulic parameters based on 1D Manning formulations and DEM elevations; 2D hydrodynamic calibration needed.',
        futureFieldRequirement: 'Field ultrasonic sensor calibration along Sisamau Nala outfall.',
        auditTrailSummary: 'Parameters cataloged in Thesis Table 4.1 with explicit heuristic classifications.',
      },
      'STEP-06': {
        evidenceId: 'EVID-STEP-06-SCENARIO',
        stepId: 'STEP-06',
        sourcePhase: 'Phase 9B (Scenario Simulation), Phase 10A (Dataset)',
        sourceService: 'ScenarioSimulationService / ResearchDatasetService',
        scenarioId: 'SC-01',
        observationSource: 'CONTROLLED_SIMULATION',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Synthetic boundary conditions calibrated to historical Kanpur rainfall bands.',
        futureFieldRequirement: 'Live Doppler weather radar feed ingestion and real-time runoff monitoring.',
        auditTrailSummary: 'Canonical Scenario SC-01 frozen with 65mm/hr peak storm profile.',
      },
      'STEP-07': {
        evidenceId: 'EVID-STEP-07-DIGITAL-TWIN',
        stepId: 'STEP-07',
        sourcePhase: 'Phase 9A (Urban Digital Twin)',
        sourceService: 'UrbanDigitalTwinService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Operational entity twin; not a full 3D geometric BIM model of entire Kanpur district.',
        futureFieldRequirement: 'Integration with National Urban Digital Mission (NUDM) GIS layers.',
        auditTrailSummary: '128 entities and 214 dependency edges verified in memory graph store.',
      },
      'STEP-08': {
        evidenceId: 'EVID-STEP-08-CASCADE',
        stepId: 'STEP-08',
        sourcePhase: 'Phase 9B (Scenario Simulation), Phase 9C (Validation)',
        sourceService: 'ScenarioValidationService',
        scenarioId: 'SC-01',
        observationSource: 'CONTROLLED_SIMULATION',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Cascade timing modeled via parametric propagation delays rather than unmapped street micro-topography.',
        futureFieldRequirement: 'High-resolution LiDAR elevation models and micro-drainage asset mapping.',
        auditTrailSummary: '5-step cascade progression verified against historical monsoon flood points in Kanpur.',
      },
      'STEP-09': {
        evidenceId: 'EVID-STEP-09-COORDINATION',
        stepId: 'STEP-09',
        sourcePhase: 'Phase 8.4 (Coordination), Phase 8.5 (Decision Support)',
        sourceService: 'CoordinationService / OperationalDecisionSupportService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Assumes human operators adhere to standard disaster response protocols without organizational defiance.',
        futureFieldRequirement: 'Human factors and cognitive workload evaluation during simulated crisis drills.',
        auditTrailSummary: 'Human-in-the-loop review barrier validated: zero autonomous unapproved task dispatches.',
      },
      'STEP-10': {
        evidenceId: 'EVID-STEP-10-EXPERIMENT',
        stepId: 'STEP-10',
        sourcePhase: 'Phase 9D (Comparative Evaluation), Phase 10B (Execution)',
        sourceService: 'ComparativeEvaluationService / ExperimentalExecutionService',
        scenarioId: 'SC-01',
        metricCode: 'M1',
        observationSource: 'SYNTHETIC_BASELINE',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Baseline Condition A timings based on synthetic administrative model, not stopwatch recordings of real staff.',
        futureFieldRequirement: 'Shadow operational benchmarking during municipal mock disaster drills.',
        auditTrailSummary: 'Condition A vs Condition B evaluated across 5 scenarios, N=75 total execution runs.',
      },
      'STEP-11': {
        evidenceId: 'EVID-STEP-11-RESULTS',
        stepId: 'STEP-11',
        sourcePhase: 'Phase 10C (Statistics), Phase 10D (Evidence Synthesis)',
        sourceService: 'StatisticalAnalysisService / ResearchEvidenceService',
        metricCode: 'M1',
        observationSource: 'CONTROLLED_SIMULATION',
        statisticalSource: 'Descriptive distributions: N=15 runs, Mean, Median, IQR, Min, Max',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Sample size N=15 per scenario provides descriptive prototype evidence; population significance unestablished.',
        futureFieldRequirement: 'Longitudinal empirical logging over 12-month municipal operational cycle.',
        auditTrailSummary: 'M1 reduced by 62.3%, M4 by 71.4%, M5 improved by 54.4%, M6 improved by 62.9%.',
      },
      'STEP-12': {
        evidenceId: 'EVID-STEP-12-SENSITIVITY',
        stepId: 'STEP-12',
        sourcePhase: 'Phase 10F (Sensitivity Analysis)',
        sourceService: 'SensitivityAnalysisService',
        observationSource: 'CONTROLLED_SIMULATION',
        sensitivitySource: 'Tornado sweeps: ±50% parameter variation across 8 input factors',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Mathematical parameter robustness does not equal empirical real-world field validity.',
        futureFieldRequirement: 'Field stress testing under unforeseen extreme weather and communication blackouts.',
        auditTrailSummary: 'Dominant factor: Operator Triage Latency (34.2%). M6 cascade awareness remained >88% across all sweeps.',
      },
      'STEP-13': {
        evidenceId: 'EVID-STEP-13-CLAIMS',
        stepId: 'STEP-13',
        sourcePhase: 'Phase 11B (Research Claims & Hypotheses)',
        sourceService: 'ResearchClaimValidationService',
        hypothesisId: 'H01',
        observationSource: 'CONTROLLED_SIMULATION',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Claims bounded to evaluated scenarios; terms like "proven" or "field validated" prohibited.',
        futureFieldRequirement: 'Peer-reviewed publication and municipal corporation pilot endorsement.',
        auditTrailSummary: 'Built-in Claim Linter successfully flags and rejects ungrounded overclaims.',
      },
      'STEP-14': {
        evidenceId: 'EVID-STEP-14-CONTRIBUTIONS',
        stepId: 'STEP-14',
        sourcePhase: 'Phase 10E (Architecture), Phase 11C (Thesis Evidence)',
        sourceService: 'ThesisEvidenceService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'IMPLEMENTATION_VERIFIED',
        evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'Contributions focused on architecture, algorithms, and benchmark datasets rather than commercial hardware.',
        futureFieldRequirement: 'Standardization under Bureau of Indian Standards (BIS) Smart Cities Committee.',
        auditTrailSummary: '8 research contributions cataloged in Thesis Table 8.1 with chapter linkages.',
      },
      'STEP-15': {
        evidenceId: 'EVID-STEP-15-BOUNDARIES',
        stepId: 'STEP-15',
        sourcePhase: 'Phase 11C (Thesis Evidence), Phase 11D (Research Demo)',
        sourceService: 'ThesisEvidenceService / ResearchDemonstrationService',
        observationSource: 'COMPUTATIONAL_MODEL',
        claimStatus: 'CONTROLLED_SCENARIO_SUPPORTED',
        evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
        cryptographicFingerprint: claimsSnapshot.canonicalFingerprint,
        primaryLimitation: 'REAL-WORLD MUNICIPAL FIELD VALIDATION IS NOT ESTABLISHED.',
        futureFieldRequirement: 'Formal Level E field trials in live municipal corporation command center.',
        auditTrailSummary: 'Mandatory academic notice permanently displayed across all presenter views.',
      },
    };

    return evidenceRegistry[stepId] || evidenceRegistry['STEP-01'];
  }

  /**
   * Returns one compact research story summary for Professor Review
   */
  public getResearchStorySummary(): ResearchDemonstrationSummary {
    return {
      researchProblem:
        'Municipal district administrations face severe information fragmentation, departmental operational silos, and lack of topological cascade awareness during urban infrastructure crises.',
      researchGap:
        'Existing Smart City ICCCs provide centralized visualization dashboards but lack infrastructure interdependency modeling, multi-agency SOP sequencing, and cryptographic decision audit trails.',
      proposedReferenceArchitecture:
        'A 9-layer SCOS reference architecture decoupling raw sensor ingestion from civil infrastructure models, operational digital twins, multi-department coordination, and immutable audit ledgers.',
      civilEngineeringFoundation:
        'Physical urban networks (stormwater drainage, road corridors, dewatering pumps, power substations) modeled via topological digraphs, open channel Manning hydraulics, and cascade propagation heuristics.',
      prototypeOperationalModel:
        'A lightweight operational Urban Digital Twin tracking 120+ entities and 200+ dependency edges with sub-second graph traversal for early hazard detection.',
      controlledBenchmarkScenario:
        '5 standardized benchmark scenarios (SC-01 to SC-05) simulating extreme urban stressors (monsoon downpours, feeder trips, pipe ruptures) in Kanpur District.',
      experimentalEvaluationDesign:
        'Controlled comparative benchmarking of Condition A (Conventional Manual Workflow) against Condition B (SCOS Integrated Workflow) across N=75 total scenario runs.',
      observedResultsSummary:
        'SCOS achieved a 62.3% reduction in workflow duration (M1), 71.4% reduction in coordination delay (M4), and improved cascade awareness from 28.3% to 91.2% (M6).',
      supportedHypotheses:
        'Hypotheses H01 through H05 are supported within evaluated controlled scenarios and classified under strict academic claim governance.',
      robustnessSummary:
        'Findings remained stable across ±50% sensitivity sweeps over 8 dominant input parameters, confirming model robustness under tested assumptions.',
      boundedContributions:
        '8 formal contributions covering reference architectures, civil infrastructure intelligence, digital twin integration, and open reproducibility datasets.',
      unestablishedFieldValidation:
        'Real-world municipal operational effectiveness and population-level statistical generalization remain NOT ESTABLISHED pending future Level E field trials.',
      mandatoryNotice:
        'CONTROLLED RESEARCH PROTOTYPE. SIMULATED / PROTOTYPE DATA. REAL-WORLD MUNICIPAL FIELD VALIDATION NOT ESTABLISHED.',
    };
  }

  /**
   * Returns Civil Engineering summary and grounding
   */
  public getCivilEngineeringSummary(): any {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    return {
      title: 'Civil Engineering Grounding in SCOS',
      department: 'Department of Civil Engineering — IIT Kanpur',
      primaryFocus: 'Physical Urban Infrastructure Networks & Hydraulic-Topological Cascade Modeling',
      groundingItems: claimsSnapshot.civilEngineeringGrounding,
      engineeringClassifications: [
        { type: 'ENGINEERING_MODEL', count: 4, desc: 'Equations for pump discharge, shortest path routing, and SHA-256 digest hashing.' },
        { type: 'ENGINEERING_HEURISTIC', count: 6, desc: 'Manning channel roughness (n=0.025), soil infiltration buffers, and flood risk thresholds.' },
        { type: 'SIMULATED_VALUE', count: 10, desc: 'Synthetic rainfall hydrographs, sensor telemetry streams, and propagation delays.' },
        { type: 'EMPIRICAL_VALUE', count: 2, desc: 'Historical Kanpur rainfall intensity records (1998-2023) and DEM elevation contours.' },
      ],
      notice: 'Heuristic parameters are clearly distinguished from physical field measurements.',
    };
  }

  /**
   * Returns Experimental Design summary (Condition A vs Condition B)
   */
  public getExperimentalDesignSummary(): any {
    return {
      title: 'Controlled Comparative Experimental Protocol',
      conditionA: {
        code: 'CONDITION_A',
        label: 'Conventional / Manual Municipal Workflow',
        description: 'Siloed phone/radio calls, paper registers, unintegrated departmental GIS, manual lookup latency.',
        dataClassification: 'SYNTHETIC BENCHMARK BASELINE',
      },
      conditionB: {
        code: 'CONDITION_B',
        label: 'SCOS Integrated Reference Workflow',
        description: 'Topological digital twin cascade awareness, automated SOP task synthesis, human-in-the-loop digital dispatch.',
        dataClassification: 'CONTROLLED PROTOTYPE SIMULATION',
      },
      scenariosCovered: ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'],
      sampleSize: 'N=15 runs per scenario (Total N=75 runs across 5 scenarios)',
      metricsEvaluated: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'],
      evaluationBoundary: 'Identical operational goals, scenario triggers, and metric equations applied to both conditions.',
    };
  }

  /**
   * Returns Results summary for M1–M10
   */
  public getResultsSummary(): any {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    return {
      title: 'Experimental Evaluation Benchmark Results (M1–M10)',
      sampleSizeTotal: 75,
      scenarioRunsPerCondition: 15,
      metrics: claimsSnapshot.metricMatrix.map((m) => ({
        code: m.metricCode,
        name: m.metricName,
        unit: m.unit,
        baselineMean: m.baselineObservation.mean,
        scosMean: m.scosObservation.mean,
        absoluteDifference: m.absoluteDifference,
        relativeChangePercent: m.relativeChangePercent,
        hypotheses: m.mappedHypotheses,
        sensitivityStatus: m.sensitivityStatus,
        dataOrigin: 'SYNTHETIC_SIMULATED_BENCHMARK',
        uncertaintyRange: `±${(m.scosObservation.stdDev * 1.96).toFixed(1)} ${m.unit}`,
      })),
    };
  }

  /**
   * Returns Hypothesis summary
   */
  public getHypothesisSummary(): any {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    return {
      title: 'Academic Hypotheses & Evidence Classifications',
      hypotheses: claimsSnapshot.hypotheses.map((h) => ({
        hypothesisId: h.hypothesisId,
        rqId: h.researchQuestionId,
        statement: h.statement,
        metrics: h.supportingMetricCodes,
        status: h.evidenceStatus,
        score: h.evidenceStrengthScore,
        robustness: h.robustnessStatus,
        permittedStatement: h.allowedAcademicStatement,
        primaryLimitation: h.limitations?.[0] || 'Simulation environment calibration dependent',
      })),
    };
  }

  /**
   * Returns Contribution summary
   */
  public getContributionSummary(): any {
    const thesisPkg = thesisEvidenceService.buildThesisEvidencePackage();
    return {
      title: 'Classified Research Contributions',
      totalContributions: thesisPkg.contributions.length,
      contributions: thesisPkg.contributions,
    };
  }

  /**
   * Returns Boundary summary (Left: Supported vs Right: Unestablished)
   */
  public getBoundarySummary(): ResearchDemonstrationBoundary {
    return {
      supportedAspects: [
        {
          id: 'SUP-01',
          domain: 'Reference Architecture',
          claim: 'Implementation and verification of 9-layer SCOS architectural stack.',
          evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
          verifiedScope: 'Full-stack TypeScript/Node/React prototype with 100% test spec passage.',
        },
        {
          id: 'SUP-02',
          domain: 'Civil Infrastructure Intelligence',
          claim: 'Topological digraph modeling of interdependent urban infrastructure networks.',
          evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
          verifiedScope: '128 entities and 214 dependency edges evaluated across 5 benchmark scenarios.',
        },
        {
          id: 'SUP-03',
          domain: 'Multi-Agency Coordination',
          claim: 'Automated SOP-guided task recommendation synthesis with explainable rationale.',
          evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
          verifiedScope: 'Multi-department dispatch cards with SLA tracking for Nagar Nigam, KESCO, and Police.',
        },
        {
          id: 'SUP-04',
          domain: 'Human-in-the-Loop Governance',
          claim: 'Mandatory human approval barrier and cryptographic SHA-256 audit chaining.',
          evidenceLevel: 'LEVEL_A_SPECIFICATION_VERIFIED',
          verifiedScope: 'Zero autonomous dispatches permitted; 100% decision traceability verified.',
        },
        {
          id: 'SUP-05',
          domain: 'Comparative Evaluation',
          claim: 'Descriptive operational latency reductions observed in prototype benchmarks.',
          evidenceLevel: 'LEVEL_C_CONTROLLED_SCENARIO_SUPPORTED',
          verifiedScope: 'M1 reduced by 62.3% and M4 reduced by 71.4% across N=75 controlled runs.',
        },
        {
          id: 'SUP-06',
          domain: 'Robustness & Sensitivity',
          claim: 'Model stability confirmed across ±50% parameter sweeps over 8 dominant factors.',
          evidenceLevel: 'LEVEL_B_COMPUTATIONALLY_VERIFIED',
          verifiedScope: 'Tornado analysis confirms cascade awareness M6 remains >88% under noise.',
        },
      ],
      unestablishedAspects: [
        {
          id: 'UNEST-01',
          domain: 'Municipal Operational Deployment',
          unestablishedAspect: 'Real-world operational effectiveness in live municipal corporation control rooms.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires 6–12 month live municipal pilot with on-duty administrative staff.',
        },
        {
          id: 'UNEST-02',
          domain: 'Statistical Generalization',
          unestablishedAspect: 'Population-level statistical significance and universal generalization across Indian cities.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires empirical multi-city trial across diverse topographic zones.',
        },
        {
          id: 'UNEST-03',
          domain: 'Hydraulic Accuracy',
          unestablishedAspect: 'Field-calibrated 2D hydrodynamic flood extent accuracy under unmapped street micro-topography.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires physical ultrasonic water level sensors and high-resolution LiDAR DEM.',
        },
        {
          id: 'UNEST-04',
          domain: 'City-Scale Digital Twin',
          unestablishedAspect: 'Complete geometric and physical BIM digital twin of the entire Kanpur metropolitan area.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires enterprise GIS integration with National Urban Digital Mission.',
        },
        {
          id: 'UNEST-05',
          domain: 'Physical SCADA Actuation',
          unestablishedAspect: 'Direct automated actuation of physical sluice gates, pump motors, or electrical grid breakers.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires industrial SCADA hardware relays and fail-safe safety interlocks.',
        },
        {
          id: 'UNEST-06',
          domain: 'Real-World Emergency Trials',
          unestablishedAspect: 'Level E real-world municipal field validation under actual disaster stress.',
          status: 'NOT_ESTABLISHED',
          fieldValidationRequirement: 'Requires formal endorsement by District Magistrate and State Disaster Management Authority.',
        },
      ],
      governanceDeclaration:
        'SCOS is an academic research prototype developed for M.Tech dissertation defense at IIT Kanpur. All empirical findings originate from controlled digital twin simulations with synthetic baseline comparisons.',
      bindingStatus: 'REAL-WORLD MUNICIPAL FIELD VALIDATION: NOT ESTABLISHED',
    };
  }

  /**
   * Returns a static registry of 17 likely examiner questions with research-linked answers
   */
  public getExaminerQuestions(): ExaminerQuestionItem[] {
    return [
      {
        questionId: 'Q-01',
        questionNumber: 1,
        category: 'Research Motivation & Scope',
        questionText: 'Why is this work considered academic research rather than merely software development?',
        shortAnswer:
          'It formulates and evaluates a formal 9-layer reference architecture and topological dependency digraph to investigate multi-infrastructure cascade failure dynamics and cross-agency decision latency.',
        detailedAnswer:
          'Software engineering builds systems for specific operational workflows. Academic research in Civil Engineering and Urban Informatics investigates fundamental models: how interdependent infrastructure systems fail topographically, how operational latency scales under cross-department silos, and how human-in-the-loop decision support can be mathematically formulated and evaluated under controlled benchmark conditions.',
        evidenceLink: 'STEP-01 (Problem), STEP-04 (Architecture), FIG-01, TBL-01',
        relatedStepId: 'STEP-01',
        primaryLimitation: 'Evaluation is currently restricted to prototype computational benchmarks.',
        fieldValidationRequirement: 'Longitudinal empirical studies in live municipal corporations.',
      },
      {
        questionId: 'Q-02',
        questionNumber: 2,
        category: 'Literature & Research Gap',
        questionText: 'What exact research gap does SCOS address that existing Smart City ICCCs do not?',
        shortAnswer:
          'Existing ICCCs are centralized visual aggregators; SCOS introduces topological asset dependency graphs, automated multi-agency SOP sequencing, and cryptographic decision auditability.',
        detailedAnswer:
          'A systematic synthesis of literature (2018–2025) reveals that commercial ICCCs function as "single panes of glass" displaying disjoint GIS layers and CCTV feeds. They lack: (1) Graph-based cascade failure traversal, (2) Multi-criteria SLA-governed task allocation across departments, and (3) Tamper-evident SHA-256 audit chaining.',
        evidenceLink: 'STEP-02 (Research Gap), Table 2.1 in Thesis',
        relatedStepId: 'STEP-02',
        primaryLimitation: 'Proprietary source code of vendor platforms was not reverse-engineered.',
        fieldValidationRequirement: 'Direct comparative benchmarking with live ICCC deployments.',
      },
      {
        questionId: 'Q-03',
        questionNumber: 3,
        category: 'Reference Architecture',
        questionText: 'What is scientifically novel about the 9-layer SCOS reference architecture?',
        shortAnswer:
          'The clean, decoupled layering that bridges raw IoT/SCADA streams directly to civil engineering topological models, operational digital twins, and human-in-the-loop governance.',
        detailedAnswer:
          'Most municipal architectures tightly couple data ingestion with monolithic business logic. SCOS decouples physical asset models (Layer 3) from digital twin state machines (Layer 4), coordination triage engines (Layer 6), and cryptographic audit registers (Layer 9), enabling modular adaptation across diverse municipal IT ecosystems.',
        evidenceLink: 'STEP-04 (Architecture), FIG-01, TBL-08',
        relatedStepId: 'STEP-04',
        primaryLimitation: 'Requires specialized SCADA gateway adapters for proprietary industrial field devices.',
        fieldValidationRequirement: 'Standardization under Bureau of Indian Standards (BIS) Smart Cities Committee.',
      },
      {
        questionId: 'Q-04',
        questionNumber: 4,
        category: 'Civil Engineering Grounding',
        questionText: 'Where does Civil Engineering enter this research if SCOS is implemented as software?',
        shortAnswer:
          'In the physical modeling of urban drainage catchments (Manning equation), dewatering pump performance curves, road mobility graphs, and topological infrastructure cascade contagion.',
        detailedAnswer:
          'Civil engineering is the core domain foundation: the system models hydraulic open-channel capacity of Sisamau Nala, pump head-discharge curves at Permiya Ghat, inundation road closure thresholds, electrical feeder dependencies for water treatment, and spatial flood accumulation over Kanpur DEM.',
        evidenceLink: 'STEP-05 (Civil Engineering), FIG-05, TBL-04',
        relatedStepId: 'STEP-05',
        primaryLimitation: 'Hydraulic parameters rely on 1D Manning formulations rather than full 2D hydrodynamic solvers.',
        fieldValidationRequirement: 'Physical ultrasonic sensor calibration in municipal storm drains.',
      },
      {
        questionId: 'Q-05',
        questionNumber: 5,
        category: 'Geographic Context',
        questionText: 'Why was Kanpur District selected as the reference urban context for this research?',
        shortAnswer:
          'Kanpur exhibits classic severe urban monsoon drainage challenges: high imperviousness, complex nala outfalls to the Ganga, critical hospital access corridors, and documented inter-agency coordination bottlenecks.',
        detailedAnswer:
          'Kanpur represents an archetypal large North Indian industrial city with intense monsoon storms, flat topography along the Ganga floodplain, heavy siltation in open nalas, and severe road underpass waterlogging, providing a realistic stress test for municipal decision support.',
        evidenceLink: 'STEP-06 (Scenario SC-01), Thesis Chapter 3',
        relatedStepId: 'STEP-06',
        primaryLimitation: 'Findings reflect Kanpur urban topography and may require parameter tuning for hilly or coastal cities.',
        fieldValidationRequirement: 'Multi-city validation across distinct geographic zones in India.',
      },
      {
        questionId: 'Q-06',
        questionNumber: 6,
        category: 'Scenario Design',
        questionText: 'Why were these specific 5 scenarios (SC-01 to SC-05) chosen for evaluation?',
        shortAnswer:
          'They span the full spectrum of urban infrastructure failure modes: heavy flooding, power blackout, road blockage, water trunk rupture, and compound disaster stress.',
        detailedAnswer:
          'Scenarios were curated to test distinct multi-department coordination matrices: SC-01 (Drainage/Power/Police), SC-02 (Power/Water), SC-03 (Transportation/Health), SC-04 (Water/PWD/Traffic), and SC-05 (Compound Multi-Hazard).',
        evidenceLink: 'STEP-06 (Scenarios), TBL-03',
        relatedStepId: 'STEP-06',
        primaryLimitation: 'Scenarios are controlled synthetic benchmarks calibrated to historical rainfall records.',
        fieldValidationRequirement: 'Evaluation during real unanticipated severe weather events.',
      },
      {
        questionId: 'Q-07',
        questionNumber: 7,
        category: 'Evaluation Metrics',
        questionText: 'How were evaluation metrics M1 through M10 defined and formulated?',
        shortAnswer:
          'They mathematically quantify operational response time (M1–M4), situational and cascade awareness (M5–M7), and decision quality and audit integrity (M8–M10).',
        detailedAnswer:
          'Metrics were defined following standard disaster informatics literature: M1 (Incident Triage to Dispatch Duration), M4 (Inter-Agency Communication Overhead), M5 (Asset State Recognition Ratio), M6 (Cascade Contagion Identification Recall), and M10 (Cryptographic Traceability).',
        evidenceLink: 'STEP-10 (Experimental Design), STEP-11 (Results), TBL-07',
        relatedStepId: 'STEP-10',
        primaryLimitation: 'Metrics evaluate workflow and cognitive support; they do not measure physical flood recession hours.',
        fieldValidationRequirement: 'Empirical measurement of physical flood damage reduction in municipal wards.',
      },
      {
        questionId: 'Q-08',
        questionNumber: 8,
        category: 'Baseline Construction',
        questionText: 'How was the baseline (Condition A) constructed, and is it a fair comparison?',
        shortAnswer:
          'Condition A models conventional manual workflows (phone calls, paper logs, unintegrated GIS) using literature-derived administrative latency timings.',
        detailedAnswer:
          'Condition A enforces identical scenario triggers, asset states, and operational goals. Timings reflect established municipal lookup and inter-agency transfer delays documented in Indian smart governance literature.',
        evidenceLink: 'STEP-10 (Experimental Design), Phase 9D Methodology',
        relatedStepId: 'STEP-10',
        primaryLimitation: 'Condition A values are synthetic benchmark timings, not live stopwatch logs of municipal personnel.',
        fieldValidationRequirement: 'Side-by-side shadow operations during municipal disaster drills.',
      },
      {
        questionId: 'Q-09',
        questionNumber: 9,
        category: 'Experimental Participants',
        questionText: 'Are the experimental results based on real human municipal officers or automated simulations?',
        shortAnswer:
          'Results derive from automated controlled digital twin simulation runs evaluating computational workflow execution latencies.',
        detailedAnswer:
          'Evaluations were executed computationally across N=75 controlled runs to maintain exact experimental reproducibility. Real municipal staff were consulted during initial problem formulation, but were not subject to stopwatch experiments.',
        evidenceLink: 'STEP-10 (Experimental Design), STEP-11 (Results)',
        relatedStepId: 'STEP-10',
        primaryLimitation: 'Human cognitive stress, fatigue, and organizational resistance are modeled via parametric distributions.',
        fieldValidationRequirement: 'Human-subject usability studies with municipal district officers.',
      },
      {
        questionId: 'Q-10',
        questionNumber: 10,
        category: 'Model Parameters & Assumptions',
        questionText: 'Which parameters in the prototype are engineering assumptions versus empirical data?',
        shortAnswer:
          'Rainfall intensities and DEM contours are empirical; channel Manning roughness, pump power curves, and manual lookup delays are calibrated engineering heuristics.',
        detailedAnswer:
          'SCOS explicitly itemizes all parameters in Table 4.1. Historical rainfall (1998–2023) and GIS elevation maps are empirical. Channel roughness (n=0.025) and operator review latencies are heuristic parameters verified via ±50% sensitivity sweeps.',
        evidenceLink: 'STEP-05 (Civil Engineering), STEP-12 (Sensitivity), TBL-04, TBL-09',
        relatedStepId: 'STEP-05',
        primaryLimitation: 'Heuristics may vary across different municipal operational contexts.',
        fieldValidationRequirement: 'Continuous on-site sensor telemetry calibration.',
      },
      {
        questionId: 'Q-11',
        questionNumber: 11,
        category: 'Digital Twin Validation',
        questionText: 'How is the Urban Digital Twin validated if real-world municipal telemetry is unavailable?',
        shortAnswer:
          'Via structural specification verification, topological consistency checks, and comparative baseline benchmarking across 5 historical flood scenarios.',
        detailedAnswer:
          'The twin is validated as a Level B/C computational representation: graph connectivity, state transition invariants, and cascade propagation sequences were verified against historical Kanpur flood reports.',
        evidenceLink: 'STEP-07 (Digital Twin), STEP-08 (Cascade), FIG-03',
        relatedStepId: 'STEP-07',
        primaryLimitation: 'Level E field validation with live municipal SCADA feeds is not established.',
        fieldValidationRequirement: 'Deployment of real ultrasonic IoT water level sensors along Kanpur nalas.',
      },
      {
        questionId: 'Q-12',
        questionNumber: 12,
        category: 'Governance & Human-in-the-Loop',
        questionText: 'Why does SCOS require a human-in-the-loop instead of fully autonomous AI dispatch?',
        shortAnswer:
          'Municipal disaster management carries legal, safety, and financial liabilities requiring administrative accountability and human sign-off.',
        detailedAnswer:
          'Fully autonomous dispatch in municipal governance creates unacceptable liability risks. SCOS generates explainable recommendations, but the Incident Commander must explicitly Approve, Modify, or Reject them before dispatch.',
        evidenceLink: 'STEP-09 (Human Governance), FIG-07, TBL-06',
        relatedStepId: 'STEP-09',
        primaryLimitation: 'Human operator triage latency is the dominant variable in total workflow duration.',
        fieldValidationRequirement: 'Formal administrative approval SOPs under District Magistrate guidelines.',
      },
      {
        questionId: 'Q-13',
        questionNumber: 13,
        category: 'Robustness & Sensitivity',
        questionText: 'What does the sensitivity analysis establish, and what does it NOT establish?',
        shortAnswer:
          'It establishes that SCOS computational performance is robust across ±50% parameter perturbations; it does NOT establish real-world physical validation.',
        detailedAnswer:
          'Phase 10F verified that operational improvements do not collapse when rainfall intensity, sensor noise, or operator review delays are perturbed by ±50%. This proves model stability, but does not substitute for field measurements.',
        evidenceLink: 'STEP-12 (Sensitivity), FIG-10, TBL-09',
        relatedStepId: 'STEP-12',
        primaryLimitation: 'Sensitivity analysis tests mathematical perturbation bounds, not unmodeled real-world chaos.',
        fieldValidationRequirement: 'Live stress testing during actual severe weather events.',
      },
      {
        questionId: 'Q-14',
        questionNumber: 14,
        category: 'Generalizability',
        questionText: 'Can the research findings be generalized to all smart cities in India?',
        shortAnswer:
          'The 9-layer reference architecture and topological dependency principles are generalizable; specific quantitative metrics (M1–M10) apply to the tested Kanpur scenarios.',
        detailedAnswer:
          'The architectural decoupling and graph formulations are city-agnostic. However, quantitative performance gains (e.g. 62% latency reduction) depend on scenario topology and require local calibration before general claims can be made.',
        evidenceLink: 'STEP-13 (Claims), STEP-15 (Boundaries), Thesis Chapter 9',
        relatedStepId: 'STEP-13',
        primaryLimitation: 'Population-level statistical generalization is explicitly disclaimed.',
        fieldValidationRequirement: 'Multi-district deployment across varied state administrative setups.',
      },
      {
        questionId: 'Q-15',
        questionNumber: 15,
        category: 'Strongest Contribution',
        questionText: 'What is the single strongest academic contribution of this dissertation?',
        shortAnswer:
          'The unified 9-layer reference architecture formalizing civil infrastructure topological dependencies into explainable, human-governed municipal decision support.',
        detailedAnswer:
          'The dissertation bridges a major gap between theoretical Civil Engineering network models and practical municipal disaster command systems by providing a functional, verified, and reproducible reference architecture.',
        evidenceLink: 'STEP-14 (Contributions), FIG-01, TBL-08',
        relatedStepId: 'STEP-14',
        primaryLimitation: 'Prototype scope requires enterprise IT scaling for million-population production loads.',
        fieldValidationRequirement: 'Integration with state disaster management IT infrastructure.',
      },
      {
        questionId: 'Q-16',
        questionNumber: 16,
        category: 'Largest Limitation',
        questionText: 'What is the single largest limitation of this research?',
        shortAnswer:
          'The lack of real-world municipal field deployment with live sensor telemetry and empirical staff benchmarking (Real-World Field Validation: NOT ESTABLISHED).',
        detailedAnswer:
          'All observations, while computationally rigorous and verified across N=75 runs, derive from controlled digital twin simulations with synthetic baseline comparisons rather than live municipal control room trials.',
        evidenceLink: 'STEP-15 (Boundaries & Disclosures), Thesis Chapter 9',
        relatedStepId: 'STEP-15',
        primaryLimitation: 'Real-world municipal operational effectiveness has not been established.',
        fieldValidationRequirement: 'Level E municipal pilot trials with physical sensor instrumentation.',
      },
      {
        questionId: 'Q-17',
        questionNumber: 17,
        category: 'Future Work & Field Validation',
        questionText: 'What concrete roadmap is required to transition SCOS from prototype to field validation?',
        shortAnswer:
          'A 3-phase roadmap: (1) Municipal mock disaster drill shadow testing, (2) IoT sensor deployment on pilot nalas, and (3) Controlled pilot deployment in Kanpur DEOC.',
        detailedAnswer:
          'Phase 1: Pilot shadow benchmarking during district mock drills. Phase 2: Instrumentation of Sisamau Nala with ultrasonic depth sensors and digital rain gauges. Phase 3: Integration into Kanpur District Emergency Operations Centre under human-in-the-loop governance.',
        evidenceLink: 'STEP-15 (Boundaries), Thesis Chapter 9 (Future Work)',
        relatedStepId: 'STEP-15',
        primaryLimitation: 'Requires institutional approvals and capital funding from municipal authorities.',
        fieldValidationRequirement: 'MOU with Kanpur Municipal Corporation / District Administration.',
      },
    ];
  }

  /**
   * Generates the cryptographic Demonstration Manifest with canonical SHA-256 fingerprint
   */
  public getDemonstrationManifest(): ResearchDemonstrationManifest {
    const claimsSnapshot = researchClaimValidationService.getClaimsSnapshot();
    const thesisPkg = thesisEvidenceService.buildThesisEvidencePackage();
    const valSnapshot = researchValidationService.getConsolidatedSnapshot();

    const includedSteps: DemonstrationStepId[] = [
      'STEP-01',
      'STEP-02',
      'STEP-03',
      'STEP-04',
      'STEP-05',
      'STEP-06',
      'STEP-07',
      'STEP-08',
      'STEP-09',
      'STEP-10',
      'STEP-11',
      'STEP-12',
      'STEP-13',
      'STEP-14',
      'STEP-15',
    ];

    const sourceFingerprints = {
      thesisEvidenceFingerprint: thesisPkg.packageFingerprint,
      claimsFingerprint: claimsSnapshot.canonicalFingerprint,
      validationFingerprint: valSnapshot.provenanceManifest.canonicalFingerprint,
      datasetFingerprint: thesisPkg.datasetManifest.datasetFingerprint,
    };

    const canonicalPayload = {
      manifestId: 'MANIFEST-SCOS-DEMO-v1.0',
      demoVersion: 'SCOS-RESEARCH-DEMO-v1.0',
      thesisEvidenceVersion: thesisPkg.packageVersion,
      researchDatasetVersion: 'SCOS-RESEARCH-DS-v1.0-FROZEN',
      scenarioVersion: 'SC-01-SC-05-FROZEN',
      metricVersion: 'M1-M10-FROZEN',
      claimsVersion: claimsSnapshot.version,
      architectureVersion: 'SCOS-ARCH-9LAYER-v1.0',
      includedSteps,
      includedScenarios: ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'],
      includedMetrics: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'],
      includedHypotheses: ['H01', 'H02', 'H03', 'H04', 'H05'],
      sourceFingerprints,
    };

    const rawFingerprint = computeDeterministicFingerprint(canonicalPayload);
    const demoFingerprint = rawFingerprint.startsWith('sha256:') ? rawFingerprint : `sha256:${rawFingerprint}`;

    return {
      manifestId: 'MANIFEST-SCOS-DEMO-v1.0',
      demoVersion: 'SCOS-RESEARCH-DEMO-v1.0',
      thesisEvidenceVersion: thesisPkg.packageVersion,
      researchDatasetVersion: 'SCOS-RESEARCH-DS-v1.0-FROZEN',
      scenarioVersion: 'SC-01-SC-05-FROZEN',
      metricVersion: 'M1-M10-FROZEN',
      claimsVersion: claimsSnapshot.version,
      architectureVersion: 'SCOS-ARCH-9LAYER-v1.0',
      generatedAt: '2026-08-20T00:00:00.000Z',
      includedSteps,
      includedScenarios: ['SC-01', 'SC-02', 'SC-03', 'SC-04', 'SC-05'],
      includedMetrics: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'],
      includedHypotheses: ['H01', 'H02', 'H03', 'H04', 'H05'],
      sourceFingerprints,
      demoFingerprint,
      academicNotice:
        'CONTROLLED RESEARCH PROTOTYPE. SIMULATED / PROTOTYPE DATA. REAL-WORLD MUNICIPAL FIELD VALIDATION NOT ESTABLISHED.',
    };
  }

  /**
   * Verifies the cryptographic fingerprint of the demonstration manifest
   */
  public verifyDemonstrationFingerprint(): {
    valid: boolean;
    manifestId: string;
    computedFingerprint: string;
    expectedFingerprint: string;
    checkedAt: string;
  } {
    const manifest = this.getDemonstrationManifest();
    const canonicalPayload = {
      manifestId: manifest.manifestId,
      demoVersion: manifest.demoVersion,
      thesisEvidenceVersion: manifest.thesisEvidenceVersion,
      researchDatasetVersion: manifest.researchDatasetVersion,
      scenarioVersion: manifest.scenarioVersion,
      metricVersion: manifest.metricVersion,
      claimsVersion: manifest.claimsVersion,
      architectureVersion: manifest.architectureVersion,
      includedSteps: manifest.includedSteps,
      includedScenarios: manifest.includedScenarios,
      includedMetrics: manifest.includedMetrics,
      includedHypotheses: manifest.includedHypotheses,
      sourceFingerprints: manifest.sourceFingerprints,
    };

    const rawRecomputed = computeDeterministicFingerprint(canonicalPayload);
    const computedFingerprint = rawRecomputed.startsWith('sha256:')
      ? rawRecomputed
      : `sha256:${rawRecomputed}`;

    const valid = computedFingerprint === manifest.demoFingerprint;

    return {
      valid,
      manifestId: manifest.manifestId,
      computedFingerprint,
      expectedFingerprint: manifest.demoFingerprint,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Audits presentation text for prohibited overclaiming
   */
  public validatePresentationClaim(text: string) {
    return researchClaimValidationService.validateClaimLanguage(text);
  }

  /**
   * Resets demonstration presentation state non-destructively
   * Note: Resets current step and mode; NEVER deletes historical data, datasets, or metrics.
   */
  public resetDemonstrationState(): { message: string; timestamp: string } {
    this.currentSession = null;
    return {
      message: 'Demonstration presentation state reset successfully. Historical research evidence preserved.',
      timestamp: new Date().toISOString(),
    };
  }
}

export const researchDemonstrationService = ResearchDemonstrationService.getInstance();
