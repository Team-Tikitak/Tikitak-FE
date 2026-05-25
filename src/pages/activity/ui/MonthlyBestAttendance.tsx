import { useHomeBestAttendance } from '@/shared/api/home/queries';
import type { HomeBestAttendanceMember } from '@/shared/api/home/types';
import { cn } from '@/shared/lib';

interface MonthlyBestAttendanceProps {
  teamId: number | null | undefined;
}

const PODIUM_HEIGHT: Record<number, string> = {
  1: 'h-[115px] bg-[#ffeea6]',
  2: 'h-[68px] bg-[#b2e7ff]',
  3: 'h-[48px] bg-[#ffc5de]',
};

const PODIUM_ORDER: Record<number, string> = {
  1: 'order-2',
  2: 'order-1',
  3: 'order-3',
};

const CrownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M5 19h14v2H5v-2Zm14.5-13L17 9l-5-6-5 6-2.5-3v9H4l16 .03V6ZM7 15v-1.97l.13.15L12 7.5l4.87 5.68.13-.15V15H7Z" />
  </svg>
);

export const MonthlyBestAttendance = ({ teamId }: MonthlyBestAttendanceProps) => {
  const { data } = useHomeBestAttendance(teamId);
  const top3 = (data?.members ?? []).filter((m) => m.rank >= 1 && m.rank <= 3);

  return (
    <section className="flex w-full flex-col gap-[18px]">
      <h2 className="body-2 text-black">이달의 Best 출석</h2>
      <div className="flex h-[235px] w-full items-end justify-center gap-0">
        {top3.map((member) => (
          <PodiumColumn key={member.teamMemberId} member={member} />
        ))}
      </div>
    </section>
  );
};

const PodiumColumn = ({ member }: { member: HomeBestAttendanceMember }) => {
  return (
    <div className={cn('flex w-[76px] flex-col items-center gap-3', PODIUM_ORDER[member.rank])}>
      <div className="flex flex-col items-center gap-1.5">
        {member.rank === 1 && <CrownIcon className="size-6 text-[#ffd93d]" />}
        <img
          src={member.profileImgUrl}
          alt={member.nickname}
          className="size-11 rounded-full object-cover"
        />
        <div className="flex flex-col items-center leading-[1.4]">
          <span className="text-sm font-semibold text-black">{member.nickname}</span>
          <span className="text-xs font-normal text-gray-600">{member.tagCount}회</span>
        </div>
      </div>
      <div className={cn('relative w-[76px] rounded-sm', PODIUM_HEIGHT[member.rank])}>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-base font-bold text-gray-600">
          {member.rank}
        </span>
      </div>
    </div>
  );
};
