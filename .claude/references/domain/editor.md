# Domain: Feed Editor / Daily Feed Editor

일반 피드 작성/수정, 데일리 질문 피드 작성/수정, 공유 플로우와 관련된 도메인.

## Routes

| 영역                  | 페이지                       |
| --------------------- | ---------------------------- |
| 일반 피드 작성/수정   | `src/pages/feedEditor/`      |
| 데일리 피드 작성/수정 | `src/pages/dailyFeedEditor/` |

라우트와 파라미터는 `src/app/routes/paths.ts`와 `src/app/routes/router.tsx`를 먼저 확인한다.

## 주요 위치

```text
src/pages/feedEditor/
├── hooks/    # useFeedCreateForm, useFeedEditShare, useFeedShare
└── ui/       # FeedCreatePage, FeedEditPage, FeedFormView, overlays

src/pages/dailyFeedEditor/
├── hooks/    # useDailyQuestionCreateForm, useDailyFeedEditForm, share hooks
└── ui/       # DailyFeedCreatePage, DailyFeedEditPage, DailyFeedFormView

src/shared/api/feed/
src/shared/api/dailyQuestion/
src/shared/api/media/
src/shared/hooks/camera/
src/shared/hooks/feed/
```

## 작업 기준

- form 상태는 page hook에 두고, 공용 입력/사진 UI는 shared로 올릴 수 있는지 별도 판단한다.
- 작성/수정 API는 `shared/api/feed`, 데일리 질문은 `shared/api/dailyQuestion` 책임을 우선 확인한다.
- 이미지 업로드/URL 정규화는 `shared/api/media`와 `shared/lib/image` 패턴을 따른다.
- 공유 플로우는 일반 피드와 데일리 피드 hook을 혼동하지 않는다.
- 작성 중 이탈, 삭제, 취소는 ConfirmDialog와 기존 discard flow를 우선 재사용한다.

## 검증

- hook 상태 전이: 관련 `*.test.ts`
- 작성/수정 사용자 플로우: Playwright feed/daily create spec
- 이미지/카메라 영향: camera hook test 또는 실제 browser permission fallback 확인
