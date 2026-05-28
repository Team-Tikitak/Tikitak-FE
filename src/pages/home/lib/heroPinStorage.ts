import type { Pin } from '@/shared/api/map/types';
import { normalizeImageUrl } from '@/shared/lib';

const HERO_PIN_STORAGE_KEY = 'tikitak:last-hero-pin';

export interface StoredHeroPin {
  placeId: string;
  thumbnailUrl?: string;
  feedCount?: number;
  latitude?: number;
  longitude?: number;
  level?: number;
  x: number;
  y: number;
}

export const readStoredHeroPin = (): StoredHeroPin | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(HERO_PIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredHeroPin>;
    if (!parsed.placeId || typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
      return null;
    }
    return {
      placeId: parsed.placeId,
      thumbnailUrl: parsed.thumbnailUrl,
      feedCount: parsed.feedCount,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      level: parsed.level,
      x: parsed.x,
      y: parsed.y,
    };
  } catch {
    return null;
  }
};

export const storeHeroPin = (
  pin: Pin,
  position: { x: number; y: number },
  viewport?: { level: number },
) => {
  if (typeof window === 'undefined') return;
  const heroPin: StoredHeroPin = {
    placeId: pin.placeId,
    thumbnailUrl: normalizeImageUrl(pin.thumbnailUrl, 'feed-image'),
    feedCount: pin.feedCount,
    latitude: pin.latitude,
    longitude: pin.longitude,
    level: viewport?.level,
    x: position.x,
    y: position.y,
  };
  window.sessionStorage.setItem(HERO_PIN_STORAGE_KEY, JSON.stringify(heroPin));
};
