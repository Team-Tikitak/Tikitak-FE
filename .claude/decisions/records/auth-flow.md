# 인증 흐름 (Auth Flow)

## Access Token — zustand 메모리만, localStorage 금지

- 상태: accepted
- 기록일: 2026-09-23

**결정**: access token은 zustand 메모리에만 보관. `persist` 미들웨어·sessionStorage·localStorage 일체 사용 X.

**근거**:

- 백엔드가 refresh token을 httpOnly 쿠키로 발급 → 영속화는 쿠키가 담당
- 클라이언트가 access token을 영속 저장소에 두면 XSS 노출만 늘고 이득 없음
- 새로고침 시 자동 로그인 복원은 silent refresh로 처리

## Refresh — Silent refresh (loader 기반)

- 상태: accepted
- 기록일: 2026-09-23

**결정**: 부팅·새로고침 시 `setupFlowLoader`가 `getMe()` 호출 → 401이면 axios 인터셉터가 자동으로 `/api/v1/auth/token/refresh` 호출하여 새 access token 발급.

**근거**:

- 백엔드 `/auth/token/refresh`는 refresh 쿠키만 받으면 동작 (cookie-only refresh)
- 쿠키가 httpOnly여서 JS는 못 보지만 브라우저는 자동 전송 (`withCredentials: true`)
- 이전에는 컴포넌트 마운트 시점에 `useAuthInit` query로 처리했으나, loader로 옮기면서 깜빡임 제거

## 앱 재시작 자동 로그인 — 스플래시 세션 복원 (2026-06)

- 상태: accepted
- 기록일: 2026-06

**문제**: `useSplashGate`가 인증 상태와 무관하게 스플래시 후 **무조건 `/login`으로 이동**하고 있었음. silent refresh는 보호 라우트(`setupFlowLoader`/`useAuthInit`)에만 있어서, 콜드 스타트 시 스플래시가 보호 라우트에 도달하기 전에 LOGIN으로 빠짐 → **리프레시 쿠키가 있어도 자동 로그인 시도 자체를 안 함**. (앱은 보통 재시작 시 자동 로그인되어야 함)

**해결**: 스플래시에서 세션 복원을 먼저 시도.

- 신규 `shared/api/auth/restoreSession.ts` — `/token/refresh` → accessToken `setAccessToken` 후 `true`/실패 `false`. `useAuthInit`과 동일한 `authKeys.session()` 캐시에 채워 보호 라우트 진입 시 중복 refresh 없음.
- `useSplashGate`: 애니메이션과 병렬로 `restoreSession()` 실행 → **성공: `/home`**(이후 `setupFlowLoader`가 약관/온보딩 분기) / **실패: `/login`**(기존 `fromSplash` 애니메이션 유지).
- 웹/PWA도 동일 적용 — 재방문 로그인 사용자 자동 홈 이동(웹 동작 개선).

**⚠️ 네이티브 전제 — 쿠키 영속성**: 이 흐름은 refresh 쿠키가 앱 재시작 후에도 WebView에 남아야 동작. Android WebView는 만료기간 있는 영속 쿠키는 유지하나, 백엔드가 **세션 쿠키로 설정**했거나 flush 안 되면 재시작 시 소실 → 자동 로그인 실패. 그 경우 폴백: exchange 응답의 `refreshToken`(현재 미사용, body로 옴)을 `@capacitor/preferences`/SecureStorage에 저장 후 부팅 시 그걸로 갱신(백엔드 body/header refresh 허용 필요). → `native-oauth.md` 참조.

**테스트**: `useSplashGate.test.ts` — 복원 성공→HOME / 실패→LOGIN. vitest mock은 `vi.hoisted`로 작성(팩토리에서 top-level `let` 참조 시 호이스팅 충돌로 "reading config" 오류 발생 → `vi.hoisted` 사용).

## 비인증 직접 진입 → 로그인 (2026-06)

- 상태: accepted
- 기록일: 2026-06

`setupFlowLoader`의 refresh 실패 처리가 **401/403만** 로그인 리다이렉트였는데, 백엔드는 refresh 쿠키 없을 때 **400**을 반환 → throw → 에러 화면 노출(예: `tikitak.space/home` 비로그인 직접 진입). **4xx 전체(400/401/403…) → 로그인 리다이렉트**로 변경, 5xx·네트워크(status 없음)만 에러 바운더리(서버 장애는 에러 표시 유지).

