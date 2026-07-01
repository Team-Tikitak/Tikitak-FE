import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedGrid } from './FeedGrid';
import type { FeedItem } from '../model/types';

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
  location: '장소',
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
    render(<FeedGrid items={[makeFeed('42')]} />);

    fireEvent.click(screen.getByRole('link'));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/feed/42', {
        state: { thumbnailUrl: '/thumb-42.jpg', heroPreviewUrl: '/preview-42.jpg' },
      });
    });
  });

  it('reuses preloaded image promises for repeated pointer and click warming', async () => {
    render(<FeedGrid items={[makeFeed('99')]} />);
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
});
