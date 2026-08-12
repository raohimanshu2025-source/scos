/**
 * SCOS Phase 5B.5 — Predictive Intelligence In-Memory Data Store & Early Warning Workflow
 * Manages active city risk zones, early warning human approvals, preventive task dispatches,
 * What-If scenario analysis logs, research evaluation metrics, and the 15-step Predictive Heavy Rainfall Scenario.
 */

import {
  RiskZone,
  ResearchMetrics,
  WhatIfScenarioResult,
  WhatIfScenarioInput,
  PredictiveDemoStep,
} from '../types/prediction';
import { incidentStore } from './incidentStore';
import { mapScoreToRiskLevel, generateAIPredictionExplanation, runAIWhatIfSimulation } from './predictionService';

export const INITIAL_RISK_ZONES: RiskZone[] = [
  {
    zone_id: 'ZONE-PARADE-CROSSING',
    zone_name: 'Parade Crossing & Mall Road Corridor',
    ward_zone: 'Zone 2 - Parade / Civil Lines',
    center_lat: 26.4601,
    center_lng: 80.332,
    use_case: 'WATERLOGGING',
    risk_score: 78,
    risk_level: 'HIGH',
    confidence: 'HIGH',
    data_quality: 'HIGH',
    time_horizon: 'Next 2 hours',
    trend: 'INCREASING',
    affected_departments: ['MUNICIPAL', 'TRAFFIC', 'WATER', 'HEALTH'],
    contributing_factors: [
      { id: 'f1', factor_name: 'Simulated High Rainfall Intensity (84mm/hr)', is_present: true, description: 'Doppler radar feed indicates intense precipitation cell over Zone 2.', weight: 35 },
      { id: 'f2', factor_name: 'Historical Waterlogging Hotspot', is_present: true, description: '4 previous flooding events logged in past 2 monsoons at Parade underpass.', weight: 25 },
      { id: 'f3', factor_name: 'Drainage Hydraulic Surcharge Vulnerability', is_present: true, description: 'Jajmau Trunk Outfall #2 operating at 88% capacity.', weight: 20 },
      { id: 'f4', factor_name: 'High Density Arterial Corridor', is_present: true, description: 'Primary transit route connecting District Court, Mall Road, and Civil Lines.', weight: 20 },
    ],
    ai_operational_explanation:
      'High waterlogging risk (78/100) predicted within the next 2 hours at Parade Crossing due to 84mm/hr simulated precipitation colliding with high drainage surcharge at Trunk #2. Pre-positioning 2 mobile dewatering pumps and establishing traffic diversions at Chunniganj will mitigate arterial inundation.',
    recommended_preventive_actions: [
      '[Kanpur Nagar Nigam] Pre-position 2 high-capacity 100 HP mobile suction pumps at Parade Crossing before runoff peaks.',
      '[Traffic Police] Deploy marshals at Chunniganj & Mall Road to prepare green channel for emergency vehicles.',
      '[Kanpur Jal Sansthan] Clear storm catch basins along Mall Road feeder lines.',
      '[District Health] Alert L1 Casualty ward at Ursula Horsman Hospital for emergency corridor access.',
    ],
    decision_support: {
      situation: 'Heavy rainfall cloudburst detected over Kanpur Central (84mm/hr simulated rate).',
      risk_summary: 'Waterlogging Risk: HIGH (78/100). Surface accumulation expected within 45-60 minutes.',
      impact_projection: 'Potential 0.60m standing water on arterial roadway, risking vehicle stalling, 3 hospital ambulance delays, and urban gridlock.',
      affected_departments: ['MUNICIPAL', 'TRAFFIC', 'WATER', 'HEALTH'],
      options: [
        {
          option_id: 'opt-1',
          title: 'Option 1: Proactive Pre-positioning & Traffic Corridor Prep',
          description: 'Deploy suction pumps and set up traffic diversions prior to inundation.',
          affected_departments: ['MUNICIPAL', 'TRAFFIC', 'WATER', 'HEALTH'],
          preventive_actions: [
            '[Kanpur Nagar Nigam] Deploy 2 mobile pumps to Parade Crossing.',
            '[Traffic Police] Set up Chunniganj diversion.',
            '[Kanpur Jal Sansthan] Check outfall valve B-2.',
            '[District Health] Maintain Ursula Hospital emergency corridor.',
          ],
          is_scos_recommended: true,
        },
        {
          option_id: 'opt-2',
          title: 'Option 2: Standby & Reactive Deployment',
          description: 'Keep squads on alert and dispatch only upon physical waterlogging report.',
          affected_departments: ['MUNICIPAL', 'TRAFFIC'],
          preventive_actions: [
            '[Kanpur Nagar Nigam] Standby pump truck at Central Depot.',
            '[Traffic Police] Monitor CCTV feed.',
          ],
          is_scos_recommended: false,
        },
      ],
      scos_recommendation: 'Option 1 (Proactive Pre-positioning & Traffic Corridor Prep)',
      rationale: 'Historical data shows reactive response at Parade Crossing results in 90+ minute delays due to gridlock traffic blocking pump trucks.',
    },
    nearby_infrastructure: [
      { id: 'inf-1', name: 'Ursula Horsman Memorial Hospital', type: 'HOSPITAL', distance_meters: 450, criticality: 'CRITICAL', description: 'Primary district casualty facility and emergency trauma center.' },
      { id: 'inf-2', name: 'Parade Mall Road Arterial Flyover', type: 'ROAD', distance_meters: 50, criticality: 'HIGH', description: 'Major transit line carrying 45,000 vehicles daily.' },
      { id: 'inf-3', name: 'Jajmau Trunk Sewer Outfall #2', type: 'DRAINAGE', distance_meters: 1200, criticality: 'HIGH', description: 'Primary hydraulic outflow conduit for Zone 2 storm runoff.' },
    ],
    historical_pattern: {
      previous_incidents_count: 4,
      time_patterns: 'Monsoon months (July - Sept), during rainfall events exceeding 50mm/hr.',
      recurring_categories: ['WATERLOGGING', 'DRAINAGE_FAILURE', 'TRAFFIC_CONGESTION'],
      previous_response_outcomes: 'Mean resolution time was 145 minutes without pre-positioned pumps vs 42 minutes with proactive deployment.',
      similarity_score: 94,
    },
    early_warning_status: 'AWAITING_REVIEW',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    is_simulated: true,
  },

  {
    zone_id: 'ZONE-GT-ROAD-CORRIDOR',
    zone_name: 'GT Road / Kalyanpur Junction Corridor',
    ward_zone: 'Zone 1 - Kalyanpur',
    center_lat: 26.491,
    center_lng: 80.282,
    use_case: 'TRAFFIC_CONGESTION',
    risk_score: 68,
    risk_level: 'HIGH',
    confidence: 'HIGH',
    data_quality: 'HIGH',
    time_horizon: 'Next 1 hour',
    trend: 'INCREASING',
    affected_departments: ['TRAFFIC', 'MUNICIPAL', 'HEALTH'],
    contributing_factors: [
      { id: 'f21', factor_name: 'Peak Hour Heavy Vehicle Transit', is_present: true, description: 'Commercial transport trucks entering city limits.', weight: 40 },
      { id: 'f22', factor_name: 'Recent Crash Incident on Adjacent Feeder', is_present: true, description: 'Minor vehicle stall cleared 20 mins ago causing tailback.', weight: 30 },
      { id: 'f23', factor_name: 'Narrow Shoulder Construction Bottleneck', is_present: true, description: 'Ongoing utility pipeline work restricting shoulder width.', weight: 30 },
    ],
    ai_operational_explanation:
      'High traffic congestion risk (68/100) predicted on GT Road Corridor due to peak commercial freight movement combined with bottleneck construction. Manual traffic signal overriding recommended.',
    recommended_preventive_actions: [
      '[Traffic Police] Switch Kalyanpur signal to manual police officer control during peak hour.',
      '[Kanpur Nagar Nigam] Temporarily clear construction debris from outer asphalt shoulder.',
      '[District Health] Reroute inbound emergency ambulances via Rawatpur bypass.',
    ],
    decision_support: {
      situation: 'Peak freight transport inflow converging on Kalyanpur GT Road narrow junction.',
      risk_summary: 'Traffic Congestion Risk: HIGH (68/100). Tailback expected to exceed 2.4 km.',
      impact_projection: 'Commute delay increase by 40+ minutes on primary intercity highway.',
      affected_departments: ['TRAFFIC', 'MUNICIPAL', 'HEALTH'],
      options: [
        {
          option_id: 'opt-21',
          title: 'Manual Signal Control & Shoulder Clearance',
          description: 'Deploy officers to extend green light phases for heavy freight line.',
          affected_departments: ['TRAFFIC', 'MUNICIPAL'],
          preventive_actions: [
            '[Traffic Police] Override smart signal.',
            '[Kanpur Nagar Nigam] Clear shoulder debris.',
          ],
          is_scos_recommended: true,
        },
      ],
      scos_recommendation: 'Manual Signal Control & Shoulder Clearance',
      rationale: 'Prevents corridor queueing from spilling into residential feeder roads.',
    },
    nearby_infrastructure: [
      { id: 'inf-21', name: 'Kalyanpur Railway Station Access', type: 'ROAD', distance_meters: 300, criticality: 'HIGH', description: 'Key suburban commuter transfer point.' },
    ],
    historical_pattern: {
      previous_incidents_count: 6,
      time_patterns: 'Weekdays 17:30 - 20:00 during evening freight windows.',
      recurring_categories: ['TRAFFIC_CONGESTION', 'TRAFFIC_ACCIDENT'],
      previous_response_outcomes: 'Manual signal control reduced congestion duration by 55%.',
      similarity_score: 88,
    },
    early_warning_status: 'AWAITING_REVIEW',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    is_simulated: true,
  },

  {
    zone_id: 'ZONE-JAJMAU-DRAINAGE',
    zone_name: 'Jajmau Pumping & Water Supply Feeder Sector',
    ward_zone: 'Zone 4 - Jajmau',
    center_lat: 26.4312,
    center_lng: 80.381,
    use_case: 'WATER_SUPPLY_DISRUPTION',
    risk_score: 58,
    risk_level: 'HIGH',
    confidence: 'MEDIUM',
    data_quality: 'HIGH',
    time_horizon: 'Next 6 hours',
    trend: 'STABLE',
    affected_departments: ['WATER', 'HEALTH', 'MUNICIPAL'],
    contributing_factors: [
      { id: 'f31', factor_name: 'High Voltage Feeder Pressure Fluctuations', is_present: true, description: 'Power grid voltage dip reported near pump station #3.', weight: 35 },
      { id: 'f32', factor_name: 'Aging Trunk Transmission Infrastructure', is_present: true, description: '450mm pipeline operating above 4.2 bar nominal design pressure.', weight: 35 },
      { id: 'f33', factor_name: 'High Consumer Demand Volume', is_present: true, description: 'Industrial leather tannery sector high water draw.', weight: 30 },
    ],
    ai_operational_explanation:
      'Water Supply Disruption Risk (58/100) predicted in Jajmau Sector due to line pressure spikes near transmission node #12. Preventive pressure relief valve regulation required.',
    recommended_preventive_actions: [
      '[Kanpur Jal Sansthan] Adjust hydraulic pressure relief regulator at Node #12 to 3.5 bar.',
      '[Kanpur Nagar Nigam] Standby 4 clean water delivery tankers for emergency backup.',
    ],
    decision_support: {
      situation: 'Sustained pressure fluctuations detected on Jajmau trunk water line.',
      risk_summary: 'Water Supply Disruption Risk: HIGH (58/100). Risk of pipe stress crack.',
      impact_projection: 'Potential outage affecting 18,000 residents if pipeline ruptures.',
      affected_departments: ['WATER', 'HEALTH', 'MUNICIPAL'],
      options: [
        {
          option_id: 'opt-31',
          title: 'Pressure Stabilization & Tanker Standby',
          description: 'Regulate line pressure and position emergency water distribution tankers.',
          affected_departments: ['WATER', 'MUNICIPAL'],
          preventive_actions: [
            '[Kanpur Jal Sansthan] Regulate pressure valve.',
            '[Kanpur Nagar Nigam] Standby 4 tankers.',
          ],
          is_scos_recommended: true,
        },
      ],
      scos_recommendation: 'Pressure Stabilization & Tanker Standby',
      rationale: 'Active regulation prevents structural fatigue ruptures on transmission main.',
    },
    nearby_infrastructure: [
      { id: 'inf-31', name: 'Jajmau Central Water Pumping Station', type: 'WATER_PLANT', distance_meters: 100, criticality: 'CRITICAL', description: 'Primary water treatment and supply hub for Zone 4.' },
    ],
    historical_pattern: {
      previous_incidents_count: 3,
      time_patterns: 'Summer and monsoon peak pressure shifts.',
      recurring_categories: ['WATER_SUPPLY_DISRUPTION', 'INFRASTRUCTURE_FAILURE'],
      previous_response_outcomes: 'Proactive valve adjustment prevented pipe rupture in 2 previous instances.',
      similarity_score: 82,
    },
    early_warning_status: 'AWAITING_REVIEW',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_simulated: true,
  },

  {
    zone_id: 'ZONE-HORSMAN-HEALTH-CLUSTER',
    zone_name: 'Civil Lines & Ursula Horsman Medical Cluster',
    ward_zone: 'Zone 5 - Civil Lines / Hospital Area',
    center_lat: 26.468,
    center_lng: 80.345,
    use_case: 'PUBLIC_HEALTH_PRESSURE',
    risk_score: 42,
    risk_level: 'MEDIUM',
    confidence: 'HIGH',
    data_quality: 'HIGH',
    time_horizon: 'Next 24 hours',
    trend: 'DECREASING',
    affected_departments: ['HEALTH', 'MUNICIPAL'],
    contributing_factors: [
      { id: 'f41', factor_name: 'Monsoon Humidity & Vector Environment', is_present: true, description: 'Post-rain humidity creating conditions for waterborne vector breeding.', weight: 40 },
      { id: 'f42', factor_name: 'Outpatient Telemetry OPD Volume Surge', is_present: true, description: '12% increase in seasonal fever OPD consultations.', weight: 30 },
      { id: 'f43', factor_name: 'High Population Density Catchment', is_present: true, description: 'Dense urban core surrounding District Civil Hospital.', weight: 30 },
    ],
    ai_operational_explanation:
      'Public Health Service Pressure Risk (42/100 - MEDIUM) predicted for Civil Lines Medical Cluster over next 24 hours. Recommended preventative anti-larval fogging and bed capacity reserve planning (Operational planning support only, not medical diagnosis).',
    recommended_preventive_actions: [
      '[District Health] Initiate seasonal preventive vector surveillance and allocate reserve OPD beds.',
      '[Kanpur Nagar Nigam] Conduct anti-larval fogging in stagnant drainage catchments within 1 km radius.',
    ],
    decision_support: {
      situation: 'Seasonal post-rain humidity and vector breeding indicators observed in Zone 5.',
      risk_summary: 'Public Health Service Pressure Risk: MEDIUM (42/100). Resource allocation focus.',
      impact_projection: 'Moderate increase in hospital OPD queue length and emergency triage load.',
      affected_departments: ['HEALTH', 'MUNICIPAL'],
      options: [
        {
          option_id: 'opt-41',
          title: 'Targeted Vector Fogging & Bed Buffer Prep',
          description: 'Deploy sanitation fogging teams and prepare overflow OPD intake.',
          affected_departments: ['HEALTH', 'MUNICIPAL'],
          preventive_actions: [
            '[District Health] Allocate reserve OPD intake.',
            '[Kanpur Nagar Nigam] Conduct anti-larval fogging.',
          ],
          is_scos_recommended: true,
        },
      ],
      scos_recommendation: 'Targeted Vector Fogging & Bed Buffer Prep',
      rationale: 'Early municipal fogging suppresses vector density prior to peak transmission.',
    },
    nearby_infrastructure: [
      { id: 'inf-41', name: 'Ursula Horsman District Hospital Complex', type: 'HOSPITAL', distance_meters: 150, criticality: 'CRITICAL', description: 'Central public hospital facility.' },
      { id: 'inf-42', name: 'GSVM Medical College Emergency Hub', type: 'HOSPITAL', distance_meters: 1200, criticality: 'CRITICAL', description: 'Super-specialty referral facility.' },
    ],
    historical_pattern: {
      previous_incidents_count: 5,
      time_patterns: 'Post-monsoon seasonal peaks (August - October).',
      recurring_categories: ['PUBLIC_HEALTH_INCIDENT', 'SANITATION_ISSUE'],
      previous_response_outcomes: 'Pre-season fogging reduced seasonal OPD spikes by 28%.',
      similarity_score: 79,
    },
    early_warning_status: 'NONE',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    is_simulated: true,
  },
];

