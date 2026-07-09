import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedListItem } from './FeedListItem';
import type { FeedItem } from '../model/types';

const makeItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: '1',
  type: 'GENERAL',
  place: '서울',
  question: '',
  title: '테스트 게시물',
  participantAvatarUrls: [],
  date: '2026.07.09',
  thumbnailUrl: '/thumb-1.jpg',
  heroPreviewUrl: '/preview-1.jpg',
  photoCount: 1,
  ...overrides,
});

describe('FeedListItem', () => {
  it('shows the question text and today tikitak chip for daily question items', () => {
    render(<FeedListItem item={makeItem({ type: 'DAILY_QUESTION', question: '오늘의 질문' })} />);

    expect(screen.getByText('오늘의 질문')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: "Today's Tiki-tak!" })).toBeInTheDocument();
  });

  it('does not render the chip for general items', () => {
    render(<FeedListItem item={makeItem()} />);

    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: "Today's Tiki-tak!" })).toBeNull();
  });

  it('hides the chip while the hero image is suppressed', () => {
    render(
      <FeedListItem
        item={makeItem({ type: 'DAILY_QUESTION', question: '오늘의 질문' })}
        suppressHeroImage
      />,
    );

    expect(screen.getByRole('img', { name: "Today's Tiki-tak!" })).toHaveClass('opacity-0');
  });
});
