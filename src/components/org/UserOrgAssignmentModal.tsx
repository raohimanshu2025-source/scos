import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Network, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, District, Department, Team, Designation, RoleType } from '../../types/auth';

interface UserOrgAssignmentModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentSaved: () => void;
}

export const UserOrgAssignmentModal: React.FC<UserOrgAssignmentModalProps> = ({
  userId,
  isOpen,
  onClose,
  onAssignmentSaved,
}) => {
  const { token, user: currentUser } = useAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedSecondaryDepts, setSelectedSecondaryDepts] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedDesigId, setSelectedDesigId] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<RoleType>(RoleType.FIELD_OFFICER);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchAssignmentData();
    }
  }, [isOpen, userId, token]);

  const fetchAssignmentData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const [distRes, deptRes, teamRes, desigRes, userRes] = await Promise.all([
        fetch('/api/admin/districts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/designations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (distRes.ok) setDistricts((await distRes.json()).districts || []);
      if (deptRes.ok) setDepartments((await deptRes.json()).departments || []);
      if (teamRes.ok) setTeams((await teamRes.json()).teams || []);
      if (desigRes.ok) setDesignations((await desigRes.json()).designations || []);

      if (userRes.ok) {
        const usersList: User[] = (await userRes.json()).users || [];
        setAllUsers(usersList);
        const userToEdit = usersList.find((u) => u.id === userId);
        if (userToEdit) {
          setTargetUser(userToEdit);
          setSelectedDistrictId(userToEdit.districtId || 'dist-kanpur');
          setSelectedDeptId(userToEdit.departmentId || '');
          setSelectedSecondaryDepts(userToEdit.secondaryDepartmentIds || []);
          setSelectedTeamId(userToEdit.teamId || '');
          setSelectedDesigId(userToEdit.designationId || '');
          setSelectedManagerId(userToEdit.reportingManagerId || '');
          setSelectedRole(userToEdit.role);
        }
      }
    } catch (err) {
      console.error('Failed to load user org assignment data', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  const handleToggleSecondaryDepartment = (deptId: string) => {
    if (deptId === selectedDeptId) return; // Cannot select primary as secondary
    if (selectedSecondaryDepts.includes(deptId)) {
      setSelectedSecondaryDepts(selectedSecondaryDepts.filter((id) => id !== deptId));
    } else {
      setSelectedSecondaryDepts([...selectedSecondaryDepts, deptId]);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const selectedDesigObj = designations.find((d) => d.id === selectedDesigId);

    const payload = {
      districtId: selectedDistrictId || undefined,
      departmentId: selectedDeptId || undefined,
      secondaryDepartmentIds: selectedSecondaryDepts,
      teamId: selectedTeamId || undefined,
      designationId: selectedDesigId || undefined,
      designationTitle: selectedDesigObj?.title || undefined,
      reportingManagerId: selectedManagerId || undefined,
      role: selectedRole,
    };

    try {
      const res = await fetch(`/api/admin/users/${userId}/org-assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Org assignment update failed');
        return;
      }

      setSuccessMsg('User organizational assignment updated successfully!');
      setTimeout(() => {
        onAssignmentSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error occurred');
    }
  };

  const availableTeams = teams.filter((t) => !selectedDeptId || t.departmentId === selectedDeptId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Organizational Assignment</h3>
              <p className="text-xs text-slate-300">
                {targetUser ? `${targetUser.fullName} (${targetUser.email})` : 'User Profile'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSaveAssignment} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned District</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Assignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
              >
                {currentUser?.role === RoleType.SUPER_ADMIN && (
                  <>
                    <option value={RoleType.SUPER_ADMIN}>Super Admin (State / System)</option>
                    <option value={RoleType.DISTRICT_ADMIN}>District Administrator (DM)</option>
                  </>
                )}
                <option value={RoleType.DEPARTMENT_ADMIN}>Department Administrator</option>
                <option value={RoleType.DEPARTMENT_OFFICER}>Department Officer</option>
                <option value={RoleType.FIELD_OFFICER}>Field Officer / Inspector</option>
                <option value={RoleType.AI_GOVERNANCE_OFFICER}>AI Governance Officer</option>
                <option value={RoleType.CITIZEN}>Citizen</option>
              </select>
            </div>

            {/* Primary Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Department *</label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedTeamId('');
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">Select Primary Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Team Squad</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">None / Unassigned Team</option>
                {availableTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation Title</label>
              <select
                value={selectedDesigId}
                onChange={(e) => setSelectedDesigId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">Select Official Designation...</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title} (Level {desig.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">None / Top Level Officer</option>
                {allUsers
                  .filter((u) => u.id !== userId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.designationTitle || u.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Secondary Departments (Multi-Department Scope) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                Secondary Authorized Departments (Multi-Department Access)
              </label>
              <span className="text-[11px] text-slate-500">Enable cross-departmental coordination</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {departments.map((dept) => {
                const isPrimary = dept.id === selectedDeptId;
                const isChecked = selectedSecondaryDepts.includes(dept.id);
                return (
                  <label
                    key={dept.id}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                      isPrimary
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isChecked
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isPrimary}
                      checked={isChecked}
                      onChange={() => handleToggleSecondaryDepartment(dept.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{dept.name}</span>
                    {isPrimary && <span className="ml-auto text-[9px] font-bold text-slate-500 uppercase">(Primary)</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Org Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
