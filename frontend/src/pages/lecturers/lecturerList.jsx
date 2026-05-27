import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturersAPI } from '../../api/endpoints';

export default function LecturerList() {
  const navigate                    = useNavigate();
  const [lecturers, setLecturers]   = useState([]);
  const [meta, setMeta]             = useState({});
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      lecturersAPI.getAll({ page, limit: 10, search: search || undefined })
        .then(({ data }) => {
          setLecturers(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await lecturersAPI.delete(id);
      setLecturers(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lecturers</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/lecturers/create')}
        >
          + New Lecturer
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or staff number..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading lecturers...</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff No.</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Active Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No lecturers found
                  </td>
                </tr>
              ) : (
                lecturers.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.staff_number}</strong></td>
                    <td>{l.first_name} {l.last_name}</td>
                    <td>{l.department}</td>
                    <td>{l.email}</td>
                    <td>{l.courses_count}</td>
                    <td className="action-cell">
                      <button
                        className="btn-link btn-danger"
                        onClick={() => handleDelete(l.id, `${l.first_name} ${l.last_name}`)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

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
              &nbsp;·&nbsp; {meta.totalCount} lecturers
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