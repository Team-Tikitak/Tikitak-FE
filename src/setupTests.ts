import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (typeof HTMLElement !== 'undefined' && !('setPointerCapture' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });
}
