import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCamera } from './useCamera';
import { useCameraCapture } from './useCameraCapture';
import { useCameraStream } from './useCameraStream';
import { usePendingSticker } from './usePendingSticker';

vi.mock('./useCameraCapture', () => ({
  useCameraCapture: vi.fn(),
}));

vi.mock('./useCameraStream', () => ({
  useCameraStream: vi.fn(),
}));

vi.mock('./usePendingSticker', () => ({
  usePendingSticker: vi.fn(),
}));

describe('useCamera', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCameraStream).mockReturnValue({
      videoRef: { current: null },
      streamRef: { current: null },
      error: null,
      isReady: true,
      isZoomSupported: true,
      stopStream: vi.fn(),
    });

    vi.mocked(useCameraCapture).mockReturnValue({
      isConfirming: false,
      handleCapture: vi.fn(),
      handleRetake: vi.fn(),
      handleConfirm: vi.fn(),
    });

    vi.mocked(usePendingSticker).mockReturnValue({
      handleAddSticker: vi.fn(),
      handleMoveSticker: vi.fn(),
      handleScaleSticker: vi.fn(),
      handleRotateSticker: vi.fn(),
      handleRemoveSticker: vi.fn(),
    });
  });

  it('resets selected zoom to 1x when switching camera facing mode', () => {
    const { result } = renderHook(() =>
      useCamera({
        open: true,
        onCapture: vi.fn(),
        onClose: vi.fn(),
      }),
    );

    expect(useCameraStream).toHaveBeenLastCalledWith(false, 'environment', 1);

    act(() => {
      result.current.handleSelectZoomLevel(2);
    });

    expect(result.current.zoomLevel).toBe(2);
    expect(useCameraStream).toHaveBeenLastCalledWith(false, 'environment', 2);

    act(() => {
      result.current.handleToggleFacingMode();
    });

    expect(result.current.facingMode).toBe('user');
    expect(result.current.zoomLevel).toBe(1);
    expect(useCameraStream).toHaveBeenLastCalledWith(false, 'user', 1);
  });
});
