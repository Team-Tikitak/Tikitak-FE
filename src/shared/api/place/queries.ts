import { useQuery } from '@tanstack/react-query';
import { getPlacesSearch } from './api';
import { placeKeys } from './keys';
import { requestResult } from '../request';
import type { PlaceSearchParams } from './types';

interface UseSearchPlacesOptions {
  enabled?: boolean;
}

export const useSearchPlaces = (
  params: PlaceSearchParams,
  { enabled = true }: UseSearchPlacesOptions = {},
) =>
  useQuery({
    queryKey: placeKeys.search(params),
    queryFn: () => requestResult(() => getPlacesSearch(params)),
    enabled: enabled && params.query.trim().length > 0,
    staleTime: 60 * 1000,
  });
