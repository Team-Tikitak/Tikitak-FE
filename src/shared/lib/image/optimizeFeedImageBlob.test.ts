import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadImage } from './loadImage';
import { optimizeFeedImageBlob } from './optimizeFeedImageBlob';

vi.mock('./loadImage', () => ({
  loadImage: vi.fn(),
}));

const createImage = (width: number, height: number) =>
  ({
    naturalWidth: width,
    naturalHeight: height,
  }) as HTMLImageElement;

describe('optimizeFeedImageBlob', () => {
  const createObjectUrl = vi.fn(() => 'blob:source');
  const revokeObjectUrl = vi.fn();
  const drawImage = vi.fn();
  const toBlob = vi.fn();
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName !== 'canvas') return originalCreateElement(tagName);

      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          imageSmoothingQuality: 'low',
          drawImage,
        })),
        toBlob,
      } as unknown as HTMLCanvasElement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    createObjectUrl.mockClear();
    revokeObjectUrl.mockClear();
    drawImage.mockClear();
    toBlob.mockClear();
  });

  it('큰 JPEG 이미지는 긴 변 2048px 기준으로 리사이즈한다', async () => {
    const source = new Blob(['x'.repeat(1000)], { type: 'image/jpeg' });
    const optimized = new Blob(['small'], { type: 'image/jpeg' });
    vi.mocked(loadImage).mockResolvedValue(createImage(4096, 2048));
    toBlob.mockImplementation((callback: BlobCallback, type?: string, quality?: number) => {
      expect(type).toBe('image/jpeg');
      expect(quality).toBe(0.92);
      callback(optimized);
    });

    const result = await optimizeFeedImageBlob(source);

    expect(result).toBe(optimized);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 2048, 1024);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:source');
  });

  it('이미 충분히 작은 이미지는 원본을 유지한다', async () => {
    const source = new Blob(['source'], { type: 'image/jpeg' });
    vi.mocked(loadImage).mockResolvedValue(createImage(1200, 900));

    const result = await optimizeFeedImageBlob(source);

    expect(result).toBe(source);
    expect(toBlob).not.toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:source');
  });

  it('JPEG/WEBP가 아닌 이미지는 원본을 유지한다', async () => {
    const source = new Blob(['source'], { type: 'image/png' });

    const result = await optimizeFeedImageBlob(source);

    expect(result).toBe(source);
    expect(loadImage).not.toHaveBeenCalled();
  });
});
