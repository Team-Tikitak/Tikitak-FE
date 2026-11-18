// 탁 잡기 규칙만 담은 순수 로직. 시간 단위는 ms, 구멍은 왼쪽 위부터 0..8번.
export const HOLE_COUNT = 9;
export const GAME_SECONDS = 30;
export const TAK_VARIANTS = 6;
export const BAD_PENALTY = 2;

const BAD_CHANCE = 0.2;
const START_LIFETIME = 1100;
const MIN_LIFETIME = 600;
const START_INTERVAL = 800;
const MIN_INTERVAL = 350;

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
  holes: (Mole | null)[];
  score: number;
  startedAt: number;
  nextSpawnAt: number;
  nextId: number;
}

export const createWhackState = (now: number): WhackState => ({
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
  return {
    lifetime: Math.max(MIN_LIFETIME, START_LIFETIME - elapsed * 14),
    interval: Math.max(MIN_INTERVAL, START_INTERVAL - elapsed * 14),
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
    kind: random() < BAD_CHANCE ? 'bad' : 'tak',
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
  state.score = mole.kind === 'tak' ? state.score + 1 : Math.max(0, state.score - BAD_PENALTY);
  return mole.kind;
};
