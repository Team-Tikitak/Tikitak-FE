import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadImage } from './loadImage';
import { applyFilterToBlob } from './photoFilter';

vi.mock('./loadImage', () => ({
  loadImage: vi.fn(),
}));

const createImage = (width: number, height: number) =>
  ({
    naturalWidth: width,
    naturalHeight: height,
  }) as HTMLImageElement;

describe('applyFilterToBlob', () => {
  const createObjectUrl = vi.fn(() => 'blob:source');
  const revokeObjectUrl = vi.fn();
  const drawImage = vi.fn();
  const toBlob = vi.fn();
  const putImageData = vi.fn();
  let sourcePixel: Uint8ClampedArray;
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();
    sourcePixel = new Uint8ClampedArray([200, 50, 50, 255]);
    vi.mocked(loadImage).mockResolvedValue(createImage(1, 1));
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
          getImageData: vi.fn(() => ({ data: sourcePixel })),
          putImageData,
        })),
        toBlob,
      } as unknown as HTMLCanvasElement;
    });
    toBlob.mockImplementation((callback: BlobCallback) => {
      callback(new Blob(['result'], { type: 'image/jpeg' }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('필터가 없으면 원본 blob을 그대로 반환한다', async () => {
    const original = new Blob(['raw'], { type: 'image/jpeg' });

    const result = await applyFilterToBlob(original, 'none');

    expect(result).toBe(original);
    expect(drawImage).not.toHaveBeenCalled();
  });

  it('canvas filter API 대신 직접 픽셀 연산으로 필터를 적용한다', async () => {
    const original = new Blob(['raw'], { type: 'image/jpeg' });
    const originalRed = sourcePixel[0];

    await applyFilterToBlob(original, 'grayscale(1)');

    expect(putImageData).toHaveBeenCalledTimes(1);
    const [imageData] = putImageData.mock.calls[0] as [{ data: Uint8ClampedArray }];
    const [r, g, b] = imageData.data;
    // grayscale(1)은 R/G/B를 모두 같은 휘도값으로 수렴시킨다
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).not.toBe(originalRed);
  });
});
