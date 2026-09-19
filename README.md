# 🎓 Smart Leave Approval System

A full-stack web application that digitizes and streamlines the traditional student leave approval and campus exit process.

Instead of relying on paper forms and manual communication, the system provides a centralized, role-based workflow where leave requests are reviewed and approved by the appropriate authorities before a student can leave the campus.

🔗 **Live Demo:** https://smart-leave-approval-system.onrender.com/  
💻 **GitHub Repository:** https://github.com/Mehek-Shaik/Smart-Leave-Approval-System

---

## 📌 Project Overview

The **Smart Leave Approval System** is designed to make the student leave process faster, more organized, transparent, and secure.

A student submits a leave request through the application. The request then moves through a predefined approval workflow:

**Student → Mentor → Parent → Class Incharge → HOD → OTP Generation → Security Verification → Student Exit**

Each role has its own responsibilities and access within the system.

---

## 🔄 Workflow

```text
Student Login
      ↓
Apply for Leave
      ↓
Mentor Approval
      ↓
Parent Approval
      ↓
Class Incharge Approval
      ↓
HOD Approval
      ↓
OTP Generated
      ↓
Security Verifies OTP
      ↓
Student Leaves Campus
```

This workflow ensures that a leave request is processed only after the required authorities have reviewed it.

---

## ✨ Key Features

### 👨‍🎓 Student
- Secure login
- Apply for leave
- View leave status
- Track approval progress
- View profile
- Receive OTP after final approval

### 👨‍🏫 Mentor
- View student leave requests
- Approve or reject leave requests
- Forward approved requests to the parent

### 👨‍👩‍👦 Parent
- Review leave requests
- Approve or reject requests

### 👨‍🏫 Class Incharge
- Review parent-approved requests
- Approve or reject leave requests

### 👨‍💼 HOD
- Perform final academic approval
- Approve or reject leave requests

### 🛡️ Security
- Verify the student's generated OTP
- Confirm authorized campus exit

### 👨‍💻 Admin
- Manage and monitor the system
- View system statistics
- Monitor students, staff and leave requests

---

## 🔐 Authentication & Security

The application implements role-based authentication and authorization.

Key security features include:

- JWT-based authentication
- Role-based access control
- BCrypt password encryption
- Protected API endpoints
- Authenticated user profile access
- OTP-based security verification
- Centralized exception handling

---

## 🏗️ Architecture

The backend follows a layered architecture designed to keep the application modular and maintainable.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity
    ↓
Database
```

### Main Layers

**Controller Layer**
- Handles HTTP requests and responses
- Exposes REST APIs

**Service Layer**
- Contains business logic
- Processes leave approval workflow

**Repository Layer**
- Handles database operations

**Entity Layer**
- Represents application data and database entities

**Security Layer**
- JWT authentication
- Authorization
- Password encryption
- Security configuration

---

## 🛠️ Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Maven
- REST APIs
- MySQL

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript / TypeScript
- Axios
- Lucide React

### Tools

- Git
- GitHub
- Postman
- VS Code
- MySQL Workbench

### Deployment

- Render

---

## 🗂️ Main Roles

| Role | Responsibility |
|---|---|
| 🎓 Student | Submit and track leave requests |
| 👨‍🏫 Mentor | Review student leave |
| 👨‍👩‍👦 Parent | Approve or reject leave |
| 👨‍🏫 Class Incharge | Review and approve leave |
| 👨‍💼 HOD | Final academic approval |
| 🛡️ Security | Verify OTP before campus exit |
| 👨‍💻 Admin | Monitor and manage the system |

---

## 📊 Leave Status

The system maintains the state of each leave request throughout the approval process.

```text
PENDING
   ↓
APPROVED
   or
REJECTED
```

After the required approvals are completed, an OTP is generated for security verification.

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Mehek-Shaik/Smart-Leave-Approval-System.git
```

```bash
cd Smart-Leave-Approval-System
```

### 2. Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### 3. Backend

Navigate to the Spring Boot backend:

```bash
cd backend-spring-boot
```

Run the application using Maven:

```bash
mvn spring-boot:run
```

---

## 🔑 Environment Variables

Create the required environment configuration based on the project's environment example.

Sensitive information such as:

- Database credentials
- JWT secrets
- API keys
- Production credentials

should not be committed to GitHub.

---

## 🧪 API Testing

The REST APIs can be tested using **Postman**.

The main workflow can be tested by:

1. Registering/logging in a user
2. Obtaining the JWT token
3. Applying for leave
4. Testing role-based approvals
5. Completing the approval workflow
6. Generating the OTP
7. Verifying the OTP

---

## 🎯 Project Objectives

- Digitize the traditional leave approval process
- Reduce manual paperwork
- Centralize leave requests
- Implement role-based access
- Provide transparent approval tracking
- Improve campus exit security
- Practice real-world full-stack development
- Implement secure REST API development

---

## 🔮 Future Enhancements

Potential future improvements include:

- Email/SMS notifications
- Push notifications
- Mobile application
- Advanced admin analytics
- Attendance integration
- QR-based campus exit verification
- Automated reminders for pending approvals
- Cloud database integration
- Improved audit logging

---

## 👩‍💻 Developer

**Mehek Shaik**

B.Tech Final-Year Student | Java Backend & Full-Stack Development Enthusiast

---

## 🔗 Links

🌐 **Live Application:**  
https://smart-leave-approval-system.onrender.com/

💻 **GitHub:**  
https://github.com/Mehek-Shaik/Smart-Leave-Approval-System

---

## ⭐ If you find this project useful

Feel free to explore the repository, try the application, and share your feedback.
