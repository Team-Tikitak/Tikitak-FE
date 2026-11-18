import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWhackGame } from './useWhackGame';

vi.mock('@/shared/lib/sound', () => ({ playSound: vi.fn(), unlockAudio: vi.fn() }));
vi.mock('@/shared/lib/native/haptics', () => ({ triggerHaptic: vi.fn() }));

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('useWhackGame', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('시작하면 playing이 되고 점수는 0이다', () => {
    const { result } = renderHook(() => useWhackGame(vi.fn()));

    act(() => result.current.start());

    expect(result.current.status).toBe('playing');
    expect(result.current.score).toBe(0);
  });

  it('시간이 지나면 두더지가 나오고, 맞히면 점수가 오른다', () => {
    // 난수를 고정해 항상 Tak가 나오게 한다 (방해 캐릭터는 난수가 0.2 미만일 때만 나온다)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { result } = renderHook(() => useWhackGame(vi.fn()));
    act(() => result.current.start());

    // 두더지가 나올 때까지 진행하면서 Tak가 나오면 바로 잡는다
    for (let elapsed = 0; elapsed < 10_000 && result.current.score === 0; elapsed += 50) {
      advance(50);
      const index = result.current.holes.findIndex((mole) => mole?.kind === 'tak');
      if (index >= 0) act(() => result.current.whack(index));
    }

    expect(result.current.score).toBeGreaterThanOrEqual(1);
  });

  it('30초가 지나면 끝나고 최종 점수를 한 번만 전달한다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useWhackGame(onGameOver));
    act(() => result.current.start());

    advance(31_000);

    expect(result.current.status).toBe('over');
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(result.current.score);
  });

  it('끝난 뒤에는 구멍을 눌러도 점수가 변하지 않는다', () => {
    const { result } = renderHook(() => useWhackGame(vi.fn()));
    act(() => result.current.start());
    advance(31_000);
    const before = result.current.score;

    act(() => result.current.whack(0));

    expect(result.current.score).toBe(before);
  });

  it('회귀: 종료 틱이 오기 전이라도 30초가 지난 입력은 점수에 넣지 않는다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const startedAt = performance.now();
    const { result } = renderHook(() => useWhackGame(vi.fn()));
    act(() => result.current.start());

    // Tak가 나올 때까지 진행한다 (아직 게임 중)
    for (let elapsed = 0; elapsed < 5_000; elapsed += 50) {
      advance(50);
      if (result.current.holes.some((mole) => mole?.kind === 'tak')) break;
    }
    const index = result.current.holes.findIndex((mole) => mole?.kind === 'tak');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(result.current.status).toBe('playing');

    // 아직 playing 상태지만 시계는 이미 30초를 넘겼다고 가정한다
    vi.spyOn(performance, 'now').mockReturnValue(startedAt + 30_010);
    act(() => result.current.whack(index));

    expect(result.current.score).toBe(0);
  });
});
