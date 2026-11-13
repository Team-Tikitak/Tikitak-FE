import {
  useHomeBestAttendance,
  useHomeCombinations,
  useHomeRegions,
} from '@/shared/api/home/queries';
import { cn } from '@/shared/lib';
import { buildMonthlyTitles, type MonthlyTitleId } from '../lib/monthlyTitles';

interface MonthlyTitlesProps {
  teamId: number | null | undefined;
}

const TITLE_BADGE_CLASS = {
  attendance: 'bg-[#ffeea6] text-[#8a6a00]',
  combination: 'bg-[#ffc5de] text-[#a3245a]',
  hangout: 'bg-[#b2e7ff] text-[#0b6a93]',
} satisfies Record<MonthlyTitleId, string>;

export const MonthlyTitles = ({ teamId }: MonthlyTitlesProps) => {
  const { data: bestAttendance, isPending: isAttendancePending } = useHomeBestAttendance(teamId);
  const { data: combinations, isPending: isCombinationsPending } = useHomeCombinations(teamId);
  const { data: regions, isPending: isRegionsPending } = useHomeRegions(teamId);

  // 칭호가 하나씩 따로 튀어나오지 않도록 세 데이터가 모두 온 뒤 한 번에 보여준다
  if (isAttendancePending || isCombinationsPending || isRegionsPending) return null;

  const titles = buildMonthlyTitles({ bestAttendance, combinations, regions });
  if (titles.length === 0) return null;

  const month = bestAttendance?.month ?? combinations?.month ?? regions?.month;

  return (
    <section className="flex w-full flex-col gap-[18px]">
      <h2 className="body-2 text-black">{month}월의 칭호</h2>
      <ul className="flex flex-col gap-2">
        {titles.map((title, index) => (
          <li
            key={title.id}
            className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3.5 motion-safe:animate-[card-enter_300ms_ease-out_both]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-bold',
                TITLE_BADGE_CLASS[title.id],
              )}
            >
              {title.title}
            </span>
            {/* 공동 수상자가 여러 명이어도 잘리지 않게 줄바꿈하고, 공백 없는 긴 이름은 글자 단위로 끊는다 */}
            <span className="min-w-0 flex-1 text-sm font-semibold wrap-anywhere break-keep text-black">
              {title.holder}
            </span>
            <span className="shrink-0 text-xs text-gray-600">{title.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
