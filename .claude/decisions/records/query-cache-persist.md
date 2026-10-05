# 쿼리 캐시 영속화

TanStack Query 캐시를 localStorage에 일부 저장해 앱 콜드 스타트 지연을 줄이는 결정을 모아둔 문서.

## 쿼리 캐시를 allowlist 방식으로 localStorage에 영속화

- 상태: accepted
- 기록일: 2026-10-05

**결정**: `me`, `agreements`, 홈 쿼리만 localStorage에 저장하고, 앱 시작 시 렌더 전에 복원한다. 구현은 `src/shared/api/queryCachePersist.ts`, 복원·구독은 `src/main.tsx`.

**근거**:

- 콜드 스타트에서 `setupFlowLoader`는 `me`·`agreements`를 **await** 한다. 라우트 진입이 이 네트워크 왕복에 막힌다. 캐시를 복원하면 이 대기를 건너뛴다.
- 세션 복구(refresh token → access token)는 영속화 대상이 아니다. 부트 흐름의 핵심이라 건드리면 스플래시 멈춤·깜빡임 회귀 위험이 커서 제외했다.
- 저장 대상은 읽기 위주이고 계정 식별이 필요 없는 쿼리로 제한한다(`shouldPersistQuery`). 세션, 팀 목록·멤버·상세, 피드는 저장하지 않는다.
- 팀 상세는 처음엔 포함했으나 뺐다. 강퇴·권한 변경이 최대 24시간 오래된 값으로 보일 수 있는 반면, 콜드 스타트 경로(홈 진입)에서 얻는 이득은 작다.
- `maxAge`는 24시간. 오래된 정보가 계속 보이는 것을 막는다.
- 앱은 번들이 기기 안에 있지 않고 `server.url`(원격 웹)을 로드한다. 영속화 코드는 웹 배포 즉시 모든 앱 버전에 적용된다(`capacitor-bundling-strategy.md` 참고).

## 복원은 렌더 전에 await, Provider 방식은 쓰지 않음

- 상태: accepted
- 기록일: 2026-10-05

**결정**: `PersistQueryClientProvider` 대신 `main.tsx`에서 `restoreQueryCache` → `startQueryCachePersist` 순서로 호출한 뒤 렌더한다.

**근거**:

- loader는 `RouterProvider` 마운트 직후 실행되고 Provider의 복원은 비동기 효과라, loader가 빈 캐시를 보고 네트워크로 가는 경쟁이 생긴다. 렌더 전에 복원을 끝내면 이 경쟁이 없다.
- 복원 전에 구독하면 빈 캐시가 저장소를 덮어쓴다. 그래서 반드시 복원 이후에 구독한다.
- 앱 업데이트가 필요한 경우(강제 업데이트 화면)에는 복원하지 않는다.
- 복원이 실패(손상된 JSON, buster 불일치 등)해도 부트는 멈추지 않는다. 호출부가 오류를 삼키고 빈 캐시로 시작한다.

## 영속 대상 쿼리의 gcTime을 maxAge까지 늘림

- 상태: accepted
- 기록일: 2026-10-05

**문제**: 전역 `gcTime`이 10분이라, 복원된 쿼리는 관찰자(컴포넌트)가 없으면 10분 뒤 메모리에서 지워지고 그 변경이 저장소에도 반영된다. loader만 읽는 `agreements` 같은 쿼리는 앱을 10분 쓰면 영속 캐시에서 사라져 효과가 없었다.

**해결**: `restoreQueryCache`가 영속 대상 key prefix에 `setQueryDefaults({ gcTime: maxAge })`를 건다. 전역 `gcTime`은 그대로 둬서 다른 쿼리의 메모리 사용은 늘지 않는다.

## loader는 복원된 캐시를 즉시 쓰되, 미완료 상태는 최신 값으로 재판단

- 상태: accepted
- 기록일: 2026-10-05

**결정**: `ensureMe`와 `setupFlowLoader`의 `agreements`는 `ensureQueryData` + `revalidateIfStale: true`로 캐시를 즉시 쓰고 stale이면 백그라운드에서 갱신한다. 단, 약관·온보딩 중 하나라도 미완료로 보이면 `fetchQuery`로 최신 값을 다시 받아 판단한다. 정확한 값이 필요한 `inviteAcceptLoader`는 `fetchQuery`를 유지한다.

