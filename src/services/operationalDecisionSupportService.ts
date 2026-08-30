/**
 * SCOS Phase 8.5C — Operational Decision Support Service
 * Synthesizes cross-departmental intelligence, predictive risk, civil infrastructure proximity,
 * and SLA data into transparent, evidence-linked decision options.
 * 
 * CORE PRINCIPLE: SCOS does NOT autonomously execute emergency actions.
 * All decision options are proposed for authorized human review and approval.
 */

import {
  OperationalDecisionSupportSnapshot,
  DecisionSituation,
  DecisionOption,
  DecisionEvidenceItem,
  DecisionInfrastructureImpact,
  DecisionDepartment,
  DecisionFactorScore,
  DecisionUncertainty,
  DecisionPriority,
  DecisionConfidence,
  DecisionReviewPayload,
  DecisionGovernanceMetadata,
} from '../types/operationalDecisionSupport';

import { incidentStore } from './incidentStore';
import { predictionStore } from './predictionStore';
import { infrastructureStore } from './infrastructureStore';
import { departmentProfileStore } from './departmentProfileStore';
import { dataSourceStore, computeFreshness } from './dataSourceStore';
import { dbStore } from '../backend/db/store';
import { Incident } from '../types/incident';

class OperationalDecisionSupportService {
  // In-memory store for human review decisions on options (indexed by incidentId:optionId)
  private decisionReviews: Map<string, {
    reviewedBy: string;
    reviewedAt: string;
    action: 'APPROVE' | 'MODIFY' | 'REJECT';
    notes?: string;
    modifiedActions?: string[];
  }> = new Map();

