---
name: figma-to-component
description: Figma 디자인(URL 또는 스크린샷)을 분석하여 프로젝트 컴포넌트 패턴에 맞는 React 컴포넌트를 생성합니다.
user-invocable: true
argument-hint: <figma-url 또는 스크린샷>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

## 1단계: 디자인 분석

Figma 디자인의 레이아웃 구조를 분석:

- 레이아웃 방식 (flex / grid)
- 고정 크기 vs 동적 크기 요소
- 텍스트 오버플로우 처리 위치

Figma 속성과 토큰 매핑 테이블 출력:

```text
Figma 속성       | 값         | 매핑된 토큰/클래스
--------------- | ---------- | -------------------------
Background      | #1E2125    | bg-gray-900
Border Radius   | 8px        | rounded-lg
Font            | Sub1 Bold  | text-sm font-bold
Padding         | 20px       | p-5
Gap             | 12px       | gap-3
```

**토큰 매칭 우선순위:**

1. Tailwind 유틸리티 클래스
2. CSS 변수 (`var(--color-primary)`)
3. 새 토큰이 필요하면 → 사용자에게 제안 후 확인

## 2단계: 기존 패턴 확인

`src/shared/ui/`의 기존 컴포넌트를 읽고 패턴 파악.

## 3단계: 컴포넌트 생성

[template.md](template.md) 구조를 기반으로 컴포넌트 생성.

**파일 구조:** 기본적으로 폴더로 생성

```
src/shared/ui/ComponentName/
├── ComponentName.tsx
└── ComponentName.stories.tsx
```

**레이아웃 원칙:**

- **텍스트 오버플로우:** 잘리는 텍스트에 `truncate` 사용, flex/grid 자식에 `min-w-0` 추가
- **간격:** 부모에 `gap-*` 사용. 간격을 위한 불필요한 래퍼 div 피하기
- **고정 vs 동적 높이:** 균일한 높이가 필요한 요소(리스트 행 등)에만 `h-*` 사용. 그 외에는 동적 높이 유지
- **계층 구조 정확도:** Figma의 중첩 구조를 정확하게 반영

**기타 원칙:**

- 하드코딩된 값 대신 Tailwind 토큰 사용
- `className` 항상 노출
- `ref` 항상 노출
- 모바일 웹뷰 기준 (390px 베이스라인)
- 반응형이 명시되지 않으면 사용자에게 확인

## 4단계: 요약

```text
✅ 파일 생성: src/shared/ui/ComponentName/ComponentName.tsx
✅ 파일 생성: src/shared/ui/ComponentName/ComponentName.stories.tsx
✅ 디자인 토큰: N개 사용
⚠️  새 토큰 필요: --token-name (제안 값)
```

**셀프 체크:**

- [ ] 하드코딩된 값 없음
- [ ] className 노출됨
- [ ] ref 노출됨
- [ ] Tailwind 토큰만 사용

# TODO: 디자인 시스템 확정 후 보강

- [ ] 디자인 토큰 정의 (색상, 타이포, 스페이싱)
- [ ] 컴포넌트 카탈로그 (Button, Input, Modal 등)
- [ ] 브레이크포인트 확정

## 타입 및 Variant 모델링

- Figma variant/property 값은 `as const` 튜플과 파생 유니온으로 모델링합니다.
- 문자열 유니온을 여러 곳에 직접 쓰지 말고 다음 패턴을 우선합니다.

```ts
const TABS = ['home', 'feed', 'my'] as const;
type Tab = (typeof TABS)[number];
```

- variant별 설정은 `Record<Union, Config>`와 `satisfies`를 사용해 누락된 키를 타입 단계에서 잡습니다.

```ts
const TAB_CONFIG = {
  home: { label: '홈' },
  feed: { label: '피드' },
  my: { label: '마이' },
} satisfies Record<Tab, { label: string }>;
```

- 선택 상태, 탭, 크기, 종류, 시각 상태, 아이콘, 라벨, 접근성 라벨, 색상 매핑에 이 패턴을 적용합니다.
- variant에 따라 props 조합이 달라지면 잘못 조합될 수 있는 optional props 대신 discriminated union을 고려합니다.

```ts
type ButtonLikeProps =
  | { type: 'button'; onClick: () => void; href?: never }
  | { type: 'link'; href: string; onClick?: never };
```

- 탭, 메뉴 버튼, 분할 컨트롤, 라디오 그룹 같은 반복 UI는 설정 배열/맵으로 렌더링합니다.
- 순서가 중요하면 tuple을 사용하고, 값별 설정 완전성이 중요하면 `Record`를 사용합니다.

## SVG 및 아이콘 처리

- Figma 아이콘의 복잡한 경로를 UI 컴포넌트 안에 인라인 SVG로 직접 생성하지 않습니다.
- 프로젝트 아이콘 에셋과 `?react` 같은 React SVG 가져오기를 우선합니다.
- 아이콘 생성 스크립트가 있으면 해당 생성 에셋 흐름을 따릅니다. 예를 들어 원본 SVG를 아이콘 소스 디렉터리에 두고 React 컴포넌트로 생성하는 방식입니다.
- 생성 스크립트나 SVG 에셋이 아직 없으면 최소 임시 자리표시 또는 할 일 주석만 두고, 실제 아이콘이 들어갈 컴포넌트 API를 먼저 잡습니다. 복잡한 Figma SVG 경로를 수동으로 재작성하지 않습니다.
- 사용자가 SVG 에셋을 추가하면 그 에셋을 가져와 컴포넌트에 연결합니다.
- 선택/활성/비활성 상태에 따라 색상이 바뀌는 아이콘은 SVG 내부의 `fill`/`stroke`를 `currentColor`로 정리하고 컴포넌트 class로 색상을 제어합니다.
- 상태별 색상 변경이 필요한 아이콘에는 `<img>` 사용을 피합니다.
- 선택 상태에서 경로 구조 자체가 달라지면 같은 SVG 안에 상태 그룹을 두거나 선택/비선택 SVG 에셋을 의도적으로 분리합니다.

## 컴포넌트 분리 기준

- Figma 컴포넌트와 variant 단위는 코드 컴포넌트 분리 후보로 봅니다.
- 독립 재사용이 가능하거나, 자체 variant/state 계약이 있거나, 더 큰 컴포넌트에서 조합되는 단위라면 분리를 고려합니다.
- 예: `BottomNavigation`, `BottomNavigationSelectedTab`, `BottomNavigationItem`.
