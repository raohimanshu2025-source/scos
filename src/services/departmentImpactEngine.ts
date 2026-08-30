import { Incident, DepartmentTask, IncidentPriority } from '../types/incident';
import {
  DepartmentImpactAnalysis,
  RecommendedTask,
  CoordinationMatrixRow,
  DepartmentCoordinationRole,
  CoordinationVerificationStatus,
  RecommendationDecisionStatus,
  CoordinationStatus,
  SlaEscalationState,
} from '../types/departmentCoordination';
import { departmentProfileStore } from './departmentProfileStore';
import { infrastructureStore } from './infrastructureStore';
import { knowledgeGraphStore } from './knowledgeGraphStore';

class DepartmentImpactEngine {
  private recommendationsMap: Map<string, RecommendedTask[]> = new Map();
  private impactAnalysisMap: Map<string, DepartmentImpactAnalysis> = new Map();

  /**
   * Primary Analysis Method: Computes affected departments, infrastructure triggers,
   * priority roles, and generates transparent recommended tasks.
   */
  public analyzeIncidentImpact(
    incident: Incident,
    existingActiveTasks: DepartmentTask[] = []
  ): DepartmentImpactAnalysis {
    const incidentId = incident.incident_id;

    // 1. Identify nearby civil infrastructure assets using spatial coordinates
    const nearbyResults = infrastructureStore.getNearbyAssets(
      incident.latitude,
      incident.longitude,
      1500 // 1.5km spatial radius
    );

    const affectedInfraSummary = nearbyResults.map((res) => ({
      assetId: res.asset.assetId,
      assetName: res.asset.assetName,
      type: res.asset.assetType,
      condition: res.asset.condition,
    }));

    // If no infrastructure returned by spatial engine, fallback to category defaults
    if (affectedInfraSummary.length === 0) {
      if (incident.category === 'WATERLOGGING' || incident.category === 'DRAINAGE_FAILURE') {
        affectedInfraSummary.push(
          { assetId: 'INFRA-KNN-DR-01', assetName: 'Parade Market Primary Trunk Drain (Drainage Nala 17)', type: 'DRAIN', condition: 'POOR' },
          { assetId: 'INFRA-KNN-PUMP-01', assetName: 'Parade Ground Dewatering Pump Station B', type: 'PUMPING_STATION', condition: 'GOOD' }
        );
      } else {
        affectedInfraSummary.push({
          assetId: `INFRA-SPATIAL-${incidentId}`,
          assetName: `Civil Corridor at ${incident.location}`,
          type: 'ROAD',
          condition: 'FAIR',
        });
      }
    }

    // 2. Identify Departments & Priority Ranking
    let primaryDeptId = 'dept-nagar';
    let primaryDeptName = 'Kanpur Nagar Nigam (Municipal Corporation)';
    let primaryReason = 'General municipal territory oversight and public area response.';

    const secondaryDepartments: Array<{
      departmentId: string;
      departmentName: string;
      role: DepartmentCoordinationRole;
      reason: string;
    }> = [];

    // Rule-based department attribution according to incident category and civil infrastructure
    const cat = incident.category;
    if (cat === 'WATERLOGGING' || cat === 'DRAINAGE_FAILURE' || cat === 'FLOODING') {
      primaryDeptId = 'dept-jal';
      primaryDeptName = 'Kanpur Jal Sansthan (Water & Dewatering)';
      primaryReason = 'Primary responsibility for urban trunk drainage, dewatering pump operations, and flood abatement.';

      secondaryDepartments.push({
        departmentId: 'dept-traffic',
        departmentName: 'Kanpur Traffic Police',
        role: 'SECONDARY',
        reason: 'Waterlogging blocks arterial road corridor; requires traffic diversion and corridor safety management.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-health',
        departmentName: 'District Health Services',
        role: 'SUPPORT',
        reason: 'Potential blockage of hospital access route (Ursula Horsman Hospital); emergency health access protection required.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-nagar',
        departmentName: 'Kanpur Nagar Nigam (Municipal Corporation)',
        role: 'SUPPORT',
        reason: 'Public area silt clearance, municipal trash barrier removal, and post-waterlogging sanitation.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-dist',
        departmentName: 'District Administration Headquarters',
        role: 'INFORMATIONAL',
        reason: 'District Magistrate situation monitoring and inter-departmental escalation readiness.',
      });
    } else if (cat === 'MAJOR_ROAD_DAMAGE' || cat === 'TRAFFIC_CONGESTION' || cat === 'TRAFFIC_ACCIDENT') {
      primaryDeptId = 'dept-traffic';
      primaryDeptName = 'Kanpur Traffic Police';
      primaryReason = 'Primary responsibility for road traffic regulation, arterial corridor clearance, and signal control.';

      secondaryDepartments.push({
        departmentId: 'dept-pwd',
        departmentName: 'Public Works Department (PWD)',
        role: 'SECONDARY',
        reason: 'Arterial road surface damage requires civil engineering repair and structural resurfacing.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-nagar',
        departmentName: 'Kanpur Nagar Nigam',
        role: 'SUPPORT',
        reason: 'Road debris clearance and municipal streetlighting restoration.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-health',
        departmentName: 'District Health Services',
        role: 'INFORMATIONAL',
        reason: 'Emergency ambulance corridor monitoring.',
      });
    } else if (cat === 'PUBLIC_HEALTH_INCIDENT') {
      primaryDeptId = 'dept-health';
      primaryDeptName = 'District Health Services';
      primaryReason = 'Primary responsibility for public health containment, hospital coordination, and epidemic prevention.';

      secondaryDepartments.push({
        departmentId: 'dept-nagar',
        departmentName: 'Kanpur Nagar Nigam',
        role: 'SECONDARY',
        reason: 'Vector spraying, fogging, and solid waste sanitation management.',
      });

      secondaryDepartments.push({
        departmentId: 'dept-jal',
        departmentName: 'Kanpur Jal Sansthan',
        role: 'SUPPORT',
        reason: 'Water quality testing and contamination isolation.',
      });
    }

    // 3. Generate Recommended Tasks if not already cached
    let recommendedTasks = this.recommendationsMap.get(incidentId);
    if (!recommendedTasks || recommendedTasks.length === 0) {
      recommendedTasks = this.buildInitialRecommendations(incident, primaryDeptId, secondaryDepartments, affectedInfraSummary);
      this.recommendationsMap.set(incidentId, recommendedTasks);
    }

    // 4. Calculate SLA Escalation State
    let slaState: SlaEscalationState = 'NORMAL';
    if (existingActiveTasks.some((t) => t.escalation_status === 'ESCALATED_DM')) {
      slaState = 'ESCALATED';
    } else if (existingActiveTasks.some((t) => t.escalation_status === 'SLA_WARNING')) {
      slaState = 'APPROACHING_SLA';
    } else if (incident.severity === 'CRITICAL' || incident.severity === 'HIGH') {
      slaState = 'APPROACHING_SLA';
    }

    // 5. Determine Overall Coordination Status
    let coordStatus: CoordinationStatus = 'AWAITING_DECISION';
    const pendingRecs = recommendedTasks.filter((r) => r.decisionStatus === 'RECOMMENDED');
    const approvedRecs = recommendedTasks.filter((r) => r.decisionStatus === 'APPROVED' || r.decisionStatus === 'MODIFIED');

    if (existingActiveTasks.length > 0) {
      const allDone = existingActiveTasks.every((t) => t.status === 'COMPLETED');
      if (allDone) {
        coordStatus = 'COMPLETED';
      } else {
        coordStatus = 'COORDINATION_ACTIVE';
      }
    } else if (approvedRecs.length > 0 && pendingRecs.length === 0) {
      coordStatus = 'COORDINATION_ACTIVE';
    } else if (approvedRecs.length > 0) {
      coordStatus = 'PARTIALLY_COMPLETED';
    } else if (pendingRecs.length > 0) {
      coordStatus = 'AWAITING_DECISION';
    } else {
      coordStatus = 'ASSESSING';
    }

    const analysis: DepartmentImpactAnalysis = {
      incidentId,
      analyzedAt: new Date().toISOString(),
      coordinationStatus: coordStatus,
      primaryDepartment: {
        departmentId: primaryDeptId,
        departmentName: primaryDeptName,
        reason: primaryReason,
      },
      secondaryDepartments,
      affectedInfrastructure: affectedInfraSummary,
      recommendedTasks,
      activeTasks: existingActiveTasks,
      slaEscalationState: slaState,
      predictiveSupportingContext: incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
        ? `High spatial vulnerability detected near Parade Crossing corridor. Historical 2025 monsoon runoff data indicates severe waterlogging escalation risk within 30 minutes.`
        : undefined,
      isPrototypeAnalysis: true,
    };

    this.impactAnalysisMap.set(incidentId, analysis);

    // Sync Knowledge Graph Context
    this.syncGraphContext(incident, analysis);

    return analysis;
  }

