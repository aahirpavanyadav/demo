import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, StatCard, Badge, Button, Modal, Input, Select, Textarea, SearchInput, EmptyState, showToast, Tabs, ProgressBar, Rating } from '../../components/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LayoutDashboard, Calendar, BookOpen, CheckSquare, FileText, MessageSquare, Star, ClipboardCheck, Target, Clock, AlertTriangle, Play, Check, Send, Plus, Trash2, Edit, Zap, TrendingUp } from 'lucide-react';

// ============ STUDENT DASHBOARD ============
export function StudentDashboard() {
  const { state, getStudentAttendance, getSubjectAttendance } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  if (!student) return <div>Student not found</div>;

  const attendance = getStudentAttendance(student.id);
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = state.timetable.filter(t => t.day === todayDay && t.batchId === student.batchId);
  const myCourses = state.courses.filter(c => c.status === 'approved' && c.audienceStudentIds.includes(student.id));
  const pendingTasks = state.studyTasks.filter(t => t.studentId === student.id && !t.completed);
  const upcomingAssessments = state.assessments.filter(a => a.batchId === student.batchId && new Date(a.deadline) >= new Date());
  const isAtRisk = attendance.percentage < state.institute.attendanceTarget;

  const weeklyProgress = [
    { day: 'Mon', tasks: 2 }, { day: 'Tue', tasks: 3 }, { day: 'Wed', tasks: 1 },
    { day: 'Thu', tasks: 4 }, { day: 'Fri', tasks: 2 }, { day: 'Sat', tasks: 1 }, { day: 'Sun', tasks: 0 },
  ];

  const nextClass = todayClasses.length > 0 ? todayClasses[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome, {student.name.split(' ')[0]}! 👋</h1>
          <p className="text-sm text-slate-400 mt-1">Here's your learning overview for today.</p>
        </div>
        {isAtRisk && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-300">Attendance below {state.institute.attendanceTarget}%!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Attendance" value={`${attendance.percentage}%`} icon={<ClipboardCheck className="w-5 h-5" />} color={attendance.percentage >= 75 ? 'emerald' : 'red'} />
        <StatCard title="Today's Classes" value={todayClasses.length} icon={<Calendar className="w-5 h-5" />} color="cyan" />
        <StatCard title="My Courses" value={myCourses.length} icon={<BookOpen className="w-5 h-5" />} color="violet" />
        <StatCard title="Pending Tasks" value={pendingTasks.length} icon={<CheckSquare className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-400" />Today's Schedule</h3>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map(tc => {
                const subject = state.subjects.find(s => s.id === tc.subjectId);
                const faculty = state.faculty.find(f => f.id === tc.facultyId);
                return (
                  <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{subject?.name}</p>
                      <p className="text-xs text-slate-500">{faculty?.name} • {tc.room}</p>
                    </div>
                    <Badge variant="info">{tc.startTime}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Next Class */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />Next Class</h3>
          {nextClass ? (
            <div className="p-4 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-700/30 rounded-lg">
              <p className="text-lg font-semibold text-slate-200">{state.subjects.find(s => s.id === nextClass.subjectId)?.name}</p>
              <p className="text-sm text-slate-400 mt-1">{nextClass.startTime} - {nextClass.endTime}</p>
              <p className="text-xs text-slate-500 mt-1">{state.faculty.find(f => f.id === nextClass.facultyId)?.name} • {nextClass.room}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No more classes today.</p>
          )}
        </Card>
      </div>

      {/* Upcoming Assessments */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" />Upcoming Assessments</h3>
        {upcomingAssessments.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming assessments.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingAssessments.slice(0, 4).map(a => (
              <div key={a.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <p className="text-sm font-medium text-slate-200">{a.title}</p>
                <p className="text-xs text-slate-500">{state.subjects.find(s => s.id === a.subjectId)?.name} • Due: {new Date(a.deadline).toLocaleDateString()}</p>
                <p className="text-xs text-slate-400 mt-1">Max Marks: {a.maxMarks}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly Progress */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Weekly Task Progress</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ============ MY ATTENDANCE ============
export function StudentAttendance() {
  const { state, dispatch, getStudentAttendance, getSubjectAttendance } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [sessionCode, setSessionCode] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);

  if (!student) return <div>Student not found</div>;

  const overall = getStudentAttendance(student.id);
  const myRecords = state.attendanceRecords.filter(a => a.studentId === student.id);
  const approved = myRecords.filter(a => a.status === 'approved');
  const pending = myRecords.filter(a => a.status === 'pending');
  const rejected = myRecords.filter(a => a.status === 'rejected');

  const handleSubmitAttendance = () => {
    if (!sessionCode.trim()) { showToast('Please enter session code', 'error'); return; }
    // Find active session
    const activeSession = state.classSessions.find(s => s.status === 'active' && s.id === sessionCode.trim());
    if (!activeSession) { showToast('Invalid or expired session code', 'error'); return; }
    if (activeSession.batchId !== student.batchId) { showToast('This session is not for your batch', 'error'); return; }
    if (new Date(activeSession.expiryTime) < new Date()) { showToast('Session has expired', 'error'); return; }
    const alreadySubmitted = state.attendanceRecords.some(a => a.sessionId === activeSession.id && a.studentId === student.id);
    if (alreadySubmitted) { showToast('You already submitted attendance for this session', 'warning'); return; }

    const record = {
      id: `att-${Date.now()}`,
      sessionId: activeSession.id,
      studentId: student.id,
      batchId: activeSession.batchId,
      subjectId: activeSession.subjectId,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SUBMIT_ATTENDANCE', payload: record });
    showToast('Attendance submitted! Awaiting faculty approval.', 'success');
    setSessionCode('');
    setShowSubmit(false);
  };

  // Subject-wise attendance
  const batch = state.batches.find(b => b.id === student.batchId);
  const subjectAttendance = batch?.subjectIds.map(sid => ({
    subject: state.subjects.find(s => s.id === sid),
    ...getSubjectAttendance(student.id, sid),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Attendance</h1>
          <p className="text-sm text-slate-400 mt-1">Track your attendance across subjects</p>
        </div>
        <Button onClick={() => setShowSubmit(true)}><ClipboardCheck className="w-4 h-4 mr-2" />Submit Attendance</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Overall" value={`${overall.percentage}%`} icon={<ClipboardCheck className="w-5 h-5" />} color={overall.percentage >= 75 ? 'emerald' : 'red'} />
        <StatCard title="Classes Attended" value={`${overall.totalAttended}/${overall.totalHeld}`} icon={<Check className="w-5 h-5" />} color="cyan" />
        <StatCard title="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} color="amber" />
      </div>

      {/* Subject-wise */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Subject-wise Attendance</h3>
        <div className="space-y-3">
          {subjectAttendance.map((sa, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-slate-300 w-32">{sa.subject?.name}</span>
              <div className="flex-1"><ProgressBar value={sa.percentage} color={sa.percentage >= 75 ? 'emerald' : sa.percentage >= 60 ? 'amber' : 'red'} /></div>
              <span className="text-xs text-slate-400 w-20 text-right">{sa.attended}/{sa.held} classes</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance History */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Attendance History</h3>
        <div className="space-y-2">
          {myRecords.slice(-10).reverse().map(r => {
            const subject = state.subjects.find(s => s.id === r.subjectId);
            return (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">{subject?.name}</p>
                  <p className="text-xs text-slate-500">{r.date} • Submitted: {new Date(r.submittedAt).toLocaleTimeString()}</p>
                </div>
                <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>{r.status}</Badge>
              </div>
            );
          })}
          {myRecords.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No attendance records yet.</p>}
        </div>
      </Card>

      {/* Submit Attendance Modal */}
      <Modal isOpen={showSubmit} onClose={() => setShowSubmit(false)} title="Submit Attendance" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Enter the session code displayed by your faculty, or scan the QR code.</p>
          <Input label="Session Code" value={sessionCode} onChange={e => setSessionCode(e.target.value)} placeholder="Paste session code here..." />
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500">Active sessions for your batch:</p>
            {state.classSessions.filter(s => s.status === 'active' && s.batchId === student.batchId).length === 0 ? (
              <p className="text-xs text-slate-600 mt-1">No active sessions right now.</p>
            ) : (
              state.classSessions.filter(s => s.status === 'active' && s.batchId === student.batchId).map(s => (
                <button key={s.id} onClick={() => setSessionCode(s.id)} className="block mt-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono">
                  {s.id.slice(0, 20)}... ({state.subjects.find(sub => sub.id === s.subjectId)?.name})
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmitAttendance}>Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ RECOVERY CALCULATOR ============
export function StudentRecovery() {
  const { state, getStudentAttendance } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [customTarget, setCustomTarget] = useState(state.institute.attendanceTarget);

  if (!student) return <div>Student not found</div>;

  const attendance = getStudentAttendance(student.id);
  const A = attendance.totalAttended;
  const H = attendance.totalHeld;
  const t = customTarget / 100;

  // N = max(0, ceil((t * H - A) / (1 - t)))
  const classesNeeded = H > 0 && t < 1 ? Math.max(0, Math.ceil((t * H - A) / (1 - t))) : 0;
  const isAboveTarget = attendance.percentage >= customTarget;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attendance Recovery Calculator</h1>
        <p className="text-sm text-slate-400 mt-1">Calculate how many classes you need to attend to reach your target.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Current Attendance</span>
              <span className={`text-lg font-bold ${attendance.percentage >= customTarget ? 'text-emerald-400' : 'text-red-400'}`}>{attendance.percentage}%</span>
            </div>
            <ProgressBar value={attendance.percentage} max={100} color={attendance.percentage >= customTarget ? 'emerald' : 'red'} />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Classes Attended</span>
              <span className="text-sm text-slate-200">{A}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Total Classes Held</span>
              <span className="text-sm text-slate-200">{H}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Target Attendance</span>
              <span className="text-sm text-amber-400">{customTarget}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Recovery Plan</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-700/30 rounded-xl">
              <div className="text-center">
                {isAboveTarget ? (
                  <>
                    <div className="text-4xl font-bold text-emerald-400 mb-1">✓</div>
                    <p className="text-sm text-emerald-300">You're above target!</p>
                    <p className="text-xs text-slate-500 mt-1">Keep maintaining your attendance.</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-amber-400 mb-1">{classesNeeded}</div>
                    <p className="text-sm text-slate-300">consecutive classes needed</p>
                    <p className="text-xs text-slate-500 mt-1">to reach {customTarget}% attendance</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Formula:</p>
              <p className="text-xs text-slate-300 font-mono">N = max(0, ⌈(t × H - A) / (1 - t)⌉)</p>
              <p className="text-xs text-slate-500 mt-2">Where: A = {A} (attended), H = {H} (held), t = {t} (target)</p>
              {!isAboveTarget && <p className="text-xs text-slate-500 mt-1">N = max(0, ⌈({t} × {H} - {A}) / (1 - {t})⌉) = {classesNeeded}</p>}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Custom Target</h3>
        <div className="flex items-center gap-4">
          <input type="range" min={50} max={100} value={customTarget} onChange={e => setCustomTarget(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-lg font-bold text-violet-400 w-12 text-center">{customTarget}%</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">⚠️ This is an estimate assuming you attend every future class. Actual results may vary.</p>
      </Card>
    </div>
  );
}

// ============ TIMETABLE ============
export function StudentTimetable() {
  const { state } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (!student) return <div>Student not found</div>;

  const myTimetable = state.timetable.filter(t => t.batchId === student.batchId);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Timetable</h1>
          <p className="text-sm text-slate-400 mt-1">Weekly class schedule</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded text-xs font-medium ${view === 'grid' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Grid</button>
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded text-xs font-medium ${view === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}>List</button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {days.map(day => {
            const dayClasses = myTimetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <Card key={day} className="p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{day}</h3>
                {dayClasses.length === 0 ? (
                  <p className="text-xs text-slate-600">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {dayClasses.map(tc => {
                      const subject = state.subjects.find(s => s.id === tc.subjectId);
                      const faculty = state.faculty.find(f => f.id === tc.facultyId);
                      return (
                        <div key={tc.id} className="p-2 bg-slate-900/50 rounded-lg border border-slate-700/50">
                          <p className="text-xs font-medium text-slate-200">{subject?.name}</p>
                          <p className="text-[10px] text-slate-500">{tc.startTime}-{tc.endTime}</p>
                          <p className="text-[10px] text-slate-500">{faculty?.name}</p>
                          <p className="text-[10px] text-slate-600">{tc.room}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-5">
          <div className="space-y-2">
            {days.map(day => {
              const dayClasses = myTimetable.filter(t => t.day === day);
              if (dayClasses.length === 0) return null;
              return (
                <div key={day}>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 first:mt-0">{day}</h3>
                  {dayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(tc => {
                    const subject = state.subjects.find(s => s.id === tc.subjectId);
                    const faculty = state.faculty.find(f => f.id === tc.facultyId);
                    return (
                      <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{subject?.name}</p>
                          <p className="text-xs text-slate-500">{faculty?.name} • {tc.room}</p>
                        </div>
                        <Badge variant="info">{tc.startTime} - {tc.endTime}</Badge>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============ MY LEARNING ============
export function StudentLearning() {
  const { state, dispatch } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  if (!student) return <div>Student not found</div>;

  const myCourses = state.courses.filter(c => c.status === 'approved' && c.audienceStudentIds.includes(student.id));
  const course = selectedCourse ? state.courses.find(c => c.id === selectedCourse) : null;

  const getCourseProgress = (c: typeof state.courses[0]) => {
    const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
    const completedLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.filter(l => l.completedBy.includes(student.id)).length, 0);
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const handleCompleteLesson = (courseId: string, lessonId: string) => {
    dispatch({ type: 'COMPLETE_LESSON', payload: { courseId, lessonId, studentId: student.id } });
    showToast('Lesson marked as complete!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Learning</h1>
        <p className="text-sm text-slate-400 mt-1">Your approved courses and learning progress</p>
      </div>

      {!selectedCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCourses.map(c => {
            const progress = getCourseProgress(c);
            const subject = state.subjects.find(s => s.id === c.subjectId);
            const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
            const completedLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.filter(l => l.completedBy.includes(student.id)).length, 0);
            return (
              <Card key={c.id} className="p-5 hover:border-violet-600/50 transition-colors cursor-pointer" >
                <div onClick={() => setSelectedCourse(c.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="purple">{subject?.name}</Badge>
                    <Badge variant={c.difficulty === 'advanced' ? 'danger' : c.difficulty === 'intermediate' ? 'warning' : 'success'}>{c.difficulty}</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>{c.chapters.length} chapters</span>
                    <span>{completedLessons}/{totalLessons} lessons</span>
                  </div>
                  <ProgressBar value={progress} color="violet" size="sm" />
                </div>
              </Card>
            );
          })}
          {myCourses.length === 0 && <EmptyState icon={<BookOpen className="w-8 h-8" />} title="No courses available" description="Your approved courses will appear here." />}
        </div>
      ) : course ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedCourse(null)}>← Back to courses</Button>
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{course.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{course.description}</p>
              </div>
              <Badge variant="success">{getCourseProgress(course)}% complete</Badge>
            </div>
            <div className="space-y-4">
              {course.chapters.sort((a, b) => a.order - b.order).map(ch => (
                <div key={ch.id} className="border border-slate-700/50 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-200">Chapter {ch.order}: {ch.title}</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {ch.lessons.sort((a, b) => a.order - b.order).map(l => {
                      const isCompleted = l.completedBy.includes(student.id);
                      return (
                        <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg ${isCompleted ? 'bg-emerald-900/20 border border-emerald-700/30' : 'bg-slate-900/50 border border-slate-700/50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                              {isCompleted ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="text-xs text-slate-400">{l.order}</span>}
                            </div>
                            <div>
                              <p className={`text-sm ${isCompleted ? 'text-emerald-300' : 'text-slate-200'}`}>{l.title}</p>
                              <p className="text-xs text-slate-500">{l.description}</p>
                            </div>
                          </div>
                          {!isCompleted && (
                            <Button size="sm" variant="ghost" onClick={() => handleCompleteLesson(course.id, l.id)}>
                              <Check className="w-3.5 h-3.5 mr-1" />Complete
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

// ============ STUDY PLANNER ============
export function StudentPlanner() {
  const { state, dispatch } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', subjectId: '', priority: 'medium' as const, deadline: '', estimatedMinutes: 30 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!student) return <div>Student not found</div>;

  const myTasks = state.studyTasks.filter(t => t.studentId === student.id);
  const filtered = filter === 'all' ? myTasks : filter === 'pending' ? myTasks.filter(t => !t.completed) : myTasks.filter(t => t.completed);
  const completedToday = myTasks.filter(t => t.completed).length;
  const totalTasks = myTasks.length;

  const handleAdd = () => {
    if (!form.title || !form.subjectId || !form.deadline) { showToast('Please fill required fields', 'error'); return; }
    dispatch({
      type: 'ADD_STUDY_TASK',
      payload: { id: `task-${Date.now()}`, studentId: student.id, ...form, completed: false, createdAt: new Date().toISOString() }
    });
    showToast('Task added', 'success');
    setShowAdd(false);
    setForm({ title: '', subjectId: '', priority: 'medium', deadline: '', estimatedMinutes: 30 });
  };

  const planMyDay = () => {
    const pending = myTasks.filter(t => !t.completed);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...pending].sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
    showToast(`Plan ready! ${sorted.length} tasks prioritized.`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Study Planner</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your study tasks and track progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={planMyDay}><Zap className="w-4 h-4 mr-2" />Plan My Day</Button>
          <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Task</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Tasks" value={totalTasks} icon={<CheckSquare className="w-5 h-5" />} color="violet" />
        <StatCard title="Completed" value={completedToday} icon={<Check className="w-5 h-5" />} color="emerald" />
        <StatCard title="Pending" value={totalTasks - completedToday} icon={<Clock className="w-5 h-5" />} color="amber" />
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }).map(task => {
          const subject = state.subjects.find(s => s.id === task.subjectId);
          return (
            <Card key={task.id} className={`p-4 ${task.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => dispatch({ type: 'TOGGLE_STUDY_TASK', payload: task.id })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600 hover:border-violet-500'}`}>
                  {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="purple">{subject?.name}</Badge>
                    <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>{task.priority}</Badge>
                    <span className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-500">~{task.estimatedMinutes}min</span>
                  </div>
                </div>
                <button onClick={() => setDeleteConfirm(task.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && <EmptyState icon={<CheckSquare className="w-8 h-8" />} title="No tasks" description={filter === 'all' ? 'Add your first study task!' : `No ${filter} tasks.`} />}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Study Task" size="sm">
        <div className="space-y-4">
          <Input label="Task Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What do you need to study?" />
          <Select label="Subject *" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...state.subjects.map(s => ({ value: s.id, label: s.name }))]} />
          <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
          <Input label="Deadline *" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
          <Input label="Estimated Time (minutes)" type="number" value={form.estimatedMinutes} onChange={e => setForm({...form, estimatedMinutes: parseInt(e.target.value) || 30})} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Task</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" size="sm">
        <p className="text-sm text-slate-300 mb-4">Are you sure you want to delete this task?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) { dispatch({ type: 'DELETE_STUDY_TASK', payload: deleteConfirm }); showToast('Task deleted', 'info'); } setDeleteConfirm(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

// ============ ASSIGNMENTS ============
export function StudentAssignments() {
  const { state } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  if (!student) return <div>Student not found</div>;

  const myAssessments = state.assessments.filter(a => a.batchId === student.batchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Assignments</h1>
        <p className="text-sm text-slate-400 mt-1">View your assessments and scores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAssessments.map(a => {
          const subject = state.subjects.find(s => s.id === a.subjectId);
          const myResult = a.results.find(r => r.studentId === student.id);
          const isOverdue = new Date(a.deadline) < new Date();
          const hasScore = myResult?.marks !== null && myResult?.marks !== undefined;
          return (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{a.title}</h3>
                  <p className="text-xs text-slate-500">{subject?.name}</p>
                </div>
                <Badge variant={isOverdue ? 'default' : 'warning'}>{isOverdue ? 'Overdue' : 'Pending'}</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Due Date</span><span className="text-slate-300">{new Date(a.deadline).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Max Marks</span><span className="text-slate-300">{a.maxMarks}</span></div>
                {hasScore && (
                  <div className="flex justify-between"><span className="text-slate-400">Your Score</span><span className="text-emerald-400 font-semibold">{myResult?.marks}/{a.maxMarks}</span></div>
                )}
              </div>
              {hasScore && (
                <div className="mt-3">
                  <ProgressBar value={(myResult?.marks || 0)} max={a.maxMarks} color={(myResult?.marks || 0) / a.maxMarks >= 0.75 ? 'emerald' : 'amber'} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {myAssessments.length === 0 && <EmptyState icon={<FileText className="w-8 h-8" />} title="No assignments" description="Your assignments will appear here." />}
    </div>
  );
}

// ============ ASK A DOUBT ============
export function StudentDoubts() {
  const { state, dispatch } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [showAsk, setShowAsk] = useState(false);
  const [form, setForm] = useState({ subjectId: '', question: '' });
  const [selectedDoubt, setSelectedDoubt] = useState<string | null>(null);

  if (!student) return <div>Student not found</div>;

  const myDoubts = state.doubts.filter(d => d.studentId === student.id);

  const handleSubmit = () => {
    if (!form.subjectId || !form.question.trim()) { showToast('Please fill all fields', 'error'); return; }
    dispatch({
      type: 'ADD_DOUBT',
      payload: { id: `doubt-${Date.now()}`, studentId: student.id, subjectId: form.subjectId, question: form.question, status: 'open', createdAt: new Date().toISOString() }
    });
    showToast('Doubt submitted!', 'success');
    setShowAsk(false);
    setForm({ subjectId: '', question: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Doubts</h1>
          <p className="text-sm text-slate-400 mt-1">Ask questions and get help from faculty</p>
        </div>
        <Button onClick={() => setShowAsk(true)}><Plus className="w-4 h-4 mr-2" />Ask a Doubt</Button>
      </div>

      <div className="space-y-3">
        {myDoubts.map(d => {
          const subject = state.subjects.find(s => s.id === d.subjectId);
          const repliedFaculty = d.repliedBy ? state.faculty.find(f => f.id === d.repliedBy) : null;
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="purple">{subject?.name}</Badge>
                  <Badge variant={d.status === 'open' ? 'warning' : d.status === 'answered' ? 'info' : 'success'}>{d.status}</Badge>
                </div>
                <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-200 mb-3">{d.question}</p>
              {d.reply && (
                <div className="p-3 bg-violet-900/20 border border-violet-700/30 rounded-lg">
                  <p className="text-xs text-violet-400 mb-1">Reply from {repliedFaculty?.name}:</p>
                  <p className="text-sm text-slate-300">{d.reply}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {myDoubts.length === 0 && <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="No doubts yet" description="Ask your first question to get help from faculty." action={<Button onClick={() => setShowAsk(true)}>Ask a Doubt</Button>} />}

      <Modal isOpen={showAsk} onClose={() => setShowAsk(false)} title="Ask a Doubt" size="sm">
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...state.subjects.map(s => ({ value: s.id, label: s.name }))]} />
          <Textarea label="Your Question" value={form.question} onChange={e => setForm({...form, question: e.target.value})} rows={4} placeholder="Describe your doubt in detail..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAsk(false)}>Cancel</Button>
            <Button onClick={handleSubmit}><Send className="w-4 h-4 mr-2" />Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ FEEDBACK ============
export function StudentFeedback() {
  const { state, dispatch } = useApp();
  const student = state.students.find(s => s.id === state.currentUserId);
  const [form, setForm] = useState({ subjectId: '', rating: 0, clarity: 0, pace: 0, doubtResolution: 0, comments: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!student) return <div>Student not found</div>;

  const handleSubmit = () => {
    if (!form.subjectId || form.rating === 0) { showToast('Please fill all required fields', 'error'); return; }
    dispatch({
      type: 'ADD_FEEDBACK',
      payload: { id: `fb-${Date.now()}`, studentId: student.id, ...form, createdAt: new Date().toISOString() }
    });
    showToast('Feedback submitted! Thank you.', 'success');
    setSubmitted(true);
    setForm({ subjectId: '', rating: 0, clarity: 0, pace: 0, doubtResolution: 0, comments: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Feedback</h1>
        <p className="text-sm text-slate-400 mt-1">Share your experience to help us improve</p>
      </div>

      {submitted ? (
        <Card className="p-8 text-center">
          <div className="text-emerald-400 mb-3"><Check className="w-10 h-10 mx-auto" /></div>
          <h3 className="text-lg font-semibold text-slate-200">Thank you for your feedback!</h3>
          <p className="text-sm text-slate-400 mt-2">Your input helps us improve the learning experience.</p>
          <Button className="mt-4" variant="secondary" onClick={() => setSubmitted(false)}>Submit Another</Button>
        </Card>
      ) : (
        <Card className="p-6 max-w-2xl">
          <div className="space-y-6">
            <Select label="Subject / Course" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...state.subjects.map(s => ({ value: s.id, label: s.name }))]} />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Overall Rating *</label>
              <Rating value={form.rating} onChange={v => setForm({...form, rating: v})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Clarity of Teaching</label>
              <Rating value={form.clarity} onChange={v => setForm({...form, clarity: v})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pace of Classes</label>
              <Rating value={form.pace} onChange={v => setForm({...form, pace: v})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Doubt Resolution</label>
              <Rating value={form.doubtResolution} onChange={v => setForm({...form, doubtResolution: v})} />
            </div>

            <Textarea label="Comments (optional)" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} rows={3} placeholder="Any additional feedback..." />

            <p className="text-xs text-slate-500">⚠️ This is demo feedback data and is stored locally only.</p>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit}><Send className="w-4 h-4 mr-2" />Submit Feedback</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
