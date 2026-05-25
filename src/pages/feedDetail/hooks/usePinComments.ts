import { useState } from 'react';
import { useGetFeedComments, usePostFeedComment } from '@/shared/api/feedComment/queries';
import { useGetTeams } from '@/shared/api/user/queries';
import { toAbsoluteUrl } from '@/shared/lib/toAbsoluteUrl';
import { type Pin, type CommentSheetItem } from '@/shared/ui';
import { makeSlot, isSamePos, groupCommentsByPos, buildApiPin } from '../lib/pinUtils';

interface UsePinCommentsParams {
  teamId: number;
  feedId: number;
  feedImageIds: number[];
}

export const usePinComments = ({ teamId, feedId, feedImageIds }: UsePinCommentsParams) => {
  const [addedPins, setAddedPins] = useState<Record<string, Pin[]>>({});
  const [openPinKey, setOpenPinKey] = useState<string | null>(null);
  const [displayPinKey, setDisplayPinKey] = useState<string | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{
    feedImageId: number;
    x: number;
    y: number;
  } | null>(null);
  const [pendingNewPin, setPendingNewPin] = useState<{ slot: string; id: string } | null>(null);

  const { data: teams } = useGetTeams();
  const myProfileImageUrl = teams?.find((t) => t.isActive)?.profileImageUrl ?? '';

  const { data: commentsData } = useGetFeedComments(teamId, feedId);
  const { mutate: postComment } = usePostFeedComment(teamId, feedId);

  const closeSheet = () => setOpenPinKey(null);
  const completeClose = () => {
    setDisplayPinKey(null);
    if (pendingNewPin) {
      setAddedPins((prev) => ({
        ...prev,
        [pendingNewPin.slot]: (prev[pendingNewPin.slot] ?? []).filter(
          (p) => p.id !== pendingNewPin.id,
        ),
      }));
      setPendingNewPin(null);
    }
  };

  const openSheet = (key: string) => {
    setDisplayPinKey(key);
    setOpenPinKey(key);
  };

  const submitComment = (text: string) => {
    if (!pendingPosition) return;
    postComment({
      feedImageId: pendingPosition.feedImageId,
      content: text,
      positionX: pendingPosition.x,
      positionY: pendingPosition.y,
    });
    setPendingNewPin(null);
  };

  const addPinAt = (feedId: number, imageIndex: number, x: number, y: number) => {
    const slot = makeSlot(feedId, imageIndex);
    const feedImageId = feedImageIds[imageIndex];
    const newPin: Pin = {
      id: crypto.randomUUID(),
      x: Math.round(x),
      y: Math.round(y),
      variant: 'new',
      avatars: [{ id: 'me', src: myProfileImageUrl }],
    };
    setAddedPins((prev) => ({ ...prev, [slot]: [...(prev[slot] ?? []), newPin] }));
    setPendingNewPin({ slot, id: newPin.id });
    setPendingPosition({
      feedImageId,
      x: parseFloat((x / 100).toFixed(2)),
      y: parseFloat((y / 100).toFixed(2)),
    });
    openSheet(slot);
  };

  const decoratePins = (
    feedId: number,
    imageIndex: number,
    _mockPins: Pin[] | undefined,
  ): Pin[] => {
    const feedImageId = feedImageIds[imageIndex];

    const grouped = groupCommentsByPos(commentsData?.items ?? [], feedImageId);

    const apiPins: Pin[] = Object.values(grouped).map((group) => {
      const onClick = () => {
        setPendingPosition({ feedImageId, x: group[0].positionX, y: group[0].positionY });
        openSheet(makeSlot(feedId, imageIndex));
      };
      return buildApiPin(group, onClick);
    });

    const slot = makeSlot(feedId, imageIndex);
    const newPins = (addedPins[slot] ?? []).map((pin) => ({
      ...pin,
      onClick: () => openSheet(slot),
    }));

    return [...apiPins, ...newPins];
  };

  const commentsForOpenPin: CommentSheetItem[] =
    displayPinKey && pendingPosition
      ? (commentsData?.items ?? [])
          .filter(
            (c) =>
              c.feedImageId === pendingPosition.feedImageId &&
              isSamePos(c.positionX, c.positionY, pendingPosition.x, pendingPosition.y),
          )
          .map((c) => ({
            id: String(c.commentId),
            authorName: c.author.nickname,
            text: c.content,
            avatarSrc: toAbsoluteUrl(c.author.profileImageUrl),
          }))
      : [];

  return {
    openPinKey,
    displayPinKey,
    commentsForOpenPin,
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  };
};
