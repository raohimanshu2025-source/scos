import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';
import { PredictiveProvider } from './context/PredictiveContext';
import { KnowledgeGraphProvider } from './context/KnowledgeGraphContext';
import { EvaluationProvider } from './context/EvaluationContext';
import { DataSourceProvider } from './context/DataSourceContext';
import { DataValidationProvider } from './context/DataValidationContext';
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
import { EvaluationView } from './components/views/EvaluationView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { DataQualityView } from './components/views/DataQualityView';
import { CivilInfrastructureDashboard } from './components/views/CivilInfrastructureDashboard';
import { DepartmentOperationsView } from './components/views/DepartmentOperationsView';
import { SituationalAwarenessView } from './components/views/SituationalAwarenessView';
import { OperationalDecisionSupportView } from './components/views/OperationalDecisionSupportView';
import { UrbanDigitalTwinView } from './components/views/UrbanDigitalTwinView';
import { ScenarioValidationView } from './components/views/ScenarioValidationView';
import { ComparativeEvaluationView } from './components/views/ComparativeEvaluationView';
import { ResearchDatasetView } from './components/views/ResearchDatasetView';
import { ExperimentalExecutionView } from './components/views/ExperimentalExecutionView';
import { StatisticalAnalysisView } from './components/views/StatisticalAnalysisView';
import { ResearchEvidenceView } from './components/views/ResearchEvidenceView';
import { ResearchFrameworkView } from './components/views/ResearchFrameworkView';
import { SensitivityAnalysisView } from './components/views/SensitivityAnalysisView';
import { ResearchValidationView } from './components/views/ResearchValidationView';
import { ResearchClaimValidationView } from './components/views/ResearchClaimValidationView';
import { ThesisEvidenceView } from './components/views/ThesisEvidenceView';
import { ResearchDemonstrationView } from './components/views/ResearchDemonstrationView';
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
      {activeTab === 'data-sources' && <DataSourcesView />}
      {activeTab === 'data-quality' && <DataQualityView />}
      {activeTab === 'civil-infrastructure' && <CivilInfrastructureDashboard />}
      {activeTab === 'coordination-ops' && <DepartmentOperationsView />}
      {activeTab === 'situational-awareness' && (
        <SituationalAwarenessView onNavigateTab={setActiveTab} />
      )}
      {activeTab === 'operational-decision-support' && (
        <OperationalDecisionSupportView onNavigateToIncident={() => setActiveTab('operations')} />
      )}
      {activeTab === 'urban-digital-twin' && (
        <UrbanDigitalTwinView onNavigateToIncident={() => setActiveTab('operations')} />
      )}
      {activeTab === 'scenario-validation' && <ScenarioValidationView />}
      {activeTab === 'comparative-evaluation' && <ComparativeEvaluationView />}
      {activeTab === 'research-dataset' && <ResearchDatasetView />}
      {activeTab === 'experimental-execution' && <ExperimentalExecutionView />}
      {activeTab === 'statistical-analysis' && <StatisticalAnalysisView />}
      {activeTab === 'research-evidence' && <ResearchEvidenceView />}
      {activeTab === 'research-framework' && <ResearchFrameworkView />}
      {activeTab === 'sensitivity-analysis' && <SensitivityAnalysisView />}
      {activeTab === 'research-validation' && <ResearchValidationView />}
      {activeTab === 'research-claims' && <ResearchClaimValidationView />}
      {activeTab === 'thesis-evidence' && <ThesisEvidenceView />}
      {activeTab === 'research-demonstration' && <ResearchDemonstrationView />}
      {activeTab === 'ai' && <AiCommandView />}
      {activeTab === 'evaluation' && (
        <EvaluationView onNavigateToIncident={() => setActiveTab('operations')} />
      )}
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
            <EvaluationProvider>
              <DataSourceProvider>
                <DataValidationProvider>
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
                </DataValidationProvider>
              </DataSourceProvider>
            </EvaluationProvider>
          </KnowledgeGraphProvider>
        </PredictiveProvider>
      </IncidentProvider>
    </AuthProvider>
  );
}

export default App;
