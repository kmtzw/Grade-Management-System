// Grade scale used across the entire system.
// Each entry means: if total_score >= min, assign this letter and GPA points.
// The array is checked top-to-bottom, so the first match wins.
const GRADE_SCALE = [
  { min: 80, letter: 'A',  points: 4.0 },
  { min: 75, letter: 'A-', points: 3.7 },
  { min: 70, letter: 'B+', points: 3.3 },
  { min: 65, letter: 'B',  points: 3.0 },
  { min: 60, letter: 'B-', points: 2.7 },
  { min: 55, letter: 'C+', points: 2.3 },
  { min: 50, letter: 'C',  points: 2.0 },
  { min: 45, letter: 'C-', points: 1.7 },
  { min: 40, letter: 'D',  points: 1.0 },
  { min:  0, letter: 'F',  points: 0.0 },
];

/**
 * Takes the three raw scores and returns the computed total,
 * the letter grade, and the GPA points.
 *
 * Weighting: assignment 30%, midterm 30%, final 40%
 */
const calculateGrade = (assignmentScore, midtermScore, finalScore) => {
  const a = parseFloat(assignmentScore) || 0;
  const m = parseFloat(midtermScore)    || 0;
  const f = parseFloat(finalScore)      || 0;

  const total  = (a * 0.30) + (m * 0.30) + (f * 0.40);
  const grade  = GRADE_SCALE.find(g => total >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];

  return {
    total:  parseFloat(total.toFixed(2)),
    letter: grade.letter,
    points: grade.points
  };
};

/**
 * Calculates the Cumulative GPA for a student.
 * Formula: sum(gpa_points × credit_hours) / sum(credit_hours)
 * This is the standard weighted GPA calculation.
 */
const calculateCGPA = async (studentId, dbQuery) => {
  const { rows } = await dbQuery(
    `SELECT g.gpa_points, c.credit_hours
     FROM grades g
     JOIN enrollments e ON e.id = g.enrollment_id
     JOIN courses c     ON c.id = e.course_id
     WHERE e.student_id = $1
       AND e.status = 'completed'
       AND g.letter_grade != 'F'`,
    [studentId]
  );

  if (!rows.length) return '0.00';

  const totalPoints  = rows.reduce((sum, r) => sum + (r.gpa_points * r.credit_hours), 0);
  const totalCredits = rows.reduce((sum, r) => sum + parseInt(r.credit_hours), 0);

  return (totalPoints / totalCredits).toFixed(2);
};

module.exports = { calculateGrade, calculateCGPA, GRADE_SCALE };