import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataSource, CreateDataSourceInput, UpdateDataSourceInput } from '../types/dataSource';
import { dataSourceService } from '../services/dataSourceService';
import { useAuth } from './AuthContext';

interface DataSourceContextType {
  sources: DataSource[];
  loading: boolean;
  error: string | null;
  refreshSources: () => Promise<void>;
  createSource: (input: CreateDataSourceInput) => Promise<DataSource>;
  updateSource: (id: string, input: UpdateDataSourceInput) => Promise<DataSource>;
  toggleSource: (id: string, enabled: boolean) => Promise<DataSource>;
  getProvenanceBadgeInfo: (sourceId?: string, defaultName?: string, defaultMode?: string) => {
    sourceName: string;
    dataMode: string;
    department: string;
    lastUpdated: string;
    dataQuality: string;
  };
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshSources = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dataSourceService.getDataSources();
      setSources(data.sources || []);
    } catch (err: any) {
      console.warn('[DataSourceContext] Failed to load data sources:', err.message);
      setError(err.message || 'Failed to load urban data sources');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSources();
  }, [refreshSources]);

  const createSource = async (input: CreateDataSourceInput): Promise<DataSource> => {
    const res = await dataSourceService.createDataSource(input);
    await refreshSources();
    return res.source;
  };

  const updateSource = async (id: string, input: UpdateDataSourceInput): Promise<DataSource> => {
    const res = await dataSourceService.updateDataSource(id, input);
    await refreshSources();
    return res.source;
  };

  const toggleSource = async (id: string, enabled: boolean): Promise<DataSource> => {
    const res = await dataSourceService.toggleDataSource(id, enabled);
    await refreshSources();
    return res.source;
  };

  const getProvenanceBadgeInfo = (sourceId?: string, defaultName = 'SCOS Core Prototype', defaultMode = 'PROTOTYPE') => {
    if (sourceId) {
      const found = sources.find((s) => s.sourceId === sourceId);
      if (found) {
        return {
          sourceName: found.sourceName,
          dataMode: found.dataMode,
          department: found.department,
          lastUpdated: new Date(found.lastUpdated).toLocaleTimeString(),
          dataQuality: found.provenance.dataQuality || 'HIGH',
        };
      }
    }
    return {
      sourceName: defaultName,
      dataMode: defaultMode,
      department: 'SCOS Central Intelligence',
      lastUpdated: new Date().toLocaleTimeString(),
      dataQuality: 'HIGH',
    };
  };

  return (
    <DataSourceContext.Provider
      value={{
        sources,
        loading,
        error,
        refreshSources,
        createSource,
        updateSource,
        toggleSource,
        getProvenanceBadgeInfo,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSources = () => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSources must be used within a DataSourceProvider');
  }
  return context;
};
