# 트러블슈팅 요약 — 재발 가능성 높은 패턴

`history.md`, `2026-07-session-history.md` 등 상세 세션 로그(검증 커맨드·PR 단위 기록 포함)는
개인 회고/포트폴리오 자료로 로컬에 남겨두고 있다. 이 문서는 그중 **다른 화면·다른 사람이
다시 마주칠 가능성이 높은 패턴만** 골라 증상/원인/해결/배움 위주로 압축한 팀 공유용 요약이다.

같은 유형의 버그를 만들지 않기 위해, 새 화면이나 유사 기능을 만들기 전에 관련 섹션을 먼저
훑어보는 용도로 쓴다. 구조·라이브러리 선택 근거처럼 지금도 유효한 결정 자체는 여기가 아니라
`decisions/`에 있다.

## 1. 인증 / 세션 / 라우팅 가드

- **분기 후 `return` 누락으로 이중 navigate**: 조건부 리다이렉트 뒤에 다음 줄 navigate가 그대로
  실행되는 사고가 반복됨. 이벤트 핸들러는 분기 직후 즉시 `return`으로 끊는다.
- **보호 라우트 가드는 서버 진실 기준으로 동기화**: 클라이언트 캐시만 보고 판단하면 서버 상태
  갱신 전에 같은 화면으로 되돌아가는 무한 리다이렉트가 생긴다.
- **mutation 직후 navigate하면, 목적지 loader가 읽는 캐시는 동기적으로 확정**해야 한다.
  `invalidateQueries`(비동기 refetch)만 믿으면 레이스가 생긴다 — 대신 `setQueryData`로 즉시
  갱신. 이 레이스는 실제로 e2e(webkit)에서만 재현되는 프로덕션 버그였다.
- **여러 호출부의 토큰 갱신 로직을 하나로 통합할 때, raw `axios.post`와 `instance.post`(baseURL·
  기본 헤더·인터셉터 제외 목록 포함)를 착각하면 배포 후 100% 재현되는 로그인 풀림**이 생길 수
  있다. 통합 전 각 호출부가 정확히 어떤 설정을 타는지 먼저 diff로 확인.
- **여러 증상이 동시에 보고되면 "같은 원인의 부작용"인지부터 확인**한다. 감으로 추정하기보다
  `git diff`로 "이 리팩터링은 로직을 안 바꿨다"를 먼저 증명하는 게 더 빠르고 확실하다.
- **온보딩/약관처럼 멀티스텝 가입 플로우를 가로지르는 컨텍스트(예: 초대 토큰)는 `location.state`
  로 살아남지 않는다.** 진입점에서 `sessionStorage`에 핀하고 종료점에서 복귀한다.

## 2. 히어로/공유요소 전환 (ssgoi)

가장 반복 발생한 유형. 공통 원인은 거의 항상 **"source/target이 같은 좌표계·같은 시점에 존재하지
않음"** 하나로 수렴한다.

- **좌표계 불일치**: 내부 `overflow-y-auto` 스크롤 컨테이너를 쓰는 화면은 `window.scrollY` 기준
  라이브러리 계산과 실제 화면 위치가 어긋난다. → hero 저장 좌표를 스크롤 컨테이너 기준 로컬
  좌표(`scroll-content` 모드)로 변환해서 저장.
- **비동기 mount 환경(카카오 지도 SDK 등)은 hero target이 첫 프레임에 없을 수 있다.** →
  sessionStorage에 직전 클릭 대상을 저장해두고 mount 시 `useState` 초기값으로 동기 렌더(placeholder
  선점) — "race를 줄이기"보다 "race를 회피"하는 접근이 더 견고하다.
  library 옵션이 없다고 포기하기 전에 **라이브러리가 요구하는 조건을 우리가 직접 만들 수 있는지**
  먼저 검토.
- **hero 캡처 시점은 `pointerDown`이 아니라 클릭이 확정되는 시점에**: 미리 캡처하면 스크롤
  제스처만 하고 끝내도 사본이 잔상처럼 남는다.
