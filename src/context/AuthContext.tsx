import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (role: UserRole, email: string, password: string) => Promise<void>;
  quickLoginDemo: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string; title: string }> = {
  STUDENT: { email: 'rahul.cse@college.edu', name: 'Rahul Patel', title: 'Student (3rd Year CSE)' },
  MENTOR: { email: 'dr.sharma@college.edu', name: 'Dr. Priya Sharma', title: 'Mentor (Associate Prof)' },
  PARENT: { email: 'parent.rahul@gmail.com', name: 'Mr. Ramesh Patel', title: 'Parent of Rahul' },
  CLASS_INCHARGE: { email: 'prof.verma@college.edu', name: 'Prof. Rajesh Verma', title: 'Class Incharge (CSE-3A)' },
  HOD: { email: 'hod.cse@college.edu', name: 'Dr. Anand Kumar', title: 'HOD (Computer Science)' },
  SECURITY: { email: 'security.gate1@college.edu', name: 'Officer Mahendra Singh', title: 'Security Gate 1 Officer' },
  ADMIN: { email: 'admin@college.edu', name: 'Dr. S. K. Narayanan', title: 'College Administrator' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('smart_leave_user');
      const token = localStorage.getItem('smart_leave_jwt');
      if (saved && token && token !== 'null' && token !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch {
      localStorage.removeItem('smart_leave_user');
      localStorage.removeItem('smart_leave_jwt');
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('smart_leave_jwt');
    return t && t !== 'null' && t !== 'undefined' ? t : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('smart_leave_jwt', token);
      localStorage.setItem('smart_leave_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smart_leave_jwt');
      localStorage.removeItem('smart_leave_user');
    }
  }, [token, user]);

  // Session verification on mount: validate JWT token validity with server
  useEffect(() => {
    const verifySessionOnMount = async () => {
      const storedToken = localStorage.getItem('smart_leave_jwt');
      const storedUserStr = localStorage.getItem('smart_leave_user');
      if (!storedToken || !storedUserStr) return;

      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          // Token is valid; ensure role and user information match
          const u = JSON.parse(storedUserStr);
          setUser({ ...u, ...res.data.user });
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.warn('Startup session validation returned 401. Resolving stale session.');
          try {
            const u: AuthUser = JSON.parse(storedUserStr);
            const isDemo = u.role && DEMO_CREDENTIALS[u.role] && DEMO_CREDENTIALS[u.role].email.toLowerCase() === u.email.toLowerCase();
            if (isDemo) {
              // Seamlessly re-login active demo account
              await quickLoginDemo(u.role);
              return;
            }
          } catch {
            // Ignore parse errors
          }
          // Clear stale credentials
          setToken(null);
          setUser(null);
          localStorage.removeItem('smart_leave_jwt');
          localStorage.removeItem('smart_leave_user');
        }
      }
    };

    verifySessionOnMount();
  }, []);

  // Listen to 401 events dispatched from axios interceptor
  useEffect(() => {
    const handleUnauthorized = async () => {
      const currentRole = user?.role;
      const currentEmail = user?.email;
      
      if (currentRole && currentEmail && DEMO_CREDENTIALS[currentRole]?.email.toLowerCase() === currentEmail.toLowerCase()) {
        try {
          console.info('Auto-refreshing demo credentials after 401...');
          await quickLoginDemo(currentRole);
          return;
        } catch {
          // Fall through to logout
        }
      }

      setToken(null);
      setUser(null);
      localStorage.removeItem('smart_leave_jwt');
      localStorage.removeItem('smart_leave_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [user]);

  const getLoginEndpoint = (role: UserRole): string => {
    switch (role) {
      case 'STUDENT':
        return '/students/login';
      case 'MENTOR':
        return '/mentors/login';
      case 'PARENT':
        return '/parents/login';
      case 'CLASS_INCHARGE':
        return '/classincharges/login';
      case 'HOD':
        return '/hods/login';
      case 'SECURITY':
        return '/security/login';
      case 'ADMIN':
        return '/admin/login';
    }
  };

  const login = async (role: UserRole, email: string, password: string) => {
    setIsLoading(true);
    try {
      const endpoint = getLoginEndpoint(role);
      const res = await api.post(endpoint, { email, password });
      const { token: jwtToken, user: userData, student } = res.data;
      const finalUser = userData || student || { email, role, name: email.split('@')[0] };
      finalUser.role = role;

      localStorage.setItem('smart_leave_jwt', jwtToken);
      localStorage.setItem('smart_leave_user', JSON.stringify(finalUser));

      setToken(jwtToken);
      setUser(finalUser);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginDemo = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    await login(role, creds.email, 'password123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smart_leave_jwt');
    localStorage.removeItem('smart_leave_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickLoginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
