import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/error';
import type * as InstanceModule from '@/shared/api/instance';
import { startQueryCachePersist } from '@/shared/api/queryCachePersist';
import { userKeys } from '@/shared/api/user/keys';

const STORAGE_KEY = 'tikitak-query-cache';

const { refreshAccessTokenMock, testQueryClient } = vi.hoisted(() => ({
  refreshAccessTokenMock: vi.fn(),
  testQueryClient: { current: null as unknown as QueryClient },
}));

vi.mock('@/app/providers/queryClient', () => ({
  get queryClient() {
    return testQueryClient.current;
  },
}));
vi.mock('@/shared/api/instance', async () => ({
  ...(await vi.importActual<typeof InstanceModule>('@/shared/api/instance')),
  refreshAccessToken: refreshAccessTokenMock,
}));

const { authCallbackLoader } = await import('./auth');
const { setupFlowLoader } = await import('./setupFlow');
const { ensureAuthenticatedForLoader } = await import('./shared');
const { useAuthStore } = await import('@/shared/stores/authStore');

// 구독을 해제하지 않으면 이전 테스트 클라이언트의 gc 이벤트가 전역 throttle을 다시 예약해 다음 테스트를 오염시킨다
const stopPersisting: Array<() => void> = [];

const seedPersistedCache = () => {
  stopPersisting.push(startQueryCachePersist(testQueryClient.current));
  testQueryClient.current.setQueryData(userKeys.me(), { memberId: 1 });
  vi.advanceTimersByTime(1000);
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"me"');
};

// persister는 1초 throttle이라 대기 중인 쓰기까지 흘려보낸 뒤 확인한다
const expectNoPersistedAccountData = () => {
  vi.advanceTimersByTime(2000);
  const raw = localStorage.getItem(STORAGE_KEY);
  const queries = raw ? JSON.parse(raw).clientState.queries : [];
  expect(queries).toEqual([]);
  expect(testQueryClient.current.getQueryData(userKeys.me())).toBeUndefined();
};

describe('세션 경계에서 이전 계정의 영속 캐시를 비운다', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAccessToken();
    testQueryClient.current = new QueryClient();
    refreshAccessTokenMock.mockReset();
    vi.useFakeTimers();
  });
  afterEach(() => {
    stopPersisting.splice(0).forEach((stop) => stop());
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('OAuth 콜백으로 새 로그인할 때 비운다', () => {
    seedPersistedCache();

    authCallbackLoader({
      request: new Request('http://localhost/auth/callback?accessToken=new-token'),
    } as Parameters<typeof authCallbackLoader>[0]);

    expectNoPersistedAccountData();
  });

  it('보호 라우트에서 세션 복구가 4xx로 실패하면 비운다', async () => {
    seedPersistedCache();
    refreshAccessTokenMock.mockRejectedValue(new ApiError({ status: 401 }));

    await expect(ensureAuthenticatedForLoader()).rejects.toBeInstanceOf(Response);

    expectNoPersistedAccountData();
  });

  it('진입 loader에서 세션 복구가 4xx로 실패하면 비운다', async () => {
    seedPersistedCache();
    refreshAccessTokenMock.mockRejectedValue(new ApiError({ status: 400 }));

    await setupFlowLoader({
      request: new Request('http://localhost/'),
    } as Parameters<typeof setupFlowLoader>[0]);

    expectNoPersistedAccountData();
  });

  it('세션 복구가 5xx로 실패하면 캐시를 유지한다(일시 장애로 비우지 않는다)', async () => {
    seedPersistedCache();
    refreshAccessTokenMock.mockRejectedValue(new ApiError({ status: 503 }));

    await expect(ensureAuthenticatedForLoader()).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem(STORAGE_KEY)).toContain('"me"');
  });
});
