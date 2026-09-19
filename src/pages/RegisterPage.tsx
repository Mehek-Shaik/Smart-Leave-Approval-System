import React, { useState } from 'react';
import api from '../api/client';
import { UserRole } from '../types';
import { GraduationCap, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { login } = useAuth();
  const [role, setRole] = useState<'STUDENT' | 'MENTOR' | 'PARENT' | 'CLASS_INCHARGE' | 'HOD'>('STUDENT');
  const [formData, setFormData] = useState({
    studentName: '',
    name: '',
    mentorName: '',
    parentName: '',
    rollNumber: '',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    email: '',
    password: '',
    phoneNumber: '',
    mentorEmail: 'dr.sharma@college.edu',
    parentEmail: 'parent.rahul@gmail.com',
    studentEmail: 'rahul.cse@college.edu',
    studentRollNumber: '21CS104',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let endpoint = '';
    let payload: any = { ...formData };

    if (role === 'STUDENT') {
      endpoint = '/students/register';
    } else if (role === 'MENTOR') {
      endpoint = '/mentors/register';
      payload.mentorName = formData.name;
    } else if (role === 'PARENT') {
      endpoint = '/parents/register';
      payload.parentName = formData.name;
    } else if (role === 'CLASS_INCHARGE') {
      endpoint = '/classincharges/register';
    } else if (role === 'HOD') {
      endpoint = '/hods/register';
    }

    try {
      await api.post(endpoint, payload);
      // Auto login
      await login(role, formData.email, formData.password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToLogin}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Institutional Registration</h2>
              <p className="text-xs text-slate-400">Join the Smart Leave Approval portal</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1 overflow-x-auto">
          {(['STUDENT', 'MENTOR', 'PARENT', 'CLASS_INCHARGE', 'HOD'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                role === r
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {role === 'STUDENT' ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="e.g. Rahul Patel"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {role === 'STUDENT' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Roll Number</label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 21CS104"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Official Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@college.edu"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            {role !== 'PARENT' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electronics and Communication">Electronics and Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            )}

            {['STUDENT', 'MENTOR', 'CLASS_INCHARGE'].includes(role) && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Section</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
                  />
                </div>
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assigned Mentor Email</label>
                  <input
                    type="email"
                    required
                    value={formData.mentorEmail}
                    onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })}
                    placeholder="dr.sharma@college.edu"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Parent / Guardian Email</label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent.rahul@gmail.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </>
            )}

            {role === 'PARENT' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ward's Student Email</label>
                  <input
                    type="email"
                    required
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                    placeholder="rahul.cse@college.edu"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ward's Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.studentRollNumber}
                    onChange={(e) => setFormData({ ...formData, studentRollNumber: e.target.value })}
                    placeholder="21CS104"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Mobile Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Registering...' : `Complete Registration as ${role.replace('_', ' ')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
