import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNativeCameraPreviewFrame } from './nativeCamera';

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
