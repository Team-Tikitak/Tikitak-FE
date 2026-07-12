import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { feedKeys } from '@/shared/api/feed/keys';
import { useFeedDetail } from './useFeedDetail';
import type { ReactNode } from 'react';

const navigateMock = vi.fn();
const openConfirmDialogMock = vi.fn();
let feedIdParam: string | undefined = '7';
let activeTeamId = 17;
let feedDeleting = false;
let detailResult: { data: unknown; error: unknown } = { data: undefined, error: null };

const notFoundError = () =>
  Object.assign(new AxiosError('Not found'), { response: { status: 404 } });

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ feedId: feedIdParam }),
}));
vi.mock('@/shared/hooks/team/useActiveTeamId', () => ({
  useActiveTeamId: () => activeTeamId,
}));
vi.mock('@/shared/api/feed/queries', () => ({
  useGetFeedDetail: () => detailResult,
}));
vi.mock('@/shared/lib/storage/deleteContextStorage', () => ({
  isFeedDeleting: () => feedDeleting,
}));
vi.mock('@/shared/ui/ConfirmDialog/openConfirmDialog', () => ({
  openConfirmDialog: (...args: unknown[]) => openConfirmDialogMock(...args),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFeedDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    feedIdParam = '7';
    activeTeamId = 17;
    feedDeleting = false;
    detailResult = { data: undefined, error: null };
  });

  it('404 에러면 안내 다이얼로그를 띄우고 캐시를 지운 뒤 피드 목록으로 replace 이동한다', () => {
    detailResult = { data: undefined, error: notFoundError() };
    const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');

    renderHook(() => useFeedDetail(), { wrapper });

    expect(openConfirmDialogMock).toHaveBeenCalledTimes(1);
    expect(openConfirmDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ showCancel: false }),
    );
    expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: feedKeys.detail(17, 7) });
    expect(navigateMock).toHaveBeenCalledWith(PATHS.FEED, { replace: true });
  });

  it('캐시에 남은 404와 재검증 404로 에러가 두 번 갱신돼도 다이얼로그는 한 번만 띄운다', () => {
    detailResult = { data: undefined, error: notFoundError() };

    const { rerender } = renderHook(() => useFeedDetail(), { wrapper });
    detailResult = { data: undefined, error: notFoundError() };
    rerender();

    expect(openConfirmDialogMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
  });

  it('본인 삭제 직후의 404는 안내하지 않는다', () => {
    feedDeleting = true;
    detailResult = { data: undefined, error: notFoundError() };

    renderHook(() => useFeedDetail(), { wrapper });

    expect(openConfirmDialogMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('404가 아닌 에러는 안내하지 않는다', () => {
    detailResult = {
      data: undefined,
      error: Object.assign(new AxiosError('Server error'), { response: { status: 500 } }),
    };

    renderHook(() => useFeedDetail(), { wrapper });

    expect(openConfirmDialogMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('정상 응답이면 피드 정보를 반환한다', () => {
    detailResult = {
      data: { place: { name: '망원 한강공원' }, isMine: true, type: 'DAILY_QUESTION' },
      error: null,
    };

    const { result } = renderHook(() => useFeedDetail(), { wrapper });

    expect(result.current).toMatchObject({
      teamId: 17,
      feedIdNum: 7,
      placeName: '망원 한강공원',
      isMine: true,
      feedType: 'DAILY_QUESTION',
    });
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
  });
});
