import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType, PermissionType, AccountStatus, User, Department, AuditLogEvent } from '../../types/auth';
import { Users, Shield, Building2, UserPlus, FileText, CheckCircle2, AlertTriangle, Search, Filter, Lock, RefreshCw } from 'lucide-react';

interface UserManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ isOpen, onClose }) => {
  const { token, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'DEPARTMENTS' | 'AUDIT_LOGS'>('USERS');
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>([]);
  const [rolesList, setRolesList] = useState<{ name: string; permissions: string[] }[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New User Form State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newRole, setNewRole] = useState<RoleType>(RoleType.DEPARTMENT_OFFICER);
  const [newDeptId, setNewDeptId] = useState<string>('dept-jal');
  const [newPassword, setNewPassword] = useState('Password@123');

  // New Department Form State
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptIsDistrictWide, setDeptIsDistrictWide] = useState(false);

  // Search/Filter
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }

      // 2. Fetch Departments
      const deptRes = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (deptRes.ok) {
        const dData = await deptRes.json();
        setDepartmentsList(dData.departments || []);
      }

      // 3. Fetch Roles
      const rolesRes = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rolesRes.ok) {
        const rData = await rolesRes.json();
        setRolesList(rData.roles || []);
      }

      // 4. Fetch Audit Logs
      const auditRes = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditLogs(aData.auditLogs || []);
      }
    } catch (err: any) {
      setError('Failed to load administrative data');
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          mobile: newMobile,
          password: newPassword,
          role: newRole,
          departmentId: newDeptId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'User creation failed');

      setSuccessMsg(`User ${newFullName} created successfully!`);
      setShowCreateUserModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: deptCode,
          name: deptName,
          description: deptDesc,
          isDistrictWide: deptIsDistrictWide,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Department creation failed');

      setSuccessMsg(`Department ${deptName} created successfully!`);
      setShowCreateDeptModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Dept creation failed');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: AccountStatus) => {
    const newStatus = currentStatus === AccountStatus.ACTIVE ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSuccessMsg('Account status updated');
        fetchData();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredUsers = usersList.filter((u) =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI-SCOS Administration & RBAC Portal</h2>
              <p className="text-xs text-slate-300">User Governance, Departmental Isolation & Security Audit Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-3 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex space-x-6 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`py-3.5 border-b-2 flex items-center gap-2 ${
              activeTab === 'USERS'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`py-3.5 border-b-2 flex items-center gap-2 ${
              activeTab === 'ROLES'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" /> Roles & Permissions ({rolesList.length})
          </button>
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`py-3.5 border-b-2 flex items-center gap-2 ${
              activeTab === 'DEPARTMENTS'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Departments ({departmentsList.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`py-3.5 border-b-2 flex items-center gap-2 ${
              activeTab === 'AUDIT_LOGS'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Security Audit Ledger ({auditLogs.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. USERS TAB */}
          {activeTab === 'USERS' && (
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={fetchData}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Add Officer / Admin
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-500">{u.email} • {u.mobile}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {u.departmentName || u.departmentCode || 'N/A (Citizen/District)'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === AccountStatus.ACTIVE
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className="px-2.5 py-1 text-[11px] font-medium border border-slate-300 hover:bg-slate-100 rounded transition"
                          >
                            {u.status === AccountStatus.ACTIVE ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. ROLES & PERMISSIONS TAB */}
          {activeTab === 'ROLES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rolesList.map((r) => (
                <div key={r.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2 py-1 rounded border border-blue-200">
                      {r.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {r.permissions.length} Permissions Allowed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.permissions.map((p) => (
                      <span key={p} className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. DEPARTMENTS TAB */}
          {activeTab === 'DEPARTMENTS' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-600">Active Municipal & Emergency Administration Departments</p>
                <button
                  onClick={() => setShowCreateDeptModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" /> Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departmentsList.map((d) => (
                  <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{d.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border">
                        {d.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{d.description}</p>
                    {d.isDistrictWide && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                        District-Wide Authority
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. AUDIT LOGS TAB */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition text-[11px]">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{log.actorEmail}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{log.actorRole}</div>
                      </td>
                      <td className="p-3 font-semibold text-blue-700">{log.action}</td>
                      <td className="p-3 text-slate-600 truncate max-w-xs">{log.resource}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create User */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create Administrative User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Official Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as RoleType)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none bg-white"
                >
                  <option value={RoleType.DEPARTMENT_ADMIN}>DEPARTMENT_ADMIN</option>
                  <option value={RoleType.DEPARTMENT_OFFICER}>DEPARTMENT_OFFICER</option>
                  <option value={RoleType.FIELD_OFFICER}>FIELD_OFFICER</option>
                  <option value={RoleType.AI_GOVERNANCE_OFFICER}>AI_GOVERNANCE_OFFICER</option>
                  {currentUser?.role === RoleType.SUPER_ADMIN && (
                    <>
                      <option value={RoleType.DISTRICT_ADMIN}>DISTRICT_ADMIN</option>
                      <option value={RoleType.SUPER_ADMIN}>SUPER_ADMIN</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Assigned Department</label>
                <select
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none bg-white"
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Initial Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Department */}
      {showCreateDeptModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create New Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FIRE_DEPT"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanpur Fire & Emergency Services"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Description</label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDeptModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
