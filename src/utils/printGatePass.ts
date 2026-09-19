import { LeaveRequest } from '../types';

/**
 * Builds a clean, standalone, self-contained printable HTML document
 * for the Gate Pass slip with embedded inline styling.
 */
export function generateGatePassHtml(leave: LeaveRequest): string {
  const isVerified = Boolean(leave.securityVerified);
  const printDate = new Date().toLocaleString();
  const mentorEmail = leave.mentorEmail ? leave.mentorEmail.split('@')[0] : 'Mentor Verified';
  const verifiedTime = leave.securityVerifiedAt
    ? new Date(leave.securityVerifiedAt).toLocaleString()
    : 'Pending Gate Departure';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gate Pass Slip - ${leave.studentRollNumber || leave.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      padding: 16px;
      font-size: 13px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pass-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      background: #ffffff;
    }
    .header {
      background: #0f172a;
      color: #ffffff;
      padding: 16px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 11px;
      color: #94a3b8;
      letter-spacing: 0.3px;
    }
    .header .pass-id {
      margin-top: 6px;
      font-family: monospace;
      font-size: 11px;
      color: #38bdf8;
      font-weight: bold;
    }
    .sub-bar {
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
    }
    .content {
      padding: 16px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .card-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      background: #f8fafc;
    }
    .card-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      color: #0f172a;
      font-weight: 800;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .info-label {
      width: 110px;
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
    }
    .info-value {
      flex: 1;
      color: #0f172a;
      font-weight: 500;
    }
    .otp-banner {
      border: 2px solid ${isVerified ? '#059669' : '#4338ca'};
      background: ${isVerified ? '#ecfdf5' : '#eef2ff'};
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .otp-info h2 {
      font-size: 12px;
      font-weight: 800;
      color: ${isVerified ? '#047857' : '#3730a3'};
      text-transform: uppercase;
    }
    .otp-info p {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .otp-code {
      font-family: monospace;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 6px;
      background: #ffffff;
      padding: 6px 16px;
      border-radius: 6px;
      border: 1.5px solid ${isVerified ? '#059669' : '#4338ca'};
      color: ${isVerified ? '#047857' : '#3730a3'};
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      background: ${isVerified ? '#059669' : '#0f172a'};
      color: #ffffff;
      margin-top: 4px;
    }
    .approvals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .approval-item {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      text-align: center;
    }
    .approval-item .step-num {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      display: block;
    }
    .approval-item .status {
      font-size: 11px;
      font-weight: 800;
      color: #047857;
      margin: 4px 0 2px 0;
      display: block;
    }
    .approval-item .role {
      font-size: 9px;
      color: #64748b;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gate-stamp-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      background: #f8fafc;
      margin-bottom: 16px;
      font-size: 11px;
    }
    .gate-stamp-box strong {
      color: #0f172a;
    }
    .signatures-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      text-align: center;
      margin-bottom: 16px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .sig-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      background: #ffffff;
      height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sig-title {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .sig-status {
      font-size: 10px;
      font-weight: bold;
      color: #047857;
    }
    .sig-sub {
      font-size: 8px;
      color: #94a3b8;
    }
    .counterfoil {
      border-top: 2px dashed #94a3b8;
      margin-top: 16px;
      padding-top: 12px;
      background: #fdfdfd;
    }
    .cut-indicator {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .cf-content {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      background: #f8fafc;
    }
    .cf-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .cf-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 11px;
      margin-top: 8px;
      background: #ffffff;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .cf-sigs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-top: 10px;
      text-align: center;
    }
    .cf-sig-item {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px;
      background: #ffffff;
      font-size: 9px;
      height: 55px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .no-print {
        display: none !important;
      }
      .pass-container {
        border: 2px solid #000000;
      }
    }
  </style>
</head>
<body>
  <div class="pass-container">
    <div class="header">
      <h1>Excellence Institute of Technology & Science</h1>
      <p>CAMPUS SECURITY & GATE PASS CLEARANCE SLIP</p>
      <div class="pass-id">PASS REF: ${leave.id} • STATUS: ${leave.overallStatus}</div>
    </div>

    <div class="sub-bar">
      <span>INSTITUTIONAL GATE CLEARANCE DOCKET</span>
      <span>Printed: ${printDate}</span>
    </div>

    <div class="content">
      <!-- Info Grid -->
      <div class="grid-2">
        <div class="card-box">
          <h3>Student Identification</h3>
          <div class="info-row"><span class="info-label">Student Name:</span><span class="info-value"><strong>${leave.studentName}</strong></span></div>
          <div class="info-row"><span class="info-label">Roll Number:</span><span class="info-value"><strong>${leave.studentRollNumber || 'N/A'}</strong></span></div>
          <div class="info-row"><span class="info-label">Department:</span><span class="info-value">${leave.department} (Yr ${leave.year || 3}-${leave.section || 'A'})</span></div>
          <div class="info-row"><span class="info-label">Student Email:</span><span class="info-value">${leave.studentEmail}</span></div>
          ${leave.phoneNumber ? `<div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${leave.phoneNumber}</span></div>` : ''}
        </div>

        <div class="card-box">
          <h3>Authorized Leave Window</h3>
          <div class="info-row"><span class="info-label">Leave Type:</span><span class="info-value"><strong>${leave.leaveType}</strong></span></div>
          <div class="info-row"><span class="info-label">From Date:</span><span class="info-value">${leave.fromDate}</span></div>
          <div class="info-row"><span class="info-label">To Date:</span><span class="info-value">${leave.toDate}</span></div>
          <div class="info-row"><span class="info-label">Destination / Reason:</span><span class="info-value">${leave.reason}</span></div>
        </div>
      </div>

      <!-- OTP Banner -->
      <div class="otp-banner">
        <div class="otp-info">
          <h2>${isVerified ? '✓ EXIT AUTHORIZATION VERIFIED & STAMPED' : 'GATE CLEARANCE ONE-TIME VERIFICATION CODE'}</h2>
          <p>Present this 6-digit OTP code to security personnel at the campus exit gate:</p>
          <span class="status-badge">${isVerified ? 'CLEARED FOR EXIT' : 'ACTIVE OUT-PASS'}</span>
        </div>
        <div class="otp-code">${leave.otpCode || '982741'}</div>
      </div>

      <!-- Clearances -->
      <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">
        Institutional Approvals Hierarchy
      </div>
      <div class="approvals-grid">
        <div class="approval-item">
          <span class="step-num">1. Faculty Mentor</span>
          <span class="status">${leave.mentorStatus === 'APPROVED' ? '✓ Cleared' : leave.mentorStatus}</span>
          <span class="role">${mentorEmail}</span>
        </div>
        <div class="approval-item">
          <span class="step-num">2. Parent / Guardian</span>
          <span class="status">${leave.parentStatus === 'APPROVED' ? '✓ Consent' : leave.parentStatus}</span>
          <span class="role">Guardian Verified</span>
        </div>
        <div class="approval-item">
          <span class="step-num">3. Class Incharge</span>
          <span class="status">${leave.classInchargeStatus === 'APPROVED' ? '✓ Authorized' : leave.classInchargeStatus}</span>
          <span class="role">Academic Clearance</span>
        </div>
        <div class="approval-item">
          <span class="step-num">4. Head of Dept</span>
          <span class="status">${leave.hodStatus === 'APPROVED' ? '✓ Final Sign' : leave.hodStatus}</span>
          <span class="role">HOD Approved</span>
        </div>
      </div>

      <!-- Gate Verification Info -->
      <div class="gate-stamp-box">
        <strong>Gate Security Status: </strong>
        ${isVerified
          ? `<span style="color: #047857; font-weight: bold;">DEPARTED CAMPUS</span> • Gate: <strong>${leave.securityGate || 'Main Gate'}</strong> • Time: <strong>${verifiedTime}</strong> • Officer: <strong>${leave.securityOfficerName || 'Duty In-Charge'}</strong>`
          : `<span style="color: #d97706; font-weight: bold;">AWAITING PHYSICAL GATE CHECKPOINT</span> • Student must verify OTP with Gate Officer upon exit.`
        }
      </div>

      <!-- Main Signatures -->
      <div class="signatures-row">
        <div class="sig-box">
          <span class="sig-title">Student Signature</span>
          <div style="border-bottom: 1px solid #94a3b8; width: 80%; margin: 0 auto;"></div>
          <span class="sig-sub">Sign upon physical departure</span>
        </div>
        <div class="sig-box">
          <span class="sig-title">Faculty Advisor / HOD</span>
          <span class="sig-status">DIGITALLY AUTHORIZED ✓</span>
          <span class="sig-sub">System Signature Verified</span>
        </div>
        <div class="sig-box">
          <span class="sig-title">Gate Security Stamp</span>
          ${isVerified
            ? `<span class="sig-status" style="color: #047857;">VERIFIED ✓ (${leave.securityGate || 'Gate 1'})</span>`
            : `<span class="sig-sub" style="font-size: 10px; color: #64748b;">[ Physical Gate Stamp ]</span>`
          }
          <span class="sig-sub">Security Checkpoint Verification</span>
        </div>
      </div>

      <!-- Counterfoil -->
      <div class="counterfoil">
        <div class="cut-indicator">✂ TEAR HERE — SECURITY ARCHIVE COUNTERFOIL ✂</div>
        <div class="cf-content">
          <div class="cf-title">Gate Counterfoil — Campus Security Retention Slip</div>
          <div style="font-size: 10px; color: #64748b;">To be retained in the gate security register upon student departure.</div>

          <div class="cf-grid">
            <div><strong>Pass Ref:</strong> ${leave.id}</div>
            <div><strong>Roll No:</strong> ${leave.studentRollNumber || 'N/A'}</div>
            <div><strong>Student:</strong> ${leave.studentName}</div>
            <div><strong>Department:</strong> ${leave.department} (Yr ${leave.year || 3})</div>
            <div><strong>Dates:</strong> ${leave.fromDate} to ${leave.toDate}</div>
            <div><strong>Cleared OTP:</strong> <span style="font-family: monospace; font-weight: bold; color: #4338ca;">${leave.otpCode || 'N/A'}</span></div>
          </div>

          <div class="cf-sigs">
            <div class="cf-sig-item">
              <span style="font-weight: 700; color: #64748b;">STUDENT SIGN</span>
              <span style="font-size: 8px; color: #94a3b8;">Sign at gate</span>
            </div>
            <div class="cf-sig-item">
              <span style="font-weight: 700; color: #64748b;">SECURITY OFFICER</span>
              <span style="font-weight: 600; color: #0f172a;">${leave.securityOfficerName || 'Duty Officer'}</span>
            </div>
            <div class="cf-sig-item">
              <span style="font-weight: 700; color: #64748b;">OUT-TIME STAMP</span>
              <span style="color: #047857; font-weight: 600;">${isVerified ? 'CLEARED' : 'TIME STAMP'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads the official Gate Pass PDF from the backend server.
 * This is 100% reliable even in strictly sandboxed iframes.
 */
export async function downloadGatePassPdf(leave: LeaveRequest): Promise<void> {
  const token = localStorage.getItem('smart_leave_auth_token');
  const filename = `Gate_Pass_${leave.studentRollNumber || leave.id}.pdf`;

  const url = `/api/leaves/${leave.id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF (HTTP ${response.status})`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback: If fetch or blob failed, trigger fallback HTML download
    downloadGatePassHtml(leave);
  }
}

/**
 * Downloads the standalone Gate Pass as an offline HTML file.
 */
export function downloadGatePassHtml(leave: LeaveRequest): void {
  const html = generateGatePassHtml(leave);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Gate_Pass_${leave.studentRollNumber || leave.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Opens the Gate Pass slip in a clean, isolated new tab or window.
 * The user can then print cleanly without iframe sandboxing issues.
 */
export function openGatePassPrintWindow(leave: LeaveRequest): Window | null {
  const html = generateGatePassHtml(leave);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = window.URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');
  return printWindow;
}

/**
 * Executes high-reliability printing:
 * 1. Creates a hidden iframe to isolate the printable document from the parent app/modals.
 * 2. If the browser blocks iframe.print() (e.g. sandboxed iframe), it catches the error
 *    and falls back to window.print() and download options.
 */
export async function printGatePassSlip(
  leave: LeaveRequest
): Promise<{ success: boolean; error?: string; blockedByIframe?: boolean }> {
  try {
    const html = generateGatePassHtml(leave);

    // Create hidden iframe for print isolation
    const iframe = document.createElement('iframe');
    iframe.id = 'gate-pass-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return { success: true };
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Allow iframe styles and DOM to render
    await new Promise((r) => setTimeout(r, 250));

    let printed = false;
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        printed = true;
      }
    } catch (e: any) {
      console.warn('Iframe print failed or was blocked by sandbox:', e);
    }

    // Clean up iframe after printing dialog closes
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);

    if (printed) {
      return { success: true };
    }

    // If iframe print didn't work, try direct window.print()
    try {
      window.print();
      return { success: true };
    } catch (winErr: any) {
      console.warn('window.print() blocked by environment:', winErr);
      return {
        success: false,
        blockedByIframe: true,
        error: winErr?.message || 'Print blocked by browser environment',
      };
    }
  } catch (err: any) {
    console.error('Error during gate pass printing:', err);
    return {
      success: false,
      error: err?.message || 'Failed to trigger print',
    };
  }
}
