export interface commentAuthor {
  teamMemberId: number;
  nickname: string;
  profileImageUrl: string;
  anonymous: boolean;
  isAnonymous: boolean;
}

export interface FeedComment {
  commentId: number;
  feedId: number;
  feedImageId: number;
  content: string;
  positionX: number;
  positionY: number;
  author: commentAuthor;
  createdAt: string;
  updatedAt: string;
  mine: boolean;
  isMine: boolean;
}

export interface FeedCommentPageInfo {
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}

export interface FeedCommentListResponse {
  items: FeedComment[];
  pageInfo: FeedCommentPageInfo;
}

export interface FeedCommentListParams {
  feedImageId?: number;
  cursor?: string;
  size?: number;
}

export interface FeedCommentCreateRequest {
  feedImageId: number;
  content: string;
  positionX: number;
  positionY: number;
}

export interface createFeedCommentRequest {
  feedImageId: number;
  content: string;
  positionX: number;
  positionY: number;
}

export interface patchFeedCommentRequest {
  content: string;
  positionX: number;
  positionY: number;
}
