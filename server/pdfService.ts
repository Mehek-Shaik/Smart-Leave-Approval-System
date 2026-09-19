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

export function generateGatePassPDF(leave: LeaveEntity, res: Response) {
  const doc = new PDFDocument({
    margin: 36,
    size: 'A4',
    bufferPages: true,
  });

  const filename = `Gate_Pass_${leave.studentRollNumber || leave.id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  doc.pipe(res);

  // Palette
  const darkNavy = '#0f172a';
  const indigo = '#4338ca';
  const emerald = '#047857';
  const slateDark = '#1e293b';
  const slateMuted = '#64748b';
  const bgLight = '#f8fafc';
  const borderGrey = '#cbd5e1';

  // Outer Border Container
  doc.rect(36, 36, 523, 770).strokeColor(darkNavy).lineWidth(1.5).stroke();

  // Top Header Banner
  doc.rect(36, 36, 523, 62).fill(darkNavy);
  doc.fillColor('#ffffff').fontSize(15).font('Helvetica-Bold')
    .text('EXCELLENCE INSTITUTE OF TECHNOLOGY & SCIENCE', 46, 48, { align: 'center', width: 503 });
  doc.fontSize(9.5).font('Helvetica').fillColor('#94a3b8')
    .text('CAMPUS SECURITY & GATE PASS CLEARANCE SLIP', 46, 68, { align: 'center', width: 503 });
  doc.fontSize(8).fillColor('#38bdf8')
    .text(`PASS ID: ${leave.id}  •  SYSTEM VERIFIED OUT-PASS`, 46, 82, { align: 'center', width: 503 });

  // Sub-header bar
  let y = 106;
  doc.rect(46, y, 503, 24).fill('#f1f5f9').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fillColor(slateDark).fontSize(8.5).font('Helvetica-Bold')
    .text('STUDENT GATE PASS & CLEARANCE DOCKET', 56, y + 7);
  doc.fillColor(slateMuted).font('Helvetica').fontSize(8)
    .text(`Printed: ${new Date().toLocaleString()}`, 330, y + 7, { align: 'right', width: 210 });

  // Student Profile & Leave Info Section
  y = 138;
  doc.rect(46, y, 503, 100).fill(bgLight).strokeColor(borderGrey).lineWidth(0.5).stroke();
  
  // Left Column: Student Details
  doc.fillColor(darkNavy).fontSize(9).font('Helvetica-Bold').text('STUDENT INFORMATION', 56, y + 10);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Full Name:', 56, y + 26);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(darkNavy).text(leave.studentName, 125, y + 26);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Roll Number:', 56, y + 42);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(darkNavy).text(leave.studentRollNumber || 'N/A', 125, y + 42);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Department:', 56, y + 58);
  doc.font('Helvetica').fontSize(8.5).fillColor(darkNavy).text(`${leave.department} (Yr ${leave.year || 3}-${leave.section || 'A'})`, 125, y + 58);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Student Contact:', 56, y + 74);
  doc.font('Helvetica').fontSize(8.5).fillColor(darkNavy).text(leave.phoneNumber || leave.studentEmail, 125, y + 74);

  // Right Column: Leave Schedule
  doc.fillColor(darkNavy).fontSize(9).font('Helvetica-Bold').text('PERMITTED LEAVE WINDOW', 300, y + 10);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Leave Type:', 300, y + 26);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(indigo).text(leave.leaveType, 385, y + 26);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('From Date:', 300, y + 42);
  doc.font('Helvetica').fontSize(8.5).fillColor(darkNavy).text(leave.fromDate, 385, y + 42);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('To Date:', 300, y + 58);
  doc.font('Helvetica').fontSize(8.5).fillColor(darkNavy).text(leave.toDate, 385, y + 58);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Reason / Destination:', 300, y + 74);
  doc.font('Helvetica').fontSize(8).fillColor(darkNavy).text(leave.reason || 'Personal / Academic leave', 385, y + 74, { width: 155, height: 20, ellipsis: true });

  // Big Gate Clearance OTP Box
  y = 248;
  const isApproved = leave.overallStatus === 'APPROVED';
  const isVerified = Boolean(leave.securityVerified);

  doc.rect(46, y, 503, 80).fill(isVerified ? '#ecfdf5' : '#eef2ff')
    .strokeColor(isVerified ? emerald : indigo).lineWidth(1.5).stroke();

  doc.fillColor(isVerified ? emerald : indigo).fontSize(10).font('Helvetica-Bold')
    .text(isVerified ? '✓ EXIT AUTHORIZATION STAMPED BY SECURITY' : 'GATE CLEARANCE ONE-TIME VERIFICATION CODE', 56, y + 12);

  doc.font('Helvetica').fontSize(8).fillColor(slateMuted)
    .text('Present this 6-digit OTP to the security officer on duty at the campus gate checkpoint:', 56, y + 26);

  // OTP Display Box
  doc.rect(56, y + 40, 200, 30).fill('#ffffff').strokeColor(isVerified ? emerald : indigo).lineWidth(1).stroke();
  doc.fillColor(isVerified ? emerald : indigo).fontSize(16).font('Helvetica-Bold')
    .text(leave.otpCode || '982741', 56, y + 46, { align: 'center', width: 200, characterSpacing: 4 });

  // Status Badge on Right
  doc.rect(340, y + 40, 195, 30).fill(isVerified ? emerald : '#1e1b4b');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
    .text(isVerified ? 'VERIFIED AT GATE' : 'STATUS: APPROVED', 340, y + 48, { align: 'center', width: 195 });

  // Multi-Level Institutional Clearances
  y = 338;
  doc.fillColor(darkNavy).fontSize(9).font('Helvetica-Bold')
    .text('MULTI-LEVEL INSTITUTIONAL APPROVAL AUDIT', 46, y);

  y += 14;
  const colW = 120;
  const stages = [
    { title: '1. Faculty Mentor', status: leave.mentorStatus, remark: leave.mentorRemarks || (leave.mentorEmail ? leave.mentorEmail.split('@')[0] : 'Verified') },
    { title: '2. Parent / Guardian', status: leave.parentStatus, remark: leave.parentRemarks || 'Consent Verified' },
    { title: '3. Class Incharge', status: leave.classInchargeStatus, remark: leave.classInchargeRemarks || 'Academic Clear' },
    { title: '4. Head of Dept (HOD)', status: leave.hodStatus, remark: leave.hodRemarks || 'Final Sign-off' },
  ];

  stages.forEach((stage, idx) => {
    const x = 46 + idx * (colW + 7);
    const approved = stage.status === 'APPROVED';
    doc.rect(x, y, colW, 58).fill('#ffffff').strokeColor(approved ? '#a7f3d0' : borderGrey).lineWidth(0.5).stroke();
    doc.fillColor(slateMuted).fontSize(7.5).font('Helvetica-Bold').text(stage.title, x + 5, y + 7, { width: colW - 10 });
    doc.fillColor(approved ? emerald : '#b91c1c').fontSize(8.5).font('Helvetica-Bold')
      .text(approved ? '✓ APPROVED' : stage.status, x + 5, y + 22);
    doc.fillColor(slateMuted).fontSize(7).font('Helvetica')
      .text(stage.remark, x + 5, y + 36, { width: colW - 10, height: 18, ellipsis: true });
  });

  // Security Verification Stamping Details
  y = 422;
  doc.rect(46, y, 503, 62).fill(bgLight).strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fillColor(darkNavy).fontSize(8.5).font('Helvetica-Bold').text('GATE SECURITY EXIT RECORD', 56, y + 9);
  
  if (leave.securityVerified) {
    const verifiedDate = leave.securityVerifiedAt ? new Date(leave.securityVerifiedAt).toLocaleString() : 'Stamped';
    doc.fillColor(emerald).fontSize(8).font('Helvetica-Bold')
      .text(`Status: DEPARTED CAMPUS  •  Gate: ${leave.securityGate || 'Main Gate'}  •  Time: ${verifiedDate}`, 56, y + 24);
    doc.fillColor(slateDark).fontSize(7.5).font('Helvetica')
      .text(`Verifying Security Officer: ${leave.securityOfficerName || 'Duty In-Charge'}  (Digital System Stamp Applied)`, 56, y + 38);
  } else {
    doc.fillColor(slateMuted).fontSize(8).font('Helvetica')
      .text('Status: AWAITING GATE CHECKOUT  •  Gate checkpoint inspection required prior to physical departure.', 56, y + 24);
    doc.fillColor(slateDark).fontSize(7.5).font('Helvetica')
      .text('Officer must verify student ID and enter OTP in Security Terminal to authorize gate opening.', 56, y + 38);
  }

  // Institutional Signatures & Stamp Blocks
  y = 494;
  doc.rect(46, y, 160, 60).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('STUDENT SIGNATURE', 52, y + 6);
  doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text('(Sign upon exit)', 52, y + 46);

  doc.rect(217, y, 160, 60).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('FACULTY ADVISOR / HOD SIGN', 223, y + 6);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(emerald).text('DIGITALLY AUTHORIZED ✓', 223, y + 26);
  doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text('Digital Key Verified', 223, y + 46);

  doc.rect(389, y, 160, 60).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('GATE SECURITY STAMP', 395, y + 6);
  if (leave.securityVerified) {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(emerald).text('STAMPED & VERIFIED ✓', 395, y + 26);
    doc.fontSize(7).font('Helvetica').fillColor(slateMuted).text(leave.securityGate || 'Main Campus Gate', 395, y + 46);
  } else {
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text('[ Physical Security Seal ]', 395, y + 30);
  }

  // Perforated Cut Line for Counterfoil
  y = 566;
  doc.strokeColor('#94a3b8').lineWidth(1).dash(4, { space: 3 });
  doc.moveTo(46, y).lineTo(549, y).stroke();
  doc.undash();
  doc.fillColor(slateMuted).fontSize(7).font('Helvetica-Bold')
    .text('✂  TEAR HERE — GATE COUNTERFOIL (SECURITY ARCHIVE STUB)  ✂', 46, y + 4, { align: 'center', width: 503 });

  // Security Counterfoil Stub
  y = 582;
  doc.rect(46, y, 503, 210).fill('#f8fafc').strokeColor(borderGrey).lineWidth(0.5).stroke();

  doc.fillColor(darkNavy).fontSize(10).font('Helvetica-Bold')
    .text('GATE CHECKPOINT COUNTERFOIL — SECURITY RETENTION SLIP', 56, y + 10);
  doc.fontSize(7.5).font('Helvetica').fillColor(slateMuted)
    .text('To be detached and retained at security gate log upon student departure.', 56, y + 24);

  // Counterfoil Details Grid
  const cfY = y + 40;
  doc.rect(56, cfY, 483, 75).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(slateMuted).text('Pass ID:', 66, cfY + 10);
  doc.font('Helvetica-Bold').fillColor(darkNavy).text(leave.id, 120, cfY + 10);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Student Name:', 66, cfY + 26);
  doc.font('Helvetica-Bold').fillColor(darkNavy).text(leave.studentName, 120, cfY + 26);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Roll Number:', 66, cfY + 42);
  doc.font('Helvetica-Bold').fillColor(darkNavy).text(leave.studentRollNumber || 'N/A', 120, cfY + 42);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Department:', 66, cfY + 58);
  doc.font('Helvetica').fillColor(darkNavy).text(`${leave.department} (Yr ${leave.year || 3})`, 120, cfY + 58);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Leave Type:', 280, cfY + 10);
  doc.font('Helvetica').fillColor(darkNavy).text(leave.leaveType, 350, cfY + 10);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Leave Dates:', 280, cfY + 26);
  doc.font('Helvetica').fillColor(darkNavy).text(`${leave.fromDate} to ${leave.toDate}`, 350, cfY + 26);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Verified OTP:', 280, cfY + 42);
  doc.font('Helvetica-Bold').fillColor(indigo).text(leave.otpCode || 'N/A', 350, cfY + 42);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(slateMuted).text('Exit Status:', 280, cfY + 58);
  doc.font('Helvetica-Bold').fillColor(isVerified ? emerald : slateMuted)
    .text(isVerified ? 'VERIFIED & CLEARED' : 'APPROVED PENDING GATE DEPARTURE', 350, cfY + 58);

  // Counterfoil Signatures
  const cfSigY = y + 128;
  doc.rect(56, cfSigY, 150, 50).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('STUDENT SIGNATURE AT GATE', 62, cfSigY + 6);
  doc.fontSize(6.5).font('Helvetica').fillColor('#94a3b8').text('Sign before exit', 62, cfSigY + 36);

  doc.rect(222, cfSigY, 150, 50).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('SECURITY OFFICER SIGNATURE', 228, cfSigY + 6);
  if (leave.securityOfficerName) {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(darkNavy).text(leave.securityOfficerName, 228, cfSigY + 24);
  }
  doc.fontSize(6.5).font('Helvetica').fillColor('#94a3b8').text('Officer on Duty', 228, cfSigY + 36);

  doc.rect(389, cfSigY, 150, 50).fill('#ffffff').strokeColor(borderGrey).lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(slateMuted).text('OUT-TIME & DATE STAMP', 395, cfSigY + 6);
  if (leave.securityVerifiedAt) {
    doc.fontSize(7).font('Helvetica-Bold').fillColor(emerald)
      .text(new Date(leave.securityVerifiedAt).toLocaleTimeString(), 395, cfSigY + 22);
    doc.fontSize(6.5).font('Helvetica').fillColor(slateMuted)
      .text(new Date(leave.securityVerifiedAt).toLocaleDateString(), 395, cfSigY + 36);
  } else {
    doc.fontSize(6.5).font('Helvetica').fillColor('#94a3b8').text('Stamp upon student departure', 395, cfSigY + 36);
  }

  doc.end();
}
