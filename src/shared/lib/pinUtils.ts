import type { FeedComment } from '@/shared/api/feedComment/types';
import type { Pin } from '@/shared/ui/FeedDetail/FeedImageDetail';
import { toSafeImageUrl } from './image/normalizeImageUrl';

export const makeSlot = (feedId: number, imageIndex: number) => `${feedId}-${imageIndex}`;
export const makePosKey = (x: number, y: number) => `${x},${y}`;
const POS_EPSILON = 0.005;
export const isSamePos = (x: number, y: number, px: number, py: number) =>
  Math.abs(x - px) < POS_EPSILON && Math.abs(y - py) < POS_EPSILON;

export const groupCommentsByPos = (
  comments: FeedComment[],
  feedImageId: number,
): FeedComment[][] => {
  const groups: FeedComment[][] = [];
  for (const comment of comments.filter((c) => c.feedImageId === feedImageId)) {
    const group = groups.find((g) =>
      isSamePos(comment.positionX, comment.positionY, g[0].positionX, g[0].positionY),
    );
    if (group) group.push(comment);
    else groups.push([comment]);
  }
  return groups;
};

export const buildApiPin = (group: FeedComment[], onClick: () => void): Pin => {
  const first = group[0];
  const x = first.positionX * 100;
  const y = first.positionY * 100;
  const variant = group.some((c) => c.isMine) ? 'new' : 'default';

  const uniqueAuthors = [...new Map(group.map((c) => [c.author.teamMemberId, c.author])).values()];

  if (uniqueAuthors.length >= 2) {
    const [a, b] = uniqueAuthors;
    return {
      id: String(first.commentId),
      x,
      y,
      variant,
      count: 'multiple' as const,
      avatars: [
        { id: String(a.teamMemberId), src: toSafeImageUrl(a.profileImageUrl) },
        { id: String(b.teamMemberId), src: toSafeImageUrl(b.profileImageUrl) },
      ],
      onClick,
    };
  }

  return {
    id: String(first.commentId),
    x,
    y,
    variant,
    avatars: [
      {
        id: String(first.author.teamMemberId),
        src: toSafeImageUrl(first.author.profileImageUrl),
      },
    ],
    onClick,
  };
};
