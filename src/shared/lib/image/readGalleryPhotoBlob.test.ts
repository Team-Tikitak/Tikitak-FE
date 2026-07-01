import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readGalleryPhotoBlob } from './readGalleryPhotoBlob';
import type { GalleryPhoto } from '@capacitor/camera';

const { isNativePlatformMock, readFileMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
  readFileMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    readFile: readFileMock,
  },
}));

describe('readGalleryPhotoBlob', () => {
  beforeEach(() => {
    isNativePlatformMock.mockReset();
    readFileMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('reads native gallery files through Capacitor Filesystem', async () => {
    isNativePlatformMock.mockReturnValue(true);
    readFileMock.mockResolvedValue({ data: window.btoa('image-bytes') });

    const blob = await readGalleryPhotoBlob({
      path: '/private/tmp/photo.jpg',
      format: 'jpg',
    } as GalleryPhoto);

    expect(readFileMock).toHaveBeenCalledWith({ path: '/private/tmp/photo.jpg' });
    expect(blob.type).toBe('image/jpeg');
    expect(await blob.text()).toBe('image-bytes');
  });

  it('returns native blob data when Filesystem provides a Blob', async () => {
    isNativePlatformMock.mockReturnValue(true);
    const sourceBlob = new Blob(['blob-image'], { type: 'image/webp' });
    readFileMock.mockResolvedValue({ data: sourceBlob });

    const blob = await readGalleryPhotoBlob({
      path: '/private/tmp/photo.webp',
      format: 'webp',
    } as GalleryPhoto);

    expect(blob).toBe(sourceBlob);
  });

  it('falls back to webPath fetch outside native runtime', async () => {
    isNativePlatformMock.mockReturnValue(false);
    const sourceBlob = new Blob(['web-image'], { type: 'image/png' });
    const fetchMock = vi.fn().mockResolvedValue({ blob: () => Promise.resolve(sourceBlob) });
    vi.stubGlobal('fetch', fetchMock);

    const blob = await readGalleryPhotoBlob({
      webPath: 'blob:http://localhost/photo.png',
    } as GalleryPhoto);

    expect(fetchMock).toHaveBeenCalledWith('blob:http://localhost/photo.png');
    expect(blob).toBe(sourceBlob);
  });
});
