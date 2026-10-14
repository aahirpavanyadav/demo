export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  batchId: string;
  enrolledDate: string;
  active: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  batches: string[];
  active: boolean;
}

export interface Batch {
  id: string;
  name: string;
  subjectIds: string[];
  facultyIds: string[];
  studentIds: string[];
  schedule: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  batchId: string;
  subjectId: string;
  facultyId: string;
  room: string;
}

export interface ClassSession {
  id: string;
  batchId: string;
  subjectId: string;
  facultyId: string;
  startTime: string;
  expiryTime: string;
  status: 'active' | 'ended' | 'expired';
  attendanceRecords: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  batchId: string;
  subjectId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  targetBatchId: string;
  audienceStudentIds: string[];
  thumbnailUrl: string;
  chapters: Chapter[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'archived';
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  resourceUrl: string;
  order: number;
  completedBy: string[];
}

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  batchId: string;
  deadline: string;
  maxMarks: number;
  createdBy: string;
  results: AssessmentResult[];
}

export interface AssessmentResult {
  studentId: string;
  marks: number | null;
}

export interface SyllabusTopic {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Doubt {
  id: string;
  studentId: string;
  subjectId: string;
  question: string;
  status: 'open' | 'answered' | 'resolved';
  reply?: string;
  repliedBy?: string;
  createdAt: string;
  repliedAt?: string;
}

export interface StudyTask {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  estimatedMinutes: number;
  completed: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  subjectId: string;
  rating: number;
  clarity: number;
  pace: number;
  doubtResolution: number;
  comments: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  forRole: 'admin' | 'faculty' | 'student' | 'all';
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
}

export interface InstituteSettings {
  name: string;
  attendanceTarget: number;
  theme: 'dark' | 'light';
}

export type Role = 'admin' | 'faculty' | 'student';

export interface AppState {
  institute: InstituteSettings;
  students: Student[];
  faculty: Faculty[];
  batches: Batch[];
  subjects: Subject[];
  timetable: TimetableEntry[];
  classSessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  courses: Course[];
  assessments: Assessment[];
  syllabus: SyllabusTopic[];
  doubts: Doubt[];
  studyTasks: StudyTask[];
  feedbacks: Feedback[];
  notifications: Notification[];
  activityLog: ActivityLog[];
  currentRole: Role;
  currentUserId: string;
  dataVersion: number;
}
