import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingPage } from './OnboardingPage';
import type { OnboardingStep } from '../model/types';

const {
  navigateMock,
  goBackMock,
  goToMock,
  recordAnswerAndAdvanceMock,
  useOnboardingFlowMock,
  characterPreviewPropsMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  goBackMock: vi.fn(),
  goToMock: vi.fn(),
  recordAnswerAndAdvanceMock: vi.fn(),
  useOnboardingFlowMock: vi.fn(),
  characterPreviewPropsMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ getQueryData: vi.fn() }),
}));

vi.mock('@/shared/api/user/queries', () => ({
  useMe: () => ({ data: { name: '테스터' } }),
  usePatchOnboarding: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/shared/hooks/useShareSubmit', () => ({
  useShareSubmit: () => ({ submit: (task: () => Promise<void>) => void task(), isSharing: false }),
}));

vi.mock('@/app/routes/loaders', () => ({
  PENDING_INVITE_TOKEN_KEY: 'pendingInviteToken',
}));

vi.mock('../hooks/useOnboardingFlow', () => ({
  useOnboardingFlow: useOnboardingFlowMock,
}));

vi.mock('./CharacterPreviewStep', () => ({
  CharacterPreviewStep: (props: { onStart: () => void }) => {
    characterPreviewPropsMock(props);
    return (
      <button type="button" data-testid="start" onClick={props.onStart}>
        start
      </button>
    );
  },
}));

vi.mock('./QuestionStep', () => ({
  QuestionStep: (props: { onBack: () => void }) => (
    <button type="button" data-testid="question-back" onClick={props.onBack}>
      back
    </button>
  ),
}));

vi.mock('./ResultStep', () => ({
  ResultStep: () => <div data-testid="result" />,
}));

const setFlow = (step: OnboardingStep, canGoBack: boolean) => {
  useOnboardingFlowMock.mockReturnValue({
    step,
    answers: {},
    canGoBack,
    goBack: goBackMock,
    goTo: goToMock,
    recordAnswerAndAdvance: recordAnswerAndAdvanceMock,
  });
};

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('첫 화면에는 뒤로가기 콜백을 내려주지 않는다', () => {
    setFlow('character-preview', false);

    render(<OnboardingPage />);

    expect(characterPreviewPropsMock).toHaveBeenCalledWith({ onStart: expect.any(Function) });
    expect(characterPreviewPropsMock.mock.calls[0][0]).not.toHaveProperty('onBack');

    fireEvent.click(screen.getByTestId('start'));

    expect(goToMock).toHaveBeenCalledWith('q1');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('질문 단계의 뒤로가기는 히스토리 이동 대신 온보딩 이전 단계로 이동한다', () => {
    setFlow('q1', true);

    render(<OnboardingPage />);
    fireEvent.click(screen.getByTestId('question-back'));

    expect(goBackMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
