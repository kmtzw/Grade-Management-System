import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, lecturersAPI } from '../../api/endpoints';

export default function CreateCourse() {
  const navigate                  = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    courseCode:   '',
    courseName:   '',
    department:   '',
    creditHours:  3,
    semester:     'first',
    academicYear: new Date().getFullYear(),
    lecturerId:   '',
  });

  useEffect(() => {
    // Use the lecturers API we just created — no more raw api.get call
    lecturersAPI.getAll({ limit: 100 })
      .then(({ data }) => setLecturers(data.data ?? []))
      .catch(() => setLecturers([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Send lecturerId as null if nothing selected, not empty string
      // Empty string causes the 'invalid UUID' error
      const payload = {
        ...form,
        lecturerId:  form.lecturerId || null,
        creditHours: parseInt(form.creditHours),
        academicYear: parseInt(form.academicYear),
      };
      await coursesAPI.create(payload);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Create New Course</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Course Code</label>
              <input
                name="courseCode" required
                placeholder="e.g. CS301"
                value={form.courseCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Credit Hours</label>
              <input
                type="number" name="creditHours"
                min="1" max="6"
                value={form.creditHours}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Course Name</label>
            <input
              name="courseName" required
              placeholder="e.g. Data Structures and Algorithms"
              value={form.courseName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department" required
                value={form.department} onChange={handleChange}
              >
                <option value="">Select department</option>
                <option>Computer Science</option>
                <option>Engineering</option>
                <option>Business</option>
                <option>Medicine</option>
                <option>Law</option>
              </select>
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select name="semester" value={form.semester} onChange={handleChange}>
                <option value="first">First</option>
                <option value="second">Second</option>
                <option value="summer">Summer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input
                type="number" name="academicYear"
                min="2000" max="2100"
                value={form.academicYear}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Assign Lecturer (optional)</label>
            <select
              name="lecturerId"
              value={form.lecturerId}
              onChange={handleChange}
            >
              <option value="">— No lecturer assigned yet —</option>
              {lecturers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.first_name} {l.last_name} — {l.department}
                </option>
              ))}
            </select>
            {lecturers.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                No lecturers found. Register a lecturer first.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}