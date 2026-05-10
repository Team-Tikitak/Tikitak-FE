import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import { Button } from '@/shared/ui/Button';

interface EmptyTeamViewProps {
  onCreateTeam?: () => void;
}

export const EmptyTeamView = ({ onCreateTeam }: EmptyTeamViewProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <TakLeader className="h-[150px] w-[165px]" aria-hidden="true" />
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="body-2 text-black">아직 참여한 팀이 없어요.</p>
        <p className="body-2 text-black">팀을 만들거나 초대 링크 또는 QR로 참여해보세요.</p>
      </div>
      <Button variant="primary" onClick={onCreateTeam} className="mt-14">
        팀 개설하기
      </Button>
    </div>
  );
};
