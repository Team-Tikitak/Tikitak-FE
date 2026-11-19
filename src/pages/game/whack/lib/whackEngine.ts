// 탁 잡기 규칙만 담은 순수 로직. 시간 단위는 ms, 구멍은 왼쪽 위부터 0..8번.
export const HOLE_COUNT = 9;
export const GAME_SECONDS = 30;
export const TAK_VARIANTS = 6;

export const WHACK_DIFFICULTIES = ['normal', 'hard'] as const;
export type WhackDifficulty = (typeof WHACK_DIFFICULTIES)[number];

export interface DifficultySettings {
  label: string;
  /** Tak를 잡았을 때 얻는 점수. 어려움은 더 많이 준다 */
  takPoints: number;
  /** 가시 별을 눌렀을 때 깎이는 점수 */
  badPenalty: number;
  badChance: number;
  /** 두더지가 나와 있는 시간(ms): 처음 → 시간이 지날수록 최소까지 줄어든다 */
  startLifetime: number;
  minLifetime: number;
  lifetimeShrinkPerSecond: number;
  /** 새 두더지가 나오는 간격(ms) */
  startInterval: number;
  minInterval: number;
  intervalShrinkPerSecond: number;
}

export const DIFFICULTY_SETTINGS = {
  normal: {
    label: '기본',
    takPoints: 1,
    badPenalty: 2,
    badChance: 0.2,
    startLifetime: 1100,
    minLifetime: 600,
    lifetimeShrinkPerSecond: 14,
    startInterval: 800,
    minInterval: 350,
    intervalShrinkPerSecond: 14,
  },
  hard: {
    label: '어려움',
    takPoints: 2,
    badPenalty: 4,
    badChance: 0.3,
    startLifetime: 800,
    minLifetime: 420,
    lifetimeShrinkPerSecond: 16,
    startInterval: 600,
    minInterval: 260,
    intervalShrinkPerSecond: 16,
  },
} satisfies Record<WhackDifficulty, DifficultySettings>;

export type MoleKind = 'tak' | 'bad';

export interface Mole {
  id: number;
  kind: MoleKind;
  /** Tak 캐릭터 종류 (0..5). bad일 때는 쓰지 않는다 */
  variant: number;
  /** 나와 있는 시간(ms). 들어가는 연출 시작 시점 계산에 쓴다 */
  lifetime: number;
  expiresAt: number;
}

export interface WhackState {
  difficulty: WhackDifficulty;
  holes: (Mole | null)[];
  score: number;
  startedAt: number;
  nextSpawnAt: number;
  nextId: number;
}

export const createWhackState = (
  now: number,
  difficulty: WhackDifficulty = 'normal',
): WhackState => ({
  difficulty,
  holes: Array.from({ length: HOLE_COUNT }, () => null),
  score: 0,
  startedAt: now,
  nextSpawnAt: now + 400,
  nextId: 1,
});

export const isWhackOver = (state: WhackState, now: number) =>
  now - state.startedAt >= GAME_SECONDS * 1000;

export const getRemainingSeconds = (state: WhackState, now: number) =>
  Math.max(0, GAME_SECONDS - (now - state.startedAt) / 1000);

/** 시간이 지날수록 오래 머물지 않고 더 자주 나온다 */
const difficulty = (state: WhackState, now: number) => {
  const elapsed = (now - state.startedAt) / 1000;
  const settings = DIFFICULTY_SETTINGS[state.difficulty];
  return {
    lifetime: Math.max(
      settings.minLifetime,
      settings.startLifetime - elapsed * settings.lifetimeShrinkPerSecond,
    ),
    interval: Math.max(
      settings.minInterval,
      settings.startInterval - elapsed * settings.intervalShrinkPerSecond,
    ),
  };
};

/** 시간이 된 두더지를 넣어 두고, 나올 때가 됐으면 빈 구멍 중 하나에서 새로 내보낸다 */
export const tickWhack = (state: WhackState, now: number, random: () => number = Math.random) => {
  state.holes = state.holes.map((mole) => (mole && mole.expiresAt <= now ? null : mole));
  if (now < state.nextSpawnAt) return;

  const { lifetime, interval } = difficulty(state, now);
  state.nextSpawnAt = now + interval;

  const emptyHoles = state.holes.flatMap((mole, index) => (mole ? [] : [index]));
  if (emptyHoles.length === 0) return;

  const hole = emptyHoles[Math.floor(random() * emptyHoles.length)];
  state.holes[hole] = {
    id: state.nextId,
    kind: random() < DIFFICULTY_SETTINGS[state.difficulty].badChance ? 'bad' : 'tak',
    variant: Math.floor(random() * TAK_VARIANTS),
    lifetime,
    expiresAt: now + lifetime,
  };
  state.nextId += 1;
};

/** 구멍을 눌렀을 때. 맞힌 종류를 돌려주고, 아무것도 없으면 null (점수는 0 아래로 내려가지 않는다) */
export const hitHole = (state: WhackState, index: number): MoleKind | null => {
  const mole = state.holes[index];
  if (!mole) return null;

  state.holes[index] = null;
  const { takPoints, badPenalty } = DIFFICULTY_SETTINGS[state.difficulty];
  state.score =
    mole.kind === 'tak' ? state.score + takPoints : Math.max(0, state.score - badPenalty);
  return mole.kind;
};
