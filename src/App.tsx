import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { ToastContainer } from './components/UIComponents';

// Admin Pages
import { AdminDashboard, AdminStudents, AdminFaculty, AdminBatches, AdminAttendance, AdminApprovals, AdminRiskRadar, AdminSettings } from './pages/admin/AdminPages';

// Faculty Pages
import { FacultyDashboard, FacultyClasses, FacultyAttendance, FacultyAssessments, FacultySyllabus, FacultyDoubts, FacultyCourses } from './pages/faculty/FacultyPages';

// Student Pages
import { StudentDashboard, StudentAttendance, StudentRecovery, StudentTimetable, StudentLearning, StudentPlanner, StudentAssignments, StudentDoubts, StudentFeedback } from './pages/student/StudentPages';

function RoleRedirect() {
  const { state } = useApp();
  switch (state.currentRole) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'faculty': return <Navigate to="/faculty" replace />;
    case 'student': return <Navigate to="/student" replace />;
    default: return <Navigate to="/admin" replace />;
  }
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route element={<AppLayout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/faculty" element={<AdminFaculty />} />
            <Route path="/admin/batches" element={<AdminBatches />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/risk-radar" element={<AdminRiskRadar />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Faculty Routes */}
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/classes" element={<FacultyClasses />} />
            <Route path="/faculty/attendance" element={<FacultyAttendance />} />
            <Route path="/faculty/assessments" element={<FacultyAssessments />} />
            <Route path="/faculty/syllabus" element={<FacultySyllabus />} />
            <Route path="/faculty/doubts" element={<FacultyDoubts />} />
            <Route path="/faculty/courses" element={<FacultyCourses />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/recovery" element={<StudentRecovery />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/learning" element={<StudentLearning />} />
            <Route path="/student/planner" element={<StudentPlanner />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/doubts" element={<StudentDoubts />} />
            <Route path="/student/feedback" element={<StudentFeedback />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
