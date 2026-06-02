import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteFeedComment, getFeedComments, patchFeedComment, postFeedComment } from './api';
import { feedCommentKeys } from './keys';
import type {
  FeedComment,
  FeedCommentListParams,
  FeedCommentListResponse,
  FeedCommentRequest,
  PatchFeedCommentRequest,
} from './types';

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
    meta: { errorMessage: '댓글 작성에 실패했어요' },
    mutationFn: (body: FeedCommentRequest) =>
      postFeedComment(teamId, feedId, body).then((res) => res.data.data),
    onSuccess: (newComment: FeedComment) => {
      queryClient.setQueryData<FeedCommentListResponse>(
        feedCommentKeys.comments(teamId, feedId),
        (old) => {
          if (!old) return old;
          return { ...old, items: [...old.items, newComment] };
        },
      );
    },
  });
};

export const useDeleteFeedComment = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { errorMessage: '댓글 삭제에 실패했어요' },
    mutationFn: (commentId: number) => deleteFeedComment(teamId, feedId, commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<FeedCommentListResponse>(
        feedCommentKeys.comments(teamId, feedId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((comment) => comment.commentId !== commentId),
          };
        },
      );
    },
  });
};

export const usePatchFeedComment = (teamId: number, feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { errorMessage: '댓글 수정에 실패했어요' },
    mutationFn: ({ commentId, body }: { commentId: number; body: PatchFeedCommentRequest }) =>
      patchFeedComment(teamId, feedId, commentId, body).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedCommentKeys.comments(teamId, feedId) });
    },
  });
};
