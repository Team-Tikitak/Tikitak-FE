import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shareImageBlob } from './shareImage';

const { isNativePlatformMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));

describe('shareImageBlob', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isNativePlatformMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('downloads image blobs on web and revokes the object url after click dispatch', async () => {
    const objectUrl = 'blob:tikitak-card';
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(objectUrl);
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await shareImageBlob(new Blob(['card'], { type: 'image/jpeg' }), {
      fileName: 'tikitak-card.jpg',
      title: 'title',
    });

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download="tikitak-card.jpg"]')).not.toBeInTheDocument();
    expect(revokeObjectUrlSpy).not.toHaveBeenCalled();

    vi.runOnlyPendingTimers();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(objectUrl);
  });
});
