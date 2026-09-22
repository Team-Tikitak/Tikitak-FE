# Domain: Notification

알림 목록 조회, 알림 클릭, 설정과 관련된 도메인.

## Routes

| 경로            | 페이지                    |
| --------------- | ------------------------- |
| `/notification` | `src/pages/notification/` |

라우트 상수: `PATHS.NOTIFICATION` (src/app/routes/paths.ts)

## 주요 위치

```text
src/pages/notification/
├── ui/
│   ├── NotificationPage.tsx       # 메인 페이지
│   ├── NotificationItem.tsx       # 개별 알림 아이템
│   ├── NotificationSkeleton.tsx   # 로딩 상태
│   ├── EmptyNotificationView.tsx  # 빈 상태
│   ├── NotificationSettingsSheet.tsx
│   └── NotificationSettingsSheetContainer.tsx
├── hooks/
│   ├── useNotifications.ts        # 알림 목록 fetch (무한 스크롤)
│   ├── useNotificationClick.ts    # 알림 클릭 처리 + preload
│   ├── useNotificationSettingsSheet.ts
│   └── usePushNotificationToggle.ts
└── lib/
    ├── heroAssets.ts             # View Transition 스냅샷
    └── emphasizeNames.tsx        # 이름 강조 유틸

src/shared/api/notification/
├── api.ts                        # API 호출 함수
├── queries.ts                    # useQuery / useMutation 훅
└── types.ts                      # 요청·응답 타입
```

## 작업 기준

- 알림 목록은 `useNotifications()` 훅으로 무한 스크롤 관리 (TanStack Query)
- 알림 아이템 클릭 시 `useNotificationClick`으로 처리 + hero transition preload
- 설정 시트는 `useNotificationSettingsSheet`로 상태 관리
- 푸시 알림 토글은 `usePushNotificationToggle`로 서버 동기화
- View Transition: 알림 클릭 → 상세 페이지 이동 시 heroAssets로 스냅샷 유지

## 검증

- 목록 로딩: unit test + infinite scroll E2E
- 알림 클릭 흐름: Playwright notification flow
- 설정 시트: NotificationSettingsSheet.test.tsx
- 푸시 토글: usePushNotificationToggle.test.ts
