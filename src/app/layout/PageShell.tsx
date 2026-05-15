import { type ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface PageShellProps {
  header?: ReactNode;
  children: ReactNode;
  bottom?: ReactNode;
  bottomPosition?: 'static' | 'fixed';
  contentClassName?: string;
  bottomClassName?: string;
}

export const PageShell = ({
  header,
  children,
  bottom,
  bottomPosition = 'static',
  contentClassName,
  bottomClassName,
}: PageShellProps) => {
  const hasFixedBottom = bottomPosition === 'fixed';

  return (
    <>
      {header && <header className="shrink-0">{header}</header>}

      <main
        className={cn(
          'min-h-0 flex-1 overflow-y-auto',
          contentClassName,
          hasFixedBottom && 'pb-[calc(84px+env(safe-area-inset-bottom))]',
        )}
      >
        {children}
      </main>

      {bottom && (
        <footer
          className={cn(
            hasFixedBottom
              ? 'fixed bottom-0 left-1/2 z-50 flex w-full max-w-[393px] -translate-x-1/2 justify-center bg-white px-5 pt-4 pb-[calc(8px+env(safe-area-inset-bottom))]'
              : 'shrink-0 px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]',
            bottomClassName,
          )}
        >
          {bottom}
        </footer>
      )}
    </>
  );
};