export const PREDICTIVE_DEMO_STEPS: PredictiveDemoStep[] = [
  { step: 1, title: 'Simulated Rainfall Telemetry Peak', actor: 'SCOS Doppler Radar Feed', role: 'TELEMETRY', description: 'Simulated cloudburst precipitation intensity spikes to 84mm/hr over Zone 2 (Parade Crossing).', phase_type: 'RAINFALL_INGESTION' },
  { step: 2, title: 'Urban Condition SCOS Detection', actor: 'SCOS Telemetry Engine', role: 'SYSTEM', description: 'SCOS detects simultaneous rainfall surge, high drainage surcharge (88%), and arterial road traffic density.', phase_type: 'PATTERN_DETECTION' },
  { step: 3, title: 'Historical Pattern Correlation', actor: 'SCOS Pattern Analysis Module', role: 'ANALYTICS', description: 'Matches 4 historical monsoon waterlogging events at Parade Crossing with 94% similarity index.', phase_type: 'RISK_SCORING' },
  { step: 4, title: 'Composite Risk Score Escalation', actor: 'SCOS Risk Calculator', role: 'ENGINE', description: 'Waterlogging Risk Score rises from 32 (LOW) to 78 (HIGH). Threshold triggers Early Warning.', phase_type: 'ZONE_MAPPING' },
  { step: 5, title: 'Spatial Zone & Infrastructure Impact Mapping', actor: 'GIS Spatial Intelligence Engine', role: 'GIS', description: 'Identifies Zone Parade Crossing as primary impact area, highlighting 3 critical facilities (Ursula Hospital, Mall Road Flyover, Jajmau Outfall #2).', phase_type: 'DEPT_IDENTIFICATION' },
  { step: 6, title: 'AI Operational Reasoning Generation', actor: 'SCOS AI Intelligence Agent', role: 'AI_AGENT', description: 'Generates concise operational explanation and multi-department impact assessment.', phase_type: 'AI_EXPLANATION' },
  { step: 7, title: 'Cross-Department Identification', actor: 'SCOS Coordination Kernel', role: 'SYSTEM', description: 'Identifies 4 responsible departments: Municipal (Pumps), Traffic (Diversions), Water (Outfall), and Health (Hospital access).', phase_type: 'PREVENTIVE_RECOMMEND' },
  { step: 8, title: 'Preventive Actions Generation', actor: 'SCOS Recommendation Generator', role: 'AI_AGENT', description: 'Formulates 4 specific PREVENTIVE tasks to prevent waterlogging before surface runoff peaks.', phase_type: 'EARLY_WARNING' },
  { step: 9, title: 'Early Warning Issued to District Officer', actor: 'SCOS Command Center', role: 'SYSTEM', description: 'Early Warning card flagged as AWAITING HUMAN REVIEW on District Magistrate dashboard.', phase_type: 'OFFICER_REVIEW' },
  { step: 10, title: 'Human Officer Approval', actor: 'Dr. R. K. Verma', role: 'DISTRICT_ADMIN', description: 'District Officer reviews Decision Support Panel and approves Option 1 (Proactive Pre-positioning).', phase_type: 'OFFICER_APPROVAL' },
  { step: 11, title: 'Preventive Task Dispatch', actor: 'SCOS Coordination Kernel', role: 'SYSTEM', description: '4 PREVENTIVE tasks created in SCOS Kernel with type PREVENTIVE and dispatched to department queues.', phase_type: 'PREVENTIVE_TASK_DISPATCH' },
  { step: 12, title: 'Department Acknowledgments', actor: 'Kanpur Nagar Nigam & Traffic Police', role: 'DEPARTMENT_OFFICER', description: 'Municipal pump team #3 and Traffic squad #1 acknowledge tasks and initiate deployment.', phase_type: 'DEPT_ACKNOWLEDGMENT' },
  { step: 13, title: 'Real-time Risk Monitoring Active', actor: 'SCOS Sensor Grid', role: 'TELEMETRY', description: 'Real-time sensors monitor pump operation, traffic flow, and water levels at Parade Crossing.', phase_type: 'RISK_MONITORING' },
  { step: 14, title: 'Intervention Success & Risk Reduction', actor: 'SCOS Predictive Intelligence Engine', role: 'ENGINE', description: 'Pre-positioned pumps prevent water accumulation. Risk score decreases from 78 (HIGH) to 32 (LOW).', phase_type: 'INTERVENTION_SUCCESS' },
  { step: 15, title: 'Audit Trail & Thesis Metrics Sealed', actor: 'SCOS Audit Logger', role: 'AUDIT', description: 'Complete end-to-end timeline logged with full human-in-the-loop verification and research metrics updated.', phase_type: 'TIMELINE_SEALED' },
];

