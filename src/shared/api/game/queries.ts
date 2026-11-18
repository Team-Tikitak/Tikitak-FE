import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGameScores, submitGameScore } from './api';
import { gameKeys } from './keys';
import { buildGameLeaderboard, getGameMonth } from './selectors';
import { isGameServerConfigured } from './supabase';
import { useTeamMembers } from '../team/queries';
import type { GameId, SubmitGameScoreVariables } from './types';

export const useGameScores = (gameId: GameId, teamId: number | null | undefined) => {
  const month = getGameMonth();
  return useQuery({
    queryKey: gameKeys.leaderboard(gameId, teamId ?? 0, month),
    queryFn: () => getGameScores(gameId, teamId as number, month).then((res) => res.data),
    enabled: isGameServerConfigured && typeof teamId === 'number',
    staleTime: 30 * 1000,
    // 부가 기능이라 실패하면 오래 붙잡지 않고 바로 포기한다
    retry: false,
  });
};

export const useSubmitGameScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gameId, teamId, teamMemberId, score }: SubmitGameScoreVariables) =>
      submitGameScore(gameId, teamId, teamMemberId, getGameMonth(), score),
    onSuccess: (_data, { gameId, teamId }) =>
      queryClient.invalidateQueries({ queryKey: gameKeys.leaderboards(gameId, teamId) }),
  });
};

export const useGameLeaderboard = (gameId: GameId, teamId: number | null | undefined) => {
  const { data: rows, isPending: isScoresPending } = useGameScores(gameId, teamId);
  const { data: members, isPending: isMembersPending } = useTeamMembers(teamId);
  const entries = useMemo(
    () => buildGameLeaderboard(rows ?? [], members?.members ?? []),
    [rows, members],
  );

  return { entries, isPending: isGameServerConfigured && (isScoresPending || isMembersPending) };
};
