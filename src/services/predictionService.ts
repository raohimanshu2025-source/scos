/**
 * SCOS Phase 5B.5 — Predictive Intelligence & Risk Model Engine
 * Abstracted prediction service supporting Rule-Based Scoring, AI operational explanations via Gemini,
 * composite risk scoring (Historical + Current + Spatial + Vulnerability), and What-If scenario simulations.
 */

import { GoogleGenAI } from '@google/genai';
import {
  RiskZone,
  RiskLevel,
  ConfidenceLevel,
  DataQualityLevel,
  PredictiveUseCase,
  WhatIfScenarioInput,
  WhatIfScenarioResult,
  DecisionSupportData,
} from '../types/prediction';

/**
 * Interface defining the SCOS Prediction Engine abstraction.
 * Allows switching or combining RuleBased, AI-Assisted, or ML models.
 */
export interface PredictionEngine {
  calculateRiskScore(factors: {
    historicalWeight: number; // 0 - 100
    currentConditionsWeight: number; // 0 - 100
    spatialContextWeight: number; // 0 - 100
    vulnerabilityWeight: number; // 0 - 100
  }): number;

  getRiskLevel(score: number): RiskLevel;

  simulateScenario(input: WhatIfScenarioInput): Promise<WhatIfScenarioResult>;
}

/**
 * Calculates Risk Level based on SCOS Configurable Thresholds:
 * 0 - 25: LOW
 * 26 - 50: MEDIUM
 * 51 - 75: HIGH
 * 76 - 100: CRITICAL
 */
export function mapScoreToRiskLevel(score: number): RiskLevel {
  if (score >= 76) return 'CRITICAL';
  if (score >= 51) return 'HIGH';
  if (score >= 26) return 'MEDIUM';
  return 'LOW';
}

/**
 * Deterministic SCOS Rule-Based Prediction Engine
 */
export class RuleBasedPredictionEngine implements PredictionEngine {
  calculateRiskScore(factors: {
    historicalWeight: number;
    currentConditionsWeight: number;
    spatialContextWeight: number;
    vulnerabilityWeight: number;
  }): number {
    // Composite formula: Score = (Hist * 0.30) + (Curr * 0.35) + (Spat * 0.20) + (Vuln * 0.15)
    const score = Math.round(
      factors.historicalWeight * 0.30 +
        factors.currentConditionsWeight * 0.35 +
        factors.spatialContextWeight * 0.20 +
        factors.vulnerabilityWeight * 0.15
    );
    return Math.min(100, Math.max(0, score));
  }

  getRiskLevel(score: number): RiskLevel {
    return mapScoreToRiskLevel(score);
  }

  async simulateScenario(input: WhatIfScenarioInput): Promise<WhatIfScenarioResult> {
    // Calculate simulated risk score
    let baseScore = 20;

    // Rainfall component (up to 45 pts)
    const rainPoints = Math.min(45, (input.rainfall_intensity_mm_hr / 100) * 45);
    baseScore += rainPoints;

    // Road blockage component (up to 20 pts)
    if (input.road_blockage_severity === 'TOTAL') baseScore += 20;
    else if (input.road_blockage_severity === 'PARTIAL') baseScore += 10;

    // Clogging component (up to 25 pts)
    baseScore += (input.drainage_clogging_percent / 100) * 25;

    const finalScore = Math.min(100, Math.round(baseScore));
    const riskLevel = this.getRiskLevel(finalScore);

    const affectedDepts = ['MUNICIPAL', 'TRAFFIC'];
    if (finalScore > 50) affectedDepts.push('WATER');
    if (finalScore > 75) affectedDepts.push('HEALTH');

    const serviceImpacts = [
      `Potential road inundation (${Math.round(input.rainfall_intensity_mm_hr * 0.8)}cm expected accumulation)`,
      `Subsurface drainage capacity exceeded by ${Math.max(10, Math.round(input.drainage_clogging_percent * 1.2))}%`,
    ];
    if (input.road_blockage_severity !== 'NONE') {
      serviceImpacts.push(`Traffic congestion bottleneck on major feeder arterial`);
    }

    const prep = [
      `Deploy heavy-duty mobile dewatering pumps to ${input.target_zone_id}`,
      `Pre-position Traffic Squads at upstream intersections`,
      `Issue automated early advisory to District Health & Emergency Services`,
    ];

    return {
      scenario_id: `SIM-${Date.now()}`,
      title: input.scenario_title || `What-If Analysis: ${input.rainfall_intensity_mm_hr}mm/hr Rainfall`,
      simulated_conditions: input,
      predicted_risk_level: riskLevel,
      predicted_risk_score: finalScore,
      affected_zones: [input.target_zone_id],
      affected_departments: affectedDepts,
      possible_service_impacts: serviceImpacts,
      recommended_preparation: prep,
      explanation: `Deterministic simulation calculated a risk score of ${finalScore}/100 based on ${input.rainfall_intensity_mm_hr}mm/hr precipitation, ${input.drainage_clogging_percent}% drainage obstruction, and ${input.road_blockage_severity} corridor impact.`,
      created_at: new Date().toISOString(),
      is_scenario_simulation: true,
    };
  }
}

