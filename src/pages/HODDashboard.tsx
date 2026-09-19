import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import {
  Landmark,
  CheckCircle2,
  XCircle,
  KeyRound,
  AlertTriangle,
  FileText,
  Sparkles
} from 'lucide-react';

export const HODDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision State
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justApprovedLeave, setJustApprovedLeave] = useState<LeaveRequest | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/hods/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load HOD leaves', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (leaveId: string) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await api.put(`/hods/leaves/${leaveId}`, {
        action: actionType,
        remarks: remarks || (actionType === 'APPROVE' ? 'Final departmental approval granted' : 'Departmental leave quota exceeded'),
        reason: remarks || 'Departmental leave quota exceeded',
      });
      if (actionType === 'APPROVE') {
        setJustApprovedLeave(res.data);
      }
      setActiveActionId(null);
      setRemarks('');
      fetchLeaves();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.response?.data || 'Failed to submit HOD decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Step 4: Head of Department (Executive Sign-Off)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Department: {user?.department} • {user?.email}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Final institutional authority. Approving here authorizes the student's departure and <strong>automatically triggers the 6-digit campus gate OTP</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLeaves}
          className="text-xs font-semibold text-amber-700 hover:text-amber-900"
        >
          Refresh List
        </button>
      </div>

      {/* Just Approved Celebration Banner */}
      {justApprovedLeave && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-emerald-500 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-emerald-400">Final HOD Approval Granted!</h3>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full uppercase font-bold">
                  OTP Generated
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Leave for <strong>{justApprovedLeave.studentName} ({justApprovedLeave.studentRollNumber})</strong> is now ACTIVE.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 font-medium">Generated Gate OTP:</span>
                <span className="font-mono text-xl font-extrabold text-emerald-300 tracking-widest bg-slate-800 px-3 py-0.5 rounded-lg border border-slate-700">
                  {justApprovedLeave.otpCode}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setJustApprovedLeave(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {actionError}
        </div>
      )}

      {/* Leaves List */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Loading departmental applications...
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No applications pending for department</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const isMentorApproved = leave.mentorStatus === 'APPROVED';
            const isParentApproved = leave.parentStatus === 'APPROVED';
            const isInchargeApproved = leave.classInchargeStatus === 'APPROVED';
            const canHodApprove = isMentorApproved && isParentApproved && isInchargeApproved;
            const isHodPending = leave.hodStatus === 'PENDING';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{leave.studentName}</span>
                      <span className="font-mono text-xs text-slate-500">({leave.studentRollNumber})</span>
                      <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                        {leave.leaveType.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Class: Year {leave.year} - Sec {leave.section} • Dates: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong>
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                        leave.hodStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : leave.hodStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      HOD Status: {leave.hodStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-800"><strong className="text-slate-600">Reason:</strong> {leave.reason}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div>Mentor: <strong className={isMentorApproved ? 'text-emerald-700' : 'text-amber-700'}>{leave.mentorStatus}</strong></div>
                    <div>Parent Consent: <strong className={isParentApproved ? 'text-emerald-700' : 'text-amber-700'}>{leave.parentStatus}</strong></div>
                    <div>Class Incharge: <strong className={isInchargeApproved ? 'text-emerald-700' : 'text-amber-700'}>{leave.classInchargeStatus}</strong></div>
                  </div>
                </div>

                {leave.otpCode && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950">
                    <div className="flex items-center gap-2 font-semibold">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>Authorized Gate OTP:</span>
                      <span className="font-mono text-base font-extrabold text-indigo-800 tracking-wider bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                        {leave.otpCode}
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      Status: {leave.securityVerified ? 'Exited at Gate ✓' : 'Awaiting Gate Clearance'}
                    </span>
                  </div>
                )}

                <ApprovalTimeline leave={leave} />

                {isHodPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {!canHodApprove ? (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs w-full">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Workflow Prerequisite:</strong> Mentor, Parent, and Class Incharge must all be APPROVED before HOD can grant final sign-off.
                        </span>
                      </div>
                    ) : activeActionId === leave.id ? (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder={actionType === 'APPROVE' ? 'Final HOD clearance notes...' : 'Reason for rejection...'}
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[240px] bg-white"
                        />
                        <button
                          onClick={() => handleDecision(leave.id)}
                          disabled={isSubmitting}
                          className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold transition ${
                            actionType === 'APPROVE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          {isSubmitting ? 'Processing...' : `Confirm ${actionType} & Issue OTP`}
                        </button>
                        <button
                          onClick={() => setActiveActionId(null)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-500">
                          Step 4: Granting approval will automatically generate 6-digit gate OTP.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveActionId(leave.id);
                              setActionType('APPROVE');
                              setRemarks('Final departmental approval granted');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Sign & Issue Gate OTP</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionId(leave.id);
                              setActionType('REJECT');
                              setRemarks('');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
