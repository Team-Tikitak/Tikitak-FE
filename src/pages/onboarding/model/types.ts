export const ONBOARDING_STEPS = ['character-preview', 'q1', 'q2', 'result'] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type QuestionId = Exclude<OnboardingStep, 'character-preview' | 'result'>;

export const QUESTION_IDS = ['q1', 'q2'] as const satisfies readonly QuestionId[];

export type OnboardingAnswers = Partial<Record<QuestionId, string>>;

export interface QuestionOption {
  id: string;
  title: string;
  description: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}
