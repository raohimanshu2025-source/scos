import React, { useState, useEffect } from 'react';
import {
  DepartmentProfile,
  ResponsibilityMapping,
  RecommendedTask,
} from '../../types/departmentCoordination';
import { Incident, DepartmentTask } from '../../types/incident';
import { departmentService } from '../../services/departmentService';
import { coordinationService } from '../../services/coordinationService';
import { incidentStore } from '../../services/incidentStore';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitMerge,
  Shield,
  Filter,
  RefreshCw,
  Search,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DepartmentOperationsView: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<DepartmentProfile[]>([]);
  const [mappings, setMappings] = useState<ResponsibilityMapping[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-nagar');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TASKS' | 'PROFILE' | 'RESPONSIBILITIES'>('TASKS');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedProfiles, fetchedMappings] = await Promise.all([
        departmentService.getProfiles(),
        departmentService.getResponsibilityMappings(),
      ]);
      setProfiles(fetchedProfiles);
      setMappings(fetchedMappings);

      const allIncidents = incidentStore.getAllIncidents();
      setIncidents(allIncidents);
    } catch (err) {
      console.error('Failed to load department operations data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProfile = profiles.find((p) => p.departmentId === selectedDeptId) || profiles[0];

  // Filter tasks and incidents for selected department
  const departmentIncidents = incidents.filter((inc) => {
    const primaryDeptMatch = inc.AI_assessment?.primary_department?.toLowerCase().includes(selectedProfile?.departmentCode?.toLowerCase() || '') ||
      inc.category === 'WATERLOGGING' && (selectedDeptId === 'dept-jal' || selectedDeptId === 'dept-nagar' || selectedDeptId === 'dept-traffic');
    return primaryDeptMatch || inc.assigned_tasks?.some((t) => t.department_id === selectedDeptId || t.department_name?.toLowerCase().includes(selectedProfile?.departmentName?.toLowerCase() || ''));
  });

  const allDeptTasks: Array<{ task: DepartmentTask; incidentId: string; incidentTitle: string }> = [];
  incidents.forEach((inc) => {
    (inc.assigned_tasks || []).forEach((task) => {
      if (
        task.department_id === selectedDeptId ||
        task.department_name?.toLowerCase().includes(selectedProfile?.departmentName?.toLowerCase() || '')
      ) {
        allDeptTasks.push({ task, incidentId: inc.incident_id, incidentTitle: inc.title });
      }
    });
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center font-mono">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading SCOS Multi-Department Coordination Operations Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Building2 className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Multi-Department Operational Coordination
                </h1>
                <p className="text-xs text-slate-400">
                  Kanpur District Inter-Agency Responsibility Matrix, Task Dispatch & SLA Tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              SIMULATED / PROTOTYPE LAYER
            </span>

            <button
              onClick={loadData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Department Selector Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-t border-slate-800 pt-4">
          {profiles.map((prof) => {
            const isSelected = prof.departmentId === selectedDeptId;
            return (
              <button
                key={prof.departmentId}
                onClick={() => setSelectedDeptId(prof.departmentId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span>{prof.departmentName.split('(')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {prof.departmentCode}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Department Overview Card */}
      {selectedProfile && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-lg">
          {/* Info */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                {selectedProfile.departmentType} DEPARTMENT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                STATUS: {selectedProfile.status}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white">{selectedProfile.departmentName}</h2>
            <p className="text-xs text-slate-300">{selectedProfile.description}</p>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-bold">Capabilities:</span>
              {selectedProfile.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono"
                >
                  {cap}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-bold">Infrastructure Assets:</span>
              {selectedProfile.infrastructureResponsibilities.map((infra) => (
                <span
                  key={infra}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono"
                >
                  {infra}
                </span>
              ))}
            </div>
          </div>

          {/* SLA & Contact */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              SLA & Governance Parameters
            </h4>

            <div className="justify-between flex text-slate-400">
              <span>Default Task Type:</span>
              <span className="text-white font-bold">{selectedProfile.slaProfile.taskType}</span>
            </div>

            <div className="justify-between flex text-slate-400">
              <span>Target Response SLA:</span>
              <span className="text-emerald-400 font-bold">{selectedProfile.slaProfile.targetResponseMinutes} mins</span>
            </div>

            <div className="justify-between flex text-slate-400">
              <span>Target Completion SLA:</span>
              <span className="text-emerald-400 font-bold">{selectedProfile.slaProfile.targetCompletionMinutes} mins</span>
            </div>

            <div className="justify-between flex text-slate-400">
              <span>Escalation Level:</span>
              <span className="text-amber-400 font-bold">Level {selectedProfile.slaProfile.escalationLevel}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <p className="font-bold text-slate-300">Nodal Contact:</p>
              <p>{selectedProfile.contactRole}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content View Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'TASKS'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Active Tasks & Incident Queue ({allDeptTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESPONSIBILITIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'RESPONSIBILITIES'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitMerge className="w-4 h-4 text-sky-400" />
          <span>Responsibility Matrix ({mappings.length})</span>
        </button>
      </div>

      {/* TAB 1: Department Task Queue */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4">
          {allDeptTasks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
              No active tasks currently dispatched for {selectedProfile?.departmentName}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDeptTasks.map(({ task, incidentId, incidentTitle }) => (
                <div
                  key={task.task_id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded">
                      TASK #{task.task_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">
                      Incident #{incidentId}: {incidentTitle}
                    </span>
                    <p className="font-bold text-white text-sm">{task.task_description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Assigned: {task.assigned_user_name || 'Field Response Team'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      SLA: {task.demo_sla_minutes || 60}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Responsibility Matrix */}
      {activeTab === 'RESPONSIBILITIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Kanpur Civil Infrastructure Responsibility Matrix</h3>
            <span className="text-[10px] font-mono text-slate-400">SCOS Operational Authority Baseline</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/40 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3">Infrastructure Type</th>
                  <th className="p-3">Primary Responsible Department</th>
                  <th className="p-3">Secondary Supporting Departments</th>
                  <th className="p-3">Operational Responsibility Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {mappings.map((m) => {
                  const prim = profiles.find((p) => p.departmentId === m.primaryDepartmentId);
                  return (
                    <tr key={m.infrastructureType} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono font-bold text-indigo-400">{m.infrastructureType}</td>
                      <td className="p-3 font-bold text-white">
                        {prim?.departmentName || m.primaryDepartmentId}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {m.secondaryDepartmentIds.map((secId) => {
                            const sec = profiles.find((p) => p.departmentId === secId);
                            return (
                              <span
                                key={secId}
                                className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono"
                              >
                                {sec?.departmentCode || secId}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">{m.operationalResponsibility}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