**근거**:

- 기존 `fetchQuery`는 `staleTime`(5분)이 지난 캐시를 다시 요청하며 기다린다. 콜드 스타트의 복원 캐시는 대부분 5분이 지나 있어서 영속화만으로는 효과가 없다.
- `ensureQueryData`는 캐시가 있으면 stale 여부와 무관하게 즉시 반환한다. `revalidateIfStale`을 함께 줘야 stale 캐시가 백그라운드에서 갱신된다.
- 약관·온보딩 완료는 되돌아가지 않는 값이라 "완료"인 복원값은 믿어도 된다. 반대로 "미완료"인 복원값은 다른 기기에서 이미 완료됐을 수 있어 `/terms`·`/onboarding`으로 잘못 보낼 수 있으므로 최신 값으로 다시 판단한다.

**⚠️ 주의**: `me.activeTeamId`는 다른 기기에서 바뀌었을 수 있다. 피드 loader(`ensureActiveTeamId`)가 한 번은 이전 팀으로 동작할 수 있고, 백그라운드 갱신이 캐시를 고쳐도 그 loader 결과는 되돌리지 않는다. 앱 내 팀 전환은 `setQueryData`로 캐시를 갱신하므로 영향이 없고, 다른 기기에서 전환한 경우에만 해당해 허용했다.

## 세션이 시작·끝나는 모든 지점에서 영속 캐시를 비움

- 상태: accepted
- 기록일: 2026-10-05

**결정**: 아래 지점에서 `clearPersistedQueryCache`를 호출한다. `queryClient`를 넘길 수 있는 곳은 영속 대상을 메모리에서도 지운다.

| 지점                                                                 | 이유                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| 로그아웃 `useLogout`, 탈퇴 `useDeleteMe`                             | 세션 종료                                                |
| 세션 만료 `instance.ts` refresh 실패 분기                            | 세션 종료 (React 밖이라 저장소만 삭제, 이후 전체 리로드) |
| 로그인 코드 교환 `useLoginCodeExchange`                              | 새 세션 시작                                             |
| OAuth 콜백 `authCallbackLoader`                                      | 새 세션 시작                                             |
| 세션 복구 4xx 실패 `ensureAuthenticatedForLoader`, `setupFlowLoader` | 세션 없음 → 남은 캐시는 이전 계정 것                     |

**불변식**: 세션이 시작되는 경로는 `setAccessToken` 호출처(코드 교환, OAuth 콜백, refresh)뿐이고, 새 로그인 두 곳은 시작 전에 비운다. refresh는 같은 계정의 복구다. 그래서 다른 계정의 세션이 이전 계정의 영속 캐시를 읽을 수 없다. 새 로그인 경로를 추가하면 반드시 비우기를 같이 넣는다(테스트: `loaderCacheClear.test.ts`).

**근거**:

- `me`에 이름·이메일이 들어 있어 다음 계정에 이전 사용자 데이터가 복원되면 안 된다.
- 로그아웃 경로 하나만 믿으면 앱 강제 종료, 세션 만료 후 재로그인, OAuth 콜백 같은 경로가 구멍이 된다. 세션이 "끝나는" 지점과 "시작되는" 지점을 둘 다 막아 한쪽이 실패해도 다른 쪽이 막는다.
- persister는 1초 throttle이고 발화 시점에 마지막 이벤트의 스냅샷을 쓴다. 저장소만 `removeClient()`하면 대기 중인 쓰기나 메모리에 남은 영속 대상 쿼리가 곧바로 다시 기록한다. 메모리를 먼저 지우면 이후 스냅샷에 영속 대상이 없어 이 경합이 사라진다(테스트로 고정).
- 5xx·네트워크 오류로 세션 복구가 실패한 경우는 비우지 않는다. 일시 장애로 캐시를 잃으면 영속화 이득이 사라진다.

**⚠️ 주의**:

- 토큰은 캐시에 없고 네이티브 보안 저장소(`refreshTokenStorage`)에 따로 있다. 다만 `me`를 영속화하면 PII(이름·이메일)가 localStorage에 남는다. 원치 않으면 allowlist에서 `userKeys.me()`만 빼면 되지만 콜드 스타트 효과가 줄어든다.
- 같은 오리진의 브라우저 탭이 둘 이상인 웹(PWA)에서는 한 탭이 로그아웃해도 다른 탭의 메모리 캐시가 저장소에 다시 쓸 수 있다. 네이티브 앱은 WebView 하나라 해당 없고, 웹은 별도로 확인하지 않았다.

