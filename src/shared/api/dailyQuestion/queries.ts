import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDailyQuestion, patchDailyQuestion, postDailyQuestion } from './api';
import { dailyQuestionKeys } from './keys';
import { feedKeys } from '../feed/keys';
import { unwrap } from '../request';
import type { PatchDailyQuestionRequest, PostDailyQuestionRequest } from './types';

export const useGetDailyQuestion = (teamId: number) =>
  useQuery({
    queryKey: dailyQuestionKeys.today(teamId),
    queryFn: () => unwrap(() => getDailyQuestion(teamId)),
    enabled: teamId > 0,
    staleTime: 30 * 1000,
  });

export const usePostDailyQuestion = (teamId: number, questionId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PostDailyQuestionRequest) =>
      unwrap(() => postDailyQuestion(teamId, questionId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyQuestionKeys.today(teamId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};

export const usePatchDailyQuestion = (teamId: number, questionId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PatchDailyQuestionRequest) =>
      unwrap(() => patchDailyQuestion(teamId, questionId, body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyQuestionKeys.today(teamId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) });
    },
  });
};
