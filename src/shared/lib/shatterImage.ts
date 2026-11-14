// 피드 삭제 시 사진에 금이 가고 유리처럼 깨져 아래로 떨어지는 연출.
// 화면 전환과 무관하게 끝까지 재생되도록 body에 캔버스를 붙인다.
const RAYS = 14;
const RINGS = 4;
const CRACK_MS = 350;
const FALL_MS = 900;
const DELAY_MS = 250;
const GRAVITY = 0.0022;
const SHAKE_PX = 5;
const TOTAL_MS = CRACK_MS + DELAY_MS + FALL_MS;

type Point = [number, number];

interface Piece {
  points: Point[];
  cx: number;
  cy: number;
  /** 충격 지점에서 가장 먼 거리를 1로 본 상대 거리 */
  dist: number;
  delay: number;
  vx: number;
  vy: number;
  spin: number;
}

const NOOP = () => {};

// object-fit(cover/contain) 그대로 보이던 모습을 캔버스에 옮긴다
const snapshotImage = (image: HTMLImageElement, width: number, height: number, ratio: number) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  context.scale(ratio, ratio);

  const fit = getComputedStyle(image).objectFit === 'contain' ? Math.min : Math.max;
  const scale = fit(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  return canvas;
};

// 충격 지점에서 퍼지는 방사선 + 동심원 격자로 사진을 불규칙한 조각으로 나눈다
const createPieces = (rect: DOMRect, impactX: number, impactY: number) => {
  const maxRadius =
    Math.max(
      Math.hypot(impactX - rect.left, impactY - rect.top),
      Math.hypot(impactX - rect.right, impactY - rect.top),
      Math.hypot(impactX - rect.left, impactY - rect.bottom),
      Math.hypot(impactX - rect.right, impactY - rect.bottom),
    ) * 1.05;
  const step = (Math.PI * 2) / RAYS;
  const angles = Array.from(
    { length: RAYS },
    (_, ray) => ray * step + (Math.random() - 0.5) * step * 0.5,
  );

  const grid: Point[][] = Array.from({ length: RINGS + 1 }, (_, ring) =>
    angles.map((angle) => {
      if (ring === 0) return [impactX, impactY];
      const base = maxRadius * (ring / RINGS) ** 1.4;
      const radius = ring === RINGS ? base : base * (0.88 + Math.random() * 0.24);
      return [impactX + Math.cos(angle) * radius, impactY + Math.sin(angle) * radius];
    }),
  );

  const pieces: Piece[] = [];
  for (let ring = 0; ring < RINGS; ring += 1) {
    for (let ray = 0; ray < RAYS; ray += 1) {
      const next = (ray + 1) % RAYS;
      const points = [grid[ring][ray], grid[ring][next], grid[ring + 1][next], grid[ring + 1][ray]];
      const cx = points.reduce((sum, [x]) => sum + x, 0) / points.length;
      const cy = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
      const dist = Math.min(1, Math.hypot(cx - impactX, cy - impactY) / maxRadius);
      pieces.push({
        points,
        cx,
        cy,
        dist,
        delay: dist * DELAY_MS * 0.8 + Math.random() * DELAY_MS * 0.2,
        vx: ((cx - impactX) / maxRadius) * 0.12 + (Math.random() - 0.5) * 0.06,
        vy: -0.05 + Math.random() * 0.08,
        spin: (Math.random() - 0.5) * 0.004,
      });
    }
  }
  return pieces;
};

const tracePath = (context: CanvasRenderingContext2D, points: Point[]) => {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
};

const strokeCrack = (context: CanvasRenderingContext2D) => {
  context.strokeStyle = 'rgba(0,0,0,0.35)';
  context.lineWidth = 2.5;
  context.stroke();
  context.strokeStyle = 'rgba(255,255,255,0.85)';
  context.lineWidth = 1;
  context.stroke();
};

/**
 * frame 안에서 보이는 사진에 금을 내고 조각내어 떨어뜨린 뒤 원본은 숨긴다.
 * 반환 함수는 원본을 다시 보이게 한다 (삭제 실패 시 사용).
 */
export const shatterImage = (frame: HTMLElement): (() => void) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return NOOP;

  // 원본이 로드되면 흐린 미리보기(aria-hidden)는 투명하게 남아 있으므로 원본을 우선한다
  const loadedImages = [...frame.querySelectorAll('img')].filter((item) => item.naturalWidth > 0);
  const image =
    loadedImages.find((item) => item.getAttribute('aria-hidden') !== 'true') ?? loadedImages[0];
  if (!image) return NOOP;

  const rect = frame.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const snapshot = snapshotImage(image, rect.width, rect.height, ratio);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!snapshot || !context) return NOOP;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  canvas.width = viewportWidth * ratio;
  canvas.height = viewportHeight * ratio;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = `position:fixed;inset:0;width:${viewportWidth}px;height:${viewportHeight}px;pointer-events:none;z-index:200`;

  // 충격 지점은 사진 중앙 근처에서 살짝 벗어나게 해 매번 다른 금이 가게 한다
  const impactX = rect.left + rect.width * (0.4 + Math.random() * 0.2);
  const impactY = rect.top + rect.height * (0.4 + Math.random() * 0.2);
  const pieces = createPieces(rect, impactX, impactY);

  const previousVisibility = frame.style.visibility;
  frame.style.visibility = 'hidden';
  document.body.appendChild(canvas);
  const startedAt = performance.now();
  let frameId = 0;

  const drawSnapshot = () =>
    context.drawImage(snapshot, rect.left, rect.top, rect.width, rect.height);

  const draw = (now: number) => {
    const elapsed = now - startedAt;
    if (elapsed >= TOTAL_MS) {
      canvas.remove();
      return;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    // 조각 외곽이 사진 밖으로 삐져나가므로 금 선도 사진 영역 안에서만 그린다
    context.save();
    context.beginPath();
    context.rect(rect.left, rect.top, rect.width, rect.height);
    context.clip();

    if (elapsed < CRACK_MS) {
      // 금이 충격 지점에서 바깥으로 번지는 동안 사진이 파르르 떨린다
      const progress = elapsed / CRACK_MS;
      const shake = (1 - progress) * SHAKE_PX;
      context.save();
      context.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      drawSnapshot();
      for (const piece of pieces) {
        if (piece.dist > progress) continue;
        tracePath(context, piece.points);
        strokeCrack(context);
      }
      context.restore();
    } else {
      for (const piece of pieces) {
        const age = Math.max(0, elapsed - CRACK_MS - piece.delay);
        const progress = age / FALL_MS;
        if (progress >= 1) continue;
        context.save();
        context.globalAlpha = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
        context.translate(
          piece.cx + piece.vx * age,
          piece.cy + piece.vy * age + (GRAVITY * age * age) / 2,
        );
        context.rotate(piece.spin * age);
        context.translate(-piece.cx, -piece.cy);
        tracePath(context, piece.points);
        context.clip();
        drawSnapshot();
        strokeCrack(context);
        context.restore();
      }
    }
    context.restore();
    frameId = requestAnimationFrame(draw);
  };

  frameId = requestAnimationFrame(draw);

  return () => {
    // 삭제 실패로 복원할 때 진행 중인 연출이 복원된 사진 위에 남지 않게 끝낸다
    cancelAnimationFrame(frameId);
    canvas.remove();
    frame.style.visibility = previousVisibility;
  };
};
