import TakBurner from '@/shared/assets/Character/TakBurner.svg?react';

export const EmptyFeedView = () => (
  <div className="flex w-[232px] flex-col items-center gap-[7px]">
    <div className="flex size-[168px] items-center justify-center">
      <TakBurner className="w-[112px]" aria-hidden="true" />
    </div>
    <p className="text-center text-[16px] leading-normal font-semibold tracking-[0.064px] text-gray-700">
      아직 피드를 올리지 않았어요.
      <br />+ 버튼을 눌러 첫 피드를 남겨주세요.
    </p>
  </div>
);
