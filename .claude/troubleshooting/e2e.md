# 트러블슈팅 — Playwright E2E 도입 (89-test/e2e-test)

E2E 환경 구축 및 main 머지 과정의 문제와 해결. 핵심은 **e2e 테스트가 실제 프로덕션 레이스 버그를 잡아낸 것**.

---

## 1. ⭐ e2e가 발견한 프로덕션 버그 — 약관 동의 직후 온보딩 진입이 막힘

### 증상

- `onboarding.spec.ts` "전체 동의 후 다음 버튼 클릭 시 온보딩으로 이동" 테스트가 **mobile-safari(webkit)에서만** 실패. chrome은 통과. 모든 retry 실패(플레이크 아님).
- `waitForURL(/onboarding$/)` timeout.

### 진단 (trace 아티팩트가 결정적)

- 실패 순간 스크린샷/page-snapshot: **약관 페이지에 머묾 + 3개 항목 모두 `[pressed]`(동의됨) + 시작하기 버튼 `[active]`(클릭됨)**.
- 체크 상태가 **유지**됨 → `/onboarding`으로 갔다가 로더가 **같은 `/terms`로 되돌려서** TermsPage가 remount되지 않은 것(같은 라우트라 로컬 상태 보존). 즉 네비게이션이 일어났다가 되돌려졌음.

### 근본 원인 — 캐시 무효화 vs 네비게이션 레이스

- `useTermsFlow.submit`: `await putAgreements()` 직후 `navigate(ONBOARDING)`.
- `usePutAgreements.onSuccess`: `invalidateQueries(userKeys.all)` — **fire-and-forget**(await 안 함). agreements 쿼리는 컴포넌트 observer가 없는 **inactive** 상태라 invalidate해도 자동 refetch 안 됨, stale 마킹만.
- `setupFlowLoader`는 `/onboarding` 진입 시 `fetchQuery(agreements, staleTime 5분)`로 동의 여부 확인 → `!hasAgreedAll`이면 `redirect(/terms)`.
- **레이스**: 무효화 마킹과 로더의 캐시 읽기 타이밍 경합. webkit(느림)에선 로더가 **agreed 반영 전 캐시(false)**를 읽어 `/terms`로 리다이렉트. chrome은 우연히 통과.
- → 실제 유저도 동의 직후 온보딩 진입이 막혀 약관으로 튕길 수 있는 **프로덕션 버그**.

### 해결

`usePutAgreements.onSuccess`에서 **agreements 캐시를 동기적으로 `setQueryData`로 agreed=true 설정**(해당 키는 invalidate 안 함). 로더가 신선한 true 캐시를 그대로 읽어 리다이렉트 제거 — 레이스 자체 소멸, 전 브라우저 결정적. me만 별도 invalidate.

### 배움

- **e2e의 진짜 가치**: 단위 테스트가 못 잡는 "라우터 가드 + 비동기 캐시 + 네비게이션"의 통합 타이밍 버그를 잡음. webkit-only 실패를 "플레이크"로 치부하지 않고 trace를 본 게 핵심.
- **mutation 후 곧바로 navigate하면, 그 목적지의 loader/guard가 의존하는 캐시는 navigate 전에 동기적으로 확정**해야 한다. invalidate(비동기 refetch)에만 의존하면 레이스.
- 실패 원인은 timeout(타이밍)이 아니라 캐시 상태였음 — timeout만 늘리는 시도는 무의미했다. **trace 스크린샷이 원인을 단번에 확정**.

---

## 2. E2E CI 부트스트랩 이슈 (부수적)

- **corepack EACCES**: Playwright 컨테이너(`--user 1001` 비루트)에서 `corepack enable`이 root 소유 `/usr/bin`에 심링크 못 만들어 실패. `sudo`는 이미지에 없음(`sudo: not found`). → `corepack enable --install-directory "$HOME/.local/bin"` + `$GITHUB_PATH` 추가로 비루트 해결. (호스트에서 도는 frontend-ci는 영향 없음 — 컨테이너 잡만)
- **속도**: `workers: 1 → 2`, `retries: 2 → 1` (GH 러너 2코어). 5.9m → 53s.
- **그리드뷰 기본 변경의 여파**: 피드가 그리드뷰 기본이 되며 본문 텍스트가 `alt`로만 들어가 `getByText` 기반 e2e가 깨짐. 테스트에서 sessionStorage로 list view 시드(`seedFeedListView`).

## 3. main 머지 부작용 (부수적)

- `MeResponse` 타입에 `name`/`profileCharacterType` **중복 필드** — e2e 브랜치와 main이 같은 인터페이스에 각자 필드 추가 → git이 충돌 없이 둘 다 합침. tsc 빌드에서만 검출(`type-check`는 루트 tsconfig `files:[]`라 무검사 — `build`의 `tsc -b`가 실질 검사). 중복 제거로 해결.
