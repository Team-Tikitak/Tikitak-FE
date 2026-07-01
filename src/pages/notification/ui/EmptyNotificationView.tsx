import TakSpark from '@/shared/assets/Character/TakSpark.svg?react';

export const EmptyNotificationView = () => (
  <div className="mb-[30px] flex w-[232px] flex-col items-center gap-[7px]">
    <div className="flex size-[168px] items-center justify-center">
      <TakSpark className="w-[127px] -translate-x-[14px]" aria-hidden="true" />
    </div>
    <p className="text-center text-[16px] leading-normal font-semibold tracking-[0.064px] text-gray-700">
      아직 도착한 알림이 없어요.
    </p>
  </div>
);
