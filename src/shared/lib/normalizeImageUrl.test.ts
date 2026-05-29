import { describe, expect, it } from 'vitest';
import { MEDIA_CDN_BASE_URL } from '@/shared/api/media/constants';
import { normalizeImageUrl } from './normalizeImageUrl';

const UUID = '8df3ce57-8035-44f0-9aec-0695c162339d';
const CDN = `${MEDIA_CDN_BASE_URL}/media`;

describe('normalizeImageUrl', () => {
  it('빈 입력은 undefined 를 반환한다', () => {
    expect(normalizeImageUrl()).toBeUndefined();
    expect(normalizeImageUrl(null)).toBeUndefined();
    expect(normalizeImageUrl('')).toBeUndefined();
  });

  it('http(s) 로 시작하는 URL 은 그대로 반환한다', () => {
    expect(normalizeImageUrl('http://x.com/a.png')).toBe('http://x.com/a.png');
    expect(normalizeImageUrl('https://x.com/a.png')).toBe('https://x.com/a.png');
    expect(normalizeImageUrl('HTTPS://x.com/a.png')).toBe('HTTPS://x.com/a.png');
  });

  it('protocol-relative URL 에 https: 를 붙인다', () => {
    expect(normalizeImageUrl('//cdn.x.com/a.png')).toBe('https://cdn.x.com/a.png');
  });

  it('절대 경로 / 로 시작하면 그대로 반환한다', () => {
    expect(normalizeImageUrl('/profile.png')).toBe('/profile.png');
  });

  it('UUID 형식 publicId 는 기본 profile-image 폴더 CDN URL 로 변환한다', () => {
    expect(normalizeImageUrl(UUID)).toBe(`${CDN}/profile-image/${UUID}.png`);
  });

  it('UUID 입력 시 폴더를 지정하면 해당 폴더로 조립한다', () => {
    expect(normalizeImageUrl(UUID, 'feed-image')).toBe(`${CDN}/feed-image/${UUID}.png`);
    expect(normalizeImageUrl(UUID, 'team-image')).toBe(`${CDN}/team-image/${UUID}.png`);
    expect(normalizeImageUrl(UUID, 'daily-question-image')).toBe(
      `${CDN}/daily-question-image/${UUID}.png`,
    );
  });

  it('UUID 가 아닌 일반 문자열에는 https:// 를 prepend 한다', () => {
    expect(normalizeImageUrl('cdn.x.com/a.png')).toBe('https://cdn.x.com/a.png');
    expect(normalizeImageUrl('dev-media.kusitms.xyz/default-profiles/x.png')).toBe(
      'https://dev-media.kusitms.xyz/default-profiles/x.png',
    );
  });

  it('대소문자가 섞인 UUID 도 인식한다', () => {
    const mixed = '8DF3CE57-8035-44F0-9AEC-0695c162339D';
    expect(normalizeImageUrl(mixed)).toBe(`${CDN}/profile-image/${mixed}.png`);
  });
});
