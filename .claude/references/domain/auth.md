# Domain: Auth

인증, 로그인, 약관 동의 흐름.

## 라우트

| 경로     | 페이지             |
| -------- | ------------------ |
| `/login` | `src/pages/login/` |
| `/terms` | `src/pages/terms/` |

`paths.ts`: `PATHS.LOGIN`, `PATHS.TERMS`.

## 핵심 타입

```ts
// src/pages/terms/model/types.ts
export type TermsState = { service: boolean; privacy: boolean };
export type TermsKey = keyof TermsState;
```

## API 위치

```
src/shared/api/auth/
├── api.ts      # API 호출 함수 (axios)
├── queries.ts  # useQuery / useMutation 훅
└── types.ts    # 요청·응답 타입
```

현재 `api.ts`, `queries.ts`는 스캐폴드만 존재. 실제 OAuth 엔드포인트 연동 미구현.

## 흐름

1. `/login` 진입 → 소셜 로그인 버튼
2. 신규 유저 → `/terms` 이동, 동의 필수 항목 체크 후 `/onboarding`
3. 기존 유저 → `/home`

## 작업 시 주의

- API 호출은 항상 `shared/api/auth/`의 함수를 통해 사용 (`data-fetching.md` 규칙).
- Query Key: `authKeys.all = ['auth']`, `authKeys.user()`, `authKeys.session()` 계층 유지.
- 로그인 성공 시 `queryClient.invalidateQueries({ queryKey: authKeys.all })`.
- `TermsState`의 키는 약관 추가 시 함께 늘림 — `Record<TermsKey, ...>` 사용 시 누락 키 차단.

## 미구현·TODO

- 실제 소셜 로그인 엔드포인트 연결
- 토큰 저장 전략 (Capacitor 웹뷰 고려 — localStorage vs SecureStorage)
- 토큰 만료·재발급 인터셉터
