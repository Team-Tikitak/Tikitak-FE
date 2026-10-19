import { type ComponentPropsWithRef } from 'react';
import TakLeader from '@/shared/assets/Character/TakLeader.svg?react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

interface EmptyTeamViewProps extends ComponentPropsWithRef<'div'> {
  onCreateTeam: () => void;
}

export const EmptyTeamView = ({ onCreateTeam, className, ref, ...props }: EmptyTeamViewProps) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-1 flex-col items-center justify-center px-5', className)}
      {...props}
    >
      <TakLeader
        className="h-[150px] w-[165px] motion-safe:animate-[empty-character_600ms_ease-out]"
        aria-hidden="true"
      />
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="body-2 text-black">아직 참여한 팀이 없어요.</p>
        <p className="body-2 whitespace-nowrap text-black">
          팀을 만들거나 초대 링크 또는 QR로 참여해보세요.
        </p>
      </div>
      <Button variant="primary" onClick={onCreateTeam} className="mt-14">
        팀 개설하기
      </Button>
    </div>
  );
};
