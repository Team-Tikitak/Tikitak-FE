import { describe, expect, it } from 'vitest';
import { snapPointToHeight } from './snapPoint';

describe('snapPointToHeight', () => {
  it('px 문자열 스냅 포인트는 그대로 반환한다', () => {
    expect(snapPointToHeight('294px')).toBe('294px');
    expect(snapPointToHeight('512px')).toBe('512px');
  });

  it('숫자(비율) 스냅 포인트는 %로 환산한다', () => {
    expect(snapPointToHeight(0.5)).toBe('50%');
    expect(snapPointToHeight(1)).toBe('100%');
  });

  it('null이면 undefined를 반환해 height 지정을 생략한다', () => {
    expect(snapPointToHeight(null)).toBeUndefined();
  });
});
