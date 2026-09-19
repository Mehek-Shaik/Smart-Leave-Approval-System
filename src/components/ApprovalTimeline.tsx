import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { LeaveRequest } from '../types';

interface ApprovalTimelineProps {
  leave: LeaveRequest;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ leave }) => {
  const steps = [
    {
      id: 'STUDENT',
      name: 'Student Applied',
      status: 'APPROVED', // Once submitted, this step is always completed
      date: leave.appliedAt,
      actor: leave.studentName,
      remarks: 'Application submitted',
    },
    {
      id: 'MENTOR',
      name: 'Mentor Review',
      status: leave.mentorStatus,
      date: leave.mentorActionAt,
      actor: leave.mentorEmail,
      remarks: leave.mentorRemarks,
    },
    {
      id: 'PARENT',
      name: 'Parent Consent',
      status: leave.parentStatus,
      date: leave.parentActionAt,
      actor: leave.parentEmail,
      remarks: leave.parentRemarks,
    },
    {
      id: 'CLASS_INCHARGE',
      name: 'Class Incharge',
      status: leave.classInchargeStatus,
      date: leave.classInchargeActionAt,
      actor: 'Class Incharge',
      remarks: leave.classInchargeRemarks,
    },
    {
      id: 'HOD',
      name: 'HOD Approval',
      status: leave.hodStatus,
      date: leave.hodActionAt,
      actor: 'Head of Department',
      remarks: leave.hodRemarks,
    },
    {
      id: 'OTP',
      name: 'OTP Issued',
      status: leave.overallStatus === 'APPROVED' ? 'APPROVED' : leave.overallStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
      date: leave.otpGeneratedAt,
      actor: leave.otpCode ? `OTP: ${leave.otpCode}` : 'Pending HOD',
      remarks: leave.otpCode ? 'Generated automatically upon HOD approval' : undefined,
    },
    {
      id: 'SECURITY',
      name: 'Gate Verification',
      status: leave.securityVerified ? 'APPROVED' : leave.overallStatus === 'APPROVED' ? 'PENDING' : 'INACTIVE',
      date: leave.securityVerifiedAt,
      actor: leave.securityOfficerName || (leave.overallStatus === 'APPROVED' ? 'Awaiting Campus Exit' : 'Locked'),
      remarks: leave.securityVerified ? `Verified at ${leave.securityGate || 'Main Gate'}` : undefined,
    },
  ];

  return (
    <div className="w-full py-4">
      {leave.cancelled && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>This application was <strong>cancelled</strong> by the student before final approval.</span>
        </div>
      )}

      {leave.overallStatus === 'REJECTED' && leave.rejectionReason && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">
          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Application <strong>Rejected</strong>: {leave.rejectionReason}</span>
        </div>
      )}

      <div className="relative">
        <div className="hidden md:flex justify-between items-start relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0" />

          {steps.map((step, idx) => {
            const isApproved = step.status === 'APPROVED';
            const isRejected = step.status === 'REJECTED';
            const isPending = step.status === 'PENDING';

            let badgeBg = 'bg-slate-100 text-slate-400 border-slate-300';
            let icon = <Clock className="w-4 h-4 text-slate-400" />;

            if (isApproved) {
              if (step.id === 'SECURITY') {
                badgeBg = 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100';
                icon = <ShieldCheck className="w-5 h-5 text-white" />;
              } else if (step.id === 'OTP') {
                badgeBg = 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100';
                icon = <KeyRound className="w-5 h-5 text-white" />;
              } else {
                badgeBg = 'bg-emerald-500 text-white border-emerald-500';
                icon = <CheckCircle2 className="w-5 h-5 text-white" />;
              }
            } else if (isRejected) {
              badgeBg = 'bg-rose-500 text-white border-rose-500 ring-4 ring-rose-100';
              icon = <XCircle className="w-5 h-5 text-white" />;
            } else if (isPending) {
              badgeBg = 'bg-amber-100 text-amber-800 border-amber-400 ring-4 ring-amber-50 animate-pulse';
              icon = <Clock className="w-4 h-4 text-amber-600" />;
            }

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 px-1 text-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${badgeBg}`}
                  title={`${step.name}: ${step.status}`}
                >
                  {icon}
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-800 leading-tight">{step.name}</span>
                <span
                  className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    isApproved
                      ? 'text-emerald-700 font-bold'
                      : isRejected
                      ? 'text-rose-700 font-bold'
                      : isPending
                      ? 'text-amber-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.status}
                </span>
                {step.date && (
                  <span className="mt-1 text-[10px] text-slate-500">
                    {new Date(step.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {step.remarks && (
                  <span className="mt-1 text-[10px] text-slate-600 italic max-w-[110px] truncate" title={step.remarks}>
                    "{step.remarks}"
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="md:hidden flex flex-col space-y-4">
          {steps.map((step) => {
            const isApproved = step.status === 'APPROVED';
            const isRejected = step.status === 'REJECTED';
            const isPending = step.status === 'PENDING';

            return (
              <div key={step.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isApproved
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : isRejected
                      ? 'bg-rose-500 text-white border-rose-500'
                      : isPending
                      ? 'bg-amber-100 text-amber-800 border-amber-400'
                      : 'bg-slate-100 text-slate-400 border-slate-300'
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isRejected ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{step.name}</span>
                    <span
                      className={`text-xs font-bold uppercase ${
                        isApproved
                          ? 'text-emerald-700'
                          : isRejected
                          ? 'text-rose-700'
                          : isPending
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  {step.remarks && <p className="text-xs text-slate-600 italic">"{step.remarks}"</p>}
                  {step.date && <p className="text-[10px] text-slate-400">{new Date(step.date).toLocaleString()}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
