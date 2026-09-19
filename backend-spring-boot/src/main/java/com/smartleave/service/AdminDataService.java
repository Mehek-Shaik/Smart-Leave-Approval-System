package com.smartleave.service;

import com.smartleave.entity.*;
import com.smartleave.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminDataService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private OTPRepository otpRepository;

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
    private SecurityRepository securityRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void clearExistingData() {
        otpRepository.deleteAll();
        leaveRepository.deleteAll();
        studentRepository.deleteAll();
        mentorRepository.deleteAll();
        parentRepository.deleteAll();
        classInchargeRepository.deleteAll();
        hodRepository.deleteAll();
        securityRepository.deleteAll();
        // Preserves admin accounts in adminRepository!
    }

    @Transactional
    public Map<String, Object> loadDemoData() {
        clearExistingData();

        String encodedPassword = passwordEncoder.encode("password123");

        // 1. Mentors (2)
        Mentor mentor1 = new Mentor();
        mentor1.setMentorName("Dr. Priya Sharma");
        mentor1.setEmail("dr.sharma@college.edu");
        mentor1.setPassword(encodedPassword);
        mentor1.setDepartment("Computer Science & Engineering");
        mentor1.setYear(3);
        mentor1.setSection("A");
        mentor1.setPhoneNumber("+91 98765 43210");
        mentorRepository.save(mentor1);

        Mentor mentor2 = new Mentor();
        mentor2.setMentorName("Dr. Arvind Nair");
        mentor2.setEmail("dr.nair@college.edu");
        mentor2.setPassword(encodedPassword);
        mentor2.setDepartment("Electronics & Communication");
        mentor2.setYear(3);
        mentor2.setSection("A");
        mentor2.setPhoneNumber("+91 98765 43211");
        mentorRepository.save(mentor2);

        // 2. Class Incharges (2)
        ClassIncharge cic1 = new ClassIncharge();
        cic1.setName("Prof. Rajesh Verma");
        cic1.setEmail("prof.verma@college.edu");
        cic1.setPassword(encodedPassword);
        cic1.setDepartment("Computer Science & Engineering");
        cic1.setYear(3);
        cic1.setSection("A");
        classInchargeRepository.save(cic1);

        ClassIncharge cic2 = new ClassIncharge();
        cic2.setName("Prof. Anita Desai");
        cic2.setEmail("prof.desai@college.edu");
        cic2.setPassword(encodedPassword);
        cic2.setDepartment("Electronics & Communication");
        cic2.setYear(3);
        cic2.setSection("A");
        classInchargeRepository.save(cic2);

        // 3. HODs (2)
        HOD hod1 = new HOD();
        hod1.setName("Dr. Anand Kumar");
        hod1.setEmail("hod.cse@college.edu");
        hod1.setPassword(encodedPassword);
        hod1.setDepartment("Computer Science & Engineering");
        hodRepository.save(hod1);

        HOD hod2 = new HOD();
        hod2.setName("Dr. Meenakshi Sundaram");
        hod2.setEmail("hod.ece@college.edu");
        hod2.setPassword(encodedPassword);
        hod2.setDepartment("Electronics & Communication");
        hodRepository.save(hod2);

        // 4. Security Officers (2)
        SecurityOfficer sec1 = new SecurityOfficer();
        sec1.setName("Officer Mahendra Singh");
        sec1.setEmail("security.gate1@college.edu");
        sec1.setPassword(encodedPassword);
        sec1.setGateNumber("Main Campus Gate 1");
        securityRepository.save(sec1);

        SecurityOfficer sec2 = new SecurityOfficer();
        sec2.setName("Officer Suresh Yadav");
        sec2.setEmail("security.gate2@college.edu");
        sec2.setPassword(encodedPassword);
        sec2.setGateNumber("North Hostel Gate 2");
        securityRepository.save(sec2);

        // 5. Students (5)
        Student stu1 = new Student();
        stu1.setStudentName("Rahul Kumar");
        stu1.setRollNumber("23CS101");
        stu1.setDepartment("Computer Science & Engineering");
        stu1.setYear(3);
        stu1.setSection("A");
        stu1.setEmail("rahul.cse@college.edu");
        stu1.setPassword(encodedPassword);
        stu1.setPhoneNumber("+91 91234 56701");
        stu1.setMentorEmail("dr.sharma@college.edu");
        stu1.setParentEmail("parent.rahul@gmail.com");
        studentRepository.save(stu1);

        Student stu2 = new Student();
        stu2.setStudentName("Ananya Deshmukh");
        stu2.setRollNumber("23CS102");
        stu2.setDepartment("Computer Science & Engineering");
        stu2.setYear(3);
        stu2.setSection("A");
        stu2.setEmail("ananya.cse@college.edu");
        stu2.setPassword(encodedPassword);
        stu2.setPhoneNumber("+91 91234 56702");
        stu2.setMentorEmail("dr.sharma@college.edu");
        stu2.setParentEmail("parent.ananya@gmail.com");
        studentRepository.save(stu2);

        Student stu3 = new Student();
        stu3.setStudentName("Rohan Sharma");
        stu3.setRollNumber("23CS103");
        stu3.setDepartment("Computer Science & Engineering");
        stu3.setYear(3);
        stu3.setSection("A");
        stu3.setEmail("rohan.cse@college.edu");
        stu3.setPassword(encodedPassword);
        stu3.setPhoneNumber("+91 91234 56703");
        stu3.setMentorEmail("dr.sharma@college.edu");
        stu3.setParentEmail("parent.rohan@gmail.com");
        studentRepository.save(stu3);

        Student stu4 = new Student();
        stu4.setStudentName("Sneha Reddy");
        stu4.setRollNumber("23EC101");
        stu4.setDepartment("Electronics & Communication");
        stu4.setYear(3);
        stu4.setSection("A");
        stu4.setEmail("sneha.ece@college.edu");
        stu4.setPassword(encodedPassword);
        stu4.setPhoneNumber("+91 91234 56704");
        stu4.setMentorEmail("dr.nair@college.edu");
        stu4.setParentEmail("parent.sneha@gmail.com");
        studentRepository.save(stu4);

        Student stu5 = new Student();
        stu5.setStudentName("Vikram Malhotra");
        stu5.setRollNumber("23EC102");
        stu5.setDepartment("Electronics & Communication");
        stu5.setYear(3);
        stu5.setSection("A");
        stu5.setEmail("vikram.ece@college.edu");
        stu5.setPassword(encodedPassword);
        stu5.setPhoneNumber("+91 91234 56705");
        stu5.setMentorEmail("dr.nair@college.edu");
        stu5.setParentEmail("parent.vikram@gmail.com");
        studentRepository.save(stu5);

        // 6. Parents (5)
        Parent par1 = new Parent();
        par1.setParentName("Mr. Suresh Kumar");
        par1.setEmail("parent.rahul@gmail.com");
        par1.setPassword(encodedPassword);
        par1.setPhoneNumber("+91 98450 11001");
        par1.setStudentRollNumber("23CS101");
        par1.setStudentEmail("rahul.cse@college.edu");
        parentRepository.save(par1);

        Parent par2 = new Parent();
        par2.setParentName("Mrs. Meera Deshmukh");
        par2.setEmail("parent.ananya@gmail.com");
        par2.setPassword(encodedPassword);
        par2.setPhoneNumber("+91 98450 11002");
        par2.setStudentRollNumber("23CS102");
        par2.setStudentEmail("ananya.cse@college.edu");
        parentRepository.save(par2);

        Parent par3 = new Parent();
        par3.setParentName("Mr. Alok Sharma");
        par3.setEmail("parent.rohan@gmail.com");
        par3.setPassword(encodedPassword);
        par3.setPhoneNumber("+91 98450 11003");
        par3.setStudentRollNumber("23CS103");
        par3.setStudentEmail("rohan.cse@college.edu");
        parentRepository.save(par3);

        Parent par4 = new Parent();
        par4.setParentName("Mr. K. V. Reddy");
        par4.setEmail("parent.sneha@gmail.com");
        par4.setPassword(encodedPassword);
        par4.setPhoneNumber("+91 98450 11004");
        par4.setStudentRollNumber("23EC101");
        par4.setStudentEmail("sneha.ece@college.edu");
        parentRepository.save(par4);

        Parent par5 = new Parent();
        par5.setParentName("Mrs. Sunita Malhotra");
        par5.setEmail("parent.vikram@gmail.com");
        par5.setPassword(encodedPassword);
        par5.setPhoneNumber("+91 98450 11005");
        par5.setStudentRollNumber("23EC102");
        par5.setStudentEmail("vikram.ece@college.edu");
        parentRepository.save(par5);

        // 7. Leaves (7)
        // Leave 1: Rahul Kumar - Pending at Mentor
        Leave l1 = new Leave();
        l1.setStudentId(stu1.getId());
        l1.setStudentName(stu1.getStudentName());
        l1.setStudentRollNumber(stu1.getRollNumber());
        l1.setStudentEmail(stu1.getEmail());
        l1.setDepartment(stu1.getDepartment());
        l1.setYear(stu1.getYear());
        l1.setSection(stu1.getSection());
        l1.setPhoneNumber(stu1.getPhoneNumber());
        l1.setMentorEmail(stu1.getMentorEmail());
        l1.setParentEmail(stu1.getParentEmail());
        l1.setLeaveType(LeaveType.HOME_VISIT);
        l1.setFromDate(LocalDate.now().plusDays(2));
        l1.setToDate(LocalDate.now().plusDays(4));
        l1.setReason("Family festival celebration in native town.");
        l1.setAppliedAt(LocalDateTime.now().minusHours(4));
        l1.setMentorStatus(ApprovalStatus.PENDING);
        l1.setParentStatus(ApprovalStatus.PENDING);
        l1.setClassInchargeStatus(ApprovalStatus.PENDING);
        l1.setHodStatus(ApprovalStatus.PENDING);
        l1.setOverallStatus(ApprovalStatus.PENDING);
        l1.setSecurityVerified(false);
        leaveRepository.save(l1);

        // Leave 2: Ananya Deshmukh - Pending at Parent
        Leave l2 = new Leave();
        l2.setStudentId(stu2.getId());
        l2.setStudentName(stu2.getStudentName());
        l2.setStudentRollNumber(stu2.getRollNumber());
        l2.setStudentEmail(stu2.getEmail());
        l2.setDepartment(stu2.getDepartment());
        l2.setYear(stu2.getYear());
        l2.setSection(stu2.getSection());
        l2.setPhoneNumber(stu2.getPhoneNumber());
        l2.setMentorEmail(stu2.getMentorEmail());
        l2.setParentEmail(stu2.getParentEmail());
        l2.setLeaveType(LeaveType.CASUAL);
        l2.setFromDate(LocalDate.now().plusDays(3));
        l2.setToDate(LocalDate.now().plusDays(5));
        l2.setReason("Attending cousin sister wedding reception.");
        l2.setAppliedAt(LocalDateTime.now().minusHours(10));
        l2.setMentorStatus(ApprovalStatus.APPROVED);
        l2.setMentorRemarks("Attendance is 86%. Recommended for leave.");
        l2.setMentorActionAt(LocalDateTime.now().minusHours(8));
        l2.setParentStatus(ApprovalStatus.PENDING);
        l2.setClassInchargeStatus(ApprovalStatus.PENDING);
        l2.setHodStatus(ApprovalStatus.PENDING);
        l2.setOverallStatus(ApprovalStatus.PENDING);
        l2.setSecurityVerified(false);
        leaveRepository.save(l2);

        // Leave 3: Rohan Sharma - Pending at Class Incharge
        Leave l3 = new Leave();
        l3.setStudentId(stu3.getId());
        l3.setStudentName(stu3.getStudentName());
        l3.setStudentRollNumber(stu3.getRollNumber());
        l3.setStudentEmail(stu3.getEmail());
        l3.setDepartment(stu3.getDepartment());
        l3.setYear(stu3.getYear());
        l3.setSection(stu3.getSection());
        l3.setPhoneNumber(stu3.getPhoneNumber());
        l3.setMentorEmail(stu3.getMentorEmail());
        l3.setParentEmail(stu3.getParentEmail());
        l3.setLeaveType(LeaveType.ACADEMIC);
        l3.setFromDate(LocalDate.now().plusDays(4));
        l3.setToDate(LocalDate.now().plusDays(6));
        l3.setReason("Presenting research paper at IEEE Regional Tech Conference.");
        l3.setAppliedAt(LocalDateTime.now().minusHours(18));
        l3.setMentorStatus(ApprovalStatus.APPROVED);
        l3.setMentorRemarks("Paper acceptance certificate verified.");
        l3.setMentorActionAt(LocalDateTime.now().minusHours(15));
        l3.setParentStatus(ApprovalStatus.APPROVED);
        l3.setParentRemarks("Consent granted.");
        l3.setParentActionAt(LocalDateTime.now().minusHours(12));
        l3.setClassInchargeStatus(ApprovalStatus.PENDING);
        l3.setHodStatus(ApprovalStatus.PENDING);
        l3.setOverallStatus(ApprovalStatus.PENDING);
        l3.setSecurityVerified(false);
        leaveRepository.save(l3);

        // Leave 4: Sneha Reddy - Pending at HOD
        Leave l4 = new Leave();
        l4.setStudentId(stu4.getId());
        l4.setStudentName(stu4.getStudentName());
        l4.setStudentRollNumber(stu4.getRollNumber());
        l4.setStudentEmail(stu4.getEmail());
        l4.setDepartment(stu4.getDepartment());
        l4.setYear(stu4.getYear());
        l4.setSection(stu4.getSection());
        l4.setPhoneNumber(stu4.getPhoneNumber());
        l4.setMentorEmail(stu4.getMentorEmail());
        l4.setParentEmail(stu4.getParentEmail());
        l4.setLeaveType(LeaveType.SICK);
        l4.setFromDate(LocalDate.now().plusDays(1));
        l4.setToDate(LocalDate.now().plusDays(3));
        l4.setReason("Severe viral fever and physician recommended clinical bed rest.");
        l4.setAppliedAt(LocalDateTime.now().minusHours(24));
        l4.setMentorStatus(ApprovalStatus.APPROVED);
        l4.setMentorRemarks("Prescription checked.");
        l4.setMentorActionAt(LocalDateTime.now().minusHours(20));
        l4.setParentStatus(ApprovalStatus.APPROVED);
        l4.setParentRemarks("Confirmed.");
        l4.setParentActionAt(LocalDateTime.now().minusHours(16));
        l4.setClassInchargeStatus(ApprovalStatus.APPROVED);
        l4.setClassInchargeRemarks("Practicals to be rescheduled.");
        l4.setClassInchargeActionAt(LocalDateTime.now().minusHours(10));
        l4.setHodStatus(ApprovalStatus.PENDING);
        l4.setOverallStatus(ApprovalStatus.PENDING);
        l4.setSecurityVerified(false);
        leaveRepository.save(l4);

        // Leave 5: Vikram Malhotra - Fully APPROVED with active OTP
        Leave l5 = new Leave();
        l5.setStudentId(stu5.getId());
        l5.setStudentName(stu5.getStudentName());
        l5.setStudentRollNumber(stu5.getRollNumber());
        l5.setStudentEmail(stu5.getEmail());
        l5.setDepartment(stu5.getDepartment());
        l5.setYear(stu5.getYear());
        l5.setSection(stu5.getSection());
        l5.setPhoneNumber(stu5.getPhoneNumber());
        l5.setMentorEmail(stu5.getMentorEmail());
        l5.setParentEmail(stu5.getParentEmail());
        l5.setLeaveType(LeaveType.EMERGENCY);
        l5.setFromDate(LocalDate.now());
        l5.setToDate(LocalDate.now().plusDays(2));
        l5.setReason("Urgent passport and biometric document renewal at Regional Passport Seva Kendra.");
        l5.setAppliedAt(LocalDateTime.now().minusHours(12));
        l5.setMentorStatus(ApprovalStatus.APPROVED);
        l5.setMentorActionAt(LocalDateTime.now().minusHours(10));
        l5.setParentStatus(ApprovalStatus.APPROVED);
        l5.setParentActionAt(LocalDateTime.now().minusHours(8));
        l5.setClassInchargeStatus(ApprovalStatus.APPROVED);
        l5.setClassInchargeActionAt(LocalDateTime.now().minusHours(5));
        l5.setHodStatus(ApprovalStatus.APPROVED);
        l5.setHodRemarks("Out-pass authorized.");
        l5.setHodActionAt(LocalDateTime.now().minusHours(2));
        l5.setOverallStatus(ApprovalStatus.APPROVED);
        l5.setOtpCode("842619");
        l5.setOtpGeneratedAt(LocalDateTime.now().minusHours(2));
        l5.setOtpExpiresAt(LocalDateTime.now().plusHours(22));
        l5.setSecurityVerified(false);
        leaveRepository.save(l5);

        OTP otp5 = new OTP();
        otp5.setLeave(l5);
        otp5.setOtpCode("842619");
        otp5.setGeneratedAt(l5.getOtpGeneratedAt());
        otp5.setExpiresAt(l5.getOtpExpiresAt());
        otp5.setVerified(false);
        otp5.setAttempts(0);
        otpRepository.save(otp5);

        // Leave 6: Rahul Kumar - Fully APPROVED & Security Verified (EXIT CLEARED & STAMPED)
        Leave l6 = new Leave();
        l6.setStudentId(stu1.getId());
        l6.setStudentName("Rahul Kumar");
        l6.setStudentRollNumber("23CS101");
        l6.setStudentEmail(stu1.getEmail());
        l6.setDepartment("CSE");
        l6.setYear(3);
        l6.setSection("A");
        l6.setPhoneNumber(stu1.getPhoneNumber());
        l6.setMentorEmail(stu1.getMentorEmail());
        l6.setParentEmail(stu1.getParentEmail());
        l6.setLeaveType(LeaveType.CASUAL);
        l6.setFromDate(LocalDate.now());
        l6.setToDate(LocalDate.now());
        l6.setReason("Official inter-college hackathon event participation.");
        l6.setAppliedAt(LocalDateTime.now().minusHours(14));
        l6.setMentorStatus(ApprovalStatus.APPROVED);
        l6.setMentorActionAt(LocalDateTime.now().minusHours(12));
        l6.setParentStatus(ApprovalStatus.APPROVED);
        l6.setParentActionAt(LocalDateTime.now().minusHours(10));
        l6.setClassInchargeStatus(ApprovalStatus.APPROVED);
        l6.setClassInchargeActionAt(LocalDateTime.now().minusHours(8));
        l6.setHodStatus(ApprovalStatus.APPROVED);
        l6.setHodActionAt(LocalDateTime.now().minusHours(4));
        l6.setOverallStatus(ApprovalStatus.APPROVED);
        l6.setOtpCode("519302");
        l6.setOtpGeneratedAt(LocalDateTime.now().minusHours(4));
        l6.setOtpExpiresAt(LocalDateTime.now().plusHours(20));
        l6.setSecurityVerified(true);
        l6.setSecurityVerifiedAt(LocalDateTime.now().minusHours(1));
        l6.setSecurityGate("Main Gate");
        l6.setSecurityOfficerName("Officer Mahendra Singh");
        leaveRepository.save(l6);

        OTP otp6 = new OTP();
        otp6.setLeave(l6);
        otp6.setOtpCode("519302");
        otp6.setGeneratedAt(l6.getOtpGeneratedAt());
        otp6.setExpiresAt(l6.getOtpExpiresAt());
        otp6.setVerified(true);
        otp6.setVerifiedAt(l6.getSecurityVerifiedAt());
        otp6.setAttempts(1);
        otpRepository.save(otp6);

        // Leave 7: Ananya Deshmukh - REJECTED
        Leave l7 = new Leave();
        l7.setStudentId(stu2.getId());
        l7.setStudentName(stu2.getStudentName());
        l7.setStudentRollNumber(stu2.getRollNumber());
        l7.setStudentEmail(stu2.getEmail());
        l7.setDepartment(stu2.getDepartment());
        l7.setYear(stu2.getYear());
        l7.setSection(stu2.getSection());
        l7.setPhoneNumber(stu2.getPhoneNumber());
        l7.setMentorEmail(stu2.getMentorEmail());
        l7.setParentEmail(stu2.getParentEmail());
        l7.setLeaveType(LeaveType.CASUAL);
        l7.setFromDate(LocalDate.now().plusDays(1));
        l7.setToDate(LocalDate.now().plusDays(2));
        l7.setReason("Personal recreation trip.");
        l7.setAppliedAt(LocalDateTime.now().minusHours(30));
        l7.setMentorStatus(ApprovalStatus.REJECTED);
        l7.setMentorRemarks("Attendance is below 75% statutory requirement.");
        l7.setMentorActionAt(LocalDateTime.now().minusHours(28));
        l7.setParentStatus(ApprovalStatus.PENDING);
        l7.setClassInchargeStatus(ApprovalStatus.PENDING);
        l7.setHodStatus(ApprovalStatus.PENDING);
        l7.setOverallStatus(ApprovalStatus.REJECTED);
        l7.setRejectionReason("Rejected by Mentor: Attendance is below 75% statutory requirement.");
        l7.setRejectedBy("Mentor");
        l7.setSecurityVerified(false);
        leaveRepository.save(l7);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Demo data loaded successfully");
        result.put("studentsCreated", studentRepository.count());
        result.put("mentorsCreated", mentorRepository.count());
        result.put("parentsCreated", parentRepository.count());
        result.put("classInchargesCreated", classInchargeRepository.count());
        result.put("hodsCreated", hodRepository.count());
        result.put("leavesCreated", leaveRepository.count());
        return result;
    }
}
