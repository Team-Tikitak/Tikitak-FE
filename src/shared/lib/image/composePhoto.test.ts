import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { composePhotoWithStickers } from './composePhoto';
import { loadImage } from './loadImage';

vi.mock('./loadImage', () => ({
  loadImage: vi.fn(),
}));

vi.mock('@/shared/assets/Sticker/catalog', () => ({
  getSticker: vi.fn(() => ({ url: 'blob:sticker' })),
}));

const createImage = (width: number, height: number) =>
  ({
    naturalWidth: width,
    naturalHeight: height,
  }) as HTMLImageElement;

describe('composePhotoWithStickers', () => {
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
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
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

  it('세로가 더 긴 스티커는 정사각형으로 늘리지 않고 원본 비율대로 그린다', async () => {
    const photoBlob = new Blob(['photo'], { type: 'image/jpeg' });
    vi.mocked(loadImage)
      .mockResolvedValueOnce(createImage(1080, 1440))
      .mockResolvedValueOnce(createImage(318, 377));

    await composePhotoWithStickers(photoBlob, [
      { id: 's1', stickerId: 'redWave', xRatio: 0.5, yRatio: 0.5, scale: 1, rotation: 0 },
    ]);

    const stickerDrawCall = drawImage.mock.calls.find((call) => call[3] !== undefined);
    expect(stickerDrawCall).toBeDefined();
    const [, , , drawWidth, drawHeight] = stickerDrawCall as number[];
    expect(drawWidth).not.toBe(drawHeight);
    expect(drawWidth / drawHeight).toBeCloseTo(318 / 377, 5);
  });
});
