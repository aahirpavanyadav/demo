import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, StatCard, Badge, Button, Modal, Input, Select, Textarea, Table, SearchInput, EmptyState, showToast, Tabs, ProgressBar, Rating } from '../../components/UIComponents';
import { QRCodeSVG } from 'qrcode.react';
import { Play, Square, Clock, Users, BookOpen, Calendar, Award, FileText, MessageSquare, CheckSquare, FolderOpen, Plus, Edit, Trash2, Eye, Check, X as XIcon, Send, AlertCircle } from 'lucide-react';

// ============ FACULTY DASHBOARD ============
export function FacultyDashboard() {
  const { state } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  if (!faculty) return <div>Faculty not found</div>;

  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = state.timetable.filter(t => t.day === todayDay && t.facultyId === faculty.id);
  const myBatches = state.batches.filter(b => faculty.batches.includes(b.id));
  const mySubjects = state.subjects.filter(s => faculty.subjects.includes(s.id));
  const pendingAttendance = state.attendanceRecords.filter(a => a.status === 'pending' && faculty.batches.some(bid => state.batches.find(b => b.id === a.batchId)?.facultyIds.includes(faculty.id))).length;
  const pendingCourses = state.courses.filter(c => c.createdBy === faculty.id && c.status === 'pending').length;
  const upcomingAssessments = state.assessments.filter(a => a.createdBy === faculty.id && new Date(a.deadline) > new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Faculty Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome, {faculty.name}. Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Classes" value={todayClasses.length} icon={<Calendar className="w-5 h-5" />} color="cyan" />
        <StatCard title="My Batches" value={myBatches.length} icon={<Users className="w-5 h-5" />} color="violet" />
        <StatCard title="Pending Attendance" value={pendingAttendance} icon={<CheckSquare className="w-5 h-5" />} color="amber" />
        <StatCard title="Pending Approvals" value={pendingCourses} icon={<FolderOpen className="w-5 h-5" />} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-400" />Today's Schedule</h3>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-slate-500">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map(tc => {
                const subject = state.subjects.find(s => s.id === tc.subjectId);
                const batch = state.batches.find(b => b.id === tc.batchId);
                return (
                  <div key={tc.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{subject?.name}</p>
                      <p className="text-xs text-slate-500">{batch?.name} • {tc.room}</p>
                    </div>
                    <Badge variant="info">{tc.startTime} - {tc.endTime}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Assessments */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" />Upcoming Assessments</h3>
          {upcomingAssessments.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming assessments.</p>
          ) : (
            <div className="space-y-2">
              {upcomingAssessments.slice(0, 5).map(a => {
                const subject = state.subjects.find(s => s.id === a.subjectId);
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{a.title}</p>
                      <p className="text-xs text-slate-500">{subject?.name} • Max: {a.maxMarks}</p>
                    </div>
                    <Badge variant="warning">{new Date(a.deadline).toLocaleDateString()}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* My Subjects */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">My Subjects</h3>
        <div className="flex flex-wrap gap-3">
          {mySubjects.map(s => (
            <div key={s.id} className="px-4 py-3 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-700/30 rounded-lg">
              <p className="text-sm font-medium text-slate-200">{s.name}</p>
              <p className="text-xs text-slate-500">{s.code}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============ MY CLASSES (QR Attendance) ============
export function FacultyClasses() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  if (!faculty) return <div>Faculty not found</div>;

  const myBatches = state.batches.filter(b => faculty.batches.includes(b.id));
  const mySubjects = state.subjects.filter(s => faculty.subjects.includes(s.id));

  const handleStartClass = () => {
    if (!selectedBatch || !selectedSubject) { showToast('Please select batch and subject', 'error'); return; }
    const sessionId = `session-${Date.now()}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const session = {
      id: sessionId,
      batchId: selectedBatch,
      subjectId: selectedSubject,
      facultyId: faculty.id,
      startTime: now.toISOString(),
      expiryTime: expiry.toISOString(),
      status: 'active' as const,
      attendanceRecords: [],
    };
    dispatch({ type: 'CREATE_SESSION', payload: session });
    setActiveSession(sessionId);
    setTimeLeft(300);
    showToast('Class session started! QR code is now active.', 'success');
  };

  const handleEndClass = () => {
    if (activeSession) {
      dispatch({ type: 'END_SESSION', payload: activeSession });
      setActiveSession(null);
      setTimeLeft(0);
      showToast('Class session ended.', 'info');
    }
  };

  useEffect(() => {
    if (!activeSession || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleEndClass(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, timeLeft]);

  const session = activeSession ? state.classSessions.find(s => s.id === activeSession) : null;
  const qrData = activeSession ? JSON.stringify({ sessionId: activeSession, batchId: selectedBatch, expiry: session?.expiryTime }) : '';
  const batchName = state.batches.find(b => b.id === selectedBatch)?.name;
  const subjectName = state.subjects.find(s => s.id === selectedSubject)?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Classes</h1>
        <p className="text-sm text-slate-400 mt-1">Start class sessions and manage QR attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Controls */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Start a Class Session</h3>
          <div className="space-y-4">
            <Select label="Select Batch" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} options={[{ value: '', label: 'Choose batch...' }, ...myBatches.map(b => ({ value: b.id, label: b.name }))]} />
            <Select label="Select Subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} options={[{ value: '', label: 'Choose subject...' }, ...mySubjects.map(s => ({ value: s.id, label: s.name }))]} />
            {!activeSession ? (
              <Button onClick={handleStartClass} className="w-full" size="lg"><Play className="w-4 h-4 mr-2" />Start Class Session</Button>
            ) : (
              <Button variant="danger" onClick={handleEndClass} className="w-full" size="lg"><Square className="w-4 h-4 mr-2" />End Session</Button>
            )}
          </div>

          {activeSession && (
            <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-300 font-medium">Session Active</span>
              </div>
              <p className="text-xs text-slate-400">Batch: {batchName} • Subject: {subjectName}</p>
              <p className="text-xs text-slate-400">Session ID: <code className="text-cyan-400">{activeSession.slice(0, 16)}...</code></p>
              <p className="text-xs text-slate-400 mt-1">Time remaining: <span className="text-amber-300 font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></p>
            </div>
          )}
        </Card>

        {/* QR Code Display */}
        <Card className="p-6 flex flex-col items-center justify-center">
          {activeSession && qrData ? (
            <>
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Scan QR to Mark Attendance</h3>
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={qrData} size={200} level="M" />
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">Students can scan this QR code or enter the session code manually in their Student panel.</p>
              <div className="mt-3 p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400">Manual Code: <code className="text-cyan-400 font-mono">{activeSession}</code></p>
              </div>
            </>
          ) : (
            <EmptyState icon={<Play className="w-8 h-8" />} title="No Active Session" description="Start a class session to display the QR code for student attendance." />
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Sessions</h3>
        {state.classSessions.filter(s => s.facultyId === faculty.id).length === 0 ? (
          <p className="text-sm text-slate-500">No sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {state.classSessions.filter(s => s.facultyId === faculty.id).slice(-5).reverse().map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-200">{state.subjects.find(sub => sub.id === s.subjectId)?.name} - {state.batches.find(b => b.id === s.batchId)?.name}</p>
                  <p className="text-xs text-slate-500">{new Date(s.startTime).toLocaleString()}</p>
                </div>
                <Badge variant={s.status === 'active' ? 'success' : 'default'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ============ ATTENDANCE REVIEW ============
export function FacultyAttendance() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  if (!faculty) return <div>Faculty not found</div>;

  const pendingRecords = state.attendanceRecords.filter(a => {
    const batch = state.batches.find(b => b.id === a.batchId);
    return a.status === 'pending' && batch?.facultyIds.includes(faculty.id);
  });

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    dispatch({ type: 'REVIEW_ATTENDANCE', payload: { id, status } });
    showToast(`Attendance ${status}`, status === 'approved' ? 'success' : 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attendance Review</h1>
        <p className="text-sm text-slate-400 mt-1">Review and approve student attendance submissions</p>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Pending Submissions ({pendingRecords.length})</h3>
        {pendingRecords.length === 0 ? (
          <EmptyState icon={<Check className="w-8 h-8" />} title="All caught up!" description="No pending attendance submissions to review." />
        ) : (
          <div className="space-y-3">
            {pendingRecords.map(record => {
              const student = state.students.find(s => s.id === record.studentId);
              const subject = state.subjects.find(s => s.id === record.subjectId);
              const batch = state.batches.find(b => b.id === record.batchId);
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{student?.name}</p>
                    <p className="text-xs text-slate-500">{subject?.name} • {batch?.name} • {new Date(record.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => handleReview(record.id, 'approved')}><Check className="w-3.5 h-3.5 mr-1" />Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleReview(record.id, 'rejected')}><XIcon className="w-3.5 h-3.5 mr-1" />Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ============ ASSESSMENTS ============
export function FacultyAssessments() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', subjectId: '', batchId: '', deadline: '', maxMarks: 50 });
  const [editResults, setEditResults] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});

  if (!faculty) return <div>Faculty not found</div>;

  const myAssessments = state.assessments.filter(a => a.createdBy === faculty.id);

  const handleCreate = () => {
    if (!form.title || !form.subjectId || !form.batchId || !form.deadline) { showToast('Please fill all fields', 'error'); return; }
    const batch = state.batches.find(b => b.id === form.batchId);
    const assessment = {
      id: `assess-${Date.now()}`,
      ...form,
      maxMarks: parseInt(form.maxMarks as any) || 50,
      createdBy: faculty.id,
      results: (batch?.studentIds || []).map(sid => ({ studentId: sid, marks: null })),
    };
    dispatch({ type: 'ADD_ASSESSMENT', payload: assessment });
    showToast('Assessment created', 'success');
    setShowCreate(false);
    setForm({ title: '', subjectId: '', batchId: '', deadline: '', maxMarks: 50 });
  };

  const handleSaveMarks = (assessId: string) => {
    const assessment = state.assessments.find(a => a.id === assessId);
    if (!assessment) return;
    const updated = { ...assessment, results: assessment.results.map(r => ({ ...r, marks: marks[r.studentId] !== undefined ? parseInt(marks[r.studentId]) || null : r.marks })) };
    dispatch({ type: 'UPDATE_ASSESSMENT', payload: updated });
    showToast('Marks saved', 'success');
    setEditResults(null);
    setMarks({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Assessments</h1>
          <p className="text-sm text-slate-400 mt-1">Create and manage assessments</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Assessment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAssessments.map(a => {
          const subject = state.subjects.find(s => s.id === a.subjectId);
          const batch = state.batches.find(b => b.id === a.batchId);
          const submitted = a.results.filter(r => r.marks !== null).length;
          const total = a.results.length;
          return (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{a.title}</h3>
                  <p className="text-xs text-slate-500">{subject?.name} • {batch?.name}</p>
                </div>
                <Badge variant={new Date(a.deadline) < new Date() ? 'default' : 'warning'}>{new Date(a.deadline).toLocaleDateString()}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-400">Max Marks: {a.maxMarks}</span>
                <span className="text-slate-400">Submitted: {submitted}/{total}</span>
              </div>
              <ProgressBar value={submitted} max={total} color="cyan" size="sm" />
              <div className="mt-3">
                <Button size="sm" variant="secondary" onClick={() => { setEditResults(a.id); const m: Record<string, string> = {}; a.results.forEach(r => { if (r.marks !== null) m[r.studentId] = r.marks.toString(); }); setMarks(m); }}>
                  <Edit className="w-3.5 h-3.5 mr-1" />Enter Marks
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {myAssessments.length === 0 && <EmptyState icon={<Award className="w-8 h-8" />} title="No assessments yet" description="Create your first assessment to get started." action={<Button onClick={() => setShowCreate(true)}>Create Assessment</Button>} />}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Assessment">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Assessment title" />
          <Select label="Subject *" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...faculty.subjects.map(sid => ({ value: sid, label: state.subjects.find(s => s.id === sid)?.name || '' }))]} />
          <Select label="Batch *" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} options={[{ value: '', label: 'Select batch' }, ...faculty.batches.map(bid => ({ value: bid, label: state.batches.find(b => b.id === bid)?.name || '' }))]} />
          <Input label="Deadline *" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
          <Input label="Max Marks" type="number" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: e.target.value as any})} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Marks Entry Modal */}
      <Modal isOpen={!!editResults} onClose={() => setEditResults(null)} title="Enter Marks" size="md">
        {editResults && (() => {
          const assessment = state.assessments.find(a => a.id === editResults);
          if (!assessment) return null;
          return (
            <div className="space-y-3">
              {assessment.results.map(r => {
                const student = state.students.find(s => s.id === r.studentId);
                return (
                  <div key={r.studentId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-slate-200">{student?.name}</span>
                    <input type="number" min={0} max={assessment.maxMarks} value={marks[r.studentId] || ''} onChange={e => setMarks({...marks, [r.studentId]: e.target.value})} placeholder={`/${assessment.maxMarks}`} className="w-24 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                );
              })}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setEditResults(null)}>Cancel</Button>
                <Button onClick={() => handleSaveMarks(editResults)}>Save Marks</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ============ SYLLABUS ============
export function FacultySyllabus() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subjectId: '', title: '' });

  if (!faculty) return <div>Faculty not found</div>;

  const mySubjects = state.subjects.filter(s => faculty.subjects.includes(s.id));

  const handleAdd = () => {
    if (!form.subjectId || !form.title) { showToast('Please fill all fields', 'error'); return; }
    const maxOrder = Math.max(0, ...state.syllabus.filter(s => s.subjectId === form.subjectId).map(s => s.order));
    dispatch({ type: 'ADD_SYLLABUS_TOPIC', payload: { id: `syl-${Date.now()}`, subjectId: form.subjectId, title: form.title, completed: false, order: maxOrder + 1 } });
    showToast('Topic added', 'success');
    setShowAdd(false);
    setForm({ subjectId: '', title: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Syllabus Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Track syllabus completion by subject</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Topic</Button>
      </div>

      {mySubjects.map(sub => {
        const topics = state.syllabus.filter(s => s.subjectId === sub.id).sort((a, b) => a.order - b.order);
        const completed = topics.filter(t => t.completed).length;
        const percentage = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0;
        return (
          <Card key={sub.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{sub.name}</h3>
                <p className="text-xs text-slate-500">{completed}/{topics.length} topics completed</p>
              </div>
              <Badge variant={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'info'}>{percentage}%</Badge>
            </div>
            <div className="mb-3"><ProgressBar value={percentage} color={percentage >= 75 ? 'emerald' : percentage >= 50 ? 'amber' : 'cyan'} size="sm" /></div>
            <div className="space-y-1">
              {topics.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50">
                  <button onClick={() => dispatch({ type: 'TOGGLE_SYLLABUS_TOPIC', payload: t.id })} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600 hover:border-violet-500'}`}>
                    {t.completed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm ${t.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{t.title}</span>
                  <button onClick={() => dispatch({ type: 'DELETE_SYLLABUS_TOPIC', payload: t.id })} className="ml-auto text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Syllabus Topic" size="sm">
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...mySubjects.map(s => ({ value: s.id, label: s.name }))]} />
          <Input label="Topic Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Enter topic title" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Topic</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ DOUBTS ============
export function FacultyDoubts() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  const [filter, setFilter] = useState('all');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!faculty) return <div>Faculty not found</div>;

  const mySubjectDoubts = state.doubts.filter(d => faculty.subjects.includes(d.subjectId));
  const filtered = filter === 'all' ? mySubjectDoubts : mySubjectDoubts.filter(d => d.status === filter);

  const handleReply = (doubtId: string) => {
    if (!replyText.trim()) { showToast('Please enter a reply', 'error'); return; }
    dispatch({ type: 'REPLY_DOUBT', payload: { id: doubtId, reply: replyText, repliedBy: faculty.id } });
    showToast('Reply sent', 'success');
    setReplyTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Student Doubts</h1>
        <p className="text-sm text-slate-400 mt-1">Answer questions from your students</p>
      </div>

      <div className="flex gap-2">
        {['all', 'open', 'answered', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? mySubjectDoubts.length : mySubjectDoubts.filter(d => d.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(d => {
          const student = state.students.find(s => s.id === d.studentId);
          const subject = state.subjects.find(s => s.id === d.subjectId);
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-200">{student?.name}</p>
                  <p className="text-xs text-slate-500">{subject?.name} • {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={d.status === 'open' ? 'warning' : d.status === 'answered' ? 'info' : 'success'}>{d.status}</Badge>
              </div>
              <p className="text-sm text-slate-300 mb-3">{d.question}</p>
              {d.reply && (
                <div className="p-3 bg-violet-900/20 border border-violet-700/30 rounded-lg mb-3">
                  <p className="text-xs text-violet-400 mb-1">Your reply:</p>
                  <p className="text-sm text-slate-300">{d.reply}</p>
                </div>
              )}
              {d.status !== 'resolved' && (
                <div className="flex gap-2">
                  {!d.reply ? (
                    <Button size="sm" onClick={() => setReplyTo(d.id)}><MessageSquare className="w-3.5 h-3.5 mr-1" />Reply</Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => dispatch({ type: 'RESOLVE_DOUBT', payload: d.id })}><Check className="w-3.5 h-3.5 mr-1" />Mark Resolved</Button>
                  )}
                </div>
              )}
              {replyTo === d.id && (
                <div className="mt-3 space-y-2">
                  <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleReply(d.id)}>Send Reply</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyTo(null); setReplyText(''); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="No doubts to show" description="No student doubts match the current filter." />}
    </div>
  );
}

// ============ COURSE CREATOR ============
export function FacultyCourses() {
  const { state, dispatch } = useApp();
  const faculty = state.faculty.find(f => f.id === state.currentUserId);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', subjectId: '', description: '', difficulty: 'beginner' as const,
    targetBatchId: '', learningObjectives: '', prerequisites: '',
    chapters: [{ id: 'ch-new-1', title: 'Chapter 1', order: 1, lessons: [{ id: 'les-new-1', title: 'Lesson 1', description: '', videoUrl: '', resourceUrl: '', order: 1, completedBy: [] as string[] }] }]
  });
  const [videoFile, setVideoFile] = useState<string>('');

  if (!faculty) return <div>Faculty not found</div>;

  const myCourses = state.courses.filter(c => c.createdBy === faculty.id);

  const statusVariant = (s: string) => {
    switch (s) { case 'approved': return 'success'; case 'pending': return 'warning'; case 'rejected': return 'danger'; case 'draft': return 'default'; default: return 'default'; }
  };

  const handleSubmit = (status: 'draft' | 'pending') => {
    if (!form.title || !form.subjectId || !form.targetBatchId) { showToast('Please fill required fields', 'error'); return; }
    const batch = state.batches.find(b => b.id === form.targetBatchId);
    const course = {
      id: `course-${Date.now()}`,
      title: form.title,
      subjectId: form.subjectId,
      description: form.description,
      learningObjectives: form.learningObjectives.split('\n').filter(Boolean),
      difficulty: form.difficulty,
      prerequisites: form.prerequisites.split('\n').filter(Boolean),
      targetBatchId: form.targetBatchId,
      audienceStudentIds: batch?.studentIds || [],
      thumbnailUrl: '',
      chapters: form.chapters,
      status,
      createdBy: faculty.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COURSE', payload: course });
    showToast(status === 'draft' ? 'Saved as draft' : 'Submitted for approval', 'success');
    setShowCreate(false);
    setForm({ title: '', subjectId: '', description: '', difficulty: 'beginner', targetBatchId: '', learningObjectives: '', prerequisites: '', chapters: [{ id: 'ch-new-1', title: 'Chapter 1', order: 1, lessons: [{ id: 'les-new-1', title: 'Lesson 1', description: '', videoUrl: '', resourceUrl: '', order: 1, completedBy: [] }] }] });
  };

  const addChapter = () => {
    setForm({...form, chapters: [...form.chapters, { id: `ch-new-${Date.now()}`, title: `Chapter ${form.chapters.length + 1}`, order: form.chapters.length + 1, lessons: [] }]});
  };

  const addLesson = (chapterIndex: number) => {
    const chapters = [...form.chapters];
    chapters[chapterIndex].lessons.push({ id: `les-new-${Date.now()}`, title: `Lesson ${chapters[chapterIndex].lessons.length + 1}`, description: '', videoUrl: '', resourceUrl: '', order: chapters[chapterIndex].lessons.length + 1, completedBy: [] });
    setForm({...form, chapters});
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Course Creator</h1>
          <p className="text-sm text-slate-400 mt-1">Create and manage your courses</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create Course</Button>
      </div>

      {/* My Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myCourses.map(c => {
          const subject = state.subjects.find(s => s.id === c.subjectId);
          const totalLessons = c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">{c.title}</h3>
                <Badge variant={statusVariant(c.status) as any}>{c.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-2">{subject?.name} • {c.chapters.length} chapters • {totalLessons} lessons</p>
              <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
              {c.status === 'rejected' && c.rejectionReason && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700/30 rounded text-xs text-red-300">
                  Rejected: {c.rejectionReason}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {c.status === 'draft' && <Button size="sm" variant="primary" onClick={() => { dispatch({ type: 'UPDATE_COURSE', payload: { ...c, status: 'pending', updatedAt: new Date().toISOString() } }); showToast('Submitted for approval', 'success'); }}>Submit for Approval</Button>}
                {c.status === 'rejected' && <Button size="sm" variant="secondary" onClick={() => { dispatch({ type: 'UPDATE_COURSE', payload: { ...c, status: 'pending', updatedAt: new Date().toISOString() } }); showToast('Resubmitted for approval', 'success'); }}>Resubmit</Button>}
              </div>
            </Card>
          );
        })}
      </div>

      {myCourses.length === 0 && <EmptyState icon={<FolderOpen className="w-8 h-8" />} title="No courses yet" description="Create your first course to share with students." action={<Button onClick={() => setShowCreate(true)}>Create Course</Button>} />}

      {/* Create Course Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Course" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Course Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <Select label="Subject *" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} options={[{ value: '', label: 'Select subject' }, ...faculty.subjects.map(sid => ({ value: sid, label: state.subjects.find(s => s.id === sid)?.name || '' }))]} />
          </div>
          <Textarea label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Course description..." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Difficulty" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value as any})} options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
            <Select label="Target Batch *" value={form.targetBatchId} onChange={e => setForm({...form, targetBatchId: e.target.value})} options={[{ value: '', label: 'Select batch' }, ...faculty.batches.map(bid => ({ value: bid, label: state.batches.find(b => b.id === bid)?.name || '' }))]} />
          </div>
          <Textarea label="Learning Objectives (one per line)" value={form.learningObjectives} onChange={e => setForm({...form, learningObjectives: e.target.value})} rows={3} />
          <Textarea label="Prerequisites (one per line)" value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} rows={2} />

          {/* Video Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Video Preview (local file - temporary)</label>
            <input type="file" accept="video/*" onChange={handleVideoSelect} className="text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600" />
            {videoFile && <video src={videoFile} controls className="mt-2 w-full max-w-md rounded-lg" />}
            <p className="text-[10px] text-slate-600 mt-1">⚠️ Local file previews are temporary and not shared with other users.</p>
          </div>

          {/* Chapters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Chapters & Lessons</label>
              <Button size="sm" variant="ghost" onClick={addChapter}><Plus className="w-3.5 h-3.5 mr-1" />Add Chapter</Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {form.chapters.map((ch, ci) => (
                <div key={ch.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <input value={ch.title} onChange={e => { const chapters = [...form.chapters]; chapters[ci].title = e.target.value; setForm({...form, chapters}); }} className="bg-transparent text-sm font-medium text-slate-200 focus:outline-none border-b border-transparent focus:border-violet-500" />
                    <Button size="sm" variant="ghost" onClick={() => addLesson(ci)}><Plus className="w-3 h-3 mr-1" />Lesson</Button>
                  </div>
                  <div className="space-y-1 pl-3 border-l-2 border-violet-600/30">
                    {ch.lessons.map((l, li) => (
                      <input key={l.id} value={l.title} onChange={e => { const chapters = [...form.chapters]; chapters[ci].lessons[li].title = e.target.value; setForm({...form, chapters}); }} className="w-full bg-transparent text-xs text-slate-400 focus:outline-none focus:text-slate-200 py-1" placeholder="Lesson title" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => handleSubmit('draft')}>Save Draft</Button>
            <Button onClick={() => handleSubmit('pending')}>Submit for Approval</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
