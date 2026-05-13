import { Ssgoi } from '@ssgoi/react';
import { fade } from '@ssgoi/react/view-transitions';
import { Outlet } from 'react-router';
import { cn } from '@/shared/lib';

interface RootLayoutProps {
  className?: string;
}

const ssgoiConfig = {
  defaultTransition: fade(),
};

export const RootLayout = ({ className }: RootLayoutProps) => {
  return (
    <div className={cn('mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-white', className)}>
      <Ssgoi config={ssgoiConfig}>
        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-x-hidden">
          <Outlet />
        </div>
      </Ssgoi>
    </div>
  );
};
