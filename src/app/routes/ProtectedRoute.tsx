import { Navigate, Outlet } from 'react-router';
import { useAuthInit } from '@/shared/api/auth/queries';
import { useAuthStore } from '@/shared/stores/authStore';
import { PATHS } from './paths';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { isPending } = useAuthInit();

  if (isPending) return null;
  if (!accessToken) return <Navigate to={PATHS.LOGIN} replace />;
  return <Outlet />;
};
