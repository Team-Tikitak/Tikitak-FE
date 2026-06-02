export type FeedType = 'GENERAL' | 'DAILY_QUESTION';

export type FeedFilterType = 'ALL' | 'GENERAL' | 'DAILY_QUESTION';

export type ReactionType =
  | 'TAK_LEADER'
  | 'TAK_SPARK'
  | 'TAK_BURNER'
  | 'TAK_BUILDER'
  | 'TAK_FREE'
  | 'TAK_CARE';

export interface FeedPlace {
  placeId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface FeedTaggedMember {
  teamMemberId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface FeedDailyQuestion {
  questionId: number;
  content: string;
  answerDate: string;
}

export interface FeedRequest {
  content: string;
  mediaPublicIds?: string[];
  place?: FeedPlace | null;
  taggedTeamMemberIds: number[];
}

export interface FeedAuthor {
  teamMemberId: number;
  nickname: string;
  profileImageUrl: string;
  anonymous: boolean;
  isAnonymous: boolean;
}

export interface FeedReactionItem {
  reactionType: ReactionType;
  count: number;
}

export interface FeedReactionSummary {
  totalCount: number;
  items: FeedReactionItem[];
}

export interface FeedListItem {
  feedId: number;
  type: FeedType;
  content: string;
  thumbnailImageUrl: string;
  imageCount: number;
  author: FeedAuthor;
  place: FeedPlace | null;
  question: FeedDailyQuestion | null;
  commentCount: number;
  reactionSummary: FeedReactionSummary;
  myReaction: ReactionType | null;
  createdAt: string;
}

export interface FeedPageInfo {
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
  totalCount: number;
}

export interface FeedListResponse {
  items: FeedListItem[];
  pageInfo: FeedPageInfo;
}

export interface FeedListParams {
  cursor?: string;
  size?: number;
  placeId?: string;
  region?: string;
  type?: FeedFilterType;
  taggedTeamMemberIds?: number[];
}

export interface FeedMutationResponse {
  feedId: number;
  type: FeedType;
  content: string;
  thumbnailImageUrl: string;
  imageCount: number;
  place: FeedPlace | null;
  question: FeedDailyQuestion | null;
  taggedMembers: FeedTaggedMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedImage {
  feedImageId: number;
  imageUrl: string;
  orderIndex: number;
  mediaPublicId?: string;
}

export interface FeedDetailResponse {
  feedId: number;
  type: FeedType;
  content: string;
  author: FeedAuthor;
  images: FeedImage[];
  place: FeedPlace;
  question: FeedDailyQuestion;
  taggedMembers: FeedTaggedMember[];
  commentCount: number;
  reactionSummary: FeedReactionSummary;
  myReaction: ReactionType;
  createdAt: string;
  updatedAt: string;
  mine: boolean;
  isMine: boolean;
}
