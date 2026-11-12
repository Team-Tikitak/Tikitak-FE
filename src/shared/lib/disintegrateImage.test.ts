import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disintegrateImage } from './disintegrateImage';

const mockReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as typeof window.matchMedia;
};

const createFrame = (loaded = true) => {
  const frame = document.createElement('figure');
  const image = document.createElement('img');
  Object.defineProperty(image, 'naturalWidth', { value: loaded ? 400 : 0 });
  Object.defineProperty(image, 'naturalHeight', { value: 300 });
  frame.appendChild(image);
  document.body.appendChild(frame);
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 100,
    width: 390,
    height: 520,
  } as DOMRect);
  return frame;
};

describe('disintegrateImage', () => {
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
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('원본 사진을 숨기고 흩날림이 끝나면 캔버스를 제거한다', () => {
    mockReducedMotion(false);
    const frame = createFrame();

    disintegrateImage(frame);

    expect(frame.style.visibility).toBe('hidden');
    expect(document.querySelector('body > canvas')).toBeInTheDocument();

    frames.shift()?.(1200);
    expect(document.querySelector('body > canvas')).not.toBeInTheDocument();
  });

  it('복원 함수를 부르면 원본 사진이 다시 보인다', () => {
    mockReducedMotion(false);
    const frame = createFrame();

    const restore = disintegrateImage(frame);
    restore();

    expect(frame.style.visibility).toBe('');
  });

  it('동작 줄이기 설정이거나 사진이 로드되지 않았으면 아무것도 하지 않는다', () => {
    mockReducedMotion(true);
    const reducedFrame = createFrame();
    disintegrateImage(reducedFrame);
    expect(reducedFrame.style.visibility).toBe('');

    mockReducedMotion(false);
    const unloadedFrame = createFrame(false);
    disintegrateImage(unloadedFrame);
    expect(unloadedFrame.style.visibility).toBe('');
    expect(document.querySelector('body > canvas')).not.toBeInTheDocument();
  });
});
