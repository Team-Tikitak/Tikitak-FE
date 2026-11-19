import { KEYCAP_STAGE_LABELS } from '@/shared/lib/game/keycapScore';

// 티키타닥 규칙만 담은 순수 로직. 시간 단위는 ms.
export type KeyTone = 'white' | 'blue' | 'pink';

/** 글자 대신 키캡에 새기는 티키탁 스티커·캐릭터 (그림은 화면 쪽에서 연결한다) */
export type KeyArt = 'sun' | 'flower' | 'ball' | 'blossom' | 'tak';

export interface KeyLayout {
  /** 한 줄(10칸) 안에서 차지하는 칸 수 */
  span: number;
  /** 키캡에 새긴 글자. 없으면 비워 둔다 */
  main?: string;
  /** 한글 보조 글자 (영문 글자 아래 오른쪽) */
  sub?: string;
  art?: KeyArt;
  tone: KeyTone;
}

/**
 * 키보드 배열. 한 줄은 칸 수의 합이 10이고, 왼쪽부터 오른쪽으로, 위 줄부터 아래 줄로 이어 붙인다.
 * 글자 배치는 실제 한글 자판을 따른다.
 */
export const KEY_LAYOUT: KeyLayout[] = [
  { span: 2, main: 'Q', sub: 'ㅂ', tone: 'white' },
  { span: 2, main: 'W', sub: 'ㅈ', tone: 'white' },
  { span: 2, art: 'sun', tone: 'white' },
  { span: 2, main: 'R', sub: 'ㄱ', tone: 'white' },
  { span: 2, art: 'flower', tone: 'white' },
  { span: 3, main: 'Tab', tone: 'blue' },
  { span: 2, main: 'A', sub: 'ㅁ', tone: 'white' },
  { span: 2, main: 'S', sub: 'ㄴ', tone: 'pink' },
  { span: 3, main: 'Enter', tone: 'blue' },
  { span: 2, main: 'Z', sub: 'ㅋ', tone: 'white' },
  { span: 2, main: 'X', sub: 'ㅌ', tone: 'pink' },
  { span: 2, main: 'C', sub: 'ㅊ', tone: 'white' },
  { span: 2, art: 'ball', tone: 'white' },
  { span: 2, main: 'B', sub: 'ㅠ', tone: 'white' },
  { span: 2, main: 'Ctrl', tone: 'blue' },
  { span: 6, art: 'tak', tone: 'pink' },
  { span: 2, art: 'blossom', tone: 'blue' },
];
export const KEY_COUNT = KEY_LAYOUT.length;
/** 한 단계(한 판)의 길이 */
export const GAME_SECONDS = 20;

export interface Stage {
  label: string;
  /** 컴퓨터가 켜진 키를 가져가기까지 걸리는 시간: 판이 시작될 때 → 끝날 때로 갈수록 줄어든다 */
  botStart: number;
  botMin: number;
  botJitter: number;
  /** 동시에 켜지는 키캡 수 */
  maxLit: number;
}

/** 위로 갈수록 컴퓨터가 빠르다. 초고수는 사람의 반응 속도에 가까워 거의 이기기 어렵다. */
export const STAGES: Stage[] = [
  { label: KEYCAP_STAGE_LABELS[0], botStart: 1400, botMin: 800, botJitter: 350, maxLit: 3 },
  { label: KEYCAP_STAGE_LABELS[1], botStart: 1100, botMin: 600, botJitter: 300, maxLit: 3 },
  { label: KEYCAP_STAGE_LABELS[2], botStart: 850, botMin: 450, botJitter: 250, maxLit: 4 },
  { label: KEYCAP_STAGE_LABELS[3], botStart: 520, botMin: 300, botJitter: 120, maxLit: 4 },
];

const RELEASE_MS = 450;
const LIGHT_INTERVAL_MS = 250;

export type KeyOwner = 'me' | 'bot';
export type KeyPhase = 'idle' | 'lit' | 'claimed';

