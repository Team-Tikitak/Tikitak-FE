import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui/Header';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { OnboardingCard } from './OnboardingCard';
import type { Question, QuestionId } from '../model/types';

const QUESTION_PROGRESS: Record<QuestionId, 1 | 2> = {
  q1: 1,
  q2: 2,
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
      header={
        <>
          <Header showBackButton onBack={onBack} />
          <div className="px-5 pb-5">
            <ProgressBar currentStep={QUESTION_PROGRESS[question.id]} />
          </div>
          <div className="flex flex-col gap-2 px-5 pb-5">
            <h2 className="title-1 whitespace-pre-line text-black">{question.title}</h2>
            <p className="body-1 text-gray-700">{question.subtitle}</p>
          </div>
        </>
      }
      contentClassName="flex flex-col px-5"
    >
      {/* key={question.id} 로 step 전환 시 카드 enter 애니메이션 재생 */}
      <ul key={question.id} className="flex flex-col gap-2 pb-6">
        {question.options.map((option, index) => (
          <li
            key={option.id}
            className="animate-card-enter motion-reduce:animate-none"
            style={{ animationDelay: `${index * 16}ms` }}
          >
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
