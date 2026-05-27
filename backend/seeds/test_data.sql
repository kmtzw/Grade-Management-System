-- ============================================================
-- TEST SEED DATA
-- Run generateHash.js first to get the correct hash for
-- your machine, then paste it in the three places below.
-- All accounts use the password: Password123
-- ============================================================

-- Clean up any previous seed data so we can re-run safely
DELETE FROM grades      WHERE enrollment_id IN (
  SELECT e.id FROM enrollments e
  JOIN students s ON s.id = e.student_id
  WHERE s.student_number = 'R123456Y'
);
DELETE FROM enrollments WHERE student_id IN (
  SELECT id FROM students WHERE student_number = 'R123456Y'
);
DELETE FROM courses     WHERE course_code = 'CS301';
DELETE FROM lecturers   WHERE staff_number = 'STAFF001';
DELETE FROM students    WHERE student_number = 'R123456Y';
DELETE FROM users       WHERE email IN (
  'admin@university.ac.zw',
  'lecturer@university.ac.zw',
  'student@university.ac.zw'
);

-- ── Admin ──────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@university.ac.zw',
  '$2b$12$djdhgIGvvU.chXqk5gvaj.TgYwwfnj/1p/PI1bkN4RWbYvzDOKcNe',
  'admin'
);

-- ── Lecturer ───────────────────────────────────────────────
INSERT INTO users (email, password_hash, role)
VALUES (
  'lecturer@university.ac.zw',
  '$2b$12$djdhgIGvvU.chXqk5gvaj.TgYwwfnj/1p/PI1bkN4RWbYvzDOKcNe',
  'lecturer'
);

INSERT INTO lecturers (user_id, staff_number, first_name, last_name, department)
SELECT id, 'STAFF001', 'James', 'Moyo', 'Computer Science'
FROM users
WHERE email = 'lecturer@university.ac.zw';

-- ── Student ────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role)
VALUES (
  'student@university.ac.zw',
  '$2b$12$djdhgIGvvU.chXqk5gvaj.TgYwwfnj/1p/PI1bkN4RWbYvzDOKcNe',
  'student'
);

INSERT INTO students (user_id, student_number, first_name, last_name, department, year_of_study)
SELECT id, 'R123456Y', 'Kudzi', 'Chipo', 'Computer Science', 2
FROM users
WHERE email = 'student@university.ac.zw';

-- ── Course ─────────────────────────────────────────────────
INSERT INTO courses (lecturer_id, course_code, course_name, department, credit_hours, semester, academic_year)
SELECT id, 'CS301', 'Data Structures and Algorithms', 'Computer Science', 3, 'first', 2026
FROM lecturers
WHERE staff_number = 'STAFF001';

-- ── Enrollment ─────────────────────────────────────────────
INSERT INTO enrollments (student_id, course_id)
SELECT s.id, c.id
FROM students s, courses c
WHERE s.student_number = 'R123456Y'
  AND c.course_code    = 'CS301';

-- Confirm everything was inserted
SELECT 'users'       AS table_name, COUNT(*) AS rows FROM users       WHERE email LIKE '%university.ac.zw'
UNION ALL
SELECT 'students',     COUNT(*) FROM students   WHERE student_number = 'R123456Y'
UNION ALL
SELECT 'lecturers',    COUNT(*) FROM lecturers  WHERE staff_number   = 'STAFF001'
UNION ALL
SELECT 'courses',      COUNT(*) FROM courses    WHERE course_code    = 'CS301'
UNION ALL
SELECT 'enrollments',  COUNT(*) FROM enrollments;