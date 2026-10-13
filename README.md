# SmartCoaching OS

A complete, interactive web application for coaching institute management with three integrated panels: **Admin**, **Faculty**, and **Student**.

## 🚀 Quick Start

### Prerequisites
- Node.js LTS (v18 or higher)
- npm (comes with Node.js)

### Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser
# Navigate to http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

## 📋 Features

### Admin Panel
- **Dashboard**: Overview with stats, charts, risk alerts, and activity feed
- **Student Management**: CRUD operations, search, batch filtering, attendance tracking
- **Faculty Management**: Add/edit faculty, assign subjects and batches
- **Batches & Subjects**: Create batches, manage subjects, view assignments
- **Attendance Reports**: Comprehensive attendance tracking with filters
- **Course Approvals**: Review, approve, reject, suspend, or archive courses
- **Risk Radar**: Flag students below attendance target with recovery estimates
- **Settings**: Configure institute settings, reset demo data

### Faculty Panel
- **Dashboard**: Today's classes, batches, pending reviews overview
- **My Classes**: Start/end class sessions with QR code generation
- **QR Attendance**: Interactive workflow with QR codes and manual code fallback
- **Attendance Review**: Approve/reject student attendance submissions
- **Assessments**: Create assessments, enter marks, track submissions
- **Syllabus**: Track topic completion by subject
- **Student Doubts**: View and reply to student questions
- **Course Creator**: Build courses with chapters, lessons, and submit for approval

### Student Panel
- **Dashboard**: Welcome overview with today's schedule, attendance, courses
- **My Attendance**: Subject-wise tracking, submit attendance via session code
- **Recovery Calculator**: Calculate classes needed to reach target attendance
- **Timetable**: Weekly grid and list views
- **My Learning**: Access approved courses, track lesson completion
- **Study Planner**: Task management with priority and "Plan My Day" feature
- **Assignments**: View assessments and scores
- **Ask a Doubt**: Submit questions to faculty
- **Feedback**: Rate subjects and provide feedback

## 🔗 Cross-Panel Interactions

All three panels share the same application state:
- Faculty submits a course → Admin sees it in Pending Approvals
- Admin approves a course → Student sees it in My Learning
- Faculty starts a class with QR → Student submits attendance → Faculty reviews → All reflected
- Student completes tasks → Dashboard updates progress
- Student asks a doubt → Faculty sees it in their panel

## 🎨 Design

- Dark SaaS dashboard theme
- Deep charcoal and navy backgrounds
- Violet and cyan accents
- Responsive design (desktop, tablet, mobile)
- Professional Lucide icons
- Interactive Recharts visualizations
- Toast notifications and modal dialogs

## ⚙️ Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **React Router v6** for navigation
- **Recharts** for data visualization
- **qrcode.react** for QR code generation
- **localStorage** for persistent demo data
- **Lucide React** for icons

## 📦 Data Persistence

All demo data is stored in `localStorage` with versioned keys. Data persists across browser refreshes. Use the "Reset Demo Data" option in Admin Settings to restore initial seed data.

## ⚠️ Prototype Limitations

This is a **frontend-only local prototype**. Important limitations:

1. **Demo Role Switcher** — This is NOT real authentication. It simply changes which panel is displayed. There is no login, password, or session management.

2. **localStorage** — NOT secure storage. Do not use for real student records or sensitive data. Data is stored in plain text in the browser.

3. **Client-side role checks** — Do NOT provide production authorization. All data is accessible to all roles in this prototype.

4. **QR Attendance** — This is a SIMULATED workflow. It cannot reliably prove physical presence. The QR code encodes a local session identifier, not a verified location.

5. **Local Video Preview** — Uses browser object URLs for temporary previews. Videos are NOT permanently uploaded or shared with other users.

6. **No Backend** — All operations happen in the browser. There is no server, database, or API.

7. **No External APIs** — No AI services, no third-party integrations, no API keys required.

This prototype is designed for **demonstration and development purposes only**. It should not be deployed as a production system without significant additional work on security, authentication, authorization, data validation, and backend infrastructure.

## 📁 Project Structure

```
src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles (Tailwind v4)
├── types/
│   └── index.ts              # TypeScript type definitions
├── data/
│   └── seedData.ts           # Initial demo data
├── context/
│   └── AppContext.tsx         # Shared state management
├── components/
│   └── UIComponents.tsx       # Reusable UI components
├── layouts/
│   └── AppLayout.tsx          # App shell with sidebar/header
├── pages/
│   ├── admin/
│   │   └── AdminPages.tsx     # All admin pages
│   ├── faculty/
│   │   └── FacultyPages.tsx   # All faculty pages
│   └── student/
│       └── StudentPages.tsx   # All student pages
```

## 🎯 Demo Data

The prototype includes:
- 1 institute (BrightFuture Academy)
- 1 admin profile
- 3 faculty members
- 12 students across 3 batches
- 5 subjects
- Multiple timetable entries
- Attendance records with varying percentages
- 4 courses with different statuses (approved, pending, rejected, draft)
- Assessments, doubts, study tasks, and feedback

Students include:
- One below 75% attendance (at risk)
- One close to 75% (borderline)
- Several comfortably above 75%

## 📜 License

This is a demonstration project. Use freely for learning and prototyping.
