// Integration test script for Smart Leave Approval System
// Comprehensive test suite for all 16 Requirements

const BASE_URL = 'http://127.0.0.1:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING SMART LEAVE WORKFLOW INTEGRATION TESTS');
  console.log('======================================================\n');

  // Step 1: Authentication & Token Acquisition
  console.log('--- Step 1: Authentication & Token Acquisition ---');
  const studentLogin = await request('/api/students/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'rahul.cse@college.edu', password: 'password123' }),
  });
  assert(studentLogin.status === 200, 'Student login successful');
  const studentToken = studentLogin.data.token;

  const mentorLogin = await request('/api/mentors/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dr.sharma@college.edu', password: 'password123' }),
  });
  assert(mentorLogin.status === 200, 'Mentor login successful');
  const mentorToken = mentorLogin.data.token;

  const parentLogin = await request('/api/parents/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'parent.rahul@gmail.com', password: 'password123' }),
  });
  assert(parentLogin.status === 200, 'Parent login successful');
  const parentToken = parentLogin.data.token;

  const inchargeLogin = await request('/api/classincharges/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'prof.verma@college.edu', password: 'password123' }),
  });
  assert(inchargeLogin.status === 200, 'Class Incharge login successful');
  const inchargeToken = inchargeLogin.data.token;

  const hodLogin = await request('/api/hods/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hod.cse@college.edu', password: 'password123' }),
  });
  assert(hodLogin.status === 200, 'HOD login successful');
  const hodToken = hodLogin.data.token;

  const securityLogin = await request('/api/security/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'security.gate1@college.edu', password: 'password123' }),
  });
  assert(securityLogin.status === 200, 'Security officer login successful');
  const securityToken = securityLogin.data.token;

  const adminLogin = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@college.edu', password: 'password123' }),
  });
  assert(adminLogin.status === 200, 'Admin login successful');
  const adminToken = adminLogin.data.token;

  // Step 2: Student applies for leave
  console.log('\n--- Step 2: Student Applies for Leave ---');
  const applyRes = await request('/api/leave/apply', {
    method: 'POST',
    token: studentToken,
    body: JSON.stringify({
      leaveType: 'CASUAL',
      fromDate: '2026-09-25',
      toDate: '2026-09-26',
      reason: 'Attending regional robotics conference presentation.',
    }),
  });
  assert(applyRes.status === 201, 'Student leave application submitted successfully');
  const newLeaveId = applyRes.data.leave.id;
  console.log(`Created leave application ID: ${newLeaveId}`);

  // Step 3: Test Stage Skipping Prevention
  console.log('\n--- Step 3: Enforce No Stage Skipping ---');

  // Requirement 2: Parent cannot approve before mentor
  const prematureParent = await request(`/api/parents/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: parentToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Parent skipping ahead' }),
  });
  assert(prematureParent.status === 400, 'Requirement 2: Parent blocked when mentor has not approved');
  assert(prematureParent.data.message.includes('Mentor approval is required before Parent'), 'Error message states mentor approval required');

  // Requirement 3: Class incharge cannot approve before mentor and parent
  const prematureIncharge = await request(`/api/classincharges/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: inchargeToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Incharge skipping ahead' }),
  });
  assert(prematureIncharge.status === 400, 'Requirement 3: Class Incharge blocked when mentor/parent has not approved');

  // Requirement 4: HOD cannot approve before prior levels
  const prematureHOD = await request(`/api/hods/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: hodToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'HOD skipping ahead' }),
  });
  assert(prematureHOD.status === 400, 'Requirement 4: HOD blocked when prior approvals are missing');

  // Requirement 12: Security cannot verify pending leaves
  const securityOnPending = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: '123456', queryIdentifier: newLeaveId }),
  });
  assert(securityOnPending.status === 400, 'Requirement 12: Security cannot verify unapproved/pending leave');

  // Step 4: Mentor Approval & Duplicate Prevention
  console.log('\n--- Step 4: Mentor Approval (Step 1) ---');
  const mentorApproval = await request(`/api/mentors/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: mentorToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Verified conference details. Approved.' }),
  });
  assert(mentorApproval.status === 200, 'Requirement 1: Mentor approved pending leave');
  assert(mentorApproval.data.leave.mentorStatus === 'APPROVED', 'Leave mentorStatus is APPROVED');

  // Requirement 15: Mentor duplicate approval prevented
  const mentorDuplicate = await request(`/api/mentors/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: mentorToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Duplicate try' }),
  });
  assert(mentorDuplicate.status === 400, 'Requirement 15: Duplicate mentor approval prohibited');

  // Step 5: Parent Approval (Step 2)
  console.log('\n--- Step 5: Parent Approval (Step 2) ---');
  const inchargeStillBlocked = await request(`/api/classincharges/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: inchargeToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Trying before parent' }),
  });
  assert(inchargeStillBlocked.status === 400, 'Requirement 3: Class Incharge blocked before Parent approved');

  const parentApproval = await request(`/api/parents/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: parentToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Parent consent provided by phone.' }),
  });
  assert(parentApproval.status === 200, 'Requirement 2: Parent approved after mentor approved');
  assert(parentApproval.data.leave.parentStatus === 'APPROVED', 'Leave parentStatus is APPROVED');

  // Requirement 15: Parent duplicate approval prohibited
  const parentDuplicate = await request(`/api/parents/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: parentToken,
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(parentDuplicate.status === 400, 'Requirement 15: Duplicate parent approval prohibited');

  // Step 6: Class Incharge Approval (Step 3)
  console.log('\n--- Step 6: Class Incharge Approval (Step 3) ---');
  const inchargeApproval = await request(`/api/classincharges/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: inchargeToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'No academic tests scheduled. Approved.' }),
  });
  assert(inchargeApproval.status === 200, 'Requirement 3: Class Incharge approved');
  assert(inchargeApproval.data.leave.classInchargeStatus === 'APPROVED', 'Leave classInchargeStatus is APPROVED');

  // Requirement 15: Class Incharge duplicate approval prohibited
  const inchargeDuplicate = await request(`/api/classincharges/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: inchargeToken,
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(inchargeDuplicate.status === 400, 'Requirement 15: Duplicate Class Incharge approval prohibited');

  // Step 7: HOD Approval & OTP Generation (Step 4)
  console.log('\n--- Step 7: HOD Approval & Automatic OTP Generation ---');
  const hodLeaves = await request('/api/hods/leaves', { token: hodToken });
  assert(hodLeaves.status === 200, 'GET /hods/leaves endpoint works');

  const hodApproval = await request(`/api/hods/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: hodToken,
    body: JSON.stringify({ action: 'APPROVE', remarks: 'Final clearance granted by HOD. Excellent representation.' }),
  });
  assert(hodApproval.status === 200, 'HOD approval granted');
  const approvedLeave = hodApproval.data.leave;

  // Requirement 5: Overall status must be APPROVED
  assert(approvedLeave.overallStatus === 'APPROVED', 'Requirement 5: HOD approval sets overall status to APPROVED');

  // Requirement 6: OTP generated automatically
  assert(typeof approvedLeave.otpCode === 'string' && approvedLeave.otpCode.length === 6, 'Requirement 6: 6-digit OTP generated automatically');

  // Requirement 7: OTP expiration time
  assert(approvedLeave.otpExpiresAt && new Date(approvedLeave.otpExpiresAt) > new Date(), 'Requirement 7: OTP has future expiration time');

  // Requirement 8: OTP associated with correct leave
  assert(approvedLeave.id === newLeaveId, 'Requirement 8: OTP correctly associated with leave');

  // Requirement 15: HOD duplicate approval prohibited
  const hodDuplicate = await request(`/api/hods/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: hodToken,
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(hodDuplicate.status === 400, 'Requirement 15: Duplicate HOD approval prohibited');

  const generatedOtp = approvedLeave.otpCode;
  console.log(`Generated Gate Clearance OTP: ${generatedOtp} (expires at: ${approvedLeave.otpExpiresAt})`);

  // Step 8: Security Verification & OTP Validation
  console.log('\n--- Step 8: Security Gate Terminal Verification ---');

  // Requirement 9: Invalid OTP rejected
  const invalidOtp1 = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: '999999', gateNumber: 'Main Gate 1' }),
  });
  assert(invalidOtp1.status === 400, 'Requirement 9: Non-existent OTP rejected with 400');

  const invalidOtpFormat = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: '123', gateNumber: 'Main Gate 1' }),
  });
  assert(invalidOtpFormat.status === 400, 'Requirement 9: Invalid OTP length/format rejected with 400');

  // Requirement 9: OTP mismatch with queryIdentifier
  const mismatchQuery = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: '111111', queryIdentifier: newLeaveId, gateNumber: 'Main Gate 1' }),
  });
  assert(mismatchQuery.status === 400, 'Requirement 9: Wrong OTP for specified queryIdentifier rejected');

  // Requirement 13: Security verification succeeds with valid OTP and updates verification status
  const validVerification = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({
      otpCode: generatedOtp,
      queryIdentifier: '21CS042',
      gateNumber: 'North Arch Gate 1',
    }),
  });
  assert(validVerification.status === 200, 'Requirement 13: Security verification successful with correct OTP');
  assert(validVerification.data.leave.securityVerified === true, 'Requirement 13: Leave marked as securityVerified = true');
  assert(validVerification.data.leave.securityVerifiedAt, 'Requirement 13: Verification timestamp recorded');
  assert(validVerification.data.leave.securityGate === 'North Arch Gate 1', 'Requirement 13: Gate number recorded');

  // Requirement 11: Already verified OTP must not be reusable!
  const reuseAttempt = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: generatedOtp, gateNumber: 'North Arch Gate 1' }),
  });
  assert(reuseAttempt.status === 400, 'Requirement 11: Reusing verified OTP is strictly blocked');
  assert(reuseAttempt.data.message.includes('cannot be reused'), 'Rejection message explains OTP reuse is not permitted');

  // Step 9: Expired OTP Testing (Requirement 10)
  console.log('\n--- Step 9: Expired OTP Testing (Requirement 10) ---');
  // Student creates another leave, approved all the way through, then we simulate expiry via database update
  const apply3 = await request('/api/leave/apply', {
    method: 'POST',
    token: studentToken,
    body: JSON.stringify({
      leaveType: 'SICK',
      fromDate: '2026-09-28',
      toDate: '2026-09-29',
      reason: 'Medical checkup and dental procedure.',
    }),
  });
  const expLeaveId = apply3.data.leave.id;
  await request(`/api/mentors/leaves/${expLeaveId}`, { method: 'PUT', token: mentorToken, body: JSON.stringify({ action: 'APPROVE' }) });
  await request(`/api/parents/leaves/${expLeaveId}`, { method: 'PUT', token: parentToken, body: JSON.stringify({ action: 'APPROVE' }) });
  await request(`/api/classincharges/leaves/${expLeaveId}`, { method: 'PUT', token: inchargeToken, body: JSON.stringify({ action: 'APPROVE' }) });
  const hodResExp = await request(`/api/hods/leaves/${expLeaveId}`, { method: 'PUT', token: hodToken, body: JSON.stringify({ action: 'APPROVE' }) });
  const expOtp = hodResExp.data.leave.otpCode;

  // Now simulate expiration by updating the file and reloading db
  const fs = await import('fs');
  const dbData = JSON.parse(fs.readFileSync('./smart_leave_db.json', 'utf-8'));
  const targetLeave = dbData.leaves.find(l => l.id === expLeaveId);
  if (targetLeave) {
    targetLeave.otpExpiresAt = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
  }
  const targetOtp = dbData.otps.find(o => o.leaveId === expLeaveId);
  if (targetOtp) {
    targetOtp.expiresAt = new Date(Date.now() - 3600 * 1000).toISOString();
  }
  fs.writeFileSync('./smart_leave_db.json', JSON.stringify(dbData, null, 2));

  // Reload db in server
  await request('/api/admin/db/reload', { method: 'POST', token: adminToken });

  // Security officer tries to verify expired OTP
  const expiredVerify = await request('/api/security/verify', {
    method: 'POST',
    token: securityToken,
    body: JSON.stringify({ otpCode: expOtp }),
  });
  assert(expiredVerify.status === 400, 'Requirement 10: Expired OTP rejected with 400');
  assert(expiredVerify.data.message.includes('expired'), 'Requirement 10: Error message specifically states OTP has expired');

  // Step 10: Role-Based Authorization Restrictions (Requirement 16)
  console.log('\n--- Step 10: Role Authorization Enforcement (Requirement 16) ---');

  // Student cannot access HOD PUT endpoint
  const studentAsHOD = await request(`/api/hods/leaves/${newLeaveId}`, {
    method: 'PUT',
    token: studentToken,
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(studentAsHOD.status === 403, 'Requirement 16: Student blocked from HOD approval (403 Forbidden)');

  // Student cannot access Security verify endpoint
  const studentAsSecurity = await request('/api/security/verify', {
    method: 'POST',
    token: studentToken,
    body: JSON.stringify({ otpCode: '749215' }),
  });
  assert(studentAsSecurity.status === 403, 'Requirement 16: Student blocked from Security verify (403 Forbidden)');

  // Unauthenticated request
  const unauthVerify = await request('/api/security/verify', {
    method: 'POST',
    body: JSON.stringify({ otpCode: '749215' }),
  });
  assert(unauthVerify.status === 401, 'Requirement 16: Missing token returns 401 Unauthorized');

  // Step 11: Rejection Workflow (Requirement 14)
  console.log('\n--- Step 11: Rejection Workflow (Requirement 14) ---');
  const apply4 = await request('/api/leave/apply', {
    method: 'POST',
    token: studentToken,
    body: JSON.stringify({
      leaveType: 'CASUAL',
      fromDate: '2026-10-01',
      toDate: '2026-10-02',
      reason: 'Personal recreation',
    }),
  });
  const rejectLeaveId = apply4.data.leave.id;

  // Mentor rejects it
  const mentorReject = await request(`/api/mentors/leaves/${rejectLeaveId}`, {
    method: 'PUT',
    token: mentorToken,
    body: JSON.stringify({ action: 'REJECT', reason: 'Non-essential activity during test prep week.' }),
  });
  assert(mentorReject.status === 200, 'Mentor rejection succeeds');
  assert(mentorReject.data.leave.overallStatus === 'REJECTED', 'Requirement 14: Overall status is set to REJECTED');
  assert(!mentorReject.data.leave.otpCode, 'Requirement 14: No OTP generated on rejection');

  // Downstream Parent cannot approve a rejected leave
  const parentOnRejected = await request(`/api/parents/leaves/${rejectLeaveId}`, {
    method: 'PUT',
    token: parentToken,
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  assert(parentOnRejected.status === 400, 'Requirement 14: Rejected leave cannot be approved by subsequent authority');

  // HOD rejecting after partial approvals
  const apply5 = await request('/api/leave/apply', {
    method: 'POST',
    token: studentToken,
    body: JSON.stringify({
      leaveType: 'CASUAL',
      fromDate: '2026-10-05',
      toDate: '2026-10-06',
      reason: 'Family function in hometown',
    }),
  });
  const hodRejectId = apply5.data.leave.id;
  await request(`/api/mentors/leaves/${hodRejectId}`, { method: 'PUT', token: mentorToken, body: JSON.stringify({ action: 'APPROVE' }) });
  await request(`/api/parents/leaves/${hodRejectId}`, { method: 'PUT', token: parentToken, body: JSON.stringify({ action: 'APPROVE' }) });
  await request(`/api/classincharges/leaves/${hodRejectId}`, { method: 'PUT', token: inchargeToken, body: JSON.stringify({ action: 'APPROVE' }) });
  const hodRejectRes = await request(`/api/hods/leaves/${hodRejectId}`, {
    method: 'PUT',
    token: hodToken,
    body: JSON.stringify({ action: 'REJECT', reason: 'Attendance deficit. Cannot approve leave.' }),
  });
  assert(hodRejectRes.status === 200, 'HOD rejection succeeds');
  assert(hodRejectRes.data.leave.overallStatus === 'REJECTED', 'Requirement 14: Overall status is REJECTED when HOD rejects');
  assert(!hodRejectRes.data.leave.otpCode, 'Requirement 14: No OTP generated when HOD rejects');

  console.log('\n======================================================');
  console.log('🎉 ALL 16 REQUIREMENTS THOROUGHLY VERIFIED & PASSED!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
