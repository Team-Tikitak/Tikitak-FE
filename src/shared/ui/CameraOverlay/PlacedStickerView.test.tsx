import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PlacedSticker } from '@/shared/types/sticker';
import { PlacedStickerView } from './PlacedStickerView';

const sticker: PlacedSticker = {
  id: 'sticker-1',
  stickerId: 'blueSparkle',
  xRatio: 0.5,
  yRatio: 0.5,
  scale: 1,
  rotation: 0,
};

describe('PlacedStickerView', () => {
  it('keeps the visual sticker size while expanding the gesture hit area', () => {
    render(<PlacedStickerView sticker={sticker} isActive={false} />);

    const stickerElement = screen.getByRole('img', { name: '반짝임 스티커' });

    expect(stickerElement).toHaveStyle({
      width: '136px',
      height: '136px',
    });
    expect(stickerElement).toHaveClass('p-6');
  });

  it('does not render a visible active outline around the sticker', () => {
    render(<PlacedStickerView sticker={sticker} isActive />);

    const stickerElement = screen.getByRole('img', { name: '반짝임 스티커' });
    const stickerGraphic = stickerElement.querySelector('svg');

    expect(stickerElement).toHaveAttribute('data-active', 'true');
    expect(stickerElement).not.toHaveClass('ring-2');
    expect(stickerElement).not.toHaveClass('ring-white/90');
    expect(stickerGraphic).toHaveClass('scale-[1.03]');
  });

  it('shrinks only the inner sticker graphic while hovering over the trash zone', () => {
    render(<PlacedStickerView sticker={sticker} isActive isDropping />);

    const stickerElement = screen.getByRole('img', { name: '반짝임 스티커' });
    const stickerGraphic = stickerElement.querySelector('svg');

    expect(stickerElement).toHaveAttribute('data-dropping', 'true');
    expect(stickerElement).toHaveStyle({
      transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
    });
    expect(stickerGraphic).toHaveClass('scale-75', 'opacity-70', 'saturate-75');
  });
});
