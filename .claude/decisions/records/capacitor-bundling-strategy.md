# Capacitor 번들링 전략 — 로컬 번들(webDir: dist) vs 원격 웹뷰(server.url)

## 결정 — 로컬 번들 유지

- 상태: superseded
- 기록일: 2026-06
- 대체: 원격 URL 로딩으로 전환 (2026-06-25)

**로컬 번들 방식(`webDir: 'dist'`, `server.url` 없음)을 유지한다.** `server.url`로 배포 URL을 가리키는 원격 웹뷰 방식은 채택하지 않는다. (기록 당시 `capacitor.config.ts`는 로컬 번들 상태였다. 아래 "원격 URL 로딩으로 전환" 이후 실제 설정은 이 결정과 다르다.)

## 원격 URL 로딩으로 전환 (2026-06-25)

- 상태: accepted
- 기록일: 2026-06-25

`capacitor.config.ts`의 `server.hostname: 'tikitak.space'`를 `server.url: 'https://app.tikitak.space'`로 바꿔, 앱이 번들이 아니라 배포된 웹(Vercel)을 WebView로 직접 로드한다(커밋 `de8be48`, 한 줄 변경). 2026-10-04 기준 저장소의 iOS·Android 네이티브 설정이 모두 이 값을 쓴다(스토어 출시 빌드가 이 값인지는 별도 확인 필요).

- **전환 사유는 커밋 메시지·문서 어디에도 기록되지 않았다.** 이 방식의 이점은 웹 배포만으로 앱에 즉시 반영된다는 점(스토어 심사 불필요)으로 추정되며, 팀 확인이 필요하다.
- WebView origin은 계속 프로덕션 도메인이라 `capacitor-setup.md`에 기록된 origin 통일 효과(CORS·쿠키·Kakao 도메인 화이트리스트)는 유지된다. 단 도메인이 `tikitak.space` → `app.tikitak.space`로 바뀌었다.
- 이 방식 때문에 생긴 대응과 주의점:
  - 배포 도중·직후 열려 있던 세션이 옛 청크를 참조해 404가 나는 문제 → `chunkLoadRecovery`가 한 번 새로고침
  - 앱 백그라운드 중 WKWebView 캐싱 이슈 → `.claude/agents/tikitak-debugger.md`
  - 웹 origin이 응답하지 않으면 앱 셸이 없어 WebView 기본 오류 화면(또는 빈 화면)이 노출될 수 있다. `server.errorPath`는 설정돼 있지 않다.
  - 강제 업데이트 정책(`public/app-version.json`)은 네이티브 빌드 기준이라 그대로 필요하다.

## 재평가 필요 — 로컬 번들 vs 원격 URL

- 상태: proposed
- 기록일: 2026-10-04

원격 URL 방식이 의도된 선택인지, 아래 비용을 감수할 만한지 팀이 정해야 한다. 결정 전까지는 현재(원격) 방식을 유지한다.

| 선택                                                    | 얻는 것                                 | 치르는 것                                                                                                                       |
| ------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A. 원격 URL 유지 (+ `server.errorPath` 오프라인 페이지) | 웹 배포로 즉시 반영, 스토어 심사 불필요 | 청크 불일치·캐싱 대응 상시 필요, 네트워크 없으면 앱 셸 없음, 원격 콘텐츠에 네이티브 브리지 노출("흔한 오해 정정"의 보안·결합도) |
| B. 로컬 번들 복귀 + OTA                                 | 첫 로딩 속도, 오프라인 셸, 보안·견고성  | UI 변경마다 스토어 심사 또는 OTA(`@capgo/capacitor-updater`) 도입 필요                                                          |

확인·후속:

- 전환 사유를 커밋 `de8be48` 작성자에게 확인해 이 문서에 기록한다.
- A를 택하면 `server.errorPath` 오프라인 페이지를 추가한다. 단 Capacitor 소스 기준으로 Android는 main-frame 네트워크 오류와 HTTP 오류(5xx 포함)에서 동작하지만, iOS는 네트워크 실패(`didFail`/`didFailProvisionalNavigation`)에서만 동작하고 HTTP 5xx 응답에는 동작하지 않는다.
- B를 택하면 OTA 정책과 스토어 심사 영향을 정한다.

## 두 방식 정의

- 상태: accepted
- 기록일: 2026-09-23

