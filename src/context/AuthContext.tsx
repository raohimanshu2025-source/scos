import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RoleType, PermissionType, AccountStatus, UserSession } from '../types/auth';

export interface AuthUser {
  id: string;
  email: string;
  mobile: string;
  fullName: string;
  role: RoleType;
  districtId?: string;
  districtName?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  secondaryDepartmentIds?: string[];
  teamId?: string;
  teamName?: string;
  designationTitle?: string;
  reportingManagerName?: string;
  status: AccountStatus;
  permissions: PermissionType[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginIdentifier: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, mobile: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; demoResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  hasPermission: (...permissions: PermissionType[]) => boolean;
  hasRole: (...roles: RoleType[]) => boolean;
  canAccessDepartment: (departmentId?: string) => boolean;
  switchDemoRole: (targetRole: RoleType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'scos_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user from /api/auth/me on mount or token change
  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('[AuthContext] Session verification error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token, fetchCurrentUser]);

  // Login
  const login = async (loginIdentifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdentifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const session: UserSession = data.session;
      localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      setToken(session.token);
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (fullName: string, email: string, mobile: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, mobile, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const session: UserSession = data.session;
      localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      setToken(session.token);
      setUser(session.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Logout notification error:', err);
      }
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Forgot password failed');
    }
    return data;
  };

  // Reset Password
  const resetPassword = async (token: string, newPassword: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Reset password failed');
    }
  };

  // Helper: Check if user has required permissions
  const hasPermission = (...requiredPermissions: PermissionType[]): boolean => {
    if (!user) return false;
    if (user.role === RoleType.SUPER_ADMIN) return true;
    return requiredPermissions.every((perm) => user.permissions?.includes(perm));
  };

  // Helper: Check if user has allowed role
  const hasRole = (...roles: RoleType[]): boolean => {
    if (!user) return false;
    if (user.role === RoleType.SUPER_ADMIN) return true;
    return roles.includes(user.role);
  };

  // Helper: Department Isolation Access Check
  const canAccessDepartment = (targetDepartmentId?: string): boolean => {
    if (!user) return false;
    if (user.role === RoleType.SUPER_ADMIN || user.role === RoleType.DISTRICT_ADMIN) return true;
    if (!targetDepartmentId) return true; // No specific department target
    if (user.departmentId === targetDepartmentId) return true;
    if (user.secondaryDepartmentIds?.includes(targetDepartmentId)) return true;
    return false;
  };

  // Helper: Quick Demo Role Switcher (for testing & evaluation)
  const switchDemoRole = async (targetRole: RoleType) => {
    const demoEmailMap: Record<RoleType, string> = {
      [RoleType.SUPER_ADMIN]: 'superadmin@kanpur.gov.in',
      [RoleType.DISTRICT_ADMIN]: 'dm@kanpur.gov.in',
      [RoleType.DEPARTMENT_ADMIN]: 'jal.admin@kanpur.gov.in',
      [RoleType.DEPARTMENT_OFFICER]: 'kesco.officer@kanpur.gov.in',
      [RoleType.FIELD_OFFICER]: 'field.officer@kanpur.gov.in',
      [RoleType.CITIZEN]: 'citizen@kanpur.gov.in',
      [RoleType.AI_GOVERNANCE_OFFICER]: 'ai.governance@kanpur.gov.in',
    };

    const targetEmail = demoEmailMap[targetRole];
    if (targetEmail) {
      await login(targetEmail, 'Password@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        hasPermission,
        hasRole,
        canAccessDepartment,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
