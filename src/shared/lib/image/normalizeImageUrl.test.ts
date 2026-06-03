import { describe, expect, it } from 'vitest';
import { normalizeImageUrl } from './normalizeImageUrl';

describe('normalizeImageUrl', () => {
  it('빈 입력은 undefined 를 반환한다', () => {
    expect(normalizeImageUrl()).toBeUndefined();
    expect(normalizeImageUrl(null)).toBeUndefined();
    expect(normalizeImageUrl('')).toBeUndefined();
  });

  it('http(s) 로 시작하는 URL 은 preset 쿼리까지 그대로 반환한다', () => {
    expect(normalizeImageUrl('http://x.com/a.png')).toBe('http://x.com/a.png');
    expect(normalizeImageUrl('HTTPS://x.com/a.png')).toBe('HTTPS://x.com/a.png');
    expect(
      normalizeImageUrl('https://media.tikitak.space/media/feed-image/x.jpg?preset=feed_thumb'),
    ).toBe('https://media.tikitak.space/media/feed-image/x.jpg?preset=feed_thumb');
  });

  it('protocol-relative URL 에 https: 를 붙인다', () => {
    expect(normalizeImageUrl('//cdn.x.com/a.png')).toBe('https://cdn.x.com/a.png');
  });

  it('절대 경로 / 로 시작하면 그대로 반환한다', () => {
    expect(normalizeImageUrl('/profile.png')).toBe('/profile.png');
  });

  it('도메인만 있는 문자열에는 https:// 를 prepend 한다', () => {
    expect(normalizeImageUrl('cdn.x.com/a.png')).toBe('https://cdn.x.com/a.png');
  });
});
