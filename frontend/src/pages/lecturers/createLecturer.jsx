import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/endpoints';

export default function CreateLecturer() {
  const navigate        = useNavigate();
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email:       '',
    password:    '',
    firstName:   '',
    lastName:    '',
    staffNumber: '',
    department:  '',
    role:        'lecturer',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await authAPI.register(form);
      navigate('/admin/lecturers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lecturer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Register New Lecturer</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <h3 className="form-section-title">Account Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" name="email" required
                placeholder="lecturer@university.ac.zw"
                value={form.email} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Initial Password</label>
              <input
                type="password" name="password" required
                placeholder="Minimum 8 characters"
                value={form.password} onChange={handleChange}
              />
            </div>
          </div>

          <h3 className="form-section-title">Personal Details</h3>
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
              <label>Staff Number</label>
              <input
                name="staffNumber" required
                placeholder="e.g. STAFF002"
                value={form.staffNumber} onChange={handleChange}
              />
            </div>
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
              {saving ? 'Registering...' : 'Register Lecturer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}