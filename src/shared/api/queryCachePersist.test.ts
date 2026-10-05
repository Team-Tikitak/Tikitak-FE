import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authKeys } from './auth/keys';
import { feedKeys } from './feed/keys';
import { homeKeys } from './home/keys';
import {
  clearPersistedQueryCache,
  restoreQueryCache,
  shouldPersistQuery,
  startQueryCachePersist,
} from './queryCachePersist';
import { teamKeys } from './team/keys';
import { userKeys } from './user/keys';

const STORAGE_KEY = 'tikitak-query-cache';

const readPersistedKeys = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw).clientState.queries.map((query: { queryKey: unknown[] }) =>
    query.queryKey.join('/'),
  );
};

describe('shouldPersistQuery', () => {
  it('me, agreements, 홈 쿼리는 저장한다', () => {
    expect(shouldPersistQuery(userKeys.me())).toBe(true);
    expect(shouldPersistQuery(userKeys.agreements())).toBe(true);
    expect(shouldPersistQuery(homeKeys.regions(1))).toBe(true);
  });

  it('세션·팀·피드 쿼리는 저장하지 않는다', () => {
    expect(shouldPersistQuery(authKeys.session())).toBe(false);
    expect(shouldPersistQuery(userKeys.teams())).toBe(false);
    expect(shouldPersistQuery(teamKeys.detail(1))).toBe(false);
    expect(shouldPersistQuery(teamKeys.members(1))).toBe(false);
    expect(shouldPersistQuery(feedKeys.all)).toBe(false);
  });
});

describe('영속 캐시 저장·복원·삭제', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('영속 대상만 저장한다', () => {
    const queryClient = new QueryClient();
    startQueryCachePersist(queryClient);
    queryClient.setQueryData(userKeys.me(), { memberId: 1 });
    queryClient.setQueryData(authKeys.session(), 'token');
    queryClient.setQueryData(teamKeys.detail(1), { teamId: 1 });
    vi.advanceTimersByTime(1000);

    expect(readPersistedKeys()).toEqual(['user/me']);
  });

  it('저장된 캐시를 새 QueryClient로 복원한다', async () => {
    const first = new QueryClient();
    startQueryCachePersist(first);
    first.setQueryData(userKeys.me(), { memberId: 1 });
    vi.advanceTimersByTime(1000);

    const second = new QueryClient();
    await restoreQueryCache(second);

    expect(second.getQueryData(userKeys.me())).toEqual({ memberId: 1 });
  });

  it('손상된 저장소여도 복원이 실패하지 않는다', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const queryClient = new QueryClient();

    await expect(restoreQueryCache(queryClient)).resolves.toBeUndefined();
    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined();
  });

  it('buster가 다른 캐시는 복원하지 않는다', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        buster: 'old-build',
        timestamp: Date.now(),
        clientState: {
          mutations: [],
          queries: [
            {
              queryKey: ['user', 'me'],
              queryHash: '["user","me"]',
              state: { data: { memberId: 1 }, status: 'success', dataUpdatedAt: Date.now() },
            },
          ],
        },
      }),
    );
    const queryClient = new QueryClient();

    await restoreQueryCache(queryClient);

    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined();
  });

  it('복원된 쿼리는 관찰자가 없어도 gcTime(기본 10분) 뒤 사라지지 않는다', async () => {
    const first = new QueryClient();
    startQueryCachePersist(first);
    first.setQueryData(userKeys.agreements(), { termsAgreed: true });
    vi.advanceTimersByTime(1000);

    const second = new QueryClient();
    await restoreQueryCache(second);
    vi.advanceTimersByTime(1000 * 60 * 60);

    expect(second.getQueryData(userKeys.agreements())).toEqual({ termsAgreed: true });
  });

  it('clear 후 대기 중인 throttle 쓰기가 이전 데이터를 다시 쓰지 않는다', () => {
    const queryClient = new QueryClient();
    startQueryCachePersist(queryClient);
    queryClient.setQueryData(userKeys.me(), { memberId: 1 });
    queryClient.setQueryData(homeKeys.regions(1), []);
    vi.advanceTimersByTime(1000);
    expect(readPersistedKeys()).toHaveLength(2);

    // throttle 대기 중에 로그아웃되는 상황
    queryClient.setQueryData(homeKeys.regions(2), []);
    clearPersistedQueryCache(queryClient);
    vi.advanceTimersByTime(2000);

    expect(readPersistedKeys()).toEqual([]);
    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined();
    expect(queryClient.getQueryData(homeKeys.regions(1))).toBeUndefined();
  });
});
