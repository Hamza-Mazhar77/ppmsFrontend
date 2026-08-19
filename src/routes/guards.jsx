/**
 * Route guards
 * These improve the experience - they are NOT the security boundary. Every API
 * endpoint independently verifies the JWT, the account status and the role, so
 * a student who edits the URL to /admin gets a 403 from the server even if a
 * guard were bypassed.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/States';

/** Full-page spinner while the initial session check is in flight. */
function SessionLoading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <LoadingState label="Loading your session..." />
    </div>
  );
}

/** Requires any authenticated user; remembers where they were heading. */
export function ProtectedRoute() {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

/**
 * Student area. An administrator who lands here is redirected to their own
 * dashboard so they keep the correct portal context.
 */
export function StudentRoute() {
  const { isAuthenticated, isAdmin, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

/** Administrator area. A student is sent to the "access denied" screen. */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

/**
 * Login / register / verify screens. An already-signed-in visitor is bounced to
 * the dashboard that matches their role.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, isAdmin, initialising } = useAuth();

  if (initialising) return <SessionLoading />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  return <Outlet />;
}
