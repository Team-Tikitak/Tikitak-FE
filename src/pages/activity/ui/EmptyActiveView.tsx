import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';

export const EmptyActiveView = () => {
  return (
    <div className="flex w-[232px] flex-col items-center gap-[7px]">
      <div className="flex size-[168px] items-center justify-center">
        <TakLeader className="w-[128px]" aria-hidden="true" />
      </div>
      <p className="text-center text-[16px] leading-normal font-semibold tracking-[0.064px] text-gray-700">
        아직 우리 팀의 활동이 없어요.
        <br />+ 버튼을 눌러 첫 피드를 남겨주세요
      </p>
    </div>
  );
};
