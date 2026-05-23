import { instance } from '../instance';
import { PLACE_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '../type';
import type { PlaceSearchParams, PlaceSearchResponse } from './types';

export const getPlacesSearch = (params: PlaceSearchParams) =>
  instance.get<ApiResponse<PlaceSearchResponse>>(PLACE_ENDPOINTS.SEARCH, { params });
