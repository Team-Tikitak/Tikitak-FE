// 화면 전환과 무관하게 잠깐 떠 있다 사라지도록 body에 직접 캔버스를 붙인다
const CONFETTI_COLORS = ['#ff6fa8', '#3cc4ff', '#ffd43b', '#ff7a1a', '#6ee7b7'];
const PIECE_COUNT = 90;
const DURATION_MS = 1800;
const FADE_OUT_MS = 400;
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
    for (const piece of pieces) {
      piece.vy += GRAVITY;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
      context.restore();
    }
    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};
