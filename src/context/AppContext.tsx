import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, Role, Student, Faculty, Batch, Subject, Course, Assessment, Doubt, StudyTask, Feedback, AttendanceRecord, ClassSession, Notification, ActivityLog, SyllabusTopic, TimetableEntry } from '../types';
import { seedData } from '../data/seedData';

const STORAGE_KEY = 'smartcoaching_os_data_v1';

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.dataVersion === seedData.dataVersion) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage, using seed data');
  }
  return { ...seedData };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to localStorage');
  }
}

type Action =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CURRENT_USER'; payload: string }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_FACULTY'; payload: Faculty }
  | { type: 'UPDATE_FACULTY'; payload: Faculty }
  | { type: 'DELETE_FACULTY'; payload: string }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'UPDATE_BATCH'; payload: Batch }
  | { type: 'DELETE_BATCH'; payload: string }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'ADD_TIMETABLE_ENTRY'; payload: TimetableEntry }
  | { type: 'UPDATE_TIMETABLE_ENTRY'; payload: TimetableEntry }
  | { type: 'DELETE_TIMETABLE_ENTRY'; payload: string }
  | { type: 'CREATE_SESSION'; payload: ClassSession }
  | { type: 'END_SESSION'; payload: string }
  | { type: 'SUBMIT_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'REVIEW_ATTENDANCE'; payload: { id: string; status: 'approved' | 'rejected' } }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'APPROVE_COURSE'; payload: string }
  | { type: 'REJECT_COURSE'; payload: { id: string; reason: string } }
  | { type: 'SUSPEND_COURSE'; payload: string }
  | { type: 'ARCHIVE_COURSE'; payload: string }
  | { type: 'COMPLETE_LESSON'; payload: { courseId: string; lessonId: string; studentId: string } }
  | { type: 'ADD_ASSESSMENT'; payload: Assessment }
  | { type: 'UPDATE_ASSESSMENT'; payload: Assessment }
  | { type: 'ADD_SYLLABUS_TOPIC'; payload: SyllabusTopic }
  | { type: 'TOGGLE_SYLLABUS_TOPIC'; payload: string }
  | { type: 'DELETE_SYLLABUS_TOPIC'; payload: string }
  | { type: 'ADD_DOUBT'; payload: Doubt }
  | { type: 'REPLY_DOUBT'; payload: { id: string; reply: string; repliedBy: string } }
  | { type: 'RESOLVE_DOUBT'; payload: string }
  | { type: 'ADD_STUDY_TASK'; payload: StudyTask }
  | { type: 'UPDATE_STUDY_TASK'; payload: StudyTask }
  | { type: 'DELETE_STUDY_TASK'; payload: string }
  | { type: 'TOGGLE_STUDY_TASK'; payload: string }
  | { type: 'ADD_FEEDBACK'; payload: Feedback }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityLog }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['institute']> }
  | { type: 'RESET_DATA' };

