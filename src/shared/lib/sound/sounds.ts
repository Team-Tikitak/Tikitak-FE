import keySpriteUrl from '@/shared/assets/Sound/keypress-sprite.wav';
import tokSpriteUrl from '@/shared/assets/Sound/keypress-tok-sprite.wav';
import impossibleStingUrl from '@/shared/assets/Sound/sting-impossible.mp3';
import { useSoundStore, type KeySwitch } from '@/shared/stores/soundStore';
import {
  getAudioContext,
  getLoadedBuffer,
  loadAudioBuffer,
  playNoise,
  playSlice,
  playTone,
} from './audioEngine';

export const SOUND_NAMES = [
  'flap',
  'score',
  'crash',
  'whackHit',
  'whackBad',
  'whackPop',
  'tick',
  'finish',
  'keyMine',
  'keyBot',
  'keyRelease',
  'keyMiss',
  'impossible',
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

interface PlayOptions {
  /** 음높이 배율. 1이 기본이고 점수가 오를수록 올리는 식으로 쓴다 */
  rate?: number;
}

// 녹음이 없을 때 대신 내는 합성음: [몸통 음높이, 몸통 길이, 딸깍 잡음 높이, 잡음 길이, 몸통 파형]
const KEY_FALLBACK_SOUNDS = {
  thock: { body: 150, bodyDuration: 0.09, click: 1800, clickDuration: 0.02, type: 'sine' },
  clack: { body: 260, bodyDuration: 0.06, click: 4200, clickDuration: 0.035, type: 'triangle' },
} satisfies Record<
  string,
  { body: number; bodyDuration: number; click: number; clickDuration: number; type: OscillatorType }
>;

interface KeySprite {
  url: string;
  /** 스프라이트 안의 칸 수와 칸 하나의 길이(초). 소리 파일을 바꾸면 함께 바꾼다 */
  slots: number;
  slotSeconds: number;
}

// 실제 키보드 녹음 스프라이트 (출처와 가공 방법: src/shared/assets/Sound/README.md)
const TOPRE_SPRITE: KeySprite = { url: keySpriteUrl, slots: 16, slotSeconds: 0.18 };
// 기계식 키보드를 눌렀다 떼는 한 쌍("또각")을 통째로 잘라 둔 것이라 칸이 더 길다
const CLACKY_SPRITE: KeySprite = { url: tokSpriteUrl, slots: 5, slotSeconds: 0.26 };

interface KeyFlavor {
  sprite: KeySprite;
  /** 같은 녹음을 재생 속도와 필터로 다르게 들리게 한다 */
  rate: number;
  volume: number;
  filter?: { type: BiquadFilterType; frequency: number };
  /** 녹음이 없을 때 대신 낼 합성음 */
  fallback: keyof typeof KEY_FALLBACK_SOUNDS;
}

const KEY_FLAVORS: Record<KeySwitch, KeyFlavor> = {
  tok: { sprite: CLACKY_SPRITE, rate: 1, volume: 1, fallback: 'clack' },
  thock: {
    sprite: TOPRE_SPRITE,
    rate: 0.86,
    volume: 1,
    filter: { type: 'lowpass', frequency: 3200 },
    fallback: 'thock',
  },
  clack: { sprite: TOPRE_SPRITE, rate: 1.3, volume: 0.9, fallback: 'clack' },
  creamy: {
    sprite: TOPRE_SPRITE,
    rate: 1,
    volume: 1,
    filter: { type: 'lowpass', frequency: 4600 },
    fallback: 'thock',
  },
};

/** 키 소리 녹음을 미리 불러와 둔다. 아직 못 불러왔으면 그동안은 합성음으로 대신한다 */
export const preloadKeySounds = () => {
  void loadAudioBuffer(TOPRE_SPRITE.url);
  void loadAudioBuffer(CLACKY_SPRITE.url);
  void loadAudioBuffer(impossibleStingUrl);
};

const keyPress = (context: AudioContext, keySwitch: KeySwitch, rate: number, volume = 1) => {
  const flavor = KEY_FLAVORS[keySwitch];
  const buffer = getLoadedBuffer(flavor.sprite.url);

  if (buffer) {
    const slot = Math.floor(Math.random() * flavor.sprite.slots);
    playSlice(context, buffer, {
      offset: slot * flavor.sprite.slotSeconds,
      duration: flavor.sprite.slotSeconds,
      rate: flavor.rate * rate * (0.95 + Math.random() * 0.1),
      volume: flavor.volume * volume * (0.9 + Math.random() * 0.1),
      filter: flavor.filter,
    });
    return;
  }

  const sound = KEY_FALLBACK_SOUNDS[flavor.fallback];
  const jitter = rate * (0.94 + Math.random() * 0.12);
  playTone(context, {
    type: sound.type,
    from: sound.body * jitter,
    to: sound.body * jitter * 0.55,
    duration: sound.bodyDuration,
    volume: 0.35 * volume,
  });
  playNoise(context, {
    filter: 'highpass',
    frequency: sound.click,
    duration: sound.clickDuration,
    volume: 0.25 * volume,
  });
};

/**
 * 키에서 손가락을 뗄 때 나는 짧고 작은 "톡".
 * 또각 모드는 녹음 한 조각에 누르고 떼는 소리가 모두 들어 있어서 따로 내지 않는다.
 */
const keyRelease = (context: AudioContext, keySwitch: KeySwitch) => {
  const flavor = KEY_FLAVORS[keySwitch];
  if (flavor.sprite === CLACKY_SPRITE) return;

  const buffer = getLoadedBuffer(flavor.sprite.url);
  if (buffer) {
    const slot = Math.floor(Math.random() * flavor.sprite.slots);
    playSlice(context, buffer, {
      // 소리의 앞부분(누르는 순간의 타격)은 빼고 뒤쪽 울림만 짧게 쓴다
      offset: slot * flavor.sprite.slotSeconds + 0.01,
      duration: 0.07,
      rate: flavor.rate * (1.45 + Math.random() * 0.1),
      volume: 0.35,
      filter: { type: 'highpass', frequency: 700 },
    });
    return;
  }

  playNoise(context, { filter: 'highpass', frequency: 3200, duration: 0.012, volume: 0.1 });
  playTone(context, { from: 420, to: 260, duration: 0.03, volume: 0.08 });
};

/**
 * 불가능 도전 선택 화면의 긴장감 있는 효과음. 녹음이 아직 없을 때 대신 내는 합성음(약 3초)은 화면 연출의 타이밍에 맞춰 둔다:
 * 심장 박동이 빨라지며 낮은 소리가 차오르다가(0~1.5초) VS가 부딪히는 순간 쿵(1.5초),
 * 말풍선이 나올 때 불길한 불협화음(2.1초).
 */
const impossibleSting = (context: AudioContext) => {
  // 실제 녹음(약 9초)이 준비돼 있으면 그것을 낸다. 아직이면 아래의 합성음으로 대신한다
  const recording = getLoadedBuffer(impossibleStingUrl);
  if (recording) {
    // 너무 크지 않게 볼륨만 낮춘다. 음 높이와 부드러운 음색은 파일을 만들 때 미리 처리해 두었다
    // (재생 때 속도를 바꾸거나 필터를 겹치면 칩튠 소리가 깨져 들린다)
    playSlice(context, recording, { offset: 0, duration: recording.duration, volume: 0.25 });
    return;
  }

  const start = context.currentTime;

  // 낮은 소리가 점점 크고 높아지며 차오른다
  const swell = context.createOscillator();
  const swellFilter = context.createBiquadFilter();
  const swellGain = context.createGain();
  swell.type = 'sawtooth';
  swell.frequency.setValueAtTime(70, start);
  swell.frequency.exponentialRampToValueAtTime(240, start + 1.5);
  swellFilter.type = 'lowpass';
  swellFilter.frequency.setValueAtTime(250, start);
  swellFilter.frequency.exponentialRampToValueAtTime(1600, start + 1.5);
  swellGain.gain.setValueAtTime(0.0001, start);
  swellGain.gain.exponentialRampToValueAtTime(0.06, start + 1.45);
  swellGain.gain.exponentialRampToValueAtTime(0.0001, start + 1.55);
  swell.connect(swellFilter).connect(swellGain).connect(context.destination);
  swell.start(start);
  swell.stop(start + 1.6);

  // 점점 빨라지는 심장 박동
  [0, 0.5, 0.9, 1.2, 1.4].forEach((delay) =>
    playTone(context, { from: 75, to: 42, duration: 0.2, volume: 0.18, delay }),
  );

  // VS가 부딪히는 순간의 쿵
  playTone(context, { from: 150, to: 32, duration: 0.8, volume: 0.28, delay: 1.5 });
  playNoise(context, {
    filter: 'lowpass',
    frequency: 1400,
    duration: 0.5,
    volume: 0.2,
    delay: 1.5,
  });

  // 말풍선이 나올 때의 묵직한 한 방(부드러운 파형이라 너무 무섭지 않게)
  playTone(context, { type: 'triangle', from: 233, duration: 0.9, volume: 0.06, delay: 2.1 });
  playTone(context, { type: 'triangle', from: 247, duration: 0.9, volume: 0.06, delay: 2.1 });
  playTone(context, { type: 'triangle', from: 116, duration: 0.9, volume: 0.08, delay: 2.1 });
};

const SOUNDS: Record<SoundName, (context: AudioContext, rate: number) => void> = {
  flap: (context, rate) =>
    playTone(context, { from: 380 * rate, to: 720 * rate, duration: 0.09, volume: 0.12 }),
  score: (context, rate) => {
    playTone(context, { type: 'triangle', from: 880 * rate, duration: 0.08, volume: 0.15 });
    playTone(context, {
      type: 'triangle',
      from: 1320 * rate,
      duration: 0.12,
      volume: 0.12,
      delay: 0.07,
    });
  },
  crash: (context) => {
    playTone(context, { type: 'sawtooth', from: 220, to: 55, duration: 0.3, volume: 0.2 });
    playNoise(context, { filter: 'lowpass', frequency: 900, duration: 0.25, volume: 0.3 });
  },
  // 두더지를 잡는 만화 같은 타격음: 묵직한 '퍽' + 짧은 충격 + 맞은 쪽이 내는 '뿅'
  whackHit: (context, rate) => {
    playTone(context, { from: 190, to: 55, duration: 0.1, volume: 0.4 });
    playNoise(context, { filter: 'lowpass', frequency: 1600, duration: 0.05, volume: 0.3 });
    playTone(context, {
      from: 620 * rate,
      to: 1150 * rate,
      duration: 0.08,
      volume: 0.11,
      delay: 0.03,
    });
  },
  // 가시 별을 누르면 우스꽝스럽게 '보잉' 하고 울린다
  whackBad: (context) => {
    playTone(context, { type: 'triangle', from: 340, to: 170, duration: 0.17, volume: 0.22 });
    playTone(context, {
      type: 'triangle',
      from: 250,
      to: 110,
      duration: 0.2,
      volume: 0.2,
      delay: 0.09,
    });
    playNoise(context, { filter: 'lowpass', frequency: 700, duration: 0.06, volume: 0.2 });
  },
  // 두더지가 구멍에서 쏙 올라오는 소리
  whackPop: (context, rate) =>
    playTone(context, { from: 240 * rate, to: 520 * rate, duration: 0.07, volume: 0.07 }),
  tick: (context) =>
    playTone(context, { type: 'square', from: 1000, duration: 0.03, volume: 0.06 }),
  finish: (context) => {
    [523, 659, 784].forEach((frequency, index) =>
      playTone(context, {
        type: 'triangle',
        from: frequency,
        duration: 0.16,
        volume: 0.15,
        delay: index * 0.1,
      }),
    );
  },
  keyMine: (context, rate) => keyPress(context, useSoundStore.getState().keySwitch, rate),
  keyBot: (context, rate) =>
    keyPress(context, useSoundStore.getState().keySwitch, rate * 0.9, 0.55),
  keyRelease: (context) => keyRelease(context, useSoundStore.getState().keySwitch),
  keyMiss: (context) =>
    playTone(context, { type: 'square', from: 140, duration: 0.08, volume: 0.1 }),
  impossible: impossibleSting,
};

/** 소리가 꺼져 있거나 재생할 수 없는 환경이면 조용히 넘어간다. 효과음은 부가 요소라 실패해도 게임을 막지 않는다. */
export const playSound = (name: SoundName, { rate = 1 }: PlayOptions = {}) => {
  if (!useSoundStore.getState().enabled) return;
  const context = getAudioContext();
  if (!context) return;
  try {
    SOUNDS[name](context, rate);
  } catch {
    // 재생 실패는 무시한다
  }
};
