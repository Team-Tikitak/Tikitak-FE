import { beforeEach, describe, expect, it, vi } from 'vitest';

type KeyboardListener = (event: { keyboardHeight: number }) => void;

const listeners = new Map<string, KeyboardListener>();
const viewportListeners = new Map<string, () => void>();

vi.mock('@capacitor/keyboard', () => ({
  Keyboard: {
    addListener: vi.fn(async (eventName: string, listener: KeyboardListener) => {
      listeners.set(eventName, listener);
      return { remove: vi.fn() };
    }),
  },
}));

const getKeyboardHeight = () =>
  document.documentElement.style.getPropertyValue('--keyboard-height');

describe('setupKeyboardInsets', () => {
  beforeEach(() => {
    listeners.clear();
    viewportListeners.clear();
    document.documentElement.style.removeProperty('--keyboard-height');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 844,
        offsetTop: 0,
        addEventListener: (eventName: string, listener: () => void) => {
          viewportListeners.set(eventName, listener);
        },
      },
    });
  });

  it('iOS에서 키보드 이벤트 직후에는 즉시 CSS 보정을 적용한다', async () => {
    const { setupKeyboardInsets } = await import('./keyboardInsets');
    await setupKeyboardInsets('ios');

    listeners.get('keyboardWillShow')?.({ keyboardHeight: 300 });

    expect(getKeyboardHeight()).toBe('300px');
  });

  it('iOS WebView가 이미 축소되면 CSS 보정을 해제해 이중 상승을 막는다', async () => {
    const { setupKeyboardInsets } = await import('./keyboardInsets');
    await setupKeyboardInsets('ios');

    listeners.get('keyboardWillShow')?.({ keyboardHeight: 300 });
    expect(getKeyboardHeight()).toBe('300px');

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 544,
        offsetTop: 0,
        addEventListener: (eventName: string, listener: () => void) => {
          viewportListeners.set(eventName, listener);
        },
      },
    });
    viewportListeners.get('resize')?.();

    expect(getKeyboardHeight()).toBe('0px');
  });

  it('Android에서는 safe area를 제외한 기존 키보드 보정값을 유지한다', async () => {
    const { setupKeyboardInsets } = await import('./keyboardInsets');
    await setupKeyboardInsets('android');

    listeners.get('keyboardWillShow')?.({ keyboardHeight: 300 });

    expect(getKeyboardHeight()).toBe('276px');
  });
});
