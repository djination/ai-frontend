import { Navigate, useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storageKeys';

export function ProtectedRoleRoute({ allowedRoles, children }) {
  const location = useLocation();
  const role = localStorage.getItem(STORAGE_KEYS.ROLE) ?? '';

  if (!role) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/app/learn" replace />;
  }

  return children;
}
