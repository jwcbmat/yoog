import { Navigate, Outlet } from 'react-router-dom';

export function PublicRoute() {
  const token = localStorage.getItem('@mini-crm:token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