class PredictionStoreService {
  private riskZones: RiskZone[] = JSON.parse(JSON.stringify(INITIAL_RISK_ZONES));
  private scenarioResultsHistory: WhatIfScenarioResult[] = [];
  private currentDemoStepIndex: number = 0; // 0 = idle / ready
  private isDemoRunning: boolean = false;
  private metrics: ResearchMetrics = {
    total_risks_detected: 14,
    high_critical_risks_count: 3,
    prediction_response_time_ms: 180,
    recommendation_acceptance_rate_percent: 92.5,
    preventive_actions_created_count: 8,
    cross_department_actions_count: 12,
    false_positive_rate_percent: 4.2,
    system_reliability_uptime_percent: 99.94,
  };

  public getAllRiskZones(): RiskZone[] {
    return [...this.riskZones];
  }

  public getRiskZoneById(id: string): RiskZone | undefined {
    return this.riskZones.find((z) => z.zone_id === id);
  }

  public getMetrics(): ResearchMetrics {
    return { ...this.metrics };
  }

  public getCurrentDemoStep(): PredictiveDemoStep | null {
    if (this.currentDemoStepIndex <= 0) return null;
    return PREDICTIVE_DEMO_STEPS[this.currentDemoStepIndex - 1] || null;
  }

  public getDemoStepIndex(): number {
    return this.currentDemoStepIndex;
  }

