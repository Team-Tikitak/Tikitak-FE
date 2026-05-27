import { useQuery } from '@tanstack/react-query';
import { mapKeys } from './keys';
import { unwrap } from '../request';
import { getPins } from './api';

export const useGetPins = (teamId: number) =>
  useQuery({
    queryKey: mapKeys.pins(teamId),
    queryFn: () => unwrap(() => getPins(teamId)),
    enabled: teamId > 0,
    staleTime: 60 * 1000,
  });
