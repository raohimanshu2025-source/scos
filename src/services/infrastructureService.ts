// =========================================================================
// SCOS CIVIL INFRASTRUCTURE FRONTEND SERVICE
// =========================================================================

import { apiRequest } from './apiClient';
import {
  CivilInfrastructureAsset,
  InfrastructureSummaryMetrics,
} from '../types/infrastructure';

export const infrastructureService = {
  /**
   * Fetch all civil infrastructure assets with optional filtering
   */
  async getAllAssets(filters?: {
    type?: string;
    department?: string;
    condition?: string;
    criticality?: string;
    zone?: string;
    ward?: string;
  }): Promise<{ success: boolean; count: number; data: CivilInfrastructureAsset[]; disclaimer: string }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.criticality) params.append('criticality', filters.criticality);
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.ward) params.append('ward', filters.ward);

    const queryString = params.toString();
    const endpoint = `/api/infrastructure${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ success: boolean; count: number; data: CivilInfrastructureAsset[]; disclaimer: string }>(
      endpoint
    );
  },

  /**
   * Fetch summary metrics for civil infrastructure assets
   */
  async getMetrics(): Promise<{ success: boolean; data: InfrastructureSummaryMetrics }> {
    return apiRequest<{ success: boolean; data: InfrastructureSummaryMetrics }>('/api/infrastructure/metrics');
  },

  /**
   * Fetch specific asset details and its Knowledge Graph neighborhood
   */
  async getAssetById(
    id: string
  ): Promise<{ success: boolean; data: { asset: CivilInfrastructureAsset; knowledgeGraphNeighborhood: any } }> {
    return apiRequest<{
      success: boolean;
      data: { asset: CivilInfrastructureAsset; knowledgeGraphNeighborhood: any };
    }>(`/api/infrastructure/${id}`);
  },

  /**
   * Create a new civil infrastructure asset
   */
  async createAsset(
    assetData: Partial<CivilInfrastructureAsset>
  ): Promise<{ success: boolean; message: string; data: CivilInfrastructureAsset }> {
    return apiRequest<{ success: boolean; message: string; data: CivilInfrastructureAsset }>('/api/infrastructure', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  },

  /**
   * Update condition, status, or criticality of an existing asset
   */
  async updateAsset(
    id: string,
    updates: Partial<CivilInfrastructureAsset>
  ): Promise<{ success: boolean; message: string; data: CivilInfrastructureAsset }> {
    return apiRequest<{ success: boolean; message: string; data: CivilInfrastructureAsset }>(
      `/api/infrastructure/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  },
};
