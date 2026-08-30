import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore, ROLE_PERMISSIONS_MAP } from '../db/store';
import { RoleType, PermissionType, AccountStatus, User } from '../../types/auth';

const DEV_JWT_SECRET = 'scos-development-jwt-secret-key-kanpur-district-2026';

function getJwtSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      throw new Error('[FATAL SECURITY EXCEPTION] JWT_SECRET environment variable is missing in production mode.');
    }
    return process.env.JWT_SECRET;
  }
  return process.env.JWT_SECRET || DEV_JWT_SECRET;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: RoleType;
    districtId?: string;
    departmentId?: string;
    departmentCode?: string;
    secondaryDepartmentIds?: string[];
    teamId?: string;
    status: AccountStatus;
    permissions: PermissionType[];
  };
  token?: string;
}

export function generateJwtToken(user: User): string {
  const department = user.departmentId ? dbStore.findDepartmentById(user.departmentId) : undefined;
  const permissions = ROLE_PERMISSIONS_MAP[user.role] || [];

  const payload = {
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    districtId: user.districtId,
    departmentId: user.departmentId,
    departmentCode: department?.code,
    secondaryDepartmentIds: user.secondaryDepartmentIds || [],
    teamId: user.teamId,
    status: user.status,
    permissions,
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: '8h' });
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token missing or invalid format',
    });
    return;
  }

  const token = authHeader.substring(7);

  if (dbStore.isTokenBlacklisted(token)) {
    res.status(401).json({
      error: 'TOKEN_REVOKED',
      message: 'Authentication token has been revoked / logged out',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    
    // Check account status in DB
    const freshUser = dbStore.findUserById(decoded.sub);
    if (!freshUser) {
      res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'Account associated with this token no longer exists',
      });
      return;
    }

    if (freshUser.status === AccountStatus.SUSPENDED) {
      res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended by an administrator',
      });
      return;
    }

    const department = freshUser.departmentId ? dbStore.findDepartmentById(freshUser.departmentId) : undefined;
    const permissions = ROLE_PERMISSIONS_MAP[freshUser.role] || [];

    req.user = {
      id: freshUser.id,
      email: freshUser.email,
      fullName: freshUser.fullName,
      role: freshUser.role,
      districtId: freshUser.districtId,
      departmentId: freshUser.departmentId,
      departmentCode: department?.code,
      secondaryDepartmentIds: freshUser.secondaryDepartmentIds || [],
      teamId: freshUser.teamId,
      status: freshUser.status,
      permissions,
    };
    req.token = token;

    next();
  } catch (err) {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Token is expired, corrupted, or signature verification failed',
    });
  }
}

// Require explicit Permission(s)
export function requirePermission(...requiredPermissions: PermissionType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      return;
    }

    // SUPER_ADMIN has ALL permissions
    if (req.user.role === RoleType.SUPER_ADMIN) {
      return next();
    }

    const hasAll = requiredPermissions.every((perm) => req.user?.permissions.includes(perm));
    if (!hasAll) {
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'PERMISSION_DENIED',
        resource: req.originalUrl,
        details: { requiredPermissions, userPermissions: req.user.permissions },
        ipAddress: req.ip,
        status: 'DENIED',
      });

      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      });
      return;
    }

    next();
  };
}

// Require explicit Role(s)
export function requireRole(...allowedRoles: RoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      return;
    }

    if (req.user.role === RoleType.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access denied for role: ${req.user.role}. Allowed: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

// Enforce Department Context Isolation (Prevents Water Dept from editing Health Dept unless SUPER_ADMIN or DISTRICT_ADMIN)
export function requireDepartmentAccess(targetDepartmentIdParamName = 'departmentId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      return;
    }

    // SUPER_ADMIN and DISTRICT_ADMIN have cross-department oversight
    if (req.user.role === RoleType.SUPER_ADMIN || req.user.role === RoleType.DISTRICT_ADMIN) {
      return next();
    }

    const targetDeptId = req.params[targetDepartmentIdParamName] || req.body[targetDepartmentIdParamName] || req.query[targetDepartmentIdParamName];

    if (!targetDeptId) {
      return next(); // If no target department specified, let business logic handle or filter
    }

    const isPrimaryAccess = req.user.departmentId === targetDeptId;
    const isSecondaryAccess = req.user.secondaryDepartmentIds?.includes(targetDeptId);

    if (!isPrimaryAccess && !isSecondaryAccess) {
      dbStore.addAuditLog({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'CROSS_DEPARTMENT_ACCESS_DENIED',
        resource: req.originalUrl,
        details: { userDept: req.user.departmentId, targetDept: targetDeptId },
        ipAddress: req.ip,
        status: 'DENIED',
      });

      res.status(403).json({
        error: 'CROSS_DEPARTMENT_ACCESS_DENIED',
        message: 'You are not authorized to view or modify records belonging to another department',
      });
      return;
    }

    next();
  };
}

// Enforce Citizen Data Isolation (Citizens access ONLY their own complaints/profile)
export function enforceCitizenScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    return;
  }

  if (req.user.role === RoleType.CITIZEN) {
    // Force citizen query scope to their own ID
    req.query.citizenId = req.user.id;
    req.body.citizenId = req.user.id;
  }

  next();
}
