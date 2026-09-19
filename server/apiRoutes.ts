import { Router, Response } from 'express';
import { Database, StudentEntity, MentorEntity, ParentEntity, ClassInchargeEntity, HODEntity, SecurityEntity, AdminEntity, LeaveEntity } from './db.js';
import { Security, AuthenticatedRequest } from './security.js';
import { ApprovalService } from './approvalService.js';
import { generateLeaveHistoryPDF, generateGatePassPDF } from './pdfService.js';

export const apiRouter = Router();

// User Auth Verification / Active Session Validation
apiRouter.get('/auth/me', Security.authenticate, (req: AuthenticatedRequest, res) => {
  return res.json({
    authenticated: true,
    user: req.user,
  });
});

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleServiceError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(400).json({
    timestamp: new Date().toISOString(),
    status: 400,
    error: 'Bad Request',
    message,
  });
}

// -------------------------------------------------------------
// 1. STUDENT APIS
// -------------------------------------------------------------
apiRouter.post('/students/register', (req, res) => {
  const {
    studentName,
    rollNumber,
    department,
    year,
    section,
    email,
    password,
    phoneNumber,
    mentorEmail,
    parentEmail,
  } = req.body;

  if (!studentName || !rollNumber || !email || !password || !department || !year || !section) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Validation Error',
      message: 'All required student fields must be provided.',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Validation Error',
      message: 'Invalid student email format.',
    });
  }

  if (Database.db.students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Duplicate Registration',
      message: `Student with email '${email}' already exists.`,
    });
  }

  if (Database.db.students.some(s => s.rollNumber.toUpperCase() === rollNumber.toUpperCase())) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Duplicate Registration',
      message: `Student with roll number '${rollNumber}' already exists.`,
    });
  }

  const newStudent: StudentEntity = {
    id: `stu-${Date.now()}`,
    studentName: studentName.trim(),
    rollNumber: rollNumber.trim().toUpperCase(),
    department: department.trim(),
    year: Number(year),
    section: section.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    password: Security.hashPassword(password),
    phoneNumber: phoneNumber || '',
    mentorEmail: (mentorEmail || '').trim().toLowerCase(),
    parentEmail: (parentEmail || '').trim().toLowerCase(),
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
  };

  Database.db.students.push(newStudent);
  Database.save();

  const token = Security.generateToken({
    id: newStudent.id,
    email: newStudent.email,
    name: newStudent.studentName,
    role: 'STUDENT',
    department: newStudent.department,
    year: newStudent.year,
    section: newStudent.section,
    rollNumber: newStudent.rollNumber,
  });

  return res.status(201).json({
    message: 'Student registered successfully',
    token,
    student: {
      id: newStudent.id,
      studentName: newStudent.studentName,
      rollNumber: newStudent.rollNumber,
      department: newStudent.department,
      year: newStudent.year,
      section: newStudent.section,
      email: newStudent.email,
      role: newStudent.role,
    },
  });
});

apiRouter.post('/students/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Bad Request',
      message: 'Email and password are required.',
    });
  }

  const student = Database.db.students.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
  if (!student || !Security.comparePassword(password, student.password)) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid student email or password.',
    });
  }

  const token = Security.generateToken({
    id: student.id,
    email: student.email,
    name: student.studentName,
    role: 'STUDENT',
    department: student.department,
    year: student.year,
    section: student.section,
    rollNumber: student.rollNumber,
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: student.id,
      name: student.studentName,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department,
      year: student.year,
      section: student.section,
      phoneNumber: student.phoneNumber,
      mentorEmail: student.mentorEmail,
      parentEmail: student.parentEmail,
      role: student.role,
    },
  });
});

apiRouter.get('/students/profile', Security.authenticate, Security.authorizeRoles('STUDENT'), (req: AuthenticatedRequest, res) => {
  const student = Database.db.students.find(s => s.id === req.user!.id || s.email === req.user!.email);
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }
  const { password, ...safeStudent } = student;
  return res.json(safeStudent);
});

