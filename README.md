<<<<<<< HEAD
# ExamGuard 🛡️
### Real-Time Examination Integrity Monitoring System

A full-featured exam monitoring UI built with **React** and **plain CSS** — no UI libraries, no Tailwind. Designed with a dark mission-control aesthetic for both students taking exams and proctors monitoring them in real time.

---

## 📸 Pages Overview

| Page | Role | Description |
|------|------|-------------|
| Login | Both | Role-based login with animated background |
| Lobby | Student | System checks, exam rules, countdown |
| Exam | Student | MCQ, Code editor, File upload interface |
| Result | Student | Score breakdown and integrity summary |
| Proctor Dashboard | Proctor | Live student monitoring, event log, drawer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/KollipakulaNikhil/FullStack_project.git
cd FullStack_project

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will run at **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `student@exam.com` | `student123` |
| 🛡️ Proctor | `proctor@exam.com` | `proctor123` |

---

## 📁 Project Structure

```
nikhil/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                 # Main router + protected routes
│   ├── AuthContext.jsx         # Login/logout + localStorage auth
│   ├── data.js                 # All mock data (exam, students, events)
│   ├── index.css               # Complete design system (plain CSS)
│   ├── main.jsx                # React entry point
│   │
│   ├── components/
│   │   ├── Header.jsx          # Shared top navigation bar
│   │   └── UI.jsx              # Reusable: Badge, Avatar, ProgressBar, etc.
│   │
│   └── pages/
│       ├── LoginPage.jsx       # Login with animated dot grid
│       ├── LobbyPage.jsx       # Pre-exam lobby + system checks
│       ├── ExamPage.jsx        # Full exam interface
│       ├── ProctorPage.jsx     # Live monitoring dashboard
│       └── ResultPage.jsx      # Post-exam results + integrity report
│
├── index.html
├── vite.config.js
└── package.json
=======
# ExamGuard — MERN Full-Stack Application

ExamGuard is a real-time examination integrity monitoring system built with the **MERN Stack** (MongoDB, Express, React, Node.js). It provides a secure environment for students to take exams (MCQs, coding challenges, formatted file uploads) while proctors can monitor them in real-time.

## Features

### 🎓 Student Flow
- **Lobby**: Pre-exam system checks (Camera, Mic, Fullscreen) and exam rules.
- **Exam Interface**: 
  - Real-time MCQ answering.
  - Built-in Monaco Editor for coding questions with execution simulation.
  - Drag-and-drop file uploads for assignment questions.
  - Strict security monitoring (tab switches, right-click, F12).
- **Results**: Direct post-exam scorecard with performance breakdown and integrity log.

### 🛡️ Proctor Flow
- **Live Dashboard**: Real-time stats on active students, risk scores, and flagged users.
- **Event Log**: Live Socket.io feed of student activities (tab switching, idling, answering).
- **Student Inspector**: Detailed drawer showing individual student's live progress, actual answers, timeline, and risk metrics.
- **Control Actions**: Proctors can explicitly Flag or Terminate a student's session.

---

## 🏗️ Architecture

```text
nikhil/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── api/api.js          # Axios API service layer
│   │   ├── components/         # Reusable UI (Header, Badge, etc.)
│   │   ├── pages/              # Page components
│   │   ├── AuthContext.jsx     # JWT Authentication State
│   │   └── SocketContext.jsx   # Real-time connection State
│
├── server/                     # Express + Node.js Backend
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/             # JWT verification & Multer uploads
│   ├── models/                 # Mongoose Schemas (User, Exam, Submission, Event)
│   ├── routes/                 # REST API endpoints
│   ├── server.js               # Entry point
│   ├── socket.js               # Socket.io event handles
│   └── seed.js                 # Database seeder
>>>>>>> 24870b6 (Updated file)
```

---

<<<<<<< HEAD
## ✨ Features

### 🎓 Student Flow

#### Login Page
- Animated dot-grid background
- Segmented role toggle (Student / Proctor)
- Show/hide password toggle
- Demo credentials panel
- Form validation with error messages

#### Exam Lobby
- Live exam info (name, subject, duration, question count)
- Exam rules checklist
- System requirements check:
  - ✅ Camera access
  - ✅ Microphone access
  - ✅ Fullscreen mode
- Countdown animation (3 → 2 → 1 → GO)
- Start button activates only when all checks pass

#### Exam Interface
- **Question Navigator sidebar** — grid of question numbers with color codes:
  - Blue = answered
  - Yellow = marked for review
  - White border = current
  - Gray = unattempted
- **3 question types across tabs:**
  - **MCQ** — click-to-select options with A/B/C/D labels
  - **Code** — Monaco Editor with language selector and mock code runner
  - **Upload** — drag & drop or browse file upload with file list
- **Security monitoring:**
  - Tab switch detection + counter
  - Right-click blocked with toast notification
  - F12 / Dev tools blocked
- **Low time warning** — timer turns red and glows at 5 minutes
- **Mark for Review** — bookmark any question
- **Submit Modal** — shows answered vs. unanswered count before submitting

#### Result Page
- Score card with pass/fail badge
- Section breakdown bars (MCQ / Code / Upload)
- Integrity summary (tab switches, flags, risk score)
- Activity log of violations
- Duration and submission time

---

### 🛡️ Proctor Flow

#### Proctor Dashboard
- **Live stats bar:**
  - Active students
  - Flagged students
  - Total tab switches
  - Average risk score
- **Exam progress bar** showing elapsed vs. total time
- **Student card grid:**
  - Risk score with colored risk bar
  - Status badge (active / idle / flagged / submitted)
  - Flagged cards glow red
  - Tab switch count and progress
- **Search** — filter students by name or email
- **Event Log sidebar** — real-time event feed with severity filter (All / Critical / Warn / Info)

#### Student Detail Drawer (slides in from right)
- Risk score with quick stats (tabs, IP, progress)
- **Timeline tab** — full activity log with colored severity tags
- **Answers tab** — per-question answer review including:
  - MCQ: selected answer with correct/wrong badge
  - Code: Monaco editor in read-only mode
  - Upload: file name with download button
- **Uploads tab** — list of submitted files
- **Actions:**
  - Flag Student
  - Terminate Session (with confirmation step)

---

## 🎨 Design System

All styling is written in **plain CSS** inside `src/index.css`.

### CSS Variables
```css
--bg-dark, --bg-card, --bg-elevated   /* background layers */
--blue, --green, --red, --yellow       /* accent colors */
--text-primary, --text-secondary, --text-muted
--font-sans: 'Inter'
--font-mono: 'JetBrains Mono'
```

### Reusable Components (UI.jsx)
| Component | Description |
|-----------|-------------|
| `<Badge color="blue">` | Colored pill labels |
| `<StatusDot color="green">` | Status indicator dot |
| `<Avatar name="..." />` | Initials circle |
| `<ProgressBar value max color>` | Animated progress bar |
| `<Spinner />` | Loading spinner |
| `<InfoRow label value />` | Label : Value row |

### CSS Class Patterns
```css
.card          /* dark card with border */
.glass-card    /* glassmorphism card (login) */
.elevated      /* slightly raised surface */
.btn           /* base button */
.btn-primary   /* blue gradient button */
.btn-ghost     /* transparent bordered button */
.btn-danger    /* red button */
.input         /* styled text input */
.badge         /* colored pill */
.segment       /* segmented control wrapper */
.timer         /* exam countdown timer */
.drop-zone     /* file drag & drop area */
.student-card  /* proctor dashboard card */
.drawer        /* sliding panel */
.toast         /* notification banner */
```

### Animations
| Name | Used For |
|------|----------|
| `fadeIn` | Page/card entrance |
| `slideInRight` | Drawer opening |
| `slideInDown` | Toast notifications |
| `countPulse` | Exam countdown number |
| `glowRed` | Low-time timer warning |
| `dotDrift` | Login background dots |
| `pulse` | Live status dot |
| `spin` | Loading spinner |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **React Router DOM v7** | Client-side routing |
| **Monaco Editor** | Code editor in exam interface |
| **Lucide React** | Icon library |
| **Vite** | Build tool and dev server |
| **Plain CSS** | All styling (no Tailwind, no UI libraries) |

---

## 📦 Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.x",
  "@monaco-editor/react": "^4.x",
  "lucide-react": "^0.x"
}
```