function addActivity(state: AppState, action: string, actor: string, target: string): ActivityLog {
  return {
    id: `act-${Date.now()}`,
    action,
    actor,
    target,
    timestamp: new Date().toISOString(),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUserId: action.payload };
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, action.payload],
        batches: state.batches.map(b => b.id === action.payload.batchId ? { ...b, studentIds: [...b.studentIds, action.payload.id] } : b),
        activityLog: [addActivity(state, 'Student Added', 'Admin', action.payload.name), ...state.activityLog],
      };
    case 'UPDATE_STUDENT':
      return { ...state, students: state.students.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.map(s => s.id === action.payload ? { ...s, active: false } : s) };
    case 'ADD_FACULTY':
      return { ...state, faculty: [...state.faculty, action.payload], activityLog: [addActivity(state, 'Faculty Added', 'Admin', action.payload.name), ...state.activityLog] };
    case 'UPDATE_FACULTY':
      return { ...state, faculty: state.faculty.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FACULTY':
      return { ...state, faculty: state.faculty.map(f => f.id === action.payload ? { ...f, active: false } : f) };
    case 'ADD_BATCH':
      return { ...state, batches: [...state.batches, action.payload], activityLog: [addActivity(state, 'Batch Created', 'Admin', action.payload.name), ...state.activityLog] };
    case 'UPDATE_BATCH':
      return { ...state, batches: state.batches.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BATCH':
      return { ...state, batches: state.batches.filter(b => b.id !== action.payload) };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return { ...state, subjects: state.subjects.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUBJECT':
      return { ...state, subjects: state.subjects.filter(s => s.id !== action.payload) };
    case 'ADD_TIMETABLE_ENTRY':
      return { ...state, timetable: [...state.timetable, action.payload] };
    case 'UPDATE_TIMETABLE_ENTRY':
      return { ...state, timetable: state.timetable.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TIMETABLE_ENTRY':
      return { ...state, timetable: state.timetable.filter(t => t.id !== action.payload) };
    case 'CREATE_SESSION':
      return { ...state, classSessions: [...state.classSessions, action.payload], activityLog: [addActivity(state, 'Class Started', 'Faculty', `Session ${action.payload.id}`), ...state.activityLog] };
    case 'END_SESSION':
      return { ...state, classSessions: state.classSessions.map(s => s.id === action.payload ? { ...s, status: 'ended' as const } : s) };
    case 'SUBMIT_ATTENDANCE':
      return { ...state, attendanceRecords: [...state.attendanceRecords, action.payload] };
    case 'REVIEW_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(a => a.id === action.payload.id ? { ...a, status: action.payload.status, reviewedAt: new Date().toISOString() } : a),
        activityLog: [addActivity(state, `Attendance ${action.payload.status}`, 'Faculty', `Record ${action.payload.id}`), ...state.activityLog],
      };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload], activityLog: [addActivity(state, 'Course Created', 'Faculty', action.payload.title), ...state.activityLog] };
    case 'UPDATE_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'APPROVE_COURSE':
      return {
        ...state,
        courses: state.courses.map(c => c.id === action.payload ? { ...c, status: 'approved' as const, updatedAt: new Date().toISOString() } : c),
        notifications: [...state.notifications, { id: `notif-${Date.now()}`, title: 'Course Approved', message: `Your course has been approved.`, type: 'success', read: false, createdAt: new Date().toISOString(), forRole: 'faculty' }],
        activityLog: [addActivity(state, 'Course Approved', 'Admin', state.courses.find(c => c.id === action.payload)?.title || ''), ...state.activityLog],
      };
    case 'REJECT_COURSE':
      return {
        ...state,
        courses: state.courses.map(c => c.id === action.payload.id ? { ...c, status: 'rejected' as const, rejectionReason: action.payload.reason, updatedAt: new Date().toISOString() } : c),
        notifications: [...state.notifications, { id: `notif-${Date.now()}`, title: 'Course Rejected', message: `Your course was rejected. Reason: ${action.payload.reason}`, type: 'error', read: false, createdAt: new Date().toISOString(), forRole: 'faculty' }],
        activityLog: [addActivity(state, 'Course Rejected', 'Admin', state.courses.find(c => c.id === action.payload.id)?.title || ''), ...state.activityLog],
      };
    case 'SUSPEND_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.payload ? { ...c, status: 'suspended' as const, updatedAt: new Date().toISOString() } : c) };
    case 'ARCHIVE_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.payload ? { ...c, status: 'archived' as const, updatedAt: new Date().toISOString() } : c) };
    case 'COMPLETE_LESSON': {
      const { courseId, lessonId, studentId } = action.payload;
      return {
        ...state,
        courses: state.courses.map(c => c.id === courseId ? {
          ...c,
          chapters: c.chapters.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(l => l.id === lessonId ? { ...l, completedBy: [...l.completedBy, studentId] } : l)
          }))
        } : c)
      };
    }
    case 'ADD_ASSESSMENT':
      return { ...state, assessments: [...state.assessments, action.payload], activityLog: [addActivity(state, 'Assessment Created', 'Faculty', action.payload.title), ...state.activityLog] };
    case 'UPDATE_ASSESSMENT':
      return { ...state, assessments: state.assessments.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'ADD_SYLLABUS_TOPIC':
      return { ...state, syllabus: [...state.syllabus, action.payload] };
    case 'TOGGLE_SYLLABUS_TOPIC':
      return { ...state, syllabus: state.syllabus.map(s => s.id === action.payload ? { ...s, completed: !s.completed } : s) };
    case 'DELETE_SYLLABUS_TOPIC':
      return { ...state, syllabus: state.syllabus.filter(s => s.id !== action.payload) };
    case 'ADD_DOUBT':
      return { ...state, doubts: [...state.doubts, action.payload], activityLog: [addActivity(state, 'Doubt Submitted', state.students.find(s => s.id === action.payload.studentId)?.name || 'Student', action.payload.question.slice(0, 30)), ...state.activityLog] };
    case 'REPLY_DOUBT':
      return {
        ...state,
        doubts: state.doubts.map(d => d.id === action.payload.id ? { ...d, status: 'answered' as const, reply: action.payload.reply, repliedBy: action.payload.repliedBy, repliedAt: new Date().toISOString() } : d),
        activityLog: [addActivity(state, 'Doubt Answered', state.faculty.find(f => f.id === action.payload.repliedBy)?.name || 'Faculty', ''), ...state.activityLog],
      };
    case 'RESOLVE_DOUBT':
      return { ...state, doubts: state.doubts.map(d => d.id === action.payload ? { ...d, status: 'resolved' as const } : d) };
    case 'ADD_STUDY_TASK':
      return { ...state, studyTasks: [...state.studyTasks, action.payload] };
    case 'UPDATE_STUDY_TASK':
      return { ...state, studyTasks: state.studyTasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_STUDY_TASK':
      return { ...state, studyTasks: state.studyTasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_STUDY_TASK':
      return { ...state, studyTasks: state.studyTasks.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t) };
    case 'ADD_FEEDBACK':
      return { ...state, feedbacks: [...state.feedbacks, action.payload], activityLog: [addActivity(state, 'Feedback Submitted', state.students.find(s => s.id === action.payload.studentId)?.name || 'Student', ''), ...state.activityLog] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'ADD_ACTIVITY':
      return { ...state, activityLog: [action.payload, ...state.activityLog] };
    case 'UPDATE_SETTINGS':
      return { ...state, institute: { ...state.institute, ...action.payload } };
    case 'RESET_DATA':
      return { ...seedData };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getStudent: (id: string) => Student | undefined;
  getFaculty: (id: string) => Faculty | undefined;
  getBatch: (id: string) => Batch | undefined;
  getSubject: (id: string) => Subject | undefined;
  getStudentAttendance: (studentId: string) => { totalHeld: number; totalAttended: number; percentage: number };
  getSubjectAttendance: (studentId: string, subjectId: string) => { held: number; attended: number; percentage: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getStudent = useCallback((id: string) => state.students.find(s => s.id === id), [state.students]);
  const getFaculty = useCallback((id: string) => state.faculty.find(f => f.id === id), [state.faculty]);
  const getBatch = useCallback((id: string) => state.batches.find(b => b.id === id), [state.batches]);
  const getSubject = useCallback((id: string) => state.subjects.find(s => s.id === id), [state.subjects]);

  const getStudentAttendance = useCallback((studentId: string) => {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return { totalHeld: 0, totalAttended: 0, percentage: 0 };
    const batch = state.batches.find(b => b.id === student.batchId);
    if (!batch) return { totalHeld: 0, totalAttended: 0, percentage: 0 };
    
    const relevantSessions = state.classSessions.filter(s => s.batchId === student.batchId && (s.status === 'ended' || s.status === 'expired'));
    const demoHeld = Math.max(relevantSessions.length, 10); // Assume at least 10 classes held for demo
    const approved = state.attendanceRecords.filter(a => a.studentId === studentId && a.status === 'approved');
    const totalAttended = approved.length;
    const percentage = demoHeld > 0 ? Math.round((totalAttended / demoHeld) * 100) : 0;
    return { totalHeld: demoHeld, totalAttended, percentage };
  }, [state.students, state.batches, state.classSessions, state.attendanceRecords]);

  const getSubjectAttendance = useCallback((studentId: string, subjectId: string) => {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return { held: 0, attended: 0, percentage: 0 };
    const demoHeld = 5; // Assume 5 classes per subject for demo
    const approved = state.attendanceRecords.filter(a => a.studentId === studentId && a.subjectId === subjectId && a.status === 'approved');
    const attended = approved.length;
    const percentage = demoHeld > 0 ? Math.round((attended / demoHeld) * 100) : 0;
    return { held: demoHeld, attended, percentage };
  }, [state.students, state.attendanceRecords]);

  return (
    <AppContext.Provider value={{ state, dispatch, getStudent, getFaculty, getBatch, getSubject, getStudentAttendance, getSubjectAttendance }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
