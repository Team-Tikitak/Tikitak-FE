import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FeedShareCardData } from '@/shared/lib/image/shareCard';
import { useShareFeedCard } from './useShareFeedCard';

const { generateFeedShareCardMock, shareImageBlobMock } = vi.hoisted(() => ({
  generateFeedShareCardMock: vi.fn(),
  shareImageBlobMock: vi.fn(),
}));

vi.mock('@/shared/lib/image/shareCard', () => ({
  generateFeedShareCard: generateFeedShareCardMock,
}));

vi.mock('@/shared/lib/native/shareImage', () => ({
  shareImageBlob: shareImageBlobMock,
}));

const shareData: FeedShareCardData = {
  imageUrl: 'https://example.com/feed.jpg',
  authorName: 'author',
  title: 'title',
  date: '2026.07.01',
};

describe('useShareFeedCard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('does nothing when data is null', async () => {
    const { result } = renderHook(() => useShareFeedCard(null));

    await act(async () => {
      await result.current.share();
    });

    expect(generateFeedShareCardMock).not.toHaveBeenCalled();
    expect(shareImageBlobMock).not.toHaveBeenCalled();
  });

  it('generates and shares a feed card image', async () => {
    const blob = new Blob(['card'], { type: 'image/jpeg' });
    generateFeedShareCardMock.mockResolvedValue(blob);
    shareImageBlobMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useShareFeedCard(shareData));

    await act(async () => {
      await result.current.share();
    });

    expect(generateFeedShareCardMock).toHaveBeenCalledWith(shareData);
    expect(shareImageBlobMock).toHaveBeenCalledWith(blob, {
      fileName: 'tikitak-card.jpg',
      title: shareData.title,
    });
    expect(result.current.isSharing).toBe(false);
  });

  it('ignores duplicate share calls while sharing', async () => {
    let resolveGenerate: (blob: Blob) => void = () => {};
    generateFeedShareCardMock.mockImplementation(
      () =>
        new Promise<Blob>((resolve) => {
          resolveGenerate = resolve;
        }),
    );
    shareImageBlobMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useShareFeedCard(shareData));

    let firstShare!: Promise<void>;
    act(() => {
      firstShare = result.current.share();
    });
    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      await result.current.share();
    });
    expect(generateFeedShareCardMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveGenerate(new Blob(['card'], { type: 'image/jpeg' }));
      await firstShare;
    });
    expect(result.current.isSharing).toBe(false);
  });

  it('ignores AbortError and restores sharing state', async () => {
    generateFeedShareCardMock.mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const { result } = renderHook(() => useShareFeedCard(shareData));

    await act(async () => {
      await result.current.share();
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(result.current.isSharing).toBe(false);
  });

  it('logs unexpected failures and restores sharing state', async () => {
    generateFeedShareCardMock.mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useShareFeedCard(shareData));

    await act(async () => {
      await result.current.share();
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(result.current.isSharing).toBe(false);
  });
});
