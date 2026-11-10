import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StickerPicker } from './StickerPicker';

describe('StickerPicker', () => {
  it('시트 바깥을 누르면 닫힌다', async () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">바깥</button>
        <StickerPicker open onClose={onClose} onSelect={vi.fn()} />
      </>,
    );
    // Radix가 바깥 탭 감지를 다음 tick에 등록한다
    await new Promise((resolve) => setTimeout(resolve, 0));

    fireEvent.pointerDown(screen.getByText('바깥'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('시트 안을 누르면 닫히지 않는다', async () => {
    const onClose = vi.fn();
    render(<StickerPicker open onClose={onClose} onSelect={vi.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    fireEvent.pointerDown(screen.getAllByRole('button')[0]);

    expect(onClose).not.toHaveBeenCalled();
  });
});
