import bcrypt from 'bcryptjs';
import { 
  User, 
  Role, 
  District,
  Department, 
  Team,
  Designation,
  AuditLogEvent, 
  RoleType, 
  PermissionType, 
  AccountStatus 
} from '../../types/auth';

// Seed District
export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'dist-kanpur',
    code: 'KANPUR_NAGAR',
    name: 'Kanpur Nagar District',
    state: 'Uttar Pradesh',
    country: 'India',
    adminCode: 'UP-KN-01',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Seed Designations
export const INITIAL_DESIGNATIONS: Designation[] = [
  { id: 'desig-dm', code: 'DM', title: 'District Magistrate', level: 1, description: 'District Executive Head', status: 'ACTIVE' },
  { id: 'desig-se', code: 'SUP_ENG', title: 'Superintending Engineer', level: 2, description: 'Departmental Administrative Head', status: 'ACTIVE' },
  { id: 'desig-ee', code: 'EXEC_ENG', title: 'Executive Engineer', level: 3, description: 'Divisional In-Charge', status: 'ACTIVE' },
  { id: 'desig-ae', code: 'ASST_ENG', title: 'Assistant Engineer / Officer', level: 4, description: 'Operational Officer', status: 'ACTIVE' },
  { id: 'desig-je', code: 'JUNIOR_ENG', title: 'Junior Engineer / Supervisor', level: 5, description: 'Field Crew Lead', status: 'ACTIVE' },
  { id: 'desig-tech', code: 'FIELD_TECH', title: 'Field Technician', level: 6, description: 'On-Ground Operator', status: 'ACTIVE' },
  { id: 'desig-coord', code: 'DIST_COORD', title: 'District Coordination Officer', level: 3, description: 'Cross-Department Coordinator', status: 'ACTIVE' },
];

// Initial Core Departments (MUNICIPAL, WATER, TRAFFIC, HEALTH)
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-dist',
    code: 'DISTRICT_ADMIN',
    name: 'District Administration Headquarters',
    description: 'Kanpur District Magistrate & Apex Administration',
    districtId: 'dist-kanpur',
    category: 'GENERAL',
    isDistrictWide: true,
    status: 'ACTIVE',
    contactEmail: 'dm-kanpur@up.gov.in',
    contactPhone: '0512-2304001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-nagar',
    code: 'MUNICIPAL',
    name: 'Kanpur Nagar Nigam (Municipal Corporation)',
    description: 'Municipal Sanitation, Roads, Drainage & Streetlighting',
    districtId: 'dist-kanpur',
    category: 'MUNICIPAL',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'nagar.nigam@kanpur.gov.in',
    contactPhone: '0512-2526001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-jal',
    code: 'WATER',
    name: 'Kanpur Jal Sansthan (Water Supply)',
    description: 'Water Supply Networks, Pipeline Distribution & Quality',
    districtId: 'dist-kanpur',
    category: 'WATER',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'jalsansthan@kanpur.gov.in',
    contactPhone: '0512-2540112',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-traffic',
    code: 'TRAFFIC',
    name: 'Kanpur Traffic Police & Transport',
    description: 'Urban Traffic Operations, Signal Systems & Congestion',
    districtId: 'dist-kanpur',
    category: 'TRAFFIC',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'traffic@kanpurpolice.gov.in',
    contactPhone: '0512-2310100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-health',
    code: 'HEALTH',
    name: 'District Health & Family Welfare Services',
    description: 'Public Health Infrastructure, Vector Control & Epidemic Preparedness',
    districtId: 'dist-kanpur',
    category: 'HEALTH',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'cmo-kanpur@up.gov.in',
    contactPhone: '0512-2306200',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-kesco',
    code: 'ELECTRICITY',
    name: 'Kanpur Electricity Supply Company (KESCO)',
    description: 'Power Distribution & Substation Network',
    districtId: 'dist-kanpur',
    category: 'ELECTRICITY',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'kesco@kanpur.gov.in',
    contactPhone: '0512-2530000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dept-env',
    code: 'ENVIRONMENT',
    name: 'Ganges & Industrial Pollution Control Board',
    description: 'Ganga Barrage, Tannery Effluent & Water Quality Monitoring',
    districtId: 'dist-kanpur',
    category: 'ENVIRONMENT',
    isDistrictWide: false,
    status: 'ACTIVE',
    contactEmail: 'pollution.board@kanpur.gov.in',
    contactPhone: '0512-2295050',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial Teams within Departments
