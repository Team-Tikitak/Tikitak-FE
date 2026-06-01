import { instance } from '../instance';
import { HOME_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type {
  HomeAllTaggedResponse,
  HomeBestAttendanceResponse,
  HomeCombinationsResponse,
  HomeEveryonePickResponse,
  HomeRegionsResponse,
  RecommendedPlacesResponse,
} from './types';

export const getRecommendedPlaces = (teamId: number) =>
  instance.get<ApiResponse<RecommendedPlacesResponse>>(HOME_ENDPOINTS.RECOMMENDED_PLACE(teamId));

export const getHomeRegions = (teamId: number) =>
  instance.get<ApiResponse<HomeRegionsResponse>>(HOME_ENDPOINTS.REGIONS(teamId));

export const getHomeEveryonePick = (teamId: number) =>
  instance.get<ApiResponse<HomeEveryonePickResponse>>(HOME_ENDPOINTS.EVERYONE_PICK(teamId));

export const getHomeCombinations = (teamId: number) =>
  instance.get<ApiResponse<HomeCombinationsResponse>>(HOME_ENDPOINTS.COMBINATIONS(teamId));

export const getHomeBestAttendance = (teamId: number) =>
  instance.get<ApiResponse<HomeBestAttendanceResponse>>(HOME_ENDPOINTS.BEST_ATTENDANCE(teamId));

export const getHomeAllTagged = (teamId: number) =>
  instance.get<ApiResponse<HomeAllTaggedResponse>>(HOME_ENDPOINTS.ALL_TAGGED(teamId));
