package com.smartleave.controller;

import com.smartleave.dto.OTPVerifyRequest;
import com.smartleave.entity.ApprovalStatus;
import com.smartleave.entity.Leave;
import com.smartleave.repository.LeaveRepository;
import com.smartleave.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/security")
@Tag(name = "Security Gate Module", description = "Gate terminal OTP verification and student out-pass clearance")
@SecurityRequirement(name = "BearerAuth")
public class SecurityController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/approved-leaves")
    @Operation(summary = "View all finalized approved leaves ready for gate clearance")
    public ResponseEntity<List<Leave>> getApprovedLeaves() {
        return ResponseEntity.ok(leaveRepository.findByOverallStatus(ApprovalStatus.APPROVED));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP entered by student at campus gate")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody OTPVerifyRequest request, Authentication authentication) {
        String officerName = authentication != null ? authentication.getName() : "Gate Officer";
        Leave verifiedLeave = approvalService.verifySecurityOTP(
                request.getOtpCode(),
                request.getQueryIdentifier(),
                request.getGateNumber() != null ? request.getGateNumber() : "Campus Main Gate 1",
                officerName
        );
        return ResponseEntity.ok(verifiedLeave);
    }
}
