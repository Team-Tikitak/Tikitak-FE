// 피드 삭제 시 사진이 조각나 오른쪽 위로 흩날리며 사라지는 연출.
// 화면 전환과 무관하게 끝까지 재생되도록 body에 캔버스를 붙인다.
const COLUMNS = 10;
const WAVE_MS = 350;
const JITTER_MS = 150;
const PIECE_LIFE_MS = 650;
const TOTAL_MS = WAVE_MS + JITTER_MS + PIECE_LIFE_MS;

interface Piece {
  sx: number;
  sy: number;
  size: number;
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

/**
 * frame 안에서 보이는 사진을 흩날려 사라지게 하고 원본은 숨긴다.
 * 반환 함수는 원본을 다시 보이게 한다 (삭제 실패 시 사용).
 */
export const disintegrateImage = (frame: HTMLElement): (() => void) => {
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
  context.scale(ratio, ratio);

  const size = rect.width / COLUMNS;
  const rows = Math.ceil(rect.height / size);
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      pieces.push({
        sx: column * size,
        sy: row * size,
        size,
        delay: (column / COLUMNS) * WAVE_MS + Math.random() * JITTER_MS,
        vx: 0.15 + Math.random() * 0.25,
        vy: -(0.05 + Math.random() * 0.2),
        spin: (Math.random() - 0.5) * 0.008,
      });
    }
  }

  const previousVisibility = frame.style.visibility;
  frame.style.visibility = 'hidden';
  document.body.appendChild(canvas);
  const startedAt = performance.now();

  const draw = (now: number) => {
    const elapsed = now - startedAt;
    if (elapsed >= TOTAL_MS) {
      canvas.remove();
      return;
    }

    context.clearRect(0, 0, viewportWidth, viewportHeight);
    for (const piece of pieces) {
      const age = Math.max(0, elapsed - piece.delay);
      const progress = age / PIECE_LIFE_MS;
      if (progress >= 1) continue;
      context.save();
      context.globalAlpha = 1 - progress;
      context.translate(
        rect.left + piece.sx + piece.size / 2 + piece.vx * age,
        rect.top + piece.sy + piece.size / 2 + piece.vy * age,
      );
      context.rotate(piece.spin * age);
      context.drawImage(
        snapshot,
        piece.sx * ratio,
        piece.sy * ratio,
        piece.size * ratio,
        piece.size * ratio,
        -piece.size / 2,
        -piece.size / 2,
        piece.size,
        piece.size,
      );
      context.restore();
    }
    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);

  return () => {
    frame.style.visibility = previousVisibility;
  };
};
