import { describe, expect, it } from 'vitest';
import { buildGameLeaderboard, clampGameScore, getGameMonth } from './selectors';
import type { TeamMember } from '../team/types';

const member = (teamMemberId: number, nickname: string): TeamMember => ({
  teamMemberId,
  nickname,
  role: 'MEMBER',
  profileImgUrl: `${nickname}.png`,
});

describe('buildGameLeaderboard', () => {
  it('점수 순으로 정렬하고 같은 점수는 같은 순위를 준다', () => {
    const result = buildGameLeaderboard(
      [
        { member_id: 1, score: 10 },
        { member_id: 2, score: 30 },
        { member_id: 3, score: 10 },
      ],
      [member(1, 'a'), member(2, 'b'), member(3, 'c')],
    );

    expect(result.map((entry) => [entry.nickname, entry.rank])).toEqual([
      ['b', 1],
      ['a', 2],
      ['c', 2],
    ]);
  });

  it('팀원 목록에 없는 사람은 제외한다', () => {
    const result = buildGameLeaderboard(
      [
        { member_id: 9, score: 50 },
        { member_id: 1, score: 5 },
      ],
      [member(1, 'a')],
    );

    expect(result).toHaveLength(1);
    expect(result[0].rank).toBe(1);
  });
});

describe('getGameMonth', () => {
  it('한국 시간 기준 YYYY-MM을 돌려준다', () => {
    expect(getGameMonth(new Date('2026-11-30T16:00:00Z'))).toBe('2026-12');
    expect(getGameMonth(new Date('2026-11-15T00:00:00Z'))).toBe('2026-11');
  });
});

describe('clampGameScore', () => {
  it('서버 상한(999)을 넘는 점수는 상한으로 맞춘다', () => {
    expect(clampGameScore(1500)).toBe(999);
    expect(clampGameScore(999)).toBe(999);
  });

  it('티키타닥은 단계 점수라 5999까지 허용한다', () => {
    expect(clampGameScore(5999, 'keycap')).toBe(5999);
    expect(clampGameScore(9000, 'keycap')).toBe(5999);
  });

  it('음수나 소수는 정수 0 이상으로 맞춘다', () => {
    expect(clampGameScore(-5)).toBe(0);
    expect(clampGameScore(12.9)).toBe(12);
  });
});
