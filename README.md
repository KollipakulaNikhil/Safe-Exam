# 🛡️ ExamGuard
**Real-Time Examination Integrity Monitoring System**

ExamGuard is a full-featured, secure examination platform built with the **MERN Stack** (MongoDB, Express, React, Node.js). It provides a locked-down environment for students to take exams (MCQs, coding challenges, formatted file uploads) while proctors can monitor them in real-time.

---

## ✨ Key Features

### 🎓 Student Flow & Capabilities
*   **Pre-Exam Lobby**: Mandatory system checks for Camera, Microphone, and Fullscreen mode before starting.
*   **Diverse Question Types**:
    *   **MCQ**: Real-time multiple-choice answering.
    *   **Code Platform**: Built-in **Monaco Editor** for coding questions with simulated execution output and syntax highlighting for JS, Python, C++, and Java.
    *   **File Uploads**: Drag-and-drop submission for manual verification or drawing assignments.
*   **Question Navigator**: Colored grid to track answered, unanswered, skipped, and "marked for review" questions.
*   **Live Countdown**: Dynamic exam timer with a critical red-glow warning at 5 minutes remaining.
*   **Instant Result Dashboard**: Post-exam scorecard with automated percentage breakdown and full integrity summary.

### 🕵️‍♂️ Robust Anti-Cheat Security System
ExamGuard employs strict integrity monitoring directly from the frontend:
*   **Browser lockdown**: Mandatory Fullscreen mode. Exiting is logged as a violation.
*   **Tab-Switch Detection**: Tracks whenever the student changes tabs or loses window focus.
*   **Input Blocking**: Prevents Right-Clicking, Copy/Paste (Ctrl+C/V), and Text Selection.
*   **DevTools Monitoring**: Detects F12, Ctrl+Shift+I, and window resizing indicative of opened Developer Tools.
*   **Remote Desktop Detection**: Blocks screen-sharing APIs and detects sudden screen resolution or mouse-teleport jumps.
*   **Extension Blocking**: Detects and logs unknown browser extensions injecting into the DOM.
*   **Auto-Terminate**: Automatically submits the exam when the student exceeds the maximum allowed security warnings (max 3).

### 🛡️ Live Proctor Dashboard
*   **Real-Time Monitoring**: Live stats for active students, total tab switches, and average risk scores via **Socket.io**.
*   **Live Event Log feed**: Streaming feed of all student activities (answering, idling, tab switching, and cheating attempts) categorized by severity (Info, Warn, Critical).
*   **Student Inspector**: A live slide-out drawer detailing an individual student's real-time progress, submitted answers, and timeline history.
*   **Administrative Actions**: Proctors can explicitly **Flag** suspicious students or forcefully **Terminate** an exam session remotely.
*   **Re-Exam Grants**: Ability to reset and grant an exam retake to specific students.

---

## 🏗️ Architecture

```text
nikhil/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── api/api.js          # Base Axios API service layer (handles JWTs)
│   │   ├── components/         # Reusable UI (Header, Badge, Progress Bar, etc.)
│   │   ├── pages/              # Main Page routes
│   │   ├── AuthContext.jsx     # Global JWT Authentication State
│   │   └── SocketContext.jsx   # Global Real-time connection State
│
├── server/                     # Express + Node.js Backend
│   ├── config/db.js            # MongoDB connection logic
│   ├── middleware/             # JWT verification & Multer file uploads
│   ├── models/                 # Mongoose Schemas (User, Exam, Submission, Event)
│   ├── routes/                 # REST API Express endpoints
│   ├── socket.js               # Socket.io live event handles & rooms
│   ├── server.js               # Application Entry point
│   └── seed.js                 # Mock Database initialization script
```

---

## 🎨 Design System

All styling is written entirely in **pure CSS** (`index.css`) — no UI libraries or Tailwind CSS were used. Designed with a dark, premium "mission-control" aesthetic.
*   Custom glassmorphism components
*   Animated background overlays
*   Custom CSS variable token system (`--primary-400`, `--danger`, `--surface-1`)
*   Micro-animations (`fadeUp`, `spin`, `pulse`, etc.)

---

## 🚀 How to Run Locally

### Prerequisites
1.  **Node.js** v18+
2.  **MongoDB** running locally on port `27017`

### Setup Instructions

1.  **Install all dependencies** (installs both root and client):
    ```bash
    npm run install-all
    ```

2.  **Create your Environment Variables**:
    Create a `.env` file in the root `nikhil` folder:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/examguard
    JWT_SECRET=supersecret123
    ```

3.  **Seed the database** (Creates demo users, a complex test exam, and mock submissions):
    ```bash
    npm run seed
    ```

4.  **Start the Full-Stack Application**:
    ```bash
    npm run dev
    ```

The application will start concurrently on:
*   Frontend: **`http://localhost:5173`**
*   Backend API: **`http://localhost:5000`**

---

## 🔑 Demo Credentials

Once the seed script has been successfully run, you can access the system using the following data:

| Role | Email | Password |
|------|-------|----------|
| 🎓 **Student** | `student@exam.com` | `student123` |
| 🛡️ **Proctor** | `proctor@exam.com` | `proctor123` |

*(Additional students were also created in the seed data from emma@uni.edu to sophia@uni.edu with the password `pass123`)*

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite.js), React Router DOM v7, Monaco Editor, Lucide-React Icons.
*   **Backend**: Node.js, Express.js.
*   **Real-time Communication**: Socket.io (WebSockets & Polling).
*   **Database**: MongoDB, Mongoose ORM.
*   **Authentication & Auth**: JSON Web Tokens (JWT), BcryptJS.
*   **File Handling**: Multer.

---

## 👨‍💻 Author

**Nikhil Kollipakula**  
GitHub: [@KollipakulaNikhil](https://github.com/KollipakulaNikhil)

## 📜 License
This project is built for educational purposes. Fully open for modifications and exploration.
