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
const MAX_FRAME_SECONDS = 0.033;

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
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * ratio;
    canvas.height = GAME_HEIGHT * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

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
        const isOver = stepGame(state, dt);
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
      drawGame(context, state, assets, fx, statusRef.current);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
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
