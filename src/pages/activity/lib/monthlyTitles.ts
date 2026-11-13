import type {
  HomeBestAttendanceResponse,
  HomeCombinationsResponse,
  HomeRegionsResponse,
} from '@/shared/api/home/types';

export const MONTHLY_TITLE_IDS = ['attendance', 'combination', 'hangout'] as const;
export type MonthlyTitleId = (typeof MONTHLY_TITLE_IDS)[number];

export interface MonthlyTitle {
  id: MonthlyTitleId;
  title: string;
  holder: string;
  detail: string;
}

interface MonthlyTitleSources {
  bestAttendance?: HomeBestAttendanceResponse;
  combinations?: HomeCombinationsResponse;
  regions?: HomeRegionsResponse;
}

export const buildMonthlyTitles = ({
  bestAttendance,
  combinations,
  regions,
}: MonthlyTitleSources): MonthlyTitle[] => {
  const titles: MonthlyTitle[] = [];

  // 공동 1위가 있으면 함께 칭호를 받는다
  const champions = (bestAttendance?.members ?? []).filter((member) => member.rank === 1);
  if (champions.length > 0) {
    titles.push({
      id: 'attendance',
      title: '출석왕',
      holder: champions.map((member) => member.nickname).join(', '),
      detail: `${champions[0].tagCount}번 함께했어요`,
    });
  }

  const combination = combinations?.combination ?? [];
  if (combination.length >= 2) {
    titles.push({
      id: 'combination',
      title: '베스트 콤비',
      holder: combination.map((member) => member.nickname).join(' & '),
      detail:
        (combinations?.feeds.length ?? 0) > 0
          ? `${combinations?.feeds.length}번 같이 모였어요`
          : '가장 자주 함께했어요',
    });
  }

  const topRegion = regions?.regions[0];
  if (topRegion) {
    titles.push({
      id: 'hangout',
      title: '이달의 아지트',
      holder: topRegion.region,
      detail: `${topRegion.feedCount}번 모였어요`,
    });
  }

  return titles;
};
