import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function StudentList() {
  const { user }               = useAuth();
  const navigate               = useNavigate();
  const [students, setStudents] = useState([]);
  const [meta, setMeta]        = useState({});
  const [search, setSearch]    = useState('');
  const [department, setDept]  = useState('');
  const [page, setPage]        = useState(1);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    // Debounce the search — waits 400ms after the user stops typing
    // before making the API call, reducing unnecessary requests
    const timeout = setTimeout(() => {
      setLoading(true);
      studentsAPI.getAll({
        page,
        limit: 10,
        search: search || undefined,
        department: department || undefined,
      })
        .then(({ data }) => {
          setStudents(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, department, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await studentsAPI.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusColor = (status) => {
    const colors = { active: '#22c55e', suspended: '#f97316', graduated: '#3b82f6' };
    return colors[status] ?? '#94a3b8';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Students</h1>
        {user.role === 'admin' && (
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/students/create')}
          >
            + New Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or student number..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
        <select
          value={department}
          onChange={e => { setDept(e.target.value); setPage(1); }}
          className="filter-select"
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Engineering">Engineering</option>
          <option value="Business">Business</option>
          <option value="Medicine">Medicine</option>
          <option value="Law">Law</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="loading-text">Loading students...</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Email</th>
                <th>Enrolled Courses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    No students found
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.student_number}</strong></td>
                    <td>{s.first_name} {s.last_name}</td>
                    <td>{s.department}</td>
                    <td>Year {s.year_of_study}</td>
                    <td>{s.email}</td>
                    <td>{s.enrolled_courses}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          background: getStatusColor(s.status) + '22',
                          color: getStatusColor(s.status),
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-link"
                        onClick={() => navigate(`/students/${s.id}`)}
                      >
                        View
                      </button>
                      {user.role === 'admin' && (
                        <>
                          <button
                            className="btn-link"
                            onClick={() => navigate(`/admin/students/${s.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-link btn-danger"
                            onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {meta.currentPage} of {meta.totalPages}
              &nbsp;·&nbsp;
              {meta.totalCount} students
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}