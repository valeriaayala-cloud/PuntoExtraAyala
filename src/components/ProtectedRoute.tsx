import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

/** Redirige al login si no hay token; recuerda a dónde quería ir el usuario. */
export default function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
