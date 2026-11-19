import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { playSound, unlockAudio } from '@/shared/lib/sound';
import { createGameAssets } from '../lib/flappyAssets';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  createGameState,
  flap,
  stepFall,
  stepGame,
} from '../lib/flappyEngine';
import {
  SCORE_POP_SECONDS,
  createFx,
  drawGame,
  spawnFlapPuffs,
  triggerDeathFx,
  updateFx,
} from '../lib/flappyRenderer';

export type GameStatus = 'ready' | 'playing' | 'over';

// 탭 전환 등으로 프레임이 길게 끊겨도 새가 순간이동하지 않게 한다
const MAX_FRAME_SECONDS = 0.05;

export const useFlappyGame = (onGameOver: (score: number) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(createGameState());
  const fxRef = useRef(createFx());
  const statusRef = useRef<GameStatus>('ready');
  const onGameOverRef = useRef(onGameOver);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [score, setScore] = useState(0);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const changeStatus = useCallback((next: GameStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    // 3배 해상도는 픽셀이 너무 많아 느려지므로 2배까지만 쓴다
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    // 화면이 게임판(9:16)보다 길면 남는 위아래까지 캔버스를 늘려 하늘·기둥·땅을 이어 그린다.
    // overscanY는 위(와 아래)로 더 보이는 높이이고, 게임판 좌표 기준이다
    let overscanY = 0;
    const applyLayout = () => {
      const parent = canvas.parentElement;
      const parentWidth = parent?.clientWidth ?? 0;
      const parentHeight = parent?.clientHeight ?? 0;
      if (parentWidth <= 0 || parentHeight <= 0) {
        canvas.width = GAME_WIDTH * ratio;
        canvas.height = GAME_HEIGHT * ratio;
        overscanY = 0;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        return;
      }
      const cssWidth = Math.min(parentWidth, (parentHeight * GAME_WIDTH) / GAME_HEIGHT);
      const scale = cssWidth / GAME_WIDTH;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${parentHeight}px`;
      canvas.width = Math.round(cssWidth * ratio);
      canvas.height = Math.round(parentHeight * ratio);
      overscanY = Math.max(0, (parentHeight / scale - GAME_HEIGHT) / 2);
      context.setTransform(ratio * scale, 0, 0, ratio * scale, 0, ratio * scale * overscanY);
    };
    applyLayout();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(applyLayout);
    if (canvas.parentElement) resizeObserver?.observe(canvas.parentElement);

    const assets = createGameAssets();

    let frameId = 0;
    let lastTime = performance.now();
    let shownScore = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS);
      lastTime = now;
      const state = stateRef.current;
      const fx = fxRef.current;

      if (statusRef.current === 'playing') {
        // 화면이 길어 하늘이 위로 이어져 보이면, 보이지 않는 천장에 부딪히지 않도록 보이는 화면의 맨 위를 천장으로 쓴다
        const isOver = stepGame(state, dt, Math.random, -overscanY);
        if (state.score !== shownScore) {
          shownScore = state.score;
          fx.scorePop = SCORE_POP_SECONDS;
          playSound('score', { rate: 1 + Math.min(shownScore, 20) * 0.03 });
          setScore(shownScore);
        }
        if (isOver) {
          changeStatus('over');
          triggerDeathFx(fx, state.y);
          triggerHaptic('error');
          playSound('crash');
          onGameOverRef.current(state.score);
        }
      } else if (statusRef.current === 'over') {
        stepFall(state, dt);
      } else {
        shownScore = 0;
      }

      updateFx(fx, dt, statusRef.current);
      drawGame(context, state, assets, fx, statusRef.current, overscanY);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [changeStatus]);

  const press = useCallback(() => {
    if (statusRef.current === 'over') return;
    unlockAudio();
    if (statusRef.current === 'ready') changeStatus('playing');
    flap(stateRef.current);
    spawnFlapPuffs(fxRef.current, stateRef.current.y);
    playSound('flap');
    triggerHaptic('light');
  }, [changeStatus]);

  const restart = useCallback(() => {
    stateRef.current = createGameState();
    fxRef.current = createFx();
    setScore(0);
    changeStatus('ready');
  }, [changeStatus]);

  return { canvasRef, status, score, press, restart };
};
