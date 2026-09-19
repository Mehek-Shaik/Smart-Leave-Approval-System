import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const ClassInchargeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Decision state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/classincharges/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load class incharge leaves', err);
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
      await api.put(`/classincharges/leaves/${leaveId}`, {
        action: actionType,
        remarks: remarks || (actionType === 'APPROVE' ? 'Class attendance & timetable checked' : 'Schedule conflicts with scheduled exams'),
        reason: remarks || 'Schedule conflicts with scheduled exams',
      });
      setActiveActionId(null);
      setRemarks('');
      fetchLeaves();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.response?.data || 'Failed to submit incharge decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                Step 3: Class Incharge
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Section: {user?.department} • Year {user?.year} • Section {user?.section} • {user?.email}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Verifies academic schedule, internal tests, practical exams, and validates prior approval from Mentor and Parent.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLeaves}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-900"
        >
          Refresh List
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {actionError}
        </div>
      )}

      {/* Leaves List */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Loading section student applications...
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No applications for Year {user?.year} - Section {user?.section}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const isMentorApproved = leave.mentorStatus === 'APPROVED';
            const isParentApproved = leave.parentStatus === 'APPROVED';
            const canApprove = isMentorApproved && isParentApproved;
            const isInchargePending = leave.classInchargeStatus === 'PENDING';

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
                      Dates: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong>
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                        leave.classInchargeStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : leave.classInchargeStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      Incharge: {leave.classInchargeStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-800"><strong className="text-slate-600">Reason:</strong> {leave.reason}</p>
                  <div className="flex flex-wrap gap-4 pt-1 text-slate-600">
                    <span>Mentor: <strong className={isMentorApproved ? 'text-emerald-700' : 'text-amber-700'}>{leave.mentorStatus}</strong></span>
                    <span>•</span>
                    <span>Parent Consent: <strong className={isParentApproved ? 'text-emerald-700' : 'text-amber-700'}>{leave.parentStatus}</strong></span>
                  </div>
                </div>

                <ApprovalTimeline leave={leave} />

                {isInchargePending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {!canApprove ? (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs w-full">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Workflow Prerequisite:</strong> Both Mentor and Parent approvals are required before Class Incharge sign-off.
                          {!isMentorApproved && ' [Mentor pending]'} {!isParentApproved && ' [Parent pending]'}
                        </span>
                      </div>
                    ) : activeActionId === leave.id ? (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder={actionType === 'APPROVE' ? 'Optional class notes...' : 'Reason for rejection...'}
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[240px] bg-white"
                        />
                        <button
                          onClick={() => handleDecision(leave.id)}
                          disabled={isSubmitting}
                          className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold transition ${
                            actionType === 'APPROVE' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-rose-600 hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          {isSubmitting ? 'Submitting...' : `Confirm ${actionType}`}
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
                          Step 3: Forward to HOD for final sign-off & OTP issuance.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveActionId(leave.id);
                              setActionType('APPROVE');
                              setRemarks('Class attendance & timetable checked');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Forward to HOD</span>
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