`RootErrorBoundary`(라우터 errorElement)가 `error.message`("Request failed with status code 400")를 **사용자에게 그대로 노출**하던 것도 제거 → 항상 generic 문구("문제가 발생했어요 / 잠시 후 다시 시도해주세요"), 실제 에러는 `console.error`만. (참고: `GlobalErrorBoundary`는 원래도 generic이었음 — 노출 주체는 라우터 errorElement였음)

## OAuth Callback — 페이지 X, loader-only

- 상태: accepted
- 기록일: 2026-09-23

**결정**: `/oauth/callback`는 element 없이 loader만 가진 라우트. 컴포넌트 폴더 자체 삭제.

```ts
{
  path: PATHS.AUTH_CALLBACK,
  loader: ({ request }) => {
    const url = new URL(request.url);
    const accessToken = url.searchParams.get('accessToken');
    if (accessToken) setAccessToken(accessToken);
    return redirect(PATHS.HOME);  // setupFlowLoader가 실제 목적지 결정
  },
}
```

**근거**:

- 기존 `AuthCallbackPage`는 `return null` + useEffect 부수효과만 — UI 없는 페이지 추상화 부적합
- URL params 기반 분기(`isNewMember`, `hasAgreedRequiredTerms`)는 단일 진실 공급원이 아님 → `useMe` 캐시로 통일

## 가드 구조 — 2단 분리

- 상태: accepted
- 기록일: 2026-09-23

| 가드                      | 위치        | 책임                                                          |
| ------------------------- | ----------- | ------------------------------------------------------------- |
| `ProtectedRoute` 컴포넌트 | element     | 토큰 존재 확인, 없으면 `/login`                               |
| `setupFlowLoader` loader  | 부모 라우트 | `MeResponse` 기반 흐름 분기 (약관·온보딩 미완료 시 강제 이동) |

`setupFlowLoader`는 ProtectedRoute의 모든 자식 라우트에 적용 → /home, /feed 등 어느 protected route를 가도 흐름 가드 발동.

## 백엔드 협의 대기 항목

- 상태: proposed
- 기록일: 2026-09-23

- `MeResponse`에 `hasCompletedOnboarding: boolean` 추가
- `POST /api/v1/onboarding/complete` 엔드포인트 — 온보딩 완료 시 호출
- 도입되면 `setupFlowLoader`에 onboarding 분기 추가 (현재 TODO 주석 상태)

## 인스턴스 버그 이력 (참고)

- 상태: accepted
- 기록일: 2026-09-23

`shared/api/instance.ts`의 request 인터셉터가 한때 모듈 로컬 `accessToken: string | null = null` 상수를 검사하고 있어 **모든 요청에 Authorization 헤더가 안 붙는 버그** 있었음. `getAccessToken()` 호출로 수정. zustand 메모리 보관 패턴 도입과 함께 처리.

## 거부된 대안

- 상태: rejected
- 기록일: 2026-09-23

- **`sessionStorage` persist (LOOPIT 방식)** — 백엔드가 cookie-only refresh 지원하므로 불필요. XSS 위험만 가져옴.
- **컴포넌트 가드로만 흐름 분기** — 깜빡임 발생, 잘못된 페이지 1프레임 마운트됨.
- **`/login`에 OAuth 콜백 통합** — `/login`이 로그인 UI + 콜백 처리 이중 책임 가짐. 현재 분리 유지.
- **`tokenStorage` 추상화 (SEMOSAN 방식)** — 현재 zustand가 메모리 저장소 역할 수행. 단순 alias 형태는 의미 없고, 영속 저장 형태는 보안 결정과 충돌. Capacitor secure storage 도입 시 재검토 (아래 도입 기준 참고).

## tokenStorage 추상화 — 도입 기준

- 상태: accepted
- 기록일: 2026-09-23

지금은 만들지 않음. 다음 3가지 중 하나가 발생하면 도입 검토:

1. **저장소를 런타임 분기**해야 할 때 — 가장 강한 트리거
   - 웹: 메모리(zustand)
   - 네이티브: iOS Keychain / Android Keystore (`capacitor-secure-storage-plugin`)
   - 분기 로직이 여러 호출처에 흩어지면 한 인터페이스로 모아야 함

