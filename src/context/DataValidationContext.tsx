import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NormalizedSCOSRecord,
  RejectedDataRecord,
  DataQualityMetricsSummary,
  RawIngestionRecord,
  ProcessRecordsResult,
} from '../types/dataValidation';
import { dataValidationService } from '../services/dataValidationService';
import { dataQualityService } from '../services/dataQualityService';
import { useAuth } from './AuthContext';

interface DataValidationFilters {
  category: string;
  quality: string;
  freshness: string;
  status: string;
}

interface DataValidationContextType {
  normalizedRecords: NormalizedSCOSRecord[];
  rejectedRecords: RejectedDataRecord[];
  metrics: DataQualityMetricsSummary | null;
  loading: boolean;
  error: string | null;
  filters: DataValidationFilters;
  selectedRecordForInspection: {
    record: NormalizedSCOSRecord;
    originalRepresentation: Record<string, unknown>;
    normalizedRepresentation: Record<string, unknown>;
  } | null;
  setFilters: React.Dispatch<React.SetStateAction<DataValidationFilters>>;
  refreshAll: () => Promise<void>;
  processRawRecords: (records: RawIngestionRecord[]) => Promise<ProcessRecordsResult>;
  simulatePipeline: () => Promise<void>;
  inspectRecord: (id: string) => Promise<void>;
  clearInspection: () => void;
}

const DataValidationContext = createContext<DataValidationContextType | undefined>(undefined);

export const DataValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [normalizedRecords, setNormalizedRecords] = useState<NormalizedSCOSRecord[]>([]);
  const [rejectedRecords, setRejectedRecords] = useState<RejectedDataRecord[]>([]);
  const [metrics, setMetrics] = useState<DataQualityMetricsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DataValidationFilters>({
    category: 'ALL',
    quality: 'ALL',
    freshness: 'ALL',
    status: 'ALL',
  });
  const [selectedRecordForInspection, setSelectedRecordForInspection] = useState<{
    record: NormalizedSCOSRecord;
    originalRepresentation: Record<string, unknown>;
    normalizedRepresentation: Record<string, unknown>;
  } | null>(null);

  const { user } = useAuth();

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [recordsRes, rejectionsRes, metricsRes] = await Promise.all([
        dataValidationService.getNormalizedRecords(filters),
        dataValidationService.getRejectedRecords(),
        dataQualityService.getMetricsSummary(),
      ]);

      setNormalizedRecords(recordsRes.records || []);
      setRejectedRecords(rejectionsRes.rejections || []);
      setMetrics(metricsRes);
    } catch (err: any) {
      console.warn('[DataValidationContext] Failed to load data validation state:', err.message);
      setError(err.message || 'Failed to load data quality & validation engine metrics');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const processRawRecords = async (records: RawIngestionRecord[]): Promise<ProcessRecordsResult> => {
    const res = await dataValidationService.processRecords(records);
    await refreshAll();
    return res.result;
  };

  const simulatePipeline = async (): Promise<void> => {
    await dataValidationService.simulatePipeline();
    await refreshAll();
  };

  const inspectRecord = async (id: string): Promise<void> => {
    try {
      const details = await dataValidationService.getRecordInspection(id);
      setSelectedRecordForInspection(details);
    } catch (err: any) {
      console.error('Failed to load record inspection details:', err);
    }
  };

  const clearInspection = () => {
    setSelectedRecordForInspection(null);
  };

  return (
    <DataValidationContext.Provider
      value={{
        normalizedRecords,
        rejectedRecords,
        metrics,
        loading,
        error,
        filters,
        selectedRecordForInspection,
        setFilters,
        refreshAll,
        processRawRecords,
        simulatePipeline,
        inspectRecord,
        clearInspection,
      }}
    >
      {children}
    </DataValidationContext.Provider>
  );
};

export const useDataValidation = () => {
  const context = useContext(DataValidationContext);
  if (!context) {
    throw new Error('useDataValidation must be used within a DataValidationProvider');
  }
  return context;
};
