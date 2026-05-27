-- Enable the UUID extension so PostgreSQL can generate uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- Stores login credentials for all people in the system.
-- The 'role' column controls what each user can see and do.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt hash, never plain text
  role          VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'lecturer', 'student')),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- STUDENTS TABLE
-- Extended profile for users with role = 'student'.
-- Linked to users via user_id foreign key.
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  student_number VARCHAR(20) UNIQUE NOT NULL,
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  department     VARCHAR(100) NOT NULL,
  year_of_study  INT CHECK (year_of_study BETWEEN 1 AND 6),
  status         VARCHAR(20) DEFAULT 'active'
                   CHECK (status IN ('active', 'suspended', 'graduated')),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- LECTURERS TABLE
-- Extended profile for users with role = 'lecturer'.
-- ============================================================
CREATE TABLE IF NOT EXISTS lecturers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  staff_number VARCHAR(20) UNIQUE NOT NULL,
  first_name   VARCHAR(100) NOT NULL,
  last_name    VARCHAR(100) NOT NULL,
  department   VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- COURSES TABLE
-- Each course belongs to a lecturer and has a semester/year.
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lecturer_id   UUID REFERENCES lecturers(id) ON DELETE SET NULL,
  course_code   VARCHAR(20) UNIQUE NOT NULL,
  course_name   VARCHAR(200) NOT NULL,
  department    VARCHAR(100) NOT NULL,
  credit_hours  INT DEFAULT 3,
  semester      VARCHAR(20) CHECK (semester IN ('first', 'second', 'summer')),
  academic_year INT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ENROLLMENTS TABLE
-- Junction table linking students to courses.
-- A student can only enroll in the same course once (UNIQUE constraint).
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  status      VARCHAR(20) DEFAULT 'enrolled'
                CHECK (status IN ('enrolled', 'dropped', 'completed')),
  UNIQUE(student_id, course_id)  -- prevents duplicate enrollments
);

-- ============================================================
-- GRADES TABLE
-- One grade record per enrollment.
-- total_score is computed automatically by the database:
--   30% assignment + 30% midterm + 40% final
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id    UUID UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  graded_by        UUID REFERENCES users(id),
  assignment_score DECIMAL(5,2) DEFAULT 0 CHECK (assignment_score BETWEEN 0 AND 100),
  midterm_score    DECIMAL(5,2) DEFAULT 0 CHECK (midterm_score BETWEEN 0 AND 100),
  final_score      DECIMAL(5,2) DEFAULT 0 CHECK (final_score BETWEEN 0 AND 100),
  -- GENERATED ALWAYS AS means the DB calculates this column automatically
  total_score      DECIMAL(5,2) GENERATED ALWAYS AS (
                     (assignment_score * 0.30) +
                     (midterm_score    * 0.30) +
                     (final_score      * 0.40)
                   ) STORED,
  letter_grade     VARCHAR(2),
  gpa_points       DECIMAL(3,1),
  remarks          TEXT,
  graded_at        TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- Speeds up the most common lookups. Without indexes, PostgreSQL
-- scans every row in the table. With them, it jumps straight to
-- the matching rows.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_user_id    ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_user_id   ON lecturers(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_enrollment   ON grades(enrollment_id);