import { PageShell } from '@/app/layout';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { SpeechBubble } from './SpeechBubble';
import { BOTTOM_ROW_CHARACTERS, TOP_ROW_CHARACTERS } from '../constants/characters';

type RowCharacter = (typeof TOP_ROW_CHARACTERS)[number];

const MARQUEE_EDGE_MASK =
  'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)';
const marqueeRowStyle = {
  maskImage: MARQUEE_EDGE_MASK,
  WebkitMaskImage: MARQUEE_EDGE_MASK,
};

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
  onStart: () => void;
}

export const CharacterPreviewStep = ({ onStart }: CharacterPreviewStepProps) => {
  return (
    <PageShell
      header={<Header showBackButton={false} />}
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

      <div className="flex flex-1 flex-col justify-center pb-4">
        <SpeechBubble
          text="내 캐릭터는 뭐가 나올까?"
          className="animate-bubble-pop ml-16 origin-bottom [animation-delay:400ms] motion-reduce:animate-none"
        />

        <div className="mt-[19px] flex flex-col gap-6">
          <div
            className="animate-marquee-row-enter overflow-hidden [animation-delay:800ms] motion-reduce:animate-none"
            style={marqueeRowStyle}
          >
            <div className="animate-marquee-left flex w-max gap-2 [animation-delay:1000ms] motion-reduce:animate-none">
              {[...TOP_ROW_CHARACTERS, ...TOP_ROW_CHARACTERS].map((char, index) =>
                renderCircle(char, `top-${char.id}-${index}`),
              )}
            </div>
          </div>

          <div
            className="animate-marquee-row-enter overflow-hidden [animation-delay:800ms] motion-reduce:animate-none"
            style={marqueeRowStyle}
          >
            <div className="animate-marquee-right flex w-max gap-2 [animation-delay:1000ms] motion-reduce:animate-none">
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