- **스크롤 복원 전에 hero 사본을 먼저 렌더하면 안 됨**: 스크롤 위치가 복원되기 전에 라이브러리가
  DOM을 보고 좌표를 확정하면, "맨 위 기준으로 갔다가 실제 위치로 찾아오는" 흔들림이 생긴다. →
  `scrollRestored`가 true일 때만 hero 사본을 렌더.
- **`getBoundingClientRect()`의 소수점 좌표를 device pixel 기준으로 스냅**하지 않으면 마지막
  0.x~1px 흔들림이 남는다.
- **삭제처럼 "의도가 있는" backward는 일반 backward와 다르게 처리하고 싶을 때**: path만으로는
  구분이 안 되면, sessionStorage 플래그 + transition 라이브러리의 middleware/path 치환으로
  "의도 → 경로" 매핑을 만든다(가짜 sentinel path 사용, enum까지 갈 필요 없음).
- **레터박스/blur-up은 hero geometry와 분리**: hero 전환 목적지는 항상 화면의 고정 프레임
  비율이어야 하고, 원본 이미지 비율은 프레임 내부의 `object-contain`/`cover` 결정에만 써야 한다.
  전환 자체에 원본 비율을 섞으면 프레임이 매번 다르게 계산돼 더 불안정해진다.
- **라이브러리 메이저 업그레이드는 화면별로 한 번씩 직접 확인**한다. d.ts/문서에 안 나오는 런타임
  동작 차이(예: path 매칭이 `:param`을 지원 안 함)가 핵심 원인일 때가 많다.

## 3. 카메라 / 미디어

- **비동기 미디어 리소스는 "stream 존재"가 아니라 "metadata/decode 완료"를 준비 상태 기준으로
  삼는다.** `getUserMedia` 성공 즉시 `isReady=true`로 하면 0px canvas 캡처, preview 배율 튐 등이
  생긴다.
- **미리보기(`object-cover`)와 합성 결과(원본 좌표) 좌표계가 다르면 스티커/오버레이 위치가
  어긋난다.** 표시 좌표 ↔ 원본 좌표 변환은 한 곳에 "transform matrix"로 정의해 양쪽이 같은 걸 쓰게
  한다.
- **iOS는 요청한 비율(9:16, 3:4)보다 좁은 화각의 stream을 고를 수 있다.** 가로 wide constraint로
  요청하고 `enumerateDevices()`로 후면 wide 카메라를 선호(telephoto 회피)하는 편이 실제 화각을
  더 잘 보존한다.
- **Capacitor 파일 URL(`capacitor://...`)은 `fetch()` 대상이 아니라 Filesystem 플러그인 대상.**
  WKWebView는 화면 표시용 URL과 JS fetch 가능 URL의 보안 정책이 다르다.
- **canvas `context.filter` API는 일부 WebKit에서 setter/getter는 통과하지만 실제 렌더링엔
  조용히 반영 안 될 수 있다(알려진 버그).** 기능 감지(probe)에 기대지 말고, 처음부터 픽셀 직접
  연산 경로로 통일하는 편이 이 버그 클래스 자체를 없앤다.
- **StrictMode의 mount→unmount→remount 두 번 호출을 고려해 ref 초기화는 cleanup의 역연산을
  반드시 수행**해야 한다(안 하면 영구 false로 굳는 ref가 생길 수 있음).
- **async submit 버튼은 항상 in-flight 플래그로 disabled 강제** — 안 그러면 빠른 연타로 중복
  실행된다.

## 4. 바텀시트 / 키보드 / 제스처

- **iOS는 16px 미만 input 포커스 시 자동 확대한다.** viewport `maximum-scale` 차단은 접근성도
  해치고 Capacitor 실기기에서 안정적으로 안 먹힌다. → 실제 `font-size: 16px` + `transform: scale()`
  로 시각 크기만 기존 디자인에 맞추는 쪽이 유일하게 안정적으로 동작했다(자세한 내용은
  `decisions/records/bottom-sheet.md`).
- **iOS WebKit은 input 포커스 시 `overflow: hidden`을 무시하고 document(body) 자체를 스크롤한다.**
  `body { overflow: hidden }`만으론 못 막고, `position: fixed; inset: 0`으로 document 스크롤
  경로 자체를 없애야 한다.
