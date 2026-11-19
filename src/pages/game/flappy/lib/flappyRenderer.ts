import {
  BIRD_X,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_WIDTH,
  type GameState,
} from './flappyEngine';
import type { GameAssets } from './flappyAssets';

type GameStatus = 'ready' | 'playing' | 'over';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

/** 규칙과 무관한 연출 상태 (배경 스크롤, 먼지, 충돌 효과) */
export interface FxState {
  time: number;
  scroll: number;
  particles: Particle[];
  flash: number;
  shake: number;
  /** 점수가 오른 직후 숫자가 튀어 오르는 남은 시간 */
  scorePop: number;
}

const BIRD_WIDTH = 60;
const FLOWER_SIZE = 70;
const STEM_INSET = 6;
const MAX_TILT = 0.5;
// 티키탁 캐릭터·스티커와 같은 납작한 색 면만 쓴다 (그라데이션·테두리·그림자 없음)
const COLOR = {
  sky: '#38bdf8',
  hill: '#7ed4fa',
  cloud: '#ffffff',
  sun: '#ffd93d',
  stem: '#6ee7b7',
  stemStripe: '#a8f0d4',
  grass: '#6ee7b7',
  soil: '#ffd93d',
  soilStripe: '#ffb000',
  ink: '#1f2937',
};
const GROUND_TOP = GAME_HEIGHT - GROUND_HEIGHT;
const FLASH_SECONDS = 0.35;
const SHAKE_SECONDS = 0.3;
const SHAKE_PX = 8;
export const SCORE_POP_SECONDS = 0.2;
const READY_DRIFT_SPEED = 40;
const CLOUDS = [
  { x: 40, y: 90, size: 1 },
  { x: 210, y: 150, size: 0.7 },
  { x: 330, y: 60, size: 0.85 },
  { x: 130, y: 250, size: 0.6 },
];

export const createFx = (): FxState => ({
  time: 0,
  scroll: 0,
  particles: [],
  flash: 0,
  shake: 0,
  scorePop: 0,
});

export const updateFx = (fx: FxState, dt: number, status: GameStatus) => {
  fx.time += dt;
  const speed = status === 'playing' ? PIPE_SPEED : status === 'ready' ? READY_DRIFT_SPEED : 0;
  fx.scroll += speed * dt;
  fx.flash = Math.max(0, fx.flash - dt);
  fx.shake = Math.max(0, fx.shake - dt);
  fx.scorePop = Math.max(0, fx.scorePop - dt);

  for (const particle of fx.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 500 * dt;
  }
  fx.particles = fx.particles.filter((particle) => particle.life > 0);
};

export const spawnFlapPuffs = (fx: FxState, birdY: number) => {
  for (let i = 0; i < 4; i += 1) {
    fx.particles.push({
      x: BIRD_X - 14,
      y: birdY + 8 + Math.random() * 8,
      vx: -50 - Math.random() * 60,
      vy: 20 + Math.random() * 40,
      life: 0.35,
      maxLife: 0.35,
      radius: 4 + Math.random() * 3,
      color: '#ffffff',
    });
  }
};

export const triggerDeathFx = (fx: FxState, birdY: number) => {
  fx.flash = FLASH_SECONDS;
  fx.shake = SHAKE_SECONDS;
  const colors = ['#fde047', '#38bdf8', '#ffffff', '#f9a8d4'];
  for (let i = 0; i < 14; i += 1) {
    const angle = (Math.PI * 2 * i) / 14;
    const speed = 120 + Math.random() * 140;
    fx.particles.push({
      x: BIRD_X,
      y: birdY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 0.6,
      maxLife: 0.6,
      radius: 3 + Math.random() * 3,
      color: colors[i % colors.length],
    });
  }
};

// 화면 밖으로 나가면 반대편에서 다시 나오게 감싼다
const wrap = (value: number, range: number) => ((value % range) + range) % range;

const drawSky = (context: CanvasRenderingContext2D) => {
  context.fillStyle = COLOR.sky;
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  context.fillStyle = COLOR.sun;
  context.beginPath();
  context.arc(GAME_WIDTH - 70, 80, 30, 0, Math.PI * 2);
  context.fill();
};

const drawClouds = (context: CanvasRenderingContext2D, scroll: number) => {
  context.fillStyle = COLOR.cloud;
  for (const cloud of CLOUDS) {
    const x = wrap(cloud.x - scroll * 0.15 * cloud.size, GAME_WIDTH + 160) - 80;
    context.beginPath();
    context.arc(x, cloud.y, 22 * cloud.size, 0, Math.PI * 2);
    context.arc(x + 26 * cloud.size, cloud.y - 10 * cloud.size, 28 * cloud.size, 0, Math.PI * 2);
    context.arc(x + 54 * cloud.size, cloud.y, 22 * cloud.size, 0, Math.PI * 2);
    context.fill();
  }
};

