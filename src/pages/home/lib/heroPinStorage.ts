import type { Pin } from '@/shared/api/map/types';
import { normalizeImageUrl } from '@/shared/lib';

const HERO_PIN_STORAGE_KEY = 'tikitak:last-hero-pin';

interface StoredHeroPinPayload {
  placeId: string;
  teamId: number;
  thumbnailUrl?: string;
  feedCount?: number;
  level?: number;
  x: number;
  y: number;
}

let pendingHeroPinCoords: { placeId: string; latitude: number; longitude: number } | null = null;

export interface StoredHeroPin extends StoredHeroPinPayload {
  latitude?: number;
  longitude?: number;
}

export const readStoredHeroPin = (): StoredHeroPin | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(HERO_PIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredHeroPinPayload>;
    if (
      !parsed.placeId ||
      typeof parsed.teamId !== 'number' ||
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number'
    ) {
      return null;
    }
    const coords = pendingHeroPinCoords?.placeId === parsed.placeId ? pendingHeroPinCoords : null;
    return {
      placeId: parsed.placeId,
      teamId: parsed.teamId,
      thumbnailUrl: parsed.thumbnailUrl,
      feedCount: parsed.feedCount,
      level: parsed.level,
      x: parsed.x,
      y: parsed.y,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    };
  } catch {
    return null;
  }
};

export const clearStoredHeroPin = (): void => {
  pendingHeroPinCoords = null;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(HERO_PIN_STORAGE_KEY);
  } catch {
    // 무시
  }
};

export const getStoredHeroPinStyle = (storedHeroPin: StoredHeroPin, pinSize: number) => {
  const shouldCenter =
    typeof storedHeroPin.latitude === 'number' && typeof storedHeroPin.longitude === 'number';
  return {
    left: shouldCenter ? `calc(50% - ${pinSize / 2}px)` : storedHeroPin.x - pinSize / 2,
    top: shouldCenter ? `calc(50% - ${pinSize}px)` : storedHeroPin.y - pinSize,
    width: pinSize,
    height: pinSize,
  };
};

export const storeHeroPin = (
  pin: Pin,
  position: { x: number; y: number },
  teamId: number,
  viewport?: { level: number },
) => {
  if (typeof window === 'undefined') return;
  const payload: StoredHeroPinPayload = {
    placeId: pin.placeId,
    teamId,
    thumbnailUrl: normalizeImageUrl(pin.thumbnailUrl, 'feed-image'),
    feedCount: pin.feedCount,
    level: viewport?.level,
    x: position.x,
    y: position.y,
  };
  window.sessionStorage.setItem(HERO_PIN_STORAGE_KEY, JSON.stringify(payload));
  pendingHeroPinCoords = {
    placeId: pin.placeId,
    latitude: pin.latitude,
    longitude: pin.longitude,
  };
};
