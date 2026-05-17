import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTrashDragZone } from './useTrashDragZone';

const attachTrash = (
  ref: React.RefObject<HTMLDivElement | null>,
  rect: { left: number; top: number; width: number; height: number },
) => {
  const el = document.createElement('div');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
  (ref as { current: HTMLDivElement | null }).current = el;
};

describe('useTrashDragZone', () => {
  it('initial state', () => {
    const { result } = renderHook(() => useTrashDragZone({ onMove: vi.fn(), onRemove: vi.fn() }));
    expect(result.current.draggingId).toBeNull();
    expect(result.current.isOverTrash).toBe(false);
  });

  it('handleDragStart sets draggingId', () => {
    const { result } = renderHook(() => useTrashDragZone({ onMove: vi.fn(), onRemove: vi.fn() }));
    act(() => result.current.handleDragStart('sticker-1'));
    expect(result.current.draggingId).toBe('sticker-1');
    expect(result.current.isOverTrash).toBe(false);
  });

  it('handleDragMove calls onMove when pointer is outside trash', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useTrashDragZone({ onMove, onRemove: vi.fn() }));
    attachTrash(result.current.trashRef, { left: 0, top: 0, width: 50, height: 50 });
    act(() => result.current.handleDragStart('sticker-1'));
    act(() => result.current.handleDragMove('sticker-1', 0.5, 0.5, 200, 200));
    expect(onMove).toHaveBeenCalledWith('sticker-1', 0.5, 0.5);
    expect(result.current.isOverTrash).toBe(false);
  });

  it('handleDragMove always calls onMove and sets isOverTrash when over trash', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useTrashDragZone({ onMove, onRemove: vi.fn() }));
    attachTrash(result.current.trashRef, { left: 0, top: 0, width: 100, height: 100 });
    act(() => result.current.handleDragStart('sticker-1'));
    act(() => result.current.handleDragMove('sticker-1', 0.5, 0.5, 50, 50));
    expect(onMove).toHaveBeenCalledWith('sticker-1', 0.5, 0.5);
    expect(result.current.isOverTrash).toBe(true);
  });

  it('handleDragEnd over trash calls onRemove', () => {
    const onRemove = vi.fn();
    const { result } = renderHook(() => useTrashDragZone({ onMove: vi.fn(), onRemove }));
    attachTrash(result.current.trashRef, { left: 0, top: 0, width: 100, height: 100 });
    act(() => result.current.handleDragStart('sticker-1'));
    act(() => result.current.handleDragMove('sticker-1', 0.5, 0.5, 50, 50));
    act(() => result.current.handleDragEnd('sticker-1'));
    expect(onRemove).toHaveBeenCalledWith('sticker-1');
    expect(result.current.draggingId).toBeNull();
    expect(result.current.isOverTrash).toBe(false);
  });

  it('handleDragMove without preceding handleDragStart never reports isOverTrash', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useTrashDragZone({ onMove, onRemove: vi.fn() }));
    attachTrash(result.current.trashRef, { left: 0, top: 0, width: 100, height: 100 });
    act(() => result.current.handleDragMove('sticker-1', 0.5, 0.5, 50, 50));
    expect(result.current.isOverTrash).toBe(false);
    expect(onMove).toHaveBeenCalledWith('sticker-1', 0.5, 0.5);
  });

  it('handleDragEnd outside trash does not call onRemove', () => {
    const onRemove = vi.fn();
    const { result } = renderHook(() => useTrashDragZone({ onMove: vi.fn(), onRemove }));
    attachTrash(result.current.trashRef, { left: 0, top: 0, width: 50, height: 50 });
    act(() => result.current.handleDragStart('sticker-1'));
    act(() => result.current.handleDragMove('sticker-1', 0.5, 0.5, 200, 200));
    act(() => result.current.handleDragEnd('sticker-1'));
    expect(onRemove).not.toHaveBeenCalled();
    expect(result.current.draggingId).toBeNull();
  });
});
