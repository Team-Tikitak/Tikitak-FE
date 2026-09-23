# API 폴더 구조 및 Query 패턴

## 도메인 분리 — auth / user

- 상태: accepted
- 기록일: 2026-09-23

**결정**: 인증 흐름과 사용자 식별 데이터를 별개 도메인으로 분리.

```
src/shared/api/
├── auth/        — OAuth 진입, 로그아웃, refresh (세션 생명주기)
│   ├── api.ts        getStartOAuthLogin, postLogout, postRefreshToken
│   ├── endpoints.ts  AUTH_ENDPOINTS
│   ├── keys.ts       authKeys: { all, session }
│   ├── queries.ts    useLogout (useAuthInit는 loader로 이전됨)
│   └── types.ts      OAuthProvider
├── user/        — 사용자 데이터 (식별·프로필)
│   ├── api.ts        getMe
│   ├── endpoints.ts  USER_ENDPOINTS
│   ├── keys.ts       userKeys: { all, me }
│   ├── queries.ts    useMe
│   └── types.ts      MeResponse, SocialProvider, MemberStatus
└── instance.ts  — axios + 401 인터셉터 + refresh 큐
```

**근거**:

- `/me`는 의미상 사용자 프로필이지 인증 세션이 아님 — auth/에 두면 키 네임스페이스(`authKeys.user()`) 혼란
- 로그아웃 시 양쪽 캐시 비우기가 명시적 (`removeQueries(authKeys.all)` + `removeQueries(userKeys.all)`)
- 도메인이 늘면 비슷한 구조(`feed/`, `team/`)로 확장

## 계층 Query Key Factory

- 상태: accepted
- 기록일: 2026-09-23

```ts
export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};
```

**규칙** (이미 [data-fetching.md](../../rules/data-fetching.md)에 명시):

- 도메인 루트 키(`all`)는 배열 const, `as const`로 좁힘
- 세부 키는 함수 형태, 인자 없어도 함수 호출 형식 유지
- 인자 있는 디테일은 `detail(id)` 식으로 점진 확장

## Endpoints 상수화

- 상태: accepted
- 기록일: 2026-09-23

도메인별 `endpoints.ts`에 경로 상수 보관. 4개 이상 모이면 분리, 그 이하면 인라인 OK.

```ts
export const AUTH_ENDPOINTS = {
  OAUTH_START: (provider: string) => `/api/v1/auth/oauth/${provider}/start`,
  OAUTH_PREFIX: '/api/v1/auth/oauth/',
  TOKEN_REFRESH: '/api/v1/auth/token/refresh',
  LOGOUT: '/api/v1/auth/logout',
} as const;
```

`instance.ts`의 `AUTH_EXCLUDED_PATHS`도 동일 상수 참조 → 백엔드 경로 변경 시 한 곳만 수정.

## 응답 envelope — `ApiResponse<T>`

- 상태: accepted
- 기록일: 2026-09-23

타입 자체는 여전히 유효. 아래 "응답 envelope 검증과 요청 결과 정규화 (2026-08)"가 대체하는
것은 이 절 마지막 문장의 "호출자가 `.data.data`로 unwrap" 관행뿐이다.

```ts
export type ApiResponse<T> = {
  success: boolean;
  status: number;
  data: T;
  timestamp: string;
};
```

스웨거 응답 형태(`status: 0` number)에 맞춤. 도메인 API 함수는 `instance.get<ApiResponse<X>>(...)`로 감싸고, 호출자가 `.data.data`로 unwrap.

## `toQueryString` 유틸 추가

- 상태: accepted
- 기록일: 2026-09-23

`shared/lib/toQueryString.ts` — 객체를 URL 쿼리 문자열로 변환. 향후 list API(`feed`, `place`, `team` 등) 추가 시 매 API 함수마다 `URLSearchParams` 직접 다루는 보일러플레이트를 차단하려고 미리 도입.

```ts
toQueryString({ region: 'seoul', cursor: null, tags: ['food', 'cafe'] });
// → "?region=seoul&tags=food&tags=cafe" (null 자동 스킵, 배열 같은 키 반복)
```

**현 시점 사용처 없음** — 다음 도메인 API 추가될 때 함께 적용. 결정 이유:

- list API는 거의 항상 query params 사용 → 공용 헬퍼가 필연적
- 도메인별 API 함수가 늘기 전 합의된 시그니처로 박아두는 게 일관성 유리
- `null`/`undefined`로 들어온 값은 자동 스킵 — optional 파라미터를 매번 if 분기로 거르는 보일러플레이트 제거
- 배열은 같은 키로 반복(`?tags=a&tags=b`) — 백엔드의 `List<String>` 파라미터에 직접 대응

## Orval 도입 — 보류

- 상태: rejected
- 기록일: 2026-09-23

OpenAPI 스펙 기반 자동 생성 도구. Tikitak 현재 규모(엔드포인트 ~5개)엔 과함. 도입 시 단점:

- 자동 훅 이름(`useGetApiV1AdminSummary` 등)이 도메인 언어 X
- 2000+ 줄 보일러플레이트 → 코드 리뷰·IDE 성능 저하
- 커스텀 컨벤션(query factory, 인터셉터) 무력화

**도입 검토 시점**: 도메인 10~15개, 백엔드 변경 빈도 높을 때. 그 전엔 수동 + 타입만 자동(`openapi-typescript`)도 고려 가능.

## Zod 런타임 검증 — 보류

- 상태: rejected
- 기록일: 2026-09-23

