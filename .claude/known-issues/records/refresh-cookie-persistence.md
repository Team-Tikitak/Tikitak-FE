# 로그인이 계속 풀림 (refresh 쿠키 영속성·토큰 수명 미확인)

- 상태: open
- 발견일: 2026-10-05

## 증상

QA에서 "구글 로그인이 계속 풀린다"는 제보. 앱을 다시 열면 로그인 화면이 나온다.

## 영향

재실행마다 다시 로그인해야 한다. 자동 로그인(`restoreSession`)이 의도대로 동작하지 않는다.

## 근거 또는 원인

FE에서 확인한 것:

- 구글만 다르게 처리하는 코드는 없다. provider는 OAuth 시작 URL 경로(`/auth/oauth/{provider}/start`)에서만 갈린다. 세션은 모든 provider가 같다: access token은 메모리에만 두고([authStore.ts](../../../src/shared/stores/authStore.ts), 영속화 없음), 앱을 열 때 백엔드가 내려준 refresh 쿠키로 복구한다.
- FE 원인 하나는 수정했다(2026-10-05): `restoreSession`이 5xx·네트워크 오류까지 "비로그인"으로 처리해, 서버나 Cloudflare 터널이 순간 죽어 있으면 쿠키가 멀쩡해도 로그인 화면으로 보냈다. 지금은 `authenticated`/`unauthenticated`/`unavailable`을 구분하고, 서버 장애는 2회 재시도 후 로그인 화면에서 안내한다.

dev API(`dev-api.tikitak.space`)에 가짜 토큰으로 확인한 것(2026-10-05):

| 요청                                               | 응답                                                                                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/v1/auth/token/refresh` (쿠키·본문 없음) | `400 AUTH006` "리프레시 토큰이 필요합니다."                                                                                                            |
| 같은 요청 + 본문 `{"refreshToken":"가짜"}`         | `401 AUTH007` "유효하지 않은 리프레시 토큰입니다." → **본문의 refreshToken을 읽는다**                                                                  |
| 같은 요청 + 쿠키 `refreshToken=가짜`               | `401 AUTH007` → 쿠키 이름도 `refreshToken`                                                                                                             |
| `GET /api/v1/auth/oauth/google/start`              | OAuth 임시 쿠키(`oauthState`, `oauthMode`)는 `Max-Age=300; Secure; HttpOnly; SameSite=None`으로 내려온다 → 백엔드가 쿠키에 수명을 명시하는 코드는 있다 |

즉 쿠키 없이 본문 토큰만으로 갱신하는 폴백이 백엔드상 가능하다.

공개 OpenAPI 명세(`GET /v3/api-docs`)에서 확인한 것(2026-10-05):

- `POST /api/v1/auth/token/refresh`: "refresh token을 검증하고 **새로운 access token과 refresh token을 발급**" → **refresh 토큰은 회전한다.** 응답 `TokenResponse`에 `accessToken`, `refreshToken`, `tokenType`, `expiresIn`(access 만료 초, 예시 3600)이 모두 온다.
- `POST /api/v1/auth/logout`: "refresh token을 **폐기**하고 refreshToken 쿠키를 만료" → 서버가 refresh 토큰을 저장·폐기하는 구조다.
- 로그인 교환 응답(`LoginResponse`)에도 `refreshToken`이 본문으로 온다. 요청은 `RefreshTokenRequest { refreshToken }`.
- 명세 어디에도 refresh 토큰 TTL, 쿠키 `Max-Age`, 기기·세션당 토큰 정책은 없다.
- 로그아웃 응답의 쿠키 만료 헤더로 refresh 쿠키의 속성 형태를 알 수 있다: `refreshToken=; Path=/; Secure; HttpOnly; SameSite=None`(`Domain` 없음, 호스트 한정 쿠키). 만료시키는 쪽이 `Max-Age=0`을 쓰는 걸로 보아 발급 쪽도 같은 빌더에서 `Max-Age`를 줄 가능성은 있지만, 발급 응답을 보기 전에는 확정할 수 없다.

회전 구조에서 로그인이 풀리는 경로(이 구조에서 가능한 것들):

- **다른 기기·웹 로그인으로 기존 세션이 폐기됨**: 서버가 사용자당 refresh 토큰 하나만 두면, 같은 계정으로 다른 기기나 웹에서 로그인할 때 기존 기기의 토큰이 무효가 되어 `AUTH007`로 풀린다. QA처럼 한 계정을 여러 기기에서 쓰면 provider와 무관하게 생긴다.
- **회전 응답 유실**: 서버에서는 회전됐는데 응답이 도착하지 못하면(앱 중단, 네트워크 끊김) 기기에 남은 옛 토큰이 무효라 다음 복구가 `AUTH007`로 실패한다.
- **쿠키가 재시작 후 사라짐**: `Max-Age`가 없으면 `AUTH006`.

아직 확인하지 못한 것(실제 로그인 응답이나 백엔드 확인이 필요):

1. refresh 쿠키의 `Max-Age`/`Expires`(없으면 세션 쿠키라 앱 재시작 시 사라질 수 있음)
2. refresh 토큰 TTL
3. 사용자당 토큰 하나인지, 기기별로 따로 두는지(다른 기기 로그인이 기존 세션을 폐기하는지)
4. dev 서버 재배포·DB 초기화로 토큰이 무효화되는지

## 재현 또는 확인 방법

1. 로그인 직후 앱을 완전히 종료했다가 바로 다시 연다. 풀리면 쿠키가 재시작 후 남지 않는 것이다.
2. 로그인할 때 `POST /api/v1/auth/oauth/login-code/exchange` 응답의 `Set-Cookie`를 본다(Android: Chrome `chrome://inspect`, iOS: Safari 웹 인스펙터). `Max-Age`/`Expires`가 없으면 1번이 확정이다.
3. 로그인이 풀린 직후 콘솔의 `세션 복구 실패` 로그에서 `code`를 본다.
   - `AUTH006`: 쿠키가 없음(영속성 문제)
   - `AUTH007`: 토큰이 무효·만료(TTL·회전·서버 초기화)
   - 5xx 또는 `NetworkError`: 서버 장애
