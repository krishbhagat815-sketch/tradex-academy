# TradeX Academy — Online Course Selling & Learning Platform

A commercial, production-ready online course-selling and learning management platform built with React 19, TypeScript, Tailwind CSS, Express, and SQLite.

The platform provides two completely separate, responsive web applications:
1. **Student / User Website** (`http://localhost:5173`)
2. **Admin Dashboard** (`http://localhost:5174`)
3. **Backend API & Database** (`http://localhost:5000`)

---

## 🚀 Opening in VS Code

### Option 1: Open Folder Directly
Open your terminal in this directory and type:
```bash
code .
```

### Option 2: Open Multi-Root Workspace (Recommended)
Double-click `tradex-academy.code-workspace` or in VS Code choose **File -> Open Workspace from File...** and select:
```
tradex-academy.code-workspace
```
This splits the explorer into distinct folders:
* `🚀 Backend API (Express + SQLite)`
* `🎓 Student Website (React + Tailwind)`
* `⚡ Admin Dashboard (React + SaaS UI)`
* `📁 Project Root Config`

---

## 🔑 Login Credentials

| Account | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tradex.com` | `Admin@123` | [http://localhost:5174](http://localhost:5174) |
| **Student** | `student@tradex.com` | `Student@123` | [http://localhost:5173/login](http://localhost:5173/login) |

*(Both portals also include a one-click demo credentials autofill button).*

---

## ⚡ Starting the Project in VS Code

### Method 1: Using VS Code Task
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac).
2. Select **Tasks: Run Task** -> **Start Full Stack (All-in-One)** (or press `Ctrl + Shift + B`).

### Method 2: One-Click Terminal Command
Run in the integrated terminal:
```powershell
npm run dev
```
Or double-click `start-dev.bat` on Windows.

### Method 3: Using VS Code Run & Debug (F5)
Press `F5` in VS Code to launch the debugger with the configured `launch.json`.

---

## 📂 Project Structure

```
First_Project/
├── .vscode/
│   ├── launch.json           # VS Code debug & run configurations
│   ├── tasks.json            # VS Code one-click tasks (npm run dev, build, seed)
│   ├── settings.json         # Workspace formatting, Tailwind & TypeScript settings
│   └── extensions.json       # Recommended VS Code plugins
├── tradex-academy.code-workspace # Multi-root workspace file
├── start-dev.bat             # One-click Windows launch batch file
├── start-dev.ps1             # PowerShell launch script
│
├── backend/                  # Node.js + Express + TypeScript API Server (Port 5000)
│   ├── data/
│   │   └── lms.sqlite        # SQLite persistent database
│   ├── uploads/              # Uploaded course assets, thumbnails, and PDFs
│   └── src/
│       ├── db/               # Database wrapper & schema DDL (16 tables)
│       ├── middleware/       # JWT auth & admin guards
│       ├── routes/           # REST API routes (courses, student, checkout, admin, etc.)
│       ├── seed/             # Seeding script with courses, lessons, and statistics
│       └── server.ts         # Express entry point
│
├── user-frontend/            # Student / User Interface (Port 5173)
│   └── src/
│       ├── components/       # CourseCard, Navbar, Footer, VideoModal, etc.
│       ├── context/          # AuthContext for student session state
│       ├── pages/            # Home, Catalog, Details, Player, Dashboard, Checkout
│       └── services/api.ts   # Client API layer
│
└── admin-frontend/           # Admin Dashboard Interface (Port 5174)
    └── src/
        ├── components/       # AdminLayout, Sidebar, Modals
        ├── context/          # AdminAuthContext for administrator verification
        ├── pages/            # Overview, Courses, Editor, Enrollments, Orders, CMS
        └── services/api.ts   # Admin API client layer
```

---

## 🛠️ Handy Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs backend, student UI, and admin UI concurrently |
| `npm run seed` | Re-seeds database with rich courses, modules, and test orders |
| `npm run build:all` | Type-checks and builds production bundles for both frontends |
| `npm run dev:backend` | Starts only the backend API server |
| `npm run dev:user` | Starts only the student website |
| `npm run dev:admin` | Starts only the admin dashboard |

---

## 🌟 Tested Promotional Codes

During checkout on the Student Website, apply any of these active coupon codes:
* `LAUNCH50`: 50% discount
* `EDTECH20`: 20% discount
* `FLAT30`: $30.00 fixed discount

---

## 🎓 Public Certificate Verification

You can verify graduate certificates using the cryptographic certificate code on either:
* Public URL: `http://localhost:5173/verify-certificate?code=CERT-TRX-2026-78491`
* Search via verification bar: `CERT-TRX-2026-78491`
