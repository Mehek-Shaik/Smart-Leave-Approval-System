package com.smartleave.controller;

import com.smartleave.dto.LeaveApplyRequest;
import com.smartleave.entity.ApprovalStatus;
import com.smartleave.entity.Leave;
import com.smartleave.entity.Student;
import com.smartleave.repository.LeaveRepository;
import com.smartleave.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/leave")
@Tag(name = "Leave Management", description = "Student leave applications and workflow tracking")
@SecurityRequirement(name = "BearerAuth")
public class LeaveController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/apply")
    @Operation(summary = "Apply for leave (Student)")
    public ResponseEntity<?> applyLeave(@Valid @RequestBody LeaveApplyRequest request, Authentication authentication) {
        if (request.getFromDate().isAfter(request.getToDate())) {
            return ResponseEntity.badRequest().body("fromDate cannot be after toDate");
        }

        String studentEmail = authentication.getName();
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Leave leave = new Leave();
        leave.setLeaveCode("LV-" + System.currentTimeMillis() % 100000);
        leave.setStudentId(student.getId());
        leave.setStudentName(student.getStudentName());
        leave.setStudentRollNumber(student.getRollNumber());
        leave.setStudentEmail(student.getEmail());
        leave.setDepartment(student.getDepartment());
        leave.setYear(student.getYear());
        leave.setSection(student.getSection());
        leave.setPhoneNumber(student.getPhoneNumber());
        leave.setMentorEmail(student.getMentorEmail());
        leave.setParentEmail(student.getParentEmail());
        leave.setLeaveType(request.getLeaveType());
        leave.setFromDate(request.getFromDate());
        leave.setToDate(request.getToDate());
        leave.setReason(request.getReason());
        leave.setAppliedAt(LocalDateTime.now());
        leave.setOverallStatus(ApprovalStatus.PENDING);

        Leave saved = leaveRepository.save(leave);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/my-leaves")
    @Operation(summary = "View student's leave requests")
    public ResponseEntity<List<Leave>> getMyLeaves(Authentication authentication) {
        String studentEmail = authentication.getName();
        List<Leave> leaves = leaveRepository.findByStudentEmail(studentEmail);
        return ResponseEntity.ok(leaves);
    }

    @DeleteMapping("/{leaveId}")
    @Operation(summary = "Cancel a leave request before final approval")
    public ResponseEntity<?> cancelLeave(@PathVariable Long leaveId, Authentication authentication) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found"));

        if (!leave.getStudentEmail().equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized to cancel this leave");
        }

        if (leave.getOverallStatus() == ApprovalStatus.APPROVED) {
            return ResponseEntity.badRequest().body("Cannot cancel after final approval has been granted");
        }

        leave.setCancelled(true);
        leave.setOverallStatus(ApprovalStatus.CANCELLED);
        leave.setUpdatedAt(LocalDateTime.now());
        leaveRepository.save(leave);

        return ResponseEntity.ok("Leave cancelled successfully");
    }
}
