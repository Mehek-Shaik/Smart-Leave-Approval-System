import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Clock,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, quickLoginDemo } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'STUDENT':
        return { label: 'Student', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'MENTOR':
        return { label: 'Mentor', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'PARENT':
        return { label: 'Parent', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'CLASS_INCHARGE':
        return { label: 'Class Incharge', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'HOD':
        return { label: 'Head of Dept', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'SECURITY':
        return { label: 'Security Officer', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-slate-800 text-white border-slate-700' };
      default:
        return { label: 'Guest', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-3 focus:outline-hidden text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-800 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                  Smart Leave <span className="text-indigo-600">Approval</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  College Multi-Level Out-Pass Clearance
                </span>
              </div>
            </button>
          </div>

          {/* Right Navigation & Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                {/* Switch Role Quick Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition"
                  >
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="hidden md:inline max-w-[130px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Currently logged in as:</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Switch Active Demo Role:
                        </p>
                        {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              quickLoginDemo(r);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                              user.role === r ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                            }`}
                          >
                            <span>{DEMO_CREDENTIALS[r].title}</span>
                            {user.role === r && <span className="text-[10px] text-indigo-600">Active</span>}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
