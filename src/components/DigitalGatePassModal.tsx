import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building,
  User,
  FileText,
  Phone,
  Clock,
  Scissors,
  Check,
  Copy,
  Smartphone,
  Sparkles,
  ExternalLink,
  Download,
  FileDown,
  Loader2,
  Info
} from 'lucide-react';
import { LeaveRequest } from '../types';
import {
  printGatePassSlip,
  downloadGatePassPdf,
  downloadGatePassHtml,
  openGatePassPrintWindow
} from '../utils/printGatePass';

export interface DigitalGatePassModalProps {
  leave: LeaveRequest | null;
  onClose: () => void;
  initialMode?: 'slip' | 'screen';
  autoPrint?: boolean;
}

export const DigitalGatePassModal: React.FC<DigitalGatePassModalProps> = ({
  leave,
  onClose,
  initialMode = 'slip',
  autoPrint = false,
}) => {
  const [viewMode, setViewMode] = useState<'slip' | 'screen'>(initialMode);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printStatusNotice, setPrintStatusNotice] = useState<{
    type: 'info' | 'warning' | 'success';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (autoPrint && leave) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, leave]);

  if (!leave) return null;

  const isVerified = leave.securityVerified;
  const isApproved = leave.overallStatus === 'APPROVED';

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintStatusNotice(null);
    setViewMode('slip');

    try {
      const res = await printGatePassSlip(leave);
      setIsPrinting(false);

      if (!res.success) {
        setPrintStatusNotice({
          type: 'info',
          message:
            'Browser print dialog was restricted in this preview frame. Click "Download PDF Pass" or "Open in Full Tab" below to print immediately.',
        });
      }
    } catch (err) {
      setIsPrinting(false);
      setPrintStatusNotice({
        type: 'warning',
        message: 'Could not trigger print dialog directly. Please use "Download PDF Pass" or "Open in Full Tab".',
      });
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPrintStatusNotice(null);
    try {
      await downloadGatePassPdf(leave);
      setPrintStatusNotice({
        type: 'success',
        message: 'Gate Pass PDF generated and downloaded successfully.',
      });
    } catch (err) {
      downloadGatePassHtml(leave);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleOpenInNewTab = () => {
    openGatePassPrintWindow(leave);
  };

  const handleCopyOtp = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Generate deterministic barcode lines based on ID + OTP
  const generateBarcodeLines = () => {
    const seed = (leave.id + (leave.otpCode || '123456')).split('');
    const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 2];
    return widths.map((w, idx) => {
      const isSpace = idx % 2 === 1;
      return {
        width: w * 2,
        isSpace,
      };
    });
  };

  const barcodeBars = generateBarcodeLines();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto gate-pass-modal-backdrop">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative my-6 gate-pass-modal-content">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs text-xs">
              SL
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <span>Official Campus Out-Pass</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {leave.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Gate Clearance & Verification Slip</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('slip')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'slip' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Slip</span>
              </button>
              <button
                onClick={() => setViewMode('screen')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'screen' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Show at Gate</span>
              </button>
            </div>

            {/* Quick Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-slate-700 shadow-xs transition disabled:opacity-50"
              title="Download High-Resolution Official Gate Pass PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Quick Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50"
              title="Print Pass Directly"
            >
              {isPrinting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Printer className="w-3.5 h-3.5" />
              )}
              <span>Print Pass</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Notification Banner (e.g. if browser sandbox blocks window.print) */}
        {printStatusNotice && (
          <div
            className={`no-print px-5 py-3 text-xs flex items-center justify-between gap-3 border-b ${
              printStatusNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-700" />
              <span>{printStatusNotice.message}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDownloadPdf}
                className="px-2.5 py-1 bg-amber-800 text-white hover:bg-amber-900 rounded font-semibold text-[11px] transition"
              >
                Download PDF
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded font-semibold text-[11px] transition flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Tab</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 1: SHOW AT GATE (Screen Mode for mobile presentation) */}
        {viewMode === 'screen' && (
          <div className="no-print p-6 space-y-6 bg-slate-900 text-white">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 uppercase tracking-wider inline-block mb-1">
                {isVerified ? 'Exit Verified at Gate' : 'Approved — Ready for Exit'}
              </span>
              <h2 className="text-2xl font-black tracking-tight">{leave.studentName}</h2>
              <p className="font-mono text-sm text-indigo-300 font-bold">{leave.studentRollNumber}</p>
              <p className="text-xs text-slate-400">{leave.department} • Year {leave.year}-{leave.section}</p>
            </div>

            {/* Huge OTP Display */}
            {leave.otpCode && (
              <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden shadow-2xl">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Gate Clearance OTP
                </div>
                <div className="text-5xl md:text-6xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-md">
                  {leave.otpCode}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopyOtp(leave.otpCode)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-md transition font-medium border border-slate-700"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? 'Copied OTP!' : 'Copy Code'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Expires: {leave.otpExpiresAt ? new Date(leave.otpExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24h'}
                  </span>
                </div>
              </div>
            )}

            {/* Timing Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Departure Date</span>
                <span className="font-bold text-sm text-white">{leave.fromDate}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Return Date</span>
                <span className="font-bold text-sm text-white">{leave.toDate}</span>
              </div>
            </div>

            {/* Verification Details */}
            {isVerified ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Security Clearance Stamped</p>
                  <p className="text-[11px] text-emerald-300">
                    Checked at {leave.securityGate || 'Main Gate'} on {new Date(leave.securityVerifiedAt || '').toLocaleString()} by {leave.securityOfficerName || 'Security'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Instructions for Gate Exit</p>
                  <p className="text-[11px] text-indigo-300">
                    Show this screen along with your college identity card to the security officer at the gate.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewMode('slip')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Switch to Printable Paper Slip</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2 & Print Output: THE SIMPLIFIED GATE PASS SLIP */}
        <div
          id="printable-gate-pass"
          className={`${viewMode === 'screen' ? 'hidden print:block' : 'block'} p-6 sm:p-8 bg-white text-slate-900`}
        >
          {/* Slip Outer Container with Crisp Border */}
          <div className="border-2 border-slate-900 rounded-xl p-5 sm:p-6 space-y-5 bg-white relative">
            {/* Header / Institutional Masthead */}
            <div className="border-b-2 border-slate-900 pb-4 text-center relative">
              <div className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
                College of Engineering & Technology
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                Official Campus Out-Pass
              </h1>
              <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center justify-center gap-2 flex-wrap">
                <span>Gate Clearance & Departure Authorization</span>
                <span>•</span>
                <span className="font-mono font-bold text-slate-900">PASS #{leave.id}</span>
              </div>

              {/* Status Watermark / Stamp Badge in Corner */}
              <div className="absolute right-0 top-0 hidden sm:block">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border-2 ${
                    isVerified
                      ? 'border-emerald-700 text-emerald-800 bg-emerald-50'
                      : isApproved
                      ? 'border-indigo-700 text-indigo-800 bg-indigo-50'
                      : 'border-slate-800 text-slate-800'
                  }`}
                >
                  {isVerified ? 'VERIFIED EXIT' : 'APPROVED'}
                </span>
              </div>
            </div>

            {/* High-Visibility Gate Clearance Box (OTP & Barcode) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border-2 border-slate-300 rounded-xl p-4 items-center">
              {/* OTP Centerpiece */}
              <div className="sm:col-span-2 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Gate Verification Code (OTP)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-slate-950 bg-white px-3 py-1 rounded-lg border-2 border-slate-900 inline-block shadow-2xs">
                    {leave.otpCode || 'PENDING'}
                  </span>
                  <div className="text-xs text-slate-600 leading-tight">
                    <p className="font-bold text-emerald-800">
                      {isVerified ? '✓ Exited at Gate' : '✓ Active for Gate Clearance'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Valid: {leave.fromDate} to {leave.toDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barcode & Pass Serial */}
              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                <div className="inline-block text-left">
                  {/* Visual SVG Barcode */}
                  <div className="flex items-end h-9 justify-center gap-[1.5px] bg-white p-1 rounded-sm border border-slate-300">
                    {barcodeBars.map((bar, idx) => (
                      <div
                        key={idx}
                        className={`h-full ${bar.isSpace ? 'bg-transparent' : 'bg-slate-950'}`}
                        style={{ width: `${bar.width}px` }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[9px] font-bold text-slate-600 tracking-wider text-center mt-1">
                    *{leave.id}-{leave.otpCode || 'OTP'}*
                  </p>
                </div>
              </div>
            </div>

            {/* Student Profile & Out-Pass Details (Clean Table Layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-200 rounded-xl p-3.5 bg-white">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Name</span>
                <span className="font-bold text-sm text-slate-950 block truncate">{leave.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Roll / Reg. No</span>
                <span className="font-mono font-bold text-sm text-slate-950 block">{leave.studentRollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-800 block truncate">{leave.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Year & Section</span>
                <span className="font-semibold text-slate-800 block">Year {leave.year} — Sec {leave.section}</span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pass Category</span>
                <span className="font-bold text-indigo-900 block">{leave.leaveType.replace('_', ' ')} LEAVE</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Authorized Exit</span>
                <span className="font-bold text-slate-900 block">{leave.fromDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Expected Return</span>
                <span className="font-bold text-slate-900 block">{leave.toDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Parent Contact</span>
                <span className="font-semibold text-slate-800 block truncate">{leave.parentEmail}</span>
              </div>

              <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Purpose of Leaving Campus</span>
                <p className="text-slate-900 text-xs mt-0.5 bg-slate-50 p-2 rounded-md border border-slate-200">
                  {leave.reason}
                </p>
              </div>
            </div>

            {/* Official Multi-Level Clearance Matrix */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                Multi-Level Institutional Clearances
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Mentor */}
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">1. Faculty Mentor</span>
                  <span className="font-bold text-emerald-700 text-xs block mt-0.5">
                    {leave.mentorStatus === 'APPROVED' ? '✓ Verified' : leave.mentorStatus}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">{leave.mentorEmail ? leave.mentorEmail.split('@')[0] : 'Mentor Verified'}</span>
                </div>

                {/* 2. Parent */}
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">2. Parent Consent</span>
                  <span className="font-bold text-emerald-700 text-xs block mt-0.5">
                    {leave.parentStatus === 'APPROVED' ? '✓ Consent Granted' : leave.parentStatus}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">Guardian Confirmed</span>
                </div>

                {/* 3. Class Incharge */}
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">3. Class Incharge</span>
                  <span className="font-bold text-emerald-700 text-xs block mt-0.5">
                    {leave.classInchargeStatus === 'APPROVED' ? '✓ Cleared' : leave.classInchargeStatus}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Academic Clearance</span>
                </div>

                {/* 4. HOD */}
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">4. HOD Final</span>
                  <span className="font-bold text-emerald-700 text-xs block mt-0.5">
                    {leave.hodStatus === 'APPROVED' ? '✓ Authorized' : leave.hodStatus}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Executive Sign-Off</span>
                </div>
              </div>
            </div>

            {/* Gate Signatures & Checkpoint Stamp Section */}
            <div className="border-t-2 border-slate-900 pt-4 grid grid-cols-3 gap-4 text-center">
              <div className="space-y-6">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Student Signature</span>
                <div className="border-b border-slate-400 w-3/4 mx-auto" />
                <span className="text-[9px] text-slate-500 block">Date & Student Sign</span>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Gate Security Officer</span>
                <div className="border-b border-slate-400 w-3/4 mx-auto" />
                <span className="text-[9px] text-slate-500 block">
                  {isVerified ? `Verified by ${leave.securityOfficerName || 'Guard'}` : 'Exit Seal & Guard Sign'}
                </span>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Campus Re-Entry Inward</span>
                <div className="border-b border-slate-400 w-3/4 mx-auto" />
                <span className="text-[9px] text-slate-500 block">Return Time & Signature</span>
              </div>
            </div>

            {/* Gate Security Notice */}
            <div className="bg-slate-100 p-2.5 rounded-lg text-[10px] text-slate-600 leading-tight">
              <strong>Gate Regulations:</strong> 1. Student must carry college photo ID alongside this slip. 2. Guard will match OTP in the security terminal. 3. Student must report return at Main Security Gate before authorized return deadline.
            </div>

            {/* Perforated Cut-off Slip for Gate Security Record */}
            <div className="pt-3 border-t-2 border-dashed border-slate-400 relative">
              <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold mb-2">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-slate-600" />
                  Cut here for security gate record
                </span>
                <span>Campus Out-Pass Counterfoil</span>
              </div>

              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block font-medium">Pass No</span>
                  <span className="font-bold text-slate-900 font-mono">{leave.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Student</span>
                  <span className="font-bold text-slate-900 truncate block">{leave.studentName} ({leave.studentRollNumber})</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Clearance OTP</span>
                  <span className="font-bold font-mono text-emerald-800">{leave.otpCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Out-Time / Gate Sign</span>
                  <span className="text-slate-400 block border-b border-slate-300 mt-1"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions (Hidden when printing) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={() => handleCopyOtp(leave.otpCode)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition flex items-center gap-1.5"
            >
              {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedOtp ? 'OTP Copied' : 'Copy OTP'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'slip' ? 'screen' : 'slip')}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center gap-1.5"
            >
              {viewMode === 'slip' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Screen View</span>
                </>
              ) : (
                <>
                  <Printer className="w-3.5 h-3.5" />
                  <span>Paper Slip</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition flex items-center gap-1.5"
              title="Open standalone printable slip in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Tab</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 shadow-sm transition disabled:opacity-50"
              title="Download official PDF pass file"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-300" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 text-white" />
              )}
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export alias as PrintPassModal
export const PrintPassModal = DigitalGatePassModal;
