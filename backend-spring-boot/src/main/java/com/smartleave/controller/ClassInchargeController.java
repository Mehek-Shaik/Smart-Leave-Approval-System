package com.smartleave.controller;

import com.smartleave.dto.ApprovalRequest;
import com.smartleave.entity.ClassIncharge;
import com.smartleave.entity.Leave;
import com.smartleave.repository.ClassInchargeRepository;
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
@RequestMapping("/classincharges")
@Tag(name = "Class Incharge Module", description = "Class Incharge review (Step 3: requires Mentor + Parent approved)")
@SecurityRequirement(name = "BearerAuth")
public class ClassInchargeController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private ClassInchargeRepository inchargeRepository;

    @Autowired
    private ApprovalService approvalService;

    @GetMapping("/leaves")
    @Operation(summary = "View assigned class section leave requests")
    public ResponseEntity<List<Leave>> getLeaves(Authentication authentication) {
        ClassIncharge incharge = inchargeRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Class Incharge not found"));

        return ResponseEntity.ok(leaveRepository.findByDepartmentAndYearAndSection(
                incharge.getDepartment(), incharge.getYear(), incharge.getSection()));
    }

    @PutMapping("/leaves/{leaveId}")
    @Operation(summary = "Approve or Reject leave (Class Incharge)")
    public ResponseEntity<?> processLeave(
            @PathVariable Long leaveId,
            @RequestBody ApprovalRequest request,
            Authentication authentication) {
        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.approveByClassIncharge(leaveId, authentication.getName(), request.getRemarks());
            return ResponseEntity.ok(leave);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            Leave leave = approvalService.rejectByClassIncharge(leaveId, authentication.getName(), request.getReason());
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.badRequest().body("Action must be APPROVE or REJECT");
    }
}
