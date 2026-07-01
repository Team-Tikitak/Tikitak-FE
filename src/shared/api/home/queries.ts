import { useQuery } from '@tanstack/react-query';
import {
  getHomeAllTagged,
  getHomeBestAttendance,
  getHomeCombinations,
  getHomeEveryonePick,
  getHomeRegions,
} from './api';
import { homeKeys } from './keys';
import { unwrap } from '../request';

export const useHomeRegions = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.regions(teamId ?? 0),
    queryFn: () => unwrap(() => getHomeRegions(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeEveryonePick = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.everyonePick(teamId ?? 0),
    queryFn: () => unwrap(() => getHomeEveryonePick(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeCombinations = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.combinations(teamId ?? 0),
    queryFn: () => unwrap(() => getHomeCombinations(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeBestAttendance = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.bestAttendance(teamId ?? 0),
    queryFn: () => unwrap(() => getHomeBestAttendance(teamId as number)),
    enabled: typeof teamId === 'number',
  });

export const useHomeAllTagged = (teamId: number | null | undefined) =>
  useQuery({
    queryKey: homeKeys.allTagged(teamId ?? 0),
    queryFn: () => unwrap(() => getHomeAllTagged(teamId as number)),
    enabled: typeof teamId === 'number',
  });
