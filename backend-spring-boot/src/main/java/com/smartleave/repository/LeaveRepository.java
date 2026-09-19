package com.smartleave.repository;

import com.smartleave.entity.Leave;
import com.smartleave.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    Optional<Leave> findByLeaveCode(String leaveCode);
    List<Leave> findByStudentEmail(String studentEmail);
    List<Leave> findByStudentRollNumber(String rollNumber);
    List<Leave> findByMentorEmail(String mentorEmail);
    List<Leave> findByParentEmail(String parentEmail);
    List<Leave> findByDepartmentAndYearAndSection(String department, Integer year, String section);
    List<Leave> findByDepartment(String department);
    List<Leave> findByOverallStatus(ApprovalStatus status);
    Optional<Leave> findByOtpCode(String otpCode);
}
