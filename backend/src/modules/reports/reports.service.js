const { query } = require('../../config/db');

const getInstitutionStats = async () => {
  const { rows: [stats] } = await query(
    `SELECT
       (SELECT COUNT(*) FROM students WHERE status = 'active')      AS total_students,
       (SELECT COUNT(*) FROM lecturers)                              AS total_lecturers,
       (SELECT COUNT(*) FROM courses WHERE is_active = true)        AS active_courses,
       (SELECT COUNT(*) FROM enrollments WHERE status = 'enrolled') AS active_enrollments,
       (SELECT ROUND(AVG(total_score)::NUMERIC, 2) FROM grades)     AS institution_avg,
       (SELECT ROUND(AVG(gpa_points)::NUMERIC, 2) FROM grades)      AS institution_avg_gpa,
       (SELECT COUNT(*) FROM grades WHERE letter_grade = 'F')       AS total_failures,
       (SELECT ROUND(
         (COUNT(*) FILTER (WHERE letter_grade != 'F'))::NUMERIC /
         NULLIF(COUNT(*), 0) * 100, 1
       ) FROM grades) AS pass_rate`
  );
  return stats;
};

const getGradeDistribution = async (courseId) => {
  const params = courseId ? [courseId] : [];
  const whereClause = courseId ? 'WHERE e.course_id = $1' : '';

  const { rows } = await query(
    `SELECT
       letter_grade,
       COUNT(*) AS count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS percentage
     FROM grades g
     JOIN enrollments e ON e.id = g.enrollment_id
     ${whereClause}
     GROUP BY letter_grade
     ORDER BY letter_grade`,
    params
  );
  return rows;
};

const getDepartmentComparison = async () => {
  const { rows } = await query(
    `SELECT
       s.department,
       COUNT(DISTINCT s.id)                             AS student_count,
       ROUND(AVG(g.total_score)::NUMERIC, 2)           AS avg_score,
       ROUND(AVG(g.gpa_points)::NUMERIC, 2)            AS avg_gpa,
       COUNT(*) FILTER (WHERE g.letter_grade = 'F')    AS failures,
       COUNT(*) FILTER (WHERE g.total_score >= 80)     AS distinctions
     FROM students s
     JOIN enrollments e ON e.student_id = s.id
     JOIN grades g      ON g.enrollment_id = e.id
     GROUP BY s.department
     ORDER BY avg_gpa DESC`
  );
  return rows;
};

const getTopStudents = async (limit = 10) => {
  const { rows } = await query(
    `SELECT
       s.student_number, s.first_name, s.last_name, s.department,
       ROUND(AVG(g.gpa_points)::NUMERIC, 2)  AS cgpa,
       COUNT(DISTINCT e.course_id)            AS courses_completed
     FROM students s
     JOIN enrollments e ON e.student_id = s.id AND e.status = 'completed'
     JOIN grades g      ON g.enrollment_id = e.id
     GROUP BY s.id
     HAVING COUNT(DISTINCT e.course_id) >= 2
     ORDER BY cgpa DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

const getLecturerReport = async (lecturerId) => {
  const { rows } = await query(
    `SELECT
       c.course_code, c.course_name, c.semester, c.academic_year,
       COUNT(DISTINCT e.student_id)               AS enrolled_count,
       ROUND(AVG(g.total_score)::NUMERIC, 2)      AS avg_score,
       COUNT(*) FILTER (WHERE g.letter_grade='F') AS failures,
       COUNT(*) FILTER (WHERE g.letter_grade='A' OR g.letter_grade='A-') AS distinctions
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id = c.id
     LEFT JOIN grades g      ON g.enrollment_id = e.id
     WHERE c.lecturer_id = $1
     GROUP BY c.id
     ORDER BY c.academic_year DESC, c.semester`,
    [lecturerId]
  );
  return rows;
};

module.exports = {
  getInstitutionStats, getGradeDistribution,
  getDepartmentComparison, getTopStudents, getLecturerReport
};