  /**
   * Helper to construct initial recommended tasks for an incident
   */
  private buildInitialRecommendations(
    incident: Incident,
    primaryDeptId: string,
    secondaryDepartments: Array<{ departmentId: string; departmentName: string; role: DepartmentCoordinationRole; reason: string }>,
    affectedInfra: Array<{ assetId: string; assetName: string; type: string; condition: string }>
  ): RecommendedTask[] {
    const incId = incident.incident_id;
    const cat = incident.category;
    const recs: RecommendedTask[] = [];

    // Rec 1: Primary Department Action
    if (cat === 'WATERLOGGING' || cat === 'DRAINAGE_FAILURE' || cat === 'FLOODING') {
      const drainAsset = affectedInfra.find((a) => a.type === 'DRAIN') || affectedInfra[0];
      recs.push({
        recommendationId: `REC-${incId}-JAL-01`,
        incidentId: incId,
        departmentId: 'dept-jal',
        departmentName: 'Kanpur Jal Sansthan (Water & Dewatering)',
        coordinationRole: 'PRIMARY',
        responsibleCapability: 'DEWATERING',
        taskTitle: 'Deploy Dewatering Pump & Clear Parade Trunk Drain 17',
        taskDescription: 'Dispatch mobile high-capacity dewatering pump unit to Parade Crossing and clear silt obstructions at Drainage Nala Point 17.',
        priority: 'P1',
        sourceInfrastructure: drainAsset.assetName,
        infrastructureType: drainAsset.type,
        reason: `Dewatering recommended because the severe waterlogging at ${incident.location} stems from clogged Drainage Point 17 (${drainAsset.condition} condition).`,
        verificationStatus: 'POTENTIAL',
        decisionStatus: 'RECOMMENDED',
        requiresApproval: true,
        isPrototypeRecommendation: true,
      });

      // Rec 2: Secondary Traffic Police Action
      const roadAsset = affectedInfra.find((a) => a.type === 'ROAD') || { assetName: 'Parade Mall Road Junction', type: 'ROAD' };
      recs.push({
        recommendationId: `REC-${incId}-TRF-02`,
        incidentId: incId,
        departmentId: 'dept-traffic',
        departmentName: 'Kanpur Traffic Police',
        coordinationRole: 'SECONDARY',
        responsibleCapability: 'TRAFFIC_DIVERSION',
        taskTitle: 'Establish Emergency Traffic Diversion via Mall Road Bypass',
        taskDescription: 'Erect barricades at Parade Crossing intersection and redirect inbound vehicles toward Bada Chauraha bypass corridor to prevent vehicular stalling.',
        priority: 'P1',
        sourceInfrastructure: roadAsset.assetName,
        infrastructureType: roadAsset.type,
        reason: `Traffic diversion recommended because waterlogging on ${roadAsset.assetName} risks flooding vehicle engines and obstructing the primary hospital route.`,
        verificationStatus: 'POSSIBLE',
        decisionStatus: 'RECOMMENDED',
        dependsOnRecommendationIds: [`REC-${incId}-JAL-01`],
        requiresApproval: true,
        isPrototypeRecommendation: true,
      });

      // Rec 3: Support Health Services Action
      recs.push({
        recommendationId: `REC-${incId}-HEALTH-03`,
        incidentId: incId,
        departmentId: 'dept-health',
        departmentName: 'District Health Services',
        coordinationRole: 'SUPPORT',
        responsibleCapability: 'HOSPITAL_ACCESS',
        taskTitle: 'Monitor Ursula Horsman Emergency Hospital Access Corridor',
        taskDescription: 'Coordinate with traffic police to ensure designated ambulance priority lane remains unblocked along Civil Lines arterial route.',
        priority: 'P2',
        sourceInfrastructure: 'Ursula Horsman Memorial Hospital (450-bed)',
        infrastructureType: 'HOSPITAL',
        reason: `Hospital access monitoring recommended because Parade Crossing inundation threatens ambulance passage to Ursula Horsman Hospital.`,
        verificationStatus: 'REQUIRES_VERIFICATION',
        decisionStatus: 'RECOMMENDED',
        dependsOnRecommendationIds: [`REC-${incId}-TRF-02`],
        requiresApproval: true,
        isPrototypeRecommendation: true,
      });

      // Rec 4: Municipal Cleanup Action
      recs.push({
        recommendationId: `REC-${incId}-NAGAR-04`,
        incidentId: incId,
        departmentId: 'dept-nagar',
        departmentName: 'Kanpur Nagar Nigam',
        coordinationRole: 'SUPPORT',
        responsibleCapability: 'ROAD_CLEANUP',
        taskTitle: 'Post-Waterlogging Municipal Silt & Trash Removal',
        taskDescription: 'Deploy municipal sanitation squad for debris clearance and solid waste extraction following water recedence.',
        priority: 'P3',
        sourceInfrastructure: 'Ward 12 Parade Market Area',
        infrastructureType: 'MUNICIPAL_ASSET',
        reason: `Municipal cleanup recommended to remove accumulated floating waste and prevent secondary drain blockage once dewatering succeeds.`,
        verificationStatus: 'POSSIBLE',
        decisionStatus: 'RECOMMENDED',
        dependsOnRecommendationIds: [`REC-${incId}-JAL-01`],
        requiresApproval: true,
        isPrototypeRecommendation: true,
      });
    } else {
      // Default Recommendation for other incidents
      recs.push({
        recommendationId: `REC-${incId}-GEN-01`,
        incidentId: incId,
        departmentId: primaryDeptId,
        departmentName: primaryDeptId === 'dept-traffic' ? 'Kanpur Traffic Police' : 'Kanpur Nagar Nigam',
        coordinationRole: 'PRIMARY',
        responsibleCapability: primaryDeptId === 'dept-traffic' ? 'ROAD_CONTROL' : 'MUNICIPAL_RESPONSE',
        taskTitle: `Execute Field Response for ${incident.title}`,
        taskDescription: `Dispatch primary field squad to ${incident.location} to assess and mitigate ${incident.category}.`,
        priority: incident.priority || 'P2',
        sourceInfrastructure: affectedInfra[0]?.assetName || incident.location,
        infrastructureType: affectedInfra[0]?.type || 'ROAD',
        reason: `Primary departmental dispatch recommended based on incident classification as ${incident.category} in ${incident.ward_zone}.`,
        verificationStatus: 'POSSIBLE',
        decisionStatus: 'RECOMMENDED',
        requiresApproval: true,
        isPrototypeRecommendation: true,
      });
    }

    return recs;
  }

