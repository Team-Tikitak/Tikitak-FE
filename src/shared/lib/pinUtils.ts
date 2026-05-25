import type { FeedComment } from '@/shared/api/feedComment/types';
import { toAbsoluteUrl } from '@/shared/lib/toAbsoluteUrl';
import type { Pin } from '@/shared/ui';

export const makeSlot = (feedId: number, imageIndex: number) => `${feedId}-${imageIndex}`;
export const makePosKey = (x: number, y: number) => `${x},${y}`;
export const isSamePos = (x: number, y: number, px: number, py: number) => x === px && y === py;

export const groupCommentsByPos = (comments: FeedComment[], feedImageId: number) =>
  comments
    .filter((c) => c.feedImageId === feedImageId)
    .reduce<Record<string, FeedComment[]>>((acc, c) => {
      const key = makePosKey(c.positionX, c.positionY);
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});

export const buildApiPin = (group: FeedComment[], onClick: () => void): Pin => {
  const first = group[0];
  const x = first.positionX * 100;
  const y = first.positionY * 100;

  const uniqueAuthors = [...new Map(group.map((c) => [c.author.teamMemberId, c.author])).values()];

  if (uniqueAuthors.length >= 2) {
    const [a, b] = uniqueAuthors;
    return {
      id: String(first.commentId),
      x,
      y,
      count: 'multiple' as const,
      avatars: [
        { id: String(a.teamMemberId), src: toAbsoluteUrl(a.profileImageUrl) ?? '' },
        { id: String(b.teamMemberId), src: toAbsoluteUrl(b.profileImageUrl) ?? '' },
      ],
      onClick,
    };
  }

  return {
    id: String(first.commentId),
    x,
    y,
    avatars: [
      {
        id: String(first.author.teamMemberId),
        src: toAbsoluteUrl(first.author.profileImageUrl) ?? '',
      },
    ],
    onClick,
  };
};
