import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePinComments } from './usePinComments';
import { type FeedItem } from '../model/types';

const baseFeeds: FeedItem[] = [
  {
    id: 1,
    participants: [],
    images: [
      {
        src: 'a.jpg',
        pins: [{ id: '1', x: 10, y: 20, avatars: [{ id: 'u1', src: 'u.jpg' }] }],
      },
    ],
    authorName: '정수',
    content: '내용',
    date: '2026.05.01',
  },
];

describe('usePinComments', () => {
  it('initial sheet keys are null', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    expect(result.current.openPinKey).toBeNull();
    expect(result.current.displayPinKey).toBeNull();
  });

  it('mock pins get pre-populated comments', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    const pins = result.current.decoratePins(1, 0, baseFeeds[0].images[0].pins);
    expect(pins).toHaveLength(1);
    act(() => pins[0].onClick?.());
    expect(result.current.commentsForOpenPin.length).toBeGreaterThan(0);
  });

  it('addPinAt appends a new pin and opens its sheet', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    act(() => result.current.addPinAt(1, 0, 30, 40));
    expect(result.current.openPinKey).not.toBeNull();
    expect(result.current.displayPinKey).toBe(result.current.openPinKey);
    expect(result.current.commentsForOpenPin).toEqual([]);
  });

  it('submitComment appends a comment to the open pin', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    act(() => result.current.addPinAt(1, 0, 30, 40));
    act(() => result.current.submitComment('하이'));
    expect(result.current.commentsForOpenPin).toHaveLength(1);
    expect(result.current.commentsForOpenPin[0].text).toBe('하이');
  });

  it('submitComment is no-op when no pin is open', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    act(() => result.current.submitComment('drop'));
    expect(result.current.openPinKey).toBeNull();
  });

  it('closeSheet clears openPinKey but keeps displayPinKey until completeClose', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    act(() => result.current.addPinAt(1, 0, 30, 40));
    act(() => result.current.closeSheet());
    expect(result.current.openPinKey).toBeNull();
    expect(result.current.displayPinKey).not.toBeNull();
    act(() => result.current.completeClose());
    expect(result.current.displayPinKey).toBeNull();
  });

  it('decoratePins merges mock + added pins', () => {
    const { result } = renderHook(() => usePinComments(baseFeeds));
    act(() => result.current.addPinAt(1, 0, 30, 40));
    const pins = result.current.decoratePins(1, 0, baseFeeds[0].images[0].pins);
    expect(pins).toHaveLength(2);
  });
});
