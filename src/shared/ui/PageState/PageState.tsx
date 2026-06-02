import { PageShell } from '@/app/layout';
import { LoadingState } from '@/shared/ui/LoadingState';
import type { ReactNode } from 'react';

interface PageStateProps {
  header: ReactNode;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  errorSlot?: ReactNode;
  loadingSlot?: ReactNode;
  children: ReactNode;
}

export const PageState = ({
  header,
  isLoading,
  isError = false,
  errorMessage,
  errorSlot,
  loadingSlot,
  children,
}: PageStateProps) => {
  if (isLoading) {
    return (
      <PageShell
        header={header}
        contentClassName="flex flex-1 flex-col items-center justify-center"
      >
        {loadingSlot ?? <LoadingState />}
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell
        header={header}
        contentClassName="flex flex-1 flex-col items-center justify-center"
      >
        {errorSlot ?? <p className="body-3 text-center text-gray-500">{errorMessage}</p>}
      </PageShell>
    );
  }

  return <>{children}</>;
};
