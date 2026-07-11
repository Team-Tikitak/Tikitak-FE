import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openConfirmDialog } from './openConfirmDialog';
import type { OverlayControllerComponent } from 'overlay-kit';

const { alertDialogMock, confirmDialogMock, isNativeDialogPlatformMock, openOverlayMock } =
  vi.hoisted(() => ({
    alertDialogMock: vi.fn(),
    confirmDialogMock: vi.fn(),
    isNativeDialogPlatformMock: vi.fn(),
    openOverlayMock: vi.fn(),
  }));

vi.mock('@/shared/lib/native/nativeDialog', () => ({
  alertDialog: alertDialogMock,
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

  it('앱에서 showCancel이 false면 네이티브 alert로 띄우고 확인 후 onConfirm을 실행한다', async () => {
    const onConfirm = vi.fn();
    isNativeDialogPlatformMock.mockReturnValue(true);
    alertDialogMock.mockResolvedValue(undefined);

    openConfirmDialog({
      title: '오류',
      description: '삭제되었거나 존재하지 않는 게시물이에요',
      confirmLabel: '확인',
      showCancel: false,
      onConfirm,
    });

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(alertDialogMock).toHaveBeenCalledWith(
      '삭제되었거나 존재하지 않는 게시물이에요',
      '오류',
      '확인',
    );
    expect(confirmDialogMock).not.toHaveBeenCalled();
    expect(openOverlayMock).not.toHaveBeenCalled();
  });

  it('웹에서 showCancel이 false면 취소 버튼 없이 확인 버튼만 렌더링한다', () => {
    openConfirmDialog({
      title: '오류',
      description: '삭제되었거나 존재하지 않는 게시물이에요',
      confirmLabel: '확인',
      showCancel: false,
      onConfirm: vi.fn(),
    });

    expect(openOverlayMock).toHaveBeenCalledTimes(1);
    const Renderer = openOverlayMock.mock.calls[0][0] as OverlayControllerComponent;
    render(<Renderer isOpen close={vi.fn()} unmount={vi.fn()} overlayId="test-overlay" />);

    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
  });
});
