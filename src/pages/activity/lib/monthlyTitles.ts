import type { GameLeaderboardEntry } from '@/shared/api/game/types';
import type {
  HomeBestAttendanceResponse,
  HomeCombinationsResponse,
  HomeRegionsResponse,
} from '@/shared/api/home/types';

export const MONTHLY_TITLE_IDS = ['attendance', 'combination', 'hangout', 'gameKing'] as const;
export type MonthlyTitleId = (typeof MONTHLY_TITLE_IDS)[number];

export interface MonthlyTitle {
  id: MonthlyTitleId;
  title: string;
  holder: string;
  detail: string;
}

interface MonthlyTitleSources {
  bestAttendance?: HomeBestAttendanceResponse;
  combinations?: HomeCombinationsResponse;
  regions?: HomeRegionsResponse;
  /** 미니게임마다 이번 달 순위표 (순위가 매겨진 것) */
  gameLeaderboards?: GameLeaderboardEntry[][];
}

// 게임 순위에 따른 점수: 1위 3점, 2위 2점, 3위 1점
const GAME_RANK_POINTS = [3, 2, 1];

/**
 * 이달의 게임왕: 모든 게임의 순위를 점수로 합쳐 가장 높은 사람.
 * 점수가 같으면 1위를 더 많이 한 사람이 앞서고, 그래도 같으면 함께 칭호를 받는다.
 */
const findGameKings = (boards: GameLeaderboardEntry[][]) => {
  const totals = new Map<number, { nickname: string; points: number; firsts: number }>();

  for (const board of boards) {
    for (const entry of board) {
      const points = GAME_RANK_POINTS[entry.rank - 1] ?? 0;
      if (points === 0) continue;
      const total = totals.get(entry.teamMemberId) ?? {
        nickname: entry.nickname,
        points: 0,
        firsts: 0,
      };
      total.points += points;
      if (entry.rank === 1) total.firsts += 1;
      totals.set(entry.teamMemberId, total);
    }
  }

  const players = [...totals.values()];
  if (players.length === 0) return [];

  const best = players.reduce((top, player) =>
    player.points > top.points || (player.points === top.points && player.firsts > top.firsts)
      ? player
      : top,
  );
  return players.filter((player) => player.points === best.points && player.firsts === best.firsts);
};

export const buildMonthlyTitles = ({
  bestAttendance,
  combinations,
  regions,
  gameLeaderboards,
}: MonthlyTitleSources): MonthlyTitle[] => {
  // 월이 쿼리 키에 없어 재조회 실패 시 서로 다른 달의 응답이 섞일 수 있다 → 모두 같은 달일 때만 칭호를 만든다
  const months = new Set(
    [bestAttendance, combinations, regions].flatMap((source) => (source ? [source.month] : [])),
  );
  if (months.size > 1) return [];

  const titles: MonthlyTitle[] = [];

  // 공동 1위가 있으면 함께 칭호를 받는다
  const champions = (bestAttendance?.members ?? []).filter((member) => member.rank === 1);
  if (champions.length > 0) {
    titles.push({
      id: 'attendance',
      title: '출석왕',
      holder: champions.map((member) => member.nickname).join(', '),
      detail: `${champions[0].tagCount}번 함께했어요`,
    });
  }

  const combination = combinations?.combination ?? [];
  if (combination.length >= 2) {
    titles.push({
      id: 'combination',
      title: '베스트 콤비',
      holder: combination.map((member) => member.nickname).join(' & '),
      detail:
        (combinations?.feeds.length ?? 0) > 0
          ? `${combinations?.feeds.length}번 같이 모였어요`
          : '가장 자주 함께했어요',
    });
  }

  const topRegion = regions?.regions[0];
  if (topRegion) {
    titles.push({
      id: 'hangout',
      title: '이달의 아지트',
      holder: topRegion.region,
      detail: `${topRegion.feedCount}번 모였어요`,
    });
  }

  const gameKings = findGameKings(gameLeaderboards ?? []);
  if (gameKings.length > 0) {
    const firsts = gameKings[0].firsts;
    titles.push({
      id: 'gameKing',
      title: '이달의 게임왕',
      holder: gameKings.map((king) => king.nickname).join(', '),
      detail: firsts > 0 ? `${firsts}개 게임에서 1위` : '여러 게임에서 상위권이에요',
    });
  }

  return titles;
};
