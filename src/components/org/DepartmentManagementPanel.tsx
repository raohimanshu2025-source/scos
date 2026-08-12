import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Shield, CheckCircle2, AlertTriangle, Power, X, Save, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Department, PermissionType } from '../../types/auth';

interface DepartmentManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentUpdated: () => void;
  initialSelectedDeptId?: string | null;
}

export const DepartmentManagementPanel: React.FC<DepartmentManagementPanelProps> = ({
  isOpen,
  onClose,
  onDepartmentUpdated,
  initialSelectedDeptId,
}) => {
  const { token, hasPermission } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEdit = Boolean(editingDept.id);
    const url = isEdit ? `/api/admin/departments/${editingDept.id}` : '/api/admin/departments';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingDept),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Operation failed');
        return;
      }

      setSuccessMsg(isEdit ? 'Department updated successfully' : 'Department created successfully');
      setEditingDept(null);
      setIsCreatingNew(false);
      fetchDepartments();
      onDepartmentUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error');
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    const newStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/departments/${dept.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchDepartments();
        onDepartmentUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Department Management</h3>
              <p className="text-xs text-slate-300">Create, configure, and manage administrative departments</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
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

          {/* New / Edit Form Modal Sub-view */}
          {(editingDept || isCreatingNew) ? (
            <form onSubmit={handleSaveDepartment} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingDept?.id ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDept(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={editingDept?.name || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                    placeholder="e.g. Health & Family Welfare"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={editingDept?.code || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DEPT_HEALTH"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingDept?.category || 'GENERAL'}
                    onChange={(e) => setEditingDept({ ...editingDept, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="GENERAL">General Administration</option>
                    <option value="MUNICIPAL">Municipal Services</option>
                    <option value="UTILITIES">Public Utilities</option>
                    <option value="SAFETY">Public Safety & Law</option>
                    <option value="HEALTH">Health & Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District Wide Scope</label>
                  <select
                    value={editingDept?.isDistrictWide ? 'true' : 'false'}
                    onChange={(e) => setEditingDept({ ...editingDept, isDistrictWide: e.target.value === 'true' })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="false">Local / Ward Specific</option>
                    <option value="true">District Wide (All Wards)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Helpline / Phone</label>
                  <input
                    type="text"
                    value={editingDept?.contactPhone || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, contactPhone: e.target.value })}
                    placeholder="e.g. 0512-2550100"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={editingDept?.contactEmail || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, contactEmail: e.target.value })}
                    placeholder="e.g. health@kanpur.gov.in"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={editingDept?.description || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  placeholder="Responsibilities, jurisdiction and key functions..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDept(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Department
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter departments..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                <button
                  onClick={() => {
                    setEditingDept({ status: 'ACTIVE', category: 'GENERAL', districtId: 'dist-kanpur' });
                    setIsCreatingNew(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Department
                </button>
              )}
            </div>
          )}

          {/* Departments Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Code & Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Staff & Teams</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDepts.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{dept.name}</div>
                      <div className="font-mono text-[10px] text-indigo-600 font-semibold">{dept.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                        {dept.category || 'GENERAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      <div>{(dept as any).memberCount || 0} Members</div>
                      <div className="text-slate-400">{(dept as any).teamCount || 0} Teams</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dept.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        ● {dept.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                        <>
                          <button
                            onClick={() => setEditingDept(dept)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(dept)}
                            className={`p-1.5 rounded-lg transition ${
                              dept.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={dept.status === 'ACTIVE' ? 'Deactivate Department' : 'Activate Department'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
