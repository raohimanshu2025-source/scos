import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';
import { PredictiveProvider } from './context/PredictiveContext';
import { KnowledgeGraphProvider } from './context/KnowledgeGraphContext';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { AppShell } from './components/shell/AppShell';
import { DashboardView } from './components/views/DashboardView';
import { DepartmentsView } from './components/views/DepartmentsView';
import { DesignSystemView } from './components/views/DesignSystemView';
import { AdminView } from './components/views/AdminView';
import { OperationsView } from './components/views/OperationsView';
import { GisView } from './components/views/GisView';
import { AiCommandView } from './components/views/AiCommandView';
import { PredictiveIntelligenceView } from './components/views/PredictiveIntelligenceView';
import { KnowledgeGraphView } from './components/views/KnowledgeGraphView';
import {
  AnalyticsView,
  ReportsView,
  NotificationsView,
  HelpView,
} from './components/views/ShellPlaceholderViews';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { Button } from './components/ui/Button';

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Verifying SCOS Security Token & District Scope...</span>
        </div>
      </div>
    );
  }

  return (
    <AppShell activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
      {activeTab === 'departments' && <DepartmentsView />}
      {activeTab === 'operations' && <OperationsView />}
      {activeTab === 'gis' && <GisView />}
      {activeTab === 'knowledge-graph' && (
        <KnowledgeGraphView
          onNavigateToGis={() => setActiveTab('gis')}
          onBack={() => setActiveTab('dashboard')}
        />
      )}
      {activeTab === 'predictive' && <PredictiveIntelligenceView />}
      {activeTab === 'ai' && <AiCommandView />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'reports' && <ReportsView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {activeTab === 'admin' && <AdminView />}
      {activeTab === 'design-system' && <DesignSystemView />}
      {activeTab === 'help' && <HelpView />}
    </AppShell>
  );
}

export function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  return (
    <AuthProvider>
      <IncidentProvider>
        <PredictiveProvider>
          <KnowledgeGraphProvider>
            <AuthenticatedApp />

            {/* Auth Modals */}
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onSwitchToRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              onSwitchToForgotPassword={() => {
                setIsLoginOpen(false);
                setIsForgotOpen(true);
              }}
            />

            <RegisterModal
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
              onSwitchToLogin={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />

            <ForgotPasswordModal
              isOpen={isForgotOpen}
              onClose={() => setIsForgotOpen(false)}
              onSwitchToLogin={() => {
                setIsForgotOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </KnowledgeGraphProvider>
        </PredictiveProvider>
      </IncidentProvider>
    </AuthProvider>
  );
}

export default App;
