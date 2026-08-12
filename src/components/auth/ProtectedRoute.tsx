import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType, PermissionType } from '../../types/auth';
import { UnauthorizedPage } from './UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: PermissionType[];
  allowedRoles?: RoleType[];
  targetDepartmentId?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  allowedRoles = [],
  targetDepartmentId,
  fallback,
}) => {
  const { isAuthenticated, hasPermission, hasRole, canAccessDepartment } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-600 font-medium">Please sign in to access this view.</p>
      </div>
    );
  }

  // Check roles
  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return fallback ? <>{fallback}</> : <UnauthorizedPage requiredPermission={allowedRoles.join(', ')} />;
  }

  // Check permissions
  if (requiredPermissions.length > 0 && !hasPermission(...requiredPermissions)) {
    return fallback ? <>{fallback}</> : <UnauthorizedPage requiredPermission={requiredPermissions.join(', ')} />;
  }

  // Check department access
  if (targetDepartmentId && !canAccessDepartment(targetDepartmentId)) {
    return fallback ? <>{fallback}</> : <UnauthorizedPage requiredPermission={`Department Scope: ${targetDepartmentId}`} />;
  }

  return <>{children}</>;
};
