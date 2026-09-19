import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { Lock, Mail, AlertCircle, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateToRegister }) => {
  const { login, quickLoginDemo, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState(DEMO_CREDENTIALS.STUDENT.email);
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const roleList: Array<{ role: UserRole; label: string; icon: string }> = [
    { role: 'STUDENT', label: 'Student', icon: '🎓' },
    { role: 'MENTOR', label: 'Mentor', icon: '👨‍🏫' },
    { role: 'PARENT', label: 'Parent', icon: '👪' },
    { role: 'CLASS_INCHARGE', label: 'Incharge', icon: '📋' },
    { role: 'HOD', label: 'HOD', icon: '🏛️' },
    { role: 'SECURITY', label: 'Security', icon: '🛡️' },
    { role: 'ADMIN', label: 'Admin', icon: '⚙️' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(selectedRole, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to authenticate. Please check credentials.');
    }
  };

  const handleQuickLogin = async () => {
    setError(null);
    try {
      await quickLoginDemo(selectedRole);
      onSuccess();
    } catch (err: any) {
      setError('Quick login failed. Please try manual login.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">Select your role to access the Smart Leave System</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto p-2 gap-1 bg-slate-50">
          {roleList.map(({ role, label, icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`flex-1 min-w-[68px] py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-0.5 transition ${
                selectedRole === role
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span className="text-[11px] whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Demo Pre-fill Banner */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-indigo-950">
              <span className="font-semibold block">Demo Account:</span>
              <span className="text-[11px] text-indigo-700">{DEMO_CREDENTIALS[selectedRole].name}</span>
            </div>
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={isLoading}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Login</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Official Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : `Sign in as ${selectedRole.replace('_', ' ')}`}
            <ArrowRight className="w-4 h-4" />
          </button>

          {['STUDENT', 'MENTOR', 'PARENT', 'CLASS_INCHARGE', 'HOD'].includes(selectedRole) && (
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              New user?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Register an account
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
