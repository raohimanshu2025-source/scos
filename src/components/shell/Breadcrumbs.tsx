import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
      <span className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer">
        <Home className="w-3.5 h-3.5" />
        <span>SCOS</span>
      </span>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-indigo-600 transition cursor-pointer">
              {item.label}
            </button>
          ) : (
            <span className="text-slate-800 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  statusBadge?: React.ReactNode;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  statusBadge,
  primaryAction,
  secondaryActions,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-6 pb-4 border-b border-slate-200/80 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {statusBadge}
          </div>
          {description && <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{description}</p>}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {secondaryActions}
          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {children && <div className="mt-4 pt-3 border-t border-slate-100">{children}</div>}
    </div>
  );
};
