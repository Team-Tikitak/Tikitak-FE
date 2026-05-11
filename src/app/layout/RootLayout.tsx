import { Outlet } from 'react-router';
import { cn } from '@/shared/lib';

interface RootLayoutProps {
  className?: string;
}

export const RootLayout = ({ className }: RootLayoutProps) => {
  return (
    <div className={cn('mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-white', className)}>
      <Outlet />
    </div>
  );
};