- **여러 오버레이(시트+모달)가 겹칠 때 "닫힘 시점"은 다음 오버레이 표시 확정 이후로 미룬다.**
  즉시 close를 먼저 부르면 아래 시트가 확인 모달과 동시에 닫혀버린다.
- **제스처 충돌(롱프레스 vs 스와이프, 핀치 손가락 수 변경 등)은 임계치 기반 disambiguation으로
  푼다.** 즉시 `preventDefault()`는 다른 제스처를 죽이는 부작용이 있다. `pointercancel`도 항상
  같이 처리해야 멀티터치 전이가 안정적이다.
- **롱프레스 제스처 시작 컨테이너 자체에 `select-none`/`-webkit-user-select:none`을 걸어야
  한다.** 자식에만 걸면 텍스트 selection이 먼저 잡혀 이어지는 시트의 첫 탭이 씹힌다(iOS가 첫
  탭을 selection 해제에 소모).
- **compositor thread(transform/opacity)만 애니메이션시키고, layout을 유발하는 속성(padding,
  grid-template-rows, height)은 즉시 스냅**시켜야 네이티브급으로 부드럽다. 같은 요소에 layout
  속성과 transform을 동시에 걸면 이중 모션처럼 보인다.
- **고빈도 이벤트(드래그/포인터무브)에서 `getBoundingClientRect()`는 시작 시 1회만 캐시**한다.
  매 이벤트마다 부르면 layout thrashing이 생긴다.

## 5. 레이아웃 / safe-area / 바텀 내비게이션

- **"바의 높이"와 "바 위로 튀어나온 장식 요소(플로팅 버튼 등)까지 포함한 실제 가림 영역"은
  다른 값이다.** 여러 화면이 같은 매직 넘버(예: `60px`)로 각자 여백을 계산하면, 버튼이 튀어나온
  만큼은 항상 가려질 수 있다 — 공용 CSS 변수 하나로 묶어 한 곳만 고치면 되게 한다.
  같은 이유로 padding 매직 넘버는 디자인 토큰/CSS 변수로 관리한다.
- **모바일 fixed 영역(bottom nav, sheet button, FAB)은 항상 `env(safe-area-inset-bottom)`
  합산.**
- **`truncate`/`line-clamp`만이 text overflow를 실제로 막는다.** `break-keep`은 줄바꿈 규칙일
  뿐 overflow 보호가 아니다.
- **Android edge-to-edge에서는 `env(safe-area-inset-top)`만으로 상태바 높이가 안정적으로 안
  들어온다.** 네이티브 상태바 실측값을 CSS 변수로 연결해야 한다. iOS/Android 키보드 보정은
  플랫폼별로 분리해서 검증 전까지 서로 침범하지 않게 한다.
- **내부 스크롤 컨테이너를 쓰면 브라우저 기본 scroll restoration에 기대지 말고 컨테이너
  `scrollTop`을 직접 저장/복원**한다.

## 6. 상태 / 데이터 동기화

- **로딩 중에도 빈 배열(`[]`)로 평가되면 empty state가 잠깐 노출된다.** `isLoading` 가드를 empty
  판정보다 먼저.
- **핵심 식별자(teamId, questionId 등)는 falsy 가드를 가드 절 한 줄에 모은다.** 0/undefined를
  fallback으로 쓰지 않는다 — 실제로 "항상 0번 ID로 삭제 요청"류 버그의 원인이었다.
- **같은 도메인 식별자를 여러 화면이 각자 다른 소스(전역 상태 vs 서버 응답)로 해석하면
  split-brain이 생긴다.** 단일 출처를 정하거나, 안 맞을 때 자동으로 맞추는 self-heal 로직을
  둔다.
- **optional/patch 필드의 "변경 없음"은 빈 값이 아니라 키 생략으로 표현한다.** 백엔드 스펙에
  없는 sentinel 값(빈 문자열 등)을 임의로 만들면 서버가 그 값을 파싱하다 500을 낼 수 있다.
- **부동소수점/좌표 동등 비교는 epsilon 비교로 통일.** 미세한 부동소수점 차이로 같은 위치가
  다른 그룹으로 분류될 수 있다.
