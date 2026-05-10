import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui/Header';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { OnboardingCard } from './OnboardingCard';
import type { Question, QuestionId } from '../model/types';

const QUESTION_PROGRESS: Record<QuestionId, 1 | 2 | 3> = {
  q1: 1,
  q2: 2,
  q3: 3,
};

interface QuestionStepProps {
  question: Question;
  selectedOptionId?: string;
  onBack: () => void;
  onSelect: (optionId: string) => void;
}

export const QuestionStep = ({
  question,
  selectedOptionId,
  onBack,
  onSelect,
}: QuestionStepProps) => {
  return (
    <PageShell
      header={<Header showBackButton onBack={onBack} />}
      contentClassName="flex flex-col gap-5 px-5 pt-2"
    >
      <ProgressBar currentStep={QUESTION_PROGRESS[question.id]} />

      <div className="flex flex-col gap-2">
        <h2 className="title-1 whitespace-pre-line text-black">{question.title}</h2>
        <p className="body-1 text-gray-700">{question.subtitle}</p>
      </div>

      <ul className="flex flex-col gap-2 pb-6">
        {question.options.map((option) => (
          <li key={option.id}>
            <OnboardingCard
              title={option.title}
              description={option.description}
              isSelected={selectedOptionId === option.id}
              onClick={() => onSelect(option.id)}
            />
          </li>
        ))}
      </ul>
    </PageShell>
  );
};
