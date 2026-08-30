// =========================================================================
// SCOS SPATIAL INTELLIGENCE FRONTEND SERVICE
// =========================================================================

import { apiRequest } from './apiClient';
import { NearbyAssetResult, CivilCascadeImpact } from '../types/infrastructure';

export const spatialService = {
  /**
   * Perform spatial proximity query using Haversine distance engine
   */
  async getNearbyAssets(
    latitude: number,
    longitude: number,
    radiusMeters: number = 2000
  ): Promise<{
    success: boolean;
    query: { latitude: number; longitude: number; radiusMeters: number };
    count: number;
    data: NearbyAssetResult[];
    disclaimer: string;
  }> {
    const endpoint = `/api/spatial/nearby?lat=${latitude}&lon=${longitude}&radiusMeters=${radiusMeters}`;
    return apiRequest<{
      success: boolean;
      query: { latitude: number; longitude: number; radiusMeters: number };
      count: number;
      data: NearbyAssetResult[];
      disclaimer: string;
    }>(endpoint);
  },

  /**
   * Fetch civil infrastructure proximity and cascade impact analysis for an incident
   */
  async getIncidentImpact(
    incidentId: string,
    latitude?: number,
    longitude?: number
  ): Promise<{ success: boolean; data: CivilCascadeImpact }> {
    let endpoint = `/api/spatial/incident-impact/${incidentId}`;
    if (latitude !== undefined && longitude !== undefined) {
      endpoint += `?lat=${latitude}&lon=${longitude}`;
    }
    return apiRequest<{ success: boolean; data: CivilCascadeImpact }>(endpoint);
  },
};