const drawHills = (context: CanvasRenderingContext2D, scroll: number) => {
  context.fillStyle = COLOR.hill;
  context.beginPath();
  context.moveTo(0, GROUND_TOP);
  for (let x = 0; x <= GAME_WIDTH; x += 8) {
    const wave = Math.sin((x + scroll * 0.3) / 48) * 14 + Math.sin((x + scroll * 0.3) / 21) * 6;
    context.lineTo(x, GROUND_TOP - 54 + wave);
  }
  context.lineTo(GAME_WIDTH, GROUND_TOP);
  context.closePath();
  context.fill();
};

const isReady = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;

/** 이미지를 가장 긴 변이 size가 되도록 가운데 정렬해 그린다 */
const drawCentered = (context: CanvasRenderingContext2D, image: HTMLImageElement, size: number) => {
  const scale = size / Math.max(image.naturalWidth, image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, -width / 2, -height / 2, width, height);
};

const drawStem = (context: CanvasRenderingContext2D, x: number, top: number, bottom: number) => {
  const left = x + STEM_INSET;
  const width = PIPE_WIDTH - STEM_INSET * 2;
  context.fillStyle = COLOR.stem;
  context.fillRect(left, top, width, bottom - top);

  // 스티커의 줄무늬처럼 굵은 사선을 줄기 안에서만 그린다
  context.save();
  context.beginPath();
  context.rect(left, top, width, bottom - top);
  context.clip();
  context.fillStyle = COLOR.stemStripe;
  const offset = 18;
  for (let y = Math.floor(top / 36) * 36 - 36; y < bottom + 36; y += 36) {
    context.beginPath();
    context.moveTo(left, y + offset);
    context.lineTo(left + width, y);
    context.lineTo(left + width, y + 10);
    context.lineTo(left, y + offset + 10);
    context.closePath();
    context.fill();
  }
  context.restore();
};

