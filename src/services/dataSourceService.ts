import { apiRequest } from './apiClient';
import {
  DataSource,
  CreateDataSourceInput,
  UpdateDataSourceInput,
  DataProvenance,
} from '../types/dataSource';

export const dataSourceService = {
  /**
   * Fetch all data sources registered in SCOS Data Integration Foundation
   */
  async getDataSources(): Promise<{ sources: DataSource[]; total: number; prototypeNotice: string }> {
    return apiRequest<{ sources: DataSource[]; total: number; prototypeNotice: string }>('/api/data-sources');
  },

  /**
   * Fetch a single data source by ID
   */
  async getDataSourceById(id: string): Promise<{ source: DataSource }> {
    return apiRequest<{ source: DataSource }>(`/api/data-sources/${encodeURIComponent(id)}`);
  },

  /**
   * Fetch provenance detail for a data source
   */
  async getDataSourceProvenance(id: string): Promise<{ provenance: DataProvenance }> {
    return apiRequest<{ provenance: DataProvenance }>(`/api/data-sources/${encodeURIComponent(id)}/provenance`);
  },

  /**
   * Create a new data source entry
   */
  async createDataSource(input: CreateDataSourceInput): Promise<{ message: string; source: DataSource }> {
    return apiRequest<{ message: string; source: DataSource }>('/api/data-sources', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update an existing data source entry
   */
  async updateDataSource(id: string, input: UpdateDataSourceInput): Promise<{ message: string; source: DataSource }> {
    return apiRequest<{ message: string; source: DataSource }>(`/api/data-sources/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Enable or disable a data source entry
   */
  async toggleDataSource(id: string, enabled: boolean): Promise<{ message: string; source: DataSource }> {
    return apiRequest<{ message: string; source: DataSource }>(`/api/data-sources/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  },
};
