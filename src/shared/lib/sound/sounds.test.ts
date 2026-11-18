import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundStore } from '@/shared/stores/soundStore';
import { playSound, preloadKeySounds } from './sounds';

const { getAudioContext, getLoadedBuffer, loadAudioBuffer, playSlice, playTone, playNoise } =
  vi.hoisted(() => ({
    getAudioContext: vi.fn(),
    getLoadedBuffer: vi.fn(),
    loadAudioBuffer: vi.fn(),
    playSlice: vi.fn(),
    playTone: vi.fn(),
    playNoise: vi.fn(),
  }));

vi.mock('./audioEngine', () => ({
  getAudioContext,
  getLoadedBuffer,
  loadAudioBuffer,
  playSlice,
  playTone,
  playNoise,
}));

describe('playSound', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getAudioContext.mockReturnValue({});
    getLoadedBuffer.mockReturnValue(null);
    useSoundStore.setState({ enabled: true, keySwitch: 'thock' });
  });

  it('소리가 꺼져 있으면 아무것도 재생하지 않는다', () => {
    useSoundStore.setState({ enabled: false });
    playSound('flap');
    expect(playTone).not.toHaveBeenCalled();
  });

  it('오디오를 쓸 수 없는 환경에서는 조용히 넘어간다', () => {
    getAudioContext.mockReturnValue(null);
    expect(() => playSound('crash')).not.toThrow();
    expect(playTone).not.toHaveBeenCalled();
  });

  it('rate로 음높이를 바꾼다', () => {
    playSound('flap', { rate: 2 });
    expect(playTone).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ from: 760 }),
    );
  });

  it('재생 중 오류가 나도 예외를 던지지 않는다', () => {
    playTone.mockImplementation(() => {
      throw new Error('audio error');
    });
    expect(() => playSound('score')).not.toThrow();
  });

  it('키 소리는 선택한 스위치에 따라 달라진다', () => {
    useSoundStore.setState({ keySwitch: 'clack' });
    playSound('keyMine');
    expect(playNoise).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ frequency: 4200 }),
    );
  });

  it('실제 키 소리 녹음이 준비되어 있으면 합성음 대신 녹음을 쓴다', () => {
    const buffer = {};
    getLoadedBuffer.mockReturnValue(buffer);

    playSound('keyMine');

    expect(playSlice).toHaveBeenCalledWith(
      expect.anything(),
      buffer,
      expect.objectContaining({ duration: 0.18 }),
    );
    expect(playTone).not.toHaveBeenCalled();
  });

  it('스위치 종류에 따라 같은 녹음의 재생 속도가 달라진다', () => {
    getLoadedBuffer.mockReturnValue({});
    const rateOf = () => playSlice.mock.calls.at(-1)?.[2].rate as number;

    useSoundStore.setState({ keySwitch: 'thock' });
    playSound('keyMine');
    const thock = rateOf();
    useSoundStore.setState({ keySwitch: 'clack' });
    playSound('keyMine');

    expect(thock).toBeLessThan(rateOf());
  });

  it('컴퓨터가 누른 키는 더 작은 소리로 낸다', () => {
    getLoadedBuffer.mockReturnValue({});

    playSound('keyMine');
    playSound('keyBot');

    const [mine, bot] = playSlice.mock.calls.map((call) => call[2].volume as number);
    expect(bot).toBeLessThan(mine);
  });

  it('뗄 때 소리는 누를 때보다 짧고 작게 같은 녹음으로 낸다', () => {
    getLoadedBuffer.mockReturnValue({});

    playSound('keyMine');
    playSound('keyRelease');

    const [press, release] = playSlice.mock.calls.map((call) => call[2]);
    expect(release.duration).toBeLessThan(press.duration);
    expect(release.volume).toBeLessThan(press.volume);
    expect(release.rate).toBeGreaterThan(press.rate);
  });

  it('녹음이 없으면 뗄 때 소리도 합성음으로 대신한다', () => {
    playSound('keyRelease');

    expect(playSlice).not.toHaveBeenCalled();
    expect(playNoise).toHaveBeenCalled();
  });

  it('또각 모드는 별도의 기계식 키보드 녹음 한 쌍(누름+뗌)을 통째로 낸다', () => {
    getLoadedBuffer.mockImplementation((url: string) => ({ url }));
    useSoundStore.setState({ keySwitch: 'tok' });

    playSound('keyMine');

    const [, buffer, options] = playSlice.mock.calls[0];
    expect(buffer.url).toContain('keypress-tok-sprite');
    expect(options.duration).toBe(0.26);
    expect(playTone).not.toHaveBeenCalled();
  });

  it('또각 모드는 따로 뗄 때 소리를 내지 않는다(녹음에 이미 들어 있다)', () => {
    getLoadedBuffer.mockReturnValue({});
    useSoundStore.setState({ keySwitch: 'tok' });

    playSound('keyRelease');

    expect(playSlice).not.toHaveBeenCalled();
    expect(playNoise).not.toHaveBeenCalled();
  });

  it('또각 모드는 녹음이 없으면 합성 딸깍으로 대신한다', () => {
    useSoundStore.setState({ keySwitch: 'tok' });

    playSound('keyMine');

    expect(playSlice).not.toHaveBeenCalled();
    expect(playTone).toHaveBeenCalled();
  });

  it('두 종류의 녹음을 모두 미리 불러온다', () => {
    preloadKeySounds();

    expect(loadAudioBuffer).toHaveBeenCalledTimes(2);
  });
});
