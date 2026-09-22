# Domain: Gallery

앱 내 카메라/갤러리 접근을 통한 사진 선택.

## Routes

| 경로       | 페이지               |
| ---------- | -------------------- |
| `/gallery` | `src/pages/gallery/` |

라우트 상수: `PATHS.GALLERY` (src/app/routes/paths.ts)

## 주요 위치

```text
src/pages/gallery/
└── ui/
    └── GalleryPage.tsx           # 갤러리 페이지 (현재 TODO)

src/shared/hooks/
└── (Capacitor Camera API 관련 훅들)

.claude/references/domain/native.md
└── 네이티브 카메라 및 권한 참고
```

## 현재 상태

- **TODO**: 앱 권한 획득 후 갤러리 사진 목록 로드 미구현
- Capacitor Camera/Photos API 통합 필요
- 네이티브 권한 처리는 `native.md` 참조

## 작업 기준

- 사진 선택 로직은 Capacitor Camera/Photos 플러그인 사용
- 권한 요청은 native.md의 권한 전략 따름
- 선택된 사진은 부모 페이지(feedEditor 등)로 콜백 전달
- 파일 업로드는 shared/api의 해당 mutation 사용

## 검증

- 권한 요청 플로우: 네이티브 실기기 또는 시뮬레이터 테스트 필수
- 사진 선택 UX: Capacitor 앱에서 E2E 검증
- 에러 처리: 권한 거부, 갤러리 접근 불가 시나리오
