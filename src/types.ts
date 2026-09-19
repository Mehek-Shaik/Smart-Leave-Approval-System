export type UserRole =
  | 'STUDENT'
  | 'MENTOR'
  | 'PARENT'
  | 'CLASS_INCHARGE'
  | 'HOD'
  | 'ADMIN'
  | 'SECURITY';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type LeaveType = 'SICK' | 'CASUAL' | 'ACADEMIC' | 'EMERGENCY' | 'HOME_VISIT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: number;
  section?: string;
  rollNumber?: string;
  phoneNumber?: string;
  mentorEmail?: string;
  parentEmail?: string;
  studentEmail?: string;
  studentRollNumber?: string;
  gateNumber?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  studentEmail: string;
  department: string;
  year: number;
  section: string;
  phoneNumber?: string;
  mentorEmail?: string;
  parentEmail?: string;

  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  appliedAt: string;

  mentorStatus: LeaveStatus;
  mentorRemarks?: string;
  mentorActionAt?: string;

  parentStatus: LeaveStatus;
  parentRemarks?: string;
  parentActionAt?: string;

  classInchargeStatus: LeaveStatus;
  classInchargeRemarks?: string;
  classInchargeActionAt?: string;

  hodStatus: LeaveStatus;
  hodRemarks?: string;
  hodActionAt?: string;

  overallStatus: LeaveStatus;
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

export interface AdminStats {
  totalStudents: number;
  totalMentors: number;
  totalParents: number;
  totalClassIncharges: number;
  totalHods: number;
  totalSecurityOfficers: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
  securityVerifiedLeaves: number;
  pendingAtMentor: number;
  pendingAtParent: number;
  pendingAtClassIncharge: number;
  pendingAtHOD: number;
}
