import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openConfirmDialog } from './openConfirmDialog';

const { confirmDialogMock, isNativeDialogPlatformMock, openOverlayMock } = vi.hoisted(() => ({
  confirmDialogMock: vi.fn(),
  isNativeDialogPlatformMock: vi.fn(),
  openOverlayMock: vi.fn(),
}));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  confirmDialog: confirmDialogMock,
  isNativeDialogPlatform: isNativeDialogPlatformMock,
}));

vi.mock('@/shared/lib/openOverlay', () => ({
  openOverlay: openOverlayMock,
}));

describe('openConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativeDialogPlatformMock.mockReturnValue(false);
  });

  it('앱에서는 네이티브 confirm으로 확인하면 onConfirm을 실행한다', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmDialogMock.mockResolvedValue(true);

    openConfirmDialog({
      title: '삭제할까요?',
      description: '복구할 수 없어요.',
      confirmLabel: '삭제하기',
      onCancel,
      onConfirm,
    });

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(confirmDialogMock).toHaveBeenCalledWith({
      title: '삭제할까요?',
      message: '복구할 수 없어요.',
      okButtonTitle: '삭제하기',
      cancelButtonTitle: '취소',
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(openOverlayMock).not.toHaveBeenCalled();
  });

  it('앱에서는 네이티브 confirm을 취소하면 onCancel을 실행한다', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    isNativeDialogPlatformMock.mockReturnValue(true);
    confirmDialogMock.mockResolvedValue(false);

    openConfirmDialog({
      title: '나갈까요?',
      cancelLabel: '나가기',
      confirmLabel: '계속하기',
      onCancel,
      onConfirm,
    });

    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(confirmDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '',
        okButtonTitle: '계속하기',
        cancelButtonTitle: '나가기',
      }),
    );
    expect(onConfirm).not.toHaveBeenCalled();
    expect(openOverlayMock).not.toHaveBeenCalled();
  });

  it('웹에서는 기존 커스텀 오버레이를 사용한다', () => {
    openConfirmDialog({
      title: '삭제할까요?',
      confirmLabel: '삭제하기',
      onConfirm: vi.fn(),
    });

    expect(openOverlayMock).toHaveBeenCalledTimes(1);
    expect(confirmDialogMock).not.toHaveBeenCalled();
  });
});
