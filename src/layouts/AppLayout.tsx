import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, ClipboardCheck,
  Award, FileText, MessageSquare, CheckSquare, Settings, Shield, UserCheck,
  BarChart3, AlertTriangle, Play, FolderOpen, HelpCircle, Star, Menu, X,
  Bell, ChevronDown, Zap, BookOpenCheck, Clock, Target
} from 'lucide-react';
import { Badge } from '../components/UIComponents';

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/students', icon: Users, label: 'Students' },
  { path: '/admin/faculty', icon: GraduationCap, label: 'Faculty' },
  { path: '/admin/batches', icon: BookOpen, label: 'Batches & Subjects' },
  { path: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance Reports' },
  { path: '/admin/approvals', icon: Shield, label: 'Course Approvals' },
  { path: '/admin/risk-radar', icon: AlertTriangle, label: 'Risk Radar' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const facultyNav = [
  { path: '/faculty', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/faculty/classes', icon: Play, label: 'My Classes' },
  { path: '/faculty/attendance', icon: UserCheck, label: 'Attendance Review' },
  { path: '/faculty/assessments', icon: Award, label: 'Assessments' },
  { path: '/faculty/syllabus', icon: BookOpenCheck, label: 'Syllabus' },
  { path: '/faculty/doubts', icon: HelpCircle, label: 'Student Doubts' },
  { path: '/faculty/courses', icon: FolderOpen, label: 'Course Creator' },
];

const studentNav = [
  { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/student/attendance', icon: ClipboardCheck, label: 'My Attendance' },
  { path: '/student/recovery', icon: Target, label: 'Recovery Calculator' },
  { path: '/student/timetable', icon: Calendar, label: 'Timetable' },
  { path: '/student/learning', icon: BookOpen, label: 'My Learning' },
  { path: '/student/planner', icon: CheckSquare, label: 'Study Planner' },
  { path: '/student/assignments', icon: FileText, label: 'Assignments' },
  { path: '/student/doubts', icon: MessageSquare, label: 'Ask a Doubt' },
  { path: '/student/feedback', icon: Star, label: 'Feedback' },
];

export function AppLayout() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = state.currentRole === 'admin' ? adminNav : state.currentRole === 'faculty' ? facultyNav : studentNav;
  const unreadNotifs = state.notifications.filter(n => !n.read && (n.forRole === state.currentRole || n.forRole === 'all')).length;

  const roleColors = {
    admin: 'bg-violet-600',
    faculty: 'bg-cyan-600',
    student: 'bg-emerald-600',
  };

  const roleLabels = {
    admin: 'Admin',
    faculty: 'Faculty',
    student: 'Student',
  };

  const getCurrentUserName = () => {
    if (state.currentRole === 'admin') return 'Admin User';
    if (state.currentRole === 'faculty') {
      const fac = state.faculty.find(f => f.id === state.currentUserId);
      return fac?.name || 'Faculty';
    }
    const stu = state.students.find(s => s.id === state.currentUserId);
    return stu?.name || 'Student';
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100">SmartCoaching</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">OS Platform</p>
              </div>
            </div>
          </div>

          {/* Demo Role Switcher */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
              Demo Role Switcher
            </p>
            <div className="flex gap-1">
              {(['admin', 'faculty', 'student'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => {
                    dispatch({ type: 'SET_ROLE', payload: role });
                    if (role === 'admin') { dispatch({ type: 'SET_CURRENT_USER', payload: 'admin-1' }); navigate('/admin'); }
                    else if (role === 'faculty') { dispatch({ type: 'SET_CURRENT_USER', payload: 'fac-1' }); navigate('/faculty'); }
                    else { dispatch({ type: 'SET_CURRENT_USER', payload: 'stu-1' }); navigate('/student'); }
                  }}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                    state.currentRole === role
                      ? `${roleColors[role]} text-white shadow-lg`
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 mt-1.5">Not real auth — for demo only</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Institute Info */}
          <div className="px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">{state.institute.name}</p>
            <p className="text-[10px] text-slate-600">Local Prototype v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-slate-200">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-slate-200">{navItems.find(n => n.path === location.pathname)?.label || 'SmartCoaching OS'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{unreadNotifs}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {state.notifications.filter(n => n.forRole === state.currentRole || n.forRole === 'all').slice(0, 10).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-slate-700/50 ${!n.read ? 'bg-slate-700/20' : ''}`} onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}>
                        <p className="text-sm font-medium text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${roleColors[state.currentRole]} rounded-full flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{getCurrentUserName().charAt(0)}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-200">{getCurrentUserName()}</p>
                <p className="text-[10px] text-slate-500">{roleLabels[state.currentRole]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
