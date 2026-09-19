import React from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { Zap, ShieldCheck } from 'lucide-react';

export const QuickDemoBar: React.FC = () => {
  const { user, quickLoginDemo, isLoading } = useAuth();

  const roleConfigs: Array<{ role: UserRole; label: string; icon: string; color: string }> = [
    { role: 'STUDENT', label: 'Student (Rahul)', icon: '🎓', color: 'hover:border-blue-500 hover:text-blue-700' },
    { role: 'MENTOR', label: 'Mentor (Dr. Sharma)', icon: '👨‍🏫', color: 'hover:border-emerald-500 hover:text-emerald-700' },
    { role: 'PARENT', label: 'Parent (Mr. Patel)', icon: '👪', color: 'hover:border-purple-500 hover:text-purple-700' },
    { role: 'CLASS_INCHARGE', label: 'Incharge (Prof. Verma)', icon: '📋', color: 'hover:border-cyan-500 hover:text-cyan-700' },
    { role: 'HOD', label: 'HOD (Dr. Kumar)', icon: '🏛️', color: 'hover:border-amber-500 hover:text-amber-700' },
    { role: 'SECURITY', label: 'Gate Security', icon: '🛡️', color: 'hover:border-rose-500 hover:text-rose-700' },
    { role: 'ADMIN', label: 'Admin (Dean)', icon: '⚙️', color: 'hover:border-slate-800 hover:text-slate-900' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">1-Click Test Login Switcher:</span>
          <span className="hidden sm:inline text-slate-400">Test the entire 7-step approval sequence seamlessly</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-center">
          {roleConfigs.map(({ role, label, icon, color }) => {
            const isActive = user?.role === role;
            return (
              <button
                key={role}
                disabled={isLoading}
                onClick={() => quickLoginDemo(role)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition flex items-center gap-1 ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 ' + color
                } disabled:opacity-50`}
                title={`Switch to ${DEMO_CREDENTIALS[role].name} (${DEMO_CREDENTIALS[role].email})`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                {isActive && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
