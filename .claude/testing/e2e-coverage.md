# E2E 커버리지 맵 (Playwright)

`e2e/*.spec.ts`가 무엇을 검증하는지 정리. 셀렉터는 텍스트/role 기반, API는 `e2e/fixtures/api.ts`의 `page.route` mock 사용.

- 실행: `yarn e2e` (CI는 호스트 러너 + `playwright install`, `serviceWorkers: 'block'`)
- 프로젝트: `mobile-chrome`, `mobile-safari` (PR은 chrome만, `main` push는 둘 다)
- 공통 픽스처/헬퍼: `mockApi`, `wrap`/`json`, `skipSplash`, `seedFeedListView`, `stubKakaoMap`, `mockMediaUpload`, `stubCamera`, `auth.ts`(스플래시 자동 skip `test`)

## 인증·진입 / 비인증

| 스펙                 | 흐름                                                                                                                  | 핵심 검증                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `smoke.spec.ts`      | 스플래시→로그인, 재진입 바로 로그인, 소셜 버튼 3종 / PWA·SEO 메타(og, manifest, robots, sitemap) / 반응형 캔버스 풀폭 | 비인증 부팅 흐름 + 메타                                    |
| `protected.spec.ts`  | 비인증으로 보호 라우트 접근 시 로그인 리다이렉트 / 없는 경로 → NotFound                                               | 라우트 가드                                                |
| `onboarding.spec.ts` | 약관 전체 동의 → 온보딩 이동 / 온보딩 결과에 `/me` 이름 표시                                                          | 약관→온보딩, agreements mock **stateful**(PUT 후 GET true) |
| `invite.spec.ts`     | `/invite/:token` preview → "초대장 확인" → 팀 프로필 셋업 이동                                                        | 초대 로더 + 미리보기                                       |

## 팀 / 네비게이션 / 마이

| 스펙                  | 흐름                                                      | 핵심 검증                        |
| --------------------- | --------------------------------------------------------- | -------------------------------- |
| `navigation.spec.ts`  | 바텀 네비 홈/피드/활동/마이 4탭 이동, 탭 유지             | 라우팅                           |
| `home-empty.spec.ts`  | 팀 없는 사용자 → 홈/피드/활동에서 EmptyTeamView           | 빈 팀 가드                       |
| `team-create.spec.ts` | `/teams/new` 입력 → 프로필 셋업 → POST `/teams` → `/home` | 팀 생성(아바타 없이)             |
| `team-switch.spec.ts` | 활동 페이지 헤더 → 팀 선택 시트 → 다른 팀 → 활성 팀 갱신  | `useActiveTeamSelection`         |
| `mypage.spec.ts`      | 팀 카드: 멤버 다수 시 `+N` 칩 / 6명 이하 칩 없음          | `AvatarGroup` max/+N             |
| `home-map.spec.ts`    | 카카오 지도 SDK stub으로 에러 없이 마운트                 | `stubKakaoMap` (`map/pins` mock) |

## 피드 / 데일리

| 스펙                   | 흐름                                                                             | 핵심 검증                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `feed-flow.spec.ts`    | 피드 목록 1개 + 카운트 / 아이템 클릭 → 상세                                      | 리스트뷰 시드(`seedFeedListView`)                                             |
| `feed-create.spec.ts`  | 사진 **파일 업로드**(`setInputFiles`) + 미디어 4단계 → POST `/feeds` → 목록 복귀 | `mockMediaUpload` (피드는 카메라 아님)                                        |
| `feed-delete.spec.ts`  | 내 피드 상세 → 더보기 → 삭제 → ConfirmDialog 확정 → 목록 복귀                    | `isMine` mock, `role="alertdialog"` 스코프                                    |
| `daily-create.spec.ts` | 카메라 캡처 → 업로드 → POST 답변 → 목록 복귀                                     | `stubCamera`(getUserMedia→canvas). ⚠️ webkit captureStream 한계로 불안정 가능 |

## 접근성

| 스펙           | 흐름                                 | 핵심 검증               |
| -------------- | ------------------------------------ | ----------------------- |
| `a11y.spec.ts` | 로그인 페이지 `@axe-core/playwright` | critical/serious 위반 0 |

## 미커버 (유닛 위임 / 보류)

- **댓글/핀 추가** — 롱프레스 제스처 + 캔버스 좌표 + 접근성 이름 없는 핀 → e2e flaky·저ROI. `usePinComments.test.ts` 유닛이 로직 커버
- **피드 편집(PATCH)** — 삭제만 e2e, 편집 폼은 미작성
- **카카오 지도 핀 클릭/클러스터 상호작용** — stub의 좌표가 고정이라 위치 검증 불가, 마운트/에러 없음까지만
- 상세 보류 사유는 `.claude/tasks/todo.md`의 "추후 예정" 참조

## 관련 문서

- 인프라/CI 트러블슈팅(컨테이너→호스트, SW 우회 버그): `.claude/troubleshooting/e2e.md`
- 잔여 작업: `.claude/tasks/todo.md`
