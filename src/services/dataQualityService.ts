import { apiRequest } from './apiClient';
import { DataQualityMetricsSummary } from '../types/dataValidation';

export const dataQualityService = {
  /**
   * Fetch summary quality metrics for the SCOS Data Quality Dashboard
   */
  async getMetricsSummary(): Promise<DataQualityMetricsSummary> {
    return apiRequest<DataQualityMetricsSummary>('/api/data-quality/metrics');
  },
};
