import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../api/endpoints';

export default function EditStudent() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); // null until data loads

  // Pre-populate the form with the student's current data
  useEffect(() => {
    studentsAPI.getById(id).then(({ data }) => {
      setForm({
        firstName:    data.first_name,
        lastName:     data.last_name,
        department:   data.department,
        yearOfStudy:  data.year_of_study,
        status:       data.status,
      });
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await studentsAPI.update(id, form);
      navigate(`/students/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="loading-text">Loading student data...</p>;

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Edit Student Profile</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="firstName" required
                value={form.firstName} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                name="lastName" required
                value={form.lastName} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option>Computer Science</option>
                <option>Engineering</option>
                <option>Business</option>
                <option>Medicine</option>
                <option>Law</option>
              </select>
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}