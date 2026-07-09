import type { FeedListItem } from '../feed/types';

export interface HomeRegion {
  region: string;
  feedCount: number;
  feedId: number;
  thumbnailImageUrl: string;
}

export interface HomeRegionsResponse {
  month: number;
  regions: HomeRegion[];
}

export interface HomeEveryonePickResponse {
  month: number;
  picks: FeedListItem[];
}

export interface HomeCombinationMember {
  teamMemberId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface HomeCombinationsResponse {
  month: number;
  combination: HomeCombinationMember[];
  feeds: FeedListItem[];
}

export interface HomeBestAttendanceMember {
  rank: number;
  teamMemberId: number;
  nickname: string;
  profileImgUrl: string;
  tagCount: number;
}

export interface HomeBestAttendanceResponse {
  month: number;
  members: HomeBestAttendanceMember[];
}

export interface HomeAllTaggedResponse {
  month: number;
  feeds: FeedListItem[];
}
