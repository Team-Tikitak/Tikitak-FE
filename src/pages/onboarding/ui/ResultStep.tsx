import { PageShell } from '@/app/layout';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { CHARACTER_RESULTS, getCharacter, type CharacterId } from '../constants/characters';

interface ResultStepProps {
  characterId: CharacterId;
  userName: string;
  isLoading?: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export const ResultStep = ({
  characterId,
  userName,
  isLoading,
  onBack,
  onComplete,
}: ResultStepProps) => {
  const character = getCharacter(characterId);
  const { headline, summary } = CHARACTER_RESULTS[characterId];
  const { Icon, name } = character;

  return (
    <PageShell
      header={<Header showBackButton onBack={onBack} />}
      contentClassName="flex flex-col px-5 pt-2"
      bottom={
        <Button variant="primary" disabled={isLoading} onClick={onComplete}>
          시작하기
        </Button>
      }
    >
      <section className="flex w-full flex-col gap-4">
        <div className="animate-card-enter flex flex-col gap-2.5 motion-reduce:animate-none">
          <p className="font-title text-[16px] leading-[1.1] font-bold tracking-[-0.04em] text-black">
            당신은 <span className="text-main-001">- {name}</span>
          </p>
          <p className="font-title text-[13px] leading-[1.4] font-bold tracking-[-0.05em] text-gray-600">
            {headline}
          </p>
        </div>

        <div className="animate-card-enter w-full rounded-sm bg-gray-100 px-[18px] py-4 [animation-delay:80ms] motion-reduce:animate-none">
          <p className="font-body text-[14px] leading-normal tracking-[-0.05em] text-gray-700">
            {summary}
          </p>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center gap-[23px] pb-4">
        <Icon
          role="img"
          aria-label={name}
          className="animate-bubble-pop h-[145px] w-[159px] [animation-delay:200ms] motion-reduce:animate-none"
        />
        {userName ? (
          <div className="animate-card-enter flex items-center gap-[7px] rounded-[20px] border border-gray-200 bg-white px-4 py-1.5 [animation-delay:340ms] motion-reduce:animate-none">
            <Icon aria-hidden="true" className="size-6" />
            <span className="font-title text-[13.6px] leading-[21.343px] font-bold text-black">
              {userName}
            </span>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
};
