# 바텀시트 — vaul 제약과 대안 메모

## 현재 스택

- 상태: accepted
- 기록일: 2026-09-23

- `vaul` (Drawer.Root/Content/Overlay) + `overlay-kit` (imperative open)
- 공통 래퍼: [BottomSheetOverlay.tsx](src/shared/ui/BottomSheet/BottomSheetOverlay.tsx)

## vaul snap + bottom-anchored input의 한계

- 상태: proposed
- 기록일: 2026-09-23

CommentSheet처럼 **snap point + 하단 고정 input** 패턴은 vaul 단독으로는 native급 부드러움 어려움.

### 원인

- vaul은 `Drawer.Content`에 `transform: translate3d(...)`로 위치 조정. height는 그대로 둠.
- 결과적으로 input을 visible 영역 끝에 두려면 section height를 snap 상태에 맞춰 동적 변경해야 함.
- 그런데 `activeSnapPoint`(그리고 `--snap-point-height` CSS 변수)는 **snap 커밋 시점에만** 업데이트됨 → 드래그 중 input 위치가 stale → 점프감.

### 활용 가능한 vaul API

- `onDrag(event, percentageDragged) => void` — 드래그 중 진행도 콜백
- `onRelease(event, open) => void` — 드래그 종료
- CSS variable `--snap-point-height` (transform-only)

### 부드럽게 만드는 방법 (vaul 유지)

`onDrag` 콜백에서 ref로 input 컨테이너 style을 직접 갱신 (React 리렌더 X):

```tsx
const inputWrapperRef = useRef<HTMLDivElement>(null);

<Drawer.Root
  onDrag={(_, percentage) => {
    if (!inputWrapperRef.current) return;
    const currentHeight = collapsedHeight + (expandedHeight - collapsedHeight) * percentage;
    inputWrapperRef.current.style.bottom = `${viewportHeight - currentHeight}px`;
  }}
>
```

예상 작업량: 30~60분.

## 대안: react-spring-bottom-sheet

- 상태: proposed
- 기록일: 2026-09-23

- **장점**: snap + footer slot이 viewport 끝에 고정되는 패턴을 기본 지원. 인스타급 부드러움 즉시.
- **단점**: 의존성 추가 (~30KB). vaul과 겹쳐서 라이브러리 일관성 깨짐.
- **권장 사용처**: CommentSheet처럼 input 하단 고정이 핵심 UX인 시트만 부분 도입. 다른 단순 시트는 vaul 유지.

도입 결정은 vaul `onDrag` 접근으로 충분히 부드러우면 보류, 부족하면 폴리싱 단계에서 교체.

## status bar dim 동기화

- 상태: accepted
- 기록일: 2026-06

시트 dim(`bg-black/50`)과 status bar 색을 맞춰 깜빡임/lag 제거. [statusBarDim.ts](src/shared/lib/statusBarDim.ts) + `BottomSheetOverlay`에서 사용.

