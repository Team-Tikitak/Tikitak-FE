import { describe, expect, it, vi } from 'vitest';
import type { FeedComment } from '@/shared/api/feedComment/types';
import { buildApiPin, groupCommentsByPos, isSamePos } from './pinUtils';

const makeComment = (
  overrides: Partial<{
    commentId: number;
    feedImageId: number;
    positionX: number;
    positionY: number;
    teamMemberId: number;
    profileImageUrl: string;
    isMine: boolean;
  }> = {},
): FeedComment => ({
  commentId: overrides.commentId ?? 1,
  feedId: 42,
  feedImageId: overrides.feedImageId ?? 10,
  content: '댓글',
  positionX: overrides.positionX ?? 0.3,
  positionY: overrides.positionY ?? 0.4,
  author: {
    teamMemberId: overrides.teamMemberId ?? 1,
    nickname: '유저',
    profileImageUrl: overrides.profileImageUrl ?? 'http://a.jpg',
    anonymous: false,
    isAnonymous: false,
  },
  createdAt: '',
  updatedAt: '',
  mine: overrides.isMine ?? false,
  isMine: overrides.isMine ?? false,
});

describe('isSamePos', () => {
  it('epsilon(0.005) 미만 차이는 같은 좌표로 판단한다', () => {
    expect(isSamePos(0.3, 0.4, 0.3004, 0.4004)).toBe(true);
  });

  it('epsilon(0.005) 이상 차이는 다른 좌표로 판단한다', () => {
    expect(isSamePos(0.3, 0.4, 0.31, 0.4)).toBe(false);
  });
});

describe('groupCommentsByPos', () => {
  it('feedImageId가 다른 댓글은 필터링한다', () => {
    const comments = [
      makeComment({ commentId: 1, feedImageId: 10 }),
      makeComment({ commentId: 2, feedImageId: 99 }),
    ];
    const groups = groupCommentsByPos(comments, 10);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(1);
    expect(groups[0][0].commentId).toBe(1);
  });

  it('같은 좌표 댓글은 한 그룹으로 묶는다', () => {
    const comments = [
      makeComment({ commentId: 1, positionX: 0.3, positionY: 0.4 }),
      makeComment({ commentId: 2, positionX: 0.3002, positionY: 0.4002 }),
    ];
    const groups = groupCommentsByPos(comments, 10);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(2);
  });

  it('다른 좌표 댓글은 여러 그룹으로 분리한다', () => {
    const comments = [
      makeComment({ commentId: 1, positionX: 0.3, positionY: 0.4 }),
      makeComment({ commentId: 2, positionX: 0.6, positionY: 0.7 }),
    ];
    const groups = groupCommentsByPos(comments, 10);
    expect(groups).toHaveLength(2);
  });
});

describe('buildApiPin', () => {
  it('저자 1명이면 단일 avatar, count 없음, x/y는 position*100', () => {
    const onClick = vi.fn();
    const pin = buildApiPin(
      [makeComment({ commentId: 5, positionX: 0.3, positionY: 0.4 })],
      onClick,
    );
    expect(pin.id).toBe('5');
    expect(pin.x).toBeCloseTo(30);
    expect(pin.y).toBeCloseTo(40);
    expect(pin.count).toBeUndefined();
    expect(pin.avatars).toHaveLength(1);
  });

  it('저자 2명 이상이면 count multiple, avatars 2개', () => {
    const pin = buildApiPin(
      [
        makeComment({ commentId: 1, teamMemberId: 1 }),
        makeComment({ commentId: 2, teamMemberId: 2 }),
      ],
      vi.fn(),
    );
    expect(pin.count).toBe('multiple');
    expect(pin.avatars).toHaveLength(2);
  });

  it('같은 저자 댓글이 여러 개여도 단일 핀으로 묶인다', () => {
    const pin = buildApiPin(
      [
        makeComment({ commentId: 1, teamMemberId: 1 }),
        makeComment({ commentId: 2, teamMemberId: 1 }),
      ],
      vi.fn(),
    );
    expect(pin.count).toBeUndefined();
    expect(pin.avatars).toHaveLength(1);
  });

  it('본인 댓글이 포함되면 variant는 new 다', () => {
    const pin = buildApiPin([makeComment({ commentId: 1, isMine: true })], vi.fn());
    expect(pin.variant).toBe('new');
  });

  it('본인 댓글이 없으면 variant는 default 다', () => {
    const pin = buildApiPin([makeComment({ commentId: 1, isMine: false })], vi.fn());
    expect(pin.variant).toBe('default');
  });
});
