import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Building,
  AlertCircle,
  FileText,
  Filter
} from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Action state
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/mentors/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load mentor leaves', err);
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
      await api.put(`/mentors/leaves/${leaveId}`, {
        action: actionType,
        remarks: remarks || (actionType === 'APPROVE' ? 'Approved by Mentor' : 'Academic attendance shortfall'),
        reason: remarks || 'Academic attendance shortfall',
      });
      setActiveActionId(null);
      setRemarks('');
      fetchLeaves();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.response?.data || 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === 'ALL') return true;
    return leave.mentorStatus === filter;
  });

  const pendingCount = leaves.filter((l) => l.mentorStatus === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Mentor Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Step 1: Faculty Mentor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.department} • Year {user?.year} • Section {user?.section} • {user?.email}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Responsible for initial academic verification, internal assessments, and attendance check.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="block text-xl font-bold text-emerald-600">{pendingCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">Pending Review</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600'
              }`}
            >
              {tab === 'PENDING' ? `Awaiting My Decision (${pendingCount})` : tab}
            </button>
          ))}
        </div>

        <button
          onClick={fetchLeaves}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
        >
          Refresh
        </button>
      </div>

      {/* Leaves Cards List */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          Loading assigned student applications...
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No applications found under "{filter}"</p>
          <p className="text-xs text-slate-500">All student requests in this category have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => {
            const isMentorPending = leave.mentorStatus === 'PENDING';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {leave.id}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{leave.studentName}</span>
                        <span className="font-mono text-xs font-normal text-slate-500">({leave.studentRollNumber})</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {leave.department} • Year {leave.year} - Sec {leave.section}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Dates: {leave.fromDate} to {leave.toDate}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase ${
                        leave.mentorStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : leave.mentorStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      Mentor: {leave.mentorStatus}
                    </span>
                  </div>
                </div>

                {/* Reason Details */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 uppercase tracking-wide">
                      Category: {leave.leaveType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">Parent: {leave.parentEmail}</span>
                  </div>
                  <p className="text-slate-800"><strong className="text-slate-600">Student's Stated Reason:</strong> {leave.reason}</p>
                  {leave.mentorRemarks && (
                    <p className="text-emerald-800 pt-1 border-t border-slate-200">
                      <strong>Your Remarks:</strong> "{leave.mentorRemarks}"
                    </p>
                  )}
                </div>

                {/* Stepper */}
                <ApprovalTimeline leave={leave} />

                {/* Action Form or Trigger Buttons */}
                {isMentorPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-medium">
                      Step 1 Decision: Once approved, will forward to Parent ({leave.parentEmail}).
                    </span>

                    {activeActionId === leave.id ? (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder={actionType === 'APPROVE' ? 'Optional mentor comments...' : 'Required reason for rejection...'}
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[240px] bg-white"
                        />
                        <button
                          onClick={() => handleDecision(leave.id)}
                          disabled={isSubmitting}
                          className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold transition ${
                            actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                          } disabled:opacity-50`}
                        >
                          {isSubmitting ? 'Submitting...' : `Confirm ${actionType}`}
                        </button>
                        <button
                          onClick={() => setActiveActionId(null)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveActionId(leave.id);
                            setActionType('APPROVE');
                            setRemarks('Approved by Mentor');
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Pass to Parent</span>
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
                          <span>Reject Application</span>
                        </button>
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
