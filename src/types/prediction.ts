/**
 * SCOS Phase 5B.5 — Predictive Intelligence & Decision Support Data Models
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DataQualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type PredictiveUseCase =
  | 'WATERLOGGING'
  | 'TRAFFIC_CONGESTION'
  | 'WATER_SUPPLY_DISRUPTION'
  | 'PUBLIC_HEALTH_PRESSURE';

export type TimeHorizon =
  | 'Next 1 hour'
  | 'Next 2 hours'
  | 'Next 6 hours'
  | 'Next 24 hours'
  | 'Next 3 days';

export type TrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING';

export type EarlyWarningStatus =
  | 'NONE'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'MODIFIED'
  | 'DISMISSED';

export interface ContributingFactor {
  id: string;
  factor_name: string;
  is_present: boolean;
  description: string;
  weight: number; // 0 - 100 contribution
}

export interface InfrastructureContextItem {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'ROAD' | 'WATER_PLANT' | 'DRAINAGE' | 'SCHOOL' | 'EMERGENCY_FACILITY';
  distance_meters: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

export interface HistoricalPatternSummary {
  previous_incidents_count: number;
  time_patterns: string;
  recurring_categories: string[];
  previous_response_outcomes: string;
  similarity_score: number; // 0 - 100%
}

export interface DecisionOption {
  option_id: string;
  title: string;
  description: string;
  affected_departments: string[];
  preventive_actions: string[];
  is_scos_recommended: boolean;
}

export interface DecisionSupportData {
  situation: string;
  risk_summary: string;
  impact_projection: string;
  affected_departments: string[];
  options: DecisionOption[];
  scos_recommendation: string;
  rationale: string;
}

export interface RiskZone {
  zone_id: string;
  zone_name: string;
  ward_zone: string;
  center_lat: number;
  center_lng: number;
  use_case: PredictiveUseCase;
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  confidence: ConfidenceLevel;
  data_quality: DataQualityLevel;
  time_horizon: TimeHorizon;
  trend: TrendDirection;
  affected_departments: string[]; // e.g. ["MUNICIPAL", "TRAFFIC", "WATER", "HEALTH"]
  contributing_factors: ContributingFactor[];
  ai_operational_explanation: string;
  recommended_preventive_actions: string[];
  decision_support: DecisionSupportData;
  nearby_infrastructure: InfrastructureContextItem[];
  historical_pattern: HistoricalPatternSummary;
  early_warning_status: EarlyWarningStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  is_simulated: boolean;
}

export interface WhatIfScenarioInput {
  scenario_title: string;
  rainfall_intensity_mm_hr: number;
  duration_hours: number;
  road_blockage_severity: 'NONE' | 'PARTIAL' | 'TOTAL';
  drainage_clogging_percent: number;
  target_zone_id: string;
}

export interface WhatIfScenarioResult {
  scenario_id: string;
  title: string;
  simulated_conditions: WhatIfScenarioInput;
  predicted_risk_level: RiskLevel;
  predicted_risk_score: number;
  affected_zones: string[];
  affected_departments: string[];
  possible_service_impacts: string[];
  recommended_preparation: string[];
  explanation: string;
  created_at: string;
  is_scenario_simulation: true; // Explicitly required label
}

export interface ResearchMetrics {
  total_risks_detected: number;
  high_critical_risks_count: number;
  prediction_response_time_ms: number;
  recommendation_acceptance_rate_percent: number;
  preventive_actions_created_count: number;
  cross_department_actions_count: number;
  false_positive_rate_percent: number;
  system_reliability_uptime_percent: number;
}

export interface PredictiveDemoStep {
  step: number;
  title: string;
  actor: string;
  role: string;
  description: string;
  phase_type:
    | 'RAINFALL_INGESTION'
    | 'PATTERN_DETECTION'
    | 'RISK_SCORING'
    | 'ZONE_MAPPING'
    | 'AI_EXPLANATION'
    | 'DEPT_IDENTIFICATION'
    | 'PREVENTIVE_RECOMMEND'
    | 'EARLY_WARNING'
    | 'OFFICER_REVIEW'
    | 'OFFICER_APPROVAL'
    | 'PREVENTIVE_TASK_DISPATCH'
    | 'DEPT_ACKNOWLEDGMENT'
    | 'RISK_MONITORING'
    | 'INTERVENTION_SUCCESS'
    | 'TIMELINE_SEALED';
}
