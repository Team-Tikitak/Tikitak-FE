import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// audioEngine은 컨텍스트를 모듈 안에 보관하므로 테스트마다 새로 불러온다
const loadEngine = () => import('./audioEngine');

describe('audioEngine', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('오디오 컨텍스트 생성이 실패하면 null을 돌려주고 예외를 던지지 않는다', async () => {
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => {
        throw new Error('not allowed');
      }),
    );
    const { getAudioContext, unlockAudio } = await loadEngine();

    expect(getAudioContext()).toBeNull();
    expect(() => unlockAudio()).not.toThrow();
  });

  it('실행 중이 아닌 컨텍스트(suspended, interrupted)는 모두 다시 깨운다', async () => {
    for (const state of ['suspended', 'interrupted']) {
      vi.resetModules();
      const resume = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal(
        'AudioContext',
        vi.fn(function FakeContext() {
          return { state, resume };
        }),
      );
      const { unlockAudio } = await loadEngine();

      unlockAudio();

      expect(resume).toHaveBeenCalledTimes(1);
    }
  });

  it('이미 실행 중이면 다시 깨우지 않는다', async () => {
    const resume = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      'AudioContext',
      vi.fn(function FakeContext() {
        return { state: 'running', resume };
      }),
    );
    const { unlockAudio } = await loadEngine();

    unlockAudio();

    expect(resume).not.toHaveBeenCalled();
  });

  it('재개에 실패해도 예외가 밖으로 나오지 않는다', async () => {
    const resume = vi.fn().mockRejectedValue(new Error('closed'));
    vi.stubGlobal(
      'AudioContext',
      vi.fn(function FakeContext() {
        return { state: 'closed', resume };
      }),
    );
    const { unlockAudio } = await loadEngine();

    expect(() => unlockAudio()).not.toThrow();
    await Promise.resolve();
  });
});
