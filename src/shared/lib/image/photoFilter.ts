import { loadImage } from './loadImage';

export type PhotoFilterId = 'none' | 'warm' | 'mono' | 'film' | 'vivid' | 'cool';

export interface PhotoFilter {
  id: PhotoFilterId;
  label: string;
  css: string;
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: 'none', label: '원본', css: 'none' },
  { id: 'warm', label: '화사', css: 'brightness(1.06) saturate(1.18) contrast(1.02) sepia(0.06)' },
  { id: 'mono', label: '흑백', css: 'grayscale(1) contrast(1.05)' },
  { id: 'film', label: '필름', css: 'sepia(0.32) saturate(1.1) contrast(0.96) brightness(1.04)' },
  { id: 'vivid', label: '선명', css: 'contrast(1.15) saturate(1.3)' },
  { id: 'cool', label: '쿨', css: 'saturate(0.9) brightness(1.05) hue-rotate(-8deg)' },
];

export const getFilterCss = (id: PhotoFilterId): string =>
  PHOTO_FILTERS.find((filter) => filter.id === id)?.css ?? 'none';

// iOS 17 미만 WKWebView 등은 CanvasRenderingContext2D.filter 미지원 → 굽기가 적용 안 됨
export const isCanvasFilterSupported = (): boolean => {
  const context = document.createElement('canvas').getContext('2d');
  return context !== null && 'filter' in context;
};

export const applyFilterToBlob = async (blob: Blob, filterCss: string): Promise<Blob> => {
  if (!filterCss || filterCss === 'none') return blob;

  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context || !('filter' in context)) return blob;

    context.filter = filterCss;
    context.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((result) => resolve(result ?? blob), 'image/jpeg', 0.9);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};