// Leave Application
apiRouter.post('/leave/apply', Security.authenticate, Security.authorizeRoles('STUDENT'), (req: AuthenticatedRequest, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;
  const user = req.user!;

  if (!leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Validation Error',
      message: 'leaveType, fromDate, toDate, and reason are required.',
    });
  }

  if (new Date(fromDate) > new Date(toDate)) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      error: 'Validation Error',
      message: 'fromDate cannot be after toDate.',
    });
  }

  const student = Database.db.students.find(s => s.id === user.id || s.email === user.email);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  const leaveId = `LV-${new Date().getFullYear()}-${String(Database.db.leaves.length + 1).padStart(3, '0')}`;
  const nowIso = new Date().toISOString();

  const newLeave: LeaveEntity = {
    id: leaveId,
    studentId: student.id,
    studentName: student.studentName,
    studentRollNumber: student.rollNumber,
    studentEmail: student.email,
    department: student.department,
    year: student.year,
    section: student.section,
    phoneNumber: student.phoneNumber,
    mentorEmail: student.mentorEmail || 'dr.sharma@college.edu',
    parentEmail: student.parentEmail || 'parent.rahul@gmail.com',

    leaveType,
    fromDate,
    toDate,
    reason: reason.trim(),
    appliedAt: nowIso,

    mentorStatus: 'PENDING',
    parentStatus: 'PENDING',
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',

    securityVerified: false,
    cancelled: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  Database.db.leaves.unshift(newLeave);
  Database.save();

  return res.status(201).json({
    message: 'Leave applied successfully and submitted to Mentor for initial review.',
    leave: newLeave,
  });
});

apiRouter.get('/leave/my-leaves', Security.authenticate, Security.authorizeRoles('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const myLeaves = Database.db.leaves.filter(
    l => l.studentEmail.toLowerCase() === user.email.toLowerCase() || (user.rollNumber && l.studentRollNumber === user.rollNumber)
  );
  return res.json(myLeaves);
});

apiRouter.delete('/leave/:leaveId', Security.authenticate, Security.authorizeRoles('STUDENT'), (req: AuthenticatedRequest, res) => {
  try {
    const leave = ApprovalService.cancelLeave(req.params.leaveId, req.user!.email);
    return res.json({ message: 'Leave cancelled successfully.', leave });
  } catch (err) {
    return handleServiceError(res, err);
  }
});

// -------------------------------------------------------------
// 2. MENTOR APIS
// -------------------------------------------------------------
apiRouter.post('/mentors/register', (req, res) => {
  const { mentorName, email, password, department, year, section, phoneNumber } = req.body;
  if (!mentorName || !email || !password || !department) {
    return res.status(400).json({ error: 'Validation Error', message: 'All required fields must be supplied.' });
  }

  if (Database.db.mentors.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Duplicate Email', message: `Mentor with email '${email}' already exists.` });
  }

  const newMentor: MentorEntity = {
    id: `men-${Date.now()}`,
    mentorName: mentorName.trim(),
    email: email.trim().toLowerCase(),
    password: Security.hashPassword(password),
    department: department.trim(),
    year: Number(year) || 3,
    section: (section || 'A').trim().toUpperCase(),
    phoneNumber: phoneNumber || '',
    role: 'MENTOR',
    createdAt: new Date().toISOString(),
  };

  Database.db.mentors.push(newMentor);
  Database.save();

  const token = Security.generateToken({
    id: newMentor.id,
    email: newMentor.email,
    name: newMentor.mentorName,
    role: 'MENTOR',
    department: newMentor.department,
    year: newMentor.year,
    section: newMentor.section,
  });

  return res.status(201).json({ message: 'Mentor registered successfully', token });
});

apiRouter.post('/mentors/login', (req, res) => {
  const { email, password } = req.body;
  const mentor = Database.db.mentors.find(m => m.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!mentor || !Security.comparePassword(password, mentor.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid mentor credentials.' });
  }

  const token = Security.generateToken({
    id: mentor.id,
    email: mentor.email,
    name: mentor.mentorName,
    role: 'MENTOR',
    department: mentor.department,
    year: mentor.year,
    section: mentor.section,
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: mentor.id,
      name: mentor.mentorName,
      email: mentor.email,
      department: mentor.department,
      year: mentor.year,
      section: mentor.section,
      role: mentor.role,
    },
  });
});

