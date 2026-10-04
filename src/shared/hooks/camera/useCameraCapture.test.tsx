import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCameraCapture } from './useCameraCapture';

const { confirmCapturedPhotoMock } = vi.hoisted(() => ({
  confirmCapturedPhotoMock: vi.fn(),
}));

vi.mock('@/shared/lib/image/finalizeCapturedPhoto', () => ({
  confirmCapturedPhoto: confirmCapturedPhotoMock,
}));

const pending = {
  rawBlob: new Blob(['raw'], { type: 'image/jpeg' }),
  previewUrl: 'blob:preview',
  stickers: [],
};

const renderCapture = (onCapture = vi.fn()) =>
  renderHook(() =>
    useCameraCapture({
      videoRef: { current: null },
      streamRef: { current: null },
      stopStream: vi.fn(),
      pending,
      setPending: vi.fn(),
      onCapture,
      filterCss: 'grayscale(1)',
    }),
  );

describe('useCameraCapture.handleConfirm', () => {
  beforeEach(() => {
    confirmCapturedPhotoMock.mockReset();
  });

  it('합성 완료를 기다리지 않고 필터·스티커 정보와 함께 확정 처리를 시작한다', () => {
    const onCapture = vi.fn();
    const { result } = renderCapture(onCapture);

    act(() => {
      result.current.handleConfirm();
    });

    expect(confirmCapturedPhotoMock).toHaveBeenCalledWith(pending, 'grayscale(1)', onCapture);
    expect(result.current.isConfirming).toBe(true);
  });

  it('연타해도 확정 처리는 한 번만 시작한다', () => {
    const { result } = renderCapture();

    act(() => {
      result.current.handleConfirm();
      result.current.handleConfirm();
    });

    expect(confirmCapturedPhotoMock).toHaveBeenCalledTimes(1);
  });
});
