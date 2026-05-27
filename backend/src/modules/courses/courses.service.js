const { query, withTransaction } = require('../../config/db');
const { getPagination, buildMeta } = require('../../utils/paginationHelper');

const getAllCourses = async (queryParams) => {
  const { limit, offset, page } = getPagination(queryParams);
  const dept = queryParams.department || null;

  const { rows } = await query(
    `SELECT
       c.*,
       CONCAT(l.first_name, ' ', l.last_name) AS lecturer_name,
       COUNT(e.id) AS enrolled_count
     FROM courses c
     LEFT JOIN lecturers l  ON l.id = c.lecturer_id
     LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'enrolled'
     WHERE ($1::TEXT IS NULL OR c.department = $1)
       AND c.is_active = true
     GROUP BY c.id, l.first_name, l.last_name
     ORDER BY c.course_code
     LIMIT $2 OFFSET $3`,
    [dept, limit, offset]
  );

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM courses WHERE ($1::TEXT IS NULL OR department = $1) AND is_active = true`,
    [dept]
  );

  return { data: rows, meta: buildMeta(parseInt(countRows[0].count), page, limit) };
};

const getCourseById = async (id) => {
  const { rows } = await query(
    `SELECT c.*,
       CONCAT(l.first_name, ' ', l.last_name) AS lecturer_name,
       l.department AS lecturer_department,
       COUNT(e.id) AS enrolled_count
     FROM courses c
     LEFT JOIN lecturers l   ON l.id = c.lecturer_id
     LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, l.first_name, l.last_name, l.department`,
    [id]
  );
  if (!rows[0]) throw Object.assign(new Error('Course not found'), { status: 404 });
  return rows[0];
};

const createCourse = async (data) => {
  const { lecturerId, courseCode, courseName, department, creditHours, semester, academicYear } = data;
  const { rows: [course] } = await query(
    `INSERT INTO courses (lecturer_id, course_code, course_name, department, credit_hours, semester, academic_year)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [lecturerId, courseCode, courseName, department, creditHours, semester, academicYear]
  );
  return course;
};

const updateCourse = async (id, data) => {
  const { lecturerId, courseName, department, creditHours, semester, isActive } = data;
  const { rows: [course] } = await query(
    `UPDATE courses SET
       lecturer_id  = COALESCE($1, lecturer_id),
       course_name  = COALESCE($2, course_name),
       department   = COALESCE($3, department),
       credit_hours = COALESCE($4, credit_hours),
       semester     = COALESCE($5, semester),
       is_active    = COALESCE($6, is_active)
     WHERE id = $7
     RETURNING *`,
    [lecturerId, courseName, department, creditHours, semester, isActive, id]
  );
  if (!course) throw Object.assign(new Error('Course not found'), { status: 404 });
  return course;
};

/**
 * ENROLL STUDENT
 * Adds a student to a course. Checks for available spots
 * and prevents duplicate enrollment (the DB UNIQUE constraint
 * is the final guard, but we check first for a cleaner error message).
 */
const enrollStudent = async (studentId, courseId) => {
  return withTransaction(async (client) => {
    // Check if already enrolled
    const { rows: existing } = await client.query(
      `SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    if (existing.length) {
      throw Object.assign(new Error('Student is already enrolled in this course'), { status: 409 });
    }

    const { rows: [enrollment] } = await client.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *`,
      [studentId, courseId]
    );
    return enrollment;
  });
};

const dropCourse = async (studentId, courseId) => {
  const { rowCount } = await query(
    `UPDATE enrollments SET status = 'dropped'
     WHERE student_id = $1 AND course_id = $2 AND status = 'enrolled'`,
    [studentId, courseId]
  );
  if (!rowCount) throw Object.assign(new Error('Active enrollment not found'), { status: 404 });
  return { message: 'Course dropped successfully' };
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, enrollStudent, dropCourse };