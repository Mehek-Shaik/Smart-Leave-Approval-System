import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest, AdminStats } from '../types';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { DigitalGatePassModal } from '../components/DigitalGatePassModal';
import {
  Users,
  Building,
  GraduationCap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  KeyRound,
  AlertTriangle,
  BarChart3,
  FileDown,
  Sparkles,
  Trash2,
  RefreshCw,
  Printer,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPass, setSelectedPass] = useState<LeaveRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Operation States
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, leavesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/leaves'),
      ]);
      setStats(dashRes.data.stats);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setBannerMessage(null);
    try {
      const response = await api.get('/admin/leaves/export/pdf', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Leave_History_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setBannerMessage({ type: 'success', text: 'Leave History PDF downloaded successfully.' });
    } catch (err: any) {
      console.error('Failed to download PDF', err);
      setBannerMessage({ type: 'error', text: 'Failed to download Leave History PDF. Please try again.' });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleLoadDemoData = async () => {
    setIsLoadingDemo(true);
    setBannerMessage(null);
    try {
      const res = await api.post('/admin/data/demo');
      const counts = res.data;
      const countMsg = counts.leavesCreated
        ? `Demo data loaded successfully (${counts.studentsCreated || 5} students, ${counts.mentorsCreated || 2} mentors, ${counts.parentsCreated || 5} parents, ${counts.classInchargesCreated || 2} class incharges, ${counts.hodsCreated || 2} HODs, ${counts.leavesCreated || 7} leaves).`
        : 'Demo data loaded successfully with complete multi-stage leave workflow.';
      setBannerMessage({ type: 'success', text: countMsg });
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to load demo data', err);
      setBannerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load demo data.' });
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    setBannerMessage(null);
    try {
      await api.delete('/admin/data/clear');
      setBannerMessage({ type: 'success', text: 'Existing application data cleared successfully.' });
      setShowClearModal(false);
      await fetchAdminData();
    } catch (err: any) {
      console.error('Failed to clear data', err);
      setBannerMessage({ type: 'error', text: err.response?.data?.message || 'Failed to clear data.' });
    } finally {
      setIsClearing(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.studentRollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return leave.overallStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Institutional Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as: {user?.name} ({user?.email}) • Full institutional audit & governance
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Admin Action Bar: Clear Data, Load Demo Data, Download PDF */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">System Operations & Reporting</h2>
            <p className="text-[11px] text-slate-500">Institutional data management and official audit export</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Leave History PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
            title="Export official Leave History report as PDF"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Leave History PDF'}</span>
          </button>

          {/* Load Demo Data */}
          <button
            onClick={handleLoadDemoData}
            disabled={isLoadingDemo}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition disabled:opacity-50"
            title="Populate complete multi-stage demo records"
          >
            {isLoadingDemo ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isLoadingDemo ? 'Loading Demo Data...' : 'Load Demo Data'}</span>
          </button>

          {/* Clear Existing Data */}
          <button
            onClick={() => setShowClearModal(true)}
            disabled={isClearing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
            title="Clear all student, leave and OTP records"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear Existing Data</span>
          </button>
        </div>
      </div>

      {/* Banner Notification for Action Results */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Modal for Clear Existing Data */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Clear Existing Data</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to clear the existing data? This will remove the current application/demo records.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {isClearing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isClearing ? 'Clearing...' : 'Clear Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Leaves</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalLeaves}</span>
            <span className="text-[10px] text-slate-400">All submissions</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">In Review</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{stats.pendingLeaves}</span>
            <span className="text-[10px] text-slate-400">Pending any level</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Approved</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.approvedLeaves}</span>
            <span className="text-[10px] text-slate-400">Finalized by HOD</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">Rejected</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{stats.rejectedLeaves}</span>
            <span className="text-[10px] text-slate-400">Declined by an authority</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">Gate Verified</span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{stats.securityVerifiedLeaves}</span>
            <span className="text-[10px] text-slate-400">Departed campus</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">Total Students</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{stats.totalStudents}</span>
            <span className="text-[10px] text-slate-400">Enrolled accounts</span>
          </div>
        </div>
      )}

      {/* Workflow Stage Bottlenecks Breakdown */}
      {stats && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Active Bottleneck Breakdown (Pending Applications by Stage)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">Stage 1: Faculty Mentor</span>
                <p className="text-[11px] text-slate-400">Awaiting academic review</p>
              </div>
              <span className="text-xl font-bold text-emerald-600">{stats.pendingAtMentor}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">Stage 2: Parent Consent</span>
                <p className="text-[11px] text-slate-400">Mentor passed, awaiting parent</p>
              </div>
              <span className="text-xl font-bold text-purple-600">{stats.pendingAtParent}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">Stage 3: Class Incharge</span>
                <p className="text-[11px] text-slate-400">Parent passed, awaiting incharge</p>
              </div>
              <span className="text-xl font-bold text-cyan-600">{stats.pendingAtClassIncharge}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">Stage 4: Head of Dept</span>
                <p className="text-[11px] text-slate-400">Incharge passed, awaiting HOD OTP</p>
              </div>
              <span className="text-xl font-bold text-amber-600">{stats.pendingAtHOD}</span>
            </div>
          </div>
        </div>
      )}

      {/* Master Leave Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Institution Out-Pass Audit Registry</h2>
            <p className="text-xs text-slate-500">Every leave application with audit trail and timeline</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, roll, or ID..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Loading audit registry...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
            No matching leave applications found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {leave.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{leave.studentName}</span>
                    <span className="font-mono text-xs text-slate-500">({leave.studentRollNumber})</span>
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
                      {leave.department} • Yr {leave.year}-{leave.section}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {leave.overallStatus === 'APPROVED' && (
                      <button
                        onClick={() => setSelectedPass(leave)}
                        className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-2xs transition"
                        title="Print Gate Pass"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Pass</span>
                      </button>
                    )}
                    {leave.otpCode && (
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        OTP: {leave.otpCode}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                        leave.overallStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : leave.overallStatus === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {leave.overallStatus}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/60">
                  <p><strong>Reason:</strong> {leave.reason}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dates: {leave.fromDate} to {leave.toDate} • Applied: {new Date(leave.appliedAt).toLocaleString()}
                  </p>
                </div>

                <ApprovalTimeline leave={leave} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Gate Pass Slip Modal */}
      <DigitalGatePassModal
        leave={selectedPass}
        onClose={() => setSelectedPass(null)}
        initialMode="slip"
      />
    </div>
  );
};
