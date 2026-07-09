import { feedDetailQueryOptions } from '@/shared/api/feed/queries';
import type { QueryClient } from '@tanstack/react-query';

// 목록에서 호버·터치 시 상세 데이터를 미리 캐시해, 실제 진입 시 로더가 네트워크 왕복 없이
// 즉시 resolve되게 한다. 히어로 전환 애니메이션이 상세 페이지 로딩을 기다리며 끊기는 것을 막기 위함.
export const warmFeedDetail = (queryClient: QueryClient, teamId: number | null, feedId: string) => {
  if (!teamId) return;

  const numericFeedId = Number(feedId);
  if (!Number.isInteger(numericFeedId) || numericFeedId <= 0) return;

  void queryClient.prefetchQuery(feedDetailQueryOptions(teamId, numericFeedId));
};