export interface Keycap {
  phase: KeyPhase;
  /** claimed일 때 누가 가져갔는지 */
  owner: KeyOwner | null;
  /** lit일 때 컴퓨터가 이 시각에 가져간다 */
  botAt: number;
  /** claimed일 때 이 시각에 다시 idle로 돌아간다 */
  releaseAt: number;
}

export interface KeycapState {
  stage: Stage;
  keys: Keycap[];
  me: number;
  bot: number;
  startedAt: number;
  nextLightAt: number;
}

export type PressResult = 'hit' | 'miss' | null;
export type Outcome = 'win' | 'lose' | 'draw';

const idleKey = (): Keycap => ({ phase: 'idle', owner: null, botAt: 0, releaseAt: 0 });

export const createKeycapState = (now: number, stage: Stage = STAGES[0]): KeycapState => ({
  stage,
  keys: Array.from({ length: KEY_COUNT }, idleKey),
  me: 0,
  bot: 0,
  startedAt: now,
  nextLightAt: now + 500,
});

export const isKeycapOver = (state: KeycapState, now: number) =>
  now - state.startedAt >= GAME_SECONDS * 1000;

export const getRemainingSeconds = (state: KeycapState, now: number) =>
  Math.max(0, GAME_SECONDS - (now - state.startedAt) / 1000);

/** 컴퓨터는 판이 진행될수록 반응이 빨라지고, 단계가 높을수록 처음부터 빠르다 */
const botDelay = (state: KeycapState, now: number, random: () => number) => {
  const { botStart, botMin, botJitter } = state.stage;
  const progress = Math.min(1, (now - state.startedAt) / (GAME_SECONDS * 1000));
  return botMin + (botStart - botMin) * (1 - progress) + random() * botJitter;
};

/** 컴퓨터가 가져간 키캡 번호들을 돌려준다 (소리를 내기 위해) */
export const tickKeycap = (
  state: KeycapState,
  now: number,
  random: () => number = Math.random,
): number[] => {
  const botClaims: number[] = [];

  state.keys.forEach((key, index) => {
    if (key.phase === 'claimed' && key.releaseAt <= now) {
      state.keys[index] = idleKey();
    } else if (key.phase === 'lit' && key.botAt <= now) {
      state.keys[index] = { phase: 'claimed', owner: 'bot', botAt: 0, releaseAt: now + RELEASE_MS };
      state.bot += 1;
      botClaims.push(index);
    }
  });

  const litCount = state.keys.filter((key) => key.phase === 'lit').length;
  if (litCount < state.stage.maxLit && now >= state.nextLightAt) {
    const idleIndexes = state.keys.flatMap((key, index) => (key.phase === 'idle' ? [index] : []));
    if (idleIndexes.length > 0) {
      const index = idleIndexes[Math.floor(random() * idleIndexes.length)];
      state.keys[index] = {
        phase: 'lit',
        owner: null,
        botAt: now + botDelay(state, now, random),
        releaseAt: 0,
      };
    }
    state.nextLightAt = now + LIGHT_INTERVAL_MS;
  }

  return botClaims;
};

/**
 * 키캡을 눌렀을 때. 켜진 키면 가져오고(hit), 꺼진 키를 누르면 1점 감점(miss).
 * 이미 누군가 가져간 키는 늦게 누른 것이라 아무 일도 없다(null).
 */
export const pressKeycap = (state: KeycapState, index: number, now: number): PressResult => {
  const key = state.keys[index];
  if (!key || key.phase === 'claimed') return null;

  if (key.phase === 'lit') {
    state.keys[index] = { phase: 'claimed', owner: 'me', botAt: 0, releaseAt: now + RELEASE_MS };
    state.me += 1;
    return 'hit';
  }

  state.me = Math.max(0, state.me - 1);
  return 'miss';
};

/** 이기려면 컴퓨터보다 많아야 한다. 비기면 다음 단계로 못 간다. */
export const getOutcome = (state: KeycapState): Outcome => {
  if (state.me > state.bot) return 'win';
  if (state.me < state.bot) return 'lose';
  return 'draw';
};
