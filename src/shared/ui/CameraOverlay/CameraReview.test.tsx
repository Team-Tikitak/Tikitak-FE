import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CameraReview } from './CameraReview';

vi.mock('./StickerPicker', () => ({
  StickerPicker: ({ open }: { open: boolean }) =>
    open ? <div data-testid="sticker-picker" /> : null,
}));

const baseProps = {
  imageUrl: '/photo.jpg',
  stickers: [],
  onAddSticker: vi.fn(),
  onMoveSticker: vi.fn(),
  onScaleSticker: vi.fn(),
  onRotateSticker: vi.fn(),
  onRemoveSticker: vi.fn(),
  onRetake: vi.fn(),
  onConfirm: vi.fn(),
  activeFilterId: 'none' as const,
  onSelectFilter: vi.fn(),
};

describe('CameraReview', () => {
  it('reserves bottom space while the upload button is visible', () => {
    const { container } = render(<CameraReview {...baseProps} />);

    expect(screen.getByRole('button', { name: '업로드' })).toBeInTheDocument();
    expect(screen.getByAltText('촬영된 사진')).toHaveClass('object-cover');
    expect(container.firstElementChild).toHaveClass('pb-[calc(112px+env(safe-area-inset-bottom))]');
  });

  it('hides the upload button and removes bottom padding while the filter picker is open', () => {
    const { container } = render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '필터' }));

    const uploadAction = screen.getByTestId('camera-upload-action');
    const uploadButton = uploadAction.querySelector('button');
    if (!uploadButton) throw new Error('업로드 버튼을 찾을 수 없습니다.');

    expect(uploadButton).not.toBeDisabled();
    expect(uploadButton).toHaveAttribute('tabindex', '-1');
    expect(uploadAction).toHaveClass(
      'opacity-0',
      'duration-240',
      'ease-[cubic-bezier(0.16,1,0.3,1)]',
    );
    expect(screen.getByRole('button', { name: '필터' })).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass(
      'pb-[calc(112px+env(safe-area-inset-bottom))]',
    );
  });

  it('closes the sticker picker when tapping the photo area', () => {
    render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '스티커 추가' }));

    expect(screen.getByTestId('sticker-picker')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByAltText('촬영된 사진'));

    expect(screen.queryByTestId('sticker-picker')).not.toBeInTheDocument();
  });

  it('uses a quicker close motion for the filter tray', () => {
    render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '필터' }));

    expect(screen.getByTestId('camera-filter-tray')).toHaveClass(
      'duration-240',
      'ease-[cubic-bezier(0.16,1,0.3,1)]',
    );

    fireEvent.click(screen.getByRole('button', { name: '필터' }));

    expect(screen.getByTestId('camera-filter-tray')).toHaveClass(
      'duration-180',
      'ease-[cubic-bezier(0.4,0,1,1)]',
      'translate-y-4',
    );
  });
});
