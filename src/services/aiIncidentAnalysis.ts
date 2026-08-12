/**
 * SCOS AI Incident Analysis Service
 * Uses Google GenAI (@google/genai) for structured urban incident triage and cross-department impact analysis.
 * Gracefully falls back to the deterministic SCOS Rule Engine if API key is missing or request fails.
 */

import { GoogleGenAI } from '@google/genai';
import { IncidentCategory, IncidentSeverity, IncidentPriority, AIAssessment } from '../types/incident';
import { evaluateImpactByRules, DEPARTMENT_MAP } from './impactMappingRules';

export async function generateAIIncidentAnalysis(params: {
  title: string;
  category: IncidentCategory;
  location: string;
  description: string;
  severity?: IncidentSeverity;
  wardZone?: string;
}): Promise<AIAssessment> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no Gemini key configured
  if (!apiKey) {
    const ruleResult = evaluateImpactByRules(params.category, params.location, params.severity, params.description);
    return {
      severity: ruleResult.severity,
      priority: ruleResult.priority,
      affected_departments: ruleResult.affected_departments,
      primary_department: ruleResult.primary_department,
      secondary_departments: ruleResult.secondary_departments,
      impact_summary: ruleResult.impact_summary,
      recommended_actions: ruleResult.recommended_actions,
      confidence: ruleResult.confidence,
      explanation: `${ruleResult.explanation} (Note: Running on SCOS Rule Engine fallback).`,
      status: 'PENDING_REVIEW',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are the SCOS AI Triage & Cross-Department Coordination Engine for Kanpur District Administration.
Analyze the following reported urban incident and return a JSON object with multi-department coordination recommendations.

INCIDENT DETAILS:
- Title: ${params.title}
- Category: ${params.category}
- Location: ${params.location} (${params.wardZone || 'Kanpur Nagar'})
- Description: ${params.description}
- Reported Severity: ${params.severity || 'UNKNOWN'}

AVAILABLE MUNICIPAL DEPARTMENTS:
- MUNICIPAL: Kanpur Nagar Nigam (Sanitation, Roads, Pumping, Waste)
- WATER: Kanpur Jal Sansthan (Water works, Sewerage pipeline, Outfalls)
- TRAFFIC: Traffic Police & Transport Dept (Signal, Cones, Diversion, Towing)
- HEALTH: District Health & Emergency Services (Ambulance, Epidemic, Disinfectant)
- DISTRICT_ADMIN: District Administration HQ (Magistrate, Disaster Cell)

INSTRUCTIONS:
1. Assess urban severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
2. Priority: 'P1' | 'P2' | 'P3' | 'P4'
3. Primary department: Exactly one of ['MUNICIPAL', 'WATER', 'TRAFFIC', 'HEALTH', 'DISTRICT_ADMIN']
4. Affected departments: Array of department codes involved
5. Impact summary: Concise 2-sentence summary of urban impact
6. Recommended actions: List of specific actionable tasks, formatted as "[Dept Name] Action description"
7. Confidence: Floating point between 0.80 and 0.99
8. Explanation: Concise 1-2 sentence operational reasoning for district officers (NO chain of thought).

RETURN ONLY VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "severity": "HIGH",
  "priority": "P1",
  "affected_departments": ["MUNICIPAL", "TRAFFIC", "WATER"],
  "primary_department": "MUNICIPAL",
  "secondary_departments": ["TRAFFIC", "WATER"],
  "impact_summary": "Waterlogging on major arterial corridor causing vehicle stalling and drainage backpressure.",
  "recommended_actions": [
    "[Kanpur Nagar Nigam] Deploy 2 suction pumps to clear submerged roadway.",
    "[Traffic Police] Divert heavy traffic to GT Road bypass.",
    "[Kanpur Jal Sansthan] Clear trunk sewer blockage at Node 4."
  ],
  "confidence": 0.94,
  "explanation": "High priority because location affects arterial transit and drainage outflow simultaneously."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(text);

    return {
      severity: (parsed.severity as IncidentSeverity) || 'HIGH',
      priority: (parsed.priority as IncidentPriority) || 'P1',
      affected_departments: parsed.affected_departments || ['MUNICIPAL'],
      primary_department: parsed.primary_department || 'MUNICIPAL',
      secondary_departments: parsed.secondary_departments || [],
      impact_summary: parsed.impact_summary || 'Multi-department impact requiring coordinated action.',
      recommended_actions: parsed.recommended_actions || ['Inspect site and take necessary measures.'],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.91,
      explanation: parsed.explanation || 'Analyzed by SCOS AI Multi-Agent Triage Engine.',
      status: 'PENDING_REVIEW',
    };
  } catch (error) {
    console.warn('[SCOS AI Service] Gemini analysis failed, falling back to rule engine:', error);
    const ruleResult = evaluateImpactByRules(params.category, params.location, params.severity, params.description);
    return {
      severity: ruleResult.severity,
      priority: ruleResult.priority,
      affected_departments: ruleResult.affected_departments,
      primary_department: ruleResult.primary_department,
      secondary_departments: ruleResult.secondary_departments,
      impact_summary: ruleResult.impact_summary,
      recommended_actions: ruleResult.recommended_actions,
      confidence: ruleResult.confidence,
      explanation: `${ruleResult.explanation} (Fallback due to AI engine timeout/error).`,
      status: 'PENDING_REVIEW',
    };
  }
}
