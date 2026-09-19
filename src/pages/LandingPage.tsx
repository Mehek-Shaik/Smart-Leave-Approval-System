import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Users,
  Building,
  Lock,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onNavigate }) => {
  const { quickLoginDemo } = useAuth();

  const workflowSteps = [
    { num: '01', title: 'Student Applies', role: 'Student', desc: 'Submits leave type, dates, & reason via student portal.' },
    { num: '02', title: 'Mentor Review', role: 'Mentor', desc: 'Verifies academic standing & attendance records.' },
    { num: '03', title: 'Parent Consent', role: 'Parent', desc: 'Parent verifies and approves emergency or home visit.' },
    { num: '04', title: 'Class Incharge', role: 'Incharge', desc: 'Ensures no lab, exam, or attendance conflicts.' },
    { num: '05', title: 'HOD Approval', role: 'HOD', desc: 'Head of Dept grants final clearance and signs out-pass.' },
    { num: '06', title: 'OTP Generated', role: 'System', desc: '6-digit digital departure code issued automatically.' },
    { num: '07', title: 'Gate Verification', role: 'Security', desc: 'Security officer verifies OTP & student exits campus.' },
  ];

  const rolePortals: Array<{ role: UserRole; title: string; subtitle: string; icon: string; bg: string }> = [
    { role: 'STUDENT', title: 'Student Portal', subtitle: 'Apply leave & view digital gate pass', icon: '🎓', bg: 'hover:border-blue-400' },
    { role: 'MENTOR', title: 'Faculty Mentor', subtitle: 'Review assigned mentee applications', icon: '👨‍🏫', bg: 'hover:border-emerald-400' },
    { role: 'PARENT', title: 'Parent Portal', subtitle: 'Provide digital consent for child', icon: '👪', bg: 'hover:border-purple-400' },
    { role: 'CLASS_INCHARGE', title: 'Class Incharge', subtitle: 'Section & academic calendar clearance', icon: '📋', bg: 'hover:border-cyan-400' },
    { role: 'HOD', title: 'Department HOD', subtitle: 'Final executive approval & OTP trigger', icon: '🏛️', bg: 'hover:border-amber-400' },
    { role: 'SECURITY', title: 'Gate Security Terminal', subtitle: 'Verify OTP & stamp campus out-pass', icon: '🛡️', bg: 'hover:border-rose-400' },
    { role: 'ADMIN', title: 'Administrator', subtitle: 'College-wide analytics & audit log', icon: '⚙️', bg: 'hover:border-slate-800' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-3xl mt-4 mx-4 shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-radial from-indigo-900/30 via-transparent to-transparent opacity-60" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Digital Out-Pass & Multi-Level Authority Workflow</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Smart Leave <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">Approval System</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Replaces manual paper leave chits with a secure, linear multi-tier digital approval pipeline.
            From initial student request through Mentor, Parent, Class Incharge, and HOD, culminating in tamper-proof OTP verification at the college gate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5"
            >
              <span>Access Role Portals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
              <span>Explore REST API Docs</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7-Step Linear Workflow Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mandatory Linear Approval Workflow
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            The system strictly enforces step-by-step sequential verification. No authority can approve out of order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition relative group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {step.num}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {step.role}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                <span>Verified</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Portal Switcher Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Test Portals by Role
            </h2>
            <p className="text-xs text-slate-500">
              Select any role to test its specific interface and privileges with 1-click authentication:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rolePortals.map(({ role, title, subtitle, icon, bg }) => (
            <div
              key={role}
              className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-xs transition hover:shadow-md flex flex-col justify-between cursor-pointer ${bg}`}
              onClick={() => quickLoginDemo(role)}
            >
              <div className="space-y-2">
                <div className="text-3xl mb-1">{icon}</div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Launch Demo Session</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">JWT & BCrypt Authentication</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Role-derived identities with stateless JWT tokens and salted BCrypt hashing. Never trust client-supplied role IDs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Auto OTP Upon Final HOD Sign-off</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Once HOD approves after all prerequisite tiers, a cryptographically secure 6-digit OTP is generated with expiry tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Security Gate Verification</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Campus security validates the OTP at departure gates. Once consumed, the OTP is stamped and cannot be reused.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