  /**
   * Reviews a recommendation with a human decision: APPROVE, MODIFY, or REJECT
   */
  public reviewRecommendation(
    incidentId: string,
    recommendationId: string,
    decision: 'APPROVE' | 'MODIFY' | 'REJECT',
    actor: { id: string; email: string; fullName: string; role: string },
    modifications?: {
      taskTitle?: string;
      taskDescription?: string;
      priority?: IncidentPriority;
      departmentId?: string;
    },
    reviewNotes?: string
  ): { updatedRecommendation: RecommendedTask; createdTask?: Partial<DepartmentTask> } {
    const recs = this.recommendationsMap.get(incidentId) || [];
    const recIndex = recs.findIndex((r) => r.recommendationId === recommendationId);

    if (recIndex === -1) {
      throw new Error(`Recommendation ${recommendationId} not found for incident ${incidentId}`);
    }

    const currentRec = { ...recs[recIndex] };
    const now = new Date().toISOString();

    currentRec.reviewedBy = actor.fullName;
    currentRec.reviewedByEmail = actor.email;
    currentRec.reviewedAt = now;
    currentRec.reviewNotes = reviewNotes || `Decision (${decision}) recorded by ${actor.fullName} (${actor.role})`;

    let createdTask: Partial<DepartmentTask> | undefined = undefined;

    if (decision === 'REJECT') {
      currentRec.decisionStatus = 'REJECTED';
    } else if (decision === 'MODIFY') {
      currentRec.decisionStatus = 'MODIFIED';
      currentRec.originalRecommendation = {
        taskTitle: recs[recIndex].taskTitle,
        taskDescription: recs[recIndex].taskDescription,
        priority: recs[recIndex].priority,
        departmentId: recs[recIndex].departmentId,
      };

      if (modifications?.taskTitle) currentRec.taskTitle = modifications.taskTitle;
      if (modifications?.taskDescription) currentRec.taskDescription = modifications.taskDescription;
      if (modifications?.priority) currentRec.priority = modifications.priority;
      if (modifications?.departmentId) {
        currentRec.departmentId = modifications.departmentId;
        const profile = departmentProfileStore.getProfileById(modifications.departmentId);
        if (profile) currentRec.departmentName = profile.departmentName;
      }
    } else if (decision === 'APPROVE') {
      currentRec.decisionStatus = 'APPROVED';
    }

    // Create createdTask payload if APPROVED or MODIFIED
    if (decision === 'APPROVE' || decision === 'MODIFY') {
      const createdTaskId = `TSK-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5)}`;
      currentRec.createdTaskId = createdTaskId;

      createdTask = {
        task_id: createdTaskId,
        incident_id: incidentId,
        department_id: currentRec.departmentId,
        department_name: currentRec.departmentName,
        task_description: `${currentRec.taskTitle}: ${currentRec.taskDescription}`,
        priority: currentRec.priority,
        status: 'ASSIGNED',
        due_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        demo_sla_minutes: currentRec.priority === 'P1' ? 60 : 120,
        created_at: now,
        updated_at: now,
        escalation_status: 'NORMAL',
        notes: [
          {
            id: `NOTE-${Date.now()}`,
            authorName: actor.fullName,
            authorRole: actor.role,
            text: `Approved from SCOS Coordination Recommendation (${currentRec.recommendationId}). ${reviewNotes || ''}`,
            timestamp: now,
          },
        ],
        evidence_attachments: [],
      };
    }

    recs[recIndex] = currentRec;
    this.recommendationsMap.set(incidentId, recs);

    return { updatedRecommendation: currentRec, createdTask };
  }

