import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePhotoSourcePicker } from './usePhotoSourcePicker';

const {
  isNativePlatformMock,
  pickImagesMock,
  showActionsMock,
  readGalleryPhotoBlobMock,
  optimizeFeedImageBlobMock,
} = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
  pickImagesMock: vi.fn(),
  showActionsMock: vi.fn(),
  readGalleryPhotoBlobMock: vi.fn(),
  optimizeFeedImageBlobMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: {
    pickImages: pickImagesMock,
  },
}));

vi.mock('@capacitor/action-sheet', () => ({
  ActionSheet: {
    showActions: showActionsMock,
  },
  ActionSheetButtonStyle: {
    Cancel: 'cancel',
  },
}));

vi.mock('@/shared/lib/image/readGalleryPhotoBlob', () => ({
  readGalleryPhotoBlob: readGalleryPhotoBlobMock,
}));

vi.mock('@/shared/lib/image/optimizeFeedImageBlob', () => ({
  optimizeFeedImageBlob: optimizeFeedImageBlobMock,
}));

describe('usePhotoSourcePicker', () => {
  beforeEach(() => {
    isNativePlatformMock.mockReset();
    pickImagesMock.mockReset();
    showActionsMock.mockReset();
    readGalleryPhotoBlobMock.mockReset();
    optimizeFeedImageBlobMock.mockReset();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gallery-photo');
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses native gallery directly when source is gallery', async () => {
    isNativePlatformMock.mockReturnValue(true);
    pickImagesMock.mockResolvedValue({
      photos: [{ path: '/private/tmp/photo.jpg', format: 'jpg' }],
    });
    const sourceBlob = new Blob(['source'], { type: 'image/jpeg' });
    const optimizedBlob = new Blob(['optimized'], { type: 'image/jpeg' });
    readGalleryPhotoBlobMock.mockResolvedValue(sourceBlob);
    optimizeFeedImageBlobMock.mockResolvedValue(optimizedBlob);
    const onAdd = vi.fn();

    const { result } = renderHook(() =>
      usePhotoSourcePicker({
        remaining: 1,
        source: 'gallery',
        acceptedMimeTypes: ['image/jpeg'],
        onAdd,
      }),
    );

    await act(async () => {
      await result.current.pick();
    });

    expect(showActionsMock).not.toHaveBeenCalled();
    expect(pickImagesMock).toHaveBeenCalledWith({ limit: 1, quality: 90 });
    expect(readGalleryPhotoBlobMock).toHaveBeenCalledWith({
      path: '/private/tmp/photo.jpg',
      format: 'jpg',
    });
    expect(onAdd).toHaveBeenCalledWith({
      id: expect.any(String),
      url: 'blob:gallery-photo',
      blob: optimizedBlob,
    });
  });

  it('rejects unsupported optimized gallery image types', async () => {
    isNativePlatformMock.mockReturnValue(true);
    pickImagesMock.mockResolvedValue({
      photos: [{ path: '/private/tmp/photo.gif', format: 'gif' }],
    });
    readGalleryPhotoBlobMock.mockResolvedValue(new Blob(['source'], { type: 'image/gif' }));
    optimizeFeedImageBlobMock.mockResolvedValue(new Blob(['optimized'], { type: 'image/gif' }));
    const onAdd = vi.fn();

    const { result } = renderHook(() =>
      usePhotoSourcePicker({
        remaining: 1,
        source: 'gallery',
        acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        onAdd,
      }),
    );

    await act(async () => {
      await result.current.pick();
    });

    expect(onAdd).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});
