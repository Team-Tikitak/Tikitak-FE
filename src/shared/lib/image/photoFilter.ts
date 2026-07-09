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

type Rgb = [number, number, number];
type PixelTransform = (rgb: Rgb) => Rgb;

const LUMA: Rgb = [0.2126, 0.7152, 0.0722];
const clamp = (value: number) => (value < 0 ? 0 : value > 255 ? 255 : value);
const luminance = (r: number, g: number, b: number) => LUMA[0] * r + LUMA[1] * g + LUMA[2] * b;

// CSS filter 함수를 픽셀 연산으로 재현 (ctx.filter 미지원 기기 폴백)
const buildPixelTransform = (filterCss: string): PixelTransform | null => {
  const ops: PixelTransform[] = [];
  const pattern = /([\w-]+)\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(filterCss)) !== null) {
    const name = match[1];
    const amount = Number.parseFloat(match[2]);
    if (!Number.isFinite(amount)) continue;

    switch (name) {
      case 'brightness':
        ops.push(([r, g, b]) => [r * amount, g * amount, b * amount]);
        break;
      case 'contrast':
        ops.push(([r, g, b]) => [
          (r - 128) * amount + 128,
          (g - 128) * amount + 128,
          (b - 128) * amount + 128,
        ]);
        break;
      case 'saturate':
        ops.push(([r, g, b]) => {
          const lum = luminance(r, g, b);
          return [lum + (r - lum) * amount, lum + (g - lum) * amount, lum + (b - lum) * amount];
        });
        break;
      case 'grayscale': {
        const a = Math.min(1, amount);
        ops.push(([r, g, b]) => {
          const lum = luminance(r, g, b);
          return [r + (lum - r) * a, g + (lum - g) * a, b + (lum - b) * a];
        });
        break;
      }
      case 'sepia': {
        const a = Math.min(1, amount);
        ops.push(([r, g, b]) => {
          const sr = 0.393 * r + 0.769 * g + 0.189 * b;
          const sg = 0.349 * r + 0.686 * g + 0.168 * b;
          const sb = 0.272 * r + 0.534 * g + 0.131 * b;
          return [r + (sr - r) * a, g + (sg - g) * a, b + (sb - b) * a];
        });
        break;
      }
      case 'hue-rotate': {
        const rad = (amount * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const m: [Rgb, Rgb, Rgb] = [
          [
            0.213 + cos * 0.787 - sin * 0.213,
            0.715 - cos * 0.715 - sin * 0.715,
            0.072 - cos * 0.072 + sin * 0.928,
          ],
          [
            0.213 - cos * 0.213 + sin * 0.143,
            0.715 + cos * 0.285 + sin * 0.14,
            0.072 - cos * 0.072 - sin * 0.283,
          ],
          [
            0.213 - cos * 0.213 - sin * 0.787,
            0.715 - cos * 0.715 + sin * 0.715,
            0.072 + cos * 0.928 + sin * 0.072,
          ],
        ];
        ops.push(([r, g, b]) => [
          r * m[0][0] + g * m[0][1] + b * m[0][2],
          r * m[1][0] + g * m[1][1] + b * m[1][2],
          r * m[2][0] + g * m[2][1] + b * m[2][2],
        ]);
        break;
      }
      default:
        break;
    }
  }

  if (ops.length === 0) return null;
  return (rgb) => ops.reduce((acc, op) => op(acc), rgb);
};

const applyPixelTransform = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  transform: PixelTransform,
) => {
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = transform([data[i], data[i + 1], data[i + 2]]);
    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
  context.putImageData(imageData, 0, 0);
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
    if (!context) return blob;

    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0);

    // ctx.filter는 일부 WebKit에서 지원한다고 응답하고도 실제로는 적용하지 않아 픽셀 연산으로 직접 처리
    const transform = buildPixelTransform(filterCss);
    if (transform) applyPixelTransform(context, canvas.width, canvas.height, transform);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((result) => resolve(result ?? blob), 'image/jpeg', 0.95);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};
