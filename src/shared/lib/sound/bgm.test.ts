import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundStore } from '@/shared/stores/soundStore';
import { createBgm } from './bgm';

const { getAudioContext, loadAudioBuffer } = vi.hoisted(() => ({
  getAudioContext: vi.fn(),
  loadAudioBuffer: vi.fn(),
}));

vi.mock('./audioEngine', () => ({ getAudioContext, loadAudioBuffer }));

const createFakeContext = () => {
  const gainNode = {
    gain: {
      value: 0,
      cancelScheduledValues: vi.fn(),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
  const source = {
    buffer: null,
    loop: false,
    connect: vi.fn(() => gainNode),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const context = {
    currentTime: 1,
    destination: {},
    createBufferSource: vi.fn(() => source),
    createGain: vi.fn(() => gainNode),
  };
  return { context, source, gainNode };
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createBgm', () => {
  let fake: ReturnType<typeof createFakeContext>;

  beforeEach(() => {
    vi.resetAllMocks();
    fake = createFakeContext();
    getAudioContext.mockReturnValue(fake.context);
    loadAudioBuffer.mockResolvedValue({ duration: 10 });
    useSoundStore.setState({ enabled: true });
  });

  it('시작하면 반복 재생하고 서서히 키운다', async () => {
    createBgm('bgm.mp3', 0.3).start();
    await flush();

    expect(fake.source.loop).toBe(true);
    expect(fake.source.start).toHaveBeenCalledTimes(1);
    expect(fake.gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.3,
      expect.any(Number),
    );
  });

  it('이미 재생 중이면 다시 시작하지 않는다', async () => {
    const bgm = createBgm('bgm.mp3', 0.3);
    bgm.start();
    await flush();
    bgm.start();
    await flush();

    expect(fake.source.start).toHaveBeenCalledTimes(1);
  });

  it('소리가 꺼져 있으면 재생하지 않는다', async () => {
    useSoundStore.setState({ enabled: false });
    createBgm('bgm.mp3', 0.3).start();
    await flush();

    expect(fake.source.start).not.toHaveBeenCalled();
  });

  it('멈추면 서서히 줄이며 끝낸다', async () => {
    const bgm = createBgm('bgm.mp3', 0.3);
    bgm.start();
    await flush();
    bgm.stop();

    expect(fake.gainNode.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(
      0,
      expect.any(Number),
    );
    expect(fake.source.stop).toHaveBeenCalledTimes(1);
  });

  it('파일을 받는 중에 멈추면 다 받은 뒤에도 재생하지 않는다', async () => {
    const bgm = createBgm('bgm.mp3', 0.3);
    bgm.start();
    bgm.stop();
    await flush();

    expect(fake.source.start).not.toHaveBeenCalled();
  });

  it('파일을 받는 중에 시작-멈춤-시작을 이어서 해도 한 번만 재생한다', async () => {
    const bgm = createBgm('bgm.mp3', 0.3);
    bgm.start();
    bgm.stop();
    bgm.start();
    await flush();

    expect(fake.source.start).toHaveBeenCalledTimes(1);
  });

  it('소리 파일을 못 받거나 오디오를 쓸 수 없으면 조용히 넘어간다', async () => {
    loadAudioBuffer.mockResolvedValue(null);
    const bgm = createBgm('bgm.mp3', 0.3);
    bgm.start();
    await flush();
    expect(fake.source.start).not.toHaveBeenCalled();

    getAudioContext.mockReturnValue(null);
    expect(() => {
      bgm.start();
      bgm.stop();
    }).not.toThrow();
  });
});
