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
├── ui/       # 목록, grid/list item, toolbar, skeleton
├── lib/      # view mode storage, API item adapter
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
- view mode 같은 UI preference는 `pages/feed/lib/viewModeStorage.ts` 패턴을 따른다.
- 목록/상세/댓글 변경 시 loading, empty, error, optimistic update 가능성을 확인한다.
- 피드 데이터가 팀 선택에 의존하면 active team query/store 경계를 먼저 확인한다.

## 검증

- 목록 표시 로직: `viewModeStorage.test.ts` 또는 관련 unit test
- 상세/댓글 플로우 변경: `yarn test --run` + 필요 시 Playwright feed flow
- UI 변경: 관련 story 또는 E2E screenshot/trace 확인
