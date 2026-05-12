# KoetaLeaderboard

Welcome to  the **KoetaLeaderboard** repository. This is a full-stack web application built with **Next.js 15** and **Express.js**, designed to manage and evaluate the performance of **Transkoetaradja** bus drivers. The system is operated by **UPTD Transkoetaradja** under the authority of **Dinas Perhubungan Aceh**. It supports a structured multi-role workflow — from field data entry by officers, through administrative validation, to performance rankings visible to drivers themselves.

## 🚀 Tech Stack

This project leverages modern web technologies for a reliable and scalable experience:

### Core Framework
- **[Next.js 15](https://nextjs.org/)**: React framework with App Router and Server Components.
- **[React 19](https://react.dev/)**: The latest version of React for building user interfaces.
- **[TypeScript 5](https://www.typescriptlang.org/)**: Strong typing for better maintainability and developer tooling.
- **[Express.js 5](https://expressjs.com/)**: Fast and minimal Node.js REST API framework.

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.
- **[Chart.js](https://www.chartjs.org/)** & **[react-chartjs-2](https://react-chartjs-2.js.org/)**: Interactive charts and data visualization for analytics dashboards.

### Backend & Database
- **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database for all application data.
- **[Supabase](https://supabase.com/)**: Open source Firebase alternative used for database hosting, file storage (profile photos), and connection pooling.
- **[JWT (JSON Web Tokens)](https://jwt.io/)**: Stateless authentication and role-based authorization.
- **[Multer](https://github.com/expressjs/multer)**: Middleware for handling multipart file uploads.

### Developer Experience
- **[Nodemon](https://nodemon.io/)**: Automatic server restart during backend development.
- **[ESLint](https://eslint.org/)**: Code linting for consistent code quality.
- **[dotenv](https://github.com/motdotla/dotenv)**: Environment variable management.

## 🔋 Key Features

- **Multi-role Access Control**: Four distinct roles — Super Admin, Admin Vendor, Petugas (Field Officer), and Driver — each with strictly scoped permissions.
- **Weighted Scoring System**: Six configurable assessment criteria (Ethics, Discipline, Loyalty, Driving Skill, Vehicle Maintenance, Performance) with percentage weights managed centrally by the Super Admin.
- **Evaluation & Validation Workflow**: Officers submit driver assessments per period; admins review and validate before scores are finalized.
- **Performance Ranking**: Ranked leaderboard per evaluation cycle, accessible across all roles.
- **Fleet & User Management**: Centralized management of armada (vendor fleets), buses, and all user accounts.
- **Driver Self-Service Portal**: Drivers can independently view their own scores, historical performance, rankings, and profile.
- **Profile Photo Upload**: Photo management stored securely via Supabase Storage.
- **Evaluation Cycle Configuration**: Super Admin controls global evaluation cycles and active periods; vendor admins follow the central configuration.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or newer recommended)
- npm
- A [Supabase](https://supabase.com/) project with PostgreSQL enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd my-project
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:

   Create a `.env` file inside `backend/`:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

   Create a `.env.local` file inside `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

### Development

Start the backend server (with auto-reload):
```bash
cd backend
npm run dev
```

In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

To start the production server:
```bash
npm start
```

To start the backend in production:
```bash
cd backend
npm start
```

## 📂 Project Structure

```
my-project/
├── frontend/                    # Next.js 15 application
│   └── src/
│       ├── app/                 # App Router pages and layouts
│       │   ├── (admin)/         # Super admin & vendor admin routes
│       │   ├── (petugas)/       # Field officer routes
│       │   └── (driver)/        # Driver self-service routes
│       ├── components/          # Reusable UI components
│       │   ├── dashboard/       # Role-specific dashboard components
│       │   ├── layout/          # Sidebar, navbar, and page wrappers
│       │   └── pages/           # Full page components per role
│       └── utils/               # API client (apiFetch) and helpers
│
└── backend/                     # Express.js REST API
    ├── config/                  # Database and Supabase client config
    ├── controllers/             # Business logic per resource
    ├── middleware/              # JWT authentication & role authorization
    └── routes/                 # API route definitions
```

## 👥 Roles & Permissions

| Role | Description |
|---|---|
| **Super Admin** | Full system access — manages all vendors, users, evaluation weights (bobot), cycles, and periods |
| **Admin Vendor** | Manages drivers and officers within their assigned fleet; validates submitted assessments |
| **Petugas** | Field officer who submits driver performance evaluations per period |
| **Driver** | Read-only access to own profile, scores, and ranking |

## 🗄️ Database Schema (Key Tables)

| Table | Description |
|---|---|
| `admin` | Super admins and vendor admins |
| `petugas` | Field officers, linked to a fleet |
| `driver` | Bus drivers, linked to a fleet |
| `armada` | Vendor fleets |
| `bus` | Buses, assignable to a driver |
| `siklus_penilaian` | Evaluation cycles (e.g. 2025/2026) |
| `periode` | Monthly periods within a cycle |
| `bobot` | Weighted scoring criteria per cycle |
| `penilaian` | Submitted driver evaluations |
| `penilaian_detail` | Per-criteria scores for each evaluation |

> All schema changes are applied directly via the **Supabase SQL Editor** — no migration files required.

## ☁️ Deployment

- **Frontend**: Optimized for deployment on **[Vercel](https://vercel.com/)**.
- **Backend**: Can be deployed on any Node.js-compatible hosting (Railway, Render, VPS, etc.).
- **Database**: Hosted on **[Supabase](https://supabase.com/)** (PostgreSQL + Storage).

## 📄 License

This project was developed as a final year thesis (*Tugas Akhir*) for **UPTD Transkoetaradja — Dinas Perhubungan Aceh**. All rights reserved.
