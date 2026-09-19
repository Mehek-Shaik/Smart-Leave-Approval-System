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
@RequestMapping("/parents")
@Tag(name = "Parent Module", description = "Parental consent and review (Step 2: requires Mentor approved)")
@SecurityRequirement(name = "BearerAuth")
public class ParentController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/leaves")
    @Operation(summary = "View child's leave requests")
    public ResponseEntity<List<Leave>> getChildLeaves(Authentication authentication) {
        return ResponseEntity.ok(leaveRepository.findByParentEmail(authentication.getName()));
    }

    @PutMapping("/leaves/{leaveId}")
    @Operation(summary = "Approve or Reject leave (Parent)")
    public ResponseEntity<?> processLeave(
            @PathVariable Long leaveId,
            @RequestBody ApprovalRequest request,
            Authentication authentication) {
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.approveByParent(leaveId, authentication.getName(), request.getRemarks());
            return ResponseEntity.ok(leave);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.rejectByParent(leaveId, authentication.getName(), request.getReason());
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.badRequest().body("Action must be APPROVE or REJECT");
    }
}
