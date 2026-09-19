package com.smartleave.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String leaveCode; // e.g. LV-2026-001

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String studentRollNumber;

    @Column(nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String section;

    private String phoneNumber;
    private String mentorEmail;
    private String parentEmail;

    @Column(nullable = false)
    private String leaveType;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate toDate;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus mentorStatus = ApprovalStatus.PENDING;
    private String mentorRemarks;
    private LocalDateTime mentorActionAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus parentStatus = ApprovalStatus.PENDING;
    private String parentRemarks;
    private LocalDateTime parentActionAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus classInchargeStatus = ApprovalStatus.PENDING;
    private String classInchargeRemarks;
    private LocalDateTime classInchargeActionAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus hodStatus = ApprovalStatus.PENDING;
    private String hodRemarks;
    private LocalDateTime hodActionAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus overallStatus = ApprovalStatus.PENDING;

    private String rejectionReason;
    private String rejectedBy;

    private String otpCode;
    private LocalDateTime otpGeneratedAt;
    private LocalDateTime otpExpiresAt;

    private Boolean securityVerified = false;
    private LocalDateTime securityVerifiedAt;
    private String securityGate;
    private String securityOfficerName;

    private Boolean cancelled = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Leave() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLeaveCode() { return leaveCode; }
    public void setLeaveCode(String leaveCode) { this.leaveCode = leaveCode; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public ApprovalStatus getMentorStatus() { return mentorStatus; }
    public void setMentorStatus(ApprovalStatus mentorStatus) { this.mentorStatus = mentorStatus; }

    public String getMentorRemarks() { return mentorRemarks; }
    public void setMentorRemarks(String mentorRemarks) { this.mentorRemarks = mentorRemarks; }

    public LocalDateTime getMentorActionAt() { return mentorActionAt; }
    public void setMentorActionAt(LocalDateTime mentorActionAt) { this.mentorActionAt = mentorActionAt; }

    public ApprovalStatus getParentStatus() { return parentStatus; }
    public void setParentStatus(ApprovalStatus parentStatus) { this.parentStatus = parentStatus; }

    public String getParentRemarks() { return parentRemarks; }
    public void setParentRemarks(String parentRemarks) { this.parentRemarks = parentRemarks; }

    public LocalDateTime getParentActionAt() { return parentActionAt; }
    public void setParentActionAt(LocalDateTime parentActionAt) { this.parentActionAt = parentActionAt; }

    public ApprovalStatus getClassInchargeStatus() { return classInchargeStatus; }
    public void setClassInchargeStatus(ApprovalStatus classInchargeStatus) { this.classInchargeStatus = classInchargeStatus; }

    public String getClassInchargeRemarks() { return classInchargeRemarks; }
    public void setClassInchargeRemarks(String classInchargeRemarks) { this.classInchargeRemarks = classInchargeRemarks; }

    public LocalDateTime getClassInchargeActionAt() { return classInchargeActionAt; }
    public void setClassInchargeActionAt(LocalDateTime classInchargeActionAt) { this.classInchargeActionAt = classInchargeActionAt; }

    public ApprovalStatus getHodStatus() { return hodStatus; }
    public void setHodStatus(ApprovalStatus hodStatus) { this.hodStatus = hodStatus; }

    public String getHodRemarks() { return hodRemarks; }
    public void setHodRemarks(String hodRemarks) { this.hodRemarks = hodRemarks; }

    public LocalDateTime getHodActionAt() { return hodActionAt; }
    public void setHodActionAt(LocalDateTime hodActionAt) { this.hodActionAt = hodActionAt; }

    public ApprovalStatus getOverallStatus() { return overallStatus; }
    public void setOverallStatus(ApprovalStatus overallStatus) { this.overallStatus = overallStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getOtpGeneratedAt() { return otpGeneratedAt; }
    public void setOtpGeneratedAt(LocalDateTime otpGeneratedAt) { this.otpGeneratedAt = otpGeneratedAt; }

    public LocalDateTime getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(LocalDateTime otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }

    public Boolean getSecurityVerified() { return securityVerified; }
    public void setSecurityVerified(Boolean securityVerified) { this.securityVerified = securityVerified; }

    public LocalDateTime getSecurityVerifiedAt() { return securityVerifiedAt; }
    public void setSecurityVerifiedAt(LocalDateTime securityVerifiedAt) { this.securityVerifiedAt = securityVerifiedAt; }

    public String getSecurityGate() { return securityGate; }
    public void setSecurityGate(String securityGate) { this.securityGate = securityGate; }

    public String getSecurityOfficerName() { return securityOfficerName; }
    public void setSecurityOfficerName(String securityOfficerName) { this.securityOfficerName = securityOfficerName; }

    public Boolean getCancelled() { return cancelled; }
    public void setCancelled(Boolean cancelled) { this.cancelled = cancelled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
