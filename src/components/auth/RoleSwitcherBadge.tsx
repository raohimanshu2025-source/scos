import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types/auth';
import { Shield, User, LogOut, ChevronDown, Building2, Check, Sparkles, Lock, Settings } from 'lucide-react';

interface RoleSwitcherBadgeProps {
  onOpenLogin: () => void;
  onOpenUserManagement?: () => void;
}

export const RoleSwitcherBadge: React.FC<RoleSwitcherBadgeProps> = ({
  onOpenLogin,
  onOpenUserManagement,
}) => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={onOpenLogin}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Sign In / Select Role</span>
      </button>
    );
  }

  const roleBadgeColors: Record<RoleType, string> = {
    [RoleType.SUPER_ADMIN]: 'bg-purple-100 text-purple-900 border-purple-300',
    [RoleType.DISTRICT_ADMIN]: 'bg-blue-100 text-blue-900 border-blue-300',
    [RoleType.DEPARTMENT_ADMIN]: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    [RoleType.DEPARTMENT_OFFICER]: 'bg-amber-100 text-amber-900 border-amber-300',
    [RoleType.FIELD_OFFICER]: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    [RoleType.CITIZEN]: 'bg-slate-100 text-slate-800 border-slate-300',
    [RoleType.AI_GOVERNANCE_OFFICER]: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  };

  const roleLabels: Record<RoleType, string> = {
    [RoleType.SUPER_ADMIN]: 'SUPER ADMIN',
    [RoleType.DISTRICT_ADMIN]: 'DISTRICT MAGISTRATE',
    [RoleType.DEPARTMENT_ADMIN]: 'DEPT ADMIN',
    [RoleType.DEPARTMENT_OFFICER]: 'DEPT OFFICER',
    [RoleType.FIELD_OFFICER]: 'FIELD CREW',
    [RoleType.CITIZEN]: 'CITIZEN',
    [RoleType.AI_GOVERNANCE_OFFICER]: 'AI AUDIT OFFICER',
  };

  const rolesList = Object.values(RoleType);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-sm transition"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-900">{user.fullName}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleBadgeColors[user.role]}`}>
          {roleLabels[user.role]}
        </span>
        {user.departmentCode && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            <Building2 className="w-2.5 h-2.5" />
            {user.departmentCode}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3">
          {/* User Profile Card */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-xs text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                {user.departmentName && (
                  <p className="text-[10px] text-blue-600 font-medium truncate mt-0.5">
                    {user.departmentName}
                  </p>
                )}
              </div>
            </div>

            {/* Active Permissions Summary */}
            <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block w-full mb-0.5">
                Permissions ({user.permissions?.length || 0}):
              </span>
              {user.permissions?.slice(0, 5).map((perm) => (
                <span key={perm} className="text-[9px] bg-slate-200/80 text-slate-700 px-1 rounded font-mono">
                  {perm}
                </span>
              ))}
              {(user.permissions?.length || 0) > 5 && (
                <span className="text-[9px] text-slate-400 font-mono">+{(user.permissions?.length || 0) - 5} more</span>
              )}
            </div>
          </div>

          {/* User Management Panel Link for Admins */}
          {(user.role === RoleType.SUPER_ADMIN ||
            user.role === RoleType.DISTRICT_ADMIN ||
            user.role === RoleType.DEPARTMENT_ADMIN) && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenUserManagement?.();
              }}
              className="w-full mb-3 p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold flex items-center justify-between border border-blue-200 transition"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                User & Audit Management
              </span>
              <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">Admin</span>
            </button>
          )}

          {/* Quick Demo Role Switcher Section */}
          <div className="mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Switch Testing Role</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {rolesList.map((r) => {
                const isActive = user.role === r;
                return (
                  <button
                    key={r}
                    onClick={async () => {
                      setDropdownOpen(false);
                      await switchDemoRole(r);
                    }}
                    className={`w-full p-1.5 rounded-lg text-xs flex items-center justify-between text-left transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[r]}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full py-1.5 px-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