  /**
   * Computes SCOS Department Coordination Matrix
   */
  public getCoordinationMatrix(incidentId: string): CoordinationMatrixRow[] {
    const analysis = this.impactAnalysisMap.get(incidentId);
    if (!analysis) return [];

    const rows: CoordinationMatrixRow[] = [];

    // Primary Department Row
    const primaryProfile = departmentProfileStore.getProfileById(analysis.primaryDepartment.departmentId);
    const primaryRec = analysis.recommendedTasks.find((r) => r.departmentId === analysis.primaryDepartment.departmentId);

    rows.push({
      departmentId: analysis.primaryDepartment.departmentId,
      departmentName: analysis.primaryDepartment.departmentName,
      role: 'PRIMARY',
      affectedAsset: primaryRec?.sourceInfrastructure || analysis.affectedInfrastructure[0]?.assetName || 'Primary Asset',
      operationalResponsibility: primaryProfile?.description || analysis.primaryDepartment.reason,
      recommendedAction: primaryRec?.taskTitle || 'Execute Primary Response',
      status: primaryRec?.decisionStatus || 'RECOMMENDED',
      slaTargetMinutes: primaryProfile?.slaProfile.targetResponseMinutes || 30,
      recommendationId: primaryRec?.recommendationId,
      createdTaskId: primaryRec?.createdTaskId,
      dependsOn: primaryRec?.dependsOnRecommendationIds,
    });

    // Secondary Departments
    analysis.secondaryDepartments.forEach((sec) => {
      const profile = departmentProfileStore.getProfileById(sec.departmentId);
      const rec = analysis.recommendedTasks.find((r) => r.departmentId === sec.departmentId);

      rows.push({
        departmentId: sec.departmentId,
        departmentName: sec.departmentName,
        role: sec.role,
        affectedAsset: rec?.sourceInfrastructure || 'Corridor Area',
        operationalResponsibility: sec.reason,
        recommendedAction: rec?.taskTitle || 'Coordinated Field Support',
        status: rec?.decisionStatus || 'RECOMMENDED',
        slaTargetMinutes: profile?.slaProfile.targetResponseMinutes || 60,
        recommendationId: rec?.recommendationId,
        createdTaskId: rec?.createdTaskId,
        dependsOn: rec?.dependsOnRecommendationIds,
      });
    });

    return rows;
  }

