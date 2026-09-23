# iOS 뒤로가기 스와이프

## 결정

- 상태: accepted
- 기록일: 2026-09-23

iOS 왼쪽 가장자리 스와이프 → 뒤로가기를 **JS 엣지 스와이프 감지 → `navigate(-1)` → 기존 ssgoi 전환 재생** 방식(A안)으로 구현.

- 훅: `src/shared/hooks/useEdgeSwipeBack.ts`
- 연결: `src/app/layout/RootLayout.tsx`
- 가드: 왼쪽 가장자리 24px에서 시작 + 가로 우세 + 70px 이상 이동한 touch만. `[data-vaul-drawer]`(바텀시트)·`[data-no-swipe-back]`(풀스크린 오버레이, 예: `CameraOverlay`) 열림 시 무시. `window.history.state.idx > 0`일 때만 동작.
- 플랫폼: iOS 한정(`Capacitor.getPlatform() === 'ios'`). Android는 OS 백 제스처 + `App.backButton` 사용.

## 채택 이유 / 대안 기각

- 상태: accepted
- 기록일: 2026-09-23

- **B안 — WKWebView `allowsBackForwardNavigationGestures`(네이티브 인터랙티브)**: 기각.
  - 이 앱은 화면 전환을 ssgoi로 직접 그림 → 네이티브 pop과 **이중 애니메이션** 충돌.
  - 네이티브 인터랙티브 pop은 문서 단위 네비게이션용. SPA pushState(같은 문서 history)에선 스냅샷 pop이 제대로 안 뜨거나 깨질 수 있어 동작 보장 불가.
  - Swift 서브클래싱 + Xcode 타깃 등록 필요.
- **C안 — 풀 follow-finger(실제 이전 화면 추적)**: 출시 직전 기각, 아래 향후 작업으로 보류.

## 향후 작업 — follow-finger 인터랙티브 백 (보류)

- 상태: rejected
- 기록일: 2026-09-23

손가락을 따라 이전 화면이 같이 끌려나오는 네이티브급 인터랙티브 백. 현재 미구현. 도입 시 풀어야 할 난점:

1. **ssgoi에 제스처 API 없음** (6.4.0 기준 gesture/drag/progress 미지원). ssgoi 밖에서 직접 구현해야 함.
2. **이전 화면이 mount돼 있지 않음** (SPA). 손가락 추적으로 실제 이전 화면을 보여주려면 이전 라우트를 미리 렌더/스냅샷해야 함.
3. **commit 점프**: 드래그로 현재 페이지를 일부 밀어둔 상태에서 `navigate(-1)` 하면 ssgoi가 자기 전환을 처음부터 재생 → 끊김. 없애려면 back 전환을 ssgoi 대신 직접 소유해야 함.

현실적 중간안(A+): 드래그 중 **현재 페이지만** translateX로 따라 밀고(왼쪽 가장자리 딤/그림자), 임계점 넘으면 commit. 뒤는 실제 이전 화면이 아닌 딤. back 전환을 ssgoi에서 분리해 직접 마무리. 인터랙티브 느낌은 나지만 "실제 이전 화면 추적"은 아님.