| 방식                                     | 구조                                                                                | 비고                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **로컬 번들 (기록 당시 채택)**           | `webDir: 'dist'` — 빌드 산출물을 앱 내부에 패키징, WebView가 로컬 `index.html` 로드 | 첫 로딩 빠름, 오프라인 셸 가능                                        |
| 원격 웹뷰 (기록 당시 기각, 현재 사용 중) | `server.url: 'https://...'` — 앱이 배포된 웹을 WebView로 로드                       | Capacitor 공식 문서가 **dev/live-reload용, 프로덕션 비권장**으로 명시 |

## 로컬 번들을 택한 이유

- 상태: superseded
- 기록일: 2026-09-23
- 대체: 원격 URL 로딩으로 전환 (2026-06-25)

재평가("재평가 필요" 섹션) 때 판단 근거로 참고한다.

1. **Vite SPA라 server.url의 원래 명분이 없다.** server.url의 핵심 장점은 "Next.js SSR/RSC를 그대로 유지". Tikitak은 `vite build`로 끝나는 클라이언트 SPA(React Router 라이브러리 모드)라 지킬 SSR이 애초에 없다 → server.url의 이득 0.
2. **네이티브 기능 의존도가 높다.** camera/geolocation/keyboard/status-bar/splash 플러그인 사용. 로컬 번들에서 더 견고하고 자연스럽게 동작.
3. **빠른 첫 로딩 + 오프라인 셸.** 앱 내부 파일 로드라 첫 화면 즉시 표시, 네트워크 없어도 셸/에러 화면은 뜸. 원격은 매번 네트워크 의존, 서버 죽으면 앱도 죽음.
4. **웹은 PWA로 이미 커버.** `vite-plugin-pwa` 운영 중 → "웹도 띄워야 하니 server.url"이라는 동기 자체가 없음.
5. **스토어 심사 리스크.** 원격 웹뷰는 "웹사이트 바로가기 앱"으로 보여 심사에서 불리할 수 있음.

## ★ 흔한 오해 정정 (팀 설명 시 틀리지 말 것)

- 상태: accepted
- 기록일: 2026-09-23

(현재는 원격 URL 방식을 쓰므로, 아래 server.url 기각 근거는 "재평가 필요" 섹션의 비용 항목으로 읽는다.)

- **"server.url라서 네이티브 권한을 못 쓴다" → 틀림.** Capacitor는 콘텐츠가 로컬이든 원격이든 WebView에 네이티브 브리지를 주입하므로, server.url로도 camera/geolocation 플러그인은 호출된다 (dev live-reload에서 플러그인 동작하는 이유). OS 권한은 네이티브 빌드(Manifest/plist)의 일부라 웹 출처와 무관.
- **그래서 server.url을 기각하는 진짜 이유는** "권한을 못 써서"가 아니라:
  - **보안** — 원격에서 받아온 웹 콘텐츠에 카메라·위치 접근 가능한 네이티브 브리지를 주입하는 구조. 원격 변조/서드파티 스크립트 시 민감 권한 노출. (Capacitor가 프로덕션 비권장하는 핵심 근거)
  - **결합도** — 플러그인 쓰려면 원격 배포물에 Capacitor 브리지가 들어가야 함 → 더 이상 "그냥 웹사이트"가 아니라 Capacitor에 묶인 빌드 → server.url의 유일한 매력("웹 한 번 배포로 끝")이 증발.
  - **견고성** — 플러그인 호출 JS가 원격에서 안 내려오면 네이티브 기능 진입 자체가 불가.
- **한 줄 결론:** "권한을 못 써서"가 아니라 "권한을 쓰는 앱이라서 server.url은 장점은 없고 단점만 커진다."

## "웹 배포하면 즉시 반영" 장점은 OTA로 확보

- 상태: proposed
- 기록일: 2026-09-23

(로컬 번들로 복귀하는 선택 B를 택할 때만 해당한다. 현재는 미도입.)

로컬 번들의 유일한 단점(UI 변경 시 스토어 심사 필요)은 server.url이 아니라 **OTA(라이브 업데이트)**로 해결한다.

