import { describe, expect, it } from 'vitest';
import { buildMonthlyTitles } from './monthlyTitles';

const member = (rank: number, nickname: string, tagCount: number) => ({
  rank,
  teamMemberId: rank,
  nickname,
  profileImgUrl: '',
  tagCount,
});

describe('buildMonthlyTitles', () => {
  it('출석왕·베스트 콤비·이달의 아지트 칭호를 만든다', () => {
    const titles = buildMonthlyTitles({
      bestAttendance: { month: 11, members: [member(1, '경준', 7), member(2, '민지', 5)] },
      combinations: {
        month: 11,
        combination: [
          { teamMemberId: 1, nickname: '경준', profileImageUrl: '' },
          { teamMemberId: 2, nickname: '민지', profileImageUrl: '' },
        ],
        feeds: [],
      },
      regions: {
        month: 11,
        regions: [{ region: '서울 마포구', feedCount: 4, feedId: 1, thumbnailImageUrl: '' }],
      },
    });

    expect(titles).toEqual([
      { id: 'attendance', title: '출석왕', holder: '경준', detail: '7번 함께했어요' },
      {
        id: 'combination',
        title: '베스트 콤비',
        holder: '경준 & 민지',
        detail: '가장 자주 함께했어요',
      },
      { id: 'hangout', title: '이달의 아지트', holder: '서울 마포구', detail: '4번 모였어요' },
    ]);
  });

  it('공동 1위는 함께 출석왕이 된다', () => {
    const [title] = buildMonthlyTitles({
      bestAttendance: { month: 11, members: [member(1, '경준', 7), member(1, '민지', 7)] },
    });

    expect(title.holder).toBe('경준, 민지');
  });

  it('데이터가 없거나 콤비가 한 명뿐이면 해당 칭호를 만들지 않는다', () => {
    expect(
      buildMonthlyTitles({
        bestAttendance: { month: 11, members: [] },
        combinations: {
          month: 11,
          combination: [{ teamMemberId: 1, nickname: '경준', profileImageUrl: '' }],
          feeds: [],
        },
        regions: { month: 11, regions: [] },
      }),
    ).toEqual([]);
  });

  it('응답의 월이 서로 다르면 칭호를 만들지 않는다', () => {
    expect(
      buildMonthlyTitles({
        bestAttendance: { month: 11, members: [member(1, '경준', 7)] },
        regions: {
          month: 12,
          regions: [{ region: '서울 마포구', feedCount: 4, feedId: 1, thumbnailImageUrl: '' }],
        },
      }),
    ).toEqual([]);
  });
});
