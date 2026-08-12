/**
 * SCOS Configurable Department Impact Mapping & Rule Engine
 * Maps urban event categories and severity levels to primary/secondary departments,
 * potential secondary impacts, default SLA thresholds, and action templates.
 */

import { IncidentCategory, IncidentSeverity, IncidentPriority, IncidentImpactRule } from '../types/incident';

export const DEPARTMENT_MAP: Record<string, { name: string; code: string; color: string }> = {
  MUNICIPAL: { name: 'Kanpur Nagar Nigam (Municipal Corp)', code: 'KNN', color: '#10b981' },
  WATER: { name: 'Kanpur Jal Sansthan (Water Works)', code: 'KJS', color: '#2563eb' },
  TRAFFIC: { name: 'Traffic Police & Transport Dept', code: 'KTP', color: '#f59e0b' },
  HEALTH: { name: 'District Health & Emergency Services', code: 'CMO', color: '#8b5cf6' },
  DISTRICT_ADMIN: { name: 'District Administration HQ', code: 'DM', color: '#6366f1' },
};

export const INCIDENT_IMPACT_RULES: Record<IncidentCategory, IncidentImpactRule> = {
  WATERLOGGING: {
    category: 'WATERLOGGING',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['TRAFFIC', 'WATER', 'HEALTH'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P1',
    demoSlaMinutesP1: 30,
    potentialImpacts: [
      'Arterial road traffic congestion & vehicle stalling',
      'Drainage overflow & localized sewage reflux',
      'Water stagnation & vector-borne health risks',
    ],
    defaultActionsMap: {
      MUNICIPAL: [
        'Deploy heavy-duty suction pumps to submerged arterial road sections.',
        'Clear storm-water catch basins and unblock drainage bottlenecks.',
      ],
      TRAFFIC: [
        'Deploy traffic marshals to redirect vehicles away from inundated zones.',
        'Issue real-time traffic advisory broadcasts via LED displays.',
      ],
      WATER: [
        'Inspect nearby drinking water pipelines for flood infiltration risk.',
        'Isolate sewage trunk line valve B-4 to prevent backflow.',
      ],
      HEALTH: [
        'Stand by rapid response medical squad for waterborne disease prevention.',
      ],
    },
  },

  FLOODING: {
    category: 'FLOODING',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['TRAFFIC', 'WATER', 'HEALTH', 'DISTRICT_ADMIN'],
    defaultSeverity: 'CRITICAL',
    defaultPriority: 'P1',
    demoSlaMinutesP1: 15,
    potentialImpacts: [
      'River Ganga outfall surcharging & widespread inundation',
      'Mass residential evacuation requirement in low-lying wards',
      'Power grid tripping & potable water contamination risk',
    ],
    defaultActionsMap: {
      MUNICIPAL: [
        'Initiate emergency evacuation protocols for low-lying ward clusters.',
        'Activate all 6 regional drainage pumping stations.',
      ],
      TRAFFIC: [
        'Close flooded bridges & establish emergency green corridor for relief.',
      ],
      WATER: [
        'Deploy mobile drinking water tankers to affected relief camps.',
      ],
      HEALTH: [
        'Set up medical relief camps & dispatch cholera/malaria preventative kits.',
      ],
      DISTRICT_ADMIN: [
        'Activate District Disaster Management Authority (DDMA) Command Cell.',
      ],
    },
  },

  WATER_SUPPLY_DISRUPTION: {
    category: 'WATER_SUPPLY_DISRUPTION',
    primaryDepartment: 'WATER',
    potentiallyAffected: ['MUNICIPAL', 'HEALTH'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P2',
    demoSlaMinutesP1: 45,
    potentialImpacts: [
      'Pipe burst causing local street submersion',
      'Loss of potable water supply for ~12,000 households',
      'Hospital & school water supply shortfall',
    ],
    defaultActionsMap: {
      WATER: [
        'Locate and isolate main supply valve to halt pipeline flooding.',
        'Dispatch hydraulic excavation crew for emergency pipe repair.',
      ],
      MUNICIPAL: [
        'Dispatch mobile water tankers to affected residential blocks.',
      ],
      HEALTH: [
        'Verify emergency water reserves at nearby district hospitals.',
      ],
    },
  },

  MAJOR_ROAD_DAMAGE: {
    category: 'MAJOR_ROAD_DAMAGE',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['TRAFFIC'],
    defaultSeverity: 'MEDIUM',
    defaultPriority: 'P2',
    demoSlaMinutesP1: 60,
    potentialImpacts: [
      'Carriageway cave-in / deep pothole creation',
      'Commuter vehicle damage and traffic bottleneck',
    ],
    defaultActionsMap: {
      MUNICIPAL: [
        'Deploy road repair unit for cold-mix patch filling and barricading.',
      ],
      TRAFFIC: [
        'Set up warning cones and restrict lane movement.',
      ],
    },
  },

  TRAFFIC_ACCIDENT: {
    category: 'TRAFFIC_ACCIDENT',
    primaryDepartment: 'TRAFFIC',
    potentiallyAffected: ['HEALTH', 'MUNICIPAL'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P1',
    demoSlaMinutesP1: 15,
    potentialImpacts: [
      'Casualties or injuries requiring emergency ambulance dispatch',
      'Arterial corridor gridlock',
      'Debris obstructing roadway',
    ],
    defaultActionsMap: {
      TRAFFIC: [
        'Dispatch traffic officers to secure crash site and clear lane.',
      ],
      HEALTH: [
        'Dispatch ALS ambulance from nearest district hospital.',
      ],
      MUNICIPAL: [
        'Deploy towing truck and road-cleaning squad for debris removal.',
      ],
    },
  },

  TRAFFIC_CONGESTION: {
    category: 'TRAFFIC_CONGESTION',
    primaryDepartment: 'TRAFFIC',
    potentiallyAffected: ['MUNICIPAL'],
    defaultSeverity: 'MEDIUM',
    defaultPriority: 'P3',
    demoSlaMinutesP1: 30,
    potentialImpacts: [
      'Gridlock at major intersection (e.g. Parade Crossing / Chunniganj)',
      'Public transport delays',
    ],
    defaultActionsMap: {
      TRAFFIC: [
        'Manual override of smart traffic light timing at major intersections.',
      ],
      MUNICIPAL: [
        'Inspect street vendor encroached lanes causing carriageway constriction.',
      ],
    },
  },

  DRAINAGE_FAILURE: {
    category: 'DRAINAGE_FAILURE',
    primaryDepartment: 'WATER',
    potentiallyAffected: ['MUNICIPAL', 'HEALTH'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P2',
    demoSlaMinutesP1: 40,
    potentialImpacts: [
      'Sewage trunk blockage causing manhole overflow',
      'Foul odor & public health hazard',
    ],
    defaultActionsMap: {
      WATER: [
        'Deploy jetting machine to clear sewer line blockage.',
      ],
      MUNICIPAL: [
        'Sanitize affected street surface post sewer clearance.',
      ],
      HEALTH: [
        'Conduct disinfectant spray drive in immediate residential vicinity.',
      ],
    },
  },

  SANITATION_ISSUE: {
    category: 'SANITATION_ISSUE',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['HEALTH'],
    defaultSeverity: 'LOW',
    defaultPriority: 'P3',
    demoSlaMinutesP1: 120,
    potentialImpacts: [
      'Unattended solid waste dump backlog',
      'Stray animal accumulation',
    ],
    defaultActionsMap: {
      MUNICIPAL: [
        'Dispatch compactor vehicle #14 for solid waste pickup.',
      ],
      HEALTH: [
        'Inspect dump area for pest breeding control.',
      ],
    },
  },

  PUBLIC_HEALTH_INCIDENT: {
    category: 'PUBLIC_HEALTH_INCIDENT',
    primaryDepartment: 'HEALTH',
    potentiallyAffected: ['MUNICIPAL', 'WATER'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P1',
    demoSlaMinutesP1: 30,
    potentialImpacts: [
      'Cluster of waterborne illness cases reported from a ward',
      'Potential contamination of local water source',
    ],
    defaultActionsMap: {
      HEALTH: [
        'Deploy epidemiological survey team and set up fever check posts.',
      ],
      WATER: [
        'Collect water quality samples from all taps in 500m radius.',
      ],
      MUNICIPAL: [
        'Conduct intensive fogging and anti-larval chemical spray.',
      ],
    },
  },

  INFRASTRUCTURE_FAILURE: {
    category: 'INFRASTRUCTURE_FAILURE',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['TRAFFIC', 'WATER'],
    defaultSeverity: 'HIGH',
    defaultPriority: 'P2',
    demoSlaMinutesP1: 45,
    potentialImpacts: [
      'Flyover structural fault / street light pole collapse',
      'Public safety hazard and lane blockage',
    ],
    defaultActionsMap: {
      MUNICIPAL: [
        'Dispatch structural engineering inspection team & hydraulic crane.',
      ],
      TRAFFIC: [
        'Cordon off structural risk area and divert light traffic.',
      ],
    },
  },

  FIRE_EMERGENCY: {
    category: 'FIRE_EMERGENCY',
    primaryDepartment: 'DISTRICT_ADMIN',
    potentiallyAffected: ['HEALTH', 'TRAFFIC', 'WATER'],
    defaultSeverity: 'CRITICAL',
    defaultPriority: 'P1',
    demoSlaMinutesP1: 10,
    potentialImpacts: [
      'Structural fire in commercial market zone',
      'Casualty risk & major smoke dispersion',
    ],
    defaultActionsMap: {
      DISTRICT_ADMIN: [
        'Dispatch Fire Services tenders & coordinate district emergency grid.',
      ],
      HEALTH: [
        'Dispatch trauma ambulances and alert L2 Burn Ward.',
      ],
      TRAFFIC: [
        'Clear emergency route for fire engines.',
      ],
      WATER: [
        'Boost water hydrants pressure in affected zone.',
      ],
    },
  },

  OTHER_URBAN_INCIDENT: {
    category: 'OTHER_URBAN_INCIDENT',
    primaryDepartment: 'MUNICIPAL',
    potentiallyAffected: ['DISTRICT_ADMIN'],
    defaultSeverity: 'LOW',
    defaultPriority: 'P4',
    demoSlaMinutesP1: 240,
    potentialImpacts: ['General civic complaint requiring investigation'],
    defaultActionsMap: {
      MUNICIPAL: [
        'Assign field officer for site inspection and assessment.',
      ],
    },
  },
};

/**
 * Fallback Rule-Based Impact Engine
 * Runs deterministic rule evaluation when AI is unavailable or as baseline.
 */
export function evaluateImpactByRules(
  category: IncidentCategory,
  location: string,
  severityInput?: IncidentSeverity,
  descriptionInput?: string
): {
  severity: IncidentSeverity;
  priority: IncidentPriority;
  affected_departments: string[];
  primary_department: string;
  secondary_departments: string[];
  impact_summary: string;
  recommended_actions: string[];
  confidence: number;
  explanation: string;
  demoSlaMinutes: number;
} {
  const rule = INCIDENT_IMPACT_RULES[category] || INCIDENT_IMPACT_RULES.OTHER_URBAN_INCIDENT;
  const severity = severityInput || rule.defaultSeverity;
  const priority = severity === 'CRITICAL' ? 'P1' : severity === 'HIGH' ? 'P1' : severity === 'MEDIUM' ? 'P2' : 'P3';

  // Determine affected departments based on severity
  const secondary = severity === 'CRITICAL' || severity === 'HIGH'
    ? rule.potentiallyAffected
    : rule.potentiallyAffected.slice(0, 1);

  const affected_departments = Array.from(new Set([rule.primaryDepartment, ...secondary]));

  const impact_summary = `Rule Engine Assessment: ${category} at "${location}" classified as ${severity} severity (${priority} priority). Potential impacts include: ${rule.potentialImpacts.join('; ')}.`;

  const recommended_actions: string[] = [];
  affected_departments.forEach((dept) => {
    const deptActions = rule.defaultActionsMap[dept] || [];
    const deptName = DEPARTMENT_MAP[dept]?.name || dept;
    deptActions.forEach((act) => recommended_actions.push(`[${deptName}] ${act}`));
  });

  const explanation = `Evaluated using SCOS Rule Engine v5B.4. Category '${category}' automatically targets primary department '${DEPARTMENT_MAP[rule.primaryDepartment]?.name}' and ${secondary.length} secondary department(s) based on spatial and impact rules.`;

  return {
    severity,
    priority,
    affected_departments,
    primary_department: rule.primaryDepartment,
    secondary_departments: secondary,
    impact_summary,
    recommended_actions,
    confidence: 0.92, // Rule deterministic baseline
    explanation,
    demoSlaMinutes: rule.demoSlaMinutesP1,
  };
}
