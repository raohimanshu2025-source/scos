import { apiRequest } from './apiClient';
import { DepartmentProfile, ResponsibilityMapping } from '../types/departmentCoordination';
import { departmentProfileStore } from './departmentProfileStore';

export const departmentService = {
  /**
   * Get all department profiles
   */
  async getProfiles(): Promise<DepartmentProfile[]> {
    try {
      const res = await apiRequest<{ profiles: DepartmentProfile[] }>('/api/departments/profiles');
      return res.profiles;
    } catch {
      // Fallback to local store if backend call fails or offline
      return departmentProfileStore.getAllProfiles();
    }
  },

  /**
   * Get single department profile by ID
   */
  async getProfileById(id: string): Promise<DepartmentProfile | undefined> {
    try {
      const res = await apiRequest<{ profile: DepartmentProfile }>(`/api/departments/profiles/${id}`);
      return res.profile;
    } catch {
      return departmentProfileStore.getProfileById(id);
    }
  },

  /**
   * Get responsibility mappings
   */
  async getResponsibilityMappings(): Promise<ResponsibilityMapping[]> {
    try {
      const res = await apiRequest<{ mappings: ResponsibilityMapping[] }>('/api/departments/responsibility-mappings');
      return res.mappings;
    } catch {
      return departmentProfileStore.getResponsibilityMappings();
    }
  },
};
