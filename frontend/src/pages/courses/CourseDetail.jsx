import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, gradesAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function CourseDetail() {
  const { id }                = useParams();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [course, setCourse]   = useState(null);
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // All roles can fetch course info
        const courseRes = await coursesAPI.getById(id);
        setCourse(courseRes.data);

        // Only admins and lecturers can see the grade list
        // Students see the course info only
        if (user.role === 'admin' || user.role === 'lecturer') {
          const gradesRes = await gradesAPI.getCourseGrades(id);
          setGrades(gradesRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.role]);

  if (loading) return <p className="loading-text">Loading course...</p>;
  if (error)   return <p className="error-message">{error}</p>;
  if (!course) return <p className="empty-state">Course not found.</p>;

  const gradedStudents = grades.filter(g => g.letter_grade);
  const avgScore = gradedStudents.length
    ? (gradedStudents.reduce((sum, g) => sum + parseFloat(g.total_score), 0) / gradedStudents.length).toFixed(1)
    : null;
  const passCount = gradedStudents.filter(g => g.letter_grade !== 'F').length;

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back to Courses
      </button>

      {/* Course header */}
      <div className="detail-header">
        <div>
          <span className="course-code-badge">{course.course_code}</span>
          <h1>{course.course_name}</h1>
          <p className="detail-meta">
            {course.department} &nbsp;·&nbsp;
            {course.credit_hours} credit hours &nbsp;·&nbsp;
            <span style={{ textTransform: 'capitalize' }}>{course.semester}</span>
            &nbsp;semester {course.academic_year}
          </p>
          <p className="detail-meta">
            Lecturer: <strong>{course.lecturer_name ?? 'Not assigned'}</strong>
          </p>
        </div>

        {/* Action buttons — only for admin and lecturer */}
        {(user.role === 'admin' || user.role === 'lecturer') && (
          <div className="detail-actions">
            <button
              className="btn-primary"
              onClick={() => navigate(`/courses/${id}/grades`)}
            >
              Enter Grades
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(`/courses/${id}/enroll`)}
            >
              Enroll Student
            </button>
          </div>
        )}
      </div>

      {/* Summary stats — only shown if grades exist and user is staff */}
      {(user.role === 'admin' || user.role === 'lecturer') && gradedStudents.length > 0 && (
        <div className="metric-grid" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Enrolled', value: grades.length },
            { label: 'Graded',         value: gradedStudents.length },
            { label: 'Average Score',  value: avgScore },
            { label: 'Pass Rate',      value: `${Math.round(passCount / gradedStudents.length * 100)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="metric-card">
              <span className="metric-label">{label}</span>
              <span className="metric-value">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Student grade list — admin and lecturer only */}
      {(user.role === 'admin' || user.role === 'lecturer') && (
        <div className="table-card">
          <h3>Enrolled Students ({grades.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Name</th>
                <th>Assignment</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Total</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    No students enrolled yet
                  </td>
                </tr>
              ) : (
                grades.map(student => (
                  <tr key={student.enrollment_id}>
                    <td>{student.student_number}</td>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{student.assignment_score ?? '—'}</td>
                    <td>{student.midterm_score    ?? '—'}</td>
                    <td>{student.final_score      ?? '—'}</td>
                    <td>{student.total_score      ?? '—'}</td>
                    <td>
                      {student.letter_grade ? (
                        <span className={`grade-badge grade-${student.letter_grade.charAt(0)}`}>
                          {student.letter_grade}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`status-badge status-${student.enrollment_status}`}>
                        {student.enrollment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Student view — they see course info only, no grade list */}
      {user.role === 'student' && (
        <div className="detail-card">
          <h3>Course Information</h3>
          <div className="detail-grid">
            {[
              ['Course Code',   course.course_code],
              ['Course Name',   course.course_name],
              ['Department',    course.department],
              ['Credit Hours',  course.credit_hours],
              ['Semester',      course.semester],
              ['Academic Year', course.academic_year],
              ['Lecturer',      course.lecturer_name ?? 'Not assigned'],
              ['Enrolled',      course.enrolled_count + ' students'],
            ].map(([label, value]) => (
              <div key={label} className="detail-field">
                <span className="field-label">{label}</span>
                <span className="field-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}