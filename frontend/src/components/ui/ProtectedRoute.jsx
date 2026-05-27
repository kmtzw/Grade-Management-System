import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Wraps any route that should only be accessible when logged in.
// If the user isn't authenticated, redirects to /login.
// If roles are specified, redirects to /dashboard if the user lacks permission.
//
// Usage:
//   <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;