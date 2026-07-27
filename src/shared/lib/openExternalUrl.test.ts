import { afterEach, describe, expect, it, vi } from 'vitest';
import { openExternalUrl } from './openExternalUrl';

const openMock = vi.spyOn(window, 'open').mockImplementation(() => null);

afterEach(() => {
  openMock.mockClear();
});

describe('openExternalUrl', () => {
  it('새 탭에서 안전하게 외부 링크를 연다', () => {
    openExternalUrl('https://example.com');

    expect(openMock).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });
});