apiRouter.get('/mentors/leaves', Security.authenticate, Security.authorizeRoles('MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorEmail = req.user!.email.toLowerCase();
  // Mentor should see leave requests belonging to assigned students or department/section
  const leaves = Database.db.leaves.filter(l => {
    return (
      l.mentorEmail.toLowerCase() === mentorEmail ||
      (req.user!.department && l.department.toLowerCase() === req.user!.department.toLowerCase() && l.section === req.user!.section)
    );
  });
  return res.json(leaves);
});

apiRouter.put('/mentors/leaves/:leaveId', Security.authenticate, Security.authorizeRoles('MENTOR'), (req: AuthenticatedRequest, res) => {
  const rawAction = (req.body.action || req.body.status || req.body.approvalStatus || '').toString().trim().toUpperCase();
  const remarks = req.body.remarks || req.body.reason;
  const reason = req.body.reason || req.body.remarks;
  const leaveId = req.params.leaveId;

  try {
    if (rawAction === 'APPROVE' || rawAction === 'APPROVED') {
      const leave = ApprovalService.approveByMentor(leaveId, req.user!.email, remarks);
      return res.json({ message: 'Leave approved by Mentor. Forwarded to Parent for consent.', leave });
    } else if (rawAction === 'REJECT' || rawAction === 'REJECTED') {
      if (!reason) {
        return res.status(400).json({ error: 'Validation Error', message: 'Rejection reason is required.' });
      }
      const leave = ApprovalService.rejectByMentor(leaveId, req.user!.email, reason);
      return res.json({ message: 'Leave rejected by Mentor.', leave });
    } else {
      return res.status(400).json({ error: 'Bad Request', message: "Action must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    return handleServiceError(res, err);
  }
});

// -------------------------------------------------------------
// 3. PARENT APIS
// -------------------------------------------------------------
apiRouter.post('/parents/register', (req, res) => {
  const { parentName, email, password, phoneNumber, studentEmail, studentRollNumber } = req.body;
  if (!parentName || !email || !password) {
    return res.status(400).json({ error: 'Validation Error', message: 'All required parent fields must be provided.' });
  }

  if (Database.db.parents.some(p => p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Duplicate Email', message: `Parent with email '${email}' already registered.` });
  }

  const newParent: ParentEntity = {
    id: `par-${Date.now()}`,
    parentName: parentName.trim(),
    email: email.trim().toLowerCase(),
    password: Security.hashPassword(password),
    phoneNumber: phoneNumber || '',
    studentEmail: (studentEmail || '').trim().toLowerCase(),
    studentRollNumber: (studentRollNumber || '').trim().toUpperCase(),
    role: 'PARENT',
    createdAt: new Date().toISOString(),
  };

  Database.db.parents.push(newParent);
  Database.save();

  const token = Security.generateToken({
    id: newParent.id,
    email: newParent.email,
    name: newParent.parentName,
    role: 'PARENT',
    studentEmail: newParent.studentEmail,
  });

  return res.status(201).json({ message: 'Parent registered successfully', token });
});

apiRouter.post('/parents/login', (req, res) => {
  const { email, password } = req.body;
  const parent = Database.db.parents.find(p => p.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!parent || !Security.comparePassword(password, parent.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid parent credentials.' });
  }

  const token = Security.generateToken({
    id: parent.id,
    email: parent.email,
    name: parent.parentName,
    role: 'PARENT',
    studentEmail: parent.studentEmail,
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: parent.id,
      name: parent.parentName,
      email: parent.email,
      studentEmail: parent.studentEmail,
      studentRollNumber: parent.studentRollNumber,
      phoneNumber: parent.phoneNumber,
      role: parent.role,
    },
  });
});

apiRouter.get('/parents/profile', Security.authenticate, Security.authorizeRoles('PARENT'), (req: AuthenticatedRequest, res) => {
  const parent = Database.db.parents.find(p => p.email === req.user!.email);
  if (!parent) return res.status(404).json({ error: 'Parent record not found.' });
  const { password, ...safeParent } = parent;
  return res.json(safeParent);
});

apiRouter.get('/parents/leaves', Security.authenticate, Security.authorizeRoles('PARENT'), (req: AuthenticatedRequest, res) => {
  const parentEmail = req.user!.email.toLowerCase();
  const parent = Database.db.parents.find(p => p.email.toLowerCase() === parentEmail);
  const childEmail = parent?.studentEmail.toLowerCase() || req.user!.studentEmail?.toLowerCase();
  const childRoll = parent?.studentRollNumber.toUpperCase();

  // Parent must only access leaves belonging to their associated student
  const leaves = Database.db.leaves.filter(l => {
    return (
      l.parentEmail.toLowerCase() === parentEmail ||
      (childEmail && l.studentEmail.toLowerCase() === childEmail) ||
      (childRoll && l.studentRollNumber.toUpperCase() === childRoll)
    );
  });
  return res.json(leaves);
});

apiRouter.put('/parents/leaves/:leaveId', Security.authenticate, Security.authorizeRoles('PARENT'), (req: AuthenticatedRequest, res) => {
  const rawAction = (req.body.action || req.body.status || req.body.approvalStatus || '').toString().trim().toUpperCase();
  const remarks = req.body.remarks || req.body.reason;
  const reason = req.body.reason || req.body.remarks || 'Parent did not consent';
  const leaveId = req.params.leaveId;

  try {
    if (rawAction === 'APPROVE' || rawAction === 'APPROVED') {
      const leave = ApprovalService.approveByParent(leaveId, req.user!.email, remarks);
      return res.json({ message: 'Leave approved by Parent. Forwarded to Class Incharge.', leave });
    } else if (rawAction === 'REJECT' || rawAction === 'REJECTED') {
      const leave = ApprovalService.rejectByParent(leaveId, req.user!.email, reason);
      return res.json({ message: 'Leave rejected by Parent.', leave });
    } else {
      return res.status(400).json({ error: 'Bad Request', message: "Action must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    return handleServiceError(res, err);
  }
});

// -------------------------------------------------------------
// 4. CLASS INCHARGE APIS
// -------------------------------------------------------------
apiRouter.post('/classincharges/register', (req, res) => {
  const { name, email, password, department, year, section } = req.body;
  if (!name || !email || !password || !department) {
    return res.status(400).json({ error: 'Validation Error', message: 'All required fields must be supplied.' });
  }

  if (Database.db.classIncharges.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Duplicate Email', message: `Class Incharge with email '${email}' exists.` });
  }

  const incharge: ClassInchargeEntity = {
    id: `cic-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: Security.hashPassword(password),
    department: department.trim(),
    year: Number(year) || 3,
    section: (section || 'A').trim().toUpperCase(),
    role: 'CLASS_INCHARGE',
    createdAt: new Date().toISOString(),
  };

  Database.db.classIncharges.push(incharge);
  Database.save();

  const token = Security.generateToken({
    id: incharge.id,
    email: incharge.email,
    name: incharge.name,
    role: 'CLASS_INCHARGE',
    department: incharge.department,
    year: incharge.year,
    section: incharge.section,
  });

  return res.status(201).json({ message: 'Class Incharge registered successfully', token });
});

apiRouter.post('/classincharges/login', (req, res) => {
  const { email, password } = req.body;
  const incharge = Database.db.classIncharges.find(c => c.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!incharge || !Security.comparePassword(password, incharge.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid Class Incharge credentials.' });
  }

  const token = Security.generateToken({
    id: incharge.id,
    email: incharge.email,
    name: incharge.name,
    role: 'CLASS_INCHARGE',
    department: incharge.department,
    year: incharge.year,
    section: incharge.section,
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: incharge.id,
      name: incharge.name,
      email: incharge.email,
      department: incharge.department,
      year: incharge.year,
      section: incharge.section,
      role: incharge.role,
    },
  });
});

apiRouter.get('/classincharges/leaves', Security.authenticate, Security.authorizeRoles('CLASS_INCHARGE'), (req: AuthenticatedRequest, res) => {
  const dept = req.user!.department;
  const year = req.user!.year;
  const section = req.user!.section;

  // Class Incharge should only access matching department/year/section leaves
  const leaves = Database.db.leaves.filter(l => {
    if (dept && l.department.toLowerCase() !== dept.toLowerCase()) return false;
    if (year && l.year !== year) return false;
    if (section && l.section !== section) return false;
    return true;
  });

  return res.json(leaves);
});

apiRouter.put('/classincharges/leaves/:leaveId', Security.authenticate, Security.authorizeRoles('CLASS_INCHARGE'), (req: AuthenticatedRequest, res) => {
  const rawAction = (req.body.action || req.body.status || req.body.approvalStatus || '').toString().trim().toUpperCase();
  const remarks = req.body.remarks || req.body.reason;
  const reason = req.body.reason || req.body.remarks || 'Rejected by Class Incharge';
  const leaveId = req.params.leaveId;

  try {
    if (rawAction === 'APPROVE' || rawAction === 'APPROVED') {
      const leave = ApprovalService.approveByClassIncharge(leaveId, req.user!.email, remarks);
      return res.json({ message: 'Leave approved by Class Incharge. Forwarded to HOD for final approval.', leave });
    } else if (rawAction === 'REJECT' || rawAction === 'REJECTED') {
      const leave = ApprovalService.rejectByClassIncharge(leaveId, req.user!.email, reason);
      return res.json({ message: 'Leave rejected by Class Incharge.', leave });
    } else {
      return res.status(400).json({ error: 'Bad Request', message: "Action must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    return handleServiceError(res, err);
  }
});

// -------------------------------------------------------------
// 5. HOD APIS
// -------------------------------------------------------------
apiRouter.post('/hods/register', (req, res) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department) {
    return res.status(400).json({ error: 'Validation Error', message: 'All required fields must be supplied.' });
  }

  if (Database.db.hods.some(h => h.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Duplicate Email', message: `HOD with email '${email}' exists.` });
  }

  const hod: HODEntity = {
    id: `hod-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: Security.hashPassword(password),
    department: department.trim(),
    role: 'HOD',
    createdAt: new Date().toISOString(),
  };

  Database.db.hods.push(hod);
  Database.save();

  const token = Security.generateToken({
    id: hod.id,
    email: hod.email,
    name: hod.name,
    role: 'HOD',
    department: hod.department,
  });

  return res.status(201).json({ message: 'HOD registered successfully', token });
});

apiRouter.post('/hods/login', (req, res) => {
  const { email, password } = req.body;
  const hod = Database.db.hods.find(h => h.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!hod || !Security.comparePassword(password, hod.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid HOD credentials.' });
  }

  const token = Security.generateToken({
    id: hod.id,
    email: hod.email,
    name: hod.name,
    role: 'HOD',
    department: hod.department,
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: hod.id,
      name: hod.name,
      email: hod.email,
      department: hod.department,
      role: hod.role,
    },
  });
});

apiRouter.get('/hods/leaves', Security.authenticate, Security.authorizeRoles('HOD'), (req: AuthenticatedRequest, res) => {
  const dept = req.user!.department;
  // HOD sees leaves from their department, or all if department matches
  const leaves = Database.db.leaves.filter(l => {
    if (dept && l.department.toLowerCase() !== dept.toLowerCase()) return false;
    return true;
  });
  return res.json(leaves);
});

apiRouter.put('/hods/leaves/:leaveId', Security.authenticate, Security.authorizeRoles('HOD'), (req: AuthenticatedRequest, res) => {
  const rawAction = (req.body.action || req.body.status || req.body.approvalStatus || '').toString().trim().toUpperCase();
  const remarks = req.body.remarks || req.body.reason;
  const reason = req.body.reason || req.body.remarks || 'Rejected by HOD';
  const leaveId = req.params.leaveId;

  try {
    if (rawAction === 'APPROVE' || rawAction === 'APPROVED') {
      const leave = ApprovalService.approveByHod(leaveId, req.user!.email, remarks);
      return res.json({
        message: 'Final Leave approval granted! Overall status is APPROVED and OTP has been generated for campus gate clearance.',
        leave,
      });
    } else if (rawAction === 'REJECT' || rawAction === 'REJECTED') {
      const leave = ApprovalService.rejectByHod(leaveId, req.user!.email, reason);
      return res.json({ message: 'Leave rejected by HOD. No OTP generated.', leave });
    } else {
      return res.status(400).json({ error: 'Bad Request', message: "Action must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    return handleServiceError(res, err);
  }
});

// -------------------------------------------------------------
// 6. SECURITY & OTP APIS
// -------------------------------------------------------------
apiRouter.post('/security/login', (req, res) => {
  const { email, password } = req.body;
  const officer = Database.db.securityOfficers.find(s => s.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!officer || !Security.comparePassword(password, officer.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid security credentials.' });
  }

  const token = Security.generateToken({
    id: officer.id,
    email: officer.email,
    name: officer.name,
    role: 'SECURITY',
  });

  return res.json({
    message: 'Security terminal login successful',
    token,
    user: {
      id: officer.id,
      name: officer.name,
      email: officer.email,
      gateNumber: officer.gateNumber,
      role: officer.role,
    },
  });
});

apiRouter.get('/security/approved-leaves', Security.authenticate, Security.authorizeRoles('SECURITY', 'ADMIN'), (req, res) => {
  const approvedLeaves = Database.db.leaves.filter(l => l.overallStatus === 'APPROVED');
  return res.json(approvedLeaves);
});

// OTP & Security Gate Verification Handler
const handleSecurityVerification = (req: AuthenticatedRequest, res: Response) => {
  const { otpCode, queryIdentifier, gateNumber } = req.body;
  const officerName = req.user!.name || 'Gate Officer';

  try {
    const result = ApprovalService.verifySecurityOTP(
      otpCode,
      queryIdentifier,
      gateNumber || 'Main Campus Gate 1',
      officerName
    );

    // Return both the flattened leave fields AND the result wrapper with leave
    return res.json({
      ...result.leave,
      leave: result.leave,
      studentName: result.leave.studentName,
      studentRollNumber: result.leave.studentRollNumber,
      department: result.leave.department,
      year: result.leave.year,
      section: result.leave.section,
      fromDate: result.leave.fromDate,
      toDate: result.leave.toDate,
      securityGate: result.leave.securityGate || gateNumber || 'Main Campus Gate 1',
      securityVerifiedAt: result.leave.securityVerifiedAt,
      securityOfficerName: result.leave.securityOfficerName,
      success: true,
      message: result.message,
      verifiedAt: result.verifiedAt,
    });
  } catch (err) {
    return handleServiceError(res, err);
  }
};

// Registered under both /otp/verify and /security/verify for complete API compatibility
apiRouter.post('/otp/verify', Security.authenticate, Security.authorizeRoles('SECURITY', 'ADMIN'), handleSecurityVerification);
apiRouter.post('/security/verify', Security.authenticate, Security.authorizeRoles('SECURITY', 'ADMIN'), handleSecurityVerification);


// -------------------------------------------------------------
// 7. ADMIN APIS
// -------------------------------------------------------------
apiRouter.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const admin = Database.db.admins.find(a => a.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!admin || !Security.comparePassword(password, admin.password)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid admin credentials.' });
  }

  const token = Security.generateToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: 'ADMIN',
  });

  return res.json({
    message: 'Admin login successful',
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

apiRouter.get('/admin/dashboard', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  const leaves = Database.db.leaves;

  const totalStudents = Database.db.students.length;
  const totalMentors = Database.db.mentors.length;
  const totalParents = Database.db.parents.length;
  const totalClassIncharges = Database.db.classIncharges.length;
  const totalHods = Database.db.hods.length;
  const totalSecurityOfficers = Database.db.securityOfficers.length;

  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter(l => l.overallStatus === 'PENDING').length;
  const approvedLeaves = leaves.filter(l => l.overallStatus === 'APPROVED').length;
  const rejectedLeaves = leaves.filter(l => l.overallStatus === 'REJECTED').length;
  const cancelledLeaves = leaves.filter(l => l.overallStatus === 'CANCELLED').length;
  const securityVerifiedLeaves = leaves.filter(l => l.securityVerified).length;

  // Breakdown by stages
  const pendingAtMentor = leaves.filter(l => l.overallStatus === 'PENDING' && l.mentorStatus === 'PENDING').length;
  const pendingAtParent = leaves.filter(
    l => l.overallStatus === 'PENDING' && l.mentorStatus === 'APPROVED' && l.parentStatus === 'PENDING'
  ).length;
  const pendingAtClassIncharge = leaves.filter(
    l => l.overallStatus === 'PENDING' && l.parentStatus === 'APPROVED' && l.classInchargeStatus === 'PENDING'
  ).length;
  const pendingAtHOD = leaves.filter(
    l => l.overallStatus === 'PENDING' && l.classInchargeStatus === 'APPROVED' && l.hodStatus === 'PENDING'
  ).length;

  return res.json({
    stats: {
      totalStudents,
      totalMentors,
      totalParents,
      totalClassIncharges,
      totalHods,
      totalSecurityOfficers,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      cancelledLeaves,
      securityVerifiedLeaves,
      pendingAtMentor,
      pendingAtParent,
      pendingAtClassIncharge,
      pendingAtHOD,
    },
    recentLeaves: leaves.slice(0, 10),
  });
});

apiRouter.get('/admin/users', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  return res.json({
    students: Database.db.students.map(({ password, ...s }) => s),
    mentors: Database.db.mentors.map(({ password, ...m }) => m),
    parents: Database.db.parents.map(({ password, ...p }) => p),
    classIncharges: Database.db.classIncharges.map(({ password, ...c }) => c),
    hods: Database.db.hods.map(({ password, ...h }) => h),
    securityOfficers: Database.db.securityOfficers.map(({ password, ...s }) => s),
  });
});

apiRouter.get('/admin/leaves', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  return res.json(Database.db.leaves);
});

apiRouter.post('/admin/db/reload', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  Database.reload();
  return res.json({ message: 'Database reloaded successfully from storage.' });
});

// DELETE /admin/data/clear & /admin/clear-data - Clear Existing Application/Demo Data (Admin only)
const handleClearData = (req: any, res: Response) => {
  try {
    Database.clearData();
    return res.json({ message: 'Existing data cleared successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message || 'Failed to clear data' });
  }
};
apiRouter.delete(['/admin/data/clear', '/admin/clear-data'], Security.authenticate, Security.authorizeRoles('ADMIN'), handleClearData);
apiRouter.post(['/admin/data/clear', '/admin/clear-data'], Security.authenticate, Security.authorizeRoles('ADMIN'), handleClearData);

// POST /admin/data/demo & /admin/data/load-demo & /admin/load-demo-data - Populate Consistent Demo Data (Admin only)
const handleLoadDemoData = (req: any, res: Response) => {
  try {
    const counts = Database.loadDemoData();
    return res.json({
      message: 'Demo data loaded successfully',
      ...counts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message || 'Failed to load demo data' });
  }
};
apiRouter.post(['/admin/data/demo', '/admin/data/load-demo', '/admin/load-demo-data'], Security.authenticate, Security.authorizeRoles('ADMIN'), handleLoadDemoData);

// GET /admin/leaves/export/pdf - Export Leave History Report as PDF (Admin only)
apiRouter.get('/admin/leaves/export/pdf', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  try {
    const leaves = Database.db.leaves;
    generateLeaveHistoryPDF(leaves, res);
  } catch (err: any) {
    return res.status(500).json({ error: 'PDF Export Error', message: err.message || 'Failed to export PDF' });
  }
});

// Alias: GET /admin/leaves/pdf (Admin only)
apiRouter.get('/admin/leaves/pdf', Security.authenticate, Security.authorizeRoles('ADMIN'), (req, res) => {
  try {
    const leaves = Database.db.leaves;
    generateLeaveHistoryPDF(leaves, res);
  } catch (err: any) {
    return res.status(500).json({ error: 'PDF Export Error', message: err.message || 'Failed to export PDF' });
  }
});


// Single leave details API (accessible to any authenticated role if related or admin)
apiRouter.get('/leave/:leaveId', Security.authenticate, (req: AuthenticatedRequest, res) => {
  const leave = Database.db.leaves.find(l => l.id === req.params.leaveId);
  if (!leave) {
    return res.status(404).json({ error: 'Leave not found' });
  }
  return res.json(leave);
});

// GET /leaves/:leaveId/pdf and /leaves/:leaveId/pass-pdf - Gate Pass PDF export
apiRouter.get(['/leaves/:leaveId/pdf', '/leaves/:leaveId/pass-pdf', '/leave/:leaveId/pdf', '/leave/:leaveId/pass-pdf'], (req, res) => {
  try {
    const token = Security.extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    const user = Security.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    const leave = Database.db.leaves.find(l => l.id === req.params.leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Not Found', message: 'Leave application not found' });
    }

    generateGatePassPDF(leave, res);
  } catch (err: any) {
    return res.status(500).json({ error: 'PDF Generation Error', message: err.message || 'Failed to generate gate pass PDF' });
  }
});
