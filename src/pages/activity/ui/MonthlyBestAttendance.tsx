import { useHomeBestAttendance } from '@/shared/api/home/queries';
import type { HomeBestAttendanceMember } from '@/shared/api/home/types';
import { cn, normalizeImageUrl } from '@/shared/lib';

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
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path
      d="M5 20V18H19V20H5ZM5 16.5L3.725 8.475C3.69167 8.475 3.654 8.47934 3.612 8.488C3.57 8.49667 3.53267 8.50067 3.5 8.5C3.08334 8.5 2.72934 8.354 2.438 8.062C2.14667 7.77 2.00067 7.416 2 7C1.99934 6.584 2.14534 6.23 2.438 5.938C2.73067 5.646 3.08467 5.5 3.5 5.5C3.91534 5.5 4.26967 5.646 4.563 5.938C4.85634 6.23 5.002 6.584 5 7C5 7.11667 4.98734 7.225 4.962 7.325C4.93667 7.425 4.90767 7.51667 4.875 7.6L8 9L11.125 4.725C10.9417 4.59167 10.7917 4.41667 10.675 4.2C10.5583 3.98334 10.5 3.75 10.5 3.5C10.5 3.08334 10.646 2.729 10.938 2.437C11.23 2.145 11.584 1.99934 12 2C12.416 2.00067 12.7703 2.14667 13.063 2.438C13.3557 2.72934 13.5013 3.08334 13.5 3.5C13.5 3.75 13.4417 3.98334 13.325 4.2C13.2083 4.41667 13.0583 4.59167 12.875 4.725L16 9L19.125 7.6C19.0917 7.51667 19.0623 7.425 19.037 7.325C19.0117 7.225 18.9993 7.11667 19 7C19 6.58334 19.146 6.229 19.438 5.937C19.73 5.645 20.084 5.49934 20.5 5.5C20.916 5.50067 21.2703 5.64667 21.563 5.938C21.8557 6.22934 22.0013 6.58334 22 7C21.9987 7.41667 21.853 7.771 21.563 8.063C21.273 8.355 20.9187 8.50067 20.5 8.5C20.4667 8.5 20.4293 8.496 20.388 8.488C20.3467 8.48 20.309 8.47567 20.275 8.475L19 16.5H5Z"
      fill="currentColor"
    />
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
        {member.rank === 1 && <CrownIcon className="size-6 text-[#ff4d4d]" />}
        <img
          src={normalizeImageUrl(member.profileImgUrl)}
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
