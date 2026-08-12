import React, { createContext, useContext, useState } from 'react';

export interface DistrictInfo {
  id: string;
  name: string;
  code: string;
  state: string;
  activeStatus: 'ACTIVE' | 'PILOT' | 'STANDBY';
}

export const SUPPORTED_DISTRICTS: DistrictInfo[] = [
  { id: 'dist-kanpur', name: 'Kanpur Nagar', code: 'KNP', state: 'Uttar Pradesh', activeStatus: 'ACTIVE' },
  { id: 'dist-lucknow', name: 'Lucknow', code: 'LKO', state: 'Uttar Pradesh', activeStatus: 'PILOT' },
  { id: 'dist-varanasi', name: 'Varanasi', code: 'VNS', state: 'Uttar Pradesh', activeStatus: 'PILOT' },
  { id: 'dist-agra', name: 'Agra', code: 'AGR', state: 'Uttar Pradesh', activeStatus: 'STANDBY' },
];

interface DistrictContextType {
  currentDistrict: DistrictInfo;
  setCurrentDistrict: (district: DistrictInfo) => void;
  availableDistricts: DistrictInfo[];
}

const DistrictContext = createContext<DistrictContextType | undefined>(undefined);

export const DistrictProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDistrict, setCurrentDistrict] = useState<DistrictInfo>(SUPPORTED_DISTRICTS[0]);

  return (
    <DistrictContext.Provider
      value={{
        currentDistrict,
        setCurrentDistrict,
        availableDistricts: SUPPORTED_DISTRICTS,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
};

export const useDistrict = () => {
  const context = useContext(DistrictContext);
  if (!context) {
    throw new Error('useDistrict must be used within a DistrictProvider');
  }
  return context;
};