  /**
   * Generates a transparent, evidence-linked decision support snapshot for a specific incident.
   */
  public getDecisionSupportSnapshot(incidentId?: string): OperationalDecisionSupportSnapshot {
    // 1. Resolve Target Incident
    let incident: Incident | undefined;
    if (incidentId) {
      incident = incidentStore.getIncidentById(incidentId);
    }
    
    // Fallback to active/critical demo incident if not found or unspecified
    if (!incident) {
      const allIncidents = incidentStore.getAllIncidents();
      incident = allIncidents.find((i) => i.severity === 'CRITICAL' || i.incident_id === 'SCOS-INC-1024') || allIncidents[0];
    }

    if (!incident) {
      return this.generateEmptyFallbackSnapshot(incidentId || 'UNAVAILABLE');
    }

    // 2. Gather Contextual Intelligence from Existing Stores
    const riskZones = predictionStore.getAllRiskZones();
    const riskZone = riskZones.find((z) => z.ward_zone === incident?.ward_zone || z.zone_id === incident?.ward_zone) || riskZones[0];
    const riskScore = riskZone ? riskZone.risk_score : (incident.severity === 'CRITICAL' ? 85 : 60);

    const nearbyAssets = infrastructureStore.getNearbyAssets(incident.latitude, incident.longitude, 2.5);
    const departmentProfiles = departmentProfileStore.getAllProfiles();
    const dataSources = dataSourceStore.getAllSources();

    const nowIso = new Date().toISOString();

    // 3. Build Situation Model
    const criticalFacilitiesNearby = nearbyAssets
      .filter((a) => a.asset.assetType === 'HOSPITAL' || a.asset.criticality === 'CRITICAL')
      .map((a) => `${a.asset.assetName} (${Number(a.distanceKm).toFixed(2)}km)`);

    const situation: DecisionSituation = {
      incidentId: incident.incident_id,
      incidentTitle: incident.title || 'UNAVAILABLE',
      category: incident.category,
      severity: incident.severity,
      location: incident.location || 'UNAVAILABLE',
      wardZone: incident.ward_zone || 'UNAVAILABLE',
      coordinates: {
        latitude: incident.latitude,
        longitude: incident.longitude,
      },
      reportedAt: incident.reported_at || incident.timestamps?.created_at || nowIso,
      currentStatus: incident.current_status || 'UNAVAILABLE',
      escalationLevel: incident.escalation_level || 0,
      slaBreachRisk: (incident.escalation_level && incident.escalation_level > 0) || incident.assigned_tasks.some((t) => t.escalation_status !== 'NORMAL'),
      primaryDepartment: incident.primary_department || 'UNAVAILABLE',
      affectedDepartments: incident.affected_departments && incident.affected_departments.length > 0 ? incident.affected_departments : ['NONE'],
      criticalFacilitiesNearby: criticalFacilitiesNearby.length > 0 ? criticalFacilitiesNearby : ['NONE_RECORDED'],
    };

    // 4. Calculate Contributing Factors for Prototype Prioritization
    const severityScore = incident.severity === 'CRITICAL' ? 95 : incident.severity === 'HIGH' ? 75 : incident.severity === 'MEDIUM' ? 50 : 25;
    const predictiveScore = Math.min(100, Math.max(0, riskScore));
    const hasCriticalInfra = nearbyAssets.some((a) => a.asset.criticality === 'CRITICAL' && Number(a.distanceKm) <= 1.5);
    const infraScore = hasCriticalInfra ? 90 : nearbyAssets.length > 0 ? 65 : 30;
    const hospitalNearby = nearbyAssets.some((a) => a.asset.assetType === 'HOSPITAL' && Number(a.distanceKm) <= 1.0);
    const facilityProximityScore = hospitalNearby ? 95 : criticalFacilitiesNearby.length > 0 ? 70 : 25;
    const slaScore = situation.slaBreachRisk ? 85 : 35;
    const escScore = situation.escalationLevel >= 2 ? 90 : situation.escalationLevel === 1 ? 65 : 20;
    const deptLoadScore = Math.min(100, (incident.affected_departments?.length || 1) * 25);
    
    // Freshness calculation from sources
    const freshSourcesCount = dataSources.filter((s) => computeFreshness(s.lastUpdated, s.updateFrequency) === 'FRESH').length;
    const freshnessReliability = dataSources.length > 0 ? Math.round((freshSourcesCount / dataSources.length) * 100) : 80;
    const freshnessScore = freshnessReliability;

    const factors: DecisionFactorScore[] = [
      {
        factor: 'INCIDENT_SEVERITY',
        label: 'Incident Severity',
        score: severityScore,
        weight: 0.20,
        weightedContribution: severityScore * 0.20,
        contributingData: `Severity Level: ${incident.severity} (${severityScore}/100)`,
      },
      {
        factor: 'PREDICTIVE_RISK',
        label: 'Predictive Risk Index',
        score: predictiveScore,
        weight: 0.20,
        weightedContribution: predictiveScore * 0.20,
        contributingData: `Zone Risk Score: ${predictiveScore}/100 (${riskZone?.risk_level || 'EVALUATED'})`,
      },
      {
        factor: 'INFRASTRUCTURE_CRITICALITY',
        label: 'Infrastructure Criticality',
        score: infraScore,
        weight: 0.15,
        weightedContribution: infraScore * 0.15,
        contributingData: `${nearbyAssets.length} nearby assets identified within 2.5km buffer`,
      },
      {
        factor: 'CRITICAL_FACILITY_PROXIMITY',
        label: 'Critical Facility Proximity',
        score: facilityProximityScore,
        weight: 0.15,
        weightedContribution: facilityProximityScore * 0.15,
        contributingData: hospitalNearby ? 'Ursula Horsman Memorial Hospital within 450m' : 'Standard urban corridor',
      },
      {
        factor: 'SLA_STATUS',
        label: 'SLA Compliance / Risk',
        score: slaScore,
        weight: 0.10,
        weightedContribution: slaScore * 0.10,
        contributingData: situation.slaBreachRisk ? 'Active SLA Escalation or breach risk detected' : 'Within normal response time window',
      },
      {
        factor: 'ESCALATION_LEVEL',
        label: 'Hierarchical Escalation',
        score: escScore,
        weight: 0.08,
        weightedContribution: escScore * 0.08,
        contributingData: situation.escalationLevel > 0 ? `Tier ${situation.escalationLevel} Escalation active` : 'Tier 0 standard dispatch',
      },
      {
        factor: 'DEPARTMENT_LOAD',
        label: 'Inter-Agency Coordination Load',
        score: deptLoadScore,
        weight: 0.07,
        weightedContribution: deptLoadScore * 0.07,
        contributingData: `${incident.affected_departments?.length || 1} departments required for resolution`,
      },
      {
        factor: 'DATA_FRESHNESS',
        label: 'Telemetry Provenance & Freshness',
        score: freshnessScore,
        weight: 0.05,
        weightedContribution: freshnessScore * 0.05,
        contributingData: `${freshSourcesCount}/${dataSources.length} registered feeds in FRESH state`,
      },
    ];

    const overallPriorityScore = Math.round(
      factors.reduce((sum, f) => sum + f.weightedContribution, 0)
    );

    const priorityLevel: DecisionPriority =
      overallPriorityScore >= 80 ? 'CRITICAL' : overallPriorityScore >= 60 ? 'HIGH' : overallPriorityScore >= 40 ? 'MEDIUM' : 'LOW';

    // 5. Gather Supporting Evidence Items
    const supportingEvidence: DecisionEvidenceItem[] = [
      {
        evidenceId: 'EVID-INCIDENT-SEVERITY',
        sourceType: 'INCIDENT_TELEMETRY',
        title: `Incident Severity: ${incident.severity}`,
        description: incident.description || incident.title,
        dataFreshness: 'FRESH',
        provenance: `SCOS Incident Store (${incident.incident_id})`,
        confidenceScore: 0.95,
        validationStatus: 'FULLY_VERIFIED',
        isSimulated: true,
      },
      {
        evidenceId: 'EVID-PREDICTIVE-RISK',
        sourceType: 'PREDICTIVE_RISK_MODEL',
        title: `Predictive Risk: ${riskZone?.zone_name || incident.ward_zone} (Score ${predictiveScore}/100)`,
        description: `Early warning model forecasts high probability of arterial road blockage and drainage surcharge during storm event.`,
        dataFreshness: 'FRESH',
        provenance: `SCOS Predictive Intelligence Model (Zone: ${riskZone?.zone_id || 'KN-ZONE'})`,
        confidenceScore: 0.88,
        validationStatus: 'FULLY_VERIFIED',
        isSimulated: true,
      },
      {
        evidenceId: 'EVID-INFRA-HOSPITAL',
        sourceType: 'CIVIL_INFRASTRUCTURE_GRAPH',
        title: 'Critical Healthcare Asset: Ursula Horsman Hospital Proximity',
        description: '450-bed emergency hospital located within 450m of active waterlogging hotspot. Unobstructed ambulance transit corridor required.',
        dataFreshness: 'FRESH',
        provenance: 'Kanpur Civil Infrastructure GIS Layer (ASSET-KN-HOSP-01)',
        confidenceScore: 0.92,
        validationStatus: 'FULLY_VERIFIED',
        isSimulated: true,
      },
      {
        evidenceId: 'EVID-INFRA-DRAINAGE',
        sourceType: 'CIVIL_INFRASTRUCTURE_GRAPH',
        title: 'Primary Civil Drainage: Parade Arterial Storm Drain',
        description: 'Main storm drainage capacity reduced due to rapid runoff volume. Dewatering intervention required to prevent backflow.',
        dataFreshness: 'FRESH',
        provenance: 'Kanpur Jal Sansthan Asset Registry (ASSET-KN-DRAIN-01)',
        confidenceScore: 0.90,
        validationStatus: 'FULLY_VERIFIED',
        isSimulated: true,
      },
      {
        evidenceId: 'EVID-DEPT-CAPABILITIES',
        sourceType: 'DEPARTMENT_CAPABILITY_MATRIX',
        title: 'Inter-Agency Resource Allocation Matrix',
        description: `${incident.affected_departments?.length || 4} municipal departments mapped with specialized personnel and equipment profiles.`,
        dataFreshness: 'FRESH',
        provenance: 'SCOS Multi-Department Coordination Engine (Phase 8.4)',
        confidenceScore: 0.94,
        validationStatus: 'FULLY_VERIFIED',
        isSimulated: true,
      },
    ];

    // 6. Build Affected Infrastructure List
    const affectedInfrastructure: DecisionInfrastructureImpact[] = nearbyAssets.slice(0, 4).map((a) => {
      const dist = Number(a.distanceKm);
      return {
        assetId: a.asset.assetId,
        assetName: a.asset.assetName,
        assetType: a.asset.assetType,
        criticality: a.asset.criticality,
        distanceKm: Number(dist.toFixed(2)),
        expectedDisruption: a.asset.assetType === 'HOSPITAL'
          ? 'Ambulance ingress/egress delay of 15-25 minutes without traffic management'
          : a.asset.assetType === 'ROAD'
          ? 'Arterial carriage waterlogging reducing vehicle throughput by 70%'
          : a.asset.assetType === 'DRAIN'
          ? 'Culvert surcharge exceeding design capacity by 35%'
          : 'Potential operational degradation under prolonged inundation',
        requiresVerification: dist > 1.0,
      };
    });

    // 7. Build Affected Departments List
    const affectedDepartmentsList: DecisionDepartment[] = (incident.affected_departments || ['MUNICIPAL', 'WATER', 'TRAFFIC', 'HEALTH']).map((code) => {
      const profile = departmentProfiles.find((p) => p.departmentCode === code || p.departmentName.toUpperCase().includes(code.toUpperCase()));
      const isPrimary = code === incident?.primary_department || (incident?.primary_department && code.includes(incident.primary_department));
      const caps = profile?.capabilities ? profile.capabilities.map((c) => String(c).replace(/_/g, ' ')).slice(0, 3) : ['Field Inspection', 'Rapid Response'];
      return {
        departmentCode: code,
        departmentName: profile?.departmentName || `${code} Department`,
        role: isPrimary ? 'PRIMARY_LEAD' : 'SECONDARY_SUPPORT',
        assignedCapabilities: caps,
        operationalReadiness: profile?.status === 'ACTIVE' ? 'READY' : 'DEGRADED',
      };
    });

    // 8. Generate Decision Options
    const options: DecisionOption[] = [
      // OPTION A: Dewatering & Drainage Priority
      {
        optionId: `${incident.incident_id}-OPT-A`,
        optionCode: 'OPTION_A',
        title: 'Option A: Prioritize Heavy Dewatering & Culvert Clearance',
        description: 'Deploy high-capacity mobile dewatering pumps (1500 LPM) to Parade Crossing and unblock arterial culverts to rapidly relieve flood levels.',
        priority: 'HIGH',
        rationale: 'Addresses the foundational hydraulic cause of water accumulation. Lowers standing water to restore road passage within an estimated 45–60 minutes.',
        supportingEvidence: supportingEvidence.filter((e) => e.evidenceId.includes('DRAINAGE') || e.evidenceId.includes('SEVERITY')),
        affectedInfrastructure: affectedInfrastructure.filter((i) => i.assetType === 'DRAIN' || i.assetType === 'ROAD'),
        affectedDepartments: affectedDepartmentsList.filter((d) => d.departmentCode === 'WATER' || d.departmentCode === 'MUNICIPAL' || d.role === 'PRIMARY_LEAD'),
        expectedOperationalImpact: 'EXPECTED: 60% reduction in surface water depth within 45 minutes. Requires temporary lane closure for mobile pump placement.',
        estimatedCoordinationLoad: 'MEDIUM',
        relatedIncidentId: incident.incident_id,
        relatedRiskZoneId: riskZone?.zone_id,
        confidence: 'HIGH',
        confidenceScore: 0.91,
        dataQuality: 'PROTOTYPE_ASSESSMENT',
        dataFreshness: 'FRESH',
        provenance: 'SCOS Operational Decision Engine / Hydraulic Domain Rules',
        requiresHumanApproval: true,
        executionStatus: this.getOptionReviewStatus(incident.incident_id, `${incident.incident_id}-OPT-A`),
        reviewMetadata: this.getOptionReviewMetadata(incident.incident_id, `${incident.incident_id}-OPT-A`),
      },

      // OPTION B: Emergency Traffic Diversion & Hospital Corridor Protection
      {
        optionId: `${incident.incident_id}-OPT-B`,
        optionCode: 'OPTION_B',
        title: 'Option B: Prioritize Traffic Diversion & Hospital Corridor Protection',
        description: 'Deploy traffic police units to Bada Chauraha and Mall Road junctions to establish a dedicated emergency corridor for Ursula Horsman Hospital.',
        priority: 'CRITICAL',
        rationale: 'Prioritizes life-safety and emergency medical access. Mitigates the highest consequence vulnerability (hospital ambulance blockage) immediately.',
        supportingEvidence: supportingEvidence.filter((e) => e.evidenceId.includes('HOSPITAL') || e.evidenceId.includes('RISK')),
        affectedInfrastructure: affectedInfrastructure.filter((i) => i.assetType === 'HOSPITAL' || i.assetType === 'ROAD'),
        affectedDepartments: affectedDepartmentsList.filter((d) => d.departmentCode === 'TRAFFIC' || d.departmentCode === 'HEALTH'),
        expectedOperationalImpact: 'EXPECTED: Guarantees <5 min ambulance transit time to Ursula Horsman Hospital. May increase perimeter route congestion by 20%.',
        estimatedCoordinationLoad: 'MEDIUM',
        relatedIncidentId: incident.incident_id,
        relatedRiskZoneId: riskZone?.zone_id,
        confidence: 'HIGH',
        confidenceScore: 0.94,
        dataQuality: 'PROTOTYPE_ASSESSMENT',
        dataFreshness: 'FRESH',
        provenance: 'SCOS Operational Decision Engine / Public Safety & Healthcare Protocol',
        requiresHumanApproval: true,
        executionStatus: this.getOptionReviewStatus(incident.incident_id, `${incident.incident_id}-OPT-B`),
        reviewMetadata: this.getOptionReviewMetadata(incident.incident_id, `${incident.incident_id}-OPT-B`),
      },

      // OPTION C: Synchronized Joint Multi-Department Surge Response
      {
        optionId: `${incident.incident_id}-OPT-C`,
        optionCode: 'OPTION_C',
        title: 'Option C: Synchronized Joint Multi-Department Surge Response',
        description: 'Simultaneously execute coordinated dewatering (Jal Sansthan), emergency hospital routing (Traffic Police), public health disinfection (Health Dept), and debris clearing (Nagar Nigam).',
        priority: 'CRITICAL',
        rationale: 'Comprehensive multi-agency mitigation addressing hydraulic root cause, medical emergency access, and subsequent public sanitation risks concurrently.',
        supportingEvidence: supportingEvidence,
        affectedInfrastructure: affectedInfrastructure,
        affectedDepartments: affectedDepartmentsList,
        expectedOperationalImpact: 'EXPECTED: Fastest full-corridor recovery (estimated 35-45 mins) and zero ambulance interruption. Higher operational resource commitment across 4 departments.',
        estimatedCoordinationLoad: 'HIGH',
        relatedIncidentId: incident.incident_id,
        relatedRiskZoneId: riskZone?.zone_id,
        confidence: 'HIGH',
        confidenceScore: 0.95,
        dataQuality: 'PROTOTYPE_ASSESSMENT',
        dataFreshness: 'FRESH',
        provenance: 'SCOS Multi-Department Coordination Engine (Phase 8.4 Matrix)',
        requiresHumanApproval: true,
        executionStatus: this.getOptionReviewStatus(incident.incident_id, `${incident.incident_id}-OPT-C`),
        reviewMetadata: this.getOptionReviewMetadata(incident.incident_id, `${incident.incident_id}-OPT-C`),
      },
    ];

    // 9. Identify Uncertainties & Human Verification Needs
    const uncertainties: DecisionUncertainty[] = [
      {
        uncertaintyId: 'UNCERT-01',
        category: 'FIELD_VERIFICATION_PENDING',
        description: 'Sub-surface silt accumulation rate in Parade culverts is unverified by physical inspection crew.',
        mitigationRecommendation: 'Field supervisor must verify pump inlet suction clearance upon on-site arrival.',
        blockingForExecution: false,
      },
      {
        uncertaintyId: 'UNCERT-02',
        category: 'TELEMETRY_LATENCY',
        description: 'Rain gauge telemetry updates at 15-minute intervals; microburst rainfall volume may exceed forecast.',
        mitigationRecommendation: 'Maintain continuous radio contact with District EOC weather desk.',
        blockingForExecution: false,
      },
      {
        uncertaintyId: 'UNCERT-03',
        category: 'PROTOTYPE_SIMULATION_CONSTRAINT',
        description: 'All municipal feeds and operational response profiles are simulated prototype evaluation models.',
        mitigationRecommendation: 'Do not use as an autonomous execution trigger for real-world municipal machinery.',
        blockingForExecution: true,
      },
    ];

    // 10. Governance & Provenance Metadata
    const governance: DecisionGovernanceMetadata = {
      frameworkVersion: 'SCOS-DS-v8.5C',
      generatedAt: nowIso,
      generatedByService: 'SCOS Operational Decision Support Layer',
      districtCode: 'KANPUR_NAGAR',
      districtName: 'Kanpur Nagar District',
      dataClassification: 'SIMULATED / PROTOTYPE DATA — SCOS DECISION SUPPORT ENGINE',
      isSimulatedPrototype: true,
      humanInTheLoopDisclaimer: 'SCOS provides observational decision-support intelligence only. Autonomous emergency execution is strictly prohibited. An authorized municipal officer must review, modify, approve, or reject recommendations prior to task dispatch.',
      prioritizationModel: 'SCOS Multi-Factor Weighted Heuristic (Prototype V1)',
    };

    return {
      snapshotId: `ODS-SNAP-${Date.now()}`,
      generatedAt: nowIso,
      situation,
      prioritizationSummary: {
        overallPriorityScore,
        priorityLevel,
        contributingFactors: factors,
        prioritizationMethod: 'PROTOTYPE DECISION PRIORITIZATION',
      },
      evidenceSummary: {
        totalEvidenceItems: supportingEvidence.length,
        primaryEvidence: supportingEvidence,
        keyRiskFactors: [
          'Arterial waterlogging depth exceeding critical threshold',
          'Potential ambulance transit disruption to Ursula Horsman Hospital',
          'Heavy inter-departmental task dependencies across Water & Traffic',
          'Active rainfall alert in Kanpur Central Zone',
        ],
        whatWeKnow: [
          `Incident ${incident.incident_id} reported at ${incident.location} with severity ${incident.severity}.`,
          `Zone predictive risk score is ${predictiveScore}/100 with high storm runoff probability.`,
          `Ursula Horsman Hospital (450 beds) is within 450m of affected corridor.`,
          `${incident.affected_departments?.length || 4} municipal departments are mapped with response capabilities.`,
        ],
        whyScosSuggestsAction: `Severe localized waterlogging near Ursula Horsman Hospital creates acute risk of emergency healthcare cutoff and arterial gridlock. Multi-department intervention is recommended to clear drainage while protecting medical transit corridors.`,
      },
      options,
      uncertainties,
      humanGovernance: {
        requiresHumanReview: true,
        authorizedRoles: ['SUPER_ADMIN', 'DISTRICT_ADMIN', 'DEPARTMENT_ADMIN', 'DEPARTMENT_OFFICER', 'AI_GOVERNANCE_OFFICER'],
        currentReviewStatus: options.some((o) => o.executionStatus === 'APPROVED')
          ? 'APPROVED'
          : options.some((o) => o.executionStatus === 'MODIFIED')
          ? 'MODIFIED'
          : options.some((o) => o.executionStatus === 'REJECTED')
          ? 'REJECTED'
          : 'PROPOSED',
        auditLogCount: this.decisionReviews.size,
      },
      governance,
    };
  }

