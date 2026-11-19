import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeycapGame } from './useKeycapGame';

vi.mock('@/shared/lib/sound', () => ({ playSound: vi.fn(), unlockAudio: vi.fn() }));
vi.mock('@/shared/lib/native/haptics', () => ({ triggerHaptic: vi.fn() }));

const STEP_MS = 50;
const ROUND_MS = 21_000;

/** 한 단계(20초)를 끝까지 진행한다. press가 true면 켜진 키를 보이는 즉시 누른다. */
const playRound = (
  result: { current: ReturnType<typeof useKeycapGame> },
  { press }: { press: boolean },
) => {
  for (let elapsed = 0; elapsed < ROUND_MS; elapsed += STEP_MS) {
    act(() => {
      vi.advanceTimersByTime(STEP_MS);
    });
    if (!press) continue;
    const index = result.current.keys.findIndex((key) => key.phase === 'lit');
    if (index >= 0) {
      act(() => {
        result.current.press(index);
      });
    }
  }
};

describe('useKeycapGame', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('도전하기를 누르면 초보 단계가 시작된다', () => {
    const { result } = renderHook(() => useKeycapGame(vi.fn()));
    expect(result.current.status).toBe('ready');

    act(() => result.current.start());

    expect(result.current.status).toBe('playing');
    expect(result.current.stageIndex).toBe(0);
    expect(result.current.stage.label).toBe('초보');
  });

  it('컴퓨터를 이기면 끝나지 않고 다음 단계로 올라갈 수 있다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useKeycapGame(onGameOver));
    act(() => result.current.start());

    playRound(result, { press: true });

    expect(result.current.status).toBe('stageClear');
    expect(result.current.outcome).toBe('win');
    expect(onGameOver).not.toHaveBeenCalled();

    act(() => result.current.nextStage());

    expect(result.current.status).toBe('playing');
    expect(result.current.stageIndex).toBe(1);
  });

  it('지면 끝나고 클리어한 단계 0개로 점수를 낸다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useKeycapGame(onGameOver));
    act(() => result.current.start());

    playRound(result, { press: false });

    expect(result.current.status).toBe('over');
    expect(result.current.outcome).toBe('lose');
    expect(onGameOver).toHaveBeenCalledTimes(1);
    // 한 번도 못 이겼으므로 100의 자리가 0이다
    expect(onGameOver.mock.calls[0][0]).toBeLessThan(1000);
  });

  it('초고수를 이기면 끝나지 않고 불가능 도전을 고르게 하며, 그 시점의 점수를 먼저 저장한다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useKeycapGame(onGameOver));
    act(() => result.current.start());

    for (let stage = 0; stage < 4; stage += 1) {
      playRound(result, { press: true });
      expect(result.current.status).toBe('stageClear');
      if (stage < 3) act(() => result.current.nextStage());
    }

    expect(result.current.run.clearedStages).toBe(4);
    expect(onGameOver).toHaveBeenCalledTimes(1);
    const savedScore = onGameOver.mock.calls[0][0] as number;
    expect(savedScore).toBeGreaterThanOrEqual(4000);
    expect(savedScore).toBeLessThan(5000);
  });

  it('불가능 도전을 건너뛰고 마무리하면 같은 점수를 한 번 더 보내고 끝난다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useKeycapGame(onGameOver));
    act(() => result.current.start());
    for (let stage = 0; stage < 4; stage += 1) {
      playRound(result, { press: true });
      if (stage < 3) act(() => result.current.nextStage());
    }

    act(() => result.current.finish());

    expect(result.current.status).toBe('over');
    // 초고수를 깬 순간 한 번, 마무리할 때 한 번(앞의 저장이 실패했어도 기록이 남게). 같은 점수다
    expect(onGameOver).toHaveBeenCalledTimes(2);
    expect(onGameOver.mock.calls[1][0]).toBe(onGameOver.mock.calls[0][0]);
  });

  it('불가능까지 이기면 5단계 클리어 점수로 끝난다', () => {
    const onGameOver = vi.fn();
    const { result } = renderHook(() => useKeycapGame(onGameOver));
    act(() => result.current.start());
    for (let stage = 0; stage < 4; stage += 1) {
      playRound(result, { press: true });
      act(() => result.current.nextStage());
    }

    playRound(result, { press: true });

    expect(result.current.status).toBe('over');
    expect(result.current.run.clearedStages).toBe(5);
    expect(onGameOver).toHaveBeenCalledTimes(2);
    const finalScore = onGameOver.mock.calls[1][0] as number;
    expect(finalScore).toBeGreaterThanOrEqual(5000);
    expect(finalScore).toBeLessThanOrEqual(5999);
  });

  it('다시 시작하면 이전 도전의 성과가 초기화된다', () => {
    const { result } = renderHook(() => useKeycapGame(vi.fn()));
    act(() => result.current.start());
    playRound(result, { press: true });
    expect(result.current.run.clearedStages).toBe(1);

    act(() => result.current.start());

    expect(result.current.run).toEqual({ clearedStages: 0, points: 0 });
    expect(result.current.stageIndex).toBe(0);
  });

  it('회귀: 종료 틱이 오기 전이라도 제한 시간이 지난 입력은 점수에 넣지 않는다', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const startedAt = performance.now();
    const { result } = renderHook(() => useKeycapGame(vi.fn()));
    act(() => result.current.start());

    // 켜진 키가 나올 때까지 진행한다
    let index = -1;
    for (let elapsed = 0; elapsed < 5_000 && index < 0; elapsed += STEP_MS) {
      act(() => {
        vi.advanceTimersByTime(STEP_MS);
      });
      index = result.current.keys.findIndex((key) => key.phase === 'lit');
    }
    expect(index).toBeGreaterThanOrEqual(0);

    vi.spyOn(performance, 'now').mockReturnValue(startedAt + 20_010);
    act(() => result.current.press(index));

    expect(result.current.me).toBe(0);
  });
});
