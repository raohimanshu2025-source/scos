import React from 'react';
import { DataQuality } from '../../types/dataSource';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface DataQualityIndicatorProps {
  quality: DataQuality;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  quality,
  showLabel = true,
  size = 'md',
}) => {
  const getQualityConfig = () => {
    switch (quality) {
      case 'HIGH':
        return {
          label: 'High Quality',
          bgColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          description: 'High data fidelity with consistent metadata validation.',
        };
      case 'MEDIUM':
        return {
          label: 'Medium Quality',
          bgColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          description: 'Acceptable data fidelity; minor latency or schema variance.',
        };
      case 'LOW':
        return {
          label: 'Low Quality',
          bgColor: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          description: 'Low fidelity data; frequent missing fields or delays.',
        };
      case 'UNKNOWN':
      default:
        return {
          label: 'Unknown Quality',
          bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
          description: 'Quality metrics not yet established for this dataset.',
        };
    }
  };

  const config = getQualityConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-semibold font-mono rounded-full border ${sizeClasses} ${config.bgColor}`}
      title={config.description}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};
