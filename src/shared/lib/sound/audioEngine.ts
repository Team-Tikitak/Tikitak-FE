// 효과음은 파일 없이 Web Audio로 합성한다 (용량·라이선스 부담 없음).
type AudioContextConstructor = typeof AudioContext;

let audioContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Constructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!Constructor) return null;
    try {
      audioContext = new Constructor();
    } catch {
      // 기기가 오디오 컨텍스트를 만들어 주지 않으면 소리만 없이 넘어간다
      return null;
    }
  }
  return audioContext;
};

/**
 * iOS는 사용자의 터치 안에서 한 번 깨워야 소리가 난다. 게임의 첫 입력에서 부른다.
 * 백그라운드에 갔다 오면 suspended 말고 interrupted(타입에는 없는 값)가 되기도 해서,
 * 실행 중이 아니면 모두 다시 깨운다.
 */
export const unlockAudio = () => {
  const context = getAudioContext();
  if (context && context.state !== 'running') {
    context.resume().catch(() => {
      // 이미 닫혔거나 재개할 수 없으면 무시한다
    });
  }
};

interface ToneOptions {
  type?: OscillatorType;
  from: number;
  /** 지정하면 from에서 to로 음높이가 미끄러진다 */
  to?: number;
  duration: number;
  volume?: number;
  delay?: number;
}

export const playTone = (
  context: AudioContext,
  { type = 'sine', from, to, duration, volume = 0.15, delay = 0 }: ToneOptions,
) => {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
};

interface NoiseOptions {
  filter: BiquadFilterType;
  frequency: number;
  duration: number;
  volume?: number;
  delay?: number;
}

const getNoiseBuffer = (context: AudioContext) => {
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

export const playNoise = (
  context: AudioContext,
  { filter, frequency, duration, volume = 0.2, delay = 0 }: NoiseOptions,
) => {
  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  const biquad = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = getNoiseBuffer(context);
  biquad.type = filter;
  biquad.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(biquad).connect(gain).connect(context.destination);
  source.start(start);
  source.stop(start + duration);
};

const decodedBuffers = new Map<string, AudioBuffer>();
const pendingBuffers = new Map<string, Promise<AudioBuffer | null>>();

/** 이미 불러온 소리 파일. 아직이면 null이라 호출하는 쪽이 합성음으로 대신한다 */
export const getLoadedBuffer = (url: string): AudioBuffer | null => decodedBuffers.get(url) ?? null;

/** 소리 파일을 미리 내려받아 디코딩해 둔다. 실패하면 null을 돌려주고 합성음으로 대신한다 */
export const loadAudioBuffer = (url: string): Promise<AudioBuffer | null> => {
  const cached = decodedBuffers.get(url);
  if (cached) return Promise.resolve(cached);

  const pending = pendingBuffers.get(url);
  if (pending) return pending;

  const context = getAudioContext();
  if (!context) return Promise.resolve(null);

  const request = fetch(url)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      decodedBuffers.set(url, buffer);
      return buffer;
    })
    .catch(() => {
      // 다음에 다시 시도할 수 있게 실패한 요청은 지운다
      pendingBuffers.delete(url);
      return null;
    });
  pendingBuffers.set(url, request);
  return request;
};

interface SliceOptions {
  /** 스프라이트 안에서 재생을 시작할 위치(초) */
  offset: number;
  duration: number;
  /** 재생 속도. 높이면 음도 같이 올라간다 */
  rate?: number;
  volume?: number;
  filter?: { type: BiquadFilterType; frequency: number };
}

export const playSlice = (
  context: AudioContext,
  buffer: AudioBuffer,
  { offset, duration, rate = 1, volume = 1, filter }: SliceOptions,
) => {
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  gain.gain.value = volume;

  if (filter) {
    const biquad = context.createBiquadFilter();
    biquad.type = filter.type;
    biquad.frequency.value = filter.frequency;
    source.connect(biquad).connect(gain);
  } else {
    source.connect(gain);
  }
  gain.connect(context.destination);
  source.start(0, offset, duration);
};