---

## 📄 Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login Page | Public |
| `/lobby` | Exam Lobby | Student only |
| `/exam` | Exam Interface | Student only |
| `/result` | Result Page | Student only |
| `/proctor` | Proctor Dashboard | Proctor only |

Unauthorized access redirects to the correct page for the user's role.

---

## 🔐 Auth Flow

1. User selects role (Student / Proctor) on the login page
2. Credentials are checked against mock data in `data.js`
3. On success, user object is stored in `localStorage`
4. `AuthContext` provides `user`, `login()`, `logout()` to all components
5. `ProtectedRoute` in `App.jsx` guards each route by role

---

## 📝 Mock Data

All data lives in `src/data.js`:

- **`USERS`** — student and proctor credentials
- **`EXAM`** — exam info + 15 questions (8 MCQ, 3 Code, 2 Upload)
- **`STUDENTS`** — 10 students with risk scores, tab counts, statuses
- **`EVENTS`** — 12 mock events (CRITICAL / WARN / INFO)
- **`TIMELINE`** — 10 activity timeline events for the drawer
- **`RESULT`** — score, section breakdown, integrity summary

---

## 👨‍💻 Author

**Nikhil Kollipakula**  
GitHub: [@KollipakulaNikhil](https://github.com/KollipakulaNikhil)

---

## 📜 License

This project is for educational purposes. Feel free to use and modify.
=======
## 🚀 How to Run Locally

### Prerequisites
1. **Node.js** v18+
2. **MongoDB** running locally on port `27017`

### Setup Instructions

1. **Install all dependencies** (installs root and client):
   ```bash
   npm run install-all
   ```

2. **Seed the database** (Creates demo users, a test exam, and mock submissions):
   ```bash
   npm run seed
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

The application will start on:
- Frontend: **`http://localhost:5173`**
- Backend API: **`http://localhost:5000`**

### Demo Credentials

Use these to test the application after running the seed script:

**Student**
- Email: `student@exam.com`
- Password: `student123`

**Proctor**
- Email: `proctor@exam.com`
- Password: `proctor123`

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), React Router v7, plain CSS (No UI frameworks used per requirements), Lucide-React, Monaco Editor.
- **Backend**: Node.js, Express, Socket.io, Multer (file uploads).
- **Database**: MongoDB, Mongoose.
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs.
- **Real-time**: Socket.io (WebSocket).
>>>>>>> 24870b6 (Updated file)
