import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getGameScores, submitGameScore } from './api';
import { gameKeys } from './keys';
import { buildGameLeaderboard, clampGameScore, getGameMonth } from './selectors';
import { isGameServerConfigured } from './supabase';
import { useGameMonth } from './useGameMonth';
import { useTeamMembers } from '../team/queries';
import type { GameId, SubmitGameScoreVariables } from './types';

export const useGameScores = (
  gameId: GameId,
  teamId: number | null | undefined,
  memberIds: number[],
) => {
  // 월이 바뀌면 조회 키도 바뀌어 새 달의 순위를 가져온다 (화면을 열어 둔 채 월이 넘어가는 경우)
  const month = useGameMonth();
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
      submitGameScore(gameId, teamId, teamMemberId, getGameMonth(), clampGameScore(score, gameId)),
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

/**
 * 활동 탭을 열기 전에 세 게임의 순위표를 미리 받아 둔다.
 * 같은 쿼리 키를 그대로 쓰므로 활동 탭에 들어가면 캐시를 바로 보여주고, 오래됐으면 뒤에서 조용히 갱신한다.
 */
export const usePrefetchGameLeaderboards = (teamId: number | null | undefined) => {
  useGameLeaderboard('flappy', teamId);
  useGameLeaderboard('whack', teamId);
  useGameLeaderboard('keycap', teamId);
};
