import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedImageDetail, type Pin } from './FeedImageDetail';

describe('FeedImageDetail', () => {
  it('uses the initial image aspect ratio for fit without changing the fixed hero frame', () => {
    const { container } = render(
      <FeedImageDetail
        src="/detail.jpg"
        heroKey="pin-1"
        heroPreviewUrl="/preview.jpg"
        initialAspectRatio={4 / 3}
        previewOnly
      />,
    );
    const figure = container.querySelector('figure') as HTMLElement;
    const preview = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;

    expect(preview).toHaveClass('object-contain');
    expect(preview).not.toHaveClass('object-cover');
    expect(figure).not.toHaveAttribute('data-hero-aspect-ratio');
  });

  it('uses the same contained fit for a square hero preview before the detail image loads', () => {
    const { container } = render(
      <FeedImageDetail
        src="/detail.jpg"
        heroKey="pin-1"
        heroPreviewUrl="/preview.jpg"
        previewOnly
      />,
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
    expect(figure).not.toHaveAttribute('data-hero-aspect-ratio');
  });

  it('does not set a hero aspect ratio when the image covers the detail frame', () => {
    const { container } = render(
      <FeedImageDetail
        src="/detail.jpg"
        heroKey="pin-1"
        heroPreviewUrl="/preview.jpg"
        previewOnly
      />,
    );
    const figure = container.querySelector('figure') as HTMLElement;
    const preview = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement;

    Object.defineProperty(figure, 'clientWidth', { configurable: true, value: 393 });
    Object.defineProperty(figure, 'clientHeight', { configurable: true, value: 524 });
    Object.defineProperty(preview, 'naturalWidth', { configurable: true, value: 900 });
    Object.defineProperty(preview, 'naturalHeight', { configurable: true, value: 1600 });

    fireEvent.load(preview);

    expect(preview).toHaveClass('object-cover');
    expect(preview).not.toHaveClass('object-contain');
    expect(figure).not.toHaveAttribute('data-hero-aspect-ratio');
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

  it('고화질 사진이 로드된 뒤에 댓글 핀이 순서대로 등장한다', () => {
    const pins: Pin[] = [
      { id: 'a', x: 10, y: 20, avatars: [{ id: '1', src: '/a.jpg', alt: '첫 댓글' }] },
      { id: 'b', x: 30, y: 40, avatars: [{ id: '2', src: '/b.jpg', alt: '둘째 댓글' }] },
    ];
    render(<FeedImageDetail src="/detail.jpg" alt="피드 사진" pins={pins} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    fireEvent.load(screen.getByAltText('피드 사진'));

    const [first, second] = screen.getAllByRole('button');
    expect(first).toHaveClass('motion-safe:animate-pin-pop');
    expect(first).toHaveStyle({ animationDelay: '120ms' });
    expect(second).toHaveStyle({ animationDelay: '170ms' });
  });

  it('사진 로드에 실패해도 댓글 핀은 표시된다', () => {
    const pins: Pin[] = [{ id: 'a', x: 10, y: 20, avatars: [{ id: '1', src: '/a.jpg' }] }];
    render(<FeedImageDetail src="/broken.jpg" alt="피드 사진" pins={pins} />);

    fireEvent.error(screen.getByAltText('피드 사진'));

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('사진이 바뀌면 새 사진이 로드될 때까지 댓글 핀을 숨긴다', () => {
    const pins: Pin[] = [{ id: 'a', x: 10, y: 20, avatars: [{ id: '1', src: '/a.jpg' }] }];
    const { rerender } = render(<FeedImageDetail src="/first.jpg" alt="피드 사진" pins={pins} />);
    fireEvent.load(screen.getByAltText('피드 사진'));
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<FeedImageDetail src="/second.jpg" alt="피드 사진" pins={pins} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    fireEvent.load(screen.getByAltText('피드 사진'));

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
