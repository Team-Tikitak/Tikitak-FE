import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteFeedComment, getFeedComments, patchFeedComment, postFeedComment } from './api';
import { feedCommentKeys } from './keys';
import type {
  CommentAuthor,
  FeedComment,
  FeedCommentListParams,
  FeedCommentListResponse,
  FeedCommentRequest,
  PatchFeedCommentRequest,
} from './types';

interface PostCommentVars {
  body: FeedCommentRequest;
  optimisticAuthor: CommentAuthor;
}

interface PostCommentContext {
  previous?: FeedCommentListResponse;
  tempId: number;
}

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
  const queryKey = feedCommentKeys.comments(teamId, feedId);

  return useMutation<FeedComment, Error, PostCommentVars, PostCommentContext>({
    meta: { errorMessage: '댓글 작성에 실패했어요' },
    mutationFn: ({ body }) => postFeedComment(teamId, feedId, body).then((res) => res.data.data),

    onMutate: ({ body, optimisticAuthor }) => {
      queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<FeedCommentListResponse>(queryKey);
      const tempId = -Date.now();

      const now = new Date().toISOString();
      const optimisticComment: FeedComment = {
        commentId: tempId,
        feedId,
        feedImageId: body.feedImageId,
        content: body.content,
        positionX: body.positionX,
        positionY: body.positionY,
        author: optimisticAuthor,
        createdAt: now,
        updatedAt: now,
        mine: true,
        isMine: true,
      };

      queryClient.setQueryData<FeedCommentListResponse>(queryKey, (old) =>
        old ? { ...old, items: [...old.items, optimisticComment] } : old,
      );

      return { previous, tempId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },

    onSuccess: (newComment, _vars, context) => {
      queryClient.setQueryData<FeedCommentListResponse>(queryKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((c) => (c.commentId === context?.tempId ? newComment : c)),
            }
          : old,
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
