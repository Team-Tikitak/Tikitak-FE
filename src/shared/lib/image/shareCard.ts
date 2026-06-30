import { Capacitor, CapacitorHttp } from '@capacitor/core';
import ShareLogoUrl from '@/shared/assets/Logo/ShareLogo.svg?url';
import BlueSparkleUrl from '@/shared/assets/Sticker/BlueSparkle.svg?url';
import OrangeSpiralUrl from '@/shared/assets/Sticker/OrangeSpiral.svg?url';
import PinkTulipUrl from '@/shared/assets/Sticker/PinkTulip.svg?url';
import RedAsteriskUrl from '@/shared/assets/Sticker/RedAsterisk.svg?url';
import StripedBallUrl from '@/shared/assets/Sticker/StripedBall.svg?url';
import YellowFlowerUrl from '@/shared/assets/Sticker/YellowFlower.svg?url';
import { loadImage } from './loadImage';

export interface FeedShareCardData {
  imageUrl: string;
  authorName: string;
  title: string;
  date: string;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const PHOTO = { x: 100, y: 250, w: 880, h: 1180, radius: 38 };
const META = { x: 120, y: 1488, w: 840, h: 172, radius: 34 };
const MEDIA_CDN_BASE_URL = import.meta.env.VITE_MEDIA_CDN_BASE_URL ?? '';

const buildImageUrlCandidates = (url: string): string[] => {
  const candidates: string[] = [];

  try {
    const sourceUrl = new URL(url, window.location.origin);
    if (import.meta.env.DEV && sourceUrl.pathname.startsWith('/media/')) {
      candidates.push(`/__media-proxy${sourceUrl.pathname}${sourceUrl.search}`);
    }

    candidates.push(url);
    if (!MEDIA_CDN_BASE_URL) return [...new Set(candidates)];

    const cdnUrl = new URL(MEDIA_CDN_BASE_URL);
    if (sourceUrl.hostname !== cdnUrl.hostname && sourceUrl.pathname.startsWith('/media/')) {
      cdnUrl.pathname = sourceUrl.pathname;
      cdnUrl.search = sourceUrl.search;
      candidates.push(cdnUrl.toString());
    }
  } catch {
    candidates.push(url);
    return [...new Set(candidates)];
  }

  return [...new Set(candidates)];
};

// <img crossOrigin>은 일반 <img>로 캐시된 비-CORS 응답과 충돌 → fetch로 받아 same-origin objectURL로 로드
const fetchImageBlob = async (url: string): Promise<Blob> => {
  let lastError: unknown;
  for (const candidateUrl of buildImageUrlCandidates(url)) {
    try {
      const response = await fetch(candidateUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.blob();
    } catch (error) {
      lastError = error;
      console.warn('공유 카드 이미지 로드 재시도', { candidateUrl, error });
    }
  }
  throw new Error(`이미지를 불러오지 못했어요: ${url}`, { cause: lastError });
};

const base64ToBlob = (base64: string, type: string): Blob => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type });
};

