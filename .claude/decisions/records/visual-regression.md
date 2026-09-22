# 시각 회귀 테스트 (VRT)

Playwright `toHaveScreenshot` 기반 픽셀 회귀 검사. 도입 2026-06 (branch `124-test/e2e-test`).

## 구성

- 상태: accepted
- 기록일: 2026-06

```
e2e/
├── visual.spec.ts                 ← @visual 스펙 (6종)
├── visual.spec.ts-snapshots/      ← baseline PNG (linux 한 세트, 커밋 대상)
└── fixtures/api.ts                ← mock·stub 헬퍼
playwright.config.ts               ← VISUAL env 기반 grep 분기
.github/workflows/visual.yml       ← 고정 컨테이너에서 비교/생성
```

## @visual 격리 — `VISUAL` env

- 상태: accepted
- 기록일: 2026-06

기능 e2e(`e2e.yml`)·로컬 `yarn e2e`에서는 VRT를 **자동 제외**한다. baseline은 OS별 렌더가 다르므로, 고정 컨테이너 밖에서 돌면 깨지기 때문.

```ts
// playwright.config.ts
grep: process.env.VISUAL ? /@visual/ : undefined,
grepInvert: process.env.VISUAL ? undefined : /@visual/,
```

- `e2e.yml` → `VISUAL` 없음 → `@visual` 제외 (기능 테스트만)
- `visual.yml` → `VISUAL: '1'` → `@visual`만
- 로컬 기본도 제외 → 로컬에서 baseline 깨질 일 없음

## 왜 컨테이너인가 (e2e와 차이)

- 상태: accepted
- 기록일: 2026-06

|      | `e2e.yml`            | `visual.yml`                                                              |
| ---- | -------------------- | ------------------------------------------------------------------------- |
| 러너 | `ubuntu-latest` 직접 | `ubuntu-latest` + `container: mcr.microsoft.com/playwright:v1.60.0-jammy` |
| 검증 | 동작/텍스트          | 픽셀 스크린샷                                                             |

VRT는 폰트·안티앨리어싱 차이에 민감. `ubuntu-latest`는 폰트 패키지가 업데이트되며 drift할 수 있어, **태그 고정 이미지**로 렌더링 환경을 못박는다. 기능 e2e는 픽셀 불필요 → 컨테이너 없이 더 가볍게.

> **버전 핀 동기화**: `@playwright/test` 버전을 올리면 `visual.yml`의 이미지 태그(`v1.60.0-jammy`)도 같이 올릴 것. 안 맞으면 브라우저 버전 불일치.

## 결정성 확보

- 상태: accepted
- 기록일: 2026-06

- `stubImages` — 모든 이미지 요청(`resourceType === 'image'`)을 고정 SVG로 대체. 원격 이미지 의존 제거. **다른 route보다 먼저 등록**(가장 늦게 평가 → API route 우선).
- `blockThirdParty` — 카카오·typekit 차단.
- route 기반 API mock — `mockApi`(refresh/me/teams/agreements), `mockActivityHome`, `mockFeedList`, `mockFeedDetail`(상세+댓글), `seedHintSeen`(롱프레스 힌트 오버레이 제외).
- `toHaveScreenshot({ fullPage, animations: 'disabled', maxDiffPixelRatio: 0.01 })` + `document.fonts.ready` 대기.
- **내부 스크롤 화면 캡처**: 앱이 `h-dvh` + `<main>` `overflow-y-auto`라 `fullPage`가 뷰포트까지만 잡힌다. 활동·피드 상세는 해당 테스트에서 `page.setViewportSize({ width: 393, height: 1400 })`로 키워 전 섹션 캡처.
- chromium 한정 — `test.skip(({ browserName }) => browserName !== 'chromium')`로 baseline 한 세트만 유지.

## 대상 6종 (핵심 아키타입)

- 상태: accepted
- 기록일: 2026-06

로그인(인증) · 팀없음 홈(빈 상태) · 활동(데이터 대시보드) · 피드 그리드(리스트) · 피드 상세(상세+핀) · 마이페이지(프로필/리스트).

**의도적 제외**: 실제 지도 홈(카카오 타일 비결정적), 온보딩(애니메이션), 바텀시트·오버레이(Storybook visual 영역 `@chromatic-com/storybook`).

## baseline 시딩 / 갱신

- 상태: accepted
- 기록일: 2026-06

baseline은 **컨테이너(linux)에서만 생성**한다. 로컬(Windows) `--update-snapshots`로 만든 `*-win32.png`는 커밋 금지(CI는 `*-linux.png`를 찾음).

- **시딩**: 첫 실행은 baseline이 없어 생성하며 fail(정상). 실행 페이지 `Artifacts → vrt-baselines` 다운로드 → `e2e/visual.spec.ts-snapshots/`에 넣고 커밋·push → 다음 실행부터 초록.
- **갱신(의도적 UI 변경)**: 바뀐 baseline 파일을 삭제하고 push(→ 재생성→아티팩트) 하거나, `visual.yml` workflow_dispatch(update=true, `--update-snapshots=all`) 실행 후 아티팩트로 커밋.
- `workflow_dispatch` "Run workflow" 버튼은 파일이 default 브랜치(main)에 있어야 노출. 아티팩트 방식은 버튼 없이도 동작.

## 트리거

- 상태: accepted
- 기록일: 2026-06

`pull_request`(→main) · `push`(main) · `workflow_dispatch`. PR 브랜치에 파일이 있으면 머지 전에도 실행됨(도입 PR 포함). 단 게이팅은 baseline 커밋 이후 유효.
