# 에러 처리 구조

mutation 실패를 사용자에게 알리는 방식. **표면은 네이티브 다이얼로그(`@capacitor/dialog`), 웹은 `window.alert/confirm` 폴백.**

## 2경로 (의도적으로 분리)

- 상태: accepted
- 기록일: 2026-09-23

추상화 레벨이 달라 하나로 합치지 않는다.

| 경로            | 대상                               | UX                          | 위치                                    |
| --------------- | ---------------------------------- | --------------------------- | --------------------------------------- |
| **A. share**    | 업로드+저장+navigate **task 묶음** | `confirm` + **재시도 루프** | `useShareSubmit` (호출 컴포넌트가 직접) |
| **B. mutation** | **단일 mutation**                  | `alert` 안내 (재시도 없음)  | `MutationCache.onError` (중앙 1곳)      |

- A는 업로드가 비싸 재시도 가치가 큼. 단일 mutation만 아는 `MutationCache`로는 "업로드+저장 통째로 재시도"를 표현 못 함 → task 레벨(`useShareSubmit`) 책임.
- B는 단순 안내라 중앙에서 자동 처리.
- **TanStack 자동 retry(지수 백오프)와 다름** — A는 사용자 confirm 기반 재시도.

## B의 동작 — opt-in `meta.errorMessage`

- 상태: accepted
- 기록일: 2026-09-23

```
mutation 실패 → MutationCache.onError(error, …, mutation)
            → mutation.meta?.errorMessage 있으면 alertDialog(message)
```

- 각 mutation이 `meta: { errorMessage: '...' }`로 **자기 안내 문구를 라벨**. 다이얼로그 띄우는 코드는 중앙 1곳(13곳 반복 제거).
- **meta 없는 mutation은 자동 제외** → share 흐름(A), 백그라운드 정리(`deleteMedia`)는 meta 미지정으로 다이얼로그 안 뜸. opt-in이라 과알림 없음.
- `meta`는 `@tanstack/react-query`의 `Register` 모듈 augmentation으로 타입 선언(`mutationMeta: { errorMessage?: string }`) → 오타·잘못된 키는 컴파일 에러.
- 적용처: team·feedComment·invitation·user·feed(useDeleteFeed) queries. (`queryClient.ts`에 선언+소비)

## 다이얼로그 primitive 공용화

- 상태: accepted
- 기록일: 2026-09-23

`shared/lib/nativeDialog.ts` — `alertDialog`(B) / `confirmDialog`(A). `@capacitor/dialog` 접근·웹 폴백·에러 무시 정책을 단일 지점에 모음. 흐름(A/B)은 분리, 표면 primitive만 공유.

## 메시지 정책 — 백엔드 message 안 씀

- 상태: accepted
- 기록일: 2026-09-23

- 백엔드가 코드별 `message`를 주지만 **FE는 친근한 하드코딩 문구 사용**. 이유: ① 검증류(글자수/필수)는 폼 inline·버튼 disabled로 선제 차단 → 서버까지 거의 안 감 ② 5xx "내부 처리 실패"는 사용자 무의미 ③ FE 사전 만들면 백엔드와 중복·drift.
- 비즈니스 에러(만료된 초대, 이미 가입 등)는 그 케이스 필요 시에만 선택적으로 백엔드 message 노출 고려.

## 표면 = 다이얼로그 (제품 결정)

- 상태: accepted
- 기록일: 2026-09-23

토스트가 아니라 네이티브 다이얼로그를 쓰는 건 제품 결정. 구조는 표면 교체에 강해서(`nativeDialog`/한 곳), 나중에 "단순 안내=토스트 / 재시도=다이얼로그" 하이브리드로 바꿔도 `meta` 흐름은 그대로 둔다.

## 조회(query) 에러

- 상태: accepted
- 기록일: 2026-09-23

mutation과 별개. 페이지별 `PageState`가 하드코딩 문구로 로딩/에러 표시 (`shared/ui/PageState`).
