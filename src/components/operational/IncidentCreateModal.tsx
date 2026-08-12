/**
 * SCOS Phase 5B.4 — Incident Creation & AI Impact Analysis Modal
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { Modal } from '../ui/Feedback';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/FormControls';
import { StatusBadge, AiBadge } from '../ui/Badge';
import { IncidentCategory, IncidentSeverity, Incident } from '../../types/incident';
import { INCIDENT_IMPACT_RULES, DEPARTMENT_MAP } from '../../services/impactMappingRules';
import { useIncidents } from '../../context/IncidentContext';

export interface IncidentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (inc: Incident) => void;
}

export const IncidentCreateModal: React.FC<IncidentCreateModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated,
}) => {
  const { createIncident, approveRecommendation } = useIncidents();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('WATERLOGGING');
  const [location, setLocation] = useState('Parade Crossing, Kanpur Nagar');
  const [wardZone, setWardZone] = useState('Zone 2 - Parade / Civil Lines');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInc, setCreatedInc] = useState<Incident | null>(null);

  const categoryOptions = Object.keys(INCIDENT_IMPACT_RULES).map((cat) => ({
    value: cat,
    label: cat.replace(/_/g, ' '),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    const newInc = await createIncident({
      title,
      category,
      description,
      location,
      severity,
      ward_zone: wardZone,
    });

    setIsSubmitting(false);

    if (newInc) {
      setCreatedInc(newInc);
      if (onIncidentCreated) {
        onIncidentCreated(newInc);
      }
    }
  };

  const handleApprove = async () => {
    if (!createdInc) return;
    setIsSubmitting(true);
    await approveRecommendation(createdInc.incident_id);
    setIsSubmitting(false);
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCreatedInc(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create New Urban Incident & Trigger AI Impact Triage"
      maxWidth="2xl"
    >
      {!createdInc ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Incident Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Heavy Waterlogging & Drainage Backflow near Parade Crossing"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Incident Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              options={categoryOptions}
            />

            <Select
              label="Assessed Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              options={[
                { value: 'LOW', label: 'LOW — Minor Disruption' },
                { value: 'MEDIUM', label: 'MEDIUM — Localized Hazard' },
                { value: 'HIGH', label: 'HIGH — Multi-Ward Service Risk' },
                { value: 'CRITICAL', label: 'CRITICAL — District Emergency / P1' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Specific Location / Landmark"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Parade Crossing / Mall Road Intersection"
              required
            />

            <Input
              label="Ward / Municipal Zone"
              value={wardZone}
              onChange={(e) => setWardZone(e.target.value)}
              placeholder="e.g. Zone 2 - Civil Lines"
            />
          </div>

          <Textarea
            label="Incident Telemetry & Field Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide observed facts, telemetry readings, or citizen reports..."
            required
          />

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 font-sans">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Upon submission, SCOS will evaluate category impact rules and trigger Gemini AI multi-department triage. Recommendations require officer approval before task dispatch.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Analyze & Submit Incident
            </Button>
          </div>
        </form>
      ) : (
        /* Post-Creation AI Triage Preview Step */
        <div className="space-y-5 font-sans">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Incident Created: <span className="font-mono text-indigo-700">{createdInc.incident_id}</span>
            </div>
            <StatusBadge status={createdInc.severity as any} label={createdInc.severity} />
          </div>

          {/* AI Assessment Result Card */}
          {createdInc.AI_assessment ? (
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AiBadge status="ACTIVE" label="SCOS AI Recommendation Generated" />
                  <span className="text-xs font-mono text-indigo-700 font-semibold">
                    Confidence: {(createdInc.AI_assessment.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                  Priority: {createdInc.AI_assessment.priority}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Impact Assessment:</p>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {createdInc.AI_assessment.impact_summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Operational Explanation:</p>
                <p className="text-xs text-slate-600 italic mt-0.5">
                  "{createdInc.AI_assessment.explanation}"
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Recommended Cross-Department Actions:
                </p>
                <div className="space-y-2">
                  {createdInc.AI_assessment.recommended_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-start gap-2 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-100 text-xs text-slate-600 text-center rounded-xl">
              Evaluating rule-based assessment...
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              Decision Support Mode: Human Officer Review Required
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Keep Pending
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                isLoading={isSubmitting}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve & Dispatch Tasks
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
