const { query } = require('../../config/db');
const { getPagination, buildMeta } = require('../../utils/paginationHelper');

/**
 * GET ALL STUDENTS
 * Supports pagination (page, limit) and search by name or student number.
 * The search uses ILIKE for case-insensitive matching.
 */
const getAllStudents = async (queryParams) => {
  const { limit, offset, page } = getPagination(queryParams);
  const search = queryParams.search ? `%${queryParams.search}%` : null;

  const whereClause = search
    ? `WHERE s.first_name ILIKE $3 OR s.last_name ILIKE $3 OR s.student_number ILIKE $3`
    : '';

  // We use two queries: one for the data, one for the total count.
  // COUNT(*) OVER() would also work but is less efficient on large tables.
  const params = search ? [limit, offset, search] : [limit, offset];

  const { rows } = await query(
    `SELECT
       s.id, s.student_number, s.first_name, s.last_name,
       s.department, s.year_of_study, s.status,
       u.email,
       COUNT(e.id) AS enrolled_courses
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'enrolled'
     ${whereClause}
     GROUP BY s.id, u.email
     ORDER BY s.last_name
     LIMIT $1 OFFSET $2`,
    params
  );

  // Separate count query
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM students s
     ${search ? 'WHERE s.first_name ILIKE $1 OR s.last_name ILIKE $1 OR s.student_number ILIKE $1' : ''}`,
    search ? [search] : []
  );

  return {
    data: rows,
    meta: buildMeta(parseInt(countRows[0].count), page, limit)
  };
};

/**
 * GET SINGLE STUDENT
 * Returns full profile + current enrollments.
 */
const getStudentById = async (id) => {
  const { rows } = await query(
    `SELECT
       s.id, s.student_number, s.first_name, s.last_name,
       s.department, s.year_of_study, s.status,
       u.email,
       COALESCE(
         json_agg(
           json_build_object(
             'enrollmentId', e.id,
             'courseCode',   c.course_code,
             'courseName',   c.course_name,
             'creditHours',  c.credit_hours,
             'semester',     c.semester,
             'status',       e.status
           )
         ) FILTER (WHERE e.id IS NOT NULL),
         '[]'
       ) AS enrollments
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN enrollments e ON e.student_id = s.id
     LEFT JOIN courses c     ON c.id = e.course_id
     WHERE s.id = $1
     GROUP BY s.id, u.email`,
    [id]
  );

  if (!rows[0]) throw Object.assign(new Error('Student not found'), { status: 404 });
  return rows[0];
};

/**
 * UPDATE STUDENT
 * Only updates fields that are explicitly sent in the request body.
 */
const updateStudent = async (id, updates) => {
  const { firstName, lastName, department, yearOfStudy, status } = updates;

  const { rows } = await query(
    `UPDATE students
     SET
       first_name    = COALESCE($1, first_name),
       last_name     = COALESCE($2, last_name),
       department    = COALESCE($3, department),
       year_of_study = COALESCE($4, year_of_study),
       status        = COALESCE($5, status)
     WHERE id = $6
     RETURNING *`,
    [firstName, lastName, department, yearOfStudy, status, id]
  );

  if (!rows[0]) throw Object.assign(new Error('Student not found'), { status: 404 });
  return rows[0];
};

/**
 * DELETE STUDENT
 * Because of ON DELETE CASCADE in the schema, deleting a student
 * automatically removes their enrollments and grades too.
 */
const deleteStudent = async (id) => {
  // We delete from users because CASCADE takes care of the students row
  const { rowCount } = await query(
    `DELETE FROM users WHERE id = (SELECT user_id FROM students WHERE id = $1)`,
    [id]
  );
  if (!rowCount) throw Object.assign(new Error('Student not found'), { status: 404 });
  return { message: 'Student deleted successfully' };
};

module.exports = { getAllStudents, getStudentById, updateStudent, deleteStudent };