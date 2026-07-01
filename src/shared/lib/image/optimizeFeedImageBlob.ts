import { loadImage } from './loadImage';

const DEFAULT_MAX_DIMENSION = 2048;
const DEFAULT_QUALITY = 0.92;
const OPTIMIZABLE_TYPES = new Set(['image/jpeg', 'image/webp']);

interface OptimizeFeedImageOptions {
  maxDimension?: number;
  quality?: number;
}

const getScaledSize = (width: number, height: number, maxDimension: number) => {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height, shouldResize: false };

  const scale = maxDimension / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    shouldResize: true,
  };
};

export const optimizeFeedImageBlob = async (
  blob: Blob,
  {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
  }: OptimizeFeedImageOptions = {},
): Promise<Blob> => {
  if (!OPTIMIZABLE_TYPES.has(blob.type)) return blob;

  const imageUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(imageUrl);
    const { width, height, shouldResize } = getScaledSize(
      image.naturalWidth,
      image.naturalHeight,
      maxDimension,
    );

    if (!shouldResize) return blob;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return blob;

    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const optimized = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, blob.type, quality);
    });

    if (!optimized || optimized.size >= blob.size) return blob;
    return optimized;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};
