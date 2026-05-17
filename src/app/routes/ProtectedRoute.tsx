import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/shared/stores/authStore';
import { PATHS } from './paths';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  return <Outlet />;
};
