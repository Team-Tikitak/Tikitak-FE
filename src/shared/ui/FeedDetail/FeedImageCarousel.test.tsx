import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedImageCarousel, type CarouselImage } from './FeedImageCarousel';

const makeImages = (count: number): CarouselImage[] =>
  Array.from({ length: count }, (_, i) => ({ src: `/img-${i}.jpg`, alt: `이미지 ${i}` }));

const getTrack = (container: HTMLElement) => container.querySelector('.touch-pan-y') as HTMLElement;

describe('FeedImageCarousel', () => {
  it('이미지가 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<FeedImageCarousel images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('이미지가 1장이면 카운터와 인디케이터를 보여주지 않는다', () => {
    render(<FeedImageCarousel images={makeImages(1)} />);

    expect(screen.queryByText(/^\d+\/\d+$/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('이미지가 여러 장이면 카운터와 인디케이터 버튼을 보여준다', () => {
    render(<FeedImageCarousel images={makeImages(3)} />);

    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('인디케이터 버튼을 클릭하면 해당 인덱스로 이동한다', () => {
    render(<FeedImageCarousel images={makeImages(3)} />);

    fireEvent.click(screen.getByLabelText('3번째 사진'));

    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('SWIPE_THRESHOLD 이상 왼쪽으로 드래그하면 다음 인덱스로 이동한다', () => {
    const { container } = render(<FeedImageCarousel images={makeImages(3)} />);
    const track = getTrack(container);

    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 100, pointerId: 1 });

    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('SWIPE_THRESHOLD 이상 오른쪽으로 드래그하면 이전 인덱스로 이동한다', () => {
    const { container } = render(<FeedImageCarousel images={makeImages(3)} />);
    const track = getTrack(container);

    fireEvent.click(screen.getByLabelText('2번째 사진'));
    expect(screen.getByText('2/3')).toBeInTheDocument();

    fireEvent.pointerDown(track, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 });

    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('SWIPE_THRESHOLD 보다 작은 드래그는 인덱스를 바꾸지 않는다', () => {
    const { container } = render(<FeedImageCarousel images={makeImages(3)} />);
    const track = getTrack(container);

    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 180, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 180, pointerId: 1 });

    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('fallback preview에서 실제 이미지로 바뀌어도 첫 이미지 figure를 remount하지 않는다', () => {
    const { container, rerender } = render(
      <FeedImageCarousel
        images={[{ src: '/thumb.jpg', heroPreviewUrl: '/preview.jpg', previewOnly: true }]}
      />,
    );
    const figure = container.querySelector('figure');

    rerender(
      <FeedImageCarousel images={[{ src: '/detail.jpg', heroPreviewUrl: '/preview.jpg' }]} />,
    );

    expect(container.querySelector('figure')).toBe(figure);
  });
});
