import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shatterImage } from './shatterImage';

const mockReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as typeof window.matchMedia;
};

const createImage = (naturalWidth: number, ariaHidden = false) => {
  const image = document.createElement('img');
  Object.defineProperty(image, 'naturalWidth', { value: naturalWidth });
  Object.defineProperty(image, 'naturalHeight', { value: 300 });
  if (ariaHidden) image.setAttribute('aria-hidden', 'true');
  return image;
};

const createFrame = (loaded = true, preview?: HTMLImageElement) => {
  const frame = document.createElement('figure');
  if (preview) frame.appendChild(preview);
  frame.appendChild(createImage(loaded ? 400 : 0));
  document.body.appendChild(frame);
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 100,
    right: 390,
    bottom: 620,
    width: 390,
    height: 520,
  } as DOMRect);
  return frame;
};

const drawImage = vi.fn();

describe('shatterImage', () => {
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
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      rect: vi.fn(),
      stroke: vi.fn(),
      drawImage,
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    drawImage.mockClear();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('원본 사진을 숨기고 깨지는 연출이 끝나면 캔버스를 제거한다', () => {
    mockReducedMotion(false);
    const frame = createFrame();

    shatterImage(frame);

    expect(frame.style.visibility).toBe('hidden');
    expect(document.querySelector('body > canvas')).toBeInTheDocument();

    frames.shift()?.(3000);
    expect(document.querySelector('body > canvas')).not.toBeInTheDocument();
  });

  it('금이 가는 동안은 사진을 통째로, 이후에는 조각마다 그린다', () => {
    mockReducedMotion(false);
    const frame = createFrame();

    shatterImage(frame);
    drawImage.mockClear();

    frames.shift()?.(100);
    expect(drawImage).toHaveBeenCalledTimes(1);

    drawImage.mockClear();
    frames.shift()?.(500);
    expect(drawImage.mock.calls.length).toBeGreaterThan(1);
  });

  it('복원 함수를 부르면 원본 사진이 다시 보인다', () => {
    mockReducedMotion(false);
    const frame = createFrame();

    const restore = shatterImage(frame);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    restore();

    expect(frame.style.visibility).toBe('');
    expect(document.querySelector('body > canvas')).not.toBeInTheDocument();
    expect(cancel).toHaveBeenCalled();
  });

  it('동작 줄이기 설정이거나 사진이 로드되지 않았으면 아무것도 하지 않는다', () => {
    mockReducedMotion(true);
    const reducedFrame = createFrame();
    shatterImage(reducedFrame);
    expect(reducedFrame.style.visibility).toBe('');

    mockReducedMotion(false);
    const unloadedFrame = createFrame(false);
    shatterImage(unloadedFrame);
    expect(unloadedFrame.style.visibility).toBe('');
    expect(document.querySelector('body > canvas')).not.toBeInTheDocument();
  });

  it('미리보기와 원본이 모두 로드됐으면 화면에 보이는 원본을 깨뜨린다', () => {
    mockReducedMotion(false);
    const preview = createImage(40, true);
    const frame = createFrame(true, preview);

    shatterImage(frame);

    const [snapshotSource] = drawImage.mock.calls[0];
    expect(snapshotSource).not.toBe(preview);
    expect(snapshotSource).toBe(frame.querySelector('img:not([aria-hidden])'));
  });
});
