# Domain: Feed

팀 피드 목록, 피드 상세, 댓글, 보기 방식과 관련된 도메인.

## Routes

| 경로         | 페이지                  |
| ------------ | ----------------------- |
| `/feed` 계열 | `src/pages/feed/`       |
| 피드 상세    | `src/pages/feedDetail/` |

라우트 상수와 동적 경로는 `src/app/routes/paths.ts`를 먼저 확인한다.

## 주요 위치

```text
src/pages/feed/
├── ui/       # 목록, grid/list item, toolbar, skeleton (FeedPage가 view mode 상태도 소유)
├── lib/      # API item adapter (adaptFeedListItem 등)
└── model/    # page-local 타입

src/pages/feedDetail/
├── hooks/    # useFeedDetail
└── ui/       # FeedDetailPage

src/shared/api/feed/
src/shared/api/feedComment/
src/shared/hooks/feed/
```

## 작업 기준

- 서버 상태는 `shared/api/feed` 또는 `shared/api/feedComment`의 query/mutation을 통해 가져온다.
- page-local 표시 모델은 `pages/feed/model` 또는 `pages/feed/lib/adaptFeedListItem.ts`에서 변환한다.
- view mode(grid/list)는 별도 storage 유틸이 아니라 `FeedPage`가 현재 라우트의
  `location.state.feedViewMode`로 들고 있다 — 같은 history entry로 돌아오면 유지되고(리스트뷰
  → 상세 → 뒤로가기), 새 navigation(다른 탭 경유 재진입, 팀 전환)이면 그리드뷰 기본값으로
  리셋된다. `sessionStorage`에 영속시키지 않는다(의도적 — `troubleshooting/notable-fixes.md`
  §2, 세션 간 유지 시 탭 전환 후에도 리스트뷰가 남는 문제가 있었음).
- 목록/상세/댓글 변경 시 loading, empty, error, optimistic update 가능성을 확인한다.
- 피드 데이터가 팀 선택에 의존하면 active team query/store 경계를 먼저 확인한다.

## 검증

- 목록 표시 로직(view mode 포함): `FeedPage.test.tsx` 또는 관련 unit test
- 상세/댓글 플로우 변경: `yarn test --run` + 필요 시 Playwright feed flow
- UI 변경: 관련 story 또는 E2E screenshot/trace 확인
