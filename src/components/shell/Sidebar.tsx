import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Activity,
  MapPin,
  Brain,
  BarChart3,
  FileText,
  Bell,
  ShieldCheck,
  HelpCircle,
  Palette,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleType, PermissionType } from '../../types/auth';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  requiredRole?: RoleType[];
  requiredPermission?: PermissionType[];
}

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, hasRole, hasPermission } = useAuth();

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Urban Command Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'departments',
      label: 'Municipal Departments',
      icon: <Building2 className="w-4 h-4" />,
      badge: '4 Active',
    },
    {
      id: 'operations',
      label: 'Grievances & Operations',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'gis',
      label: 'GIS Spatial Intelligence',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'knowledge-graph',
      label: 'SCOS Knowledge Graph',
      icon: <Brain className="w-4 h-4 text-indigo-400" />,
      badge: 'Context Graph',
    },
    {
      id: 'predictive',
      label: 'Predictive City Intelligence',
      icon: <Brain className="w-4 h-4 text-emerald-400" />,
      badge: 'Early Warning',
    },
    {
      id: 'ai',
      label: 'AI Governance Command',
      icon: <Brain className="w-4 h-4 text-indigo-400" />,
      badge: 'Agent Active',
    },
    {
      id: 'analytics',
      label: 'Analytics & KPIs',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Executive Reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: 'Notifications Stream',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Administration & RBAC',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      requiredPermission: [PermissionType.USER_VIEW],
    },
    {
      id: 'design-system',
      label: 'Design System Showcase',
      icon: <Palette className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'help',
      label: 'Help & Thesis Docs',
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  // RBAC Navigation Filter
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.requiredRole && !hasRole(...item.requiredRole)) return false;
    if (item.requiredPermission && !hasPermission(...item.requiredPermission)) return false;
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800 select-none">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="font-bold text-white text-xs uppercase tracking-wider">SCOS Navigation</span>
        <button onClick={onCloseMobile} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Scope Banner */}
      <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Context Scope</span>
        <p className="font-bold text-white truncate">{user?.departmentName || 'Kanpur District Administration'}</p>
        <span className="text-[10px] text-emerald-400 font-mono block mt-0.5 font-semibold">
          Role: {user?.role.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 font-mono">
          Command Modules
        </div>

        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
        <p className="font-bold text-slate-400">IIT Kanpur Thesis Sandbox</p>
        <p>Smart City Operating System v5B.3</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-15 h-[calc(100vh-3.75rem)]">{sidebarContent}</aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
