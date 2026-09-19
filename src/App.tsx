import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { QuickDemoBar } from './components/QuickDemoBar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { ClassInchargeDashboard } from './pages/ClassInchargeDashboard';
import { HODDashboard } from './pages/HODDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SwaggerDocPage } from './pages/SwaggerDocPage';
import { UserRole } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const renderDashboardByRole = (role: UserRole) => {
    switch (role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'MENTOR':
        return <MentorDashboard />;
      case 'PARENT':
        return <ParentDashboard />;
      case 'CLASS_INCHARGE':
        return <ClassInchargeDashboard />;
      case 'HOD':
        return <HODDashboard />;
      case 'SECURITY':
        return <SecurityDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  const renderContent = () => {
    if (currentTab === 'docs') {
      return <SwaggerDocPage />;
    }

    if (!user) {
      if (currentTab === 'login') {
        return (
          <LoginPage
            onSuccess={() => setCurrentTab('dashboard')}
            onNavigateToRegister={() => setCurrentTab('register')}
          />
        );
      }
      if (currentTab === 'register') {
        return (
          <RegisterPage
            onSuccess={() => setCurrentTab('dashboard')}
            onNavigateToLogin={() => setCurrentTab('login')}
          />
        );
      }
      return (
        <LandingPage
          onSelectRole={() => setCurrentTab('login')}
          onNavigate={(tab) => setCurrentTab(tab)}
        />
      );
    }

    // User is logged in
    return renderDashboardByRole(user.role);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* 1-Click Fast Demo Switcher Bar */}
      <QuickDemoBar />

      {/* Main App Navigation Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Page Body */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* College Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Smart Leave Approval System • Digital Out-Pass & Multi-Level Authority Clearance
          </p>
          <p>
            Student → Mentor → Parent → Class Incharge → HOD → OTP Generation → Security Verification → Student Leaves Campus
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
