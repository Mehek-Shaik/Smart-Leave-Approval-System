import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest, LeaveType } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { DigitalGatePassModal } from '../components/DigitalGatePassModal';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Trash2,
  KeyRound,
  Printer,
  Smartphone
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [selectedGatePass, setSelectedGatePass] = useState<LeaveRequest | null>(null);
  const [passModalMode, setPassModalMode] = useState<'slip' | 'screen'>('slip');
  const [autoPrintPass, setAutoPrintPass] = useState<boolean>(false);

  const handleOpenPass = (leave: LeaveRequest, mode: 'slip' | 'screen' = 'slip', print: boolean = false) => {
    setSelectedGatePass(leave);
    setPassModalMode(mode);
    setAutoPrintPass(print);
  };

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (new Date(fromDate) > new Date(toDate)) {
      setFormError('Out date (fromDate) cannot be after return date (toDate)');
      return;
    }

    setFormSubmitting(true);
    try {
      await api.post('/leave/apply', {
        leaveType,
        fromDate,
        toDate,
        reason,
      });
      setShowApplyModal(false);
      setReason('');
      fetchLeaves();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.response?.data || 'Failed to submit leave request');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await api.delete(`/leave/${leaveId}`);
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data || 'Could not cancel leave');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Profile Card & Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xl">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Roll No: {user?.rollNumber || '21CS104'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.department} • Year {user?.year} • Section {user?.section}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
              <span><strong>Mentor:</strong> {user?.mentorEmail || 'dr.sharma@college.edu'}</span>
              <span>•</span>
              <span><strong>Parent:</strong> {user?.parentEmail || 'parent.rahul@gmail.com'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Out-Pass</span>
        </button>
      </div>

      {/* Leave Applications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Leave & Out-Pass History</h2>
            <p className="text-xs text-slate-500">Track real-time multi-level approval progress</p>
          </div>
          <button
            onClick={fetchLeaves}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Refresh List
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            Loading applications...
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No leave applications yet</p>
            <p className="text-xs text-slate-500">Click 'Apply for Out-Pass' above to start a new application.</p>
          </div>
        ) : (
          leaves.map((leave) => {
            const isApproved = leave.overallStatus === 'APPROVED';
            const isRejected = leave.overallStatus === 'REJECTED';
            const isPending = leave.overallStatus === 'PENDING';
            const isCancelled = leave.cancelled;

            return (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {leave.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {leave.leaveType.replace('_', ' ')} LEAVE
                    </span>
                    <span className="text-xs text-slate-500">
                      {leave.fromDate} to {leave.toDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Overall Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : isRejected
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {leave.overallStatus}
                    </span>

                    {/* Actions for Approved Leave */}
                    {isApproved && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPass(leave, 'slip', true)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                          title="Generate printable simplified gate pass"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-200" />
                          <span>Print Pass</span>
                        </button>

                        <button
                          onClick={() => handleOpenPass(leave, 'screen', false)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                          title="Show gate pass on screen to security guard"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Show at Gate</span>
                          {leave.otpCode && (
                            <span className="font-mono text-emerald-400 ml-0.5">({leave.otpCode})</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Cancel button if pending */}
                    {isPending && !isCancelled && (
                      <button
                        onClick={() => handleCancelLeave(leave.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Cancel Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <span className="font-semibold text-slate-600">Reason: </span>
                  <span className="text-slate-800">{leave.reason}</span>
                </div>

                {/* OTP Notification if approved */}
                {isApproved && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-6 h-6 text-white flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                          Final Approval Granted by HOD
                        </p>
                        <p className="text-sm font-bold">
                          Gate Clearance OTP: <span className="font-mono text-lg tracking-widest bg-white/20 px-2 py-0.5 rounded-md ml-1">{leave.otpCode}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPass(leave, 'slip', true)}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 border border-white/30"
                        title="Print Gate Pass"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Pass</span>
                      </button>
                      <button
                        onClick={() => handleOpenPass(leave, 'screen', false)}
                        className="px-3 py-1.5 bg-white text-emerald-900 rounded-lg font-bold text-xs shadow-xs hover:bg-emerald-50 transition flex items-center gap-1.5"
                      >
                        {leave.securityVerified ? 'Exit Stamped ✓' : 'Open Pass'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Stepper Timeline */}
                <ApprovalTimeline leave={leave} />
              </div>
            );
          })
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Apply for Out-Pass / Leave</h3>
                <p className="text-xs text-slate-400">Request will route to Mentor → Parent → Class Incharge → HOD</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="ACADEMIC">Academic / Competition</option>
                  <option value="EMERGENCY">Emergency Family Leave</option>
                  <option value="HOME_VISIT">Weekend Home Visit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Departure (From Date)</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Return (To Date)</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reason / Explanation</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide explicit reasons for your campus leave request..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Workflow Routing:</p>
                <p>1. Mentor ({user?.mentorEmail || 'Faculty'}) reviews attendance & academic status.</p>
                <p>2. Parent ({user?.parentEmail || 'Guardian'}) gives digital consent.</p>
                <p>3. Class Incharge verifies class schedule.</p>
                <p>4. HOD signs off and triggers 6-digit gate OTP.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Gate Pass Modal */}
      <DigitalGatePassModal
        leave={selectedGatePass}
        onClose={() => setSelectedGatePass(null)}
        initialMode={passModalMode}
        autoPrint={autoPrintPass}
      />
    </div>
  );
};
