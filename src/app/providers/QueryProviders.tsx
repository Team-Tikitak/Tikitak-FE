import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import type { PropsWithChildren } from 'react';

export function QueryProviders({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
