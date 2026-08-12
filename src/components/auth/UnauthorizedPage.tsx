import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UnauthorizedPageProps {
  requiredPermission?: string;
  onGoBack?: () => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  requiredPermission,
  onGoBack,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">403 — Access Denied</h2>
        <p className="text-xs text-slate-500 mb-6">
          AI-SCOS Security Protocol: Insufficient Role / Permission Scope
        </p>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-left mb-6 text-xs text-slate-700 space-y-1">
          <div><span className="font-semibold text-slate-900">Current Role:</span> {user?.role || 'Unauthenticated'}</div>
          <div><span className="font-semibold text-slate-900">Department:</span> {user?.departmentName || user?.departmentCode || 'None'}</div>
          {requiredPermission && (
            <div><span className="font-semibold text-slate-900">Required Permission:</span> <code className="bg-red-50 text-red-700 px-1 py-0.5 rounded font-mono">{requiredPermission}</code></div>
          )}
        </div>

        <p className="text-xs text-slate-600 mb-6">
          Your account is authenticated, but your assigned role does not possess authorization for this administrative action or departmental view.
        </p>

        {onGoBack && (
          <button
            onClick={onGoBack}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Main Dashboard
          </button>
        )}
      </div>
    </div>
  );
};
