import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { burstConfetti } from './burstConfetti';

const mockReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as typeof window.matchMedia;
};

describe('burstConfetti', () => {
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(performance, 'now').mockReturnValue(0);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      scale: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const runFrame = (time: number) => {
    const next = frames.shift();
    next?.(time);
  };

  it('꽃가루 캔버스를 띄웠다가 재생이 끝나면 제거한다', () => {
    mockReducedMotion(false);

    burstConfetti();

    expect(document.querySelector('canvas')).toBeInTheDocument();

    runFrame(100);
    expect(document.querySelector('canvas')).toBeInTheDocument();

    runFrame(1800);
    expect(document.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('동작 줄이기 설정이면 꽃가루를 띄우지 않는다', () => {
    mockReducedMotion(true);

    burstConfetti();

    expect(document.querySelector('canvas')).not.toBeInTheDocument();
  });
});
