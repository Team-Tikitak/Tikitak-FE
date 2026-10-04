import { queryClient } from '@/app/providers/queryClient';
import { ApiError, NetworkError } from '../error';
import { sessionQueryOptions } from './sessionQuery';

export type SessionRestoreResult = 'authenticated' | 'unauthenticated' | 'unavailable';

const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 800;

// 서버가 응답하지 못한 경우(5xx·네트워크 오류). 세션이 없다는 뜻이 아니므로 비로그인과 구분한다.
const isUnavailable = (error: unknown) =>
  error instanceof NetworkError || (error instanceof ApiError && error.status >= 500);

export const restoreSession = async (): Promise<SessionRestoreResult> => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await queryClient.fetchQuery(sessionQueryOptions);
      return 'authenticated';
    } catch (error) {
      // 인스펙터에서 원인을 구분할 수 있도록 남긴다: AUTH006(쿠키 없음) / AUTH007(토큰 무효·만료) / 5xx·Network(서버 장애)
      console.error('세션 복구 실패', error);
      if (!isUnavailable(error)) return 'unauthenticated';
      if (attempt >= RETRY_COUNT) return 'unavailable';
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};