  /**
   * Records an authorized human officer's review of a decision option.
   * DOES NOT autonomously execute tasks. Maintains full audit trail.
   */
  public reviewDecisionOption(
    incidentId: string,
    payload: DecisionReviewPayload,
    userEmail: string,
    userRole: string,
    userId?: string
  ): { success: boolean; snapshot: OperationalDecisionSupportSnapshot; auditEventId: string } {
    const key = `${incidentId}:${payload.optionId}`;
    const nowIso = new Date().toISOString();

    const reviewRecord = {
      reviewedBy: userEmail,
      reviewedAt: nowIso,
      action: payload.action,
      notes: payload.officerNotes || '',
      modifiedActions: payload.modifiedInstructions || [],
    };

    this.decisionReviews.set(key, reviewRecord);

    // Audit Log Creation
    const auditEvent = dbStore.addAuditLog({
      actorId: userId || userEmail,
      actorEmail: userEmail,
      actorRole: userRole as any,
      action: payload.action === 'APPROVE'
        ? 'DECISION_OPTION_APPROVED'
        : payload.action === 'MODIFY'
        ? 'DECISION_OPTION_MODIFIED'
        : 'DECISION_OPTION_REJECTED',
      resource: `DECISION_SUPPORT:${incidentId}:${payload.optionId}`,
      details: {
        message: `Officer [${userEmail} (${userRole})] executed [${payload.action}] on Option [${payload.optionId}]. Notes: ${payload.officerNotes || 'None'}. Execution requires explicit manual dispatch.`,
        optionId: payload.optionId,
        action: payload.action,
        officerNotes: payload.officerNotes,
        modifiedInstructions: payload.modifiedInstructions,
      },
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    const snapshot = this.getDecisionSupportSnapshot(incidentId);

    return {
      success: true,
      snapshot,
      auditEventId: auditEvent.id,
    };
  }

  private getOptionReviewStatus(incidentId: string, optionId: string): 'PROPOSED' | 'REVIEWED' | 'APPROVED' | 'MODIFIED' | 'REJECTED' {
    const key = `${incidentId}:${optionId}`;
    const rec = this.decisionReviews.get(key);
    if (!rec) return 'PROPOSED';
    return rec.action === 'APPROVE' ? 'APPROVED' : rec.action === 'MODIFY' ? 'MODIFIED' : 'REJECTED';
  }

  private getOptionReviewMetadata(incidentId: string, optionId: string) {
    const key = `${incidentId}:${optionId}`;
    const rec = this.decisionReviews.get(key);
    if (!rec) return undefined;
    return {
      reviewedBy: rec.reviewedBy,
      reviewedAt: rec.reviewedAt,
      action: rec.action,
      notes: rec.notes,
      modifiedActions: rec.modifiedActions,
    };
  }

  private generateEmptyFallbackSnapshot(incidentId: string): OperationalDecisionSupportSnapshot {
    const nowIso = new Date().toISOString();
    return {
      snapshotId: `ODS-SNAP-FALLBACK-${Date.now()}`,
      generatedAt: nowIso,
      situation: {
        incidentId,
        incidentTitle: 'UNAVAILABLE',
        category: 'OTHER_URBAN_INCIDENT',
        severity: 'LOW',
        location: 'UNAVAILABLE',
        wardZone: 'UNAVAILABLE',
        coordinates: { latitude: 26.4499, longitude: 80.3319 },
        reportedAt: nowIso,
        currentStatus: 'UNAVAILABLE',
        escalationLevel: 0,
        slaBreachRisk: false,
        primaryDepartment: 'UNAVAILABLE',
        affectedDepartments: ['NONE'],
        criticalFacilitiesNearby: ['NONE'],
      },
      prioritizationSummary: {
        overallPriorityScore: 20,
        priorityLevel: 'LOW',
        contributingFactors: [],
        prioritizationMethod: 'PROTOTYPE DECISION PRIORITIZATION',
      },
      evidenceSummary: {
        totalEvidenceItems: 0,
        primaryEvidence: [],
        keyRiskFactors: ['UNAVAILABLE'],
        whatWeKnow: ['No active incident record found for specified identifier.'],
        whyScosSuggestsAction: 'UNAVAILABLE',
      },
      options: [],
      uncertainties: [],
      humanGovernance: {
        requiresHumanReview: true,
        authorizedRoles: ['SUPER_ADMIN', 'DISTRICT_ADMIN'],
        currentReviewStatus: 'PROPOSED',
        auditLogCount: 0,
      },
      governance: {
        frameworkVersion: 'SCOS-DS-v8.5C',
        generatedAt: nowIso,
        generatedByService: 'SCOS Operational Decision Support Layer',
        districtCode: 'KANPUR_NAGAR',
        districtName: 'Kanpur Nagar District',
        dataClassification: 'SIMULATED / PROTOTYPE DATA — SCOS DECISION SUPPORT ENGINE',
        isSimulatedPrototype: true,
        humanInTheLoopDisclaimer: 'SCOS provides observational decision-support intelligence only.',
        prioritizationModel: 'SCOS Multi-Factor Weighted Heuristic (Prototype V1)',
      },
    };
  }
}

export const operationalDecisionSupportService = new OperationalDecisionSupportService();
