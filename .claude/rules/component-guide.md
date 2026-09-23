# 컴포넌트 가이드

## 컴포넌트 구조

```tsx
// 1. import
import { type ComponentPropsWithRef } from 'react';
import { tv } from 'tailwind-variants';

// 2. variants 정의
const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium',
  variants: {
    variant: {
      primary: 'bg-primary text-white',
      secondary: 'bg-gray-100 text-gray-900',
      ghost: 'bg-transparent hover:bg-gray-100',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// 3. props 타입
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// 4. 컴포넌트
export const Button = ({ variant, size, className, ref, ...props }: ButtonProps) => {
  return <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />;
};
```

## 규칙

### 필수

- `className` prop 항상 노출 — 외부에서 스타일 오버라이드 가능하게
- `ref` prop 항상 노출
- 나머지 props는 `...props`로 전달
- 스타일 변형은 `tailwind-variants`(`tv`) 사용

### 파일 배치

```
shared/ui/
├── Button.tsx           ← 공통 UI
├── Input.tsx
└── index.ts             ← barrel export

pages/auth/ui/
├── LoginForm.tsx         ← 페이지 전용 컴포넌트
└── index.ts
```

### 네이밍

- 컴포넌트 파일: PascalCase (`Button.tsx`)
- 컴포넌트 함수: PascalCase (`export const Button`)
- props 타입: `{컴포넌트명}Props` (`ButtonProps`)
- variants: `{컴포넌트명}Variants` (`buttonVariants`)

### SVG 아이콘

```tsx
import HomeIcon from '@/shared/assets/icons/home.svg?react';

// 사용
<HomeIcon className="h-5 w-5 text-gray-500" />;
```

- `vite-plugin-svgr`로 React 컴포넌트로 import
- `currentColor` 활용하여 `text-*` 클래스로 색상 변경

### 피해야 할 패턴

**인라인 스타일 → Tailwind**

```tsx
// ❌ Bad
<div style={{ padding: '12px', color: '#0066FF' }}>...</div>

// ✅ Good
<div className="p-3 text-primary">...</div>
```

**`div` + `onClick` → 시맨틱 요소**

```tsx
// ❌ Bad — 접근성 깨짐 (키보드/스크린리더)
<div onClick={handleClick} className="cursor-pointer">제출</div>

// ✅ Good
<button type="button" onClick={handleClick}>제출</button>
```

**boolean props 남발 → variant**

```tsx
// ❌ Bad — 조합 폭발, 잘못된 조합 가능
<Button primary large outlined disabled />

// ✅ Good
<Button variant="primary" size="lg" disabled />
```

**하드코딩된 색상/크기 → Tailwind 토큰**

```tsx
// ❌ Bad
<p className="text-[#0066FF] text-[14px]">안내</p>

// ✅ Good
<p className="text-primary text-sm">안내</p>
```

## 컴포넌트 패턴 규칙

### Slot props

구조는 컴포넌트가 책임, 특정 위치 UI만 호출자가 교체해야 하는 케이스에 적용.

적합한 예:

- `PageShell`의 `header`, `bottom`
- `Header`의 `rightIcon`
- `Button`의 `buttonIcon`
- `BottomSheet`의 content·footer 성격 children
- 카드·리스트 아이템의 우측 action 영역

```tsx
// ❌ Bad — 호출자가 매번 header/main/bottom 구조 수동 조립
<div className="flex h-full flex-col">
  <Header showBackButton onBack={handleBack} />
  <main className="flex-1 overflow-y-auto">
    <PageContent />
  </main>
  <div className="pb-safe">
    <Button variant="primary">완료</Button>
  </div>
</div>

// ✅ Good — 구조는 PageShell, 위치 UI만 slot으로 주입
<PageShell
  header={<Header showBackButton onBack={handleBack} />}
  bottom={<Button variant="primary">완료</Button>}
>
  <PageContent />
</PageShell>
```

slot prop 3개 이상 누적 또는 조합 자유도 증가 시 compound component·직접 조합으로 전환 검토.

### Compound component

부모와 하위 컴포넌트가 하나의 UI 문법을 이루고, 역할·상태·접근성 관계가 강하게 연결될 때 적용.

```tsx
// ❌ Bad — props 폭발, 활성 탭 로직을 호출자가 매번 떠안음
<Tabs
  items={[
    { id: 'info', label: '정보', content: <TeamInfo /> },
    { id: 'members', label: '멤버', content: <TeamMembers /> },
  ]}
  activeId={activeId}
  onChange={setActiveId}
/>

// ✅ Good — 상태·aria 관계를 컴포넌트가 캡슐화
<Tabs defaultValue="info">
  <Tabs.List>
    <Tabs.Trigger value="info">정보</Tabs.Trigger>
    <Tabs.Trigger value="members">멤버</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="info"><TeamInfo /></Tabs.Content>
  <Tabs.Content value="members"><TeamMembers /></Tabs.Content>
</Tabs>
```

적합한 예: `Tabs`, `Dialog`, `Dropdown`, `Select`, `List`(`Root`/`Item`/`Title`/`Right`), 조합 자유도 큰 `Header`.

