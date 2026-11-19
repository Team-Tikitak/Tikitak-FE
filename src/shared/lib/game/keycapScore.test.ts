import { describe, expect, it } from 'vitest';
import {
  decodeKeycapScore,
  encodeKeycapScore,
  formatKeycapResult,
  formatKeycapScore,
} from './keycapScore';

describe('keycapScore', () => {
  it('높은 단계를 클리어한 점수가 항상 더 크다', () => {
    expect(encodeKeycapScore(2, 0)).toBeGreaterThan(encodeKeycapScore(1, 999));
    expect(encodeKeycapScore(4, 10)).toBeGreaterThan(encodeKeycapScore(3, 999));
  });

  it('같은 단계면 가져온 키캡이 많은 쪽이 크고, 999를 넘지 않는다', () => {
    expect(encodeKeycapScore(1, 40)).toBeGreaterThan(encodeKeycapScore(1, 30));
    expect(encodeKeycapScore(1, 5000)).toBe(1999);
    expect(encodeKeycapScore(0, -3)).toBe(0);
  });

  it('서버 상한(5999)을 넘지 않는다', () => {
    expect(encodeKeycapScore(5, 999)).toBeLessThanOrEqual(5999);
  });

  it('점수를 단계와 키캡 수로 되돌린다', () => {
    expect(decodeKeycapScore(3042)).toEqual({ clearedStages: 3, points: 42 });
  });

  it('사람이 읽는 문구로 바꾼다', () => {
    expect(formatKeycapScore(14)).toBe('초보 도전 · 14점');
    expect(formatKeycapScore(2031)).toBe('중수 클리어 · 31점');
    expect(formatKeycapScore(4050)).toBe('초고수 클리어 · 50점');
    expect(formatKeycapScore(5007)).toBe('불가능 클리어 · 7점');
  });

  it('키캡 상한(999)에 닿으면 "이상"으로 보여준다', () => {
    expect(formatKeycapScore(3999)).toBe('고수 클리어 · 999점 이상');
  });

  it('단계 수를 넘는 잘못된 점수도 마지막 단계로 보여준다', () => {
    expect(formatKeycapScore(6000)).toBe('불가능 클리어 · 0점');
    expect(formatKeycapScore(9999)).toBe('불가능 클리어 · 999점 이상');
  });

  it('게임 끝 화면은 단계와 점수를 두 줄로 보여준다', () => {
    expect(formatKeycapResult(4000)).toBe('초고수 난이도 클리어\n0점');
    expect(formatKeycapResult(2031)).toBe('중수 난이도 클리어\n31점');
    expect(formatKeycapResult(14)).toBe('초보 난이도 도전\n14점');
    expect(formatKeycapResult(3999)).toBe('고수 난이도 클리어\n999점 이상');
  });
});
