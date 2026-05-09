import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/not-found';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        errorElement: <RootErrorBoundary />,
        children: [
          { index: true, element: <Navigate to={PATHS.LOGIN} replace /> },
          { path: PATHS.LOGIN, element: <LoginPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
