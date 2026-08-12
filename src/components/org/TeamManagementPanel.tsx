import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, AlertTriangle, Users, Power, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Team, Department, User, PermissionType } from '../../types/auth';

interface TeamManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated: () => void;
}

export const TeamManagementPanel: React.FC<TeamManagementPanelProps> = ({ isOpen, onClose, onTeamUpdated }) => {
  const { token, hasPermission } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingTeam, setEditingTeam] = useState<Partial<Team> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamRes, deptRes, userRes] = await Promise.all([
        fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeams(data.teams || []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments || []);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch teams data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEdit = Boolean(editingTeam.id);
    const url = isEdit ? `/api/admin/teams/${editingTeam.id}` : '/api/admin/teams';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingTeam),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Operation failed');
        return;
      }

      setSuccessMsg(isEdit ? 'Team updated successfully' : 'Team created successfully');
      setEditingTeam(null);
      fetchData();
      onTeamUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Team Management</h3>
              <p className="text-xs text-slate-300">Configure functional squads & assign team leads within departments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {editingTeam ? (
            <form onSubmit={handleSaveTeam} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingTeam.id ? `Edit Team: ${editingTeam.name}` : 'Create New Team'}
                </h4>
                <button type="button" onClick={() => setEditingTeam(null)} className="text-xs text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.name || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    placeholder="e.g. Pothole Repair Task Force"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Department *</label>
                  <select
                    required
                    value={editingTeam.departmentId || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Parent Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Team Code</label>
                  <input
                    type="text"
                    value={editingTeam.code || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SQUAD_ROAD_01"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Team Lead</label>
                  <select
                    value={editingTeam.leadUserId || ''}
                    onChange={(e) => setEditingTeam({ ...editingTeam, leadUserId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="">None / Unassigned</option>
                    {users
                      .filter((u) => !editingTeam.departmentId || u.departmentId === editingTeam.departmentId)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTeam.description || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                  placeholder="Specialized operational responsibilities..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Team
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Total {teams.length} Teams Configured</span>
              {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                <button
                  onClick={() => setEditingTeam({ status: 'ACTIVE', departmentId: departments[0]?.id || 'dept-nagar' })}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Team
                </button>
              )}
            </div>
          )}

          {/* Teams List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {teams.map((t) => {
              const dept = departments.find((d) => d.id === t.departmentId);
              return (
                <div key={t.id} className="p-4 bg-white hover:bg-slate-50/80 transition flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{t.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                        {t.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Department: <span className="font-medium text-slate-800">{dept?.name || 'Unassigned'}</span>
                      {t.leadName && <span className="ml-2">• Lead: <strong className="text-indigo-700">{t.leadName}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" /> {(t as any).memberCount || 0} members
                    </span>
                    {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                      <button
                        onClick={() => setEditingTeam(t)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