const fetchNativeImageBlob = async (url: string): Promise<Blob> => {
  let lastError: unknown;
  for (const candidateUrl of buildImageUrlCandidates(url)) {
    try {
      const response = await CapacitorHttp.get({
        url: candidateUrl,
        responseType: 'blob',
        connectTimeout: 10_000,
        readTimeout: 20_000,
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (response.data instanceof Blob) return response.data;
      if (typeof response.data === 'string') {
        const contentType =
          response.headers['content-type'] ?? response.headers['Content-Type'] ?? 'image/jpeg';
        return base64ToBlob(response.data, contentType);
      }
      throw new Error('이미지 응답 형식을 읽지 못했어요');
    } catch (error) {
      lastError = error;
      console.warn('공유 카드 이미지 로드 재시도', { candidateUrl, error });
    }
  }
  throw new Error(`이미지를 불러오지 못했어요: ${url}`, { cause: lastError });
};

const fetchImageObjectUrl = async (url: string): Promise<string> => {
  const blob = Capacitor.isNativePlatform()
    ? await fetchNativeImageBlob(url)
    : await fetchImageBlob(url);
  return URL.createObjectURL(blob);
};

// iOS 15는 ctx.roundRect 미지원 → arcTo로 직접 그린다
const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) => {
  const sourceAspect = image.width / image.height;
  const destAspect = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (sourceAspect > destAspect) {
    sw = image.height * destAspect;
    sx = (image.width - sw) / 2;
  } else if (sourceAspect < destAspect) {
    sh = image.width / destAspect;
    sy = (image.height - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
};

const drawRotatedImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  degree = 0,
) => {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((degree * Math.PI) / 180);
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  ctx.restore();
};

const truncateToWidth = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
};

export const generateFeedShareCard = async (data: FeedShareCardData): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#59C4EA';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const [shareLogo, orangeSpiral, yellowFlower, stripedBall, redAsterisk, pinkTulip, blueSparkle] =
    await Promise.all([
      loadImage(ShareLogoUrl),
      loadImage(OrangeSpiralUrl),
      loadImage(YellowFlowerUrl),
      loadImage(StripedBallUrl),
      loadImage(RedAsteriskUrl),
      loadImage(PinkTulipUrl),
      loadImage(BlueSparkleUrl),
    ]);

  drawRotatedImage(ctx, orangeSpiral, -96, -72, 310, 328, -8);
  drawRotatedImage(ctx, pinkTulip, 852, 44, 170, 188, 8);
  drawRotatedImage(ctx, blueSparkle, 934, 30, 72, 72, 0);
  drawRotatedImage(ctx, yellowFlower, 808, 1182, 430, 418, -16);
  drawRotatedImage(ctx, stripedBall, 178, 1704, 142, 142, -24);
  drawRotatedImage(ctx, redAsterisk, -42, 1586, 210, 210, 18);

  ctx.save();
  ctx.shadowColor = 'rgba(31, 41, 55, 0.22)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 14;
  roundedRectPath(ctx, PHOTO.x - 18, PHOTO.y - 18, PHOTO.w + 36, PHOTO.h + 36, PHOTO.radius + 18);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  const imageObjectUrl = await fetchImageObjectUrl(data.imageUrl);
  try {
    const image = await loadImage(imageObjectUrl);
    ctx.save();
    roundedRectPath(ctx, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.radius);
    ctx.clip();
    drawImageCover(ctx, image, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h);
    ctx.restore();

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FFFFFF';
    roundedRectPath(ctx, PHOTO.x, PHOTO.y, PHOTO.w, PHOTO.h, PHOTO.radius);
    ctx.stroke();
  } finally {
    URL.revokeObjectURL(imageObjectUrl);
  }

  await document.fonts.ready;
  ctx.textBaseline = 'alphabetic';

  ctx.save();
  ctx.shadowColor = 'rgba(31, 41, 55, 0.12)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  roundedRectPath(ctx, META.x, META.y, META.w, META.h, META.radius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  if (data.authorName) {
    ctx.fillStyle = '#6B7280';
    ctx.font = '600 34px SUIT, sans-serif';
    ctx.fillText(truncateToWidth(ctx, data.authorName, META.w - 64), META.x + 36, META.y + 58);
  }

  if (data.title) {
    ctx.fillStyle = '#111827';
    ctx.font = '700 64px SUIT, sans-serif';
    ctx.fillText(truncateToWidth(ctx, data.title, META.w - 64), META.x + 36, META.y + 128);
  }

  if (data.date) {
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 30px SUIT, sans-serif';
    ctx.fillText(data.date, META.x + META.w - ctx.measureText(data.date).width - 36, META.y + 58);
  }

  ctx.save();
  ctx.shadowColor = 'rgba(31, 41, 55, 0.16)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(shareLogo, 387, 1742, 306, 85);
  ctx.restore();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('카드 이미지를 만들지 못했어요'))),
      'image/jpeg',
      0.95,
    );
  });
};
