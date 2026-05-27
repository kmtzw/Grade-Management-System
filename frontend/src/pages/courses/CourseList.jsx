import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function CourseList() {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [courses, setCourses] = useState([]);
  const [meta, setMeta]       = useState({});
  const [search, setSearch]   = useState('');
  const [department, setDept] = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  // Re-fetch whenever search, department filter, or page changes.
  // The timeout (debounce) means we wait 400ms after the user stops
  // typing before sending a request — avoids hammering the API on
  // every single keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      coursesAPI.getAll({ page, limit: 10, department: department || undefined })
        .then(({ data }) => {
          setCourses(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout); // cleanup previous timeout on re-render
  }, [search, department, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this course?')) return;
    await coursesAPI.update(id, { isActive: false });
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleSelfEnroll = async (courseId, courseName) => {
  if (!window.confirm(`Enroll in ${courseName}?`)) return;
  try {
    // Student role — no need to pass studentId, backend uses their profileId
    await coursesAPI.enroll(courseId, {});
    alert(`Successfully enrolled in ${courseName}`);
    // Refresh the list to update enrolled count
    setPage(p => p);
  } catch (err) {
    alert(err.response?.data?.message || 'Enrollment failed');
  }
 };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Courses</h1>
        {user.role === 'admin' && (
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/courses/create')}
          >
            + New Course
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by code or name..."
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
        <p className="loading-text">Loading courses...</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Lecturer</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.course_code}</strong>
                    </td>
                    <td>{course.course_name}</td>
                    <td>{course.department}</td>
                    <td>{course.lecturer_name ?? '—'}</td>
                    <td>{course.credit_hours}</td>
                    <td style={{ textTransform: 'capitalize' }}>{course.semester}</td>
                    <td>{course.enrolled_count}</td>
                    <td className="action-cell">
                      <button
                        className="btn-link"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        View
                      </button>

                      {/* Students can enroll themselves directly */}
                      {user.role === 'student' && (
                        <button
                          className="btn-link"
                          onClick={() => handleSelfEnroll(course.id, course.course_name)}
                        >
                          Enroll
                        </button>
                      )}
                      {(user.role === 'admin' || user.role === 'lecturer') && (
                        <button
                          className="btn-link"
                          onClick={() => navigate(`/courses/${course.id}/enroll`)}
                        >
                          Enroll Student
                        </button>
                      )}
                      {user.role === 'admin' && (
                       <button
                         className="btn-link btn-danger"
                         onClick={() => handleDelete(course.id)}
                       >
                         Deactivate
                       </button>
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
              Page {meta.currentPage} of {meta.totalPages} &nbsp;·&nbsp; {meta.totalCount} courses
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