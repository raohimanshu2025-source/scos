/**
 * SCOS Phase 5B.6 — Cascade Impact Analysis View
 * Evaluates primary urban triggers and maps downstream multi-tier cascade consequences
 * across infrastructure, traffic flow, emergency health, and department coordination.
 */

import React, { useEffect } from 'react';
import {
  AlertCircle,
  ArrowDown,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useKnowledgeGraph } from '../../context/KnowledgeGraphContext';

export const CascadeImpactView: React.FC = () => {
  const { cascadeResult, loadCascadeImpact } = useKnowledgeGraph();

  useEffect(() => {
    loadCascadeImpact('INCIDENT-1024');
  }, []);

  const res = cascadeResult;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Potentially affected':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Possible downstream impact':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <Card className="p-5 bg-white border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">SCOS Cascade Impact Analysis Engine</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulates propagation of urban infrastructure failures across physical assets, road networks, emergency services, and civic departments.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadCascadeImpact('INCIDENT-1024')}>
          Re-calculate Cascade Model
        </Button>
      </Card>

      {!res ? (
        <Card className="p-8 text-center text-xs text-slate-500">Calculating cascade propagation...</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cascade Chain Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Multi-Tier Downstream Impact Propagation Chain
            </h4>

            <div className="space-y-4 relative font-sans">
              {res.cascadeChain.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Card className="p-5 border-slate-200 bg-white space-y-3 relative shadow-xs">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                          L{item.level}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{item.event}</h5>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(item.verificationStatus)}`}>
                          {item.verificationStatus}
                        </span>
                      </div>
                    </div>

                    {/* Downstream Impacts */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Downstream Consequences:</p>
                      <ul className="space-y-1">
                        {item.downstreamImpacts.map((imp, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Affected Departments */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">Involved Depts:</span>
                      {item.affectedDepartments.map((dept) => (
                        <span key={dept} className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </Card>

                  {idx < res.cascadeChain.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="w-5 h-5 text-indigo-400 animate-bounce" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Column: Coordination Recommendations */}
          <div className="space-y-6">
            <Card className="p-5 border-slate-200 bg-white space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Potentially Involved Departments ({res.involvedDepartments.length})
              </div>

              <div className="space-y-2">
                {res.involvedDepartments.map((dept) => (
                  <div key={dept} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{dept}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Coordinated
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-indigo-200 bg-indigo-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-900 tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Graph-Derived Recommended Action Plan
              </div>

              <div className="space-y-2">
                {res.recommendedCoordination.map((rec, i) => (
                  <div key={i} className="p-3 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-700">Action Option {i + 1}</span>
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Research Note:</strong> Cascade impact outputs represent model simulation probabilities. Verify field conditions prior to dispatching high-impact physical interventions.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
