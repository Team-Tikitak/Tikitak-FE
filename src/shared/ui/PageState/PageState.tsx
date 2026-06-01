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
    return <PageShell header={header}>{loadingSlot ?? <LoadingState />}</PageShell>;
  }

  if (isError) {
    return (
      <PageShell header={header}>
        {errorSlot ?? <p className="body-3 mt-10 text-center text-gray-500">{errorMessage}</p>}
      </PageShell>
    );
  }

  return <>{children}</>;
};
