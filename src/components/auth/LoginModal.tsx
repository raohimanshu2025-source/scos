import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types/auth';
import { Shield, Lock, Mail, Phone, ArrowRight, UserCheck, Key, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const { login, switchDemoRole } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRoleSelect = async (role: RoleType) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleProfiles: { role: RoleType; label: string; email: string; badge: string; color: string }[] = [
    { role: RoleType.SUPER_ADMIN, label: 'Super Admin', email: 'superadmin@kanpur.gov.in', badge: 'System Kernel', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { role: RoleType.DISTRICT_ADMIN, label: 'District Magistrate', email: 'dm@kanpur.gov.in', badge: 'District Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { role: RoleType.DEPARTMENT_ADMIN, label: 'Jal Sansthan Admin', email: 'jal.admin@kanpur.gov.in', badge: 'Water Dept', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { role: RoleType.DEPARTMENT_OFFICER, label: 'KESCO Officer', email: 'kesco.officer@kanpur.gov.in', badge: 'Power Dept', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { role: RoleType.FIELD_OFFICER, label: 'Field Crew Lead', email: 'field.officer@kanpur.gov.in', badge: 'Ward 14', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { role: RoleType.CITIZEN, label: 'Citizen', email: 'citizen@kanpur.gov.in', badge: 'Swaroop Nagar', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { role: RoleType.AI_GOVERNANCE_OFFICER, label: 'AI Audit Officer', email: 'ai.governance@kanpur.gov.in', badge: 'AI Governance', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI-SCOS Governance Access</h2>
              <p className="text-xs text-slate-300">Smart City Operating System • Kanpur District Administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Side */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> Account Authentication
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. dm@kanpur.gov.in or 9876543211"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={onSwitchToForgotPassword}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to SCOS'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <span className="text-xs text-slate-500">Need a citizen account? </span>
              <button
                onClick={onSwitchToRegister}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Register as Citizen
              </button>
            </div>
          </div>

          {/* Quick Demo Role Selector Side */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quick Role Testing & Evaluation
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                Select any of the 7 pre-seeded accounts below to evaluate role-specific dashboards, permission constraints, and cross-department security rules.
              </p>

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {roleProfiles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleQuickRoleSelect(item.role)}
                    disabled={isSubmitting}
                    className="w-full p-2 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-lg text-left transition flex items-center justify-between group text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {item.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${item.color}`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">{item.email}</div>
                    </div>
                    <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200">
              <span className="font-semibold text-slate-700">Default Password for all seed accounts: </span>
              <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">Password@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
