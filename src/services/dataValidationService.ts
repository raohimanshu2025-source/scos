import { apiRequest } from './apiClient';
import {
  RawIngestionRecord,
  NormalizedSCOSRecord,
  RejectedDataRecord,
  ProcessRecordsResult,
} from '../types/dataValidation';

export const dataValidationService = {
  /**
   * Process raw record(s) through validation, normalization & quality engine
   */
  async processRecords(records: RawIngestionRecord[]): Promise<{ message: string; result: ProcessRecordsResult }> {
    return apiRequest<{ message: string; result: ProcessRecordsResult }>('/api/data-validation/process', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  /**
   * Fetch all normalized SCOS records with optional filter options
   */
  async getNormalizedRecords(filters?: {
    category?: string;
    quality?: string;
    freshness?: string;
    status?: string;
  }): Promise<{ records: NormalizedSCOSRecord[]; total: number; disclaimer: string }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.quality) params.append('quality', filters.quality);
    if (filters?.freshness) params.append('freshness', filters.freshness);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/api/data-validation/records${queryString ? `?${queryString}` : ''}`;

    return apiRequest<{ records: NormalizedSCOSRecord[]; total: number; disclaimer: string }>(endpoint);
  },

  /**
   * Fetch specific normalized record inspection details (includes original source payload)
   */
  async getRecordInspection(id: string): Promise<{
    record: NormalizedSCOSRecord;
    originalRepresentation: Record<string, unknown>;
    normalizedRepresentation: Record<string, unknown>;
  }> {
    return apiRequest<{
      record: NormalizedSCOSRecord;
      originalRepresentation: Record<string, unknown>;
      normalizedRepresentation: Record<string, unknown>;
    }>(`/api/data-validation/records/${encodeURIComponent(id)}`);
  },

  /**
   * Fetch rejected records buffer
   */
  async getRejectedRecords(): Promise<{ rejections: RejectedDataRecord[]; total: number }> {
    return apiRequest<{ rejections: RejectedDataRecord[]; total: number }>('/api/data-validation/rejections');
  },

  /**
   * Trigger re-simulation of sample prototype records
   */
  async simulatePipeline(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/api/data-validation/simulate', {
      method: 'POST',
    });
  },
};
