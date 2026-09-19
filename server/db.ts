import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface StudentEntity {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: number;
  section: string;
  email: string;
  password: string;
  phoneNumber: string;
  mentorEmail: string;
  parentEmail: string;
  role: 'STUDENT';
  createdAt: string;
}

export interface MentorEntity {
  id: string;
  mentorName: string;
  email: string;
  password: string;
  department: string;
  year: number;
  section: string;
  phoneNumber: string;
  role: 'MENTOR';
  createdAt: string;
}

export interface ParentEntity {
  id: string;
  parentName: string;
  email: string;
  password: string;
  phoneNumber: string;
  studentEmail: string;
  studentRollNumber: string;
  role: 'PARENT';
  createdAt: string;
}

export interface ClassInchargeEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  year: number;
  section: string;
  role: 'CLASS_INCHARGE';
  createdAt: string;
}

export interface HODEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  role: 'HOD';
  createdAt: string;
}

export interface AdminEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN';
  createdAt: string;
}

export interface SecurityEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  gateNumber: string;
  role: 'SECURITY';
  createdAt: string;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveEntity {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  department: string;
  year: number;
  section: string;
  phoneNumber: string;
  mentorEmail: string;
  parentEmail: string;

  leaveType: 'SICK' | 'CASUAL' | 'ACADEMIC' | 'EMERGENCY' | 'HOME_VISIT';
  fromDate: string;
  toDate: string;
  reason: string;
  appliedAt: string;

  mentorStatus: ApprovalStatus;
  mentorRemarks?: string;
  mentorActionAt?: string;

  parentStatus: ApprovalStatus;
  parentRemarks?: string;
  parentActionAt?: string;

  classInchargeStatus: ApprovalStatus;
  classInchargeRemarks?: string;
  classInchargeActionAt?: string;

  hodStatus: ApprovalStatus;
  hodRemarks?: string;
  hodActionAt?: string;

  overallStatus: ApprovalStatus;
  rejectionReason?: string;
  rejectedBy?: string;

  otpCode?: string;
  otpGeneratedAt?: string;
  otpExpiresAt?: string;

  securityVerified: boolean;
  securityVerifiedAt?: string;
  securityGate?: string;
  securityOfficerName?: string;

  cancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OTPEntity {
  id: string;
  leaveId: string;
  otpCode: string;
  generatedAt: string;
  expiresAt: string;
  verified: boolean;
  verifiedAt?: string;
  attempts: number;
}

interface DatabaseSchema {
  students: StudentEntity[];
  mentors: MentorEntity[];
  parents: ParentEntity[];
  classIncharges: ClassInchargeEntity[];
  hods: HODEntity[];
  admins: AdminEntity[];
  securityOfficers: SecurityEntity[];
  leaves: LeaveEntity[];
  otps: OTPEntity[];
}

const DB_FILE = path.join(process.cwd(), 'smart_leave_db.json');

// Initialize database
let db: DatabaseSchema = {
  students: [],
  mentors: [],
  parents: [],
  classIncharges: [],
  hods: [],
  admins: [],
  securityOfficers: [],
  leaves: [],
  otps: [],
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      return;
    } catch (err) {
      console.error('Failed to read db file, re-seeding:', err);
    }
  }
  seedInitialData();
}

