import type { GameId } from './types';

export const gameKeys = {
  all: ['game'] as const,
  leaderboards: (gameId: GameId, teamId: number) =>
    [...gameKeys.all, gameId, 'leaderboard', teamId] as const,
  leaderboard: (gameId: GameId, teamId: number, month: string, memberKey: string) =>
    [...gameKeys.leaderboards(gameId, teamId), month, memberKey] as const,
};
