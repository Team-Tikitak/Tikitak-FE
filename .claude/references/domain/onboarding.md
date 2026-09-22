# Domain: Onboarding

신규 유저 캐릭터 미리보기 + 3문항 질의응답.

## 라우트

| 경로          | 페이지                  |
| ------------- | ----------------------- |
| `/onboarding` | `src/pages/onboarding/` |

`paths.ts`: `PATHS.ONBOARDING`. 내부 step은 URL이 아닌 컴포넌트 상태로 관리.

## 핵심 타입

```ts
// src/pages/onboarding/model/types.ts
export const ONBOARDING_STEPS = ['character-preview', 'q1', 'q2', 'q3', 'result'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type QuestionId = Exclude<OnboardingStep, 'character-preview' | 'result'>;
export const QUESTION_IDS = ['q1', 'q2', 'q3'] as const satisfies readonly QuestionId[];

export type OnboardingAnswers = Partial<Record<QuestionId, string>>;

export interface Question {
  id: QuestionId;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}
export interface QuestionOption {
  id: string;
  title: string;
  description: string;
}
```

step·QuestionId·answers 모두 `ONBOARDING_STEPS` 튜플에서 파생. 직접 union 작성 금지.

## 구조

- **Container**: `OnboardingPage` — step·answers·flow transition 담당
- **Presentational**: `QuestionStep`, `CharacterPreviewStep`, `OnboardingCard` — props 수신 후 렌더만
- **Hook**: `useOnboardingFlow` — step·answer·navigation 상태 관리

## 흐름

1. `/onboarding` 진입 → `character-preview` step
2. `q1` → `q2` → `q3` 순차 진행, `OnboardingAnswers`에 누적
3. `result` step → 캐릭터 결과 표시 → `/home` 이동

## 작업 시 주의

- 새 질문 추가 시 `ONBOARDING_STEPS`, `QUESTION_IDS` 양쪽 업데이트. `satisfies`로 누락 차단.
- step별 progress·title 매핑은 `Record<QuestionId, ...> satisfies` 패턴으로 작성 (`code-style.md` Record + satisfies 참조).
- container에 navigation 로직 집중. presentational에 `useNavigate` 호출 금지.
- 답변 저장 API 연동 미구현 — 현재 클라이언트 상태로만 관리. 추후 `shared/api/onboarding/` 신설 예정.
