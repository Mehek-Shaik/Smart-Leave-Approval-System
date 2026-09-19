import { Database, LeaveEntity, OTPEntity } from './db.js';

export class ApprovalService {
  // 1. Mentor Approval (Step 1)
  static approveByMentor(leaveId: string, mentorEmail: string, remarks?: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) {
      throw new Error(`Leave application '${leaveId}' not found.`);
    }

    if (leave.cancelled) {
      throw new Error('This leave request has been cancelled by the student.');
    }

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot approve leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (leave.mentorStatus !== 'PENDING') {
      throw new Error(`Mentor status has already been recorded as ${leave.mentorStatus}. Duplicate approval is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.mentorStatus = 'APPROVED';
    leave.mentorRemarks = remarks || 'Approved by Mentor';
    leave.mentorActionAt = now;
    leave.updatedAt = now;

    Database.save();
    return leave;
  }

  static rejectByMentor(leaveId: string, mentorEmail: string, reason: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) {
      throw new Error('This leave request has been cancelled by the student.');
    }

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot reject leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (leave.mentorStatus !== 'PENDING') {
      throw new Error(`Mentor status has already been recorded as ${leave.mentorStatus}. Duplicate action is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.mentorStatus = 'REJECTED';
    leave.mentorRemarks = reason;
    leave.mentorActionAt = now;
    leave.overallStatus = 'REJECTED';
    leave.rejectionReason = `Rejected by Mentor: ${reason}`;
    leave.rejectedBy = 'Mentor';
    leave.otpCode = undefined;
    leave.otpGeneratedAt = undefined;
    leave.otpExpiresAt = undefined;
    leave.updatedAt = now;

    // Remove any OTP if present
    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    Database.save();
    return leave;
  }

  // 2. Parent Approval (Step 2 - Must be Mentor Approved first)
  static approveByParent(leaveId: string, parentEmail: string, remarks?: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) {
      throw new Error('This leave request has been cancelled by the student.');
    }

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot approve leave. Current overall status is ${leave.overallStatus}.`);
    }

    // Sequence check: Mentor MUST be approved first!
    if (leave.mentorStatus !== 'APPROVED') {
      throw new Error(
        `Invalid approval sequence: Mentor approval is required before Parent approval can proceed. Current mentor status: ${leave.mentorStatus}.`
      );
    }

    if (leave.parentStatus !== 'PENDING') {
      throw new Error(`Parent status has already been recorded as ${leave.parentStatus}. Duplicate approval is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.parentStatus = 'APPROVED';
    leave.parentRemarks = remarks || 'Parent consented & approved';
    leave.parentActionAt = now;
    leave.updatedAt = now;

    Database.save();
    return leave;
  }

  static rejectByParent(leaveId: string, parentEmail: string, reason: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) {
      throw new Error('This leave request has been cancelled by the student.');
    }

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot reject leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (leave.mentorStatus !== 'APPROVED') {
      throw new Error(
        `Invalid approval sequence: Mentor approval is required before Parent approval/rejection. Current mentor status: ${leave.mentorStatus}.`
      );
    }

