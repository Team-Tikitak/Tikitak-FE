import { useState } from 'react';
import {
  ONBOARDING_STEPS,
  type OnboardingAnswers,
  type OnboardingStep,
  type QuestionId,
} from '../model/types';

const QUESTION_TO_NEXT_STEP: Record<QuestionId, OnboardingStep> = {
  q1: 'q2',
  q2: 'q3',
  q3: 'result',
};

export const useOnboardingFlow = () => {
  const [step, setStep] = useState<OnboardingStep>('character-preview');
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const currentIndex = ONBOARDING_STEPS.indexOf(step);
  const canGoBack = currentIndex > 0;

  const goTo = (next: OnboardingStep) => setStep(next);

  const goBack = () => {
    if (!canGoBack) return;
    setStep(ONBOARDING_STEPS[currentIndex - 1]);
  };

  const recordAnswerAndAdvance = (question: QuestionId, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question]: optionId }));
    setStep(QUESTION_TO_NEXT_STEP[question]);
  };

  return { step, answers, canGoBack, goTo, goBack, recordAnswerAndAdvance };
};
