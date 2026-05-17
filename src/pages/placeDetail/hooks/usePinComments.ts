import { useState } from 'react';
import { type CommentSheetItem, type Pin } from '@/shared/ui';
import { MOCK_PIN_COMMENTS } from '../model/mock';
import { type FeedItem } from '../model/types';

const CURRENT_USER_AVATAR = 'https://i.pravatar.cc/36?img=10';

const pinKey = (...parts: Array<string | number>) => parts.join('-');
const mockPinKey = (feedId: number, imageIndex: number, pinId: string) =>
  pinKey('mock', feedId, imageIndex, pinId);

const initialPinComments = (feeds: FeedItem[]): Record<string, CommentSheetItem[]> => {
  const init: Record<string, CommentSheetItem[]> = {};
  for (const feed of feeds) {
    feed.images.forEach((image, imageIndex) => {
      image.pins?.forEach((pin) => {
        init[mockPinKey(feed.id, imageIndex, pin.id)] = [...MOCK_PIN_COMMENTS];
      });
    });
  }
  return init;
};

export const usePinComments = (feeds: FeedItem[]) => {
  const [addedPins, setAddedPins] = useState<Record<string, Pin[]>>({});
  const [pinComments, setPinComments] = useState<Record<string, CommentSheetItem[]>>(() =>
    initialPinComments(feeds),
  );
  const [openPinKey, setOpenPinKey] = useState<string | null>(null);
  const [displayPinKey, setDisplayPinKey] = useState<string | null>(null);

  const openSheet = (key: string) => {
    setDisplayPinKey(key);
    setOpenPinKey(key);
  };

  const closeSheet = () => setOpenPinKey(null);
  const completeClose = () => setDisplayPinKey(null);

  const submitComment = (text: string) => {
    if (!displayPinKey) return;
    setPinComments((prev) => ({
      ...prev,
      [displayPinKey]: [
        ...(prev[displayPinKey] ?? []),
        {
          id: crypto.randomUUID(),
          authorName: '나',
          text,
          avatarSrc: CURRENT_USER_AVATAR,
        },
      ],
    }));
  };

  const addPinAt = (feedId: number, imageIndex: number, x: number, y: number) => {
    const slot = pinKey(feedId, imageIndex);
    const newPin: Pin = {
      id: crypto.randomUUID(),
      x,
      y,
      variant: 'new',
      avatars: [{ id: 'me', src: CURRENT_USER_AVATAR }],
    };
    setAddedPins((prev) => ({ ...prev, [slot]: [...(prev[slot] ?? []), newPin] }));
    openSheet(newPin.id);
  };

  const decoratePins = (feedId: number, imageIndex: number, mockPins: Pin[] | undefined): Pin[] => {
    const decoratedMock = (mockPins ?? []).map((pin) => ({
      ...pin,
      onClick: () => openSheet(mockPinKey(feedId, imageIndex, pin.id)),
    }));
    const decoratedNew = (addedPins[pinKey(feedId, imageIndex)] ?? []).map((pin) => ({
      ...pin,
      onClick: () => openSheet(pin.id),
    }));
    return [...decoratedMock, ...decoratedNew];
  };

  return {
    openPinKey,
    displayPinKey,
    commentsForOpenPin: displayPinKey ? (pinComments[displayPinKey] ?? []) : [],
    closeSheet,
    completeClose,
    submitComment,
    addPinAt,
    decoratePins,
  };
};
