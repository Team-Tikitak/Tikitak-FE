import { type ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface PageShellProps {
  header?: ReactNode;
  children: ReactNode;
  bottom?: ReactNode;
  contentClassName?: string;
  bottomClassName?: string;
}

export const PageShell = ({
  header,
  children,
  bottom,
  contentClassName,
  bottomClassName,
}: PageShellProps) => {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
      {header && <header className="shrink-0 pt-(--safe-top)">{header}</header>}

      <main className={cn('no-scrollbar min-h-0 flex-1 overflow-y-auto', contentClassName)}>
        {children}
      </main>

      {bottom && (
        <footer
          className={cn(
            'shrink-0 px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]',
            bottomClassName,
          )}
        >
          {bottom}
        </footer>
      )}
    </div>
  );
};
