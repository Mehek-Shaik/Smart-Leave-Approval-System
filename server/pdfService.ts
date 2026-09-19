import PDFDocument from 'pdfkit';
import { LeaveEntity } from './db.js';
import { Response } from 'express';

export function generateLeaveHistoryPDF(leaves: LeaveEntity[], res: Response) {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Leave_History_Report.pdf"');

  doc.pipe(res);

  // Colors
  const primaryColor = '#0f172a'; // slate-900
  const accentColor = '#4f46e5'; // indigo-600
  const emeraldColor = '#059669'; // emerald-600
  const roseColor = '#e11d48'; // rose-600
  const amberColor = '#d97706'; // amber-600
  const lightBg = '#f8fafc'; // slate-50
  const borderColor = '#cbd5e1'; // slate-300

  // Header Banner
  doc.rect(40, 40, 515, 60).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('SMART LEAVE APPROVAL SYSTEM', 55, 52);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Institutional Leave History & Campus Out-Pass Audit Report', 55, 73);

  const generatedDateStr = new Date().toLocaleString();
  doc.fontSize(8).fillColor('#cbd5e1').text(`Generated: ${generatedDateStr}`, 350, 55, { align: 'right', width: 190 });
  doc.text(`Total Records: ${leaves.length}`, 350, 70, { align: 'right', width: 190 });

  let currentY = 115;

  // Summary Metrics Banner
  const totalApproved = leaves.filter(l => l.overallStatus === 'APPROVED').length;
  const totalPending = leaves.filter(l => l.overallStatus === 'PENDING').length;
  const totalRejected = leaves.filter(l => l.overallStatus === 'REJECTED').length;
  const totalVerified = leaves.filter(l => l.securityVerified).length;

  doc.rect(40, currentY, 515, 30).fill(lightBg).stroke(borderColor);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor);
  doc.text(`APPROVED: ${totalApproved}`, 55, currentY + 10);
  doc.fillColor(amberColor).text(`IN REVIEW: ${totalPending}`, 170, currentY + 10);
  doc.fillColor(roseColor).text(`REJECTED: ${totalRejected}`, 290, currentY + 10);
  doc.fillColor(emeraldColor).text(`EXIT CLEARED: ${totalVerified}`, 400, currentY + 10);

  currentY += 42;

  // Render each leave application
  leaves.forEach((leave, index) => {
    // Check if new page is required
    if (currentY + 115 > 780) {
      doc.addPage();
      currentY = 45;
    }

    const cardHeight = 105;
    // Card background
    doc.rect(40, currentY, 515, cardHeight).fill('#ffffff').stroke('#e2e8f0');

    // Header bar inside card
    doc.rect(40, currentY, 515, 22).fill('#f1f5f9');
    doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold')
      .text(`${index + 1}. [${leave.id}] ${leave.studentName}`, 50, currentY + 6);
    doc.font('Helvetica').fontSize(8).fillColor('#475569')
      .text(`Roll: ${leave.studentRollNumber}  |  Dept: ${leave.department} (Yr ${leave.year || 3}-${leave.section || 'A'})`, 220, currentY + 7);

    // Status pill
    let statusColor = amberColor;
    if (leave.overallStatus === 'APPROVED') statusColor = emeraldColor;
    if (leave.overallStatus === 'REJECTED') statusColor = roseColor;
    doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(8)
      .text(leave.overallStatus, 465, currentY + 7, { align: 'right', width: 80 });

    // Details Grid
    const bodyY = currentY + 28;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#334155').text('Leave Window:', 50, bodyY);
    doc.font('Helvetica').fillColor('#0f172a').text(`${leave.fromDate} to ${leave.toDate} (${leave.leaveType})`, 120, bodyY);

    doc.font('Helvetica-Bold').fillColor('#334155').text('Reason:', 50, bodyY + 12);
    doc.font('Helvetica').fillColor('#475569').text(leave.reason || 'N/A', 120, bodyY + 12, { width: 420, height: 12, ellipsis: true });

    // Approval Stages
    const stagesY = bodyY + 28;
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#475569').text('Approval Hierarchy:', 50, stagesY);

    const mentorText = `Mentor: ${leave.mentorStatus}`;
    const parentText = `Parent: ${leave.parentStatus}`;
    const cicText = `Incharge: ${leave.classInchargeStatus}`;
    const hodText = `HOD: ${leave.hodStatus}`;

    doc.font('Helvetica').fontSize(7.5);
    doc.fillColor(leave.mentorStatus === 'APPROVED' ? emeraldColor : leave.mentorStatus === 'REJECTED' ? roseColor : '#64748b')
      .text(mentorText, 140, stagesY);
    doc.fillColor(leave.parentStatus === 'APPROVED' ? emeraldColor : leave.parentStatus === 'REJECTED' ? roseColor : '#64748b')
      .text(parentText, 235, stagesY);
    doc.fillColor(leave.classInchargeStatus === 'APPROVED' ? emeraldColor : leave.classInchargeStatus === 'REJECTED' ? roseColor : '#64748b')
      .text(cicText, 330, stagesY);
    doc.fillColor(leave.hodStatus === 'APPROVED' ? emeraldColor : leave.hodStatus === 'REJECTED' ? roseColor : '#64748b')
      .text(hodText, 430, stagesY);

    // Gate Clearance / Security Information
    const gateY = stagesY + 16;
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#334155').text('Gate Clearance:', 50, gateY);
    doc.font('Helvetica').fontSize(7.5);

    if (leave.securityVerified) {
      const verifiedTime = leave.securityVerifiedAt ? new Date(leave.securityVerifiedAt).toLocaleString() : 'Yes';
      const gate = leave.securityGate || 'Main Gate';
      doc.fillColor(emeraldColor).text(`CLEARED & STAMPED at ${gate} (${verifiedTime}) - Officer: ${leave.securityOfficerName || 'Duty Officer'}`, 140, gateY);
    } else if (leave.overallStatus === 'APPROVED') {
      doc.fillColor(accentColor).text(`Active OTP [${leave.otpCode || 'N/A'}] - Awaiting Student Campus Departure at Gate`, 140, gateY);
    } else {
      doc.fillColor('#94a3b8').text('Out-Pass not issued (Leave not finalized)', 140, gateY);
    }

    currentY += cardHeight + 10;
  });

  // Page numbering on all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#94a3b8').text(
      `Smart Leave Approval System • Confidential Administrative Document • Page ${i + 1} of ${range.count}`,
      40,
      800,
      { align: 'center', width: 515 }
    );
  }

  doc.end();
}
