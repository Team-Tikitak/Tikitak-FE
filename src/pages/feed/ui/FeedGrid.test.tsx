import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedGrid } from './FeedGrid';
import { warmFeedDetail } from '../lib/warmFeedDetail';
import type { FeedItem } from '../model/types';
import type { ReactElement } from 'react';

vi.mock('../lib/warmFeedDetail', () => ({
  warmFeedDetail: vi.fn(),
}));

const renderGrid = (ui: ReactElement) => {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => navigateMock,
}));

const makeFeed = (id: string): FeedItem => ({
  id,
  type: 'GENERAL',
  place: '장소',
  question: '',
  title: '게시물',
  participantAvatarUrls: [],
  date: '2026.07.02',
  thumbnailUrl: `/thumb-${id}.jpg`,
  heroPreviewUrl: `/preview-${id}.jpg`,
  photoCount: 1,
});

describe('FeedGrid', () => {
  const NativeImage = globalThis.Image;
  const imageSources: string[] = [];

  beforeEach(() => {
    navigateMock.mockReset();
    imageSources.length = 0;
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      fetchPriority = 'auto';

      set src(value: string) {
        imageSources.push(value);
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.stubGlobal('Image', NativeImage);
  });

  it('navigates with hero preview state after warming the selected item assets', async () => {
    renderGrid(<FeedGrid items={[makeFeed('42')]} teamId={1} />);

    fireEvent.click(screen.getByRole('link'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/feed/42', {
        state: { thumbnailUrl: '/thumb-42.jpg', heroPreviewUrl: '/preview-42.jpg' },
      });
    });
  });

  it('captures the clicked image as a hero source before navigation', async () => {
    const onHeroCapture = vi.fn();
    renderGrid(<FeedGrid items={[makeFeed('77')]} teamId={1} onHeroCapture={onHeroCapture} />);
    const link = screen.getByRole('link');
    const image = link.querySelector('[data-hero-exit-key]');

    fireEvent.click(link);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/feed/77', {
        state: { thumbnailUrl: '/thumb-77.jpg', heroPreviewUrl: '/preview-77.jpg' },
      });
    });
    expect(onHeroCapture).toHaveBeenCalledWith(expect.objectContaining({ id: '77' }), image);
  });

  it('hides the matching grid image while a stored hero source is active', () => {
    const { container } = renderGrid(
      <FeedGrid items={[makeFeed('77'), makeFeed('88')]} teamId={1} suppressedHeroId="77" />,
    );

    const images = container.querySelectorAll('img');

    expect(images[0]).toHaveClass('opacity-0');
    expect(images[0]).not.toHaveAttribute('data-hero-exit-key');
    expect(images[1]).not.toHaveClass('opacity-0');
    expect(images[1]).toHaveAttribute('data-hero-exit-key', 'pin-88');
  });

  it('shows the today tikitak chip only on daily question tiles', () => {
    renderGrid(
      <FeedGrid
        items={[
          makeFeed('1'),
          { ...makeFeed('2'), type: 'DAILY_QUESTION', question: '오늘의 질문' },
        ]}
        teamId={1}
      />,
    );

    const chips = screen.getAllByRole('img', { name: "Today's Tiki-tak!" });

    expect(chips).toHaveLength(1);
    expect(chips[0].closest('a')).toHaveAttribute('href', '/feed/2');
  });

  it('hides the daily question chip while a stored hero source is active', () => {
    renderGrid(
      <FeedGrid
        items={[{ ...makeFeed('7'), type: 'DAILY_QUESTION', question: '오늘의 질문' }]}
        teamId={1}
        suppressedHeroId="7"
      />,
    );

    expect(screen.getByRole('img', { name: "Today's Tiki-tak!" })).toHaveClass('opacity-0');
  });

  it('reuses preloaded image promises for repeated pointer and click warming', async () => {
    renderGrid(<FeedGrid items={[makeFeed('99')]} teamId={1} />);
    const link = screen.getByRole('link');

    fireEvent.pointerDown(link);
    fireEvent.mouseEnter(link);
    fireEvent.click(link);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/feed/99', {
        state: { thumbnailUrl: '/thumb-99.jpg', heroPreviewUrl: '/preview-99.jpg' },
      });
    });
    expect(imageSources.filter((source) => source === '/thumb-99.jpg')).toHaveLength(1);
    expect(imageSources.filter((source) => source === '/preview-99.jpg')).toHaveLength(1);
  });

  it('pointerDown 시 상세 데이터를 미리 캐시한다', () => {
    renderGrid(<FeedGrid items={[makeFeed('42')]} teamId={7} />);

    fireEvent.pointerDown(screen.getByRole('link'));

    expect(warmFeedDetail).toHaveBeenCalledWith(expect.anything(), 7, '42');
  });
});
