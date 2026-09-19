package com.smartleave.controller;

import com.smartleave.entity.ApprovalStatus;
import com.smartleave.entity.Leave;
import com.smartleave.repository.*;
import com.smartleave.service.AdminDataService;
import com.smartleave.service.PdfExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin Module", description = "System oversight, analytics and audit logs")
@SecurityRequirement(name = "BearerAuth")
public class AdminController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MentorRepository mentorRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private ClassInchargeRepository classInchargeRepository;

    @Autowired
    private HODRepository hodRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AdminDataService adminDataService;

    @Autowired
    private PdfExportService pdfExportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get system statistics dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Leave> allLeaves = leaveRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalMentors", mentorRepository.count());
        stats.put("totalParents", parentRepository.count());
        stats.put("totalClassIncharges", classInchargeRepository.count());
        stats.put("totalHods", hodRepository.count());
        stats.put("totalLeaves", allLeaves.size());
        stats.put("pendingLeaves", allLeaves.stream().filter(l -> l.getOverallStatus() == ApprovalStatus.PENDING).count());
        stats.put("approvedLeaves", allLeaves.stream().filter(l -> l.getOverallStatus() == ApprovalStatus.APPROVED).count());
        stats.put("rejectedLeaves", allLeaves.stream().filter(l -> l.getOverallStatus() == ApprovalStatus.REJECTED).count());
        stats.put("cancelledLeaves", allLeaves.stream().filter(l -> l.getOverallStatus() == ApprovalStatus.CANCELLED).count());
        stats.put("securityVerifiedLeaves", allLeaves.stream().filter(l -> Boolean.TRUE.equals(l.getSecurityVerified())).count());

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("recentLeaves", allLeaves.stream().limit(10).toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaves")
    @Operation(summary = "View all leaves across the college")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveRepository.findAll());
    }

    @DeleteMapping("/data/clear")
    @Operation(summary = "Clear existing application/demo records (Admin only)")
    public ResponseEntity<Map<String, String>> clearData() {
        adminDataService.clearExistingData();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Existing data cleared successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/data/demo")
    @Operation(summary = "Populate consistent demo data with full workflow (Admin only)")
    public ResponseEntity<Map<String, Object>> loadDemoData() {
        Map<String, Object> response = adminDataService.loadDemoData();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaves/export/pdf")
    @Operation(summary = "Export college leave history report as PDF (Admin only)")
    public ResponseEntity<byte[]> exportLeaveHistoryPdf() {
        List<Leave> allLeaves = leaveRepository.findAll();
        byte[] pdfBytes = pdfExportService.generateLeaveHistoryPdf(allLeaves);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Leave_History_Report.pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/leaves/pdf")
    @Operation(summary = "Alias to download leave history report as PDF (Admin only)")
    public ResponseEntity<byte[]> downloadPdfAlias() {
        return exportLeaveHistoryPdf();
    }
}
