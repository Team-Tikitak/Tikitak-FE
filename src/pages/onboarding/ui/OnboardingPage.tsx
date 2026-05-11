import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { CharacterPreviewStep } from './CharacterPreviewStep';
import { QuestionStep } from './QuestionStep';
import { ResultStep } from './ResultStep';
import { QUESTIONS } from '../constants/questions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { QUESTION_IDS, type OnboardingStep, type QuestionId } from '../model/types';

const isQuestionStep = (step: OnboardingStep): step is QuestionId =>
  (QUESTION_IDS as readonly OnboardingStep[]).includes(step);

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { step, answers, canGoBack, goBack, goTo, recordAnswerAndAdvance } = useOnboardingFlow();

  const handleBack = () => {
    if (canGoBack) {
      goBack();
      return;
    }
    navigate(-1);
  };

  if (step === 'character-preview') {
    return <CharacterPreviewStep onBack={handleBack} onStart={() => goTo('q1')} />;
  }

  if (isQuestionStep(step)) {
    return (
      <QuestionStep
        question={QUESTIONS[step]}
        selectedOptionId={answers[step]}
        onBack={handleBack}
        onSelect={(optionId) => recordAnswerAndAdvance(step, optionId)}
      />
    );
  }

  // step === 'result'
  return (
    <ResultStep
      // TODO: answers → character 매핑 알고리즘 적용
      characterId="leader"
      // TODO: 사용자 데이터 연동
      userName="이현진"
      onBack={handleBack}
      onComplete={() => navigate(PATHS.HOME)}
    />
  );
};
