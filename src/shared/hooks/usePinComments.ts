import { useState } from 'react';
import {
  useDeleteFeedComment,
  useGetFeedComments,
  usePostFeedComment,
} from '@/shared/api/feedComment/queries';
import { useGetTeams } from '@/shared/api/user/queries';
import { normalizeImageUrl } from '@/shared/lib/normalizeImageUrl';
import { makeSlot, isSamePos, groupCommentsByPos, buildApiPin } from '@/shared/lib/pinUtils';
import { type Pin, type CommentSheetItem } from '@/shared/ui';

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
  const myProfileImageUrl = normalizeImageUrl(teams?.find((t) => t.isActive)?.profileImgUrl) ?? '';

  const { data: commentsData } = useGetFeedComments(teamId, feedId);
  const { mutate: postComment } = usePostFeedComment(teamId, feedId);
  const { mutate: deleteComment } = useDeleteFeedComment(teamId, feedId);

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

  const addPinAt = (feedId: number, imageIndex: number, x: number, y: number) => {
    const slot = makeSlot(feedId, imageIndex);
    const feedImageId = feedImageIds[imageIndex];
    const posX = parseFloat((x / 100).toFixed(2));
    const posY = parseFloat((y / 100).toFixed(2));
    const newPin: Pin = {
      id: crypto.randomUUID(),
      x: posX * 100,
      y: posY * 100,
      variant: 'new',
      avatars: [{ id: 'me', src: myProfileImageUrl }],
    };
    setAddedPins((prev) => ({ ...prev, [slot]: [...(prev[slot] ?? []), newPin] }));
    setPendingNewPin({ slot, id: newPin.id });
    setPendingPosition({ feedImageId, x: posX, y: posY });
    openSheet(slot);
  };

  const decoratePins = (
    feedId: number,
    imageIndex: number,
    _mockPins: Pin[] | undefined,
  ): Pin[] => {
    const feedImageId = feedImageIds[imageIndex];

    const grouped = groupCommentsByPos(commentsData?.items ?? [], feedImageId);

    const apiPins: Pin[] = grouped.map((group) => {
      const onClick = () => {
        setPendingPosition({ feedImageId, x: group[0].positionX, y: group[0].positionY });
        openSheet(makeSlot(feedId, imageIndex));
      };
      return buildApiPin(group, onClick);
    });

    const slot = makeSlot(feedId, imageIndex);
    const newPins = (addedPins[slot] ?? []).map((pin) => ({
      ...pin,
      onClick: () => {
        setPendingPosition({ feedImageId, x: pin.x / 100, y: pin.y / 100 });
        openSheet(slot);
      },
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
            avatarSrc: normalizeImageUrl(c.author.profileImageUrl) ?? '',
            isMine: c.isMine,
            onDelete: c.isMine ? () => deleteComment(c.commentId) : undefined,
          }))
      : [];

  return {
    openPinKey,
    displayPinKey,
    commentsForOpenPin,
    deleteComment,
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  };
};