- 도구: `@capgo/capacitor-updater`(오픈소스) 또는 Ionic Appflow Live Updates
- 동작: 새 JS/HTML/CSS 번들을 백그라운드 다운로드 → **다음 실행 시 적용**(강제 reload도 설정 가능), 스토어 심사 불필요
- **한계(큰 별표):** 웹 레이어(JS/HTML/CSS)만 갱신. **네이티브 변경(플러그인 추가/버전업, capacitor.config 변경, 권한 추가)은 여전히 스토어 심사 필요.**
- 스토어 정책상 해석형(웹) 코드 OTA는 iOS/Android 모두 허용 (RN CodePush, Expo Updates와 동일 원리). 단 앱 본질을 심사 우회용으로 갈아치우는 건 금지.
- → 로컬 번들(빠른 로딩·오프라인) + OTA(거의 즉시 갱신)로 두 장점을 동시에 확보.

## 딥링크 ≠ 번들 방식 (server.url로도 줄어들지 않음)

- 상태: accepted
- 기록일: 2026-09-23

딥링크 때문에 한 백엔드 작업이 server.url였으면 불필요했을까? → **아니다.** 딥링크는 두 층이다:

- **1층 앱 내부 이동(web routing):** WebView 안 화면 이동. 백엔드/딥링크 설정 불필요. 양쪽 방식 동일. server.url이 줄여주는 건 이것뿐인데 어차피 백엔드 일이 아니었음.
- **2층 외부→앱 진입(Universal/App Links):** 카톡·브라우저·푸시·공유 링크를 앱 밖에서 탭 → 네이티브 앱이 특정 화면으로 열림. OS가 도메인 소유를 검증해야 해서 **백엔드가 association 파일 호스팅 필요**:
  - iOS: `https://도메인/.well-known/apple-app-site-association`
  - Android: `https://도메인/.well-known/assetlinks.json`
  - 이 "외부 진입" 문제는 번들 방식과 무관하게 동일하게 존재 → server.url로도 백엔드 작업 동일하게 필요(원격은 SPA fallback 라우팅까지 더 필요할 수 있음).
- **진짜 갈림길은 server.url vs 로컬 번들이 아니라 Custom Scheme vs Universal Links:**
  - Custom Scheme(`tikitak://...`): 백엔드 불필요, 앱 설정만. 미설치 시 fallback 없음/일부 컨텍스트 차단.
  - Universal/App Links(`https://...`): 백엔드 .well-known 필요, 앱 있으면 앱·없으면 웹 자동 fallback로 UX 우수.
- 백엔드가 만든 association 파일은 버려지지 않음 — 앱 쪽 설정(현재 미구현: Manifest intent-filter, iOS associated domains, `appUrlOpen` 리스너) 붙이면 그대로 사용.

## "토스도 웹뷰잖아" 반례 정리

- 상태: accepted
- 기록일: 2026-09-23

- 토스는 **자체 네이티브 셸 + 자체 JS↔Native 브리지**(Capacitor 아님). 웹을 원격에서 받아오긴 하지만 **공격적 캐싱·선다운로드·WebView 프리워밍** 때문에 실제 동작은 "원격"보다 "로컬"에 가깝다. "원격 웹 + 강한 캐싱" vs "로컬 번들 + OTA"는 가운데서 수렴.
- 즉 "토스 = naive server.url"이 아니라 **"원격 웹을 네이티브처럼 만드는 대규모 인프라(전담 플랫폼 팀)"**가 본체. 그 인프라 없이 server.url만 쓰면 단점(느린 첫 로딩·네트워크 의존)만 받고 mitigations는 못 가져옴 (생존 편향).
- 작은 팀이 "토스 체감"에 싸게 도달하는 길 = **로컬 번들 + OTA**. (참고: Tikitak이 쓰는 `overlay-kit`이 토스 오픈소스 — 웹 도구는 빌려 쓰되 원격 웹뷰 인프라는 따라갈 필요 없음.)

## 미구현 / 후속

- 상태: proposed
- 기록일: 2026-09-23

- OTA 도입(`@capgo/capacitor-updater` 채널·적용 정책) — 미도입.
- 딥링크 앱 측 설정(Android App Links + iOS Universal Links + `appUrlOpen`) — 미구현. OAuth 딥링크는 `decisions/records/native-oauth.md` 참조.

→ 관련: `decisions/records/capacitor-setup.md`(Phase 1 구현), `decisions/records/native-oauth.md`(OAuth 딥링크), `tasks/todo.md`(Capacitor Phase 2/3)