## buster는 빌드 ID

- 상태: accepted
- 기록일: 2026-10-05

**결정**: `buster`에 vite `define`으로 주입한 `__BUILD_ID__`(빌드 시각)를 쓴다. `vite.config.ts`와 `vitest.config.ts` 양쪽에 정의가 필요하다.

**근거**:

- 웹이 원격 배포라 네이티브 앱 버전은 웹 배포 변경을 반영하지 못한다.
- 수동 상수는 올리는 것을 잊으면 구조가 바뀐 옛 캐시가 복원된다. 빌드마다 자동으로 바뀌면 이 실수가 없다.
- 대가: 웹 배포마다 모든 사용자의 영속 캐시가 한 번 비워진다. 배포 직후 첫 실행은 영속화 이득이 없다. 같은 커밋도 빌드마다 값이 달라지지만(재현 가능한 빌드 아님) 캐시 폐기 용도로는 문제없어 허용했다.

## 거부된 대안

- 상태: rejected
- 기록일: 2026-10-05

- **`PersistQueryClientProvider`** — loader와의 복원 경쟁(위 참고).
- **전체 캐시 영속화** — 세션·피드·멤버까지 저장하면 부트 흐름 회귀 위험과 계정 간 데이터 노출 위험이 커진다.
- **네이티브 앱 버전을 buster로** — 웹 배포 단위의 구조 변경을 못 잡는다.
- **수동 buster 상수** — 갱신을 잊는 실수 가능성.
- **전역 `gcTime`을 24시간으로 상향** — 영속과 무관한 쿼리까지 메모리에 오래 남는다. 영속 대상 prefix에만 적용한다.
- **복원된 `me`를 항상 신뢰** — 미완료 상태가 오래된 값이면 사용자를 잘못된 화면으로 보낸다.

## TanStack 패키지 3종을 5.96.2로 함께 고정

- 상태: accepted
- 기록일: 2026-10-05

**결정**: `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/query-sync-storage-persister`를 모두 `5.96.2` 정확한 버전으로 고정한다.

**근거**:

- 세 패키지의 `@tanstack/query-core` 버전이 다르면 core가 둘로 갈라져 `QueryClient`·`Query` 타입이 호환되지 않는다(`#private` 오류).
- 처음에는 persist 두 개만 고정하고 `react-query`는 `^5.96.2`로 뒀다. 로컬(Yarn 4, lockfile 존중)에서는 문제가 없었지만 Vercel 빌드에서 실패했다. Vercel이 Yarn 1.22(classic)로 설치하면서 Yarn 4의 `yarn.lock`을 읽지 못하고 범위를 새로 해석해, `react-query`만 5.104.x로 올라갔기 때문이다.
- 세 개 모두 정확한 버전이면 어떤 패키지 매니저로 설치해도 core가 하나로 맞는다. Yarn classic으로 재현해 확인했다.

**후속**: 올릴 때는 세 패키지를 같은 버전으로 함께 올린다. 설치 후 `@tanstack/query-core`가 하나인지 확인한다(`find node_modules -path '*@tanstack/query-core/package.json'`).

**⚠️ 주의**: Vercel이 Yarn 4 lockfile을 무시하는 것은 이 작업과 무관한 기존 설정이다. 다른 의존성도 범위(`^`)대로 최신으로 해석되므로 로컬과 배포 결과가 어긋날 수 있다. 근본 해결은 Vercel에서 Corepack을 켜는 것(`ENABLE_EXPERIMENTAL_COREPACK=1`)이며, 별도로 결정한다.

## 미확인 사항

- 상태: proposed
- 기록일: 2026-10-05

> **구현 상태 (2026-10-05 확인): 구현됨. 실기기 측정 미실시.**

복원 전후 콜드 스타트 시간은 실기기에서 측정하지 않았다. 효과 검증은 후속 과제다. 또한 PWA(웹) 서비스 워커에 구 번들이 남은 상태에서 신구 번들이 같은 localStorage 키를 두고 `buster`를 번갈아 덮어쓰는 경우는 확인하지 않았다(네이티브 앱은 원격 로드라 해당 없음).
