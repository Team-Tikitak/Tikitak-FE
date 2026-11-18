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
