import { type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface PageSectionProps extends ComponentPropsWithRef<'section'> {
  title: string;
  icon?: ReactElement;
  iconClick?: () => void;
  children: ReactNode;
}

export const PageSection = ({
  title,
  icon,
  iconClick,
  className,
  children,
  ref,
  ...props
}: PageSectionProps) => (
  <section ref={ref} className="flex flex-col gap-4" {...props}>
    <div className="flex items-center justify-between">
      <h2 className="body-2 text-black">{title}</h2>
      {icon && (
        <button type="button" onClick={iconClick} className="cursor-pointer">
          {icon}
        </button>
      )}
    </div>
    <div className={cn('flex flex-col', className)}>{children}</div>
  </section>
);
