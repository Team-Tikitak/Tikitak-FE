import { fireEvent, render, waitFor } from '@testing-library/react';
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

  it('captures cached hero preview dimensions from the ref fast path', async () => {
    const clientWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth',
    );
    const clientHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientHeight',
    );
    const completeDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'complete',
    );
    const naturalWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'naturalWidth',
    );
    const naturalHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      'naturalHeight',
    );

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 393 });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      value: 524,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'complete', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
      configurable: true,
      value: 1000,
    });

    try {
      const { container } = render(
        <FeedImageDetail src="/detail.jpg" heroPreviewUrl="/preview.jpg" previewOnly />,
      );
      const preview = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;

      await waitFor(() => {
        expect(preview).toHaveClass('object-contain');
      });
    } finally {
      if (clientWidthDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDescriptor);
      }
      if (clientHeightDescriptor) {
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDescriptor);
      }
      if (completeDescriptor) {
        Object.defineProperty(HTMLImageElement.prototype, 'complete', completeDescriptor);
      }
      if (naturalWidthDescriptor) {
        Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', naturalWidthDescriptor);
      }
      if (naturalHeightDescriptor) {
        Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', naturalHeightDescriptor);
      }
    }
  });
});