부적합한 예 — 이런 건 slot props가 정답:

```tsx
// ❌ Bad — 순서·개수가 고정된 페이지 프레임을 compound로 만들면 매번 같은 조립 반복
<PageShell>
  <PageShell.Header><Header /></PageShell.Header>
  <PageShell.Content><Form /></PageShell.Content>
  <PageShell.Bottom><Button>완료</Button></PageShell.Bottom>
</PageShell>

// ✅ Good — slot props로 충분
<PageShell header={<Header />} bottom={<Button>완료</Button>}>
  <Form />
</PageShell>
```

### Container / Presentational

화면 상태·데이터 조회·navigation·이벤트 전이는 container 컴포넌트 담당, 렌더링 중심 컴포넌트는 props 기반 presentational로 분리.

```tsx
// ❌ Bad — presentational 안에 navigation·query·flow 로직이 섞임
export const QuestionStep = ({ stepId }: { stepId: string }) => {
  const navigate = useNavigate();
  const { data } = useQuestion(stepId);
  const [answer, setAnswer] = useState('');

  const handleNext = () => {
    saveAnswer(stepId, answer);
    if (stepId === 'q3') navigate('/onboarding/preview');
    else navigate(`/onboarding/${nextId(stepId)}`);
  };

  return <Card>{/* ... */}</Card>;
};

// ✅ Good — container가 흐름·이벤트 소유, presentational은 props로 렌더만
export const OnboardingPage = () => {
  const { step, answer, setAnswer, goNext } = useOnboardingFlow();
  return <QuestionStep step={step} value={answer} onChange={setAnswer} onNext={goNext} />;
};

export const QuestionStep = ({ step, value, onChange, onNext }: QuestionStepProps) => (
  <Card>{/* 순수 렌더 */}</Card>
);
```

기준:

- `OnboardingPage` — container. step·answers·navigation·flow transition 담당
- `QuestionStep`, `CharacterPreviewStep` — presentational. props 수신 후 화면 렌더링
- `OnboardingCard` — page-specific presentational

작은 페이지는 억지 분리 금지. JSX보다 상태 전이·이벤트 로직 비중이 커지거나 50~80줄 이상으로 확장 시 분리.

### Feature hooks

화면의 상태 전이·이벤트 규칙 확장 시 custom hook 분리.

좋은 예:

- `useOnboardingFlow`
- `useTermsAgreement`
- 향후 `useTeamCreateForm`, `useTeamProfileSetup`

hook은 UI 마크업 비포함, 상태·동작 반환만 담당.

### Variant pattern

시각 상태 2개 이상 + className 조합 반복 시 `tailwind-variants` 기반 variant로 분리.

```tsx
// ❌ Bad — boolean·삼항 누적, 잘못된 조합(primary + secondary) 가능
interface ButtonProps {
  primary?: boolean;
  secondary?: boolean;
  large?: boolean;
}

export const Button = ({ primary, secondary, large, ...rest }: ButtonProps) => (
  <button
    className={`rounded-md font-medium ${
      primary ? 'bg-primary text-white' : secondary ? 'bg-gray-100' : ''
    } ${large ? 'h-12 px-6' : 'h-10 px-4'}`}
    {...rest}
  />
);

// ✅ Good — variant·size 단일 축으로 통합, 잘못된 조합 차단
const buttonVariants = tv({
  base: 'rounded-md font-medium',
  variants: {
    variant: { primary: 'bg-primary text-white', secondary: 'bg-gray-100 text-gray-900' },
    size: { md: 'h-10 px-4', lg: 'h-12 px-6' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export const Button = ({ variant, size, className, ...rest }: ButtonProps) => (
  <button className={buttonVariants({ variant, size, className })} {...rest} />
);
```

boolean prop 다수로 스타일 제어 대신 의미 있는 variant로 통합.

### 튜플 + 파생 유니온

variant·status·role 같이 여러 곳에서 enumerate가 필요한 union은 `as const` 튜플을 single source of truth로 두고 타입을 파생.

```ts
export const TEAM_ROLES = ['OWNER', 'MEMBER'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];
```

문자열 union을 여러 위치에 직접 박지 않음. 단순한 1회성 union은 직접 작성 OK.

### Record + satisfies

union 값별 설정은 `Record<Union, Config>` + `satisfies`로 누락 키를 타입 단계에서 차단.

```ts
const QUESTION_PROGRESS = {
  q1: 1,
  q2: 2,
  q3: 3,
} satisfies Record<QuestionId, number>;
```

`Record<...>`로만 선언하면 값 타입이 좁혀지지 않음. `satisfies`로 둘 다 챙김.

### Discriminated union

variant에 따라 props 조합이 달라지면 optional prop 남발 대신 discriminated union으로 잘못된 조합 자체를 차단.

```ts
type ButtonLikeProps =
  | { type: 'button'; onClick: () => void; href?: never }
  | { type: 'link'; href: string; onClick?: never };
```

### 반복 UI 데이터

탭, 메뉴 항목, 라디오 그룹 같은 반복 UI는 설정 배열/맵으로 렌더링.

- 순서 중요 → tuple
- 값별 설정 완전성 중요 → `Record`
