import { useEffect } from 'react';
import takBurnerUrl from '@/shared/assets/Character/TakBurner.svg';
import { playSound, unlockAudio } from '@/shared/lib/sound';
import { Button } from '@/shared/ui';

interface ImpossibleOfferProps {
  /** 내 프로필 사진. 없으면 티키탁 캐릭터로 대신한다 */
  profileImgUrl?: string;
  onChallenge: () => void;
  onFinish: () => void;
}

// 컴퓨터 일러스트: 붉은 눈과 이를 드러낸 입, 모니터 아래의 키캡 다리
const ComputerIllustration = () => (
  <svg viewBox="0 0 96 96" aria-hidden="true" className="h-28 w-28 drop-shadow-xl">
    <rect x="8" y="10" width="80" height="58" rx="10" className="fill-tak-ink" />
    <rect x="15" y="17" width="66" height="44" rx="5" className="fill-tak-red" />
    <path d="M26 28 L44 36" className="stroke-white" strokeWidth="5" strokeLinecap="round" />
    <path d="M70 28 L52 36" className="stroke-white" strokeWidth="5" strokeLinecap="round" />
    <circle cx="34" cy="40" r="4" className="fill-white" />
    <circle cx="62" cy="40" r="4" className="fill-white" />
    <path
      d="M30 52 L36 47 L42 52 L48 47 L54 52 L60 47 L66 52"
      className="stroke-white"
      strokeWidth="3.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="40" y="68" width="16" height="10" className="fill-tak-ink" />
    <rect x="24" y="78" width="48" height="10" rx="5" className="fill-tak-ink" />
  </svg>
);

const NAME_TAG_CLASS =
  'rounded-full bg-white px-4 py-1 text-base font-extrabold text-tak-ink shadow-md';

/**
 * 초고수를 이긴 사람에게만 나오는 화면. 게임 화면을 덮고 인간 대 컴퓨터의 마지막 대결을 고르게 한다.
 * 푸른 내 쪽이 먼저, 붉은 컴퓨터 쪽이 나중에 들어오고, VS가 부딪힌 뒤 컴퓨터의 말풍선과 버튼이 이어서 나온다.
 * 동작 줄이기 설정에서는 연출 없이 완성된 화면이 바로 보인다.
 */
export const ImpossibleOffer = ({ profileImgUrl, onChallenge, onFinish }: ImpossibleOfferProps) => {
  // 화면이 나올 때 긴장감 있는 효과음을 한 번 낸다(소리를 꺼 둔 사용자에게는 나지 않는다)
  useEffect(() => {
    unlockAudio();
    playSound('impossible');
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="불가능 도전"
      className="bg-tak-ink absolute inset-0 z-30 overflow-hidden motion-safe:animate-[vs-overlay-in_600ms_ease-out_both]"
    >
      {/* 사선으로 나뉜 푸른쪽(나)과 붉은쪽(컴퓨터). 햇살 모양 줄무늬로 대결 분위기를 낸다 */}
      <div className="absolute inset-0 motion-safe:animate-[vs-slide-left_450ms_ease-out_both]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_28%_28%,#38bdf8_0deg_9deg,#1d8fd1_9deg_18deg)] [clip-path:polygon(0_0,62%_0,38%_100%,0_100%)]"
        />
      </div>
      <div className="absolute inset-0 motion-safe:animate-[vs-slide-right_450ms_ease-out_450ms_both]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_72%_72%,#ff4d4d_0deg_9deg,#d93636_9deg_18deg)] [clip-path:polygon(62%_0,100%_0,100%_100%,38%_100%)]"
        />
      </div>

      {/* 위에서 아래로: 나 → VS → (컴퓨터의 말풍선 + 컴퓨터) → 버튼. 화면 높이가 달라도 겹치지 않고 사이가 고르게 벌어진다 */}
      <div className="relative flex h-full flex-col px-6 pt-5">
        <div className="flex min-h-0 flex-1 flex-col justify-between py-3">
          {/* 나: 내 프로필 사진 */}
          <div className="flex flex-col items-center gap-2 self-start motion-safe:animate-[vs-character-in_500ms_ease-out_300ms_both]">
            <img
              src={profileImgUrl || takBurnerUrl}
              alt=""
              className="size-28 rounded-full border-4 border-white bg-white object-cover shadow-xl"
            />
            <span className={NAME_TAG_CLASS}>나</span>
          </div>

          <span className="self-center text-6xl font-black tracking-tighter text-white italic [text-shadow:4px_4px_0_#d93636,-3px_-3px_0_#1d8fd1] motion-safe:animate-[vs-impact_450ms_ease-out_1500ms_both]">
            VS
          </span>

          {/* 컴퓨터와 그 위의 말풍선. 꼬리가 컴퓨터의 가운데를 가리킨다 */}
          <div className="flex flex-col items-end self-end">
            <div className="mb-3 max-w-[16rem] motion-safe:animate-[vs-bubble-in_500ms_ease-out_2100ms_both]">
              <p className="text-tak-ink relative rounded-2xl bg-white px-4 py-3 text-center text-xl leading-snug font-black break-keep shadow-xl">
                인간 시대의 끝이 <br />
                도래했다
                <span
                  aria-hidden="true"
                  className="absolute right-12 -bottom-2 size-4 rotate-45 bg-white"
                />
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 motion-safe:animate-[vs-character-in_500ms_ease-out_1000ms_both]">
              <ComputerIllustration />
              <span className={NAME_TAG_CLASS}>컴퓨터</span>
            </div>
          </div>
        </div>

        <div className="-mx-6 flex flex-col items-center gap-1 bg-linear-to-t from-black/70 to-transparent px-6 pt-10 pb-6 motion-safe:animate-[vs-fade-up_500ms_ease-out_3000ms_both]">
          <Button variant="primary" className="bg-tak-red" onClick={onChallenge}>
            불가능에 도전하기
          </Button>
          <button
            type="button"
            onClick={onFinish}
            className="min-h-11 px-3 text-sm font-semibold text-white/80 underline underline-offset-2"
          >
            여기서 마무리할래요
          </button>
        </div>
      </div>
    </div>
  );
};
