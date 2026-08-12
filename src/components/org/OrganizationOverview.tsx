import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Network, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { District, Department, Team, User, PermissionType } from '../../types/auth';

interface OrganizationOverviewProps {
  onManageDepartment: (deptId: string) => void;
  onManageUser: (userId: string) => void;
  onOpenOrgAssignment: (userId: string) => void;
  onOpenNewDept: () => void;
  onOpenNewTeam: () => void;
}

export const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  onManageDepartment,
  onManageUser,
  onOpenOrgAssignment,
  onOpenNewDept,
  onOpenNewTeam,
}) => {
  const { token, hasPermission, user: currentUser } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [distRes, deptRes, teamRes, userRes] = await Promise.all([
        fetch('/api/admin/districts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (distRes.ok) {
        const data = await distRes.json();
        setDistricts(data.districts || []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments || []);
      }
      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeams(data.teams || []);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load organization hierarchy data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const primaryDistrict = districts[0] || {
    id: 'dist-kanpur',
    name: 'Kanpur Nagar District',
    code: 'KANPUR_NAGAR',
    state: 'Uttar Pradesh',
    country: 'India',
    adminCode: 'UP-KN-01',
    status: 'ACTIVE',
  };

  const filteredDepts = departments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const deptTeams = teams.filter((t) => t.departmentId === selectedDepartment?.id);
  const deptMembers = users.filter((u) => u.departmentId === selectedDepartment?.id || u.secondaryDepartmentIds?.includes(selectedDepartment?.id || ''));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{primaryDistrict.state}, {primaryDistrict.country} — Code: {primaryDistrict.adminCode}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Network className="w-7 h-7 text-indigo-400" />
              {primaryDistrict.name} Organizational Hierarchy
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              District administrative structure governing multi-department operations, teams, designations, and cross-functional tasking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Tree
            </button>
            {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
              <>
                <button
                  onClick={onOpenNewDept}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Department
                </button>
                <button
                  onClick={onOpenNewTeam}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Team
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-3.5">
            <div className="text-xs font-medium text-slate-400">Total Departments</div>
            <div className="text-xl font-bold text-white mt-1">{departments.length}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">4 Core Seeded Active</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-3.5">
            <div className="text-xs font-medium text-slate-400">Configured Teams</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">{teams.length}</div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Across 7 Departments</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-3.5">
            <div className="text-xs font-medium text-slate-400">Administrative Staff</div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{users.length}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Officers & Field Leads</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-3.5">
            <div className="text-xs font-medium text-slate-400">Multi-Dept Coordinators</div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {users.filter((u) => u.secondaryDepartmentIds && u.secondaryDepartmentIds.length > 0).length}
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">Cross-Functional Scope</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Department Tree Left, Department Deep Dive Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Department Hierarchy Explorer */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Departments Directory
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {filteredDepts.length} Listed
            </span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by department name or code..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Status:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('INACTIVE')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Department List */}
          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredDepts.map((dept) => {
              const isSelected = selectedDepartment?.id === dept.id;
              const subTeams = teams.filter((t) => t.departmentId === dept.id);
              const members = users.filter((u) => u.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-200 shadow-sm'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dept.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{dept.description}</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'}`}
                    />
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 font-medium">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{subTeams.length} Teams</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{members.length} Officers</span>
                    </div>
                    {dept.isDistrictWide && (
                      <span className="ml-auto text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        District Wide
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Department Details & Teams */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
          {selectedDepartment ? (
            <>
              {/* Department Header Detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                      {selectedDepartment.code}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        selectedDepartment.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {selectedDepartment.status}
                    </span>
                    <span className="text-xs text-slate-400">• Category: {selectedDepartment.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedDepartment.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{selectedDepartment.description}</p>
                </div>

                {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                  <button
                    onClick={() => onManageDepartment(selectedDepartment.id)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5 self-start sm:self-center shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Manage Department
                  </button>
                )}
              </div>

              {/* Department Contact & Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-medium">Official Contact Email</div>
                  <div className="font-semibold text-slate-800">{selectedDepartment.contactEmail || 'Not configured'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-medium">Official Contact Helpline</div>
                  <div className="font-semibold text-slate-800">{selectedDepartment.contactPhone || 'Not configured'}</div>
                </div>
              </div>

              {/* Teams Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Teams within {selectedDepartment.name} ({deptTeams.length})
                  </h4>
                  {hasPermission(PermissionType.DEPARTMENT_MANAGE) && (
                    <button
                      onClick={onOpenNewTeam}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Team
                    </button>
                  )}
                </div>

                {deptTeams.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                    No active teams created for this department yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deptTeams.map((team) => {
                      const teamMemberCount = users.filter((u) => u.teamId === team.id).length;
                      return (
                        <div key={team.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-xs text-slate-900">{team.name}</div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                              {team.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{team.description}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5 text-indigo-500" /> {teamMemberCount} members
                            </span>
                            <span className="text-emerald-700 font-medium">● {team.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Department Personnel Directory */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Department Personnel Directory ({deptMembers.length})
                  </h4>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {deptMembers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No personnel currently assigned to this department.</div>
                  ) : (
                    deptMembers.map((member) => (
                      <div key={member.id} className="p-3.5 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                              {member.fullName}
                              {member.designationTitle && (
                                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                  {member.designationTitle}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{member.email}</span>
                              <span>• {member.role}</span>
                            </div>
                          </div>
                        </div>

                        {hasPermission(PermissionType.USER_UPDATE) && (
                          <button
                            onClick={() => onOpenOrgAssignment(member.id)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            Assign Scope
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">Select a department from the directory to inspect its hierarchy.</div>
          )}
        </div>
      </div>
    </div>
  );
};
