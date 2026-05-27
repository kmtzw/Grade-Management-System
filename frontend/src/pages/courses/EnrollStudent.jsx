import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, studentsAPI } from '../../api/endpoints';

export default function EnrollStudent() {
  const { id }                  = useParams(); // course id from URL
  const navigate                = useNavigate();
  const [course, setCourse]     = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');

  // Load the course name so it shows in the page header
  useEffect(() => {
    coursesAPI.getById(id).then(({ data }) => setCourse(data));
  }, [id]);

  // Search for students as the admin types — debounced by 400ms
  useEffect(() => {
    if (search.length < 2) { setStudents([]); return; }
    const timeout = setTimeout(() => {
      studentsAPI.getAll({ search, limit: 8 })
        .then(({ data }) => setStudents(data.data));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleEnroll = async () => {
    if (!selected) return;
    setEnrolling(true);
    setError('');
    setMessage('');
    try {
      await coursesAPI.enroll(id, { studentId: selected.id });
      setMessage(`${selected.first_name} ${selected.last_name} enrolled successfully`);
      setSelected(null);
      setSearch('');
      setStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Enroll Student</h1>
      {course && (
        <p className="detail-meta">
          Course: <strong>{course.course_code} — {course.course_name}</strong>
        </p>
      )}

      {message && <div className="success-message">{message}</div>}
      {error   && <div className="error-message">{error}</div>}

      <div className="form-card">
        {/* Search box */}
        <div className="form-group">
          <label>Search student by name or student number</label>
          <input
            type="text"
            placeholder="e.g. John or R123456"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }}
            className="search-input"
          />
        </div>

        {/* Search results list */}
        {students.length > 0 && !selected && (
          <ul className="student-search-results">
            {students.map(s => (
              <li
                key={s.id}
                className="search-result-item"
                onClick={() => { setSelected(s); setSearch(`${s.first_name} ${s.last_name}`); setStudents([]); }}
              >
                <span className="result-name">{s.first_name} {s.last_name}</span>
                <span className="result-meta">{s.student_number} · {s.department}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Selected student confirmation card */}
        {selected && (
          <div className="selected-student-card">
            <div>
              <p className="selected-name">{selected.first_name} {selected.last_name}</p>
              <p className="selected-meta">
                {selected.student_number} · Year {selected.year_of_study} · {selected.department}
              </p>
            </div>
            <button
              className="btn-link btn-danger"
              onClick={() => { setSelected(null); setSearch(''); }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleEnroll}
            disabled={!selected || enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
          </button>
        </div>
      </div>
    </div>
  );
}