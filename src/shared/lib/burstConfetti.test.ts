import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { burstConfetti } from './burstConfetti';

const mockReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as typeof window.matchMedia;
};

const translate = vi.fn();

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
      translate,
      rotate: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    translate.mockClear();
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

  it('주사율과 관계없이 같은 시점에는 같은 위치에 그린다', () => {
    mockReducedMotion(false);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // 600ms 시점까지 주어진 주사율로 프레임을 돌린 뒤 마지막으로 그린 위치
    const positionAt600ms = (fps: number) => {
      translate.mockClear();
      frames = [];
      burstConfetti();
      const frameCount = (600 * fps) / 1000;
      for (let frame = 1; frame <= frameCount; frame += 1) runFrame((frame * 1000) / fps);
      return translate.mock.calls.at(-1);
    };

    expect(positionAt600ms(120)).toEqual(positionAt600ms(60));
  });
});
