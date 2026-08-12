import React, { useState } from 'react';
import { PageHeader } from '../shell/PageHeader';
import { DepartmentManagementPanel } from '../org/DepartmentManagementPanel';
import { TeamManagementPanel } from '../org/TeamManagementPanel';
import { OrganizationOverview } from '../org/OrganizationOverview';
import { UserOrgAssignmentModal } from '../org/UserOrgAssignmentModal';

export const DepartmentsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'departments' | 'teams'>('overview');
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeptPanelOpen, setIsDeptPanelOpen] = useState(false);
  const [isTeamPanelOpen, setIsTeamPanelOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Municipal Departments & Operational Teams"
        description="Departmental hierarchy, service isolation, team dispatch management, and resource allocation for Kanpur District."
        breadcrumbs={[{ label: 'Departments' }]}
      >
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            District Hierarchy Overview
          </button>
          <button
            onClick={() => {
              setActiveSubTab('departments');
              setIsDeptPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'departments' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Department Isolation
          </button>
          <button
            onClick={() => {
              setActiveSubTab('teams');
              setIsTeamPanelOpen(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'teams' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Teams & Field Squads
          </button>
        </div>
      </PageHeader>

      {activeSubTab === 'overview' && (
        <OrganizationOverview
          onManageDepartment={(deptId) => {
            setSelectedDeptId(deptId);
            setActiveSubTab('departments');
            setIsDeptPanelOpen(true);
          }}
          onManageUser={(userId) => {
            setSelectedUserId(userId);
          }}
          onOpenOrgAssignment={(userId) => {
            setSelectedUserId(userId);
            setIsAssignmentOpen(true);
          }}
          onOpenNewDept={() => {
            setSelectedDeptId(null);
            setActiveSubTab('departments');
            setIsDeptPanelOpen(true);
          }}
          onOpenNewTeam={() => {
            setActiveSubTab('teams');
            setIsTeamPanelOpen(true);
          }}
        />
      )}

      {activeSubTab === 'departments' && (
        <DepartmentManagementPanel
          isOpen={isDeptPanelOpen || activeSubTab === 'departments'}
          onClose={() => setIsDeptPanelOpen(false)}
          onDepartmentUpdated={() => {}}
          initialSelectedDeptId={selectedDeptId}
        />
      )}

      {activeSubTab === 'teams' && (
        <TeamManagementPanel
          isOpen={isTeamPanelOpen || activeSubTab === 'teams'}
          onClose={() => setIsTeamPanelOpen(false)}
          onTeamUpdated={() => {}}
        />
      )}

      {isAssignmentOpen && selectedUserId && (
        <UserOrgAssignmentModal
          isOpen={isAssignmentOpen}
          onClose={() => setIsAssignmentOpen(false)}
          userId={selectedUserId}
          onAssignmentSaved={() => setIsAssignmentOpen(false)}
        />
      )}
    </div>
  );
};
