import { Navigate, Outlet } from 'react-router';
import { getAccessToken } from '@/shared/api/instance';
import { PATHS } from './paths';

export const ProtectedRoute = () => {
  if (!getAccessToken()) return <Navigate to={PATHS.LOGIN} replace />;

  return <Outlet />;
};
