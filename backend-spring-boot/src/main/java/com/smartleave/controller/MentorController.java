package com.smartleave.controller;

import com.smartleave.dto.ApprovalRequest;
import com.smartleave.entity.Leave;
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
@RequestMapping("/mentors")
@Tag(name = "Mentor Module", description = "Mentor leave review and approvals (Step 1)")
@SecurityRequirement(name = "BearerAuth")
public class MentorController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/leaves")
    @Operation(summary = "View assigned student leave requests")
    public ResponseEntity<List<Leave>> getAssignedLeaves(Authentication authentication) {
        String mentorEmail = authentication.getName();
        return ResponseEntity.ok(leaveRepository.findByMentorEmail(mentorEmail));
    }

    @PutMapping("/leaves/{leaveId}")
    @Operation(summary = "Approve or Reject leave (Mentor)")
    public ResponseEntity<?> processLeave(
            @PathVariable Long leaveId,
            @RequestBody ApprovalRequest request,
            Authentication authentication) {
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.approveByMentor(leaveId, authentication.getName(), request.getRemarks());
            return ResponseEntity.ok(leave);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.rejectByMentor(leaveId, authentication.getName(), request.getReason());
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.badRequest().body("Action must be APPROVE or REJECT");
    }
}