export const INITIAL_TEAMS: Team[] = [
  // Municipal Teams
  { id: 'team-mun-road', code: 'ROAD_MAINT', name: 'Road Maintenance Team', departmentId: 'dept-nagar', description: 'Potholes, Asphalt Resurfacing & Trench Repair', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'team-mun-san', code: 'SANITATION', name: 'Solid Waste & Sanitation Team', departmentId: 'dept-nagar', description: 'Door-to-door Collection & Waste Depots', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'team-mun-light', code: 'STREETLIGHT', name: 'Smart Streetlight Team', departmentId: 'dept-nagar', description: 'LED Fixtures & Feeder Pillar Control', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Water Teams
  { id: 'team-wat-pipe', code: 'PIPE_MAINT', name: 'Pipeline Maintenance Team', departmentId: 'dept-jal', description: 'Burst Mains, Leak Detection & Valves', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'team-wat-qual', code: 'WATER_QUAL', name: 'Water Quality & Testing Team', departmentId: 'dept-jal', description: 'Chlorination, Heavy Metal & Microbial Testing', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Traffic Teams
  { id: 'team-trf-ops', code: 'TRAFFIC_OPS', name: 'Traffic Operations Team', departmentId: 'dept-traffic', description: 'Signal Timing & Corridor Congestion Control', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'team-trf-inc', code: 'INCIDENT_RESP', name: 'Incident Response Team', departmentId: 'dept-traffic', description: 'Accident Clearing & Emergency Diversions', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Health Teams
  { id: 'team-hlt-pub', code: 'PUBLIC_HEALTH', name: 'Public Health Sanitation Team', departmentId: 'dept-health', description: 'Fogging, Mosquito Larva Spraying & Disease Surveillance', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'team-hlt-emg', code: 'EMG_COORD', name: 'Emergency Health Coordination Team', departmentId: 'dept-health', description: 'Ambulance Routing & Hospital Bed Monitoring', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Role to Permission Mappings
export const ROLE_PERMISSIONS_MAP: Record<RoleType, PermissionType[]> = {
  [RoleType.SUPER_ADMIN]: Object.values(PermissionType),
  [RoleType.DISTRICT_ADMIN]: [
    PermissionType.USER_VIEW,
    PermissionType.DEPARTMENT_VIEW,
    PermissionType.DEPARTMENT_MANAGE,
    PermissionType.COMPLAINT_VIEW,
    PermissionType.COMPLAINT_ASSIGN,
    PermissionType.COMPLAINT_UPDATE,
    PermissionType.DASHBOARD_VIEW,
    PermissionType.ANALYTICS_VIEW,
    PermissionType.AI_VIEW,
    PermissionType.AI_RECOMMENDATION_REVIEW,
  ],
  [RoleType.DEPARTMENT_ADMIN]: [
    PermissionType.USER_VIEW,
    PermissionType.USER_CREATE,
    PermissionType.USER_UPDATE,
    PermissionType.DEPARTMENT_VIEW,
    PermissionType.COMPLAINT_VIEW,
    PermissionType.COMPLAINT_ASSIGN,
    PermissionType.COMPLAINT_UPDATE,
    PermissionType.DASHBOARD_VIEW,
    PermissionType.ANALYTICS_VIEW,
  ],
  [RoleType.DEPARTMENT_OFFICER]: [
    PermissionType.USER_VIEW,
    PermissionType.DEPARTMENT_VIEW,
    PermissionType.COMPLAINT_VIEW,
    PermissionType.COMPLAINT_UPDATE,
    PermissionType.DASHBOARD_VIEW,
    PermissionType.ANALYTICS_VIEW,
  ],
  [RoleType.FIELD_OFFICER]: [
    PermissionType.COMPLAINT_VIEW,
    PermissionType.COMPLAINT_UPDATE,
    PermissionType.DASHBOARD_VIEW,
  ],
  [RoleType.CITIZEN]: [
    PermissionType.COMPLAINT_VIEW,
    PermissionType.COMPLAINT_CREATE,
  ],
  [RoleType.AI_GOVERNANCE_OFFICER]: [
    PermissionType.COMPLAINT_VIEW,
    PermissionType.DASHBOARD_VIEW,
    PermissionType.ANALYTICS_VIEW,
    PermissionType.AI_VIEW,
    PermissionType.AI_RECOMMENDATION_REVIEW,
  ],
};

// Default Pre-seeded Users for Testing & Demonstration
const DEFAULT_PASSWORD = 'Password@123';
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

export const SEEDED_USERS: User[] = [
  {
    id: 'user-superadmin',
    email: 'superadmin@kanpur.gov.in',
    mobile: '9876543210',
    fullName: 'IIT Kanpur Systems Director',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.SUPER_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-dist',
    designationId: 'desig-dm',
    designationTitle: 'District Magistrate',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-dm',
    email: 'dm@kanpur.gov.in',
    mobile: '9876543211',
    fullName: 'District Magistrate Kanpur',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DISTRICT_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-dist',
    designationId: 'desig-dm',
    designationTitle: 'District Magistrate',
    secondaryDepartmentIds: ['dept-nagar', 'dept-jal', 'dept-traffic', 'dept-health'],
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-mun-admin',
    email: 'municipal.admin@kanpur.gov.in',
    mobile: '9876543217',
    fullName: 'Shri Vikram Singh (Municipal Commissioner)',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DEPARTMENT_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-nagar',
    teamId: 'team-mun-road',
    designationId: 'desig-se',
    designationTitle: 'Superintending Engineer',
    reportingManagerId: 'user-dm',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-jal-admin',
    email: 'jal.admin@kanpur.gov.in',
    mobile: '9876543212',
    fullName: 'Jal Sansthan Superintending Engineer',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DEPARTMENT_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-jal',
    teamId: 'team-wat-pipe',
    designationId: 'desig-se',
    designationTitle: 'Superintending Engineer',
    reportingManagerId: 'user-dm',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-trf-admin',
    email: 'traffic.admin@kanpur.gov.in',
    mobile: '9876543218',
    fullName: 'ACP Traffic Kanpur Nagar',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DEPARTMENT_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-traffic',
    teamId: 'team-trf-ops',
    designationId: 'desig-ee',
    designationTitle: 'Executive Engineer',
    reportingManagerId: 'user-dm',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-health-admin',
    email: 'health.admin@kanpur.gov.in',
    mobile: '9876543219',
    fullName: 'Chief Medical Officer Kanpur',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DEPARTMENT_ADMIN,
    districtId: 'dist-kanpur',
    departmentId: 'dept-health',
    teamId: 'team-hlt-pub',
    designationId: 'desig-ee',
    designationTitle: 'Executive Engineer',
    reportingManagerId: 'user-dm',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-kesco-officer',
    email: 'kesco.officer@kanpur.gov.in',
    mobile: '9876543213',
    fullName: 'KESCO Executive Engineer',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.DEPARTMENT_OFFICER,
    districtId: 'dist-kanpur',
    departmentId: 'dept-kesco',
    designationId: 'desig-ee',
    designationTitle: 'Executive Engineer',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-field-officer',
    email: 'field.officer@kanpur.gov.in',
    mobile: '9876543214',
    fullName: 'Ward 14 Field Crew Lead',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.FIELD_OFFICER,
    districtId: 'dist-kanpur',
    departmentId: 'dept-nagar',
    teamId: 'team-mun-road',
    designationId: 'desig-je',
    designationTitle: 'Junior Engineer / Supervisor',
    reportingManagerId: 'user-mun-admin',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-citizen',
    email: 'citizen@kanpur.gov.in',
    mobile: '9876543215',
    fullName: 'Rajesh Kumar (Swaroop Nagar)',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.CITIZEN,
    districtId: 'dist-kanpur',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-ai-officer',
    email: 'ai.governance@kanpur.gov.in',
    mobile: '9876543216',
    fullName: 'Dr. Anita Sharma (AI Audit Lead)',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: RoleType.AI_GOVERNANCE_OFFICER,
    districtId: 'dist-kanpur',
    departmentId: 'dept-dist',
    designationId: 'desig-coord',
    designationTitle: 'District Coordination Officer',
    status: AccountStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory Database Store with persistent updates
class DatabaseStore {
  private users: User[] = [...SEEDED_USERS];
  private districts: District[] = [...INITIAL_DISTRICTS];
  private departments: Department[] = [...INITIAL_DEPARTMENTS];
  private teams: Team[] = [...INITIAL_TEAMS];
  private designations: Designation[] = [...INITIAL_DESIGNATIONS];
  private auditLogs: AuditLogEvent[] = [];
  private passwordResetTokens: Map<string, { email: string; expiresAt: number }> = new Map();
  private tokenBlacklist: Set<string> = new Set();
  private loginAttempts: Map<string, { count: number; lockUntil: number }> = new Map();

  // District CRUD
  public getAllDistricts(): District[] {
    return [...this.districts];
  }

  public findDistrictById(id: string): District | undefined {
    return this.districts.find((d) => d.id === id);
  }

  public addDistrict(district: District): District {
    this.districts.push(district);
    return district;
  }

  public updateDistrict(id: string, updates: Partial<District>): District | undefined {
    const idx = this.districts.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.districts[idx] = { ...this.districts[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.districts[idx];
  }

  // Users CRUD
  public findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByMobile(mobile: string): User | undefined {
    return this.users.find((u) => u.mobile === mobile);
  }

  public findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.users[idx];
  }

  // Circular Reporting Check
  public isCircularReporting(userId: string, targetManagerId: string): boolean {
    if (userId === targetManagerId) return true;
    let currentId: string | undefined = targetManagerId;
    const visited = new Set<string>([userId]);

    while (currentId) {
      if (visited.has(currentId)) return true; // cycle detected
      visited.add(currentId);
      const managerUser = this.findUserById(currentId);
      currentId = managerUser?.reportingManagerId;
    }
    return false;
  }

  // Departments CRUD
  public getAllDepartments(): Department[] {
    return [...this.departments];
  }

  public findDepartmentById(id: string): Department | undefined {
    return this.departments.find((d) => d.id === id);
  }

  public findDepartmentByCode(code: string): Department | undefined {
    return this.departments.find((d) => d.code.toUpperCase() === code.toUpperCase());
  }

  public addDepartment(department: Department): Department {
    this.departments.push(department);
    return department;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | undefined {
    const idx = this.departments.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.departments[idx] = {
      ...this.departments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.departments[idx];
  }

  // Teams CRUD
  public getAllTeams(): Team[] {
    return [...this.teams];
  }

  public getTeamsByDepartment(departmentId: string): Team[] {
    return this.teams.filter((t) => t.departmentId === departmentId);
  }

  public findTeamById(id: string): Team | undefined {
    return this.teams.find((t) => t.id === id);
  }

  public addTeam(team: Team): Team {
    this.teams.push(team);
    return team;
  }

  public updateTeam(id: string, updates: Partial<Team>): Team | undefined {
    const idx = this.teams.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.teams[idx] = {
      ...this.teams[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.teams[idx];
  }

  // Designations CRUD
  public getAllDesignations(): Designation[] {
    return [...this.designations];
  }

  public addDesignation(designation: Designation): Designation {
    this.designations.push(designation);
    return designation;
  }

  // Password Reset Tokens
  public createPasswordResetToken(email: string, token: string, ttlMs = 15 * 60 * 1000): void {
    this.passwordResetTokens.set(token, {
      email,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public verifyAndConsumeResetToken(token: string): string | null {
    const record = this.passwordResetTokens.get(token);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.passwordResetTokens.delete(token);
      return null;
    }
    this.passwordResetTokens.delete(token);
    return record.email;
  }

  // Token Blacklist
  public blacklistToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  public isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  // Rate Limiting
  public recordLoginAttempt(key: string): { locked: boolean; remainingMs?: number } {
    const now = Date.now();
    const record = this.loginAttempts.get(key) || { count: 0, lockUntil: 0 };

    if (now < record.lockUntil) {
      return { locked: true, remainingMs: record.lockUntil - now };
    }

    record.count += 1;
    if (record.count >= 5) {
      record.lockUntil = now + 15 * 60 * 1000; // 15 mins lock out
      record.count = 0;
      this.loginAttempts.set(key, record);
      return { locked: true, remainingMs: 15 * 60 * 1000 };
    }

    this.loginAttempts.set(key, record);
    return { locked: false };
  }

  public clearLoginAttempts(key: string): void {
    this.loginAttempts.delete(key);
  }

  // Audit Log
  public addAuditLog(log: Omit<AuditLogEvent, 'id' | 'timestamp'>): AuditLogEvent {
    const event: AuditLogEvent = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(event); // newest first
    // keep max 500 logs
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return event;
  }

  public getAuditLogs(limit = 100): AuditLogEvent[] {
    return this.auditLogs.slice(0, limit);
  }
}

export const dbStore = new DatabaseStore();
