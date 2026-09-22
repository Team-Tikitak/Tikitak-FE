# 테스트 (Testing)

## 도구

- **Test runner**: Vitest 4 (jsdom)
- **React Testing**: `@testing-library/react` + `@testing-library/jest-dom`
- 글로벌 매처 등록: `src/setupTests.ts`
- 검증 커맨드: `yarn test` (단위), `yarn test:storybook` (스토리북)
- **E2E / 시각 회귀**: Playwright (`yarn e2e`). 시각 회귀(VRT) 구성·시딩은 `.claude/decisions/records/visual-regression.md` 참조

## 파일 위치

테스트 파일은 **테스트 대상 옆에 co-location** 한다.

```
src/
├── pages/onboarding/hooks/
│   ├── useOnboardingFlow.ts
│   └── useOnboardingFlow.test.ts
└── shared/ui/Button/
    ├── Button.tsx
    ├── Button.test.tsx
    └── Button.stories.tsx
```

- ❌ `__tests__/` 폴더로 분리 금지
- ❌ 루트 `test/` 디렉터리 분리 금지

## 네이밍

- Hook: `useFoo.test.ts`
- Component: `Foo.test.tsx`

## 작성 대상

| 분류                     | 작성 여부 | 비고                                |
| ------------------------ | --------- | ----------------------------------- |
| Hook (비즈니스 로직)     | ✅ 필수   | 분기·상태 머신·타이머·네비게이션 등 |
| 인터랙티브 컴포넌트      | ✅ 권장   | 드래그·스와이프·폼·모달·시트        |
| 분기 있는 presentational | 🟡 선택   | variant·aria 검증 가치 있을 때      |
| 순수 presentational      | ⛔ 안 함  | Storybook으로 visual 검증           |
| 페이지 컴포넌트          | ⛔ 안 함  | e2e 영역 (Playwright)               |

## 권장 패턴

### Hook 테스트

```ts
import { renderHook, act } from '@testing-library/react';

const { result } = renderHook(() => useTermsAgreement());
act(() => {
  result.current.toggleAll();
});
expect(result.current.allChecked).toBe(true);
```

외부 의존성은 `vi.mock` 으로 격리:

```ts
const navigateMock = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));
```

타이머가 있는 훅은 fake timers + `act` 안에서 진행:

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

act(() => {
  vi.advanceTimersByTime(2300);
});
```

### 컴포넌트 테스트

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

render(<Button onClick={handler}>완료</Button>);
fireEvent.click(screen.getByRole('button', { name: '완료' }));
expect(handler).toHaveBeenCalledTimes(1);
```

- DOM 검색은 **role > label > text** 우선. CSS selector 는 최후
- `userEvent` 패키지 미도입 — `fireEvent` 사용
- 포인터 이벤트 사용 시 `setupTests.ts` 에서 `setPointerCapture` polyfill 활성

## 안티패턴

- ❌ Storybook 으로 충분한 컴포넌트의 snapshot 테스트
- ❌ 페이지 통합 동작을 단위 테스트로 검증 (e2e 영역)
- ❌ 외부 라이브러리 내부 동작 검증 (`twMerge`, `clsx` 등)
- ❌ 화면 깊은 곳의 텍스트를 `container.querySelector` 로 찾기 (role/label/text 우선)
