package com.smartleave.service;

import com.smartleave.entity.ApprovalStatus;
import com.smartleave.entity.Leave;
import com.smartleave.entity.OTP;
import com.smartleave.repository.LeaveRepository;
import com.smartleave.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Transactional
public class ApprovalService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private OTPRepository otpRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public Leave approveByMentor(Long leaveId, String mentorEmail, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        if (leave.getOverallStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Cannot approve leave. Current status: " + leave.getOverallStatus());
        }

        if (leave.getMentorStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Mentor status already finalized as: " + leave.getMentorStatus());
        }

        leave.setMentorStatus(ApprovalStatus.APPROVED);
        leave.setMentorRemarks(remarks != null ? remarks : "Approved by Mentor");
        leave.setMentorActionAt(LocalDateTime.now());
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave rejectByMentor(Long leaveId, String mentorEmail, String reason) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        leave.setMentorStatus(ApprovalStatus.REJECTED);
        leave.setMentorRemarks(reason);
        leave.setMentorActionAt(LocalDateTime.now());
        leave.setOverallStatus(ApprovalStatus.REJECTED);
        leave.setRejectionReason("Rejected by Mentor: " + reason);
        leave.setRejectedBy("Mentor");
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave approveByParent(Long leaveId, String parentEmail, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        // Workflow Validation: Mentor must approve first
        if (leave.getMentorStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Invalid approval sequence: Mentor approval is required before Parent approval.");
        }

        if (leave.getParentStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Parent status already recorded as: " + leave.getParentStatus());
        }

        leave.setParentStatus(ApprovalStatus.APPROVED);
        leave.setParentRemarks(remarks != null ? remarks : "Approved by Parent");
        leave.setParentActionAt(LocalDateTime.now());
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave rejectByParent(Long leaveId, String parentEmail, String reason) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        if (leave.getMentorStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Mentor must approve before Parent decision.");
        }

        leave.setParentStatus(ApprovalStatus.REJECTED);
        leave.setParentRemarks(reason);
        leave.setParentActionAt(LocalDateTime.now());
        leave.setOverallStatus(ApprovalStatus.REJECTED);
        leave.setRejectionReason("Rejected by Parent: " + reason);
        leave.setRejectedBy("Parent");
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave approveByClassIncharge(Long leaveId, String inchargeEmail, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        // Workflow Validation: Mentor + Parent must approve first
        if (leave.getMentorStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Mentor approval required before Class Incharge.");
        }
        if (leave.getParentStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Parent consent required before Class Incharge approval.");
        }

        leave.setClassInchargeStatus(ApprovalStatus.APPROVED);
        leave.setClassInchargeRemarks(remarks != null ? remarks : "Approved by Class Incharge");
        leave.setClassInchargeActionAt(LocalDateTime.now());
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave rejectByClassIncharge(Long leaveId, String inchargeEmail, String reason) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        leave.setClassInchargeStatus(ApprovalStatus.REJECTED);
        leave.setClassInchargeRemarks(reason);
        leave.setClassInchargeActionAt(LocalDateTime.now());
        leave.setOverallStatus(ApprovalStatus.REJECTED);
        leave.setRejectionReason("Rejected by Class Incharge: " + reason);
        leave.setRejectedBy("Class Incharge");
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave approveByHod(Long leaveId, String hodEmail, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        // Strict verification of all preceding stages
        if (leave.getMentorStatus() != ApprovalStatus.APPROVED ||
            leave.getParentStatus() != ApprovalStatus.APPROVED ||
            leave.getClassInchargeStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Cannot grant HOD approval. Prior levels (Mentor, Parent, Class Incharge) must all be APPROVED.");
        }

        // Generate 6 digit numeric OTP
        int otpInt = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(otpInt);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(24);

        leave.setHodStatus(ApprovalStatus.APPROVED);
        leave.setHodRemarks(remarks != null ? remarks : "Final approval granted by Head of Department");
        leave.setHodActionAt(now);
        leave.setOverallStatus(ApprovalStatus.APPROVED);
        leave.setOtpCode(otpCode);
        leave.setOtpGeneratedAt(now);
        leave.setOtpExpiresAt(expiresAt);
        leave.setUpdatedAt(now);

        OTP otp = new OTP(leave.getId(), otpCode, now, expiresAt);
        otpRepository.save(otp);

        return leaveRepository.save(leave);
    }

    public Leave rejectByHod(Long leaveId, String hodEmail, String reason) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found with ID: " + leaveId));

        leave.setHodStatus(ApprovalStatus.REJECTED);
        leave.setHodRemarks(reason);
        leave.setHodActionAt(LocalDateTime.now());
        leave.setOverallStatus(ApprovalStatus.REJECTED);
        leave.setRejectionReason("Rejected by HOD: " + reason);
        leave.setRejectedBy("HOD");
        leave.setUpdatedAt(LocalDateTime.now());

        return leaveRepository.save(leave);
    }

    public Leave verifySecurityOTP(String otpCode, String queryIdentifier, String gateNumber, String officerName) {
        Leave leave = leaveRepository.findByOtpCode(otpCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP. No matching approved leave found."));

        if (leave.getOverallStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Leave is not in APPROVED state.");
        }

        if (Boolean.TRUE.equals(leave.getSecurityVerified())) {
            throw new IllegalStateException("OTP has already been verified and consumed. Out-pass cannot be reused.");
        }

        if (leave.getOtpExpiresAt() != null && LocalDateTime.now().isAfter(leave.getOtpExpiresAt())) {
            throw new IllegalStateException("OTP has expired.");
        }

        leave.setSecurityVerified(true);
        leave.setSecurityVerifiedAt(LocalDateTime.now());
        leave.setSecurityGate(gateNumber != null ? gateNumber : "Main Gate");
        leave.setSecurityOfficerName(officerName != null ? officerName : "Duty Officer");
        leave.setUpdatedAt(LocalDateTime.now());

        otpRepository.findByOtpCode(otpCode).ifPresent(otp -> {
            otp.setVerified(true);
            otp.setVerifiedAt(LocalDateTime.now());
            otpRepository.save(otp);
        });

        return leaveRepository.save(leave);
    }
}
