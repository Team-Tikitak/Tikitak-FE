# Domain: Activity

월간 활동, 추천 장소, 추억/출석 요약과 관련된 도메인.

## Routes

| 경로          | 페이지                |
| ------------- | --------------------- |
| activity 계열 | `src/pages/activity/` |

라우트 상수는 `src/app/routes/paths.ts`를 먼저 확인한다.

## 주요 위치

```text
src/pages/activity/
├── model/    # mock 또는 page-local model
└── ui/       # ActivityPage, MonthlyMemories, MonthlyBestAttendance 등

src/shared/api/home/
src/shared/api/place/
src/shared/api/feed/
```

## 작업 기준

- 현재 mock 기반인지 API 연결 기반인지 먼저 확인한다.
- 월 단위 데이터, empty state, skeleton state를 분리한다.
- 추천 장소/추억/출석 섹션은 섹션별 책임을 유지하고 하나의 거대 component로 합치지 않는다.
- API 연결 시 home/place/feed API 중 어떤 도메인의 서버 상태인지 먼저 정한다.

## 검증

- UI 상태 변경: Storybook 또는 component-level 확인
- API 연결: `yarn type-check` + 관련 query test
- 화면 플로우: Playwright activity 또는 visual spec
