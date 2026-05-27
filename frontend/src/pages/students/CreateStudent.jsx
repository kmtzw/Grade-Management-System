import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/endpoints';

export default function CreateStudent() {
  const navigate        = useNavigate();
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email:         '',
    password:      '',
    firstName:     '',
    lastName:      '',
    studentNumber: '',
    department:    '',
    yearOfStudy:   1,
    role:          'student',
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
      // Register creates both the user account and the student profile
      // in a single transaction on the backend
      await authAPI.register(form);
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <button className="btn-link back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Register New Student</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>

          <h3 className="form-section-title">Account Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" name="email" required
                placeholder="student@university.ac.zw"
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
              <label>Student Number</label>
              <input
                name="studentNumber" required
                placeholder="e.g. R123456Y"
                value={form.studentNumber} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select name="department" required value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              <option>Computer Science</option>
              <option>Engineering</option>
              <option>Business</option>
              <option>Medicine</option>
              <option>Law</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}