  /**
   * Synchronizes Knowledge Graph nodes and relationships
   */
  private syncGraphContext(incident: Incident, analysis: DepartmentImpactAnalysis): void {
    try {
      const incEntityId = `INCIDENT-${incident.incident_id}`;

      // Upsert Incident Entity
      knowledgeGraphStore.createEntity({
        id: incEntityId,
        type: 'INCIDENT',
        name: incident.title,
        description: incident.description,
        source: 'OBSERVED',
        confidence: 0.98,
        status: 'ACTIVE',
        latitude: incident.latitude,
        longitude: incident.longitude,
        attributes: {
          category: incident.category,
          severity: incident.severity,
          ward_zone: incident.ward_zone,
        },
      });

      // Connect affected infrastructure
      analysis.affectedInfrastructure.forEach((infra) => {
        const infraId = infra.assetId;
        knowledgeGraphStore.createRelationship({
          id: `REL-INC-INFRA-${incident.incident_id}-${infraId}`,
          source_id: incEntityId,
          source_type: 'INCIDENT',
          relationship_type: 'AFFECTS',
          target_id: infraId,
          target_type: 'INFRASTRUCTURE',
          source: 'DERIVED',
        });
      });

      // Connect departments
      knowledgeGraphStore.createRelationship({
        id: `REL-INC-DEPT-PRIM-${incident.incident_id}`,
        source_id: incEntityId,
        source_type: 'INCIDENT',
        relationship_type: 'MANAGED_BY',
        target_id: analysis.primaryDepartment.departmentId,
        target_type: 'DEPARTMENT',
        source: 'DERIVED',
      });
    } catch {
      // Ignore if entity exists
    }
  }

  public getCachedAnalysis(incidentId: string): DepartmentImpactAnalysis | undefined {
    return this.impactAnalysisMap.get(incidentId);
  }

  public getCachedRecommendations(incidentId: string): RecommendedTask[] {
    return this.recommendationsMap.get(incidentId) || [];
  }
}

export const departmentImpactEngine = new DepartmentImpactEngine();
