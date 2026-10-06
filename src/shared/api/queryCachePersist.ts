import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from '@tanstack/react-query-persist-client';
import { homeKeys } from './home/keys';
import { userKeys } from './user/keys';
import type { Query, QueryClient } from '@tanstack/react-query';

const QUERY_CACHE_STORAGE_KEY = 'tikitak-query-cache';
const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
// 웹은 원격 배포라 네이티브 앱 버전이 아닌 빌드 ID로 구분한다. 배포마다 캐시가 폐기된다.
const QUERY_CACHE_BUSTER = __BUILD_ID__;

// 읽기 위주 + 계정 식별 불필요한 쿼리만 저장한다. 세션(authKeys)은 부트 흐름이라 제외.
// 팀 상세는 강퇴·권한 변경이 오래된 값으로 보일 수 있어 제외.
const PERSISTED_KEY_PREFIXES: readonly (readonly unknown[])[] = [
  userKeys.me(),
  userKeys.agreements(),
  homeKeys.all,
];

export const shouldPersistQuery = (queryKey: readonly unknown[]) =>
  PERSISTED_KEY_PREFIXES.some((prefix) => prefix.every((part, index) => queryKey[index] === part));

const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const persister = createSyncStoragePersister({
  storage: getStorage(),
  key: QUERY_CACHE_STORAGE_KEY,
});

// 첫 loader가 돌기 전에 복원이 끝나야 하므로 렌더 전에 await 한다.
export const restoreQueryCache = (queryClient: QueryClient) => {
  // 복원된 쿼리는 관찰자가 없으면 gcTime(10분) 뒤 메모리·저장소에서 사라지므로 maxAge 이상으로 늘린다.
  PERSISTED_KEY_PREFIXES.forEach((queryKey) =>
    queryClient.setQueryDefaults(queryKey, { gcTime: QUERY_CACHE_MAX_AGE_MS }),
  );

  return persistQueryClientRestore({
    queryClient,
    persister,
    maxAge: QUERY_CACHE_MAX_AGE_MS,
    buster: QUERY_CACHE_BUSTER,
  }).catch(() => undefined);
};

// 복원 전에 구독하면 빈 캐시가 저장소를 덮어쓰므로 restoreQueryCache 이후에 호출한다.
export const startQueryCachePersist = (queryClient: QueryClient) =>
  persistQueryClientSubscribe({
    queryClient,
    persister,
    buster: QUERY_CACHE_BUSTER,
    dehydrateOptions: {
      shouldDehydrateQuery: (query: Query) =>
        query.state.status === 'success' && shouldPersistQuery(query.queryKey),
    },
  });

// 로그아웃·탈퇴·로그인·세션 만료 시 이전 계정 데이터가 남지 않게 한다.
// persister는 1초 throttle이라 저장소만 지우면 대기 중인 쓰기가 옛 스냅샷을 다시 쓴다.
// queryClient를 주면 영속 대상을 메모리에서도 먼저 지워 이후 스냅샷에 남지 않게 한다.
export const clearPersistedQueryCache = (queryClient?: QueryClient) => {
  PERSISTED_KEY_PREFIXES.forEach((queryKey) => queryClient?.removeQueries({ queryKey }));
  persister.removeClient();
};