function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const now = new Date().toISOString();

  // 1. Admin
  const admin: AdminEntity = {
    id: 'adm-001',
    name: 'Dr. S. K. Narayanan (Principal & System Admin)',
    email: 'admin@college.edu',
    password: defaultPasswordHash,
    role: 'ADMIN',
    createdAt: now,
  };

  // 2. Mentor
  const mentor: MentorEntity = {
    id: 'men-001',
    mentorName: 'Dr. Priya Sharma (Associate Prof, CSE)',
    email: 'dr.sharma@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    phoneNumber: '+91 98765 43210',
    role: 'MENTOR',
    createdAt: now,
  };

  // 3. Parent
  const parent: ParentEntity = {
    id: 'par-001',
    parentName: 'Mr. Ramesh Patel',
    email: 'parent.rahul@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11223',
    studentEmail: 'rahul.cse@college.edu',
    studentRollNumber: '21CS042',
    role: 'PARENT',
    createdAt: now,
  };

  // 4. Class Incharge
  const classIncharge: ClassInchargeEntity = {
    id: 'cic-001',
    name: 'Prof. Rajesh Verma',
    email: 'prof.verma@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    role: 'CLASS_INCHARGE',
    createdAt: now,
  };

  // 5. HOD
  const hod: HODEntity = {
    id: 'hod-001',
    name: 'Dr. Anand Kumar (Head of Department, CSE)',
    email: 'hod.cse@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    role: 'HOD',
    createdAt: now,
  };

  // 6. Security Officer
  const securityOfficer: SecurityEntity = {
    id: 'sec-001',
    name: 'Officer Mahendra Singh',
    email: 'security.gate1@college.edu',
    password: defaultPasswordHash,
    gateNumber: 'Main Campus Gate 1 (North Arch)',
    role: 'SECURITY',
    createdAt: now,
  };

  // 7. Students
  const student1: StudentEntity = {
    id: 'stu-001',
    studentName: 'Rahul Patel',
    rollNumber: '21CS042',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    email: 'rahul.cse@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56789',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.rahul@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  const student2: StudentEntity = {
    id: 'stu-002',
    studentName: 'Ananya Deshmukh',
    rollNumber: '21CS015',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    email: 'ananya.cse@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 92345 67890',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.ananya@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  // Sample leaves representing different stages for clear testing
  // Leave 1: Rahul Patel - In progress (Mentor Approved, waiting Parent approval)
  const leave1: LeaveEntity = {
    id: 'LV-2026-001',
    studentId: student1.id,
    studentName: student1.studentName,
    studentRollNumber: student1.rollNumber,
    studentEmail: student1.email,
    department: student1.department,
    year: student1.year,
    section: student1.section,
    phoneNumber: student1.phoneNumber,
    mentorEmail: student1.mentorEmail,
    parentEmail: student1.parentEmail,
    leaveType: 'HOME_VISIT',
    fromDate: '2026-09-20',
    toDate: '2026-09-22',
    reason: 'Family wedding ceremony in hometown. Need to travel over the weekend.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Verified student academic standing. Attendance is 88%. Approved.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    parentStatus: 'PENDING',
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  };

  // Leave 2: Rahul Patel - Fully APPROVED with active OTP ready for Gate Security!
  const otpCode = '749215';
  const leave2: LeaveEntity = {
    id: 'LV-2026-002',
    studentId: student1.id,
    studentName: student1.studentName,
    studentRollNumber: student1.rollNumber,
    studentEmail: student1.email,
    department: student1.department,
    year: student1.year,
    section: student1.section,
    phoneNumber: student1.phoneNumber,
    mentorEmail: student1.mentorEmail,
    parentEmail: student1.parentEmail,
    leaveType: 'EMERGENCY',
    fromDate: '2026-09-17',
    toDate: '2026-09-18',
    reason: 'Urgent medical consultation and dental surgery appointment.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Medical certificate copy reviewed. Approved.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 7).toISOString(),
    parentStatus: 'APPROVED',
    parentRemarks: 'Informed and agreed. Travelling with family.',
    parentActionAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    classInchargeStatus: 'APPROVED',
    classInchargeRemarks: 'Mid-term exams already concluded. No test conflict. Approved.',
    classInchargeActionAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    hodStatus: 'APPROVED',
    hodRemarks: 'Final HOD clearance granted. Safe journey.',
    hodActionAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    overallStatus: 'APPROVED',
    otpCode: otpCode,
    otpGeneratedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    otpExpiresAt: new Date(Date.now() + 3600 * 1000 * 22).toISOString(),
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  };

  const otp2: OTPEntity = {
    id: 'otp-002',
    leaveId: leave2.id,
    otpCode: otpCode,
    generatedAt: leave2.otpGeneratedAt!,
    expiresAt: leave2.otpExpiresAt!,
    verified: false,
    attempts: 0,
  };

  db = {
    students: [student1, student2],
    mentors: [mentor],
    parents: [parent],
    classIncharges: [classIncharge],
    hods: [hod],
    admins: [admin],
    securityOfficers: [securityOfficer],
    leaves: [leave1, leave2],
    otps: [otp2],
  };

  saveDb();
}

function clearData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const now = new Date().toISOString();

  // Preserves Admins
  const preservedAdmins: AdminEntity[] = (db.admins && db.admins.length > 0)
    ? [...db.admins]
    : [
        {
          id: 'adm-001',
          name: 'Dr. S. K. Narayanan (Principal & System Admin)',
          email: 'admin@college.edu',
          password: defaultPasswordHash,
          role: 'ADMIN',
          createdAt: now,
        },
      ];

  // Preserve or ensure standard demo role users so testing logins never fail with 401
  const preservedStudents: StudentEntity[] = (db.students && db.students.length > 0)
    ? [db.students[0]]
    : [
        {
          id: 'stu-101',
          studentName: 'Rahul Kumar',
          rollNumber: '23CS101',
          department: 'Computer Science & Engineering',
          year: 3,
          section: 'A',
          email: 'rahul.cse@college.edu',
          password: defaultPasswordHash,
          phoneNumber: '+91 91234 56701',
          mentorEmail: 'dr.sharma@college.edu',
          parentEmail: 'parent.rahul@gmail.com',
          role: 'STUDENT',
          createdAt: now,
        },
      ];

  const preservedMentors: MentorEntity[] = (db.mentors && db.mentors.length > 0)
    ? [db.mentors[0]]
    : [
        {
          id: 'men-001',
          mentorName: 'Dr. Priya Sharma (Associate Prof, CSE)',
          email: 'dr.sharma@college.edu',
          password: defaultPasswordHash,
          department: 'Computer Science & Engineering',
          year: 3,
          section: 'A',
          phoneNumber: '+91 98765 43210',
          role: 'MENTOR',
          createdAt: now,
        },
      ];

  const preservedParents: ParentEntity[] = (db.parents && db.parents.length > 0)
    ? [db.parents[0]]
    : [
        {
          id: 'par-001',
          parentName: 'Mr. Ramesh Patel',
          email: 'parent.rahul@gmail.com',
          password: defaultPasswordHash,
          phoneNumber: '+91 98450 11223',
          studentEmail: 'rahul.cse@college.edu',
          studentRollNumber: '23CS101',
          role: 'PARENT',
          createdAt: now,
        },
      ];

  const preservedClassIncharges: ClassInchargeEntity[] = (db.classIncharges && db.classIncharges.length > 0)
    ? [db.classIncharges[0]]
    : [
        {
          id: 'cic-001',
          name: 'Prof. Rajesh Verma',
          email: 'prof.verma@college.edu',
          password: defaultPasswordHash,
          department: 'Computer Science & Engineering',
          year: 3,
          section: 'A',
          role: 'CLASS_INCHARGE',
          createdAt: now,
        },
      ];

  const preservedHods: HODEntity[] = (db.hods && db.hods.length > 0)
    ? [db.hods[0]]
    : [
        {
          id: 'hod-001',
          name: 'Dr. Anand Kumar (Head of Department, CSE)',
          email: 'hod.cse@college.edu',
          password: defaultPasswordHash,
          department: 'Computer Science & Engineering',
          role: 'HOD',
          createdAt: now,
        },
      ];

  const preservedSecurityOfficers: SecurityEntity[] = (db.securityOfficers && db.securityOfficers.length > 0)
    ? [db.securityOfficers[0]]
    : [
        {
          id: 'sec-001',
          name: 'Officer Mahendra Singh',
          email: 'security.gate1@college.edu',
          password: defaultPasswordHash,
          gateNumber: 'Main Campus Gate 1',
          role: 'SECURITY',
          createdAt: now,
        },
      ];

  // Completely clears all leave application records and OTP codes
  db = {
    students: preservedStudents,
    mentors: preservedMentors,
    parents: preservedParents,
    classIncharges: preservedClassIncharges,
    hods: preservedHods,
    admins: preservedAdmins,
    securityOfficers: preservedSecurityOfficers,
    leaves: [],
    otps: [],
  };

  saveDb();
}

