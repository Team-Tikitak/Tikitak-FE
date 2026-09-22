# 라우트 Loader 패턴

## 결정

- 상태: accepted
- 기록일: 2026-09-23

흐름 분기·진입 전 데이터 fetch는 **react-router v7의 loader**로, 토큰 보호 같은 단순 게이트는 **컴포넌트 가드**로 처리.

## Loader vs 컴포넌트 가드

- 상태: accepted
- 기록일: 2026-09-23

| 항목      | Loader                        | 컴포넌트 가드                      |
| --------- | ----------------------------- | ---------------------------------- |
| 실행 시점 | element 렌더 **전**           | element 마운트 **중**              |
| 출력      | `redirect()` / data / `throw` | JSX (`<Navigate />`, `<Outlet />`) |
| 비동기    | 라우터가 await                | useEffect + useState 필요          |
| 깜빡임    | 0                             | 마운트 1프레임 발생                |
| 테스트    | 순수 함수                     | 컴포넌트 렌더 + 모킹               |
| 접근 가능 | `request`, `params`           | React hooks                        |

## Tikitak 사용처

- 상태: accepted
- 기록일: 2026-09-23

- **`setupFlowLoader`** (loader) — `useMe` 데이터 기반 흐름 분기. 약관/온보딩 미완료 사용자를 자동 이동.
- **`authCallbackLoader`** (loader) — URL params에서 access token 추출, 저장, redirect.
- **`ProtectedRoute`** (컴포넌트) — `accessToken` 존재 확인. zustand·useQuery 결합이 필요해서 컴포넌트로 유지.

## 거부된 대안

- 상태: rejected
- 기록일: 2026-09-23

- **모든 가드를 컴포넌트로** — splash → terms 라우트 진입 시 한 프레임 깜빡임 발생. 사용자가 잘못된 페이지를 잠깐 보는 UX 회귀.
- **모든 가드를 loader로** — `ProtectedRoute`까지 옮기려면 zustand·React Query 결합부 다시 짜야 함. 비용 크고 이득 작음.

## Loader 작성 패턴

- 상태: accepted
- 기록일: 2026-09-23

```ts
export const someLoader = async ({ request }: LoaderFunctionArgs) => {
  const data = await queryClient.fetchQuery({
    queryKey: someKeys.x(),
    queryFn: () => fetchSomething(),
  });
  const url = new URL(request.url);
  if (조건) return redirect('/elsewhere');
  return null;
};
```

- `queryClient.fetchQuery`로 React Query 캐시와 공유 (이중 fetch 방지)
- redirect 반환 시 element 렌더 안 됨
- null 또는 data 반환 시 element 렌더 + `useLoaderData()` 접근 가능

## Loader 파일 위치

- 상태: accepted
- 기록일: 2026-09-23

`app/routes/loaders.ts`에 통합. 라우트 정의(`router.tsx`)에서 import.

## React-refresh 룰 주의

- 상태: accepted
- 기록일: 2026-09-23

loader 파일이 컴포넌트 함께 export하면 `react-refresh/only-export-components` 경고. HMR 성능 영향. **loader 전용 파일은 컴포넌트 export 금지**, 인스턴스(`queryClient` 등)도 별도 파일로 분리.

예: `queryClient.ts` 분리 (QueryProviders.tsx에서 export하면 워닝).