2. **토큰 직접 접근 호출처가 5곳 이상** 누적될 때
   - 현재는 `instance.ts` 인터셉터, `useLogout`, `auth/queries.ts` setAccessToken — 3곳
   - axios 인터셉터가 자동 부착하기 때문에 호출처 증가가 빠르지 않음

3. **토큰 라이프사이클 복잡화** — 만료 시간 추적, 다중 토큰(access + idToken + scope별), 디바이스 메타데이터 등 단순 `get/set/clear` 이상 책임이 생길 때

**한 줄 기준**: "토큰 저장소 또는 인증 메타데이터 관리가 단일 변수보다 복잡해지는 순간". Tikitak 현재는 access token 한 개 + 메모리 한 종 + 자동 부착 인터셉터 — 어느 조건도 미충족.

가장 빠른 진짜 도입 시점은 Capacitor secure storage 진입 단계. 그 전에 만들면 데드 코드 + 잘못된 시그니처(async/sync 미스매치) 위험.

## OAuth 진입 방식 로드맵 (앱 단계)

- 상태: superseded
- 기록일: 2026-09-23
- 대체: `native-oauth.md`의 "✅ 구현됨 (2026-06, BE PR #107 / FE)" 섹션

현재 웹은 `window.location.href`로 OAuth start URL 이동 → 외부 redirect → `/oauth/callback`. 이 흐름은 **페이지 통째 reload라 ssgoi 상태 손실, login→terms 푸시 애니메이션 불가**.

### 단계별 전환 계획

| 단계              | 방식                                      | UX                                  | 백엔드 변경                                     | 네이티브 변경                          |
| ----------------- | ----------------------------------------- | ----------------------------------- | ----------------------------------------------- | -------------------------------------- |
| 1. 현재 (웹)      | `window.location.href` → 외부 redirect    | 페이지 reload, 애니메이션 X         | 0                                               | 0                                      |
| 2. Capacitor 1차  | `@capacitor/browser` + deep link redirect | in-app 모달, SPA 보존, 애니메이션 O | redirect_uri에 `tikitak://oauth/callback` 추가  | URL scheme 등록                        |
| 3. 앱 출시 폴리싱 | 카카오 네이티브 SDK 앱점프                | 카톡 앱 1탭 인증, 가장 자연스러움   | 신규 엔드포인트 `POST /auth/oauth/kakao/native` | iOS Info.plist + Android Manifest 설정 |

### 단계 2 구현 (@capacitor/browser + deep link)

```ts
const handleStart = async () => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: oauthStartUrl }); // in-app Safari/Chrome
  } else {
    window.location.href = oauthStartUrl;
  }
};

// App 진입점
App.addListener('appUrlOpen', ({ url }) => {
  const params = new URLSearchParams(new URL(url).search);
  const accessToken = params.get('accessToken');
  if (accessToken) {
    setAccessToken(accessToken);
    Browser.close();
    navigate(PATHS.TERMS); // ssgoi가 login→terms 트랜지션 동작
  }
});
```

### 단계 3 구현 (네이티브 SDK)

```ts
import { Kakao } from '@capacitor-community/kakao-login';

const handleKakaoLogin = async () => {
  const { accessToken: kakaoToken } = await Kakao.login();
  const res = await postKakaoNativeLogin({ kakaoAccessToken: kakaoToken });
  setAccessToken(res.data.data.accessToken);
  navigate(PATHS.TERMS);
};
```

구글/애플도 별개 SDK 필요:

- 구글: `@capacitor-community/google-auth`
- 애플: `@capacitor-community/apple-sign-in` (**iOS 출시 시 의무 사항**)

### 결정 원칙

- 지금 단계엔 단계 1 유지
- Capacitor 패키징 작업 시 단계 2 즉시 진행 (최소 비용으로 UX·애니메이션 회복)
- 출시 직전 카카오만 단계 3로 갈아끼기 (한국 사용자 비중 클 때 ROI 큼)
- 단계 2를 건너뛰고 곧장 단계 3 가는 건 백엔드+네이티브 동시 작업이라 비대해지므로 비추
