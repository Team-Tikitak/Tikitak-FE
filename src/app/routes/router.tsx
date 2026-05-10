import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from '@/app/layout';
import { RootErrorBoundary } from '@/pages/error/ErrorBoundary';
import { HomePage } from '@/pages/home/ui';
import { LoginPage } from '@/pages/login/ui';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { TermsPage } from '@/pages/terms/ui';
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
          { path: PATHS.TERMS, element: <TermsPage /> },
          { path: PATHS.HOME, element: <HomePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