이론적으론 백엔드 드리프트·env별 차이 방어용. 현실엔 Tikitak 규모에서 ROI 작음. 결제·인증 등 크리티컬 경계만 필요 시 부분 도입.

## 응답 envelope 검증과 요청 결과 정규화 (2026-08)

- 상태: accepted
- 기록일: 2026-08

**결정**: `instance`의 성공 응답 인터셉터에서 envelope의 `success === false`를 실패로 전환하고,
모든 API 실패를 `ApiError` 또는 `NetworkError`로 정규화한다. HTTP 상태가 2xx여도 `success: false`면
성공으로 취급하지 않는다.

```ts
export class ApiError extends Error {
  status: number;
  code?: string;
}

export class NetworkError extends Error {}
```

- `ApiError`: 응답을 받은 실패. HTTP 4xx/5xx와 `success: false` 응답을 포함한다.
- `NetworkError`: 타임아웃, 연결 실패처럼 응답을 받지 못한 실패다.
- `message`와 `code`는 백엔드 응답에 있을 때만 사용한다. 사용자 노출 문구는
  [error-handling.md](./error-handling.md)의 기존 FE 하드코딩 정책을 유지한다.
- 기존 401 재발급 큐잉은 먼저 유지·검증한다. 에러 정규화는 재발급 재시도와 로그아웃 판단이 끝난
  뒤 최종 호출자에게 전달되는 오류에만 적용한다.

**근거**:

- 현재 `ApiResponse<T>`는 `success`를 선언하지만 [`unwrap`](../../src/shared/api/request.ts)는 이를
  검증하지 않아 HTTP 200 비즈니스 실패를 정상 데이터처럼 반환할 수 있다.
- API 오류와 연결 오류는 재시도 가능성 및 진단 정보가 다르다. 오류 종류를 공통 타입으로 보존하면
  화면별 에러 처리와 로그 수집이 axios의 원본 오류 구조에 의존하지 않는다.
- PromSearch-FE의 envelope 검증·`ApiError`, Bookscape-Front의 HTTP/네트워크 오류 분리,
  muneo의 실패 결과 정규화에서 공통으로 확인된 이점이다.

### 요청 헬퍼 규약

**결정**: query/mutation에서 axios 응답을 직접 언랩하지 않는다. 현재 `unwrap`을 아래 의미가 드러나는
헬퍼로 정리한다.

```ts
requestResult<T>(() => instance.get<ApiResponse<T>>(...)); // T 반환
requestVoid(() => instance.delete<ApiResponse<null>>(...)); // void 반환
```

- API 도메인 함수는 계속 `AxiosResponse<ApiResponse<T>>`를 반환한다. CSRF, 인증 헤더, 401 재시도는
  `instance`의 기존 책임으로 남긴다.
- query/mutation은 데이터가 필요한 경우 `requestResult`, 본문이 의미 없는 성공 응답은 `requestVoid`를
  사용한다.
- `.then((res) => res.data.data)`와 도메인별 수동 언랩은 제거한다.
- `api.get/post/put/patch/delete`라는 두 번째 클라이언트 계층은 만들지 않는다. 이미 axios `instance`와
  도메인별 `api.ts`가 책임을 나누고 있어, 메서드 래퍼를 추가해도 CSRF·401 흐름을 복잡하게 만들 뿐이다.

**근거**:

- 티키탁은 이미 query 계층의 공통 `unwrap` 패턴을 사용한다. 이를 결과/void 의도로 분리하면 API 모듈의
  책임을 바꾸지 않고도 반복과 누락을 없앨 수 있다.
- 현재 일부 query가 `res.data.data`를 직접 접근해 규약을 우회한다. 공통 헬퍼 하나로 성공 검증과 타입
  언랩을 일관되게 적용할 수 있다.

### 리팩터링 범위와 완료 조건

1. `src/shared/api/error.ts`에 `ApiError`, `NetworkError`, axios/envelope 오류 변환 함수를 둔다.
2. `instance`와 `publicInstance`의 응답 흐름에 `success` 검증과 최종 오류 정규화를 추가한다.
3. `request.ts`를 `requestResult`/`requestVoid` 규약으로 교체하고, 모든 query/mutation의 수동 언랩을
   제거한다.
4. 기존 401 재발급 큐 테스트를 유지하면서 아래 회귀 테스트를 추가한다.
   - HTTP 200 + `success: false`가 `ApiError`가 되는지
   - HTTP 4xx/5xx가 `ApiError`가 되는지
   - 응답 없는 axios 오류가 `NetworkError`가 되는지
   - 동시 401 요청이 refresh 한 번만 수행하고 재시도되는지

완료 검증은 `yarn type-check`, `yarn test --run`, `yarn lint`, `yarn format:check`으로 한다.

### 이번 범위에서 제외

- **Web Locks 기반 탭 간 refresh 동기화**: refresh token 회전과 여러 웹 탭을 실제 지원해야 할 때
  `auth-flow.md`에서 별도 결정한다. 현재 큐는 한 탭 안의 동시 요청을 해결한다.
- **OpenAPI 코드·타입 생성**: 백엔드 스펙의 안정성, 생성물 소유 방식, CI 동기화까지 합의가 필요하다.
- **Zod 런타임 검증**: 핵심 경계에서 필요한지 별도로 판단한다.
- **access token persist**: 세션 복구·XSS 노출 범위가 달라지는 인증 정책이므로 API 리팩터링과 섞지 않는다.
