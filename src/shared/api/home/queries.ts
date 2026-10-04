import { useQuery } from '@tanstack/react-query';
import {
  getHomeAllTagged,
  getHomeBestAttendance,
  getHomeCombinations,
  getHomeEveryonePick,
  getHomeRegions,
} from './api';
import { homeKeys } from './keys';
import { requestResult } from '../request';

export const useHomeRegions = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.regions(teamId ?? 0),
    queryFn: () => requestResult(() => getHomeRegions(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeEveryonePick = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.everyonePick(teamId ?? 0),
    queryFn: () => requestResult(() => getHomeEveryonePick(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeCombinations = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.combinations(teamId ?? 0),
    queryFn: () => requestResult(() => getHomeCombinations(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeBestAttendance = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.bestAttendance(teamId ?? 0),
    queryFn: () => requestResult(() => getHomeBestAttendance(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeAllTagged = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.allTagged(teamId ?? 0),
    queryFn: () => requestResult(() => getHomeAllTagged(teamId as number)),
    enabled: typeof teamId === 'number',
  });
