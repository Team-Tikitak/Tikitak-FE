import { useQuery } from '@tanstack/react-query';
import { mapKeys } from './keys';
import { requestResult } from '../request';
import { getPins } from './api';

export const useGetPins = (teamId: number) =>
  useQuery({
    queryKey: mapKeys.pins(teamId),
    queryFn: () => requestResult(() => getPins(teamId)),
    enabled: teamId > 0,
    staleTime: 60 * 1000,
  });
