# Maintenance Harness Backlog

## Status

- 상태: proposed
- 기록일: 2026-09-23

Proposed

## Context

- 상태: proposed
- 기록일: 2026-09-23

프로젝트는 현재 Frontend CI, E2E, visual regression, CodeQL, design token check를 갖추고 있다.
다만 dependency 업데이트, dependency 변경 검토, coverage 관측, PWA 성능 점검, Capacitor 변경 감지는 아직 별도 유지보수 하네스로 고정되어 있지 않다.

이 문서는 지금 바로 적용하지 않지만, 추후 프로젝트 유지보수 안정성을 높이기 위해 검토할 하네스 후보를 정리한다.

## Decision

- 상태: accepted
- 기록일: 2026-09-23

다음 항목을 추후 도입 후보로 둔다.

1. Dependabot 또는 Renovate
2. Dependency Review workflow
3. Vitest coverage report artifact
4. Lighthouse CI
5. Capacitor change guard

Dependabot은 먼저 도입한다(→ 이미 적용됨, 아래 Candidates #1 참고). 나머지는 PR 노이즈, CI 시간, flaky 가능성, GitHub 권한/plan 제약을 확인한 뒤 필요한 것부터 작은 단위로 적용한다.

## Candidates

- 상태: proposed
- 기록일: 2026-09-23

### 1. Dependabot / Renovate

#### 목적

GitHub Actions, npm/Yarn dependencies 업데이트 PR을 자동으로 만든다.

#### 기대 효과

- 오래된 dependency를 수동으로 추적하지 않아도 된다.
- 업데이트 PR마다 기존 CI가 돌아가므로 깨지는 버전을 빠르게 확인할 수 있다.
- 보안 패치나 minor update를 놓칠 가능성이 줄어든다.

#### 선택지

- Dependabot: GitHub 기본 제공, 설정 단순, 초기 도입 비용 낮음.
- Renovate: 업데이트 그룹화, 스케줄, 세밀한 정책 설정이 강함. 설정 복잡도는 더 높음.

#### 권장

초기 유지보수 자동화로 Dependabot을 적용했다.
Renovate는 업데이트 그룹화나 세밀한 정책이 필요해질 때 재검토한다.

#### CI 워크플로우 분리 (2026-09)

- `frontend-ci.yml`(`type-check`/`lint`/`test`/`build`, 시크릿 불필요)은 Dependabot PR에도
  **그대로 돌린다** — 위 "업데이트 PR마다 기존 CI가 돌아가서 깨지는 버전을 확인" 효과가 바로
  이 워크플로우의 존재 이유다.
- `e2e.yml`, `visual.yml`(각 최대 20분 Playwright)은 `if: github.actor != 'dependabot[bot]'`로
  Dependabot PR에서 스킵한다. 정기 patch/minor 버전업이 UI 회귀를 일으킬 확률은 낮은데, 두
  워크플로우 다 flaky 가능성과 실행 비용이 커서 비용 대비 효과가 낮다.
- `pr-auto-setup.yml`은 이미 동일 조건으로 dependabot을 제외하고 있었다(리뷰어/라벨 자동 지정은
  봇 PR에 의미 없음).
- `jira-sync.yml`은 `issues` 이벤트에만 반응하고 `pull_request`는 보지 않아 Dependabot PR과
  애초에 무관 — 별도 조치 불필요.

#### 주의점

- 자동 PR이 많아질 수 있다.
- major update는 자동 머지하지 않는다.
- GitHub Actions update와 package update를 분리할지 그룹화할지 정해야 한다.

### 2. Dependency Review Workflow

#### 목적

PR에서 새 dependency가 추가되거나 버전이 바뀔 때 취약점과 라이선스 리스크를 확인한다.

#### 기대 효과

- 위험한 dependency 추가를 PR 단계에서 차단하거나 경고할 수 있다.
- dependency 변경이 코드 리뷰에서 놓치는 것을 줄인다.
- 보안/라이선스 기준을 명시적으로 남길 수 있다.

#### 권장

dependency 추가/변경이 잦아지거나 보안 기준을 강화할 때 추가한다.
Dependabot 도입 후 같이 붙이면 dependency update PR을 더 안전하게 검토할 수 있다.

#### 주의점

- GitHub plan/권한 제약을 확인해야 한다.
- 라이선스 allow/deny 정책을 너무 엄격하게 시작하면 PR 흐름을 막을 수 있다.
- 처음에는 fail보다는 report/warn 중심으로 시작하는 것이 안전하다.

### 3. Vitest Coverage Report Artifact

#### 목적

테스트 커버리지를 PR 또는 CI 산출물로 확인할 수 있게 한다.

#### 기대 효과

- 테스트가 어느 영역에 부족한지 관측할 수 있다.
- coverage threshold를 바로 강제하지 않아도 추세를 볼 수 있다.
- 신규 기능에 테스트 누락이 반복되는지 확인할 수 있다.

#### 권장

초기에는 threshold를 강제하지 않는다.
`yarn test --coverage` 결과를 artifact로 업로드하는 정도부터 시작한다.

#### 주의점

- threshold를 갑자기 걸면 유지비가 커지고 의미 없는 테스트가 늘 수 있다.
- UI-heavy 코드의 coverage 수치는 실제 품질과 다를 수 있다.
- 먼저 coverage report를 보고 팀 기준을 정한 뒤 threshold를 검토한다.

### 4. Lighthouse CI

#### 목적

PWA, 성능, 접근성, SEO 등 브라우저 품질 지표를 자동 측정한다.

#### 기대 효과

- PWA/성능 회귀를 수치로 관측할 수 있다.
- 큰 UI 변경이나 번들 변경 이후 성능 영향을 확인할 수 있다.
- 접근성/Best Practices 신호를 CI 산출물로 남길 수 있다.

#### 권장

필수 PR check로 바로 넣지 않는다.
모바일 앱/PWA 특성상 flaky할 수 있으므로 수동 실행 또는 nightly/scheduled workflow부터 검토한다.

#### 주의점

- CI 환경의 네트워크/CPU 영향으로 결과가 흔들릴 수 있다.
- 점수 fail 기준을 너무 강하게 잡으면 false positive가 많아질 수 있다.
- 측정 대상 route와 login/auth 상태를 명확히 정해야 한다.

### 5. Capacitor Change Guard

#### 목적

Capacitor 관련 변경이 있을 때 `cap sync` 필요 여부와 native 영향 범위를 확인한다.

#### 감지 대상

- `capacitor.config.ts`
- `android/**`
- `ios/**`
- `package.json`의 `@capacitor/*` dependency
- native bridge 관련 코드
- PWA/native asset 변경

#### 기대 효과

- 웹 변경과 native sync 필요 변경을 구분할 수 있다.
- Capacitor dependency 변경 후 sync 누락을 줄인다.
- iOS/Android 빌드 영향이 있는 PR을 리뷰어가 빠르게 알 수 있다.

#### 권장

처음에는 문서/체크리스트 또는 warning workflow로 시작한다.
필수 native build까지 걸면 CI 비용과 시간이 커질 수 있으므로, 실제 배포 단계가 안정화된 뒤 강화한다.

#### 주의점

- Android/iOS CI는 runner와 캐시 설정 비용이 크다.
- native build를 PR마다 강제하면 피드백 시간이 길어진다.
- 먼저 변경 감지와 안내 코멘트 수준으로 시작하는 것이 현실적이다.

## Recommended Rollout

- 상태: proposed
- 기록일: 2026-09-23

1. Dependabot 적용
2. Dependency Review를 warn/report 모드로 검토
3. Vitest coverage artifact 추가
4. Capacitor change guard를 문서 또는 warning workflow로 추가
5. Lighthouse CI는 수동 또는 scheduled workflow로 실험

## Non-goals For Now

- 상태: proposed
- 기록일: 2026-09-23

- 모든 dependency update 자동 머지
- coverage threshold 즉시 강제
- Lighthouse 점수 기반 PR 필수 차단
- PR마다 Android/iOS native build 강제
- AI review workflow를 자동으로 다시 활성화

## Follow-up

- 상태: proposed
- 기록일: 2026-09-23

- Dependabot PR 노이즈와 그룹화 기준 모니터링
- Dependency Review workflow 적용 가능 여부 확인
- coverage artifact workflow 또는 CI step 후보 작성
- Capacitor 변경 감지 기준 문서화
- Lighthouse 측정 route와 실행 주기 결정
- GitHub plan/권한/secret 제약 확인
