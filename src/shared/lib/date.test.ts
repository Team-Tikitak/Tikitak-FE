import { describe, expect, it } from 'vitest';
import { formatRelativeTime, formatYmd, parseServerDate } from './date';

describe('parseServerDate', () => {
  it('타임존 없는 서버 시간(마이크로초 포함)을 UTC로 해석한다', () => {
    const parsed = parseServerDate('2026-07-05T06:21:49.433862');
    expect(parsed.getTime()).toBe(Date.parse('2026-07-05T06:21:49.433Z'));
  });

  it('타임존 표기가 있는 값은 그대로 파싱한다', () => {
    expect(parseServerDate('2026-07-05T06:21:49.433Z').getTime()).toBe(
      Date.parse('2026-07-05T06:21:49.433Z'),
    );
    expect(parseServerDate('2026-07-05T15:21:49+09:00').getTime()).toBe(
      Date.parse('2026-07-05T06:21:49Z'),
    );
  });
});

describe('formatYmd', () => {
  it('타임존 없는 UTC 시간을 KST 날짜로 변환한다', () => {
    // UTC 7/4 23:00 = KST 7/5 08:00 → 새벽 게시물이 전날로 밀리지 않는다
    expect(formatYmd('2026-07-04T23:00:00.123456')).toBe('2026.07.05');
    expect(formatYmd('2026-07-05T06:21:49')).toBe('2026.07.05');
  });

  it('날짜만 있는 값은 그대로 표기한다', () => {
    expect(formatYmd('2026-07-05')).toBe('2026.07.05');
  });

  it('잘못된 값은 빈 문자열을 반환한다', () => {
    expect(formatYmd('invalid')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-05T06:30:00Z');

  it('타임존 없는 UTC 시간을 미래로 오해하지 않는다', () => {
    expect(formatRelativeTime('2026-07-05T06:21:49.433862', now)).toBe('8분 전');
  });

  it('경과 시간에 따라 단위를 바꾼다', () => {
    expect(formatRelativeTime('2026-07-05T06:29:30', now)).toBe('방금 전');
    expect(formatRelativeTime('2026-07-05T03:30:00', now)).toBe('3시간 전');
    expect(formatRelativeTime('2026-07-03T06:30:00', now)).toBe('2일 전');
  });

  it('7일 이상이면 KST 기준 날짜로 표기한다', () => {
    // 2026-06-27T20:00 UTC = KST 6/28 05:00 → 날짜 경계에서 KST 기준을 따른다
    expect(formatRelativeTime('2026-06-27T20:00:00', now)).toBe('2026.06.28');
  });

  it('잘못된 값은 빈 문자열을 반환한다', () => {
    expect(formatRelativeTime('invalid', now)).toBe('');
  });
});
