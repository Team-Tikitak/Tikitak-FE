import { Capacitor } from '@capacitor/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNativeCameraPreviewFrame, isNativeCameraPlatform } from './nativeCamera';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'ios'),
    isNativePlatform: vi.fn(() => true),
  },
  registerPlugin: vi.fn(() => ({
    capture: vi.fn(),
    setZoom: vi.fn(),
    startPreview: vi.fn(),
    stopPreview: vi.fn(),
  })),
}));

describe('isNativeCameraPlatform', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('iOS 네이티브에서 true를 반환한다', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    expect(isNativeCameraPlatform()).toBe(true);
  });

  it('Android 네이티브에서도 true를 반환한다', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    expect(isNativeCameraPlatform()).toBe(true);
  });

  it('네이티브가 아니면(웹) false를 반환한다', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    expect(isNativeCameraPlatform()).toBe(false);
  });
});

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
};

describe('nativeCamera', () => {
  beforeEach(() => {
    setViewportWidth(390);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => (name === '--safe-top' ? '47px' : ''),
    } as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the full viewport width for mobile preview frames', () => {
    expect(getNativeCameraPreviewFrame()).toEqual({
      x: 0,
      y: 132,
      width: 390,
      height: 520,
    });
  });

  it('centers a 393px preview frame on wider screens', () => {
    setViewportWidth(820);

    expect(getNativeCameraPreviewFrame()).toEqual({
      x: 213.5,
      y: 132,
      width: 393,
      height: 524,
    });
  });
});
