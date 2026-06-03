import { MutationCache, QueryClient } from '@tanstack/react-query';
import { alertDialog } from '@/shared/lib/native/nativeDialog';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { errorMessage?: string };
  }
}

// meta.errorMessage 있는 mutation만 실패 시 다이얼로그 (share·백그라운드는 meta 미지정으로 제외)
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (_error, _vars, _ctx, mutation) => {
      if (mutation.meta?.errorMessage) void alertDialog(mutation.meta.errorMessage);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
