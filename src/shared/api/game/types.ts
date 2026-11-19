/** 서버가 받는 점수의 상한(game_scores CHECK와 submit_game_score 검사와 같은 값) */
export const MAX_GAME_SCORE = 999;

export const GAME_IDS = ['flappy', 'whack', 'keycap'] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface GameScoreRow {
  member_id: number;
  score: number;
}

export interface GameLeaderboardEntry {
  rank: number;
  teamMemberId: number;
  nickname: string;
  profileImgUrl: string;
  score: number;
}

export interface SubmitGameScoreVariables {
  gameId: GameId;
  teamId: number;
  teamMemberId: number;
  score: number;
}
