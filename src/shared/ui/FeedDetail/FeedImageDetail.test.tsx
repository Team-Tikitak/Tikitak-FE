import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedImageDetail } from './FeedImageDetail';

describe('FeedImageDetail', () => {
  it('uses the same contained fit for a square hero preview before the detail image loads', () => {
    const { container } = render(
      <FeedImageDetail src="/detail.jpg" heroPreviewUrl="/preview.jpg" previewOnly />,
    );
    const figure = container.querySelector('figure') as HTMLElement;
    const preview = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;

    Object.defineProperty(figure, 'clientWidth', { configurable: true, value: 393 });
    Object.defineProperty(figure, 'clientHeight', { configurable: true, value: 524 });
    Object.defineProperty(preview, 'naturalWidth', { configurable: true, value: 1000 });
    Object.defineProperty(preview, 'naturalHeight', { configurable: true, value: 1000 });

    fireEvent.load(preview);

    expect(preview).toHaveClass('object-contain');
    expect(preview).not.toHaveClass('object-cover');
  });
});
