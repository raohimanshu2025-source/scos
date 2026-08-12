import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-xs rounded-2xl',
    flat: 'bg-slate-50 border border-slate-200/60 rounded-2xl',
    outline: 'bg-white border-2 border-slate-200 rounded-2xl',
    interactive: 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-2xl cursor-pointer',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  trend,
  icon,
  badge,
  footer,
  className = '',
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {icon && (
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl shrink-0">
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{value}</span>
        {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
          {trend.direction === 'up' && (
            <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'down' && (
            <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.direction === 'neutral' && (
            <span className="flex items-center text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          {trend.label && <span className="text-slate-400 text-[11px] font-normal">{trend.label}</span>}
        </div>
      )}

      {footer && <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">{footer}</div>}
    </Card>
  );
};
