import { describe, expect, it } from 'vitest';
import {
  GAME_SECONDS,
  KEY_COUNT,
  KEY_LAYOUT,
  STAGES,
  createKeycapState,
  getOutcome,
  getRemainingSeconds,
  isKeycapOver,
  pressKeycap,
  tickKeycap,
} from './keycapEngine';

const lightKeys = (count: number) => {
  const state = createKeycapState(0);
  let now = 500;
  // random()이 항상 0이라 가장 앞의 빈 키부터 켜진다
  for (let i = 0; i < count; i += 1) {
    tickKeycap(state, now, () => 0);
    now += 250;
  }
  return { state, now };
};

describe('keycapEngine', () => {
  it('시간이 되면 키가 켜지고 동시에 MAX_LIT개를 넘지 않는다', () => {
    const { state } = lightKeys(10);
    expect(state.keys.filter((key) => key.phase === 'lit')).toHaveLength(STAGES[0].maxLit);
  });

  it('켜진 키를 누르면 가져오고 1점을 얻는다', () => {
    const { state, now } = lightKeys(1);
    const index = state.keys.findIndex((key) => key.phase === 'lit');

    expect(pressKeycap(state, index, now)).toBe('hit');
    expect(state.me).toBe(1);
    expect(state.keys[index]).toMatchObject({ phase: 'claimed', owner: 'me' });
  });

  it('꺼진 키를 누르면 감점이고 0점 아래로 내려가지 않는다', () => {
    const state = createKeycapState(0);
    expect(pressKeycap(state, 0, 100)).toBe('miss');
    expect(state.me).toBe(0);

    state.me = 3;
    pressKeycap(state, 0, 100);
    expect(state.me).toBe(2);
  });

  it('이미 가져간 키를 늦게 누르면 아무 일도 없다', () => {
    const { state, now } = lightKeys(1);
    const index = state.keys.findIndex((key) => key.phase === 'lit');
    pressKeycap(state, index, now);

    expect(pressKeycap(state, index, now + 10)).toBeNull();
    expect(state.me).toBe(1);
  });

  it('내가 안 누르면 컴퓨터가 가져가고, 가져간 키는 잠시 뒤 다시 꺼진다', () => {
    const { state, now } = lightKeys(1);
    const index = state.keys.findIndex((key) => key.phase === 'lit');

    const claims = tickKeycap(state, now + 3000, () => 0.99);
    expect(claims).toContain(index);
    expect(state.bot).toBeGreaterThanOrEqual(1);
    expect(state.keys[index].owner).toBe('bot');

    tickKeycap(state, now + 3000 + 1000, () => 0.99);
    expect(state.keys[index].phase).not.toBe('claimed');
  });

  it('제한 시간이 지나면 끝나고 승패를 가린다', () => {
    const state = createKeycapState(1000);
    expect(isKeycapOver(state, 1000 + GAME_SECONDS * 1000 - 1)).toBe(false);
    expect(isKeycapOver(state, 1000 + GAME_SECONDS * 1000)).toBe(true);
    expect(getRemainingSeconds(state, 1000 + 10_000)).toBe(GAME_SECONDS - 10);

    state.me = 5;
    state.bot = 3;
    expect(getOutcome(state)).toBe('win');
    state.bot = 5;
    expect(getOutcome(state)).toBe('draw');
    state.bot = 8;
    expect(getOutcome(state)).toBe('lose');
  });

  it('키 배열은 네 줄이고 한 줄의 칸 수 합이 10이다', () => {
    expect(KEY_LAYOUT).toHaveLength(KEY_COUNT);

    const rows: number[] = [];
    let current = 0;
    for (const { span } of KEY_LAYOUT) {
      current += span;
      if (current === 10) {
        rows.push(current);
        current = 0;
      }
      expect(current).toBeLessThan(10);
    }
    expect(rows).toHaveLength(4);
    expect(current).toBe(0);
  });

  it('높은 단계일수록 컴퓨터가 빠르고 초고수가 가장 빠르다', () => {
    for (let index = 1; index < STAGES.length; index += 1) {
      expect(STAGES[index].botStart).toBeLessThan(STAGES[index - 1].botStart);
      expect(STAGES[index].botMin).toBeLessThan(STAGES[index - 1].botMin);
    }
    expect(STAGES.at(-1)?.label).toBe('초고수');
  });

  it('같은 순간에 켜진 키를 단계가 높을수록 컴퓨터가 더 빨리 가져간다', () => {
    const claimedAt = (stageIndex: number) => {
      const state = createKeycapState(0, STAGES[stageIndex]);
      tickKeycap(state, 500, () => 0);
      const index = state.keys.findIndex((key) => key.phase === 'lit');
      return state.keys[index].botAt;
    };

    expect(claimedAt(3)).toBeLessThan(claimedAt(0));
  });
});
