import React, { useState } from 'react';
import {
  Building2,
  Search,
  Bell,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Activity,
  Network,
  Sparkles,
  MapPin,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from './DistrictContext';
import { RoleSwitcherBadge } from '../auth/RoleSwitcherBadge';
import { StatusBadge } from '../ui/Badge';

export interface TopBarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileSidebar,
}) => {
  const { user, logout } = useAuth();
  const { currentDistrict, setCurrentDistrict, availableDistricts } = useDistrict();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 h-15 px-4 sm:px-6 flex items-center justify-between shadow-md">
      {/* Left Branding & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-md font-extrabold text-sm border border-indigo-400/30">
            SCOS
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black tracking-wider text-white uppercase font-mono">
              AI-SCOS <span className="text-emerald-400 font-sans text-[10px] font-bold lowercase px-1.5 py-0.2 bg-emerald-500/20 rounded">v5B.3</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Urban Governance Operating System</p>
          </div>
        </div>

        {/* District Context Selector */}
        <div className="relative ml-2 sm:ml-4 border-l border-slate-800 pl-3 sm:pl-4">
          <button
            onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700/80 transition text-xs font-semibold cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{currentDistrict.name}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
              {currentDistrict.code}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isDistrictDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Select Active District Context
              </div>
              {availableDistricts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setCurrentDistrict(d);
                    setIsDistrictDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    currentDistrict.id === d.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{d.name} ({d.state})</span>
                  <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 bg-slate-800 rounded">
                    {d.activeStatus}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Search Launcher */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full px-3.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-xl text-xs flex items-center justify-between transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Global Search (Users, Incidents, GIS, Assets)...</span>
          </span>
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Health Pulse */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-xl text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px]">SCOS Grid Operational</span>
        </div>

        {/* Notifications Drawer Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </button>

        {/* User Role Badge Component (Phase 5B.1 Integration) */}
        <RoleSwitcherBadge onOpenLogin={() => {}} />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
              {user?.fullName ? user.fullName.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-white truncate max-w-28">{user?.fullName || 'User'}</span>
              <span className="block text-[10px] text-slate-400 truncate max-w-28">{user?.designationTitle || user?.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs">
              <div className="pb-3 border-b border-slate-800 mb-2">
                <p className="font-bold text-white">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2 inline-block px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-bold uppercase">
                  {user?.role}
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[11px] text-slate-300">
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Assigned Scope</span>
                  <span>{user?.departmentName || 'District Magistrate Office'}</span>
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-950/60 text-rose-400 rounded-xl flex items-center gap-2 transition cursor-pointer font-bold mt-2 pt-2 border-t border-slate-800"
                >
                  <LogOut className="w-4 h-4" /> Sign Out Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
