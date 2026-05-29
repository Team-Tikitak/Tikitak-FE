import type { FeedListItem } from '../feed/types';

export interface HomeRegion {
  region: string;
  feedCount: number;
  thumbnailImageUrl: string;
}

export interface HomeRegionsResponse {
  regions: HomeRegion[];
}

export interface Place {
  name: string;
  curation: string;
  imageUrl: string;
  kakaoMapUrl: string;
}

export interface RecommendedPlacesResponse {
  month: number;
  places: Place[];
}

export interface HomeEveryonePickResponse {
  picks: FeedListItem[];
}

export interface HomeCombinationMember {
  teamMemberId: number;
  nickname: string;
  profileImageUrl: string;
}

export interface HomeCombinationsResponse {
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
  members: HomeBestAttendanceMember[];
}

export interface HomeAllTaggedResponse {
  feeds: FeedListItem[];
}