// 꽃은 줄기 끝에 틈 바깥쪽으로 얹어, 보이는 모양이 실제 충돌 영역을 넘지 않게 한다
const drawFlower = (
  context: CanvasRenderingContext2D,
  flower: HTMLImageElement,
  x: number,
  y: number,
  angle: number,
) => {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  if (isReady(flower)) {
    drawCentered(context, flower, FLOWER_SIZE);
  } else {
    // 꽃 이미지를 아직 못 불러왔어도 줄기가 끝나는 자리에 충돌 경계를 보여주는 동그라미를 둔다
    context.fillStyle = COLOR.sun;
    context.beginPath();
    context.arc(0, 0, FLOWER_SIZE * 0.3, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
};

const drawPipes = (
  context: CanvasRenderingContext2D,
  state: GameState,
  assets: GameAssets,
  time: number,
) => {
  for (const pipe of state.pipes) {
    const gapTop = pipe.gapY - PIPE_GAP / 2;
    const gapBottom = pipe.gapY + PIPE_GAP / 2;
    const centerX = pipe.x + PIPE_WIDTH / 2;
    const flowers = assets.flowers;
    const sway = Math.sin(time * 2 + pipe.seed * 10) * 0.12;

    drawStem(context, pipe.x, -10, gapTop - FLOWER_SIZE / 2);
    drawStem(context, pipe.x, gapBottom + FLOWER_SIZE / 2, GROUND_TOP);

    if (flowers.length > 0) {
      const topFlower = flowers[Math.floor(pipe.seed * 997) % flowers.length];
      const bottomFlower = flowers[Math.floor(pipe.seed * 997 + 2) % flowers.length];
      drawFlower(context, topFlower, centerX, gapTop - FLOWER_SIZE / 2, sway);
      drawFlower(context, bottomFlower, centerX, gapBottom + FLOWER_SIZE / 2, -sway);
    }
  }
};

const drawGround = (context: CanvasRenderingContext2D, scroll: number) => {
  context.fillStyle = COLOR.soil;
  context.fillRect(0, GROUND_TOP, GAME_WIDTH, GROUND_HEIGHT);

  context.fillStyle = COLOR.soilStripe;
  const offset = wrap(scroll, 24);
  for (let x = -24; x < GAME_WIDTH + 24; x += 24) {
    context.beginPath();
    context.moveTo(x - offset, GROUND_TOP + 24);
    context.lineTo(x - offset + 12, GROUND_TOP + 24);
    context.lineTo(x - offset + 4, GROUND_TOP + 46);
    context.lineTo(x - offset - 8, GROUND_TOP + 46);
    context.closePath();
    context.fill();
  }

  context.fillStyle = COLOR.grass;
  context.fillRect(0, GROUND_TOP, GAME_WIDTH, 16);
};

// 파란 광륜이 파란 하늘에 묻히지 않게 스티커처럼 흰 윤곽을 두른다.
// 번짐(shadowBlur)을 매 프레임 계산하면 끊기므로 한 번만 따로 그려 두고 재사용한다.
// 스프라이트는 화면 배율(scale)에 맞춰 만들어야 배율 2 기기에서 흐려지지 않는다
// 번짐(shadowBlur 6)이 퍼지는 범위보다 여백이 작으면 가장자리에서 잘려 네모 테두리가 생긴다
const BIRD_HALO_PX = 16;
const birdSprites = new WeakMap<HTMLImageElement, { scale: number; canvas: HTMLCanvasElement }>();

const getBirdSprite = (bird: HTMLImageElement, scale: number) => {
  const cached = birdSprites.get(bird);
  if (cached && cached.scale === scale) return cached.canvas;

  const height = BIRD_WIDTH * (bird.naturalHeight / bird.naturalWidth);
  const sprite = document.createElement('canvas');
  sprite.width = Math.ceil((BIRD_WIDTH + BIRD_HALO_PX * 2) * scale);
  sprite.height = Math.ceil((height + BIRD_HALO_PX * 2) * scale);
  const spriteContext = sprite.getContext('2d');
  // 컨텍스트를 못 만들면 빈 캔버스를 저장하지 않고, 호출한 쪽이 원본 이미지를 직접 그린다
  if (!spriteContext) return null;

  // 사파리는 SVG 이미지에 그림자를 줄 때 모양이 아니라 사각형 전체에 번지게 그린다.
  // 그래서 먼저 그림자 없이 비트맵으로 옮긴 뒤, 그 비트맵에 그림자를 입힌다
  const flat = document.createElement('canvas');
  flat.width = Math.ceil(BIRD_WIDTH * scale);
  flat.height = Math.ceil(height * scale);
  const flatContext = flat.getContext('2d');
  if (!flatContext) return null;
  flatContext.drawImage(bird, 0, 0, flat.width, flat.height);

  spriteContext.shadowColor = '#ffffff';
  spriteContext.shadowBlur = 6 * scale;
  spriteContext.drawImage(flat, (sprite.width - flat.width) / 2, (sprite.height - flat.height) / 2);
  birdSprites.set(bird, { scale, canvas: sprite });
  return sprite;
};

const drawBird = (
  context: CanvasRenderingContext2D,
  state: GameState,
  bird: HTMLImageElement,
  fx: FxState,
  status: GameStatus,
) => {
  // 시작 전에는 제자리에서 둥실둥실 떠 있게 한다
  const bob = status === 'ready' ? Math.sin(fx.time * 4) * 6 : 0;
  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, state.velocity / 900));

  context.save();
  context.translate(BIRD_X, state.y + bob);
  context.rotate(status === 'over' ? Math.min(1.4, tilt + 0.9) : tilt);
  if (isReady(bird)) {
    // 새를 기울여도(회전) 배율이 변하지 않도록 변환 행렬의 첫 열 길이로 구한다
    const { a, b } = context.getTransform();
    const scale = Math.hypot(a, b) || 1;
    const sprite = getBirdSprite(bird, scale);
    if (sprite) {
      // 그릴 때는 화면 배율을 되돌려 논리 크기(BIRD_WIDTH 기준)를 유지한다
      context.drawImage(
        sprite,
        -sprite.width / scale / 2,
        -sprite.height / scale / 2,
        sprite.width / scale,
        sprite.height / scale,
      );
    } else {
      const height = BIRD_WIDTH * (bird.naturalHeight / bird.naturalWidth);
      context.drawImage(bird, -BIRD_WIDTH / 2, -height / 2, BIRD_WIDTH, height);
    }
  } else {
    context.fillStyle = COLOR.stem;
    context.beginPath();
    context.arc(0, 0, BIRD_WIDTH / 3, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
};

const drawScore = (context: CanvasRenderingContext2D, score: number, fx: FxState) => {
  const pop = 1 + (fx.scorePop / SCORE_POP_SECONDS) * 0.3;
  context.save();
  context.translate(GAME_WIDTH / 2, 92);
  context.scale(pop, pop);
  context.font = '800 56px Pretendard, system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.lineWidth = 8;
  context.strokeStyle = COLOR.ink;
  context.strokeText(String(score), 0, 0);
  context.fillStyle = '#ffffff';
  context.fillText(String(score), 0, 0);
  context.restore();
};

const drawParticles = (context: CanvasRenderingContext2D, fx: FxState) => {
  for (const particle of fx.particles) {
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
};

export const drawGame = (
  context: CanvasRenderingContext2D,
  state: GameState,
  assets: GameAssets,
  fx: FxState,
  status: GameStatus,
) => {
  context.save();
  if (fx.shake > 0) {
    const amount = (fx.shake / SHAKE_SECONDS) * SHAKE_PX;
    context.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
  }

  drawSky(context);
  drawClouds(context, fx.scroll);
  drawHills(context, fx.scroll);
  drawPipes(context, state, assets, fx.time);
  drawGround(context, fx.scroll);
  drawBird(context, state, assets.bird, fx, status);
  drawParticles(context, fx);
  if (status !== 'ready') drawScore(context, state.score, fx);
  context.restore();

  if (fx.flash > 0) {
    context.fillStyle = `rgba(255, 255, 255, ${(fx.flash / FLASH_SECONDS) * 0.7})`;
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
};
