import { Outlet } from 'react-router';
import { AppLayoutRoot } from './AppLayout';

export const MainLayout = () => {
  return (
    <AppLayoutRoot>
      <Outlet />
    </AppLayoutRoot>
  );
};
