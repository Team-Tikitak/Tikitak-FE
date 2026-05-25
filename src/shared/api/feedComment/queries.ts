import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFeedComments, postFeedComment } from './api';
import { feedCommentKeys } from './keys';
import type { FeedCommentListParams, createFeedCommentRequest } from './types';

export const useGetFeedComments = (
  teamId: number,
  feedId: number,
  params?: FeedCommentListParams,
) =>
  useQuery({
    queryKey: feedCommentKeys.comments(teamId, feedId),
    queryFn: () => getFeedComments(teamId, feedId, params).then((res) => res.data.data),
    enabled: Boolean(teamId) && Boolean(feedId),
    staleTime: 30 * 1000,
  });

export const usePostFeedComment = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: createFeedCommentRequest) =>
      postFeedComment(teamId, feedId, body).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedCommentKeys.comments(teamId, feedId) });
    },
  });
};
