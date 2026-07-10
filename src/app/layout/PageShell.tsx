import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PageShellProps {
  header?: ReactNode;
  children: ReactNode;
  bottom?: ReactNode;
  className?: string;
  contentClassName?: string;
  contentRef?: ComponentPropsWithRef<'main'>['ref'];
  contentProps?: Omit<ComponentPropsWithRef<'main'>, 'children' | 'className' | 'ref'>;
  bottomClassName?: string;
}

export const PageShell = ({
  header,
  children,
  bottom,
  className,
  contentClassName,
  contentRef,
  contentProps,
  bottomClassName,
}: PageShellProps) => {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white',
        className,
      )}
    >
      {header && <header className="shrink-0 pt-(--safe-top)">{header}</header>}

      <main
        ref={contentRef}
        className={cn('no-scrollbar min-h-0 flex-1 overflow-y-auto', contentClassName)}
        {...contentProps}
      >
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
