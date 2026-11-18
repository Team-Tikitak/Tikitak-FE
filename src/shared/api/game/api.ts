import { gameInstance } from './supabase';
import type { GameId, GameScoreRow } from './types';

const LEADERBOARD_LIMIT = 50;

/** 현재 팀원의 점수만 가져온다. 탈퇴한 사람의 기록이 상위 목록을 차지해도 팀원의 기록이 밀려나지 않는다 */
export const getGameScores = (gameId: GameId, teamId: number, month: string, memberIds: number[]) =>
  gameInstance.get<GameScoreRow[]>('/game_scores', {
    params: {
      select: 'member_id,score',
      game_id: `eq.${gameId}`,
      team_id: `eq.${teamId}`,
      month: `eq.${month}`,
      member_id: `in.(${memberIds.join(',')})`,
      order: 'score.desc',
      limit: LEADERBOARD_LIMIT,
    },
  });

export const submitGameScore = (
  gameId: GameId,
  teamId: number,
  teamMemberId: number,
  month: string,
  score: number,
) =>
  gameInstance.post('/rpc/submit_game_score', {
    p_game_id: gameId,
    p_team_id: teamId,
    p_member_id: teamMemberId,
    p_month: month,
    p_score: score,
  });
