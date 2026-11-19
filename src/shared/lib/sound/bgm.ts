import { useSoundStore } from '@/shared/stores/soundStore';
import { getAudioContext, loadAudioBuffer } from './audioEngine';

const FADE_SECONDS = 0.4;

interface PlayingBgm {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export interface Bgm {
  /** 반복 재생을 시작한다. 소리가 꺼져 있거나 이미 재생 중이면 아무것도 하지 않는다 */
  start: () => void;
  /** 서서히 줄이며 멈춘다 */
  stop: () => void;
  /** 소리 파일을 미리 내려받아 둔다 */
  preload: () => void;
}

/**
 * 배경음악 하나를 반복 재생한다. 효과음처럼 Web Audio로 재생하며, 소리 파일을 못 받으면 조용히 넘어간다.
 * 사용자의 터치 뒤(`unlockAudio` 이후)에 `start`를 불러야 iOS에서 소리가 난다.
 */
export const createBgm = (url: string, volume: number): Bgm => {
  let playing: PlayingBgm | null = null;
  // 파일을 받는 동안 stop이 불리면 다 받은 뒤에 재생하지 않도록 구분한다
  let session = 0;

  const stop = () => {
    session += 1;
    const current = playing;
    playing = null;
    const context = getAudioContext();
    if (!current || !context) return;

    const end = context.currentTime + FADE_SECONDS;
    current.gain.gain.cancelScheduledValues(context.currentTime);
    current.gain.gain.setValueAtTime(current.gain.gain.value, context.currentTime);
    current.gain.gain.linearRampToValueAtTime(0, end);
    try {
      current.source.stop(end);
    } catch {
      // 이미 멈춘 소리는 무시한다
    }
  };

  const start = () => {
    if (playing || !useSoundStore.getState().enabled) return;
    const context = getAudioContext();
    if (!context) return;

    session += 1;
    const mySession = session;
    void loadAudioBuffer(url).then((buffer) => {
      if (!buffer || mySession !== session || playing) return;
      if (!useSoundStore.getState().enabled) return;

      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(volume, context.currentTime + FADE_SECONDS);
      source.connect(gain).connect(context.destination);
      source.start(0);
      playing = { source, gain };
    });
  };

  return {
    start,
    stop,
    preload: () => void loadAudioBuffer(url),
  };
};
