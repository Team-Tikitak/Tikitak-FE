import { describe, expect, it } from 'vitest';
import {
  DIFFICULTY_SETTINGS,
  GAME_SECONDS,
  createWhackState,
  getRemainingSeconds,
  hitHole,
  isWhackOver,
  tickWhack,
} from './whackEngine';

// 첫 random()은 빈 구멍 선택, 두 번째는 종류, 세 번째는 캐릭터
const sequence = (...values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('whackEngine', () => {
  it('나올 때가 되면 빈 구멍에서 두더지가 나온다', () => {
    const state = createWhackState(0);
    tickWhack(state, 100, () => 0.5);
    expect(state.holes.some(Boolean)).toBe(false);

    tickWhack(state, 400, sequence(0.5, 0.9, 0.0));
    expect(state.holes.filter(Boolean)).toHaveLength(1);
  });

  it('머무는 시간이 지나면 들어간다', () => {
    const state = createWhackState(0);
    tickWhack(state, 400, sequence(0, 0.9, 0));
    const mole = state.holes.find(Boolean);
    expect(mole).toBeDefined();

    tickWhack(state, 400 + 2000, () => 0.99);
    expect(state.holes.find((hole) => hole?.id === mole?.id)).toBeUndefined();
  });

  it('Tak를 잡으면 1점, 방해 캐릭터를 누르면 감점이고 0점 아래로 내려가지 않는다', () => {
    const state = createWhackState(0);
    state.holes[0] = { id: 1, kind: 'tak', variant: 0, lifetime: 1000, expiresAt: 5000 };
    state.holes[1] = { id: 2, kind: 'bad', variant: 0, lifetime: 1000, expiresAt: 5000 };
    state.holes[2] = { id: 3, kind: 'bad', variant: 0, lifetime: 1000, expiresAt: 5000 };

    expect(hitHole(state, 0)).toBe('tak');
    expect(state.score).toBe(1);
    expect(hitHole(state, 1)).toBe('bad');
    expect(state.score).toBe(Math.max(0, 1 - DIFFICULTY_SETTINGS.normal.badPenalty));
    expect(hitHole(state, 2)).toBe('bad');
    expect(state.score).toBe(0);
  });

  it('빈 구멍이나 이미 잡은 구멍을 누르면 아무 일도 없다', () => {
    const state = createWhackState(0);
    state.holes[4] = { id: 1, kind: 'tak', variant: 0, lifetime: 1000, expiresAt: 5000 };
    hitHole(state, 4);

    expect(hitHole(state, 4)).toBeNull();
    expect(state.score).toBe(1);
  });

  it('제한 시간이 지나면 끝난다', () => {
    const state = createWhackState(1000);
    expect(isWhackOver(state, 1000 + GAME_SECONDS * 1000 - 1)).toBe(false);
    expect(isWhackOver(state, 1000 + GAME_SECONDS * 1000)).toBe(true);
    expect(getRemainingSeconds(state, 1000 + 10_000)).toBe(GAME_SECONDS - 10);
  });

  describe('어려움', () => {
    it('Tak를 잡으면 기본보다 점수를 더 주고 감점도 더 크다', () => {
      expect(DIFFICULTY_SETTINGS.hard.takPoints).toBeGreaterThan(
        DIFFICULTY_SETTINGS.normal.takPoints,
      );
      const state = createWhackState(0, 'hard');
      state.holes[0] = { id: 1, kind: 'tak', variant: 0, lifetime: 1000, expiresAt: 5000 };
      state.holes[1] = { id: 2, kind: 'bad', variant: 0, lifetime: 1000, expiresAt: 5000 };

      hitHole(state, 0);
      expect(state.score).toBe(DIFFICULTY_SETTINGS.hard.takPoints);
      hitHole(state, 1);
      expect(state.score).toBe(
        Math.max(0, DIFFICULTY_SETTINGS.hard.takPoints - DIFFICULTY_SETTINGS.hard.badPenalty),
      );
    });

    it('두더지가 더 짧게 머물고 더 자주 나온다', () => {
      const normal = createWhackState(0, 'normal');
      const hard = createWhackState(0, 'hard');
      tickWhack(normal, 400, () => 0.5);
      tickWhack(hard, 400, () => 0.5);

      expect(hard.holes.find(Boolean)?.lifetime).toBeLessThan(
        normal.holes.find(Boolean)?.lifetime ?? 0,
      );
      expect(hard.nextSpawnAt).toBeLessThan(normal.nextSpawnAt);
    });

    it('난이도를 정하지 않으면 기본이다', () => {
      expect(createWhackState(0).difficulty).toBe('normal');
    });
  });
});
