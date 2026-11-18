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

  describe('이달의 게임왕', () => {
    const entry = (teamMemberId: number, nickname: string, rank: number) => ({
      rank,
      teamMemberId,
      nickname,
      profileImgUrl: '',
      score: 10,
    });

    it('여러 게임의 순위를 점수로 합쳐 가장 높은 사람이 받는다', () => {
      const titles = buildMonthlyTitles({
        gameLeaderboards: [
          [entry(1, '경준', 1), entry(2, '민지', 2)],
          [entry(2, '민지', 1), entry(1, '경준', 2)],
          [entry(1, '경준', 1), entry(3, '수아', 2)],
        ],
      });

      expect(titles).toEqual([
        { id: 'gameKing', title: '이달의 게임왕', holder: '경준', detail: '2개 게임에서 1위' },
      ]);
    });

    it('점수가 같으면 1위를 더 많이 한 사람이 앞선다', () => {
      // 경준: 1위(3) + 3위(1) = 4점, 1위 1번 / 민지: 2위(2) + 2위(2) = 4점, 1위 0번
      const [title] = buildMonthlyTitles({
        gameLeaderboards: [
          [entry(1, '경준', 1), entry(2, '민지', 2)],
          [entry(2, '민지', 2), entry(1, '경준', 3)],
        ],
      });

      expect(title.holder).toBe('경준');
    });

    it('점수와 1위 횟수가 모두 같으면 함께 받는다', () => {
      const [title] = buildMonthlyTitles({
        gameLeaderboards: [[entry(1, '경준', 1)], [entry(2, '민지', 1)]],
      });

      expect(title.holder).toBe('경준, 민지');
    });

    it('4위 이하만 있거나 기록이 없으면 만들지 않는다', () => {
      expect(buildMonthlyTitles({ gameLeaderboards: [[entry(1, '경준', 4)], []] })).toEqual([]);
      expect(buildMonthlyTitles({ gameLeaderboards: [] })).toEqual([]);
      expect(buildMonthlyTitles({})).toEqual([]);
    });

    it('다른 칭호들 뒤에 붙는다', () => {
      const titles = buildMonthlyTitles({
        bestAttendance: { month: 11, members: [member(1, '경준', 7)] },
        gameLeaderboards: [[entry(1, '경준', 1)]],
      });

      expect(titles.map((title) => title.id)).toEqual(['attendance', 'gameKing']);
    });
  });
});
