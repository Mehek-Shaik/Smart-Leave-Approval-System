export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Leave Approval System REST API',
    version: '1.0.0',
    description: `Production-grade RESTful API for College Multi-Level Smart Leave Approval System.
Enforces the mandatory linear hierarchy:
Student Applied → Mentor Approval → Parent Approval → Class Incharge Approval → HOD Approval → Automatic OTP Generation → Security Gate Verification.`,
    contact: {
      name: 'College IT & Security Operations',
      email: 'admin@college.edu',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Primary API Gateway',
    },
    {
      url: '',
      description: 'Root Application Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT token obtained from role login (e.g. Bearer <token>)',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/students/register': {
      post: {
        tags: ['Student'],
        summary: 'Register a new student',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentName', 'rollNumber', 'email', 'password', 'department', 'year', 'section'],
                properties: {
                  studentName: { type: 'string', example: 'Rahul Patel' },
                  rollNumber: { type: 'string', example: '21CS042' },
                  email: { type: 'string', example: 'rahul.cse@college.edu' },
                  password: { type: 'string', example: 'password123' },
                  department: { type: 'string', example: 'Computer Science & Engineering' },
                  year: { type: 'integer', example: 3 },
                  section: { type: 'string', example: 'A' },
                  phoneNumber: { type: 'string', example: '+91 91234 56789' },
                  mentorEmail: { type: 'string', example: 'dr.sharma@college.edu' },
                  parentEmail: { type: 'string', example: 'parent.rahul@gmail.com' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Student registered successfully' },
          400: { description: 'Validation error or duplicate email/rollNumber' },
        },
      },
    },
    '/students/login': {
      post: {
        tags: ['Student'],
        summary: 'Student login with email & password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'rahul.cse@college.edu' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/students/profile': {
      get: {
        tags: ['Student'],
        summary: 'Get logged-in student profile from JWT',
        responses: {
          200: { description: 'Student details' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/leave/apply': {
      post: {
        tags: ['Student', 'Leave Workflow'],
        summary: 'Student applies for leave',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['leaveType', 'fromDate', 'toDate', 'reason'],
                properties: {
                  leaveType: {
                    type: 'string',
                    enum: ['SICK', 'CASUAL', 'ACADEMIC', 'EMERGENCY', 'HOME_VISIT'],
                    example: 'HOME_VISIT',
                  },
                  fromDate: { type: 'string', format: 'date', example: '2026-09-20' },
                  toDate: { type: 'string', format: 'date', example: '2026-09-22' },
                  reason: { type: 'string', example: 'Attending family religious ceremony' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Leave application created & submitted to Mentor' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/leave/my-leaves': {
      get: {
        tags: ['Student', 'Leave Workflow'],
        summary: 'Retrieve all leave applications for authenticated student',
        responses: {
          200: { description: 'List of student leaves' },
        },
      },
    },
    '/leave/{leaveId}': {
      delete: {
        tags: ['Student', 'Leave Workflow'],
        summary: 'Cancel a pending leave application before final HOD approval',
        parameters: [
          { name: 'leaveId', in: 'path', required: true, schema: { type: 'string' }, example: 'LV-2026-001' },
        ],
        responses: {
          200: { description: 'Leave cancelled' },
          400: { description: 'Cannot cancel after final approval or invalid state' },
        },
      },
    },
    '/mentors/login': {
      post: {
        tags: ['Mentor'],
        summary: 'Mentor login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'dr.sharma@college.edu' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'JWT token returned' } },
      },
    },
    '/mentors/leaves': {
      get: {
        tags: ['Mentor'],
        summary: 'Get leave requests assigned to authenticated mentor',
        responses: { 200: { description: 'Assigned student leaves' } },
      },
    },
    '/mentors/leaves/{leaveId}': {
      put: {
        tags: ['Mentor'],
        summary: 'Mentor Approve or Reject leave request (Step 1)',
        parameters: [
          { name: 'leaveId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['APPROVE', 'REJECT'] },
                  remarks: { type: 'string', example: 'Academic attendance is above 85%.' },
                  reason: { type: 'string', example: 'Rejection reason if action is REJECT' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Mentor decision saved' } },
      },
    },
    '/parents/leaves': {
      get: {
        tags: ['Parent'],
        summary: 'Get leave requests for authenticated parent child',
        responses: { 200: { description: 'Child leaves' } },
      },
    },
    '/parents/leaves/{leaveId}': {
      put: {
        tags: ['Parent'],
        summary: 'Parent Approve or Reject leave request (Step 2: requires Mentor approved)',
        parameters: [
          { name: 'leaveId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['APPROVE', 'REJECT'] },
                  remarks: { type: 'string', example: 'Parent consent provided.' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Parent decision saved' } },
      },
    },
    '/classincharges/leaves': {
      get: {
        tags: ['Class Incharge'],
        summary: 'Get class section leave requests',
        responses: { 200: { description: 'Class leaves' } },
      },
    },
    '/classincharges/leaves/{leaveId}': {
      put: {
        tags: ['Class Incharge'],
        summary: 'Class Incharge Approve or Reject leave (Step 3: requires Mentor + Parent approved)',
        parameters: [
          { name: 'leaveId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['APPROVE', 'REJECT'] },
                  remarks: { type: 'string', example: 'No conflict with lab examinations.' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Class Incharge decision saved' } },
      },
    },
    '/hods/leaves': {
      get: {
        tags: ['HOD'],
        summary: 'Get eligible departmental leaves',
        responses: { 200: { description: 'Department leaves' } },
      },
    },
    '/hods/leaves/{leaveId}': {
      put: {
        tags: ['HOD'],
        summary: 'HOD Final Approval or Rejection (Step 4: Auto-generates OTP on approval)',
        parameters: [
          { name: 'leaveId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['APPROVE', 'REJECT'] },
                  remarks: { type: 'string', example: 'Final departmental clearance granted.' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Overall leave approved and OTP generated' } },
      },
    },
    '/otp/verify': {
      post: {
        tags: ['OTP & Security Verification'],
        summary: 'Security officer verifies student OTP at campus gate',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otpCode'],
                properties: {
                  otpCode: { type: 'string', example: '749215' },
                  queryIdentifier: { type: 'string', example: '21CS042 or LV-2026-002' },
                  gateNumber: { type: 'string', example: 'Main Campus Gate 1' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OTP verified successfully; student authorized to leave campus' },
          400: { description: 'Invalid, expired, or already-used OTP' },
        },
      },
    },
    '/security/verify': {
      post: {
        tags: ['OTP & Security Verification'],
        summary: 'Security officer gate clearance OTP verification endpoint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['otpCode'],
                properties: {
                  otpCode: { type: 'string', example: '749215' },
                  queryIdentifier: { type: 'string', example: '21CS042 or LV-2026-002' },
                  gateNumber: { type: 'string', example: 'Main Campus Gate 1' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Gate verification successful; student cleared to exit' },
          400: { description: 'Invalid, expired, or already-used OTP' },
        },
      },
    },
    '/security/approved-leaves': {
      get: {
        tags: ['OTP & Security Verification'],
        summary: 'Security officer lists all approved leaves with active OTP passes',
        responses: { 200: { description: 'Approved leaves list' } },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'System metrics, role counts, approval statistics',
        responses: { 200: { description: 'Statistics dashboard payload' } },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all registered accounts categorized by role',
        responses: { 200: { description: 'Directory of all users' } },
      },
    },
  },
};
