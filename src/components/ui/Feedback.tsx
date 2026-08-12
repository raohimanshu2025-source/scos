import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ChevronDown,
  Inbox,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';
import { Button } from './Button';

// 1. Alert
export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: <Info className="w-4 h-4 text-blue-600 shrink-0" /> },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> },
    error: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', icon: <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" /> },
  };

  const curr = styles[type];

  return (
    <div className={`p-4 rounded-xl border ${curr.bg} ${curr.border} ${curr.text} flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5">{curr.icon}</span>
        <div>
          {title && <h5 className="text-xs font-bold mb-0.5">{title}</h5>}
          <div className="text-xs font-normal leading-relaxed">{children}</div>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// 2. Modal
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-2xl w-full ${widthClasses[maxWidth]} overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150`}>
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">{children}</div>
      </div>
    </div>
  );
};

// 3. Drawer
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  if (!isOpen) return null;

  const posClasses = position === 'right' ? 'right-0 border-l' : 'left-0 border-r';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col ${posClasses} border-slate-200`}>
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <h3 className="text-sm font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-xs">{children}</div>
      </div>
    </div>
  );
};

// 4. Skeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
};

// 5. EmptyState
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are no active records in this category at present.',
  icon = <Inbox className="w-8 h-8 text-slate-400" />,
  action,
}) => {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
      <div className="p-3 bg-white rounded-2xl shadow-2xs border border-slate-200 mb-3">{icon}</div>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};

// 6. ErrorState
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Governance Record',
  message = 'An unexpected server error occurred while retrieving data.',
  onRetry,
}) => {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-rose-50/30 border border-rose-200 rounded-2xl">
      <AlertOctagon className="w-8 h-8 text-rose-600 mb-2" />
      <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
};

// 7. ConfirmationDialog
export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'warning' ? 'secondary' : variant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 8. Accordion
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const Accordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null);

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full px-5 py-3.5 text-left font-bold text-xs text-slate-800 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <span>{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="px-5 py-4 text-xs text-slate-600 bg-slate-50/50 border-t border-slate-100">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};
