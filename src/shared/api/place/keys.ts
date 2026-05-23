import type { PlaceSearchParams } from './types';

export const placeKeys = {
  all: ['place'] as const,
  search: (params: PlaceSearchParams) => [...placeKeys.all, 'search', params] as const,
};