  public isScenarioRunning(): boolean {
    return this.isDemoRunning;
  }

  /**
   * Approves an Early Warning & Dispatches PREVENTIVE tasks to SCOS Incident Engine
   */
  public approveEarlyWarning(
    zoneId: string,
    officerName: string,
    officerRole: string
  ): { success: boolean; createdIncidentId?: string; message: string } {
    const zone = this.getRiskZoneById(zoneId);
    if (!zone) return { success: false, message: 'Risk zone not found' };

    const now = new Date().toISOString();
    zone.early_warning_status = 'APPROVED';
    zone.reviewed_by = officerName;
    zone.reviewed_at = now;
    zone.updated_at = now;

    // Create or find an incident in incidentStore to attach preventive tasks
    const incidentData = {
      title: `[PREVENTIVE ACTIONS] ${zone.zone_name} — Early Warning Intervention`,
      description: `[PREVENTIVE - SCOS Early Warning] ${zone.ai_operational_explanation}`,
      category: zone.use_case === 'WATERLOGGING' ? ('WATERLOGGING' as const) : ('INFRASTRUCTURE_FAILURE' as const),
      subcategory: 'Preventive Early Warning',
      location: zone.zone_name,
      latitude: zone.center_lat,
      longitude: zone.center_lng,
      ward_zone: zone.ward_zone,
      severity: zone.risk_level,
      priority: zone.risk_level === 'CRITICAL' ? ('P1' as const) : ('P2' as const),
      source: 'AI_SENSOR_GRID' as const,
      reported_at: now,
      current_status: 'IN_PROGRESS' as const,
      affected_departments: zone.affected_departments,
      primary_department: zone.affected_departments[0] || 'MUNICIPAL',
      secondary_departments: zone.affected_departments.slice(1),
      estimated_impact: `Preventive deployment targeting ${zone.risk_level} level ${zone.use_case.toLowerCase()} risk.`,
      created_by: officerName,
      approved_by: officerName,
      escalation_level: 0,
    };

    const newInc = incidentStore.createIncident(incidentData);

    // Create PREVENTIVE tasks
    const preventiveTasks = zone.recommended_preventive_actions.map((action, idx) => {
      const deptMatch = action.match(/\[(.*?)\]/);
      const deptName = deptMatch ? deptMatch[1] : 'Municipal';
      let deptCode = 'MUNICIPAL';
      if (deptName.includes('Traffic')) deptCode = 'TRAFFIC';
      else if (deptName.includes('Jal') || deptName.includes('Water')) deptCode = 'WATER';
      else if (deptName.includes('Health')) deptCode = 'HEALTH';

      return {
        task_id: `PREV-TASK-${newInc.incident_id.replace('SCOS-INC-', '')}-${idx + 1}`,
        incident_id: newInc.incident_id,
        department_id: deptCode,
        department_name: deptName,
        task_type: 'PREVENTIVE' as const,
        task_description: action.replace(/^\[.*?\]\s*/, ''),
        priority: newInc.priority,
        status: 'ASSIGNED' as const,
        due_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        demo_sla_minutes: 45,
        created_at: now,
        updated_at: now,
        escalation_status: 'NORMAL' as const,
        notes: [
          {
            id: `note-prev-${Date.now()}-${idx}`,
            authorName: 'SCOS Predictive Intelligence',
            authorRole: 'SYSTEM',
            text: `Generated from Approved Early Warning (${zone.risk_score}/100 Risk Score). Objective: Preventive deployment before impact peak.`,
            timestamp: now,
          },
        ],
        evidence_attachments: [],
      };
    });

    // Directly set tasks in incidentStore
    incidentStore.approveAIRecommendation(newInc.incident_id, officerName, officerRole, preventiveTasks);

    // Add audit timeline event
    incidentStore.addTimelineEvent({
      incident_id: newInc.incident_id,
      event_type: 'PREVENTIVE_RECOMMENDATION_APPROVED',
      title: 'Early Warning Approved & Preventive Tasks Dispatched',
      description: `${officerName} approved Option 1 for ${zone.zone_name}. Dispatched ${preventiveTasks.length} preventive tasks to departments.`,
      actor_name: officerName,
      actor_role: officerRole,
    });

    // Update metrics
    this.metrics.preventive_actions_created_count += preventiveTasks.length;
    this.metrics.cross_department_actions_count += zone.affected_departments.length;

    return {
      success: true,
      createdIncidentId: newInc.incident_id,
      message: `Early Warning approved! ${preventiveTasks.length} PREVENTIVE tasks dispatched to departments.`,
    };
  }

