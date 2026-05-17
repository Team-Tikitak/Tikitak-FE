import { describe, expect, it, vi } from 'vitest';
import { getPointerRatio } from './getPointerRatio';

const makeElement = (rect: { left: number; top: number; width: number; height: number }) => {
  const el = document.createElement('div');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
  return el;
};

describe('getPointerRatio', () => {
  it('returns ratios in [0, 1] for pointer inside the element', () => {
    const el = makeElement({ left: 100, top: 200, width: 200, height: 100 });
    expect(getPointerRatio({ clientX: 150, clientY: 250 }, el)).toEqual({ x: 0.25, y: 0.5 });
  });

  it('returns 0 at top-left corner', () => {
    const el = makeElement({ left: 0, top: 0, width: 100, height: 100 });
    expect(getPointerRatio({ clientX: 0, clientY: 0 }, el)).toEqual({ x: 0, y: 0 });
  });

  it('returns 1 at bottom-right corner', () => {
    const el = makeElement({ left: 0, top: 0, width: 100, height: 100 });
    expect(getPointerRatio({ clientX: 100, clientY: 100 }, el)).toEqual({ x: 1, y: 1 });
  });

  it('clamps negative coordinates to 0', () => {
    const el = makeElement({ left: 100, top: 100, width: 100, height: 100 });
    expect(getPointerRatio({ clientX: 50, clientY: 50 }, el)).toEqual({ x: 0, y: 0 });
  });

  it('clamps overflowing coordinates to 1', () => {
    const el = makeElement({ left: 0, top: 0, width: 100, height: 100 });
    expect(getPointerRatio({ clientX: 999, clientY: 999 }, el)).toEqual({ x: 1, y: 1 });
  });
});
