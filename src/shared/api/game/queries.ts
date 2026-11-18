import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGameScores, submitGameScore } from './api';
import { gameKeys } from './keys';
import { buildGameLeaderboard, clampGameScore, getGameMonth } from './selectors';
import { isGameServerConfigured } from './supabase';
import { useTeamMembers } from '../team/queries';
import type { GameId, SubmitGameScoreVariables } from './types';

export const useGameScores = (
  gameId: GameId,
  teamId: number | null | undefined,
  memberIds: number[],
) => {
  const month = getGameMonth();
  return useQuery({
    queryKey: gameKeys.leaderboard(gameId, teamId ?? 0, month, memberIds.join(',')),
    queryFn: () =>
      getGameScores(gameId, teamId as number, month, memberIds).then((res) => res.data),
    enabled: isGameServerConfigured && typeof teamId === 'number' && memberIds.length > 0,
    staleTime: 30 * 1000,
    // 부가 기능이라 실패하면 오래 붙잡지 않고 바로 포기한다
    retry: false,
  });
};

export const useSubmitGameScore = () => {
  const queryClient = useQueryClient();
  // meta.errorMessage는 일부러 두지 않는다: 게임이 끝난 직후의 백그라운드 저장이라 실패해도 경고 창으로 막지 않는다
  return useMutation({
    mutationFn: ({ gameId, teamId, teamMemberId, score }: SubmitGameScoreVariables) =>
      submitGameScore(gameId, teamId, teamMemberId, getGameMonth(), clampGameScore(score)),
    onSuccess: (_data, { gameId, teamId }) =>
      queryClient.invalidateQueries({ queryKey: gameKeys.leaderboards(gameId, teamId) }),
  });
};

export const useGameLeaderboard = (gameId: GameId, teamId: number | null | undefined) => {
  const {
    data: members,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useTeamMembers(teamId);
  const memberIds = useMemo(
    () => (members?.members ?? []).map((member) => member.teamMemberId).sort((a, b) => a - b),
    [members],
  );
  const {
    data: rows,
    isPending: isScoresPending,
    isError: isScoresError,
  } = useGameScores(gameId, teamId, memberIds);
  const entries = useMemo(
    () => buildGameLeaderboard(rows ?? [], members?.members ?? []),
    [rows, members],
  );

  return {
    entries,
    isPending: isGameServerConfigured && (isMembersPending || isScoresPending),
    /** 조회에 실패한 것과 기록이 없는 것은 다르다. 실패한 순위표로 칭호 등을 계산하면 안 된다 */
    isError: isGameServerConfigured && (isMembersError || isScoresError),
  };
};