  public dismissEarlyWarning(zoneId: string, officerName: string, reason: string): boolean {
    const zone = this.getRiskZoneById(zoneId);
    if (!zone) return false;

    const now = new Date().toISOString();
    zone.early_warning_status = 'DISMISSED';
    zone.reviewed_by = officerName;
    zone.reviewed_at = now;
    zone.updated_at = now;
    return true;
  }

  public modifyEarlyWarningActions(
    zoneId: string,
    updatedActions: string[],
    officerName: string
  ): boolean {
    const zone = this.getRiskZoneById(zoneId);
    if (!zone) return false;

    const now = new Date().toISOString();
    zone.recommended_preventive_actions = updatedActions;
    zone.early_warning_status = 'MODIFIED';
    zone.reviewed_by = officerName;
    zone.reviewed_at = now;
    zone.updated_at = now;
    return true;
  }

  public async runWhatIfAnalysis(input: WhatIfScenarioInput): Promise<WhatIfScenarioResult> {
    const result = await runAIWhatIfSimulation(input);
    this.scenarioResultsHistory.unshift(result);
    return result;
  }

  public getScenarioHistory(): WhatIfScenarioResult[] {
    return [...this.scenarioResultsHistory];
  }

  /**
   * Advances or runs the 15-step End-to-End Predictive Demonstration Scenario
   */
  public advanceDemoScenarioStep(): { step: PredictiveDemoStep; isComplete: boolean; zone: RiskZone } {
    this.isDemoRunning = true;
    if (this.currentDemoStepIndex < PREDICTIVE_DEMO_STEPS.length) {
      this.currentDemoStepIndex += 1;
    }

    const currentStep = PREDICTIVE_DEMO_STEPS[this.currentDemoStepIndex - 1];
    const paradeZone = this.getRiskZoneById('ZONE-PARADE-CROSSING')!;

    // Perform state modifications based on current step
    if (currentStep.step === 1 || currentStep.step === 2) {
      paradeZone.risk_score = 78;
      paradeZone.risk_level = 'HIGH';
      paradeZone.early_warning_status = 'AWAITING_REVIEW';
    } else if (currentStep.step === 10) {
      this.approveEarlyWarning('ZONE-PARADE-CROSSING', 'Dr. R. K. Verma (DM Kanpur)', 'DISTRICT_ADMIN');
    } else if (currentStep.step === 14) {
      paradeZone.risk_score = 32;
      paradeZone.risk_level = 'LOW';
      paradeZone.trend = 'DECREASING';
      paradeZone.early_warning_status = 'APPROVED';
    }

    const isComplete = this.currentDemoStepIndex >= PREDICTIVE_DEMO_STEPS.length;
    if (isComplete) {
      this.isDemoRunning = false;
    }

    return {
      step: currentStep,
      isComplete,
      zone: paradeZone,
    };
  }

  public resetDemoScenario(): void {
    this.riskZones = JSON.parse(JSON.stringify(INITIAL_RISK_ZONES));
    this.currentDemoStepIndex = 0;
    this.isDemoRunning = false;
  }
}

export const predictionStore = new PredictionStoreService();
