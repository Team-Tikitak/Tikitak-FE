import { describe, expect, it } from 'vitest';
import {
  BIRD_RADIUS,
  BIRD_X,
  FLAP_VELOCITY,
  GAME_HEIGHT,
  GROUND_HEIGHT,
  MAX_GAP_SHIFT,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_WIDTH,
  getPipeGap,
  getPipeSpeed,
  createGameState,
  flap,
  stepFall,
  stepGame,
} from './flappyEngine';

describe('flappyEngine 난이도', () => {
  it('점수가 오를수록 빨라지고 틈이 좁아지며 한계에서 멈춘다', () => {
    expect(getPipeSpeed(0)).toBe(PIPE_SPEED);
    expect(getPipeSpeed(5)).toBeGreaterThan(getPipeSpeed(0));
    expect(getPipeSpeed(100)).toBe(getPipeSpeed(1000));

    expect(getPipeGap(0)).toBe(PIPE_GAP);
    expect(getPipeGap(5)).toBeLessThan(getPipeGap(0));
    expect(getPipeGap(100)).toBe(getPipeGap(1000));
    // 한계에 닿아도 새(지름 32)가 지날 수 있는 여유가 남는다
    expect(getPipeGap(1000)).toBeGreaterThan(BIRD_RADIUS * 2 * 3);
  });

  it('파이프는 나온 시점의 점수에 맞는 틈을 가진다', () => {
    const state = createGameState();
    state.score = 10;
    stepGame(state, 0.016, () => 0.5);
    expect(state.pipes[0].gap).toBe(getPipeGap(10));
  });

  it('점수가 높으면 같은 시간 동안 파이프가 더 멀리 간다', () => {
    const slow = createGameState();
    slow.pipes = [{ x: 300, gapY: 300, gap: PIPE_GAP, passed: false, seed: 0 }];
    slow.sinceSpawn = 0;
    const fast = createGameState();
    fast.score = 15;
    fast.pipes = [{ x: 300, gapY: 300, gap: PIPE_GAP, passed: false, seed: 0 }];
    fast.sinceSpawn = 0;
    stepGame(slow, 0.016, () => 0.5);
    stepGame(fast, 0.016, () => 0.5);
    expect(fast.pipes[0].x).toBeLessThan(slow.pipes[0].x);
  });

  it('앞 파이프와 틈 높이가 너무 크게 어긋나지 않는다', () => {
    const state = createGameState();
    state.pipes = [{ x: 400, gapY: 100, gap: PIPE_GAP, passed: false, seed: 0 }];
    state.sinceSpawn = 10;
    stepGame(state, 0.016, () => 1);
    expect(Math.abs(state.pipes.at(-1)!.gapY - 100)).toBeLessThanOrEqual(MAX_GAP_SHIFT);
  });
});

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

  it('천장을 더 위로 옮기면 그 높이까지는 날 수 있다', () => {
    const state = createGameState();
    state.y = -40;
    // 기본 천장(0)에서는 끝나고, 화면이 길어 천장이 -80으로 옮겨지면 계속 난다
    expect(stepGame(structuredClone(state), 0.001, () => 0.5)).toBe(true);
    expect(stepGame(structuredClone(state), 0.001, () => 0.5, -80)).toBe(false);

    state.y = -80;
    expect(stepGame(state, 0.001, () => 0.5, -80)).toBe(true);
  });

  it('파이프 틈 밖에서 부딪히면 끝나고 틈 안이면 통과한다', () => {
    const blocked = createGameState();
    blocked.sinceSpawn = 0;
    blocked.pipes = [
      { x: BIRD_X - PIPE_WIDTH / 2, gapY: 100, gap: PIPE_GAP, passed: false, seed: 0 },
    ];
    expect(stepGame(blocked, 0.001, () => 0.5)).toBe(true);

    const safe = createGameState();
    safe.sinceSpawn = 0;
    safe.pipes = [
      { x: BIRD_X - PIPE_WIDTH / 2, gapY: safe.y, gap: PIPE_GAP, passed: false, seed: 0 },
    ];
    expect(stepGame(safe, 0.001, () => 0.5)).toBe(false);
  });

  it('파이프를 지나면 점수가 1 오르고 한 번만 센다', () => {
    const state = createGameState();
    state.sinceSpawn = 0;
    state.velocity = -1500 * 0.016;
    state.pipes = [
      { x: BIRD_X - PIPE_WIDTH - 40, gapY: state.y, gap: PIPE_GAP, passed: false, seed: 0 },
    ];
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
