package com.smartleave.controller;

import com.smartleave.dto.ApprovalRequest;
import com.smartleave.entity.HOD;
import com.smartleave.entity.Leave;
import com.smartleave.repository.HODRepository;
import com.smartleave.repository.LeaveRepository;
import com.smartleave.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hods")
@Tag(name = "HOD Module", description = "Final HOD approval triggering automatic OTP generation (Step 4)")
@SecurityRequirement(name = "BearerAuth")
public class HODController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private HODRepository hodRepository;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/leaves")
    @Operation(summary = "View department leave requests")
    public ResponseEntity<List<Leave>> getDepartmentLeaves(Authentication authentication) {
        HOD hod = hodRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("HOD not found"));

        return ResponseEntity.ok(leaveRepository.findByDepartment(hod.getDepartment()));
    }

    @PutMapping("/leaves/{leaveId}")
    @Operation(summary = "Approve or Reject leave (HOD: Generates OTP on approval)")
    public ResponseEntity<?> processLeave(
            @PathVariable Long leaveId,
            @RequestBody ApprovalRequest request,
            Authentication authentication) {
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.approveByHod(leaveId, authentication.getName(), request.getRemarks());
            return ResponseEntity.ok(leave);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.rejectByHod(leaveId, authentication.getName(), request.getReason());
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.badRequest().body("Action must be APPROVE or REJECT");
    }
}
