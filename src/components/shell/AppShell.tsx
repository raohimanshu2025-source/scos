import React, { useState } from 'react';
import { DistrictProvider } from './DistrictContext';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationCenterDrawer } from './NotificationCenterDrawer';

export interface AppShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSelectSearchResult = (route: string) => {
    if (route.includes('water') || route.includes('municipal') || route.includes('traffic')) {
      onSelectTab('departments');
    } else if (route.includes('operations')) {
      onSelectTab('operations');
    } else if (route.includes('gis')) {
      onSelectTab('gis');
    } else if (route.includes('admin')) {
      onSelectTab('admin');
    } else {
      onSelectTab('dashboard');
    }
  };

  return (
    <DistrictProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        {/* Top Header Bar */}
        <TopBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Application Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Role-Aware Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectResult={handleSelectSearchResult}
        />

        {/* Notification Center Drawer */}
        <NotificationCenterDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </div>
    </DistrictProvider>
  );
};
