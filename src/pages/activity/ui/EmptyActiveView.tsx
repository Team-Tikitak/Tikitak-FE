import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';

export const EmptyActiveView = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-[7px]">
      <div className="flex max-w-[232px] items-center justify-center p-[30px]">
        <TakLeader className="w-full" aria-hidden="true" />
      </div>
      <div className="text-h3 text-center leading-[150%] font-semibold tracking-[0.004em] text-gray-700">
        아직 우리 팀의 활동이 없어요. <br /> + 버튼을 눌러 첫 피드를 남겨주세요
      </div>
    </div>
  );
};
