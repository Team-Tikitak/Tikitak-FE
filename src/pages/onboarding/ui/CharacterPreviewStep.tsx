import { PageShell } from '@/app/layout';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { SpeechBubble } from './SpeechBubble';
import { BOTTOM_ROW_CHARACTERS, TOP_ROW_CHARACTERS } from '../constants/characters';

type RowCharacter = (typeof TOP_ROW_CHARACTERS)[number];

const renderCircle = (char: RowCharacter, key: string) => {
  const { label, Icon, offsetClass } = char;
  return (
    <div
      key={key}
      className="bg-main-000 flex size-[142px] shrink-0 items-center justify-center rounded-full"
    >
      <Icon role="img" aria-label={label} className={`h-[100px] w-[100px] ${offsetClass}`} />
    </div>
  );
};

interface CharacterPreviewStepProps {
  onBack: () => void;
  onStart: () => void;
}

export const CharacterPreviewStep = ({ onBack, onStart }: CharacterPreviewStepProps) => {
  return (
    <PageShell
      header={<Header showBackButton onBack={onBack} />}
      contentClassName="flex flex-col"
      bottom={
        <Button variant="primary" onClick={onStart}>
          시작하기
        </Button>
      }
    >
      <section className="flex flex-col gap-2 px-5 pt-2">
        <h2 className="title-1 text-black">나와 맞는 캐릭터를 설정해 볼까요?</h2>
        <p className="body-1 text-gray-700">질문을 통해 6가지 캐릭터 중 내 성향을 파악해요.</p>
      </section>

      <div className="mt-[100px]">
        <SpeechBubble
          text="내 캐릭터는 뭐가 나올까?"
          className="animate-bubble-pop ml-16 origin-bottom motion-reduce:animate-none"
        />

        <div className="mt-[19px] flex flex-col gap-6">
          <div className="overflow-hidden">
            <div className="animate-marquee-left flex w-max gap-2 motion-reduce:animate-none">
              {[...TOP_ROW_CHARACTERS, ...TOP_ROW_CHARACTERS].map((char, index) =>
                renderCircle(char, `top-${char.id}-${index}`),
              )}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="animate-marquee-right flex w-max gap-2 motion-reduce:animate-none">
              {[...BOTTOM_ROW_CHARACTERS, ...BOTTOM_ROW_CHARACTERS].map((char, index) =>
                renderCircle(char, `bottom-${char.id}-${index}`),
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
