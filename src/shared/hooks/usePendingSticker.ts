import { useCallback } from 'react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { type PlacedSticker } from '@/shared/types/sticker';

type StickerUpdater = (updater: (prev: PlacedSticker[]) => PlacedSticker[]) => void;

export const usePendingSticker = (setStickers: StickerUpdater) => {
  const handleAddSticker = useCallback(
    (stickerId: StickerId) => {
      setStickers((stickers) => [
        ...stickers,
        { id: crypto.randomUUID(), stickerId, xRatio: 0.5, yRatio: 0.5, scale: 1 },
      ]);
    },
    [setStickers],
  );

  const handleMoveSticker = useCallback(
    (id: string, xRatio: number, yRatio: number) => {
      setStickers((stickers) =>
        stickers.map((sticker) => (sticker.id === id ? { ...sticker, xRatio, yRatio } : sticker)),
      );
    },
    [setStickers],
  );

  const handleScaleSticker = useCallback(
    (id: string, scale: number) => {
      setStickers((stickers) =>
        stickers.map((sticker) => (sticker.id === id ? { ...sticker, scale } : sticker)),
      );
    },
    [setStickers],
  );

  const handleRemoveSticker = useCallback(
    (id: string) => {
      setStickers((stickers) => stickers.filter((sticker) => sticker.id !== id));
    },
    [setStickers],
  );

  return { handleAddSticker, handleMoveSticker, handleScaleSticker, handleRemoveSticker };
};
