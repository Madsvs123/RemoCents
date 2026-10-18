import { Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import { routePaths } from './routePaths';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to={routePaths.login} replace />;
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={routePaths.home} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
