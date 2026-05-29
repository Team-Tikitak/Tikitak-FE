import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useMe, usePatchOnboarding } from '@/shared/api/user/queries';
import { CharacterPreviewStep } from './CharacterPreviewStep';
import { QuestionStep } from './QuestionStep';
import { ResultStep } from './ResultStep';
import {
  CHARACTER_TO_PROFILE_TYPE,
  isCharacterId,
  type CharacterId,
} from '../constants/characters';
import { QUESTIONS } from '../constants/questions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { QUESTION_IDS, type OnboardingStep, type QuestionId } from '../model/types';

const isQuestionStep = (step: OnboardingStep): step is QuestionId =>
  (QUESTION_IDS as readonly OnboardingStep[]).includes(step);

const FALLBACK_CHARACTER: CharacterId = 'leader';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { step, answers, canGoBack, goBack, goTo, recordAnswerAndAdvance } = useOnboardingFlow();
  const patchOnboarding = usePatchOnboarding();
  const { data: me } = useMe();

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

  const characterId: CharacterId = isCharacterId(answers.q2) ? answers.q2 : FALLBACK_CHARACTER;

  const handleComplete = async () => {
    try {
      await patchOnboarding.mutateAsync({
        profileCharacterType: CHARACTER_TO_PROFILE_TYPE[characterId],
      });
      navigate(PATHS.HOME);
    } catch (error) {
      console.error('온보딩 저장 실패', error);
      // TODO: 글로벌 토스트 도입 시 교체
      alert('온보딩 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <ResultStep
      characterId={characterId}
      userName={me?.name ?? ''}
      isLoading={patchOnboarding.isPending}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
};