4. 시간이 지난 뒤에 풀리는지도 본다(몇 시간·며칠 단위면 TTL).

## 임시 대응

- 서버 장애일 때 로그아웃과 구분해 "서버에 연결할 수 없어 로그인 상태를 확인하지 못했어요" 안내를 띄운다(적용됨).
- 쿠키가 없을 때(`AUTH006`) 네이티브 보안 저장소의 refresh 토큰으로 복구하는 폴백을 넣었다(2026-10-05, `auth-flow.md`의 "네이티브 refresh 토큰 보안 저장소 폴백"). 새 iOS·Android 빌드를 설치한 기기부터 적용되고, 쿠키 미영속 문제만 해결한다. 실기기 확인 전이라 상태는 `open`으로 둔다.

## 외부 의존성 또는 담당 주체

백엔드: refresh 쿠키 속성(`Max-Age`), 토큰 TTL, 회전 정책, refresh 응답 본문 스펙 확인.

## 해소 조건

원인이 확정되면 둘 중 하나로 해결한다.

- (a) 백엔드가 refresh 쿠키에 `Max-Age`를 부여한다.
- (b) FE 폴백: 로그인 교환 응답과 **모든 refresh 응답**의 본문 `refreshToken`을 보안 저장소에 최신값으로 저장하고, 쿠키 복구가 `AUTH006`일 때 본문 refresh로 복구한다. 회전하므로 갱신된 토큰을 매번 다시 저장하지 않으면 옛 토큰이 남아 오히려 실패한다. `@capacitor/preferences`는 암호화되지 않고(iOS는 백업 대상) 있어 보안이 약하다. Keychain/Keystore 플러그인을 쓰려면 새 의존성 승인과 새 iOS/Android 빌드가 필요하다. 이 폴백은 1번(쿠키 미영속)만 해결하고, 3번(다른 기기 로그인으로 폐기)이나 4번은 해결하지 못한다.

## 변경 기록

- 2026-10-05: 최초 기록. `restoreSession` 서버 장애 구분 적용, dev API 프로브 결과 기록
- 2026-10-05: 공개 OpenAPI 명세와 로그아웃 응답 헤더로 확인한 사실(토큰 회전, 서버 폐기, 쿠키 속성 형태)과 회전 구조에서의 풀림 경로를 추가
- 2026-10-05: 쿠키 없음(`AUTH006`) 시 보안 저장소 폴백 구현. 새 빌드 설치 후 "로그인 → 앱 완전 종료 → 재실행"에서 자동 로그인되는지, 폴백이 쓰였는지(`세션 복구 실패` 로그 없이 복구되는지) 확인 필요
