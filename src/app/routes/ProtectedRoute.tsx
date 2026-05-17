import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { getAccessToken, instance, setAccessToken } from '@/shared/api/instance';
import { PATHS } from './paths';

export const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(!getAccessToken());
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAccessToken()));
  const hasTriedRef = useRef(false);

  useEffect(() => {
    if (getAccessToken()) return;

    if (hasTriedRef.current) return;
    hasTriedRef.current = true;

    instance
      .post('/api/v1/auth/token/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  if (isChecking) return null;

  if (!isAuthenticated) return <Navigate to={PATHS.LOGIN} replace />;

  return <Outlet />;
};
