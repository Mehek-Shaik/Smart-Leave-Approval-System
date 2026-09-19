import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import confetti from 'canvas-confetti';
import { DigitalGatePassModal } from '../components/DigitalGatePassModal';
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Search,
  User,
  Building,
  Calendar,
  Clock,
  Sparkles,
  QrCode,
  Printer
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [approvedLeaves, setApprovedLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState<LeaveRequest | null>(null);

  // Verification Input State
  const [otpCode, setOtpCode] = useState<string>('');
  const [queryIdentifier, setQueryIdentifier] = useState<string>('');
  const [gateNumber, setGateNumber] = useState<string>(user?.gateNumber || 'Main Campus Gate 1');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [lastVerifiedLeave, setLastVerifiedLeave] = useState<LeaveRequest | null>(null);

  const fetchApprovedLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/security/approved-leaves');
      setApprovedLeaves(res.data);
      const cleared = (res.data as LeaveRequest[]).filter((l) => l.securityVerified);
      if (cleared.length > 0 && !lastVerifiedLeave) {
        setLastVerifiedLeave(cleared[0]);
      }
    } catch (err) {
      console.error('Failed to load approved leaves', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      setVerifyError('Please enter a valid 6-digit numeric OTP code.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await api.post('/security/verify', {
        otpCode: otpCode.trim(),
        queryIdentifier: queryIdentifier.trim() || undefined,
        gateNumber,
      });

      const verified = res.data.leave ? { ...res.data.leave, ...res.data } : res.data;
      setLastVerifiedLeave(verified);
      setOtpCode('');

      // Confetti burst for successful verification
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }

      fetchApprovedLeaves();
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || err.response?.data || 'Invalid OTP. Clearance denied.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickFillOtp = (code?: string) => {
    if (code) {
      setOtpCode(code);
      setVerifyError(null);
    }
  };

  const pendingClearanceLeaves = approvedLeaves.filter((l) => !l.securityVerified);
  const clearedLeaves = approvedLeaves.filter((l) => l.securityVerified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Security Gate Terminal Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Security Gate Terminal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 border border-rose-600/40 text-rose-300">
                {gateNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Officer On Duty: <strong>{user?.name || 'Officer Mahendra Singh'}</strong> • Step 7: Campus Departure Clearance
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Verify student's 6-digit HOD-issued OTP code before permitting exit through the physical campus gate.
            </p>
          </div>
        </div>

        <button
          onClick={fetchApprovedLeaves}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
        >
          Refresh Roster
        </button>
      </div>

      {/* Main Terminal Grid: Left is Keypad Verification, Right is Clearance Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: OTP Verification Terminal */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Verify Out-Pass OTP</h2>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              {verifyError && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">GATE CLEARANCE DENIED:</span>
                    <span>{verifyError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  6-Digit Student OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 582914"
                    className="w-full text-center text-3xl font-mono font-extrabold tracking-widest py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-slate-50 uppercase text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Student provides this code generated upon HOD approval.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Campus Departure Gate
                </label>
                <select
                  value={gateNumber}
                  onChange={(e) => setGateNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Main Campus Gate 1">Main Campus Gate 1</option>
                  <option value="North Hostel Gate 2">North Hostel Gate 2</option>
                  <option value="Sports Complex Gate 3">Sports Complex Gate 3</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{isVerifying ? 'Verifying...' : 'Verify OTP & Authorize Exit'}</span>
              </button>
            </form>
          </div>

          {/* Success Banner if Just Verified */}
          {lastVerifiedLeave && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-sm text-emerald-950 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-900">EXIT CLEARED & STAMPED</h3>
                  <p className="text-xs text-emerald-700">Out-pass authorized for campus departure.</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Student:</span>
                  <span className="font-bold text-slate-900">
                    {lastVerifiedLeave.studentName || (lastVerifiedLeave as any).leave?.studentName || 'Student'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {lastVerifiedLeave.studentRollNumber || (lastVerifiedLeave as any).leave?.studentRollNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="text-slate-700 font-medium">
                    {lastVerifiedLeave.department || (lastVerifiedLeave as any).leave?.department || 'General'}
                    {lastVerifiedLeave.year || (lastVerifiedLeave as any).leave?.year ? ` (Yr ${lastVerifiedLeave.year || (lastVerifiedLeave as any).leave?.year})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Leave Window:</span>
                  <span className="text-slate-700 font-medium">
                    {lastVerifiedLeave.fromDate || (lastVerifiedLeave as any).leave?.fromDate || 'Today'} to {lastVerifiedLeave.toDate || (lastVerifiedLeave as any).leave?.toDate || 'Today'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Cleared Gate:</span>
                  <span className="font-semibold text-emerald-800">
                    {lastVerifiedLeave.securityGate || (lastVerifiedLeave as any).gateNumber || (lastVerifiedLeave as any).leave?.securityGate || gateNumber || 'Main Campus Gate 1'}
                  </span>
                </div>
                {(lastVerifiedLeave.securityOfficerName || (lastVerifiedLeave as any).officerName) && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-emerald-100 text-[11px]">
                    <span className="text-slate-400">Verified By:</span>
                    <span className="text-slate-600 font-medium">
                      {lastVerifiedLeave.securityOfficerName || (lastVerifiedLeave as any).officerName}
                    </span>
                  </div>
                )}

                <div className="pt-2 flex justify-end border-t border-emerald-100">
                  <button
                    onClick={() => setSelectedPassForPrint(lastVerifiedLeave)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    title="Print out-pass slip for record"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Gate Clearance Slip</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Active Approved Out-Passes Ready for Verification */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Approved Passes Awaiting Departure</h2>
                <p className="text-xs text-slate-500">Click any card to auto-fill its OTP into the verification keypad</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                {pendingClearanceLeaves.length} Ready
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-slate-400 text-xs">Loading approved passes...</div>
            ) : pendingClearanceLeaves.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                <p className="text-xs text-slate-500 font-medium">No approved passes awaiting departure right now.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {pendingClearanceLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    onClick={() => handleQuickFillOtp(leave.otpCode)}
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-900">
                          {leave.studentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                          {leave.studentRollNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {leave.department} • Dates: {leave.fromDate} to {leave.toDate}
                      </p>
                      <p className="text-[11px] text-slate-600 italic line-clamp-1">"{leave.reason}"</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">OTP Code:</span>
                        <span className="font-mono text-base font-extrabold text-indigo-600 tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs group-hover:border-indigo-400">
                          {leave.otpCode}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPassForPrint(leave);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                        title="Print Gate Pass Slip"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cleared History Log */}
          {clearedLeaves.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Today's Gate Departure Log</h2>
                <span className="text-xs text-slate-500">{clearedLeaves.length} student(s) departed</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {clearedLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    onClick={() => setLastVerifiedLeave(leave)}
                    className="p-3 bg-emerald-50/40 hover:bg-emerald-100/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs cursor-pointer transition group"
                    title="Click to view full Exit Clearance stamp"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{leave.studentName} ({leave.studentRollNumber})</span>
                      <p className="text-[11px] text-slate-500">{leave.department} • Exited at {leave.securityGate || 'Main Gate'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{leave.securityVerifiedAt ? new Date(leave.securityVerifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Cleared'}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPassForPrint(leave);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-md transition"
                        title="Print Out-Pass Record"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Gate Pass Slip Modal */}
      <DigitalGatePassModal
        leave={selectedPassForPrint}
        onClose={() => setSelectedPassForPrint(null)}
        initialMode="slip"
      />
    </div>
  );
};
