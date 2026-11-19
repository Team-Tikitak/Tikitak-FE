// 플래피 버드 규칙만 담은 순수 로직. 좌표 단위는 가상 캔버스 px, 시간은 초.
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;
export const GROUND_HEIGHT = 64;
export const BIRD_X = 96;
export const BIRD_RADIUS = 16;
export const PIPE_WIDTH = 44;
export const PIPE_GAP = 180;
export const GRAVITY = 1500;
export const FLAP_VELOCITY = -460;
export const PIPE_SPEED = 150;
export const PIPE_SPAWN_INTERVAL = 1.5;
const GAP_MARGIN = 90;

export interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
  /** 0~1. 장애물마다 붙는 스티커를 정하는 값 (규칙과 무관한 연출용) */
  seed: number;
}

export interface GameState {
  y: number;
  velocity: number;
  pipes: Pipe[];
  score: number;
  sinceSpawn: number;
}

export const createGameState = (): GameState => ({
  y: GAME_HEIGHT / 2,
  velocity: 0,
  pipes: [],
  score: 0,
  // 시작하자마자 첫 파이프가 나오도록 한 주기를 채워 둔다
  sinceSpawn: PIPE_SPAWN_INTERVAL,
});

export const flap = (state: GameState) => {
  state.velocity = FLAP_VELOCITY;
};

const hitsPipe = (state: GameState, pipe: Pipe) => {
  const overlapsX = BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
  if (!overlapsX) return false;
  const gapTop = pipe.gapY - PIPE_GAP / 2;
  const gapBottom = pipe.gapY + PIPE_GAP / 2;
  return state.y - BIRD_RADIUS < gapTop || state.y + BIRD_RADIUS > gapBottom;
};

/** 한 프레임을 진행하고 게임이 끝났으면 true. random은 테스트에서 고정값을 넣기 위해 받는다. */
export const stepGame = (state: GameState, dt: number, random: () => number = Math.random) => {
  state.velocity += GRAVITY * dt;
  state.y += state.velocity * dt;

  state.sinceSpawn += dt;
  if (state.sinceSpawn >= PIPE_SPAWN_INTERVAL) {
    state.sinceSpawn = 0;
    // 땅 위에서만 틈이 생기도록 범위에서 땅 높이를 뺀다
    const range = GAME_HEIGHT - GROUND_HEIGHT - GAP_MARGIN * 2;
    const gapY = GAP_MARGIN + random() * range;
    state.pipes.push({ x: GAME_WIDTH, gapY, passed: false, seed: random() });
  }

  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED * dt;
    if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
      pipe.passed = true;
      state.score += 1;
    }
  }
  state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

  if (state.y - BIRD_RADIUS < 0 || state.y + BIRD_RADIUS > GAME_HEIGHT - GROUND_HEIGHT) return true;
  return state.pipes.some((pipe) => hitsPipe(state, pipe));
};

/** 게임 오버 뒤 새가 땅까지 떨어지는 연출용. 규칙에는 영향이 없다. */
export const stepFall = (state: GameState, dt: number) => {
  const floor = GAME_HEIGHT - GROUND_HEIGHT - BIRD_RADIUS;
  if (state.y >= floor) {
    state.y = floor;
    return;
  }
  state.velocity += GRAVITY * dt;
  state.y = Math.min(floor, state.y + state.velocity * dt);
};
