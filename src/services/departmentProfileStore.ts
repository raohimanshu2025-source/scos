import {
  DepartmentProfile,
  ResponsibilityMapping,
  DepartmentType,
  DepartmentCapability,
} from '../types/departmentCoordination';
import { DataProvenance } from '../types/dataSource';

const now = new Date().toISOString();

const DEFAULT_PROVENANCE: DataProvenance = {
  sourceId: 'DS-PROTOTYPE-DEPT-REGISTRY',
  sourceName: 'Kanpur District Operational Governance Registry',
  department: 'District Administration',
  timestamp: now,
  dataMode: 'SIMULATED',
  dataQuality: 'HIGH',
  lastValidated: now,
  validationStatus: 'VALIDATED',
  dataPublisher: 'SCOS Departmental Coordination Engine',
  publisherRole: 'ADMINISTRATION',
  acquisitionMethod: 'SIMULATED',
  systemLineage: ['SCOS-Phase8.4-MultiDept-Engine'],
};

export const PROTOTYPE_DEPARTMENT_PROFILES: DepartmentProfile[] = [
  {
    departmentId: 'dept-nagar',
    departmentCode: 'MUNICIPAL',
    departmentName: 'Kanpur Nagar Nigam (Municipal Corporation)',
    departmentType: 'MUNICIPAL',
    description: 'Municipal sanitation, road surface maintenance, public area debris clearance, and urban drainage maintenance.',
    operationalScope: 'Kanpur Nagar Nigam Municipal Limits & Ward Area Operations',
    contactRole: 'Municipal Chief Engineer / Control Room In-Charge',
    status: 'ACTIVE',
    capabilities: [
      'ROAD_CLEANUP',
      'MUNICIPAL_RESPONSE',
      'PUBLIC_AREA_MANAGEMENT',
    ],
    infrastructureResponsibilities: [
      'ROAD',
      'ROAD_JUNCTION',
      'DRAIN',
      'MUNICIPAL_ASSET',
      'FLOOD_PRONE_ZONE',
    ],
    supportedIncidentTypes: [
      'WATERLOGGING',
      'SANITATION_ISSUE',
      'MAJOR_ROAD_DAMAGE',
      'INFRASTRUCTURE_FAILURE',
    ],
    slaProfile: {
      taskType: 'MUNICIPAL_CLEANUP',
      priority: 'P2',
      targetResponseMinutes: 45,
      targetCompletionMinutes: 180,
      escalationLevel: 1,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-KNN-DRAINAGE-01', 'DS-DIST-CIVIL-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'Kanpur Nagar Nigam Governance System',
      department: 'Kanpur Nagar Nigam',
    },
    isPrototypeProfile: true,
  },
  {
    departmentId: 'dept-jal',
    departmentCode: 'WATER',
    departmentName: 'Kanpur Jal Sansthan (Water & Dewatering)',
    departmentType: 'WATER',
    description: 'Urban drainage networks, trunk water mains, mobile dewatering pump deployment, and waterlogging abatement.',
    operationalScope: 'Greater Kanpur Water & Drainage Network Grid',
    contactRole: 'Executive Engineer (Dewatering & Water Supply)',
    status: 'ACTIVE',
    capabilities: [
      'DRAINAGE_RESPONSE',
      'DEWATERING',
      'WATER_INFRASTRUCTURE',
    ],
    infrastructureResponsibilities: [
      'DRAIN',
      'PUMPING_STATION',
      'WATER_PIPELINE',
      'FLOOD_PRONE_ZONE',
    ],
    supportedIncidentTypes: [
      'WATERLOGGING',
      'DRAINAGE_FAILURE',
      'WATER_SUPPLY_DISRUPTION',
      'FLOODING',
    ],
    slaProfile: {
      taskType: 'DEWATERING_DISPATCH',
      priority: 'P1',
      targetResponseMinutes: 30,
      targetCompletionMinutes: 120,
      escalationLevel: 2,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-KNN-PUMP-01', 'DS-JAL-WATER-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'Kanpur Jal Sansthan Technical Wing',
      department: 'Kanpur Jal Sansthan',
    },
    isPrototypeProfile: true,
  },
  {
    departmentId: 'dept-traffic',
    departmentCode: 'TRAFFIC',
    departmentName: 'Kanpur Traffic Police',
    departmentType: 'TRAFFIC',
    description: 'Arterial traffic management, emergency corridor diversions, intersection signal control, and road bottleneck clearing.',
    operationalScope: 'Kanpur Urban Traffic Corridor Network',
    contactRole: 'Assistant Commissioner of Police (Traffic Ops)',
    status: 'ACTIVE',
    capabilities: [
      'TRAFFIC_DIVERSION',
      'ROAD_CONTROL',
      'TRAFFIC_MONITORING',
    ],
    infrastructureResponsibilities: [
      'ROAD',
      'ROAD_JUNCTION',
      'BRIDGE',
      'TRAFFIC_CORRIDOR',
    ],
    supportedIncidentTypes: [
      'TRAFFIC_CONGESTION',
      'TRAFFIC_ACCIDENT',
      'WATERLOGGING',
      'MAJOR_ROAD_DAMAGE',
    ],
    slaProfile: {
      taskType: 'TRAFFIC_DIVERSION',
      priority: 'P1',
      targetResponseMinutes: 15,
      targetCompletionMinutes: 60,
      escalationLevel: 2,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-TRAFFIC-IOT-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'Kanpur Traffic Police Command Unit',
      department: 'Kanpur Traffic Police',
    },
    isPrototypeProfile: true,
  },
  {
    departmentId: 'dept-health',
    departmentCode: 'HEALTH',
    departmentName: 'District Health Services',
    departmentType: 'HEALTH',
    description: 'Hospital access protection, emergency ambulance routing, public health sanitation, and epidemic prevention.',
    operationalScope: 'Kanpur District Health Infrastructure & Tertiary Care Network',
    contactRole: 'Chief Medical Officer / Emergency Response Lead',
    status: 'ACTIVE',
    capabilities: [
      'HOSPITAL_ACCESS',
      'EMERGENCY_COORDINATION',
      'HEALTH_FACILITY_PROTECTION',
    ],
    infrastructureResponsibilities: [
      'HOSPITAL',
      'HEALTH_FACILITY',
      'AMBULANCE_CORRIDOR',
    ],
    supportedIncidentTypes: [
      'PUBLIC_HEALTH_INCIDENT',
      'WATERLOGGING',
      'FLOODING',
      'TRAFFIC_ACCIDENT',
    ],
    slaProfile: {
      taskType: 'EMERGENCY_ACCESS_PROTECTION',
      priority: 'P1',
      targetResponseMinutes: 20,
      targetCompletionMinutes: 90,
      escalationLevel: 3,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-HEALTH-GOV-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'District Health & Family Welfare Office',
      department: 'District Health Services',
    },
    isPrototypeProfile: true,
  },
  {
    departmentId: 'dept-pwd',
    departmentCode: 'PUBLIC_WORKS',
    departmentName: 'Public Works Department (PWD)',
    departmentType: 'PUBLIC_WORKS',
    description: 'Arterial highway repair, bridge maintenance, storm drain structural maintenance, and civil works.',
    operationalScope: 'Kanpur District Public Works State Highway & Major District Road Grid',
    contactRole: 'Superintending Engineer (PWD Kanpur Circle)',
    status: 'ACTIVE',
    capabilities: [
      'ROAD_INFRASTRUCTURE',
      'DRAINAGE_INFRASTRUCTURE',
      'INFRASTRUCTURE_REPAIR',
    ],
    infrastructureResponsibilities: [
      'ROAD',
      'BRIDGE',
      'DRAIN',
      'CIVIL_STRUCTURE',
    ],
    supportedIncidentTypes: [
      'MAJOR_ROAD_DAMAGE',
      'INFRASTRUCTURE_FAILURE',
      'DRAINAGE_FAILURE',
    ],
    slaProfile: {
      taskType: 'INFRASTRUCTURE_REPAIR',
      priority: 'P2',
      targetResponseMinutes: 60,
      targetCompletionMinutes: 240,
      escalationLevel: 2,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-DIST-CIVIL-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'PWD State Highways Division',
      department: 'Public Works',
    },
    isPrototypeProfile: true,
  },
  {
    departmentId: 'dept-dist',
    departmentCode: 'DISTRICT_ADMIN',
    departmentName: 'District Administration Headquarters',
    departmentType: 'DISTRICT_ADMINISTRATION',
    description: 'Cross-departmental crisis coordination, District Magistrate situation escalation, inter-agency policy direction, and emergency alerts.',
    operationalScope: 'Entire Kanpur District Administrative Territory',
    contactRole: 'District Magistrate / District Emergency Officer',
    status: 'ACTIVE',
    capabilities: [
      'CROSS_DEPARTMENT_COORDINATION',
      'ESCALATION',
      'SITUATION_MONITORING',
    ],
    infrastructureResponsibilities: [
      'CRITICAL_FACILITY',
      'DISTRICT_HEADQUARTERS',
      'FLOOD_PRONE_ZONE',
    ],
    supportedIncidentTypes: [
      'WATERLOGGING',
      'FLOODING',
      'INFRASTRUCTURE_FAILURE',
      'PUBLIC_HEALTH_INCIDENT',
    ],
    slaProfile: {
      taskType: 'DISTRICT_ESCALATION_REVIEW',
      priority: 'P1',
      targetResponseMinutes: 15,
      targetCompletionMinutes: 60,
      escalationLevel: 3,
      isPrototypeParameter: true,
    },
    dataSources: ['DS-DIST-CIVIL-01'],
    provenance: {
      ...DEFAULT_PROVENANCE,
      sourceName: 'District Magistrate Command Cell',
      department: 'District Administration',
    },
    isPrototypeProfile: true,
  },
];

