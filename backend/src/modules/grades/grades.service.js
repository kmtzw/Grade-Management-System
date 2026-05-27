const { query, withTransaction } = require('../../config/db');
const { calculateGrade, calculateCGPA } = require('../../utils/gradeCalculator');

/**
 * SUBMIT / UPDATE GRADE
 * Uses INSERT ... ON CONFLICT to handle both first-time grading
 * and re-grading in a single query. If a grade already exists
 * for this enrollment, it gets updated instead of creating a duplicate.
 */
const submitGrade = async ({ enrollmentId, assignmentScore, midtermScore, finalScore, remarks, gradedBy }) => {
  const { total, letter, points } = calculateGrade(assignmentScore, midtermScore, finalScore);

  return withTransaction(async (client) => {
    // Verify the enrollment exists before trying to grade it
    const { rows: enrollment } = await client.query(
      `SELECT e.id, e.status, e.student_id, c.course_name
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1`,
      [enrollmentId]
    );
    if (!enrollment[0]) {
      throw Object.assign(new Error('Enrollment not found'), { status: 404 });
    }

    const { rows: [grade] } = await client.query(
      `INSERT INTO grades
         (enrollment_id, graded_by, assignment_score, midterm_score, final_score, letter_grade, gpa_points, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (enrollment_id) DO UPDATE SET
         graded_by        = EXCLUDED.graded_by,
         assignment_score = EXCLUDED.assignment_score,
         midterm_score    = EXCLUDED.midterm_score,
         final_score      = EXCLUDED.final_score,
         letter_grade     = EXCLUDED.letter_grade,
         gpa_points       = EXCLUDED.gpa_points,
         remarks          = EXCLUDED.remarks,
         updated_at       = NOW()
       RETURNING *`,
      [enrollmentId, gradedBy, assignmentScore, midtermScore, finalScore, letter, points, remarks]
    );

    // Mark the enrollment as completed once graded
    await client.query(
      `UPDATE enrollments SET status = 'completed' WHERE id = $1`,
      [enrollmentId]
    );

    return { ...grade, computed_total: total, letter_grade: letter };
  });
};

/**
 * STUDENT TRANSCRIPT
 * All grades for a student, organized by year and semester.
 */
const getStudentTranscript = async (studentId) => {
  const { rows } = await query(
    `SELECT
       c.course_code, c.course_name, c.credit_hours,
       c.semester, c.academic_year,
       g.assignment_score, g.midterm_score, g.final_score,
       g.total_score, g.letter_grade, g.gpa_points, g.remarks,
       CONCAT(l.first_name, ' ', l.last_name) AS lecturer_name,
       e.status AS enrollment_status
     FROM enrollments e
     JOIN courses  c ON c.id = e.course_id
     JOIN lecturers l ON l.id = c.lecturer_id
     LEFT JOIN grades g ON g.enrollment_id = e.id
     WHERE e.student_id = $1
     ORDER BY c.academic_year DESC, c.semester, c.course_code`,
    [studentId]
  );

  const cgpa = await calculateCGPA(studentId, query);

  return { transcript: rows, cgpa };
};

/**
 * COURSE GRADE LIST
 * All students in a course with their grades (or null if not yet graded).
 */
const getCourseGrades = async (courseId) => {
  const { rows } = await query(
    `SELECT
       s.id AS student_id, s.student_number,
       s.first_name, s.last_name,
       e.id AS enrollment_id, e.status AS enrollment_status,
       g.assignment_score, g.midterm_score, g.final_score,
       g.total_score, g.letter_grade, g.gpa_points, g.remarks,
       g.updated_at AS graded_at
     FROM enrollments e
     JOIN students s ON s.id = e.student_id
     LEFT JOIN grades g ON g.enrollment_id = e.id
     WHERE e.course_id = $1
       AND e.status != 'dropped'
     ORDER BY s.last_name, s.first_name`,
    [courseId]
  );
  return rows;
};

/**
 * BULK GRADE SUBMISSION
 * Allows a lecturer to submit grades for all students in a course at once.
 * All inserts/updates happen in a single transaction.
 */
const bulkSubmitGrades = async (gradesArray, gradedBy) => {
  return withTransaction(async (client) => {
    const results = [];
    for (const gradeData of gradesArray) {
      const { total, letter, points } = calculateGrade(
        gradeData.assignmentScore,
        gradeData.midtermScore,
        gradeData.finalScore
      );

      const { rows: [grade] } = await client.query(
        `INSERT INTO grades
           (enrollment_id, graded_by, assignment_score, midterm_score, final_score, letter_grade, gpa_points, remarks)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (enrollment_id) DO UPDATE SET
           assignment_score = EXCLUDED.assignment_score,
           midterm_score    = EXCLUDED.midterm_score,
           final_score      = EXCLUDED.final_score,
           letter_grade     = EXCLUDED.letter_grade,
           gpa_points       = EXCLUDED.gpa_points,
           remarks          = EXCLUDED.remarks,
           updated_at       = NOW()
         RETURNING *`,
        [gradeData.enrollmentId, gradedBy, gradeData.assignmentScore,
         gradeData.midtermScore, gradeData.finalScore, letter, points, gradeData.remarks || null]
      );

      await client.query(
        `UPDATE enrollments SET status = 'completed' WHERE id = $1`,
        [gradeData.enrollmentId]
      );

      results.push({ ...grade, letter_grade: letter });
    }
    return { submitted: results.length, grades: results };
  });
};

module.exports = { submitGrade, getStudentTranscript, getCourseGrades, bulkSubmitGrades };