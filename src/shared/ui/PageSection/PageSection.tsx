import { cn } from '@/shared/lib';
import type React from 'react';

interface PageSectionProps {
  title: string;
  className?: string;
  icon?: React.ReactElement;
  iconClick?: () => void;
  children: React.ReactNode;
}

export const PageSection = ({ title, icon, iconClick, className, children }: PageSectionProps) => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="body-2 text-black">{title}</h2>
      <button onClick={iconClick} className="cursor-pointer">
        {icon}
      </button>
    </div>
    <div className={cn('flex flex-col', className)}>{children}</div>
  </section>
);
