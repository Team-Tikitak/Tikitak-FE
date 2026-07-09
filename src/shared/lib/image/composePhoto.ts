import { getSticker } from '@/shared/assets/Sticker/catalog';
import { type PlacedSticker } from '@/shared/types/sticker';
import { loadImage } from './loadImage';

const STICKER_SIZE_RATIO = 0.18; // 합성 시 스티커 폭이 사진 폭의 18%

export const composePhotoWithStickers = async (
  photoBlob: Blob,
  stickers: PlacedSticker[],
): Promise<Blob> => {
  const photoUrl = URL.createObjectURL(photoBlob);
  try {
    const photo = await loadImage(photoUrl);
    const canvas = document.createElement('canvas');
    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');

    context.imageSmoothingQuality = 'high';

    context.drawImage(photo, 0, 0);

    const baseStickerSize = photo.naturalWidth * STICKER_SIZE_RATIO;
    await Promise.all(
      stickers.map(async (placed) => {
        const entry = getSticker(placed.stickerId);
        const image = await loadImage(entry.url);
        const size = baseStickerSize * placed.scale;
        // drawImage는 SVG preserveAspectRatio를 무시하므로 비율을 직접 유지한다
        const aspect = image.naturalWidth / image.naturalHeight;
        const drawWidth = aspect >= 1 ? size : size * aspect;
        const drawHeight = aspect >= 1 ? size / aspect : size;
        const x = placed.xRatio * photo.naturalWidth;
        const y = placed.yRatio * photo.naturalHeight;
        const rotation = ((placed.rotation ?? 0) * Math.PI) / 180;

        context.save();
        context.translate(x, y);
        context.rotate(rotation);
        context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        context.restore();
      }),
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compose photo'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95,
      );
    });
  } finally {
    URL.revokeObjectURL(photoUrl);
  }
};