- **한 도메인의 mutation이 다른 도메인의 목록에도 영향을 주면(예: 데일리 글쓰기 → 피드 목록),
  그 목록 캐시도 함께 invalidate**해야 한다. "이 변경이 어떤 화면의 목록을 바꾸는가" 기준으로
  invalidate 범위를 설계.
- **무한스크롤 observer 부착 effect가 sentinel의 조건부 렌더(로딩 중 미렌더) 타이밍에 맞춰
  재실행되는지 반드시 확인.** "관찰자 재생성을 줄이자"고 deps를 좁히면 cold load에서 영영
  미부착 상태로 회귀할 수 있다.

## 7. 접근성

- **클릭 가능한 요소는 항상 시맨틱(`button`/`a`)으로.** `div`/`section`/`article` + `onClick`은
  키보드/스크린리더 접근이 막히고, 반복적으로 리뷰에서 지적된다. 컴포넌트가 `onClick` prop을
  받으면 자동으로 button 시맨틱으로 떨어지게 가드하는 편이 재발을 막는다.
- **뷰포트 확대(`maximum-scale`) 제한은 입력 UX 개선 목적과 접근성 저해를 항상 함께 검토.**
- **onClick 없이 노출되는 버튼은 `disabled`로 포커스/활성화까지 막는다** (시각적 회색 처리와는
  별개로).

## 8. 빌드 / 환경 / CI

- **`yarn lint`가 `android/**`/`ios/**`같은 네이티브 생성 산출물까지 검사 대상에 넣지 않도록`globalIgnores`로 명시 제외.** minified 빌드 산출물에 프로젝트 lint rule을 적용하면 안 된다.
- **`tsc --noEmit`을 project-reference(`files: []` + `references`) 구성에서 build mode(`-b`)
  없이 돌리면 아무것도 검사하지 않고 조용히 통과할 수 있다.** `type-check` 스크립트가 실제로
  실패해야 할 때 실패하는지 가끔 의심해본다.
- **Windows/nvm/corepack 등 로컬 환경 경로 문제는 프로젝트 표준 패키지 매니저(Yarn)를 유지하며
  shell profile을 정리하는 방향으로 푼다.**
- **큰 리팩터링은 청소 → 코드 품질 → 유틸 추출 → 보안 → 구조처럼 단계로 쪼개고, 회귀 위험이 큰
  작업은 사전에 별도 PR로 분리한다.** 각 단계마다 검증(`type-check`/`lint`/`build`/`test`)을
  통과한 뒤에만 다음 단계로 진입.
- **"의미 있는 리팩토링"인지는 매번 검증한다.** 표면적으로 어색해 보이는 코드가 다른 레이어
  (예: query 훅의 `enabled` 가드)에서 이미 방어되고 있으면 리팩토링 가치가 0일 수 있다 — 방어
  레이어 전체를 먼저 매핑.

## 9. 네이티브(Capacitor) / 배포

- **Capacitor 기기에서 API가 전부 막히거나 지도 SDK가 로드 안 될 때 1순위 의심은
  `server.hostname`이 프로덕션 도메인과 다른 것.** WebView origin이 `localhost`면 CORS·쿠키·
  SDK 도메인 화이트리스트가 전부 "모르는 origin"으로 취급된다. `capacitor.config.ts`의
  `server.hostname`을 프로덕션 도메인에 맞추면 근본적으로 해결된다(백엔드 CORS에 localhost
  추가하는 임시방편보다 우선 검토).
- **iOS 권한 팝업은 OS 정책상 한 번 거절되면 앱에서 다시 띄울 수 없다.** `denied` 상태는
  팝업 재시도가 아니라 설정 화면 안내로 처리해야 한다.
- **웹뷰(WKWebView) JS는 iOS 시스템 pasteboard의 특수 포맷(예: 인스타 스토리 sharedSticker)에
  직접 쓸 수 없다.** 이런 요구는 순수 웹으로 못 끝내고 네이티브(Swift) 작업이 필요 —
  진행 상황은 `known-issues/`에서 추적.
- **App Store 심사는 정책 변경/리뷰어 재량 여지가 있어 한 번 통과했다고 영구 안전하지 않다.**
  UGC 신고/차단처럼 과거 거절 이력이 있는 항목은 `tasks/app-store-guideline-checklist.md`에서
  지속 재검토.
