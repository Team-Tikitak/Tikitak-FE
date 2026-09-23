# Component Patterns

## Current Direction

지금 당장 새 패턴을 많이 도입하지 않는다. 현재 프로젝트는 패턴을 늘리는 것보다 이미 합의한 기준을 고정하는 것이 더 중요하다.

현재 유지하고 강화할 패턴:

- `PageShell` slot
- Container / Presentational
- Feature Hook
- Variant pattern

나중에 조건부로 도입할 패턴:

- Compound component
- Headless component
- Polymorphic `as`
- `shared/layouts`

## 1. Container / Presentational

화면 상태, 데이터 조회, navigation, 이벤트 처리는 container가 담당한다. 렌더링 중심 컴포넌트는 props를 받아 화면만 그리는 presentational component로 둔다.

현재 온보딩 기준:

- `OnboardingPage`: flow, state, navigation 담당
- `QuestionStep`: props를 받아 질문 화면 렌더링
- `CharacterPreviewStep`: props를 받아 시작 화면 렌더링
- `OnboardingCard`: 단일 선택지 UI

앞으로 적용할 수 있는 예:

- `TeamCreatePage`: form state, submit, navigation 담당
- `TeamCreateForm`: 입력 UI 렌더링
- `TeamDetailPage`: team id, data loading, action handler 담당
- `TeamMemberList`: 멤버 목록 렌더링

분리 기준:

- 화면이 작으면 억지로 나누지 않는다.
- JSX보다 상태 전이와 이벤트 로직이 커질 때 분리한다.
- 컴포넌트가 50~80줄을 넘고, 로직과 마크업이 섞여 읽기 어려워질 때 분리한다.

## 2. Feature Hook

화면의 상태 전이와 이벤트 규칙이 커지면 custom hook으로 분리한다.

이미 좋은 예:

```tsx
const { step, answers, goBack, recordAnswerAndAdvance } = useOnboardingFlow();
```

현재 후보:

- `useOnboardingFlow`
- `useTermsAgreement`

향후 후보:

- `useTeamCreateForm`
- `useTeamProfileSetup`
- `useMyTeams`

도입 기준:

- JSX보다 상태 전이/이벤트 로직이 커진다.
- 같은 상태 전이 규칙을 테스트하거나 재사용할 필요가 있다.
- 컴포넌트에서 validation, submit, navigation 분기가 함께 커진다.

주의:

- hook은 UI 마크업을 몰라야 한다.
- hook은 상태와 동작을 반환한다.
- 단순 `useState` 1~2개 수준이면 hook으로 빼지 않는다.

## 3. Slot Props

구조는 컴포넌트가 책임지고, 특정 위치에 들어갈 UI만 호출자가 바꿔야 할 때 slot prop을 사용한다.

현재 좋은 예:

```tsx
<PageShell
  header={<Header showBackButton onBack={handleBack} />}
  bottom={<Button variant="primary">완료</Button>}
>
  <PageContent />
</PageShell>
```

이미 사용 중인 slot 성격:

- `PageShell.header`
- `PageShell.bottom`
- `Header.rightIcon`
- `Button.buttonIcon`

향후 후보:

```tsx
<ListCard title="이용 약관" rightIcon={<ChevronRightIcon />} />
```

```tsx
<MemberCard rightAction={<RemoveButton />} />
```

도입 기준:

- 컴포넌트 구조는 고정이다.
- 특정 위치의 UI만 호출자가 바꿔야 한다.
- slot이 1~2개 정도로 제한된다.

주의:

- slot prop이 3개 이상 늘어나면 컴포넌트 설계가 과해졌을 가능성이 높다.
- 조합 자유도가 커지면 compound component나 직접 조합을 검토한다.

## 4. Domain Component

도메인 의미가 붙은 컴포넌트는 공통 UI와 구분한다.

현재 domain component에 가까운 예:

- `TeamCard`
- `MemberCard`
- `TeamMenuItem`
- `UserChip`
- `FeedList`
- `FeedDetail`

지금은 `shared/ui`에 둬도 된다. 아직 FSD를 강하게 나눌 만큼 도메인 로직과 API 결합이 크지 않다.

향후 도메인 의존이 강해지면 이동 후보:

```txt
src/entities/team/ui/TeamCard
src/entities/member/ui/MemberCard
src/entities/feed/ui/FeedList
```

이동 기준:

- 특정 도메인 타입을 직접 import한다.
- API 응답 타입이나 domain model에 강하게 묶인다.
- 여러 페이지에서 같은 도메인 UI로 재사용된다.
- `shared/ui`에 두기에는 비즈니스 의미가 너무 강해진다.

## 5. Variant Pattern

시각 상태가 2개 이상이고 className 조합이 반복되면 `tailwind-variants` 기반 variant로 분리한다.

현재 좋은 예:

```tsx
<Button variant="primary" />
<Button variant="destructive" />
```

도입 기준:

- 시각 상태가 2개 이상이다.
- 상태별 className 조합이 반복된다.
- boolean props 여러 개보다 의미 있는 variant 하나가 더 명확하다.

주의:

- 단일 화면에서만 쓰는 스타일은 variant로 빼지 않는다.
- variant 이름은 시각 구현보다 의미를 기준으로 정한다.

## Patterns To Delay

### Compound Component

지금 당장 추가하지 않는다.

도입할 만한 시점:

- `Tabs`, `Dialog`, `Dropdown`, `Select`처럼 부모/자식 상태 공유가 필요할 때
- keyboard interaction, focus, aria 관계가 연결될 때
- 복잡한 `Header`, `List`처럼 하나의 UI 문법이 여러 화면에서 반복될 때

`PageShell.Header`, `PageShell.Content`, `PageShell.Bottom` 같은 페이지 프레임에는 쓰지 않는다. header/main/footer 순서와 개수가 거의 고정되어 있으므로 prop slot이 더 적절하다.

### Headless Component

지금은 이르다.

도입할 만한 시점:

- 접근성/키보드 상호작용이 복잡한 select, dropdown, dialog를 직접 만들 때
- UI는 화면마다 다르지만 open/close, focus, keyboard logic은 공유해야 할 때

### Polymorphic `as`

지금은 이르다.

도입할 만한 시점:

- 디자인 시스템이 커진다.
- `Button as={Link}` 또는 `Button as="a"` 요구가 반복된다.
- 라우팅 링크와 버튼 스타일을 하나의 primitive로 통합할 필요가 생긴다.

### `shared/layouts`

지금은 만들지 않는다.

도입할 만한 시점:

- `Flex`, `Stack`, `List`, `Top` 같은 범용 레이아웃 primitive가 실제로 필요해진다.
- 같은 레이아웃 구조가 3곳 이상 반복된다.
- 라우터나 페이지 프레임을 모르는 순수 배치 helper로 유지할 수 있다.

`RootLayout`과 `PageShell`은 `shared/layouts`가 아니라 `app/layout`에 둔다.
