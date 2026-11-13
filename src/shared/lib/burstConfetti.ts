// 화면 전환과 무관하게 잠깐 떠 있다 사라지도록 body에 직접 캔버스를 붙인다
const CONFETTI_COLORS = ['#ff6fa8', '#3cc4ff', '#ffd43b', '#ff7a1a', '#6ee7b7'];
const PIECE_COUNT = 90;
const DURATION_MS = 1800;
const FADE_OUT_MS = 400;
// 속도·중력은 60fps 한 프레임(약 16.7ms) 기준 값
const FRAME_MS = 1000 / 60;
const GRAVITY = 0.12;

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
}

const createPiece = (width: number): ConfettiPiece => ({
  x: Math.random() * width,
  y: -20 - Math.random() * 120,
  vx: (Math.random() - 0.5) * 3,
  vy: 2 + Math.random() * 3,
  size: 6 + Math.random() * 6,
  rotation: Math.random() * Math.PI,
  spin: (Math.random() - 0.5) * 0.3,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
});

export const burstConfetti = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `position:fixed;inset:0;width:${width}px;height:${height}px;pointer-events:none;z-index:200`;
  context.scale(ratio, ratio);
  document.body.appendChild(canvas);

  const pieces = Array.from({ length: PIECE_COUNT }, () => createPiece(width));
  const startedAt = performance.now();

  const draw = (now: number) => {
    const elapsed = now - startedAt;
    if (elapsed >= DURATION_MS) {
      canvas.remove();
      return;
    }

    context.clearRect(0, 0, width, height);
    context.globalAlpha = Math.min(1, (DURATION_MS - elapsed) / FADE_OUT_MS);
    // 프레임마다 누적하지 않고 경과 시간으로 위치를 계산해 주사율(60·120Hz)과 무관하게 같은 궤적을 그린다
    const t = elapsed / FRAME_MS;
    for (const piece of pieces) {
      context.save();
      context.translate(piece.x + piece.vx * t, piece.y + piece.vy * t + (GRAVITY * t * t) / 2);
      context.rotate(piece.rotation + piece.spin * t);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      context.restore();
    }
    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};