export const PROTOTYPE_RESPONSIBILITY_MAPPINGS: ResponsibilityMapping[] = [
  {
    infrastructureType: 'DRAIN',
    operationalResponsibility: 'Drainage blockage removal, silt clearance, and dewatering pump dispatch',
    primaryDepartmentId: 'dept-jal',
    secondaryDepartmentIds: ['dept-nagar', 'dept-pwd'],
    description: 'Kanpur Jal Sansthan leads emergency dewatering and main drainage maintenance; Kanpur Nagar Nigam assists with ward-level silt removal.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'PUMPING_STATION',
    operationalResponsibility: 'Pumping station operational maintenance, fuel supply, and water discharge routing',
    primaryDepartmentId: 'dept-jal',
    secondaryDepartmentIds: ['dept-nagar'],
    description: 'Kanpur Jal Sansthan manages dewatering pumps and municipal pump house operations.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'ROAD',
    operationalResponsibility: 'Traffic diversion, barricading, and emergency road repair',
    primaryDepartmentId: 'dept-traffic',
    secondaryDepartmentIds: ['dept-pwd', 'dept-nagar'],
    description: 'Traffic Police handles immediate road diversions; Public Works and Municipal Corporation execute structural repairs.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'ROAD_JUNCTION',
    operationalResponsibility: 'Intersection signal management, traffic flow diversion, and congestion control',
    primaryDepartmentId: 'dept-traffic',
    secondaryDepartmentIds: ['dept-nagar'],
    description: 'Traffic Police maintains junction flow and emergency traffic re-routing.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'HOSPITAL',
    operationalResponsibility: 'Emergency medical corridor protection, patient access preservation, and health facility protection',
    primaryDepartmentId: 'dept-health',
    secondaryDepartmentIds: ['dept-traffic', 'dept-jal'],
    description: 'District Health Services ensures medical access; Traffic Police clears access roads; Jal Sansthan prevents waterlogging at hospital gates.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'MUNICIPAL_ASSET',
    operationalResponsibility: 'Public area management, debris cleanup, and municipal sanitation',
    primaryDepartmentId: 'dept-nagar',
    secondaryDepartmentIds: ['dept-dist'],
    description: 'Kanpur Nagar Nigam maintains public area cleanliness and municipal property.',
    isPrototypeMapping: true,
  },
  {
    infrastructureType: 'WATER_PIPELINE',
    operationalResponsibility: 'Trunk pipeline leak isolation, repair, and water supply restoration',
    primaryDepartmentId: 'dept-jal',
    secondaryDepartmentIds: ['dept-nagar'],
    description: 'Kanpur Jal Sansthan handles pipeline repairs and municipal water supply.',
    isPrototypeMapping: true,
  },
];

class DepartmentProfileStore {
  private profiles: DepartmentProfile[] = [...PROTOTYPE_DEPARTMENT_PROFILES];
  private responsibilityMappings: ResponsibilityMapping[] = [...PROTOTYPE_RESPONSIBILITY_MAPPINGS];

  public getAllProfiles(): DepartmentProfile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): DepartmentProfile | undefined {
    return this.profiles.find(
      (p) => p.departmentId.toLowerCase() === id.toLowerCase() || p.departmentCode.toLowerCase() === id.toLowerCase()
    );
  }

  public getProfilesByType(type: DepartmentType): DepartmentProfile[] {
    return this.profiles.filter((p) => p.departmentType === type);
  }

  public getResponsibilityMappings(): ResponsibilityMapping[] {
    return [...this.responsibilityMappings];
  }

  public getMappingForInfrastructureType(infraType: string): ResponsibilityMapping | undefined {
    return this.responsibilityMappings.find(
      (m) => m.infrastructureType.toUpperCase() === infraType.toUpperCase()
    );
  }
}

export const departmentProfileStore = new DepartmentProfileStore();
