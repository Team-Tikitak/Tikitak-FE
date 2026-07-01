import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postFeed } from './api';
import { feedKeys } from './keys';
import { useCreateFeed } from './queries';
import { mapKeys } from '../map/keys';
import type { ReactNode } from 'react';

vi.mock('./api', () => ({
  postFeed: vi.fn(),
  getFeeds: vi.fn(),
  getFeedDetail: vi.fn(),
  deleteFeed: vi.fn(),
  patchFeed: vi.fn(),
}));

describe('useCreateFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(postFeed).mockResolvedValue({
      data: {
        success: true,
        status: 200,
        timestamp: '2026-07-01T00:00:00.000Z',
        data: {
          feedId: 1,
          type: 'GENERAL',
          content: 'hello',
          thumbnailImageUrl: '',
          imageCount: 1,
          place: null,
          question: null,
          taggedMembers: [],
          createdAt: '2026-07-01T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    } as unknown as Awaited<ReturnType<typeof postFeed>>);
  });

  it('생성 성공 후 리스트 refetch를 기다리지 않고 캐시를 무효화한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateFeed(1), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        content: 'hello',
        mediaPublicIds: ['media-1'],
        place: null,
        taggedTeamMemberIds: [],
      });
    });

    expect(refetchSpy).not.toHaveBeenCalledWith({ queryKey: feedKeys.list(1), type: 'all' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: feedKeys.list(1) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: mapKeys.pins(1) });
  });
});
