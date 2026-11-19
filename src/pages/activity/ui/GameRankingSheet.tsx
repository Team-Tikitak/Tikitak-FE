import type { GameLeaderboardEntry } from '@/shared/api/game/types';
import { Avatar } from '@/shared/ui';

interface GameRankingSheetProps {
  title: string;
  entries: GameLeaderboardEntry[];
  myTeamMemberId: number | null | undefined;
  formatScore: (score: number) => string;
}

export const GameRankingSheet = ({
  title,
  entries,
  myTeamMemberId,
  formatScore,
}: GameRankingSheetProps) => (
  <div className="flex max-h-[70dvh] flex-col rounded-t-2xl bg-white pb-[max(16px,env(safe-area-inset-bottom))]">
    <div className="px-5 pt-6 pb-3">
      <p className="title-2 text-black">{title} 이번 달 순위</p>
    </div>
    <ul className="flex min-h-0 flex-col gap-1 overflow-y-auto px-3 pb-2">
      {entries.map((entry) => (
        <li
          key={entry.teamMemberId}
          className={
            entry.teamMemberId === myTeamMemberId
              ? 'bg-main-000 flex items-center gap-3 rounded-xl px-3 py-2.5'
              : 'flex items-center gap-3 rounded-xl px-3 py-2.5'
          }
        >
          <span className="w-5 text-center text-sm font-bold text-gray-600">{entry.rank}</span>
          <Avatar src={entry.profileImgUrl} alt="" size="xs" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-black">
            {entry.nickname}
          </span>
          <span className="shrink-0 text-xs text-gray-600">{formatScore(entry.score)}</span>
        </li>
      ))}
    </ul>
  </div>
);
