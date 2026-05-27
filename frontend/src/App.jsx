import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Students
import StudentList   from './pages/students/StudentList';
import StudentDetail from './pages/students/StudentDetail';
import CreateStudent from './pages/students/CreateStudent';
import EditStudent   from './pages/students/EditStudent';

// Lecturers
import LecturerList    from './pages/lecturers/lecturerList';
import CreateLecturer  from './pages/lecturers/createLecturer';

// Courses
import CourseList    from './pages/courses/CourseList';
import CourseDetail  from './pages/courses/CourseDetail';
import CreateCourse  from './pages/courses/CreateCourse';
import EnrollStudent from './pages/courses/EnrollStudent';

// Grades
import GradeEntry  from './pages/grades/GradeEntry';
import Transcript  from './pages/grades/Transcript';

// Reports
import ReportsDashboard  from './pages/reports/ReportsDashboard';
import DepartmentReport  from './pages/reports/DepartmentReports';
import LecturerReport    from './pages/reports/LecturerReport';

// Shared component
import ProtectedRoute from './components/ui/ProtectedRoute';

// ─── Sidebar Navigation ───────────────────────────────────────────────────────
// Rendered inside every protected page. Shows different links based on role.
function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  // Returns 'active' class if the current URL starts with the given path
  const isActive = (path) =>
    location.pathname.startsWith(path) ? 'nav-link nav-active' : 'nav-link';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* App title */}
      <div className="sidebar-brand">
        <span className="brand-icon">🎓</span>
        <span className="brand-text">GradeMS</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.firstName} {user?.lastName}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      {/* Navigation links — filtered by role */}
      <nav className="sidebar-nav">

        {/* Admin links */}
        {user?.role === 'admin' && (
          <>
            <p className="nav-section-label">Overview</p>
            <button className={isActive('/admin/dashboard')} onClick={() => navigate('/admin/dashboard')}>
              📊 Dashboard
            </button>
            <p className="nav-section-label">Management</p>
            <button className={isActive('/students')} onClick={() => navigate('/students')}>
              👥 Students
            </button>
            <button className={isActive('/courses')} onClick={() => navigate('/courses')}>
              📚 Courses
            </button>
            <button
             className={isActive('/admin/lecturers')}
             onClick={() => navigate('/admin/lecturers')}
            >
              🎓 Lecturers
            </button>
            <p className="nav-section-label">Analytics</p>
            <button className={isActive('/reports')} onClick={() => navigate('/reports')}>
              📈 Reports
            </button>
            <button className={isActive('/reports/departments')} onClick={() => navigate('/reports/departments')}>
              🏛️ Departments
            </button>
          </>
        )}

        {/* Lecturer links */}
        {user?.role === 'lecturer' && (
          <>
            <p className="nav-section-label">Teaching</p>
            <button className={isActive('/courses')} onClick={() => navigate('/courses')}>
              📚 My Courses
            </button>
            <button className={isActive('/reports/lecturer')} onClick={() => navigate(`/reports/lecturer/${user.profileId}`)}>
              📈 My Reports
            </button>
          </>
        )}

        {/* Student links */}
        {user?.role === 'student' && (
          <>
            <p className="nav-section-label">My Academic Record</p>
            <button className={isActive('/student/transcript')} onClick={() => navigate('/student/transcript')}>
              📋 My Transcript
            </button>
            <button className={isActive('/courses')} onClick={() => navigate('/courses')}>
              📚 Courses
            </button>           
          </>
        )}
      </nav>

      {/* Logout at the bottom */}
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
// Wraps all protected pages with the sidebar + main content area layout
function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ─── Role-based default redirect ──────────────────────────────────────────────
// After login, sends each role to their own starting page
function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'lecturer') return <Navigate to="/courses" replace />;
  if (user.role === 'student')  return <Navigate to="/student/transcript" replace />;
  return <Navigate to="/login" replace />;
}

// ─── Root App Component ────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Root redirect ── */}
          <Route path="/" element={<DefaultRedirect />} />

          {/* ══════════════════════════════════════
              ADMIN ROUTES
          ══════════════════════════════════════ */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><AdminDashboard /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/create"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><CreateStudent /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/:id/edit"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><EditStudent /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/create"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><CreateCourse /></AppShell>
              </ProtectedRoute>
            }
          />

          {/* ══════════════════════════════════════
              STUDENTS — admin + lecturer can list,
              students can view their own profile
          ══════════════════════════════════════ */}
          <Route
            path="/students"
            element={
              <ProtectedRoute roles={['admin', 'lecturer']}>
                <AppShell><StudentList /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <AppShell><StudentDetail /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/lecturers"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><LecturerList /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
           path="/admin/lecturers/create"
           element={
             <ProtectedRoute roles={['admin']}>
               <AppShell><CreateLecturer /></AppShell>
             </ProtectedRoute>
           }
          />

          {/* ══════════════════════════════════════
              COURSES — all roles can browse
          ══════════════════════════════════════ */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <AppShell><CourseList /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <AppShell><CourseDetail /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/enroll"
            element={
              <ProtectedRoute roles={['admin', 'lecturer']}>
                <AppShell><EnrollStudent /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id/grades"
            element={
              <ProtectedRoute roles={['admin', 'lecturer']}>
                <AppShell><GradeEntry courseId={null} /></AppShell>
              </ProtectedRoute>
            }
          />

          {/* ══════════════════════════════════════
              GRADES
          ══════════════════════════════════════ */}
          <Route
            path="/student/transcript"
            element={
              <ProtectedRoute roles={['student']}>
                <AppShell><Transcript /></AppShell>
              </ProtectedRoute>
            }
          />

          {/* ══════════════════════════════════════
              REPORTS — admin full access,
              lecturers see their own report only
          ══════════════════════════════════════ */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><ReportsDashboard /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/departments"
            element={
              <ProtectedRoute roles={['admin']}>
                <AppShell><DepartmentReport /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/lecturer/:id"
            element={
              <ProtectedRoute roles={['admin', 'lecturer']}>
                <AppShell><LecturerReport /></AppShell>
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all — redirect unknown URLs to root ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}