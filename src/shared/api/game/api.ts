import { gameInstance } from './supabase';
import type { GameId, GameScoreRow } from './types';

const LEADERBOARD_LIMIT = 50;

export const getGameScores = (gameId: GameId, teamId: number, month: string) =>
  gameInstance.get<GameScoreRow[]>('/game_scores', {
    params: {
      select: 'member_id,score',
      game_id: `eq.${gameId}`,
      team_id: `eq.${teamId}`,
      month: `eq.${month}`,
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
