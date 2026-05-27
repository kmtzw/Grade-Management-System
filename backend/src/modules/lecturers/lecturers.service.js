const { query } = require('../../config/db');
const { getPagination, buildMeta } = require('../../utils/paginationHelper');

const getAllLecturers = async (queryParams) => {
  const { limit, offset, page } = getPagination(queryParams);
  const search = queryParams.search ? `%${queryParams.search}%` : null;

  const whereClause = search
    ? `WHERE l.first_name ILIKE $3 OR l.last_name ILIKE $3 OR l.staff_number ILIKE $3`
    : '';

  const params = search ? [limit, offset, search] : [limit, offset];

  const { rows } = await query(
    `SELECT
       l.id, l.staff_number, l.first_name, l.last_name,
       l.department, u.email,
       COUNT(c.id) AS courses_count
     FROM lecturers l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN courses c ON c.lecturer_id = l.id AND c.is_active = true
     ${whereClause}
     GROUP BY l.id, u.email
     ORDER BY l.last_name
     LIMIT $1 OFFSET $2`,
    params
  );

  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM lecturers l
     ${search ? 'WHERE l.first_name ILIKE $1 OR l.last_name ILIKE $1 OR l.staff_number ILIKE $1' : ''}`,
    search ? [search] : []
  );

  return {
    data: rows,
    meta: buildMeta(parseInt(countRows[0].count), page, limit)
  };
};

const getLecturerById = async (id) => {
  const { rows } = await query(
    `SELECT l.*, u.email,
       json_agg(
         json_build_object(
           'id',          c.id,
           'courseCode',  c.course_code,
           'courseName',  c.course_name,
           'semester',    c.semester,
           'academicYear', c.academic_year
         )
       ) FILTER (WHERE c.id IS NOT NULL) AS courses
     FROM lecturers l
     JOIN users u ON u.id = l.user_id
     LEFT JOIN courses c ON c.lecturer_id = l.id
     WHERE l.id = $1
     GROUP BY l.id, u.email`,
    [id]
  );
  if (!rows[0]) throw Object.assign(new Error('Lecturer not found'), { status: 404 });
  return rows[0];
};

const updateLecturer = async (id, data) => {
  const { firstName, lastName, department } = data;
  const { rows: [lecturer] } = await query(
    `UPDATE lecturers SET
       first_name = COALESCE($1, first_name),
       last_name  = COALESCE($2, last_name),
       department = COALESCE($3, department)
     WHERE id = $4
     RETURNING *`,
    [firstName, lastName, department, id]
  );
  if (!lecturer) throw Object.assign(new Error('Lecturer not found'), { status: 404 });
  return lecturer;
};

const deleteLecturer = async (id) => {
  const { rowCount } = await query(
    `DELETE FROM users WHERE id = (SELECT user_id FROM lecturers WHERE id = $1)`,
    [id]
  );
  if (!rowCount) throw Object.assign(new Error('Lecturer not found'), { status: 404 });
  return { message: 'Lecturer deleted successfully' };
};

module.exports = { getAllLecturers, getLecturerById, updateLecturer, deleteLecturer };