import { apiRequest } from './apiClient';
import {
  DepartmentImpactAnalysis,
  CoordinationMatrixRow,
  RecommendedTask,
} from '../types/departmentCoordination';
import { DepartmentTask, IncidentPriority } from '../types/incident';
import { departmentImpactEngine } from './departmentImpactEngine';

export const coordinationService = {
  /**
   * Get department impact analysis for an incident
   */
  async getDepartmentImpact(incidentId: string): Promise<DepartmentImpactAnalysis> {
    try {
      const res = await apiRequest<{ analysis: DepartmentImpactAnalysis }>(
        `/api/coordination/incident/${incidentId}/impact`
      );
      return res.analysis;
    } catch {
      // Local fallback
      const cached = departmentImpactEngine.getCachedAnalysis(incidentId);
      if (cached) return cached;
      throw new Error(`Failed to load department impact for incident ${incidentId}`);
    }
  },

  /**
   * Get SCOS department coordination matrix
   */
  async getCoordinationMatrix(incidentId: string): Promise<CoordinationMatrixRow[]> {
    try {
      const res = await apiRequest<{ matrix: CoordinationMatrixRow[] }>(
        `/api/coordination/incident/${incidentId}/matrix`
      );
      return res.matrix;
    } catch {
      return departmentImpactEngine.getCoordinationMatrix(incidentId);
    }
  },

  /**
   * Submit human review decision (APPROVE, MODIFY, REJECT) for a recommended task
   */
  async reviewRecommendation(
    incidentId: string,
    recommendationId: string,
    decision: 'APPROVE' | 'MODIFY' | 'REJECT',
    modifications?: {
      taskTitle?: string;
      taskDescription?: string;
      priority?: IncidentPriority;
      departmentId?: string;
    },
    reviewNotes?: string
  ): Promise<{ updatedRecommendation: RecommendedTask; createdTask?: Partial<DepartmentTask> }> {
    try {
      return await apiRequest<{
        updatedRecommendation: RecommendedTask;
        createdTask?: Partial<DepartmentTask>;
      }>(`/api/coordination/recommendation/${recommendationId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          incidentId,
          decision,
          modifications,
          reviewNotes,
        }),
      });
    } catch (err: any) {
      // Local fallback execution if server endpoint is unreachable
      const dummyActor = {
        id: 'user-dm',
        email: 'dm@kanpur.gov.in',
        fullName: 'District Magistrate Kanpur',
        role: 'DISTRICT_ADMIN',
      };
      return departmentImpactEngine.reviewRecommendation(
        incidentId,
        recommendationId,
        decision,
        dummyActor,
        modifications,
        reviewNotes
      );
    }
  },
};
