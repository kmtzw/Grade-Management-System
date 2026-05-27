import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsAPI, gradesAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function StudentDetail() {
  const { id }               = useParams();
  const { user }             = useAuth();
  const navigate             = useNavigate();
  const [student, setStudent] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Load student profile and transcript simultaneously
    Promise.all([
      studentsAPI.getById(id),
      gradesAPI.getTranscript(id),
    ]).then(([stuRes, transRes]) => {
      setStudent(stuRes.data);
      setTranscript(transRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading-text">Loading student profile...</p>;
  if (!student) return <p>Student not found.</p>;

  // Group transcript rows by year and semester for display
  const byPeriod = transcript?.transcript?.reduce((acc, row) => {
    const key = `${row.academic_year} — ${row.semester} semester`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {}) ?? {};

  const GRADE_COLORS = {
    A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444'
  };

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back to Students
      </button>

      {/* Profile header */}
      <div className="detail-header">
        <div className="student-avatar-block">
          {/* Avatar circle showing initials */}
          <div className="avatar-circle">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <h1>{student.first_name} {student.last_name}</h1>
            <p className="detail-meta">
              {student.student_number} &nbsp;·&nbsp;
              {student.department} &nbsp;·&nbsp;
              Year {student.year_of_study}
            </p>
            <p className="detail-meta">{student.email}</p>
            <span
              className="status-badge"
              style={{
                background: student.status === 'active' ? '#22c55e22' : '#f9731622',
                color: student.status === 'active' ? '#22c55e' : '#f97316',
              }}
            >
              {student.status}
            </span>
          </div>
        </div>

        {/* CGPA card */}
        <div className="cgpa-card">
          <span className="cgpa-label">CGPA</span>
          <span className="cgpa-value">{transcript?.cgpa ?? '—'}</span>
          <span className="cgpa-max">/ 4.0</span>
        </div>

        {user.role === 'admin' && (
          <button
            className="btn-secondary"
            onClick={() => navigate(`/admin/students/${id}/edit`)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['profile', 'transcript', 'enrollments'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="detail-card">
          <h3>Personal Information</h3>
          <div className="detail-grid">
            {[
              ['Full Name',       `${student.first_name} ${student.last_name}`],
              ['Student Number',  student.student_number],
              ['Email',           student.email],
              ['Department',      student.department],
              ['Year of Study',   `Year ${student.year_of_study}`],
              ['Status',          student.status],
            ].map(([label, value]) => (
              <div key={label} className="detail-field">
                <span className="field-label">{label}</span>
                <span className="field-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript Tab */}
      {activeTab === 'transcript' && (
        <div>
          {Object.keys(byPeriod).length === 0 ? (
            <p className="empty-state">No grades recorded yet.</p>
          ) : (
            Object.entries(byPeriod).map(([period, courses]) => (
              <div key={period} className="semester-block">
                <h4 className="semester-heading">{period}</h4>
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
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.course_code}>
                        <td>{c.course_code}</td>
                        <td>{c.course_name}</td>
                        <td>{c.credit_hours}</td>
                        <td>{c.assignment_score ?? '—'}</td>
                        <td>{c.midterm_score ?? '—'}</td>
                        <td>{c.final_score ?? '—'}</td>
                        <td><strong>{c.total_score ?? '—'}</strong></td>
                        <td>
                          {c.letter_grade && (
                            <span
                              className="grade-pill"
                              style={{
                                background: (GRADE_COLORS[c.letter_grade[0]] ?? '#94a3b8') + '22',
                                color: GRADE_COLORS[c.letter_grade[0]] ?? '#94a3b8',
                              }}
                            >
                              {c.letter_grade}
                            </span>
                          )}
                        </td>
                        <td>{c.gpa_points ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="detail-card">
          <h3>Current Enrollments</h3>
          {!student.enrollments || student.enrollments.length === 0 ? (
            <p className="empty-state">Not enrolled in any courses.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.enrollments.map(e => (
                  <tr key={e.enrollmentId}>
                    <td>{e.courseCode}</td>
                    <td>{e.courseName}</td>
                    <td>{e.creditHours}</td>
                    <td style={{ textTransform: 'capitalize' }}>{e.semester}</td>
                    <td>
                      <span className={`status-badge status-${e.status}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}