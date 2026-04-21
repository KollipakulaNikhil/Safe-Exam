<div align="center">

# 🛡️ ExamGuard

### **Real-Time Examination Integrity Monitoring System**

*The most complete open-source exam proctoring platform built with the MERN stack*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io)](https://socket.io)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://safe-exam-guard.vercel.app)

**[🌐 Live Demo](https://safe-exam-guard.vercel.app)** · **[📖 Documentation](#-how-to-run-locally)** · **[🐛 Report Bug](https://github.com/KollipakulaNikhil/Safe-Exam/issues)**

</div>

---

## 🤔 Why ExamGuard?

> Traditional online exams have a massive problem — **cheating is easy**. Tab-switching, copy-pasting answers, opening DevTools, using remote desktop tools, or injecting browser extensions can all go completely undetected in most platforms.

**ExamGuard was built to solve this.** It is an end-to-end examination platform that locks down the browser, actively monitors student behavior, streams violations to a proctor in real-time, and even auto-submits if a student pushes their luck too far.

| Problem | Our Solution |
|---|---|
| Students switch tabs to search answers | Real-time tab-switch detection + violation logging |
| Copy-pasting from external sources | Clipboard operations (Ctrl+C/V) fully blocked |
| Opening DevTools for cheating | F12 + Ctrl+Shift+I + window-size detection |
| Screen sharing or remote control | `getDisplayMedia` API blocked + mouse-jump detection |
| Extensions injecting AI assistants | DOM mutation observer for suspicious extension nodes |
| Proctors can't monitor many students at once | Live Socket.io dashboard with risk scores + event feed |

**One platform. Full control. Zero compromise on integrity.**

---

## ✨ Feature Overview

### 🎓 Student Experience

<details>
<summary><strong>📋 Pre-Exam Lobby</strong></summary>

- Displays exam details: name, subject, duration, total questions
- Exam Rules checklist clearly laid out
- **Mandatory System Checks** before entering:
  - ✅ Camera Access (via `getUserMedia`)
  - ✅ Microphone Access
  - ✅ Fullscreen Mode availability
- Interactive 3-2-1 countdown animation before launch
- Start button is locked until **all checks pass**

</details>

<details>
<summary><strong>📝 Exam Interface</strong></summary>

- **Question Navigator Sidebar** — color-coded grid:
  - 🔵 Blue = Answered
  - 🟡 Yellow = Marked for Review
  - ⬜ White border = Currently Viewing
  - ⬛ Gray = Unattempted
- **3 Question Types:**
  - **MCQ** — Click-to-select A/B/C/D options with instant highlighting
  - **Code Editor** — Full Monaco Editor (same as VS Code) with:
    - Language selector: JavaScript, Python, C++, Java
    - Simulated code execution with output panel
    - Auto-save on change
  - **File Upload** — Drag-and-drop or browse to upload files
- **Mark for Review** — Bookmark questions to revisit
- **Live Timer** — Counts down with a flashing red-glow at 5 minutes remaining
- **Submit Modal** — Shows answered vs. unanswered count before final submit

</details>

<details>
<summary><strong>📊 Results Page</strong></summary>

- Score card with dynamic pass/fail badge
- Animated section breakdown bars:
  - MCQ section percentage
  - Code section percentage
  - Upload section status
- Integrity Summary panel:
  - Total tab switches
  - Total flags raised
  - Overall risk score
- Full Activity Log of every recorded violation
- Duration taken and exact submission timestamp

</details>

---

### 🛡️ Anti-Cheat Security System

> ExamGuard runs **10 independent security monitors** throughout the exam. Every violation is timestamped, logged, and streamed live to the proctor panel.

| # | Security Feature | Method |
|---|---|---|
| 1 | **Fullscreen Enforcement** | Forced on start; exit triggers violation + overlay |
| 2 | **Tab-Switch Detection** | `document.visibilitychange` listener + counter |
| 3 | **Right-Click Block** | `contextmenu` event prevented with toast warning |
| 4 | **Copy/Paste Block** | `copy`, `cut`, `paste` events fully suppressed |
| 5 | **Text Selection Block** | `selectstart` disabled (except inside Monaco editor) |
| 6 | **DevTools Detection** | F12 key + `Ctrl+Shift+I/J/C` + `window.outerHeight` delta |
| 7 | **Print Block** | `beforeprint` event + `@media print { display: none }` CSS |
| 8 | **Drag-and-Drop Block** | `dragstart` blocked outside upload zones |
| 9 | **Remote Desktop Detection** | Blocks `getDisplayMedia`, monitors screen resolution changes, detects mouse pointer teleporting (400px+ jumps) |
| 10 | **Browser Extension Detection** | `MutationObserver` scanning DOM for Grammarly, Honey, GPT, Copilot, Loom, etc. |

⚠️ **Auto-Terminate Rule:** After **3 security warnings**, the exam is automatically submitted and the event is reported to the proctor.

---

### 👁️ Proctor Dashboard

<details>
<summary><strong>📡 Live Monitoring Hub</strong></summary>

- **4 Stats Cards** at a glance:
  - 🟢 Total Active Students
  - 🔴 Flagged Students Count
  - ⚠️ Total Tab Switches
  - 📈 Average Risk Score
- Exam Progress Bar (elapsed vs. total exam duration)
- **Student Cards Grid** with:
  - Colored risk score bar (green → yellow → red)
  - Status badge: `active`, `idle`, `flagged`, `submitted`
  - Flagged student cards pulse red
  - Tab switch count and completion progress
- **Search Filter** — filter students by name or email instantly

</details>

<details>
<summary><strong>📺 Live Event Log Sidebar</strong></summary>

- Real-time streaming of all student activities via Socket.io
- Color-coded severity levels:
  - 🔴 `CRITICAL` — DevTools opened, paste detected
  - 🟡 `WARN` — Tab switch, fullscreen exit, right-click
  - 🔵 `INFO` — Student joined, exam started
- Severity filter tabs: All / Critical / Warn / Info

</details>

<details>
<summary><strong>🔍 Student Inspector Drawer</strong></summary>

- Slides in from the right with full details on any student:
  - Risk score, IP address, questions answered, tab switches
- **3-tab breakdown:**
  1. **Timeline** — Full activity log with timestamps
  2. **Answers Review** — See every answer the student has submitted:
     - MCQ: selected option with ✅ correct / ❌ wrong badge
     - Code: Monaco editor in read-only mode
     - Uploads: File list with download links
  3. **Files** — Uploaded assignments
- **Admin Actions:**
  - 🚩 Flag Student — Mark as suspicious
  - ⛔ Terminate Session — Forcefully submit and lock the student out
  - 🔄 Grant Re-Exam — Reset submission, allowing retake

</details>

---

## 🏗️ Architecture

```
nikhil/
├── client/                         # ⚛️  React + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js              # Axios base instance + JWT interceptor
│   │   ├── components/
│   │   │   ├── Header.jsx          # Shared top navigation + avatar
│   │   │   └── UI.jsx              # Badge, Avatar, ProgressBar, StatusDot
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Auth form with animated mesh background
│   │   │   ├── LobbyPage.jsx       # Pre-exam checks + exam info
│   │   │   ├── ExamPage.jsx        # Core exam with all 10 security hooks
│   │   │   ├── ResultPage.jsx      # Score + integrity breakdown
│   │   │   └── ProctorPage.jsx     # Live monitoring dashboard
│   │   ├── AuthContext.jsx         # Global JWT auth state (login/logout)
│   │   ├── SocketContext.jsx       # Global Socket.io connection
│   │   ├── App.jsx                 # Router + ProtectedRoute + ErrorBoundary
│   │   ├── index.css               # Complete custom design system
│   │   └── main.jsx                # React entry point
│
├── server/                         # 🟩  Node.js + Express Backend
│   ├── config/
│   │   └── db.js                   # MongoDB (Mongoose) connection
│   ├── middleware/
│   │   └── auth.js                 # JWT verification + role-based access
│   ├── models/
│   │   ├── User.js                 # Student & Proctor schema (bcrypt hashed)
│   │   ├── Exam.js                 # Exam + questions schema
│   │   ├── Submission.js           # Student answers + integrity metrics
│   │   └── Event.js                # Individual violation events
│   ├── routes/
│   │   ├── auth.js                 # POST /login, POST /register, GET /me
│   │   ├── exam.js                 # GET /exam, GET /exam/:id
│   │   ├── submission.js           # Start, save answer, submit, results
│   │   └── proctor.js              # Dashboard, events, flag, terminate
│   ├── socket.js                   # Socket.io rooms + violation streaming
│   ├── server.js                   # Express app entry + CORS + middleware
│   └── seed.js                     # Populates DB with demo data
│
├── api/
│   └── index.js                    # ▲ Vercel serverless entry point
├── vercel.json                     # Vercel deployment config
└── .env                            # Environment variables (not committed)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 19 + Vite | Blazing fast HMR in dev, optimized prod build |
| **Routing** | React Router DOM v7 | Declarative, role-protected routes |
| **Code Editor** | Monaco Editor | Full VS Code editing experience in the browser |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Styling** | Pure CSS (no Tailwind) | Full design control, zero bloat |
| **Backend** | Express.js | Lightweight, flexible REST API |
| **Database** | MongoDB + Mongoose | Flexible schema for exam/submission data |
| **Auth** | JWT + Bcrypt.js | Stateless, secure, industry-standard auth |
| **Real-time** | Socket.io | Bi-directional live violation streaming |
| **File Uploads** | Multer | Multipart form handling for submission files |
| **Deployment** | Vercel | Serverless backend + static frontend, CI/CD |

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)

### Step-by-Step Setup

**1. Clone the repository**
```bash
git clone https://github.com/KollipakulaNikhil/Safe-Exam.git
cd Safe-Exam
```

**2. Install all dependencies**
```bash
npm run install-all
```

**3. Create your `.env` file** in the `nikhil/` root folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/examguard
JWT_SECRET=your_super_secret_key_here
```

**4. Seed the database** with demo users, exam, and mock submissions:
```bash
npm run seed
```

**5. Start the application**
```bash
npm run dev
```

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:5173 |
| 🔌 Backend API | http://localhost:5000/api |
| 💗 Health Check | http://localhost:5000/api/health |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🎓 **Student** | `student@exam.com` | `student123` |
| 🛡️ **Proctor** | `proctor@exam.com` | `proctor123` |

> The seed script also creates **9 additional students** (`emma@uni.edu`, `michael@uni.edu`, etc. with password `pass123`) with varied risk profiles — some flagged, some idle, some with high risk scores — to fully demonstrate the proctor dashboard.

---

## ☁️ Deploying to Vercel

**Vercel Environment Variables** (set in Project → Settings → Environment Variables):

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret string |
| `CLIENT_URL` | Your Vercel deployment URL (for CORS) |

> **MongoDB Atlas:** Remember to add `0.0.0.0/0` to your Atlas → Network Access list so Vercel's serverless IPs can connect.

---

## 📄 API Routes Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user info |
| `GET` | `/api/exam` | ✅ Student | Get active exams |
| `GET` | `/api/exam/:id` | ✅ Student | Get single exam details |
| `POST` | `/api/submission/start/:examId` | ✅ Student | Start exam → creates submission |
| `PUT` | `/api/submission/:id/answer` | ✅ Student | Save a single answer |
| `PUT` | `/api/submission/:id/submit` | ✅ Student | Final exam submission |
| `GET` | `/api/submission/:id/result` | ✅ Student | Get exam results |
| `GET` | `/api/proctor/dashboard/:examId` | ✅ Proctor | Live student overview |
| `GET` | `/api/proctor/events/:examId` | ✅ Proctor | Get violation events |
| `GET` | `/api/proctor/student/:subId` | ✅ Proctor | Get single student data |
| `POST` | `/api/proctor/flag/:subId` | ✅ Proctor | Flag a student |
| `POST` | `/api/proctor/terminate/:subId` | ✅ Proctor | Terminate a student's exam |
| `POST` | `/api/proctor/reexam/:subId` | ✅ Proctor | Grant a re-exam |

---

## 👨‍💻 Author

<div align="center">

**Nikhil Kollipakula**

[![GitHub](https://img.shields.io/badge/GitHub-KollipakulaNikhil-181717?style=for-the-badge&logo=github)](https://github.com/KollipakulaNikhil)

*Built with ❤️ as a full-stack engineering showcase project*

</div>

---

## 📜 License

This project is built for **educational purposes**. It is open for modifications, learning, and showcasing. Feel free to fork and build upon it.

---

<div align="center">

**⭐ If you found this project useful, please consider giving it a star on GitHub!**

</div>
