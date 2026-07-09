import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { getFeedDetail } from '@/shared/api/feed/api';
import { feedKeys } from '@/shared/api/feed/keys';
import { feedDetailQueryOptions } from '@/shared/api/feed/queries';
import { warmFeedDetail } from './warmFeedDetail';

vi.mock('@/shared/api/feed/api', () => ({
  getFeedDetail: vi.fn(),
}));

describe('warmFeedDetail', () => {
  it('로더가 읽는 것과 동일한 query key로 상세 데이터를 미리 캐시한다', async () => {
    const queryClient = new QueryClient();
    vi.mocked(getFeedDetail).mockResolvedValue({
      data: { data: { feedId: 42 } },
    } as Awaited<ReturnType<typeof getFeedDetail>>);

    warmFeedDetail(queryClient, 1, '42');
    await vi.waitFor(() => {
      expect(queryClient.getQueryState(feedKeys.detail(1, 42))?.status).toBe('success');
    });

    // 로더가 실제로 부르는 것과 동일한 옵션이므로, 이미 캐시된 값을 네트워크 재호출 없이 즉시 돌려준다
    const cached = await queryClient.ensureQueryData(feedDetailQueryOptions(1, 42));
    expect(cached).toEqual({ feedId: 42 });
    expect(getFeedDetail).toHaveBeenCalledTimes(1);
  });

  it('teamId가 없으면 프리페치하지 않는다', () => {
    const queryClient = new QueryClient();
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');

    warmFeedDetail(queryClient, null, '42');

    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it('유효하지 않은 feedId면 프리페치하지 않는다', () => {
    const queryClient = new QueryClient();
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');

    warmFeedDetail(queryClient, 1, 'not-a-number');

    expect(prefetchSpy).not.toHaveBeenCalled();
  });
});
