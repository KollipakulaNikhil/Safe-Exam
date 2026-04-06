# Project Overview: ExamGuard

The `nikhil` folder contains a frontend React application built with **Vite**. Based on the codebase, the project is a **Real-Time Examination Integrity Monitor** named **ExamGuard**. It provides distinct interfaces for students to take secure exams and for proctors to monitor examination integrity.

## Key Features

1. **Role-Based Authentication**
   - The application supports simulated login for two main roles: **Student** and **Proctor**.
   - It validates demo credentials directly against a mock database and manages session states using React Context and `localStorage`.

2. **Pre-Exam System Checks (Lobby)**
   - Before launching an exam, students are routed to a "Lobby" page.
   - The Lobby performs mandatory system requirement checks, validating **Camera Access**, **Microphone Access**, and enforcing **Fullscreen Mode**.
   - It also outlines exam formats, rules, and durations.

3. **Mock Backend Integration**
   - The application relies on a comprehensive mock data layer (`data.js`) instead of a live API.
   - It simulates a real database with students, complex coding/MCQ questions, real-time events (e.g., "right-click blocked", "tab switch"), and result calculations.

4. **Modern UI/UX Elements**
   - Utilizes `lucide-react` for iconography.
   - Includes custom, reusable UI components like progress bars, status dots, badges, and avatars for a polished and responsive layout.

---

## Folder & Component Roles

### The `src/` Directory
This directory holds the core application source code.

* **`src/assets/`**
  * **Role**: Stores static files like images and SVG logos (e.g., `react.svg`, `hero.png`) that are imported directly into React components.

* **`src/components/`**
  * **Role**: Contains reusable UI building blocks utilized across multiple pages to keep the code modular and DRY (Don't Repeat Yourself).
  * **Key Files**: 
    - `Header.jsx`: The top navigation bar showing the ExamGuard logo, the logged-in user's avatar, their role badge, and a Sign-Out button.
    - `UI.jsx`: A collection of small, reusable UI elements like `Badge`, `StatusDot`, `Spinner`, `ProgressBar`, and `Avatar`.

* **`src/pages/`**
  * **Role**: Contains the full-page React components that represent distinct views or routes in the application.
  * **Key Files**:
    - `LoginPage.jsx`: The initial entry point. Provides an animated, glassmorphism-styled login form where users toggle between Student or Proctor roles to authenticate.
    - `LobbyPage.jsx`: The waiting room for students. It displays exam rules and strictly performs simulated hardware/system validation before allowing the student to begin.

* **`src/data.js`**
  * **Role**: Acts as the localized mock database. It maps out users, exam questions (MCQs, coding challenges, document uploads), student behaviors/risks, real-time timeline events (like tab switching notifications), and final exam results.

* **`src/AuthContext.jsx`**
  * **Role**: The global state container for Application Authentication. It exposes the `useAuth()` hook, which allows any component in the application to access the current logged-in user, check loading states, perform logins, and handle logouts.

* **`src/App.jsx` & `src/main.jsx`**
  * **Role**: 
    - `main.jsx` is the React mount point that binds the app to the `index.html` document.
    - `App.jsx` acts as the root layout component and entry point.

* **`src/index.css` & `src/App.css`**
  * **Role**: Controls the global styling, CSS variables, utility classes, and layout rules for the whole application.

### Configuration Files (Root Directory)
* **`package.json`**: Lists the project's dependencies (such as `@monaco-editor/react` for code editing, `lucide-react` for icons, `react-router-dom` for navigation) and run scripts.
* **`vite.config.js`**: Details settings for the Vite build system, handling fast refresh plugins and local dev server setup.
* **`eslint.config.js`**: Contains the rules for linting the code to maintain formatting and syntax quality.
