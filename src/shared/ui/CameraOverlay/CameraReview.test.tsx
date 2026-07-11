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
    expect(uploadAction).toHaveClass('opacity-0', 'duration-180', 'ease-[cubic-bezier(0.4,0,1,1)]');
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

  it('스티커 시트가 올라오는 동안 도구 버튼이 시트 상승 시간(0.5s)에 맞춰 사라진다', () => {
    render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '스티커 추가' }));

    expect(screen.getByRole('button', { name: '스티커 추가' }).parentElement).toHaveClass(
      'duration-500',
      'ease-[cubic-bezier(0.32,0.72,0,1)]',
    );
  });

  it('필터가 열리면 스티커/필터 아이콘 로우가 숨겨지고 체크 버튼으로 필터를 닫으면 다시 나타난다', () => {
    render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '필터' }));

    expect(screen.getByRole('button', { name: '스티커 추가' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: '스티커 추가' }).parentElement).toHaveClass(
      '-translate-x-8',
      'w-full',
      'min-w-0',
    );
    expect(
      screen.getByRole('button', { name: '스티커 추가' }).parentElement?.parentElement,
    ).toHaveClass('w-full', 'min-w-0', 'overflow-hidden');
    expect(screen.getByTestId('camera-filter-tray')).toHaveClass('translate-x-0');
    expect(screen.getByTestId('camera-filter-tray')).toHaveClass('w-full', 'min-w-0', 'gap-6');
    expect(screen.getByTestId('camera-filter-tray')).not.toHaveClass('mt-1');
    expect(screen.getByTestId('camera-filter-header')).toHaveClass(
      'grid-cols-[40px_1fr_40px]',
      'px-4',
    );
    expect(screen.getByRole('button', { name: '원본 필터' }).parentElement).toHaveClass('gap-4');
    expect(screen.getByRole('button', { name: '필터 편집 완료' })).toHaveClass(
      'col-start-3',
      'size-9',
      'justify-self-end',
    );

    fireEvent.click(screen.getByRole('button', { name: '필터 편집 완료' }));

    expect(screen.queryByTestId('camera-filter-tray')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('camera-filter-tray')).toHaveClass('translate-x-full');
    expect(screen.getByRole('button', { name: '스티커 추가' })).toHaveAttribute('tabindex', '0');
  });

  it('uses a quicker close motion for the filter tray', () => {
    render(<CameraReview {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: '필터' }));

    expect(screen.getByTestId('camera-filter-tray')).toHaveClass(
      'duration-240',
      'ease-[cubic-bezier(0.16,1,0.3,1)]',
    );

    fireEvent.click(screen.getByRole('button', { name: '필터 편집 완료' }));

    expect(screen.getByTestId('camera-filter-tray')).toHaveClass(
      'duration-180',
      'ease-[cubic-bezier(0.4,0,1,1)]',
    );
  });
});
