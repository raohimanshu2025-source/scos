import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Inbox,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { Drawer } from '../ui/Feedback';
import { Button } from '../ui/Button';

export interface SCOSNotification {
  id: string;
  category: 'System' | 'Department' | 'Incident' | 'Task' | 'AI' | 'Security';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const INITIAL_NOTIFICATIONS: SCOSNotification[] = [
  {
    id: 'n1',
    category: 'AI',
    title: 'AI Triage Directive Issued',
    message: 'AI Agent redirected 14 duplicate sewage complaints to Kanpur Jal Sansthan Squad #3.',
    timestamp: '10 mins ago',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'n2',
    category: 'Incident',
    title: 'Water Main Pressure Drop',
    message: 'Zone 4 Jajmau telemetry detected 2.1 bar pressure drop on 600mm distribution trunk.',
    timestamp: '25 mins ago',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'n3',
    category: 'Department',
    title: 'Inter-Department Coordination Task',
    message: 'KESCO power repair approved for Bithoor Pumping Station Feeder Line 2.',
    timestamp: '1 hour ago',
    isRead: true,
    priority: 'MEDIUM',
  },
  {
    id: 'n4',
    category: 'Security',
    title: 'RBAC Role Elevation Audit',
    message: 'User officer.kanpur promoted to Department Officer for Kanpur Nagar Nigam.',
    timestamp: '3 hours ago',
    isRead: true,
    priority: 'LOW',
  },
];

export interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<SCOSNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const filtered = notifications.filter(
    (n) => activeCategory === 'ALL' || n.category.toUpperCase() === activeCategory
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const categoryIcons = {
    AI: <Sparkles className="w-4 h-4 text-indigo-500" />,
    Incident: <AlertTriangle className="w-4 h-4 text-rose-500" />,
    Department: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    Security: <ShieldAlert className="w-4 h-4 text-amber-500" />,
    System: <Bell className="w-4 h-4 text-sky-500" />,
    Task: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="SCOS Institutional Notification Center">
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-600">
          {['ALL', 'AI', 'INCIDENT', 'DEPARTMENT', 'SECURITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 ${
                activeCategory === cat ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
              <Inbox className="w-8 h-8 mb-2" />
              <span>No notifications in category.</span>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markSingleAsRead(n.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  !n.isRead ? 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs' : 'bg-white border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {categoryIcons[n.category]}
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{n.category}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 mb-1">{n.title}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Drawer>
  );
};
