import { MutationCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { alertDialog } from '@/shared/lib/native/nativeDialog';

declare module '@tanstack/react-query' {
  interface Register {
    // useServerMessage: 서버가 내려준 구체적 사유(강퇴 재참여 불가 등)를 우선 노출
    mutationMeta: { errorMessage?: string; useServerMessage?: boolean };
  }
}

const getServerMessage = (error: unknown): string | undefined => {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data as { message?: unknown } | undefined;
  return typeof data?.message === 'string' ? data.message : undefined;
};

// meta.errorMessage 있는 mutation만 실패 시 다이얼로그 (share·백그라운드는 meta 미지정으로 제외)
// useServerMessage면 서버 메시지 우선, 없으면 meta.errorMessage로 폴백
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      const meta = mutation.meta;
      if (!meta?.errorMessage) return;
      const message = (meta.useServerMessage && getServerMessage(error)) || meta.errorMessage;
      void alertDialog(message);
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
