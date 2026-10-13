import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, StatCard, Badge, Button, Modal, Input, Select, Textarea, Table, SearchInput, ConfirmDialog, ProgressBar, EmptyState, showToast, Tabs } from '../../components/UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, GraduationCap, BookOpen, Calendar, ClipboardCheck, AlertTriangle, Shield, TrendingUp, Activity, Plus, Edit, Trash2, Eye, Check, X as XIcon, Archive, Pause } from 'lucide-react';

// ============ ADMIN DASHBOARD ============
export function AdminDashboard() {
  const { state, getStudentAttendance } = useApp();
  
  const totalStudents = state.students.filter(s => s.active).length;
  const totalFaculty = state.faculty.filter(f => f.active).length;
  const activeBatches = state.batches.length;
  const pendingApprovals = state.courses.filter(c => c.status === 'pending').length;
  
  const avgAttendance = (() => {
    const attendances = state.students.filter(s => s.active).map(s => getStudentAttendance(s.id).percentage);
    return attendances.length > 0 ? Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length) : 0;
  })();

  const belowTarget = state.students.filter(s => s.active && getStudentAttendance(s.id).percentage < state.institute.attendanceTarget).length;

  const weeklyData = [
    { day: 'Mon', attendance: 85 }, { day: 'Tue', attendance: 78 }, { day: 'Wed', attendance: 82 },
    { day: 'Thu', attendance: 75 }, { day: 'Fri', attendance: 88 }, { day: 'Sat', attendance: 70 },
  ];

  const batchData = state.batches.map(b => {
    const batchStudents = state.students.filter(s => s.batchId === b.id && s.active);
    const avg = batchStudents.length > 0 ? Math.round(batchStudents.reduce((sum, s) => sum + getStudentAttendance(s.id).percentage, 0) / batchStudents.length) : 0;
    return { name: b.name.split(' - ')[0], attendance: avg };
  });

  const riskStudents = state.students.filter(s => s.active && getStudentAttendance(s.id).percentage < state.institute.attendanceTarget);

  const statusData = [
    { name: 'Approved', value: state.courses.filter(c => c.status === 'approved').length, color: '#10b981' },
    { name: 'Pending', value: state.courses.filter(c => c.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: state.courses.filter(c => c.status === 'rejected').length, color: '#ef4444' },
    { name: 'Draft', value: state.courses.filter(c => c.status === 'draft').length, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back. Here's your institute overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents} icon={<Users className="w-5 h-5" />} color="violet" />
        <StatCard title="Total Faculty" value={totalFaculty} icon={<GraduationCap className="w-5 h-5" />} color="cyan" />
        <StatCard title="Active Batches" value={activeBatches} icon={<BookOpen className="w-5 h-5" />} color="emerald" />
        <StatCard title="Pending Approvals" value={pendingApprovals} icon={<Shield className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg. Attendance" value={`${avgAttendance}%`} icon={<ClipboardCheck className="w-5 h-5" />} color={avgAttendance >= 75 ? 'emerald' : 'red'} />
        <StatCard title="Below Target" value={belowTarget} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        <StatCard title="Today's Classes" value={state.timetable.filter(t => t.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length} icon={<Calendar className="w-5 h-5" />} color="cyan" />
        <StatCard title="Active Courses" value={state.courses.filter(c => c.status === 'approved').length} icon={<BookOpen className="w-5 h-5" />} color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="attendance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Batch-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={batchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="attendance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Table */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Attendance Risk Students
          </h3>
          <div className="space-y-3">
            {riskStudents.length === 0 ? (
              <p className="text-sm text-slate-500">No students below attendance target.</p>
            ) : riskStudents.map(s => {
              const att = getStudentAttendance(s.id);
              const batch = state.batches.find(b => b.id === s.batchId);
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{s.name}</p>
                    <p className="text-xs text-slate-500">{batch?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={att.percentage} color={att.percentage < 60 ? 'red' : 'amber'} size="sm" />
                    <Badge variant="danger">{att.percentage}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Course Status */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Course Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {state.activityLog.slice(0, 8).map(act => (
            <div key={act.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50">
              <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
              <div className="flex-1">
                <span className="text-sm text-slate-300">{act.action}</span>
                <span className="text-xs text-slate-500 ml-2">by {act.actor}</span>
                {act.target && <span className="text-xs text-slate-500 ml-1">→ {act.target}</span>}
              </div>
              <span className="text-xs text-slate-600">{new Date(act.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============ STUDENT MANAGEMENT ============
export function AdminStudents() {
  const { state, dispatch, getStudentAttendance, getBatch } = useApp();
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', batchId: '' });

  const filtered = state.students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchBatch = batchFilter === 'all' || s.batchId === batchFilter;
    return matchSearch && matchBatch;
  });

  const handleAdd = () => {
    if (!form.name || !form.email || !form.batchId) { showToast('Please fill all required fields', 'error'); return; }
    const newStudent = { id: `stu-${Date.now()}`, ...form, enrolledDate: new Date().toISOString().split('T')[0], active: true };
    dispatch({ type: 'ADD_STUDENT', payload: newStudent });
    showToast('Student added successfully', 'success');
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', batchId: '' });
  };

  const handleEdit = () => {
    if (!editStudent) return;
    dispatch({ type: 'UPDATE_STUDENT', payload: editStudent });
    showToast('Student updated', 'success');
    setEditStudent(null);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: id });
    showToast('Student deactivated', 'success');
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Student Management</h1>
          <p className="text-sm text-slate-400 mt-1">{state.students.filter(s => s.active).length} active students</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Student</Button>
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search students..." />
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All Batches</option>
            {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <Table
          columns={[
            { key: 'name', header: 'Name', render: (s: any) => <span className="font-medium text-slate-200">{s.name}</span> },
            { key: 'email', header: 'Email' },
            { key: 'batch', header: 'Batch', render: (s: any) => <Badge variant="info">{getBatch(s.batchId)?.name || 'N/A'}</Badge> },
            { key: 'attendance', header: 'Attendance', render: (s: any) => { const att = getStudentAttendance(s.id); return <div className="flex items-center gap-2"><ProgressBar value={att.percentage} color={att.percentage < 75 ? 'red' : att.percentage < 85 ? 'amber' : 'emerald'} size="sm" showLabel={false} /><span className="text-xs text-slate-400">{att.percentage}%</span></div>; } },
            { key: 'actions', header: 'Actions', render: (s: any) => (
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setEditStudent({...s}); }} className="p-1.5 text-slate-400 hover:text-violet-400 rounded"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }} className="p-1.5 text-slate-400 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ) },
          ]}
          data={filtered}
          keyField="id"
        />
      </Card>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Student">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter student name" />
          <Input label="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="student@email.com" type="email" />
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number" />
          <Select label="Batch *" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} options={[{ value: '', label: 'Select batch' }, ...state.batches.map(b => ({ value: b.id, label: b.name }))]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Student</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        {editStudent && (
          <div className="space-y-4">
            <Input label="Full Name" value={editStudent.name} onChange={e => setEditStudent({...editStudent, name: e.target.value})} />
            <Input label="Email" value={editStudent.email} onChange={e => setEditStudent({...editStudent, email: e.target.value})} />
            <Input label="Phone" value={editStudent.phone} onChange={e => setEditStudent({...editStudent, phone: e.target.value})} />
            <Select label="Batch" value={editStudent.batchId} onChange={e => setEditStudent({...editStudent, batchId: e.target.value})} options={state.batches.map(b => ({ value: b.id, label: b.name }))} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditStudent(null)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Deactivate Student" message="Are you sure you want to deactivate this student? They will no longer appear in active listings." confirmText="Deactivate" />
    </div>
  );
}

// ============ FACULTY MANAGEMENT ============
export function AdminFaculty() {
  const { state, dispatch, getSubject } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subjects: [] as string[], batches: [] as string[] });

  const filtered = state.faculty.filter(f => f.active && (f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())));

  const handleAdd = () => {
    if (!form.name || !form.email) { showToast('Please fill required fields', 'error'); return; }
    dispatch({ type: 'ADD_FACULTY', payload: { id: `fac-${Date.now()}`, ...form, active: true } });
    showToast('Faculty added', 'success');
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', subjects: [], batches: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Faculty Management</h1>
          <p className="text-sm text-slate-400 mt-1">{state.faculty.filter(f => f.active).length} active faculty members</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" />Add Faculty</Button>
      </div>

      <Card className="p-5">
        <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search faculty..." /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => (
            <Card key={f.id} className="p-4 hover:border-violet-600/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-600/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-cyan-400">{f.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                  <p className="text-xs text-slate-500 truncate">{f.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {f.subjects.map(sid => <Badge key={sid} variant="purple">{getSubject(sid)?.name || sid}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Faculty">
        <div className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" />
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {state.subjects.map(s => (
                <button key={s.id} type="button" onClick={() => setForm({...form, subjects: form.subjects.includes(s.id) ? form.subjects.filter(x => x !== s.id) : [...form.subjects, s.id]})} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.subjects.includes(s.id) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{s.name}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Faculty</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ BATCHES & SUBJECTS ============
export function AdminBatches() {
  const { state, dispatch, getSubject, getFaculty, getStudent } = useApp();
  const [activeTab, setActiveTab] = useState('batches');
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: '', schedule: '', subjectIds: [] as string[], facultyIds: [] as string[] });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });

  const handleAddBatch = () => {
    if (!batchForm.name) { showToast('Batch name is required', 'error'); return; }
    dispatch({ type: 'ADD_BATCH', payload: { id: `batch-${Date.now()}`, ...batchForm, studentIds: [] } });
    showToast('Batch created', 'success');
    setShowAddBatch(false);
    setBatchForm({ name: '', schedule: '', subjectIds: [], facultyIds: [] });
  };

  const handleAddSubject = () => {
    if (!subjectForm.name || !subjectForm.code) { showToast('All fields required', 'error'); return; }
    dispatch({ type: 'ADD_SUBJECT', payload: { id: `sub-${Date.now()}`, ...subjectForm } });
    showToast('Subject added', 'success');
    setShowAddSubject(false);
    setSubjectForm({ name: '', code: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Batches & Subjects</h1>
      <Tabs tabs={[{ id: 'batches', label: 'Batches', count: state.batches.length }, { id: 'subjects', label: 'Subjects', count: state.subjects.length }]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setShowAddBatch(true)}><Plus className="w-4 h-4 mr-2" />Create Batch</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.batches.map(b => (
              <Card key={b.id} className="p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{b.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{b.schedule}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Students</span><Badge variant="info">{b.studentIds.length}</Badge></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Subjects</span><Badge variant="purple">{b.subjectIds.length}</Badge></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Faculty</span><Badge variant="default">{b.facultyIds.length}</Badge></div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {b.subjectIds.map(sid => <Badge key={sid} variant="purple">{getSubject(sid)?.name}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setShowAddSubject(true)}><Plus className="w-4 h-4 mr-2" />Add Subject</Button></div>
          <Card className="p-5">
            <Table
              columns={[
                { key: 'code', header: 'Code', render: (s: any) => <Badge variant="purple">{s.code}</Badge> },
                { key: 'name', header: 'Subject Name', render: (s: any) => <span className="font-medium text-slate-200">{s.name}</span> },
                { key: 'actions', header: 'Actions', render: (s: any) => (
                  <button onClick={() => dispatch({ type: 'DELETE_SUBJECT', payload: s.id })} className="p-1.5 text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                ) },
              ]}
              data={state.subjects}
              keyField="id"
            />
          </Card>
        </div>
      )}

      <Modal isOpen={showAddBatch} onClose={() => setShowAddBatch(false)} title="Create Batch">
        <div className="space-y-4">
          <Input label="Batch Name *" value={batchForm.name} onChange={e => setBatchForm({...batchForm, name: e.target.value})} placeholder="e.g., Batch D - Foundation" />
          <Input label="Schedule" value={batchForm.schedule} onChange={e => setBatchForm({...batchForm, schedule: e.target.value})} placeholder="e.g., Mon-Fri 3:00-6:00" />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {state.subjects.map(s => (
                <button key={s.id} type="button" onClick={() => setBatchForm({...batchForm, subjectIds: batchForm.subjectIds.includes(s.id) ? batchForm.subjectIds.filter(x => x !== s.id) : [...batchForm.subjectIds, s.id]})} className={`px-3 py-1 rounded-full text-xs font-medium ${batchForm.subjectIds.includes(s.id) ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{s.name}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddBatch(false)}>Cancel</Button>
            <Button onClick={handleAddBatch}>Create Batch</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddSubject} onClose={() => setShowAddSubject(false)} title="Add Subject" size="sm">
        <div className="space-y-4">
          <Input label="Subject Name *" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
          <Input label="Subject Code *" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value.toUpperCase()})} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddSubject(false)}>Cancel</Button>
            <Button onClick={handleAddSubject}>Add Subject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ ATTENDANCE REPORTS ============
export function AdminAttendance() {
  const { state, getStudentAttendance, getBatch, getSubject } = useApp();
  const [batchFilter, setBatchFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const report = state.students.filter(s => s.active).map(s => {
    const att = getStudentAttendance(s.id);
    const batch = getBatch(s.batchId);
    const pending = state.attendanceRecords.filter(a => a.studentId === s.id && a.status === 'pending').length;
    const status = att.percentage >= 85 ? 'good' : att.percentage >= 75 ? 'warning' : 'critical';
    return { ...s, attendance: att, batch, pending, status };
  });

  const filtered = report.filter(r => {
    const matchBatch = batchFilter === 'all' || r.batchId === batchFilter;
    return matchBatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Attendance Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Comprehensive attendance tracking across all batches</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All Batches</option>
            {state.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All Subjects</option>
            {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <Table
          columns={[
            { key: 'name', header: 'Student', render: (r: any) => <span className="font-medium text-slate-200">{r.name}</span> },
            { key: 'batch', header: 'Batch', render: (r: any) => <Badge variant="info">{r.batch?.name || 'N/A'}</Badge> },
            { key: 'attended', header: 'Attended', render: (r: any) => <span>{r.attendance.totalAttended}/{r.attendance.totalHeld}</span> },
            { key: 'percentage', header: 'Percentage', render: (r: any) => (
              <div className="flex items-center gap-2">
                <ProgressBar value={r.attendance.percentage} color={r.status === 'critical' ? 'red' : r.status === 'warning' ? 'amber' : 'emerald'} size="sm" showLabel={false} />
                <span className="text-xs font-medium text-slate-300">{r.attendance.percentage}%</span>
              </div>
            ) },
            { key: 'pending', header: 'Pending', render: (r: any) => r.pending > 0 ? <Badge variant="warning">{r.pending}</Badge> : <span className="text-slate-500">0</span> },
            { key: 'status', header: 'Status', render: (r: any) => (
              <Badge variant={r.status === 'critical' ? 'danger' : r.status === 'warning' ? 'warning' : 'success'}>
                {r.status === 'critical' ? 'Critical' : r.status === 'warning' ? 'At Risk' : 'Good'}
              </Badge>
            ) },
          ]}
          data={filtered}
          keyField="id"
        />
      </Card>
    </div>
  );
}

// ============ COURSE APPROVALS ============
export function AdminApprovals() {
  const { state, dispatch, getSubject, getBatch, getFaculty } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState('all');

  const courses = state.courses.filter(c => filter === 'all' || c.status === filter);
  const course = selectedCourse ? state.courses.find(c => c.id === selectedCourse) : null;

  const statusVariant = (s: string) => {
    switch (s) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'draft': return 'default';
      case 'suspended': return 'danger';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Course Approvals</h1>
        <p className="text-sm text-slate-400 mt-1">Review and manage course submissions from faculty</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'draft', 'suspended', 'archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${state.courses.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <Card key={c.id} className="p-5 hover:border-violet-600/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{getSubject(c.subjectId)?.name} • {getBatch(c.targetBatchId)?.name}</p>
              </div>
              <Badge variant={statusVariant(c.status) as any}>{c.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">By {getFaculty(c.createdBy)?.name}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setSelectedCourse(c.id)}><Eye className="w-3.5 h-3.5 mr-1" />View</Button>
                {c.status === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => dispatch({ type: 'APPROVE_COURSE', payload: c.id })}><Check className="w-3.5 h-3.5 mr-1" />Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectModal(c.id)}><XIcon className="w-3.5 h-3.5 mr-1" />Reject</Button>
                  </>
                )}
                {c.status === 'approved' && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'SUSPEND_COURSE', payload: c.id })}><Pause className="w-3.5 h-3.5 mr-1" />Suspend</Button>
                    <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'ARCHIVE_COURSE', payload: c.id })}><Archive className="w-3.5 h-3.5 mr-1" />Archive</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && <EmptyState title="No courses found" description="No courses match the selected filter." />}

      {/* Course Detail Modal */}
      <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={course?.title || 'Course Details'} size="lg">
        {course && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Subject:</span> <span className="text-slate-200">{getSubject(course.subjectId)?.name}</span></div>
              <div><span className="text-slate-500">Batch:</span> <span className="text-slate-200">{getBatch(course.targetBatchId)?.name}</span></div>
              <div><span className="text-slate-500">Difficulty:</span> <Badge variant="purple">{course.difficulty}</Badge></div>
              <div><span className="text-slate-500">Status:</span> <Badge variant={statusVariant(course.status) as any}>{course.status}</Badge></div>
            </div>
            <div><p className="text-sm text-slate-400 mb-1">Description</p><p className="text-sm text-slate-300">{course.description}</p></div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Learning Objectives</p>
              <ul className="list-disc list-inside space-y-1">{course.learningObjectives.map((obj, i) => <li key={i} className="text-sm text-slate-300">{obj}</li>)}</ul>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">Chapters & Lessons</p>
              {course.chapters.map(ch => (
                <div key={ch.id} className="mb-3 pl-3 border-l-2 border-violet-600/50">
                  <p className="text-sm font-medium text-slate-200">{ch.title}</p>
                  <ul className="mt-1 space-y-0.5">{ch.lessons.map(l => <li key={l.id} className="text-xs text-slate-400 pl-3">• {l.title}</li>)}</ul>
                </div>
              ))}
            </div>
            {course.rejectionReason && <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg"><p className="text-sm text-red-300"><strong>Rejection Reason:</strong> {course.rejectionReason}</p></div>}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Course" size="sm">
        <div className="space-y-4">
          <Textarea label="Rejection Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Explain why this course is rejected..." rows={4} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { if (rejectModal && rejectReason) { dispatch({ type: 'REJECT_COURSE', payload: { id: rejectModal, reason: rejectReason } }); showToast('Course rejected', 'info'); } else { showToast('Please provide a reason', 'error'); } setRejectModal(null); setRejectReason(''); }}>Reject Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ RISK RADAR ============
export function AdminRiskRadar() {
  const { state, getStudentAttendance, getBatch } = useApp();
  const target = state.institute.attendanceTarget;

  const riskStudents = state.students.filter(s => s.active).map(s => {
    const att = getStudentAttendance(s.id);
    const batch = getBatch(s.batchId);
    const needed = att.percentage < target ? Math.ceil((target * att.totalHeld - att.totalAttended) / (1 - target / 100)) : 0;
    return { ...s, attendance: att, batch, classesNeeded: Math.max(0, needed) };
  }).filter(s => s.attendance.percentage < target).sort((a, b) => a.attendance.percentage - b.attendance.percentage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Student Risk Radar</h1>
        <p className="text-sm text-slate-400 mt-1">Students below {target}% attendance target</p>
      </div>

      {riskStudents.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-emerald-400 mb-2"><Check className="w-8 h-8 mx-auto" /></div>
          <p className="text-slate-200 font-medium">All students are above the attendance target!</p>
          <p className="text-sm text-slate-500 mt-1">Great job maintaining attendance.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskStudents.map(s => (
            <Card key={s.id} className="p-5 border-l-4 border-l-red-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.batch?.name}</p>
                </div>
                <Badge variant="danger">{s.attendance.percentage}%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Classes Attended</span>
                  <span className="text-slate-300">{s.attendance.totalAttended} / {s.attendance.totalHeld}</span>
                </div>
                <ProgressBar value={s.attendance.percentage} color="red" size="sm" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Target</span>
                  <span className="text-amber-400">{target}%</span>
                </div>
                {s.classesNeeded > 0 && (
                  <div className="mt-2 p-2 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                    <p className="text-xs text-amber-300">⚠️ Needs <strong>{s.classesNeeded}</strong> consecutive classes to recover to {target}%</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS ============
export function AdminSettings() {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState(state.institute);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    showToast('Settings saved', 'success');
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_DATA' });
    showToast('Demo data has been reset', 'success');
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      <Card className="p-6 max-w-2xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Institute Settings</h3>
        <div className="space-y-4">
          <Input label="Institute Name" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
          <Input label="Attendance Target (%)" type="number" value={settings.attendanceTarget} onChange={e => setSettings({...settings, attendanceTarget: parseInt(e.target.value) || 75})} />
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 max-w-2xl border-red-900/30">
        <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-4">Reset all demo data to initial seed values. This cannot be undone.</p>
        <Button variant="danger" onClick={() => setResetConfirm(true)}>Reset Demo Data</Button>
      </Card>

      <ConfirmDialog isOpen={resetConfirm} onClose={() => setResetConfirm(false)} onConfirm={handleReset} title="Reset All Data" message="This will reset all demo data to initial values. All changes made during this session will be lost." confirmText="Reset Everything" />
    </div>
  );
}
