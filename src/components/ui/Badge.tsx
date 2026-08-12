import React from 'react';
import { SCOSTokens, OperationalStatusType, AiStatusType, DepartmentStatusType } from '../../design-system/tokens';

export interface StatusBadgeProps {
  status: OperationalStatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  pulse = false,
  showDot = true,
  className = '',
}) => {
  const normStatus = (status || 'NORMAL').toUpperCase() as OperationalStatusType;
  const config = SCOSTokens.colors.status[normStatus] || SCOSTokens.colors.status.NORMAL;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const displayLabel = label || normStatus;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold tracking-wide rounded-full border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulse && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: config.badge }}
            />
          )}
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: config.badge }}
          />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

export interface AiBadgeProps {
  status: AiStatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const AiBadge: React.FC<AiBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const normStatus = (status || 'ACTIVE').toUpperCase() as AiStatusType;
  const config = SCOSTokens.colors.ai[normStatus] || SCOSTokens.colors.ai.ACTIVE;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const displayLabel = label || `AI: ${normStatus.replace(/_/g, ' ')}`;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md border ${sizeClasses} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: `${config.badge}40`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.badge }} />
      <span>{displayLabel}</span>
    </span>
  );
};

export interface DepartmentBadgeProps {
  status: DepartmentStatusType | string;
  label?: string;
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const normStatus = (status || 'OPERATIONAL').toUpperCase() as DepartmentStatusType;
  const config = SCOSTokens.colors.department[normStatus] || SCOSTokens.colors.department.OPERATIONAL;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <span>{label || normStatus}</span>
    </span>
  );
};