    if (leave.parentStatus !== 'PENDING') {
      throw new Error(`Parent status has already been recorded as ${leave.parentStatus}. Duplicate action is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.parentStatus = 'REJECTED';
    leave.parentRemarks = reason;
    leave.parentActionAt = now;
    leave.overallStatus = 'REJECTED';
    leave.rejectionReason = `Rejected by Parent: ${reason}`;
    leave.rejectedBy = 'Parent';
    leave.otpCode = undefined;
    leave.otpGeneratedAt = undefined;
    leave.otpExpiresAt = undefined;
    leave.updatedAt = now;

    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    Database.save();
    return leave;
  }

  // 3. Class Incharge Approval (Step 3 - Must be Mentor + Parent Approved)
  static approveByClassIncharge(leaveId: string, inchargeEmail: string, remarks?: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) throw new Error('This leave request has been cancelled by the student.');

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot approve leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (leave.mentorStatus !== 'APPROVED') {
      throw new Error(`Invalid approval sequence: Mentor must approve this leave first. Current mentor status: ${leave.mentorStatus}.`);
    }

    if (leave.parentStatus !== 'APPROVED') {
      throw new Error(
        `Invalid approval sequence: Parent must approve before Class Incharge. Current parent status: ${leave.parentStatus}.`
      );
    }

    if (leave.classInchargeStatus !== 'PENDING') {
      throw new Error(`Class Incharge status has already been recorded as ${leave.classInchargeStatus}. Duplicate approval is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.classInchargeStatus = 'APPROVED';
    leave.classInchargeRemarks = remarks || 'Approved by Class Incharge';
    leave.classInchargeActionAt = now;
    leave.updatedAt = now;

    Database.save();
    return leave;
  }

  static rejectByClassIncharge(leaveId: string, inchargeEmail: string, reason: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) throw new Error('This leave request has been cancelled by the student.');

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot reject leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (leave.mentorStatus !== 'APPROVED' || leave.parentStatus !== 'APPROVED') {
      throw new Error('Invalid workflow: Both Mentor and Parent must approve before Class Incharge can act.');
    }

    if (leave.classInchargeStatus !== 'PENDING') {
      throw new Error(`Class Incharge status has already been recorded as ${leave.classInchargeStatus}. Duplicate action is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.classInchargeStatus = 'REJECTED';
    leave.classInchargeRemarks = reason;
    leave.classInchargeActionAt = now;
    leave.overallStatus = 'REJECTED';
    leave.rejectionReason = `Rejected by Class Incharge: ${reason}`;
    leave.rejectedBy = 'Class Incharge';
    leave.otpCode = undefined;
    leave.otpGeneratedAt = undefined;
    leave.otpExpiresAt = undefined;
    leave.updatedAt = now;

    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    Database.save();
    return leave;
  }

  // 4. HOD Approval (Step 4 - Must be Mentor + Parent + Class Incharge Approved)
  // Generates 6-digit OTP and sets overall status to APPROVED
  static approveByHod(leaveId: string, hodEmail: string, remarks?: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) throw new Error('This leave request has been cancelled by the student.');

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot approve leave. Current overall status is ${leave.overallStatus}.`);
    }

    // Strict sequential workflow: Mentor + Parent + Class Incharge must all be APPROVED
    if (leave.mentorStatus !== 'APPROVED') {
      throw new Error(`Invalid approval sequence: Mentor approval is missing. Current mentor status: ${leave.mentorStatus}.`);
    }
    if (leave.parentStatus !== 'APPROVED') {
      throw new Error(`Invalid approval sequence: Parent approval is missing. Current parent status: ${leave.parentStatus}.`);
    }
    if (leave.classInchargeStatus !== 'APPROVED') {
      throw new Error(`Invalid approval sequence: Class Incharge approval is missing. Current class incharge status: ${leave.classInchargeStatus}.`);
    }

    if (leave.hodStatus !== 'PENDING') {
      throw new Error(`HOD status has already been recorded as ${leave.hodStatus}. Duplicate approval is prohibited.`);
    }

    // Generate secure 6-digit OTP and 24-hour expiration window
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity

    leave.hodStatus = 'APPROVED';
    leave.hodRemarks = remarks || 'Final approval granted by Head of Department';
    leave.hodActionAt = now.toISOString();
    leave.overallStatus = 'APPROVED';
    leave.otpCode = generatedOtp;
    leave.otpGeneratedAt = now.toISOString();
    leave.otpExpiresAt = expiresAt.toISOString();
    leave.securityVerified = false;
    leave.securityVerifiedAt = undefined;
    leave.securityGate = undefined;
    leave.securityOfficerName = undefined;
    leave.updatedAt = now.toISOString();

    // Remove any previous OTP for this leave to prevent conflicts
    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    // Store in OTP entity
    const otpRecord: OTPEntity = {
      id: `otp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      leaveId: leave.id,
      otpCode: generatedOtp,
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      verified: false,
      attempts: 0,
    };
    Database.db.otps.push(otpRecord);

    Database.save();
    return leave;
  }

  static rejectByHod(leaveId: string, hodEmail: string, reason: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.cancelled) throw new Error('This leave request has been cancelled by the student.');

    if (leave.overallStatus !== 'PENDING') {
      throw new Error(`Cannot reject leave. Current overall status is ${leave.overallStatus}.`);
    }

    if (
      leave.mentorStatus !== 'APPROVED' ||
      leave.parentStatus !== 'APPROVED' ||
      leave.classInchargeStatus !== 'APPROVED'
    ) {
      throw new Error('Invalid workflow: Prior levels (Mentor, Parent, Class Incharge) must all approve before HOD decision.');
    }

    if (leave.hodStatus !== 'PENDING') {
      throw new Error(`HOD status has already been recorded as ${leave.hodStatus}. Duplicate action is prohibited.`);
    }

    const now = new Date().toISOString();
    leave.hodStatus = 'REJECTED';
    leave.hodRemarks = reason;
    leave.hodActionAt = now;
    leave.overallStatus = 'REJECTED';
    leave.rejectionReason = `Rejected by HOD: ${reason}`;
    leave.rejectedBy = 'HOD';
    leave.otpCode = undefined;
    leave.otpGeneratedAt = undefined;
    leave.otpExpiresAt = undefined;
    leave.updatedAt = now;

    // Ensure no OTP exists for rejected leave
    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    Database.save();
    return leave;
  }

  // 5. Cancel Leave (By student, only before final HOD approval)
  static cancelLeave(leaveId: string, studentEmail: string): LeaveEntity {
    const leave = Database.db.leaves.find(l => l.id === leaveId);
    if (!leave) throw new Error(`Leave application '${leaveId}' not found.`);

    if (leave.studentEmail.toLowerCase() !== studentEmail.toLowerCase()) {
      throw new Error('Unauthorized: You can only cancel your own leave requests.');
    }

    if (leave.overallStatus === 'APPROVED') {
      throw new Error('Cannot cancel leave: Final approval has already been granted by HOD.');
    }

    if (leave.overallStatus === 'REJECTED') {
      throw new Error('Cannot cancel leave: Application is already rejected.');
    }

    if (leave.cancelled) {
      throw new Error('Leave application is already cancelled.');
    }

    const now = new Date().toISOString();
    leave.cancelled = true;
    leave.overallStatus = 'CANCELLED';
    leave.otpCode = undefined;
    leave.otpGeneratedAt = undefined;
    leave.otpExpiresAt = undefined;
    leave.updatedAt = now;

    Database.db.otps = Database.db.otps.filter(o => o.leaveId !== leave.id);

    Database.save();
    return leave;
  }

  // 6. Security Gate OTP Verification
  static verifySecurityOTP(
    otpCode: string,
    queryIdentifier?: string, // optional leaveId or rollNumber
    gateNumber: string = 'Campus Main Gate 1',
    officerName: string = 'Security Officer'
  ): { success: boolean; message: string; leave: LeaveEntity; verifiedAt: string } {
    const cleanCode = (otpCode || '').trim();
    if (!cleanCode || !/^\d{6}$/.test(cleanCode)) {
      throw new Error('Invalid OTP format. OTP must be a 6-digit numeric code.');
    }

    let leave: LeaveEntity | undefined;

    // If queryIdentifier is provided (student roll number or leave ID), look up that specific leave
    if (queryIdentifier && queryIdentifier.trim()) {
      const q = queryIdentifier.trim().toLowerCase();
      leave = Database.db.leaves.find(
        l => l.id.toLowerCase() === q || l.studentRollNumber.toLowerCase() === q
      );

      if (!leave) {
        throw new Error(`No leave application found matching student roll number or leave ID '${queryIdentifier}'.`);
      }

      if (leave.cancelled) {
        throw new Error('Leave application has been cancelled by the student. Campus departure unauthorized.');
      }

      if (leave.overallStatus !== 'APPROVED') {
        throw new Error(
          `Leave status is ${leave.overallStatus}. Only fully APPROVED leaves can be verified for campus departure.`
        );
      }

      if (!leave.otpCode) {
        throw new Error('No active OTP pass exists for this leave application.');
      }

      if (leave.otpCode !== cleanCode) {
        // Track failed attempt on OTP record
        const otpRecord = Database.db.otps.find(o => o.leaveId === leave!.id);
        if (otpRecord) {
          otpRecord.attempts = (otpRecord.attempts || 0) + 1;
          Database.save();
        }
        throw new Error('Invalid OTP code. The entered code does not match the student clearance pass.');
      }
    } else {
      // Find matching leave by OTP code directly
      leave = Database.db.leaves.find(l => l.otpCode === cleanCode);

      if (!leave) {
        throw new Error('Invalid OTP code. No matching approved leave pass found.');
      }

      if (leave.cancelled) {
        throw new Error('Leave application has been cancelled. Campus departure unauthorized.');
      }

      if (leave.overallStatus !== 'APPROVED') {
        throw new Error(
          `Leave status is ${leave.overallStatus}. Only fully APPROVED leaves can be verified for campus departure.`
        );
      }
    }

    // Check if already verified (prevent reuse!)
    if (leave.securityVerified) {
      const verifiedDateStr = leave.securityVerifiedAt ? new Date(leave.securityVerifiedAt).toLocaleString() : 'earlier';
      const gateStr = leave.securityGate || 'Campus Gate';
      throw new Error(
        `OTP has already been verified on ${verifiedDateStr} at ${gateStr}. An OTP cannot be reused.`
      );
    }

    // Check expiration
    const expiryTime = new Date(leave.otpExpiresAt || '').getTime();
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      const expiryStr = !isNaN(expiryTime) ? new Date(expiryTime).toLocaleString() : 'unknown';
      throw new Error(`OTP expired on ${expiryStr}. Student must obtain a new clearance pass.`);
    }

    // Mark leave and OTP record as verified atomically
    const nowIso = new Date().toISOString();
    leave.securityVerified = true;
    leave.securityVerifiedAt = nowIso;
    leave.securityGate = gateNumber;
    leave.securityOfficerName = officerName;
    leave.updatedAt = nowIso;

    let otpRecord = Database.db.otps.find(o => o.leaveId === leave!.id && o.otpCode === cleanCode);
    if (otpRecord) {
      otpRecord.verified = true;
      otpRecord.verifiedAt = nowIso;
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    } else {
      otpRecord = {
        id: `otp-${Date.now()}`,
        leaveId: leave.id,
        otpCode: cleanCode,
        generatedAt: leave.otpGeneratedAt || nowIso,
        expiresAt: leave.otpExpiresAt || nowIso,
        verified: true,
        verifiedAt: nowIso,
        attempts: 1,
      };
      Database.db.otps.push(otpRecord);
    }

    Database.save();

    return {
      success: true,
      message: 'OTP verified successfully. Student is authorized to leave campus.',
      leave,
      verifiedAt: nowIso,
    };
  }
}

