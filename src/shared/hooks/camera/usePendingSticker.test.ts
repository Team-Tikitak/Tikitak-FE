import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { type PlacedSticker } from '@/shared/types/sticker';
import { usePendingSticker } from './usePendingSticker';

const useTestHarness = (initial: PlacedSticker[] = []) => {
  const [stickers, setStickers] = useState<PlacedSticker[]>(initial);
  const handlers = usePendingSticker(setStickers);
  return { stickers, ...handlers };
};

const sticker = (overrides: Partial<PlacedSticker> = {}): PlacedSticker => ({
  id: 's1',
  stickerId: 'blueSparkle',
  xRatio: 0.5,
  yRatio: 0.5,
  scale: 1,
  ...overrides,
});

describe('usePendingSticker', () => {
  it('handleAddSticker appends a sticker with generated id and centered position', () => {
    const { result } = renderHook(() => useTestHarness());
    act(() => result.current.handleAddSticker('blueSparkle'));
    expect(result.current.stickers).toHaveLength(1);
    expect(result.current.stickers[0]).toMatchObject({
      stickerId: 'blueSparkle',
      xRatio: 0.5,
      yRatio: 0.5,
      scale: 1,
      rotation: 0,
    });
    expect(result.current.stickers[0].id).toEqual(expect.any(String));
  });

  it('handleMoveSticker updates xRatio and yRatio of matching id only', () => {
    const initial = [sticker({ id: 'a' }), sticker({ id: 'b', xRatio: 0.2, yRatio: 0.3 })];
    const { result } = renderHook(() => useTestHarness(initial));
    act(() => result.current.handleMoveSticker('b', 0.7, 0.8));
    expect(result.current.stickers[0]).toMatchObject({ id: 'a', xRatio: 0.5, yRatio: 0.5 });
    expect(result.current.stickers[1]).toMatchObject({ id: 'b', xRatio: 0.7, yRatio: 0.8 });
  });

  it('handleScaleSticker updates scale of matching id only', () => {
    const initial = [sticker({ id: 'a' }), sticker({ id: 'b' })];
    const { result } = renderHook(() => useTestHarness(initial));
    act(() => result.current.handleScaleSticker('a', 2.5));
    expect(result.current.stickers[0].scale).toBe(2.5);
    expect(result.current.stickers[1].scale).toBe(1);
  });

  it('handleRotateSticker updates rotation of matching id only', () => {
    const initial = [sticker({ id: 'a' }), sticker({ id: 'b' })];
    const { result } = renderHook(() => useTestHarness(initial));
    act(() => result.current.handleRotateSticker('a', 45));
    expect(result.current.stickers[0].rotation).toBe(45);
    expect(result.current.stickers[1].rotation).toBeUndefined();
  });

  it('handleRemoveSticker filters out the sticker with matching id', () => {
    const initial = [sticker({ id: 'a' }), sticker({ id: 'b' }), sticker({ id: 'c' })];
    const { result } = renderHook(() => useTestHarness(initial));
    act(() => result.current.handleRemoveSticker('b'));
    expect(result.current.stickers).toHaveLength(2);
    expect(result.current.stickers.map((s) => s.id)).toEqual(['a', 'c']);
  });
});
