import { computeCaptureRect } from './computeCaptureRect';
import { loadImage } from './loadImage';

export const cropImageBlobToAspectRatio = async (
  imageBlob: Blob,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> => {
  const imageUrl = URL.createObjectURL(imageBlob);
  try {
    const image = await loadImage(imageUrl);
    const rect = computeCaptureRect(
      image.naturalWidth,
      image.naturalHeight,
      targetWidth,
      targetHeight,
    );
    if (!rect) return imageBlob;

    const canvas = document.createElement('canvas');
    canvas.width = rect.sourceWidth;
    canvas.height = rect.sourceHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');

    context.imageSmoothingQuality = 'high';

    context.drawImage(
      image,
      rect.sourceX,
      rect.sourceY,
      rect.sourceWidth,
      rect.sourceHeight,
      0,
      0,
      rect.sourceWidth,
      rect.sourceHeight,
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to crop image'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95,
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
