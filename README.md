# GradeMS — University Grade Management System

![GradeMS Banner](https://img.shields.io/badge/GradeMS-University%20Grade%20Management-2563eb?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A full-stack university grade management system built with React, Node.js, Express and PostgreSQL. The system supports three user roles — Admin, Lecturer and Student — each with their own dashboard, permissions and workflows.

**Live Demo:** [https://grade-management-system-frontend.onrender.com](https://grade-management-system-frontend.onrender.com)

> **Note:** The app is hosted on Render's free tier. The first load after a period of inactivity may take 30–60 seconds while the server wakes up. This is normal behaviour for free-tier deployments.

---

## Demo Accounts

Use these credentials to explore the system without registering:

| Role     | Email                          | Password     |
|----------|--------------------------------|--------------|
| Admin    | admin@university.ac.zw         | Password123  |
| Lecturer | lecturer@university.ac.zw      | Password123  |
| Student  | student@university.ac.zw       | Password123  |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role Permissions](#role-permissions)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Admin
- Register and manage student and lecturer accounts
- Create, assign and deactivate courses
- Enroll students into courses
- View institution-wide analytics and reports
- Access department performance comparisons
- View top performing students across all departments

### Lecturer
- View all enrolled students per course
- Enter and update grades with live preview
- Bulk submit grades for an entire class at once
- View per-course performance reports and analytics
- Assign and update student scores across three components

### Student
- Self-enroll in available courses
- View personal academic transcript grouped by semester
- Track CGPA in real time
- View course information and details

### System-wide
- JWT-based authentication with role-based access control
- Automatic grade and GPA calculation using a weighted formula
- Paginated and searchable data tables throughout
- Responsive design that works on desktop and mobile
- Dark mode support

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Recharts | Charts and data visualisation |
| CSS Variables | Theming and dark mode |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 20 | Runtime |
| Express 4 | Web framework |
| PostgreSQL 15 | Relational database |
| node-postgres (pg) | Database client |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| express-validator | Request validation |
| helmet | HTTP security headers |
| cors | Cross-origin resource sharing |
| morgan | Request logging |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Render | Cloud hosting (backend + frontend + database) |
| GitHub | Version control and CI/CD trigger |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│         React SPA (Render Static Site)              │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS API calls (/api/*)
                      ▼
┌─────────────────────────────────────────────────────┐
│              Node.js + Express API                  │
│              (Render Web Service)                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Auth   │  │  Grades  │  │    Reports       │  │
│  │  Module  │  │  Module  │  │    Module        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Students │  │ Courses  │  │   Lecturers      │  │
│  │  Module  │  │  Module  │  │   Module         │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ SQL over SSL
                      ▼
┌─────────────────────────────────────────────────────┐
│           PostgreSQL 15                             │
│        (Render Managed Database)                    │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

```
users
├── id (UUID, PK)
├── email (UNIQUE)
├── password_hash
├── role (admin | lecturer | student)
└── is_active

students                        lecturers
├── id (UUID, PK)               ├── id (UUID, PK)
├── user_id (FK → users)        ├── user_id (FK → users)
├── student_number (UNIQUE)     ├── staff_number (UNIQUE)
├── first_name                  ├── first_name
├── last_name                   ├── last_name
├── department                  └── department
├── year_of_study
└── status

courses
├── id (UUID, PK)
├── lecturer_id (FK → lecturers)
├── course_code (UNIQUE)
├── course_name
├── department
├── credit_hours
├── semester
└── academic_year

enrollments
├── id (UUID, PK)
├── student_id (FK → students)
├── course_id (FK → courses)
└── status (enrolled | completed | dropped)

grades
├── id (UUID, PK)
├── enrollment_id (FK → enrollments, UNIQUE)
├── graded_by (FK → users)
├── assignment_score (30% weight)
├── midterm_score (30% weight)
├── final_score (40% weight)
├── total_score (GENERATED COLUMN)
├── letter_grade
└── gpa_points
```

### Grade Scale

| Score Range | Letter Grade | GPA Points |
|------------|--------------|------------|
| 80 – 100   | A            | 4.0        |
| 75 – 79    | A-           | 3.7        |
| 70 – 74    | B+           | 3.3        |
| 65 – 69    | B            | 3.0        |
| 60 – 64    | B-           | 2.7        |
| 55 – 59    | C+           | 2.3        |
| 50 – 54    | C            | 2.0        |
| 45 – 49    | C-           | 1.7        |
| 40 – 44    | D            | 1.0        |
| 0 – 39     | F            | 0.0        |

**Total Score Formula:** `(Assignment × 0.30) + (Midterm × 0.30) + (Final × 0.40)`

---

## Project Structure

```
grade-management-system/
│
├── backend/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Database schema
│   ├── seeds/
│   │   └── test_data.sql              # Sample data for testing
│   ├── scripts/
│   │   ├── generateHash.js            # Utility: generate bcrypt hash
│   │   └── verifyLogin.js             # Utility: verify DB credentials
│   └── src/
│       ├── app.js                     # Express app entry point
│       ├── config/
│       │   ├── db.js                  # PostgreSQL connection pool
│       │   └── migrate.js             # Auto-migration on startup
│       ├── middleware/
│       │   ├── auth.js                # JWT verification
│       │   ├── authorize.js           # Role-based access control
│       │   └── errorHandler.js        # Global error handler
│       ├── modules/
│       │   ├── auth/                  # Login, register, change password
│       │   ├── students/              # Student CRUD
│       │   ├── lecturers/             # Lecturer CRUD
│       │   ├── courses/               # Course CRUD + enrollment
│       │   ├── grades/                # Grade submission + transcripts
│       │   └── reports/               # Analytics and statistics
│       └── utils/
│           ├── gradeCalculator.js     # Grade + GPA calculation logic
│           └── paginationHelper.js    # Pagination utilities
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── client.js              # Axios instance with interceptors
│       │   └── endpoints.js           # All API call functions
│       ├── context/
│       │   └── AuthContext.jsx        # Global auth state
│       ├── components/
│       │   └── ui/
│       │       └── ProtectedRoute.jsx # Route guard component
│       ├── pages/
│       │   ├── Auth/                  # Login page
│       │   ├── Dashboard/             # Admin dashboard
│       │   ├── Students/              # Student list, detail, create, edit
│       │   ├── Lecturers/             # Lecturer list, create
│       │   ├── Courses/               # Course list, detail, create, enroll
│       │   ├── Grades/                # Grade entry, transcript
│       │   └── Reports/               # Reports dashboard, department, lecturer
│       ├── utils/
│       │   └── gradeCalculator.js     # Client-side grade preview
│       ├── App.jsx                    # Router + sidebar + app shell
│       └── index.css                  # All styles and design tokens
│
├── .env.example                       # Environment variable template
├── render.yaml                        # Render deployment configuration
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have these installed on your machine:

- [Node.js](https://nodejs.org) v20 or higher
- [PostgreSQL](https://www.postgresql.org/download) v15 or higher
- [Git](https://git-scm.com/download/win)

Verify your installations:

```bash
node --version    # should show v20.x.x or higher
psql --version    # should show psql 15.x
git --version     # should show git version 2.x
```

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/kmtzw/Grade-Management-System.git
cd Grade-Management-System
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

---

### Database Setup

**1. Create the database and user**

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Then run:

```sql
CREATE DATABASE gradedb;
CREATE USER gradeuser WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE gradedb TO gradeuser;
\q
```

**2. Run the schema migration**

```bash
# From the project root
psql -U postgres -d gradedb -f backend/migrations/001_initial_schema.sql
```

**3. Generate a password hash for test accounts**

```bash
cd backend
node scripts/generateHash.js
```

Copy the generated hash. Open `backend/seeds/test_data.sql` and replace all three `PASTE_YOUR_HASH_HERE` placeholders with it.

**4. Seed the database with test data**

```bash
psql -U postgres -d gradedb -f backend/seeds/test_data.sql
```

---

### Running the App

**1. Configure environment variables**

Create `backend/.env` by copying the example:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gradedb
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=a_long_random_string_minimum_32_characters
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**2. Start the backend**

```bash
# In terminal 1 — from the backend folder
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

**3. Start the frontend**

```bash
# In terminal 2 — from the frontend folder
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**4. Open the app**

Navigate to [http://localhost:5173](http://localhost:5173) in your browser and log in using the test credentials:

| Role     | Email                      | Password     |
|----------|----------------------------|--------------|
| Admin    | admin@university.ac.zw     | Password123  |
| Lecturer | lecturer@university.ac.zw  | Password123  |
| Student  | student@university.ac.zw   | Password123  |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                              | Example                          |
|---------------|------------------------------------------|----------------------------------|
| `DB_HOST`     | PostgreSQL host                          | `localhost`                      |
| `DB_PORT`     | PostgreSQL port                          | `5432`                           |
| `DB_NAME`     | Database name                            | `gradedb`                        |
| `DB_USER`     | Database user                            | `postgres`                       |
| `DB_PASSWORD` | Database password                        | `your_password`                  |
| `JWT_SECRET`  | Secret key for signing JWT tokens        | `at_least_32_random_characters`  |
| `PORT`        | Port the Express server listens on       | `5000`                           |
| `FRONTEND_URL`| Frontend origin allowed by CORS          | `http://localhost:5173`          |
| `NODE_ENV`    | Environment (development or production)  | `development`                    |

### Frontend (`frontend/.env`)

| Variable        | Description                        | Example                                |
|----------------|------------------------------------|----------------------------------------|
| `VITE_API_URL` | Base URL for all API calls         | `http://localhost:5000/api`            |

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint                  | Access  | Description                    |
|--------|--------------------------|---------|--------------------------------|
| POST   | `/auth/login`            | Public  | Log in and receive a JWT token |
| POST   | `/auth/register`         | Public  | Register a new user account    |
| GET    | `/auth/me`               | Any     | Get the current user's profile |
| PUT    | `/auth/change-password`  | Any     | Change the current password    |

### Students

| Method | Endpoint          | Access           | Description                  |
|--------|------------------|------------------|------------------------------|
| GET    | `/students`       | All              | List all students (paginated)|
| GET    | `/students/:id`   | All              | Get a single student profile |
| PUT    | `/students/:id`   | Admin            | Update student details       |
| DELETE | `/students/:id`   | Admin            | Delete a student account     |

### Lecturers

| Method | Endpoint           | Access  | Description                   |
|--------|--------------------|---------|-------------------------------|
| GET    | `/lecturers`        | All     | List all lecturers (paginated)|
| GET    | `/lecturers/:id`    | All     | Get a single lecturer profile |
| PUT    | `/lecturers/:id`    | Admin   | Update lecturer details       |
| DELETE | `/lecturers/:id`    | Admin   | Delete a lecturer account     |

### Courses

| Method | Endpoint                 | Access              | Description                  |
|--------|--------------------------|---------------------|------------------------------|
| GET    | `/courses`               | All                 | List all courses (paginated) |
| GET    | `/courses/:id`           | All                 | Get a single course          |
| POST   | `/courses`               | Admin               | Create a new course          |
| PUT    | `/courses/:id`           | Admin               | Update a course              |
| POST   | `/courses/:id/enroll`    | Admin, Lecturer, Student | Enroll a student       |
| POST   | `/courses/:id/drop`      | Admin, Lecturer     | Drop a student from course   |

### Grades

| Method | Endpoint                        | Access           | Description                    |
|--------|---------------------------------|------------------|--------------------------------|
| POST   | `/grades`                       | Admin, Lecturer  | Submit or update a grade       |
| POST   | `/grades/bulk`                  | Admin, Lecturer  | Bulk submit grades for a class |
| GET    | `/grades/course/:courseId`      | Admin, Lecturer  | Get all grades for a course    |
| GET    | `/grades/student/:studentId`    | All              | Get a student's transcript     |

### Reports

| Method | Endpoint                          | Access  | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| GET    | `/reports/stats`                  | Admin   | Institution-wide statistics        |
| GET    | `/reports/distribution`           | Admin, Lecturer | Grade distribution breakdown |
| GET    | `/reports/departments`            | Admin   | Per-department performance         |
| GET    | `/reports/top-students`           | Admin   | Top performing students            |
| GET    | `/reports/lecturer/:lecturerId`   | Admin, Lecturer | Lecturer course report       |

### Health Check

| Method | Endpoint     | Access | Description            |
|--------|-------------|--------|------------------------|
| GET    | `/health`   | Public | Server status check    |

---

## Role Permissions

| Feature                     | Admin | Lecturer | Student |
|-----------------------------|-------|----------|---------|
| Register students           | ✅    | ❌       | ❌      |
| Register lecturers          | ✅    | ❌       | ❌      |
| Edit/delete accounts        | ✅    | ❌       | ❌      |
| Create courses              | ✅    | ❌       | ❌      |
| Assign lecturers to courses | ✅    | ❌       | ❌      |
| Enroll students in courses  | ✅    | ✅       | ❌      |
| Self-enroll in courses      | ❌    | ❌       | ✅      |
| Submit grades               | ✅    | ✅       | ❌      |
| View grade lists            | ✅    | ✅       | ❌      |
| View own transcript         | ❌    | ❌       | ✅      |
| View any transcript         | ✅    | ✅       | ❌      |
| View institution reports    | ✅    | ❌       | ❌      |
| View own course reports     | ✅    | ✅       | ❌      |

---

## Deployment

This project is deployed on [Render](https://render.com) using three services:

| Service        | Type          | Plan  |
|---------------|---------------|-------|
| Database       | PostgreSQL    | Free  |
| Backend API    | Web Service   | Free  |
| Frontend       | Static Site   | Free  |

### Deploy Your Own Instance

**1. Fork this repository** on GitHub.

**2. Create a Render account** at [render.com](https://render.com) and connect your GitHub account.

**3. Create a PostgreSQL database** on Render:
- Name: `grade-management-db`
- Plan: Free

**4. Create a Web Service** for the backend:
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add all environment variables from the table above
- Set `DATABASE_URL` from the Render database internal connection string

**5. Create a Static Site** for the frontend:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Add `VITE_API_URL` pointing to your backend URL + `/api`
- Add a rewrite rule: `/* → /index.html`

**6. Seed the production database** by calling the `/api/auth/register` endpoint three times for admin, lecturer and student accounts.

For a detailed step-by-step deployment walkthrough see the [deployment guide](docs/DEPLOYMENT.md).

---

## Known Limitations

These are known constraints due to the free-tier hosting used for this portfolio project:

- **Cold starts** — Free services on Render spin down after 15 minutes of inactivity. The first request after a period of no traffic can take 30–60 seconds.
- **Database expiry** — Render's free PostgreSQL databases expire after 90 days. The database will need to be recreated and re-seeded after that period.
- **No email notifications** — Password reset and grade notification emails are not implemented.
- **No file uploads** — Profile pictures and document attachments are not supported.
- **Single institution** — The system is designed for one university. Multi-tenant support is not included.

---

## Contributing

Contributions, bug reports and feature suggestions are welcome.

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request against the `main` branch

### Commit Message Convention

This project uses conventional commits:

| Prefix    | When to use                              |
|-----------|------------------------------------------|
| `feat:`   | A new feature                            |
| `fix:`    | A bug fix                                |
| `chore:`  | Maintenance, config, dependency updates  |
| `docs:`   | Documentation changes only               |
| `style:`  | Formatting, no logic changes             |
| `refactor:` | Code restructuring without new features|

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgements

Built as a portfolio project to demonstrate full-stack development with React, Node.js, Express and PostgreSQL including authentication, role-based access control, relational database design and cloud deployment.
