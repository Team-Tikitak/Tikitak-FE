import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Pin } from '@/shared/api/map/types';
import { getStoredHeroPinStyle, readStoredHeroPin, storeHeroPin } from './heroPinStorage';

const STORAGE_KEY = 'tikitak:last-hero-pin';

const samplePin: Pin = {
  placeId: 'place-1',
  name: '카페마루',
  latitude: 37.5,
  longitude: 127.0,
  address: '서울특별시 강남구',
  thumbnailUrl: 'https://example.com/a.jpg',
  feedCount: 3,
};

describe('heroPinStorage', () => {
  const originalDevicePixelRatio = window.devicePixelRatio;

  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: originalDevicePixelRatio,
    });
  });
  afterEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: originalDevicePixelRatio,
    });
  });

  it('returns null when nothing stored', () => {
    expect(readStoredHeroPin()).toBeNull();
  });

  it('returns null when stored value is not JSON', () => {
    sessionStorage.setItem(STORAGE_KEY, 'not-json');
    expect(readStoredHeroPin()).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ placeId: 'p1', x: 1 }));
    expect(readStoredHeroPin()).toBeNull();
  });

  it('storeHeroPin persists pin with teamId and viewport level', () => {
    storeHeroPin(samplePin, { x: 100, y: 200 }, 100, { level: 5 });
    const stored = readStoredHeroPin();
    expect(stored).toMatchObject({
      placeId: 'place-1',
      teamId: 100,
      feedCount: 3,
      level: 5,
      x: 100,
      y: 200,
    });
  });

  it('storeHeroPin works without viewport', () => {
    storeHeroPin(samplePin, { x: 10, y: 20 }, 100);
    const stored = readStoredHeroPin();
    expect(stored?.level).toBeUndefined();
    expect(stored?.x).toBe(10);
    expect(stored?.y).toBe(20);
  });

  it('snaps stored and rendered pin coordinates to device pixels', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
    });

    storeHeroPin(samplePin, { x: 100.26, y: 200.26 }, 100);
    const stored = readStoredHeroPin();

    expect(stored).toMatchObject({
      x: 100.5,
      y: 200.5,
    });

    expect(
      getStoredHeroPinStyle({ ...stored!, latitude: undefined, longitude: undefined }, 87),
    ).toMatchObject({
      left: 57,
      top: 113.5,
    });
  });
});
