import { MAX_GAME_SCORE, type GameLeaderboardEntry, type GameScoreRow } from './types';
import type { TeamMember } from '../team/types';

/** 서버 상한을 넘는 점수는 거부되어 기록이 사라지므로 상한에 맞춘다 */
export const clampGameScore = (score: number) =>
  Math.min(MAX_GAME_SCORE, Math.max(0, Math.floor(score)));

/** 월 키는 한국 시간 기준 YYYY-MM. 서버에도 같은 값을 저장한다. */
export const getGameMonth = (date: Date = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' })
    .format(date)
    .slice(0, 7);

/** 점수 행에 팀원 정보를 붙인다. 팀을 나간 사람은 팀원 목록에 없어 빠지고, 같은 점수는 같은 순위. */
export const buildGameLeaderboard = (
  rows: GameScoreRow[],
  members: TeamMember[],
): GameLeaderboardEntry[] => {
  const memberById = new Map(members.map((member) => [member.teamMemberId, member]));
  const entries: GameLeaderboardEntry[] = [];

  for (const row of [...rows].sort((a, b) => b.score - a.score)) {
    const member = memberById.get(row.member_id);
    if (!member) continue;
    const previous = entries.at(-1);
    entries.push({
      rank: previous && previous.score === row.score ? previous.rank : entries.length + 1,
      teamMemberId: member.teamMemberId,
      nickname: member.nickname,
      profileImgUrl: member.profileImgUrl,
      score: row.score,
    });
  }
  return entries;
};
