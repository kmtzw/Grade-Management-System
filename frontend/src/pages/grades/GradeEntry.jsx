import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // ADD THIS — reads :id from the URL
import { gradesAPI } from '../../api/endpoints';
import { GRADE_SCALE } from '../../utils/gradeCalculator';

const previewGrade = (a, m, f) => {
  const total = (parseFloat(a)||0)*0.30 + (parseFloat(m)||0)*0.30 + (parseFloat(f)||0)*0.40;
  const entry = GRADE_SCALE.find(g => total >= g.min) ?? { letter: 'F', points: 0 };
  return { total: total.toFixed(1), letter: entry.letter, points: entry.points };
};

export default function GradeEntry() {  // REMOVE the courseId prop
  // Read the course id directly from the URL instead of a prop
  // URL pattern is /courses/:id/grades so useParams gives us { id }
  const { id: courseId } = useParams();

  const [students, setStudents]   = useState([]);
  const [grades,   setGrades]     = useState({});
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState('');

  useEffect(() => {
    if (!courseId) {
      setError('No course ID found in the URL.');
      setLoading(false);
      return;
    }

    gradesAPI.getCourseGrades(courseId)
      .then(({ data }) => {
        setStudents(data);
        // Pre-fill the form with any grades that already exist
        const existing = {};
        data.forEach(s => {
          existing[s.enrollment_id] = {
            a:       s.assignment_score ?? '',
            m:       s.midterm_score    ?? '',
            f:       s.final_score      ?? '',
            remarks: s.remarks          ?? ''
          };
        });
        setGrades(existing);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load students.');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleChange = (enrollmentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value }
    }));
  };

  const handleBulkSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = Object.entries(grades)
        .filter(([, g]) => g.a !== '' && g.m !== '' && g.f !== '')
        .map(([enrollmentId, g]) => ({
          enrollmentId,
          assignmentScore: parseFloat(g.a),
          midtermScore:    parseFloat(g.m),
          finalScore:      parseFloat(g.f),
          remarks:         g.remarks || null
        }));

      if (payload.length === 0) {
        setError('Please fill in scores for at least one student before saving.');
        setSaving(false);
        return;
      }

      await gradesAPI.bulkSubmit({ grades: payload });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save grades.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading-text">Loading students...</p>;

  return (
    <div className="grade-entry">
      <div className="grade-entry-header">
        <h2>Grade Entry</h2>
        <p className="weight-note">
          Weights: Assignment 30% · Midterm 30% · Final 40%
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {students.length === 0 ? (
        <p className="empty-state">No students enrolled in this course yet.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Std. No.</th>
                  <th>Assignment /100</th>
                  <th>Midterm /100</th>
                  <th>Final /100</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const g = grades[student.enrollment_id] || { a:'', m:'', f:'', remarks:'' };
                  const preview    = previewGrade(g.a, g.m, g.f);
                  const isComplete = g.a !== '' && g.m !== '' && g.f !== '';

                  return (
                    <tr key={student.enrollment_id}>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{student.student_number}</td>
                      {['a', 'm', 'f'].map(field => (
                        <td key={field}>
                          <input
                            type="number" min="0" max="100" step="0.5"
                            value={g[field]}
                            onChange={e => handleChange(student.enrollment_id, field, e.target.value)}
                            className="score-input"
                          />
                        </td>
                      ))}
                      <td className="total-cell">
                        {isComplete ? preview.total : '—'}
                      </td>
                      <td>
                        {isComplete && (
                          <span className={`grade-badge grade-${preview.letter.charAt(0)}`}>
                            {preview.letter}
                          </span>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Optional note"
                          value={g.remarks}
                          onChange={e => handleChange(student.enrollment_id, 'remarks', e.target.value)}
                          className="remarks-input"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grade-actions">
            <button
              onClick={handleBulkSubmit}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save All Grades'}
            </button>
            {saved && (
              <span className="success-toast">
                Grades saved successfully!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}