/**
 * AI-Assisted Prediction Engine utilizing Gemini API with automatic Rule-Based fallback.
 */
export async function generateAIPredictionExplanation(
  zoneName: string,
  useCase: PredictiveUseCase,
  riskScore: number,
  contributingFactors: string[],
  affectedDepartments: string[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Simulated AI Operational Explanation: ${zoneName} shows elevated ${useCase.toLowerCase()} risk (${riskScore}/100) due to ${contributingFactors.slice(0, 2).join(' and ')}. Immediate pre-positioning recommended.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the SCOS Predictive City Intelligence Officer for Kanpur Smart City Operating System.
Generate a concise, professional operational explanation for senior district officers regarding an emerging urban risk.

ZONE: ${zoneName}
USE CASE: ${useCase}
RISK SCORE: ${riskScore}/100 (${mapScoreToRiskLevel(riskScore)})
CONTRIBUTING FACTORS: ${contributingFactors.join(', ')}
AFFECTED DEPARTMENTS: ${affectedDepartments.join(', ')}

INSTRUCTIONS:
1. Provide a concise 2-sentence operational rationale explaining WHY the risk is high and WHAT spatial/infrastructure factors drive it.
2. Maintain high clarity, distinguishing between observed facts and predictive forecasts.
3. Keep under 50 words. No Markdown headers or bullets.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || `Elevated risk calculated for ${zoneName} driven by ${contributingFactors[0] || 'environmental indicators'}.`;
  } catch (err) {
    console.warn('[PredictionService] Gemini explanation fallback:', err);
    return `SCOS Rule Engine Rationale: ${zoneName} indicates ${riskScore}/100 ${useCase.toLowerCase()} risk based on telemetry and historical drainage vulnerability.`;
  }
}

/**
 * AI What-If Scenario Simulator with fallback
 */
export async function runAIWhatIfSimulation(input: WhatIfScenarioInput): Promise<WhatIfScenarioResult> {
  const ruleEngine = new RuleBasedPredictionEngine();
  const ruleResult = await ruleEngine.simulateScenario(input);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return ruleResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the SCOS Predictive Analytics Engine running a What-If Scenario Analysis for Kanpur Smart City.

SCENARIO INPUTS:
- Title: ${input.scenario_title}
- Rainfall Intensity: ${input.rainfall_intensity_mm_hr} mm/hr
- Duration: ${input.duration_hours} hours
- Road Blockage: ${input.road_blockage_severity}
- Drainage Clogging: ${input.drainage_clogging_percent}%
- Target Zone: ${input.target_zone_id}

Provide a structured JSON response with realistic urban scenario predictions.

SCHEMA:
{
  "predicted_risk_score": 82,
  "predicted_risk_level": "CRITICAL",
  "affected_departments": ["MUNICIPAL", "TRAFFIC", "WATER", "HEALTH"],
  "possible_service_impacts": [
    "Severe waterlogging at arterial underpass within 45 minutes",
    "Sewer surcharge into neighboring residential wards"
  ],
  "recommended_preparation": [
    "Pre-deploy 3 high-capacity mobile pumps to Parade Crossing",
    "Issue traffic rerouting plan via GT Road north bypass",
    "Alert Ursula Horsman Hospital emergency access team"
  ],
  "explanation": "High rainfall combined with drainage obstruction creates high risk of surface runoff accumulation."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const text = response.text;
    if (!text) return ruleResult;

    const parsed = JSON.parse(text);
    return {
      scenario_id: `AI-SIM-${Date.now()}`,
      title: input.scenario_title,
      simulated_conditions: input,
      predicted_risk_level: parsed.predicted_risk_level || ruleResult.predicted_risk_level,
      predicted_risk_score: parsed.predicted_risk_score || ruleResult.predicted_risk_score,
      affected_zones: [input.target_zone_id],
      affected_departments: parsed.affected_departments || ruleResult.affected_departments,
      possible_service_impacts: parsed.possible_service_impacts || ruleResult.possible_service_impacts,
      recommended_preparation: parsed.recommended_preparation || ruleResult.recommended_preparation,
      explanation: parsed.explanation || ruleResult.explanation,
      created_at: new Date().toISOString(),
      is_scenario_simulation: true,
    };
  } catch (err) {
    console.warn('[PredictionService] AI What-If Simulation fallback:', err);
    return ruleResult;
  }
}