function loadDemoData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const now = new Date().toISOString();

  // Admin (keep existing admin or ensure admin exists)
  const admin: AdminEntity = (db.admins && db.admins.length > 0)
    ? db.admins[0]
    : {
        id: 'adm-001',
        name: 'Dr. S. K. Narayanan (Principal & System Admin)',
        email: 'admin@college.edu',
        password: defaultPasswordHash,
        role: 'ADMIN',
        createdAt: now,
      };

  // Mentors (2)
  const mentor1: MentorEntity = {
    id: 'men-001',
    mentorName: 'Dr. Priya Sharma (Associate Prof, CSE)',
    email: 'dr.sharma@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    phoneNumber: '+91 98765 43210',
    role: 'MENTOR',
    createdAt: now,
  };

  const mentor2: MentorEntity = {
    id: 'men-002',
    mentorName: 'Dr. Arvind Nair (Professor, ECE)',
    email: 'dr.nair@college.edu',
    password: defaultPasswordHash,
    department: 'Electronics & Communication',
    year: 3,
    section: 'A',
    phoneNumber: '+91 98765 43211',
    role: 'MENTOR',
    createdAt: now,
  };

  // Class Incharges (2)
  const classIncharge1: ClassInchargeEntity = {
    id: 'cic-001',
    name: 'Prof. Rajesh Verma',
    email: 'prof.verma@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    role: 'CLASS_INCHARGE',
    createdAt: now,
  };

  const classIncharge2: ClassInchargeEntity = {
    id: 'cic-002',
    name: 'Prof. Anita Desai',
    email: 'prof.desai@college.edu',
    password: defaultPasswordHash,
    department: 'Electronics & Communication',
    year: 3,
    section: 'A',
    role: 'CLASS_INCHARGE',
    createdAt: now,
  };

  // HODs (2)
  const hod1: HODEntity = {
    id: 'hod-001',
    name: 'Dr. Anand Kumar (Head of Department, CSE)',
    email: 'hod.cse@college.edu',
    password: defaultPasswordHash,
    department: 'Computer Science & Engineering',
    role: 'HOD',
    createdAt: now,
  };

  const hod2: HODEntity = {
    id: 'hod-002',
    name: 'Dr. Meenakshi Sundaram (Head of Department, ECE)',
    email: 'hod.ece@college.edu',
    password: defaultPasswordHash,
    department: 'Electronics & Communication',
    role: 'HOD',
    createdAt: now,
  };

  // Security Officers (2)
  const sec1: SecurityEntity = {
    id: 'sec-001',
    name: 'Officer Mahendra Singh',
    email: 'security.gate1@college.edu',
    password: defaultPasswordHash,
    gateNumber: 'Main Campus Gate 1',
    role: 'SECURITY',
    createdAt: now,
  };

  const sec2: SecurityEntity = {
    id: 'sec-002',
    name: 'Officer Suresh Yadav',
    email: 'security.gate2@college.edu',
    password: defaultPasswordHash,
    gateNumber: 'North Hostel Gate 2',
    role: 'SECURITY',
    createdAt: now,
  };

  // Students (5)
  const stu1: StudentEntity = {
    id: 'stu-101',
    studentName: 'Rahul Kumar',
    rollNumber: '23CS101',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    email: 'rahul.cse@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56701',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.rahul@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  const stu2: StudentEntity = {
    id: 'stu-102',
    studentName: 'Ananya Deshmukh',
    rollNumber: '23CS102',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    email: 'ananya.cse@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56702',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.ananya@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  const stu3: StudentEntity = {
    id: 'stu-103',
    studentName: 'Rohan Sharma',
    rollNumber: '23CS103',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    email: 'rohan.cse@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56703',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.rohan@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  const stu4: StudentEntity = {
    id: 'stu-104',
    studentName: 'Sneha Reddy',
    rollNumber: '23EC101',
    department: 'Electronics & Communication',
    year: 3,
    section: 'A',
    email: 'sneha.ece@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56704',
    mentorEmail: 'dr.nair@college.edu',
    parentEmail: 'parent.sneha@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  const stu5: StudentEntity = {
    id: 'stu-105',
    studentName: 'Vikram Malhotra',
    rollNumber: '23EC102',
    department: 'Electronics & Communication',
    year: 3,
    section: 'A',
    email: 'vikram.ece@college.edu',
    password: defaultPasswordHash,
    phoneNumber: '+91 91234 56705',
    mentorEmail: 'dr.nair@college.edu',
    parentEmail: 'parent.vikram@gmail.com',
    role: 'STUDENT',
    createdAt: now,
  };

  // Parents (5)
  const par1: ParentEntity = {
    id: 'par-101',
    parentName: 'Mr. Suresh Kumar',
    email: 'parent.rahul@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11001',
    studentEmail: 'rahul.cse@college.edu',
    studentRollNumber: '23CS101',
    role: 'PARENT',
    createdAt: now,
  };

  const par2: ParentEntity = {
    id: 'par-102',
    parentName: 'Mrs. Meera Deshmukh',
    email: 'parent.ananya@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11002',
    studentEmail: 'ananya.cse@college.edu',
    studentRollNumber: '23CS102',
    role: 'PARENT',
    createdAt: now,
  };

  const par3: ParentEntity = {
    id: 'par-103',
    parentName: 'Mr. Alok Sharma',
    email: 'parent.rohan@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11003',
    studentEmail: 'rohan.cse@college.edu',
    studentRollNumber: '23CS103',
    role: 'PARENT',
    createdAt: now,
  };

  const par4: ParentEntity = {
    id: 'par-104',
    parentName: 'Mr. K. V. Reddy',
    email: 'parent.sneha@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11004',
    studentEmail: 'sneha.ece@college.edu',
    studentRollNumber: '23EC101',
    role: 'PARENT',
    createdAt: now,
  };

  const par5: ParentEntity = {
    id: 'par-105',
    parentName: 'Mrs. Sunita Malhotra',
    email: 'parent.vikram@gmail.com',
    password: defaultPasswordHash,
    phoneNumber: '+91 98450 11005',
    studentEmail: 'vikram.ece@college.edu',
    studentRollNumber: '23EC102',
    role: 'PARENT',
    createdAt: now,
  };

  // Leaves & OTPs representing each workflow stage

  // Leave 1: Rahul Kumar - Pending at Mentor stage
  const leave1: LeaveEntity = {
    id: 'LV-2026-101',
    studentId: stu1.id,
    studentName: stu1.studentName,
    studentRollNumber: stu1.rollNumber,
    studentEmail: stu1.email,
    department: stu1.department,
    year: stu1.year,
    section: stu1.section,
    phoneNumber: stu1.phoneNumber,
    mentorEmail: stu1.mentorEmail,
    parentEmail: stu1.parentEmail,
    leaveType: 'HOME_VISIT',
    fromDate: '2026-09-21',
    toDate: '2026-09-23',
    reason: 'Family festival celebration in native town.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    mentorStatus: 'PENDING',
    parentStatus: 'PENDING',
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  };

  // Leave 2: Ananya Deshmukh - Pending at Parent stage (Mentor Approved)
  const leave2: LeaveEntity = {
    id: 'LV-2026-102',
    studentId: stu2.id,
    studentName: stu2.studentName,
    studentRollNumber: stu2.rollNumber,
    studentEmail: stu2.email,
    department: stu2.department,
    year: stu2.year,
    section: stu2.section,
    phoneNumber: stu2.phoneNumber,
    mentorEmail: stu2.mentorEmail,
    parentEmail: stu2.parentEmail,
    leaveType: 'CASUAL',
    fromDate: '2026-09-22',
    toDate: '2026-09-24',
    reason: 'Attending cousin sister wedding reception.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Attendance is 86%. Recommended for leave.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    parentStatus: 'PENDING',
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  };

  // Leave 3: Rohan Sharma - Pending at Class Incharge stage (Mentor & Parent Approved)
  const leave3: LeaveEntity = {
    id: 'LV-2026-103',
    studentId: stu3.id,
    studentName: stu3.studentName,
    studentRollNumber: stu3.rollNumber,
    studentEmail: stu3.email,
    department: stu3.department,
    year: stu3.year,
    section: stu3.section,
    phoneNumber: stu3.phoneNumber,
    mentorEmail: stu3.mentorEmail,
    parentEmail: stu3.parentEmail,
    leaveType: 'ACADEMIC',
    fromDate: '2026-09-23',
    toDate: '2026-09-25',
    reason: 'Presenting research paper at IEEE Regional Tech Conference.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Paper acceptance certificate verified. Approved.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 15).toISOString(),
    parentStatus: 'APPROVED',
    parentRemarks: 'We are aware and consent to outstation travel.',
    parentActionAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  };

  // Leave 4: Sneha Reddy - Pending at HOD stage (Mentor, Parent & Class Incharge Approved)
  const leave4: LeaveEntity = {
    id: 'LV-2026-104',
    studentId: stu4.id,
    studentName: stu4.studentName,
    studentRollNumber: stu4.rollNumber,
    studentEmail: stu4.email,
    department: stu4.department,
    year: stu4.year,
    section: stu4.section,
    phoneNumber: stu4.phoneNumber,
    mentorEmail: stu4.mentorEmail,
    parentEmail: stu4.parentEmail,
    leaveType: 'SICK',
    fromDate: '2026-09-20',
    toDate: '2026-09-22',
    reason: 'Severe viral fever and physician recommended clinical bed rest.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Medical prescription reviewed and confirmed.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    parentStatus: 'APPROVED',
    parentRemarks: 'Parent confirmed student illness and doctor advice.',
    parentActionAt: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    classInchargeStatus: 'APPROVED',
    classInchargeRemarks: 'Lab practicals will be rescheduled upon return.',
    classInchargeActionAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    hodStatus: 'PENDING',
    overallStatus: 'PENDING',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
  };

  // Leave 5: Vikram Malhotra - Overall APPROVED with active 6-digit OTP code ready for gate clearance!
  const otpCode5 = '842619';
  const leave5: LeaveEntity = {
    id: 'LV-2026-105',
    studentId: stu5.id,
    studentName: stu5.studentName,
    studentRollNumber: stu5.rollNumber,
    studentEmail: stu5.email,
    department: stu5.department,
    year: stu5.year,
    section: stu5.section,
    phoneNumber: stu5.phoneNumber,
    mentorEmail: stu5.mentorEmail,
    parentEmail: stu5.parentEmail,
    leaveType: 'EMERGENCY',
    fromDate: '2026-09-17',
    toDate: '2026-09-19',
    reason: 'Urgent passport and biometric document renewal at Regional Passport Seva Kendra.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Appointment slip confirmed.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    parentStatus: 'APPROVED',
    parentRemarks: 'Approved with full parental consent.',
    parentActionAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    classInchargeStatus: 'APPROVED',
    classInchargeRemarks: 'No internal examinations pending today.',
    classInchargeActionAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    hodStatus: 'APPROVED',
    hodRemarks: 'Final HOD clearance granted. Official out-pass authorized.',
    hodActionAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    overallStatus: 'APPROVED',
    otpCode: otpCode5,
    otpGeneratedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    otpExpiresAt: new Date(Date.now() + 3600 * 1000 * 22).toISOString(),
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  };

  const otpRecord5: OTPEntity = {
    id: 'otp-105',
    leaveId: leave5.id,
    otpCode: otpCode5,
    generatedAt: leave5.otpGeneratedAt!,
    expiresAt: leave5.otpExpiresAt!,
    verified: false,
    attempts: 0,
  };

  // Leave 6: Rahul Kumar - COMPLETED & SECURITY VERIFIED (EXIT CLEARED & STAMPED)
  // Matches exact display requested by the user prompt!
  const otpCode6 = '519302';
  const leave6: LeaveEntity = {
    id: 'LV-2026-106',
    studentId: stu1.id,
    studentName: 'Rahul Kumar',
    studentRollNumber: '23CS101',
    studentEmail: stu1.email,
    department: 'CSE',
    year: 3,
    section: 'A',
    phoneNumber: stu1.phoneNumber,
    mentorEmail: stu1.mentorEmail,
    parentEmail: stu1.parentEmail,
    leaveType: 'CASUAL',
    fromDate: '17 Sep 2026, 10:00 AM',
    toDate: '17 Sep 2026, 4:00 PM',
    reason: 'Official inter-college hackathon event participation.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    mentorStatus: 'APPROVED',
    mentorRemarks: 'Hackathon team registered and approved.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    parentStatus: 'APPROVED',
    parentRemarks: 'Parent consent granted.',
    parentActionAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
    classInchargeStatus: 'APPROVED',
    classInchargeRemarks: 'Permission granted.',
    classInchargeActionAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    hodStatus: 'APPROVED',
    hodRemarks: 'Representing college at hackathon. Approved.',
    hodActionAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    overallStatus: 'APPROVED',
    otpCode: otpCode6,
    otpGeneratedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    otpExpiresAt: new Date(Date.now() + 3600 * 1000 * 20).toISOString(),
    securityVerified: true,
    securityVerifiedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    securityGate: 'Main Gate',
    securityOfficerName: 'Officer Mahendra Singh',
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  };

  const otpRecord6: OTPEntity = {
    id: 'otp-106',
    leaveId: leave6.id,
    otpCode: otpCode6,
    generatedAt: leave6.otpGeneratedAt!,
    expiresAt: leave6.otpExpiresAt!,
    verified: true,
    verifiedAt: leave6.securityVerifiedAt,
    attempts: 1,
  };

  // Leave 7: Ananya Deshmukh - REJECTED leave
  const leave7: LeaveEntity = {
    id: 'LV-2026-107',
    studentId: stu2.id,
    studentName: stu2.studentName,
    studentRollNumber: stu2.rollNumber,
    studentEmail: stu2.email,
    department: 'Computer Science & Engineering',
    year: stu2.year,
    section: stu2.section,
    phoneNumber: stu2.phoneNumber,
    mentorEmail: stu2.mentorEmail,
    parentEmail: stu2.parentEmail,
    leaveType: 'CASUAL',
    fromDate: '2026-09-18',
    toDate: '2026-09-19',
    reason: 'Personal recreation trip.',
    appliedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    mentorStatus: 'REJECTED',
    mentorRemarks: 'Attendance is below 75% statutory requirement. Leave denied.',
    mentorActionAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    parentStatus: 'PENDING',
    classInchargeStatus: 'PENDING',
    hodStatus: 'PENDING',
    overallStatus: 'REJECTED',
    rejectionReason: 'Rejected by Mentor: Attendance is below 75% statutory requirement. Leave denied.',
    rejectedBy: 'Mentor',
    securityVerified: false,
    cancelled: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
  };

  db = {
    students: [stu1, stu2, stu3, stu4, stu5],
    mentors: [mentor1, mentor2],
    parents: [par1, par2, par3, par4, par5],
    classIncharges: [classIncharge1, classIncharge2],
    hods: [hod1, hod2],
    admins: [admin],
    securityOfficers: [sec1, sec2],
    leaves: [leave1, leave2, leave3, leave4, leave5, leave6, leave7],
    otps: [otpRecord5, otpRecord6],
  };

  saveDb();

  return {
    studentsCreated: db.students.length,
    mentorsCreated: db.mentors.length,
    parentsCreated: db.parents.length,
    classInchargesCreated: db.classIncharges.length,
    hodsCreated: db.hods.length,
    leavesCreated: db.leaves.length,
  };
}

loadDb();

export const Database = {
  get db() {
    return db;
  },
  save: saveDb,
  reload: loadDb,
  clearData,
  loadDemoData,
};
