import { describe, expect, it } from 'vitest';
import {
  BIRD_RADIUS,
  BIRD_X,
  FLAP_VELOCITY,
  GAME_HEIGHT,
  GROUND_HEIGHT,
  PIPE_WIDTH,
  createGameState,
  flap,
  stepFall,
  stepGame,
} from './flappyEngine';

describe('flappyEngine', () => {
  it('중력으로 떨어지고 flap하면 위로 올라간다', () => {
    const state = createGameState();
    stepGame(state, 0.016, () => 0.5);
    expect(state.velocity).toBeGreaterThan(0);

    flap(state);
    expect(state.velocity).toBe(FLAP_VELOCITY);
  });

  it('바닥이나 천장에 닿으면 끝난다', () => {
    const state = createGameState();
    state.y = GAME_HEIGHT - GROUND_HEIGHT;
    expect(stepGame(state, 0.016, () => 0.5)).toBe(true);

    const top = createGameState();
    top.y = 0;
    expect(stepGame(top, 0.016, () => 0.5)).toBe(true);
  });

  it('파이프 틈 밖에서 부딪히면 끝나고 틈 안이면 통과한다', () => {
    const blocked = createGameState();
    blocked.sinceSpawn = 0;
    blocked.pipes = [{ x: BIRD_X - PIPE_WIDTH / 2, gapY: 100, passed: false, seed: 0 }];
    expect(stepGame(blocked, 0.001, () => 0.5)).toBe(true);

    const safe = createGameState();
    safe.sinceSpawn = 0;
    safe.pipes = [{ x: BIRD_X - PIPE_WIDTH / 2, gapY: safe.y, passed: false, seed: 0 }];
    expect(stepGame(safe, 0.001, () => 0.5)).toBe(false);
  });

  it('파이프를 지나면 점수가 1 오르고 한 번만 센다', () => {
    const state = createGameState();
    state.sinceSpawn = 0;
    state.velocity = -1500 * 0.016;
    state.pipes = [{ x: BIRD_X - PIPE_WIDTH - 40, gapY: state.y, passed: false, seed: 0 }];
    stepGame(state, 0.016, () => 0.5);
    stepGame(state, 0.016, () => 0.5);
    expect(state.score).toBe(1);
  });

  it('게임 오버 뒤에는 땅까지 떨어져서 멈춘다', () => {
    const state = createGameState();
    const floor = GAME_HEIGHT - GROUND_HEIGHT - BIRD_RADIUS;
    // 처음에는 공중에 떠 있어서 아직 땅에 닿지 않은 상태다
    expect(state.y).toBeLessThan(floor);

    for (let i = 0; i < 200; i += 1) stepFall(state, 0.016);

    // 실제로 땅에 닿았는지 확인한다 (아무것도 안 해도 통과하는 단언이 되지 않게)
    expect(state.y).toBe(floor);
    stepFall(state, 0.016);
    expect(state.y).toBe(floor);
  });
});