- **웹/PWA**: `pushStatusBarDim`/`popStatusBarDim`이 `theme-color`(#808080 ↔ #ffffff) 변경. 중첩 대비 ref-count. (theme-color는 브라우저 UI 레이어라 CSS 오버레이와 프레임 동기화는 원래 불완전 — 웹은 이 수준으로 수용.)
- **✅ 네이티브(iOS+Android) 동기화 (2026-06)**: `capacitor.config.ts` `StatusBar.overlaysWebView: true` → 상태바 투명 + 웹뷰 edge-to-edge → **바텀시트 오버레이(`fixed inset-0 bg-black/50`)가 상태바 영역까지 같은 CSS 레이어로 덮어 완벽 동기화**. 이전의 `StatusBar.setBackgroundColor`(네이티브, 즉시 변경 → CSS 페이드와 레이어 달라 타이밍 어긋남)는 **제거**. statusBarDim은 이제 웹 theme-color만 담당.
  - Android는 다크 아이콘이 흰 배경/딤 회색 둘 다 가독 → 글자색 문제 없음(iOS PWA black-translucent의 흰 글자 강제 문제는 네이티브 StatusBar.setStyle로 제어 가능해 무관).
  - edge-to-edge 전제: 모든 화면이 `pt-[env(safe-area-inset-top)]` 확보. PageShell 헤더가 처리, Login/Splash는 `pt-[31dvh]`라 무관. ⚠️ Android는 `env(safe-area-inset-top)`가 overlaysWebView=true에서 상태바 높이를 보고하는지 기기 확인 필요(헤더 잘리면 상태바 높이 → CSS 변수 fallback).

## 키보드 회피 (avoidKeyboard) — 해결됨 (2026-06, 2026-07 갱신)

- 상태: accepted
- 기록일: 2026-06

인풋 있는 바텀시트(댓글·장소검색)에서 키보드가 올라올 때 인풋이 가려지거나, iOS에서 웹뷰 리사이즈와 시트 이동이 겹쳐 뒤 배경이 비치는 문제를 처리한다.

- `initNativeBridge.ts`: `@capacitor/keyboard`의 `keyboardWillShow`/`DidShow`/`WillHide`/`DidHide` 리스너가 `--keyboard-height` CSS 변수 설정.
  - **Android**: `getAndroidKeyboardOffset(keyboardHeight)` — `visualViewport` 오버랩(또는 reported height)에서 하단 safe-area inset을 뺀 값. edge-to-edge라 `resize:native`가 안 먹어서 CSS로 직접 올림.
  - **iOS**: reported `keyboardHeight`를 그대로 `--keyboard-height`에 반영. `avoidKeyboard` 시트가 열려 있는 동안은 `Keyboard.setResizeMode('none')`으로 웹뷰 자체 resize를 멈추고, 시트가 CSS bottom transition으로 키보드를 따라가게 한다. 닫힐 때 `native`로 복원한다.
- `base.css`: `--keyboard-height: 0px` 기본값.
- `BottomSheetOverlay`: `avoidKeyboard` prop → `bottom-(--keyboard-height) transition-[bottom] duration-250 ease-[cubic-bezier(0.17,0.59,0.28,1)]`. 시트가 키보드 높이만큼 올라감. (2026-07: 기존 `duration-200 ease-out`은 iOS 키보드 실제 애니메이션(약 250ms, 커스텀 커브)과 길이·곡선이 달라 "따로 움직이다 멈추는" 느낌이 있었음 → iOS 키보드 커브에 가까운 값으로 조정)
- 키보드와 시트 사이로 뒤 화면이 비치지 않도록 `top-full h-(--keyboard-height) bg-white` filler를 시트 아래에 붙인다.
- `comment-bottom-sheet-base`: 키보드 표시 중에는 safe-area padding을 제거해 댓글 입력창과 키보드 사이 간격이 과하게 벌어지지 않게 한다.
- 적용처: `LocationSearchOverlay`, `FeedDetailContent`(댓글 시트). 다른 시트는 `avoidKeyboard` 미지정 → 영향 없음.

(같은 `initNativeBridge`에서 Android `--status-bar-height`도 `StatusBar.getInfo().height` 실측값으로 설정 — 헤더 inset floor가 기기별 정확. 24px는 fallback. → `capacitor-setup.md`)

## iOS input zoom guard (2026-07)

- 상태: accepted
- 기록일: 2026-07

iOS Safari/WKWebView는 `input`/`textarea` 글자 크기가 16px보다 작으면 focus 시 자동 확대한다. viewport `maximum-scale=1.0` 차단은 접근성도 해치고, Capacitor 실기기에서 안정적으로 막히지 않는다.

- **결정**: 실제 입력 요소의 `font-size`는 16px로 올리고, `transform: scale(0.875)`로 시각 크기만 기존 14px 디자인에 맞춘다.
- **적용 범위**: input/textarea가 있는 필드에만 적용한다. 전체 페이지나 wrapper에 무차별 적용하지 않는다.
- **폭/높이 보정**:
  - 단일 line input은 `.ios-input-zoom-guard` + `.ios-input-zoom-guard-box` 조합으로 scale로 줄어든 폭을 `calc(100% / 0.875)`로 보정한다.
  - textarea는 `.ios-textarea-zoom-guard`에서 width/height를 함께 보정한다.
- **주의**: `w-full`, `flex-1`, `min-h-0` 같은 레이아웃 utility와 같은 요소에서 width/height를 동시에 덮으면 출력 순서 의존성이 생긴다. 새 입력 UI에 적용할 때는 기존 폭을 깨지 않는 wrapper 구조를 먼저 검토한다.
- **기각**: 네이티브 Swift로 zoom만 억제하는 방식. 현재 앱은 Swift 커스텀 레이어를 쓰지 않고, 문제는 입력 필드 단위 CSS로 해결 가능하다.

## Fixed bottom action + keyboard (2026-07)

- 상태: accepted
- 기록일: 2026-07

피드 작성/데일리 작성/팀 개설처럼 하단 고정 완료 버튼이 있는 화면에서는 키보드가 올라올 때 버튼이 키보드 위로 따라 올라오지 않게 한다.

- **결정**: `useKeyboardVisible()`로 키보드 표시 중 fixed bottom action을 숨긴다.
- **이유**: 버튼이 키보드 위에 붙으면 입력 중 화면이 좁아지고, iOS WebView에서 올라오는 타이밍이 늦어 보여 더 부자연스럽다.
- **적용처**: `FeedFormView`, `DailyFeedFormView`, `TeamCreatePage`.
- **주의**: submit affordance가 사라지는 대신 키보드 완료/blur 후 하단 버튼이 돌아오는 흐름을 전제로 한다. 입력 중에도 반드시 제출이 필요한 화면은 별도 inline action을 검토한다.

## 시트 높이 단위 — dvh(비율) 우선, 고정 px 지양 (2026-07)

- 상태: accepted
- 기록일: 2026-07

"댓글이 N개 딱 보이는 높이로 맞춰달라" 같은 요청을 받으면, 항목 높이·gap·헤더/입력창을 계산해 목표 px를 뽑더라도 **그 값을 고정 `px`로 박지 않고 기준 디바이스 대비 `%`로 환산해 `dvh`로 적용한다.**

- **이유**: 고정 px는 기기 화면 크기가 다르면 "몇 개가 보이는가"가 기기마다 달라짐(작은 기기는 넘치고 큰 기기는 여백만 남음). `dvh`는 화면 비율에 따라 자연스럽게 스케일되어 이 프로젝트의 반응형 방향과 맞음.
- **적용 예 (`comment-bottom-sheet-base`)**: 댓글 4개(행 40px + `gap-5`) + 헤더(드래그핸들+제목) + 입력창을 합치면 목표 높이 ≈ 384px. 이를 iPhone 15 기준(852pt 높이)으로 환산해 `45dvh`로 적용(`46dvh` → `45dvh`로 조정, 기존값도 이미 근접했음).
- **한계**: 비율 기반이라 다른 화면 크기에서는 "정확히 N개"가 아니라 근사치가 됨을 요청 시 미리 안내한다.

## 참고

- 상태: accepted
- 기록일: 2026-09-23

- `react-spring + @use-gesture/react` — 가장 유연하지만 직접 만들어야 하는 코드량 많음
