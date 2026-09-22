# 아키텍처 (Architecture)

## FSD 간소화 (app / pages / shared)

```
src/
├── app/                    # 앱 전체 설정
│   ├── providers/          # QueryProvider 등
│   ├── routes/             # 라우터 설정
│   ├── layout/             # 공통 레이아웃
│   └── styles/             # 글로벌 스타일
├── pages/                  # 라우트 단위 페이지
│   └── auth/
│       ├── model/          # 타입, 스키마
│       └── ui/             # 페이지 전용 컴포넌트
├── shared/                 # 공통 모듈
│   ├── api/                # axios 인스턴스 + 도메인별 API 호출
│   ├── assets/             # 이미지, 아이콘
│   ├── constants/          # 상수
│   ├── contexts/           # React Context
│   ├── hooks/              # 공통 훅
│   ├── lib/                # 유틸리티
│   ├── stores/             # zustand 스토어
│   ├── types/              # 공통 타입
│   └── ui/                 # 공통 UI 컴포넌트 (Button, Input 등)
└── main.tsx
```

## 의존성 규칙

- `pages` → `shared` (O)
- `pages` → `pages` (X) 페이지끼리 import 피하기
- `shared` → `pages` (X)
- `app` → `pages`, `shared` (O)

## API 구조

- `shared/api/instance.ts` — axios 인스턴스, 인터셉터
- `shared/api/{domain}.ts` — 도메인별 API 호출 함수
- `shared/api/index.ts` — barrel export

## 레이아웃 레이어

### `app/layout`

`app/layout` — 라우터·페이지 프레임처럼 앱 구조에 직접 연결된 레이아웃 위치.

- `RootLayout` — 라우터 최상위 shell. `Outlet` 마운트 + 앱 전체 모바일 캔버스 폭·높이·배경 책임.
- `PageShell` — 개별 페이지 고정 구조. `header` / `children` / `bottom` slot 수신 후 `header → main → footer` 순서 내부 고정.

`PageShell`은 `shared/layouts`로 이동 금지. header/main/footer, scroll 영역, safe-area bottom은 앱 단위 페이지 프레임 책임이라 `app/layout` 유지.

```tsx
<PageShell
  header={<Header title="팀 개설" showBackButton onBack={handleBack} />}
  bottom={<Button variant="primary">완료</Button>}
>
  <TeamCreateForm />
</PageShell>
```

### `shared/layouts`

`shared/layouts` — 필요 시점에만 도입. 라우터·페이지 프레임 비종속 범용 레이아웃 primitive 위치.

도입 후보:

- `Stack` / `Flex` — 방향·정렬·간격을 제한된 token으로 표현하는 범용 배치 helper
- `List` — 반복 list item 구조가 여러 화면에서 안정적으로 반복되는 경우
- `Top` — title·description·right action 구조가 여러 화면에서 안정적으로 반복되는 경우

도입 기준:

- 같은 구조 3곳 이상 반복
- 컴포넌트 이름이 도메인 의미 비포함
- `pages`·`app/routes` import 금지
- 단순 className 한 줄 wrapper용 분리 회피

현재는 `RootLayout`·`PageShell`만 `app/layout` 유지. `shared/layouts`는 실제 반복 패턴 발생 시 도입.
