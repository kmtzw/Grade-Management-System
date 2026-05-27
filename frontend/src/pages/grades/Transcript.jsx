import { useEffect, useState } from 'react';
import { gradesAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLORS = {
  A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444'
};

export default function Transcript({ studentId: propStudentId }) {
  const { user }              = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    // Determine which student id to use:
    // 1. If a prop was passed (admin viewing someone) use that
    // 2. Otherwise use the logged-in student's own profileId from the token
    const studentId = propStudentId ?? user?.profileId;

    if (!studentId) {
      setError(
        'Student profile ID not found. Please log out and log back in. ' +
        'If the problem persists contact an administrator.'
      );
      setLoading(false);
      return;
    }

    gradesAPI.getTranscript(studentId)
      .then(({ data }) => setData(data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load transcript.'))
      .finally(() => setLoading(false));

  }, [propStudentId, user]);

  if (loading) return <p className="loading-text">Loading transcript...</p>;

  if (error) return (
    <div className="page-container">
      <h1>My Transcript</h1>
      <div className="error-message">{error}</div>
    </div>
  );

  if (!data || data.transcript.length === 0) return (
    <div className="page-container">
      <h1>My Transcript</h1>
      <p className="empty-state">
        No grades recorded yet. Grades will appear here once your
        lecturer submits them.
      </p>
    </div>
  );

  // Group rows by academic year and semester
  const byPeriod = data.transcript.reduce((acc, row) => {
    const key = `${row.academic_year} — ${row.semester} semester`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Transcript</h1>
        <div className="cgpa-badge">
          <span>CGPA</span>
          <strong>{data.cgpa}</strong>
          <span>/ 4.0</span>
        </div>
      </div>

      {Object.entries(byPeriod).map(([period, courses]) => (
        <div key={period} className="semester-block">
          <h4 className="semester-heading">{period}</h4>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Credits</th>
                  <th>Assignment</th>
                  <th>Midterm</th>
                  <th>Final</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>GPA Pts</th>
                  <th>Lecturer</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.course_code}>
                    <td><strong>{c.course_code}</strong></td>
                    <td>{c.course_name}</td>
                    <td>{c.credit_hours}</td>
                    <td>{c.assignment_score ?? '—'}</td>
                    <td>{c.midterm_score    ?? '—'}</td>
                    <td>{c.final_score      ?? '—'}</td>
                    <td><strong>{c.total_score ?? '—'}</strong></td>
                    <td>
                      {c.letter_grade && (
                        <span
                          className="grade-pill"
                          style={{
                            background: (GRADE_COLORS[c.letter_grade[0]] ?? '#94a3b8') + '22',
                            color:       GRADE_COLORS[c.letter_grade[0]] ?? '#94a3b8',
                          }}
                        >
                          {c.letter_grade}
                        </span>
                      )}
                    </td>
                    <td>{c.gpa_points ?? '—'}</td>
                    <td>{c.lecturer_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}