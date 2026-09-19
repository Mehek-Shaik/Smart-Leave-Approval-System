import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { DigitalGatePassModal } from '../components/DigitalGatePassModal';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Printer
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPass, setSelectedPass] = useState<LeaveRequest | null>(null);

  // Decision State
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/parents/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load parent leaves', err);
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
      await api.put(`/parents/leaves/${leaveId}`, {
        action: actionType,
        remarks: remarks || (actionType === 'APPROVE' ? 'Consent granted by parent' : 'Not permitted to leave campus'),
        reason: remarks || 'Not permitted to leave campus',
      });
      setActiveActionId(null);
      setRemarks('');
      fetchLeaves();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.response?.data || 'Failed to submit parental decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Parent Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Step 2: Parent / Guardian
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered ward: {user?.studentEmail || 'rahul.cse@college.edu'} • {user?.email}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Provides digital parental consent for ward departure. Enforces prerequisite Mentor approval before consent can be granted.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLeaves}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900"
        >
          Refresh
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
          Loading student out-pass requests...
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No active leave requests for your ward</p>
          <p className="text-xs text-slate-500">When your student submits a leave application, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => {
            const isMentorApproved = leave.mentorStatus === 'APPROVED';
            const isParentPending = leave.parentStatus === 'PENDING';

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
                      <span className="text-xs font-normal text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                        {leave.leaveType.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Departure: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {leave.overallStatus === 'APPROVED' && (
                      <button
                        onClick={() => setSelectedPass(leave)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        title="Print or view ward's approved gate pass"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Print Pass</span>
                      </button>
                    )}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                        leave.parentStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : leave.parentStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      Parent Consent: {leave.parentStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-800"><strong className="text-slate-600">Ward's Reason:</strong> {leave.reason}</p>
                  {leave.mentorStatus === 'APPROVED' && (
                    <p className="text-emerald-700">
                      <strong>✓ Faculty Mentor ({leave.mentorEmail}):</strong> {leave.mentorRemarks || 'Verified and approved'}
                    </p>
                  )}
                  {leave.parentRemarks && (
                    <p className="text-purple-700 pt-1 border-t border-slate-200">
                      <strong>Parent Remarks:</strong> "{leave.parentRemarks}"
                    </p>
                  )}
                </div>

                <ApprovalTimeline leave={leave} />

                {/* Consent Section */}
                {isParentPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {!isMentorApproved ? (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs w-full">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Workflow Dependency:</strong> Faculty Mentor approval is required before parental consent can be submitted. (Current Mentor status: <strong>{leave.mentorStatus}</strong>).
                        </span>
                      </div>
                    ) : activeActionId === leave.id ? (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder={actionType === 'APPROVE' ? 'Optional parent consent note...' : 'Reason for withholding consent...'}
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[240px] bg-white"
                        />
                        <button
                          onClick={() => handleDecision(leave.id)}
                          disabled={isSubmitting}
                          className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold transition ${
                            actionType === 'APPROVE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-rose-600 hover:bg-rose-700'
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
                          Step 2: Please confirm if you approve your ward leaving campus.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveActionId(leave.id);
                              setActionType('APPROVE');
                              setRemarks('Parental consent granted');
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Grant Consent (Approve)</span>
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
                            <span>Deny (Reject)</span>
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

      {/* Printable / Gate Pass Modal */}
      <DigitalGatePassModal
        leave={selectedPass}
        onClose={() => setSelectedPass(null)}
        initialMode="slip"
      />
    </div>
  );
};
