import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { playSound, unlockAudio } from '@/shared/lib/sound';
import {
  DIFFICULTY_SETTINGS,
  GAME_SECONDS,
  HOLE_COUNT,
  createWhackState,
  getRemainingSeconds,
  hitHole,
  isWhackOver,
  tickWhack,
  type Mole,
  type MoleKind,
  type WhackDifficulty,
} from '../lib/whackEngine';

export type WhackStatus = 'ready' | 'playing' | 'over';

/** 맞힌 순간 구멍 위에 잠깐 보여주는 효과 */
export interface HitEffect {
  id: number;
  hole: number;
  kind: MoleKind;
  label: string;
}

const TICK_MS = 50;
const LOW_TIME_SECONDS = 5;
const EFFECT_MS = 600;

interface WhackView {
  holes: (Mole | null)[];
  effects: HitEffect[];
  score: number;
  remaining: number;
}

const EMPTY_VIEW: WhackView = {
  holes: Array.from({ length: HOLE_COUNT }, () => null),
  effects: [],
  score: 0,
  remaining: GAME_SECONDS,
};

export const useWhackGame = (onGameOver: (score: number) => void) => {
  const stateRef = useRef(createWhackState(0));
  const effectsRef = useRef<(HitEffect & { at: number })[]>([]);
  const effectIdRef = useRef(0);
  const lastTickSecondRef = useRef(0);
  const lastSpawnIdRef = useRef(1);
  const onGameOverRef = useRef(onGameOver);
  const [status, setStatus] = useState<WhackStatus>('ready');
  const [view, setView] = useState<WhackView>(EMPTY_VIEW);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const syncView = useCallback((now: number) => {
    const state = stateRef.current;
    effectsRef.current = effectsRef.current.filter((effect) => now - effect.at < EFFECT_MS);
    setView({
      holes: [...state.holes],
      effects: effectsRef.current.map(({ at: _at, ...effect }) => effect),
      score: state.score,
      remaining: getRemainingSeconds(state, now),
    });
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const state = stateRef.current;

      if (isWhackOver(state, now)) {
        window.clearInterval(timer);
        state.holes = state.holes.map(() => null);
        syncView(now);
        setStatus('over');
        triggerHaptic('success');
        playSound('finish');
        onGameOverRef.current(state.score);
        return;
      }

      tickWhack(state, now);
      // 새 두더지가 올라왔으면 쏙 올라오는 소리를 낸다
      if (state.nextId !== lastSpawnIdRef.current) {
        lastSpawnIdRef.current = state.nextId;
        playSound('whackPop', { rate: 0.9 + Math.random() * 0.25 });
      }
      syncView(now);

      // 마지막 5초는 1초마다 째깍 소리를 낸다
      const second = Math.ceil(getRemainingSeconds(state, now));
      if (second <= LOW_TIME_SECONDS && second !== lastTickSecondRef.current) {
        lastTickSecondRef.current = second;
        playSound('tick');
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [status, syncView]);

  const start = useCallback(
    (difficulty: WhackDifficulty = 'normal') => {
      unlockAudio();
      const now = performance.now();
      stateRef.current = createWhackState(now, difficulty);
      effectsRef.current = [];
      lastTickSecondRef.current = 0;
      lastSpawnIdRef.current = stateRef.current.nextId;
      syncView(now);
      setStatus('playing');
    },
    [syncView],
  );

  const whack = useCallback(
    (index: number) => {
      if (status !== 'playing') return;
      // 종료 틱이 오기 전이라도 제한 시간이 지난 입력은 점수에 넣지 않는다
      if (isWhackOver(stateRef.current, performance.now())) return;
      const kind = hitHole(stateRef.current, index);
      if (!kind) return;

      const { takPoints, badPenalty } = DIFFICULTY_SETTINGS[stateRef.current.difficulty];
      const now = performance.now();
      effectIdRef.current += 1;
      effectsRef.current.push({
        id: effectIdRef.current,
        hole: index,
        kind,
        label: kind === 'tak' ? `+${takPoints}` : `-${badPenalty}`,
        at: now,
      });
      triggerHaptic(kind === 'tak' ? 'light' : 'error');
      playSound(kind === 'tak' ? 'whackHit' : 'whackBad', {
        rate: 1 + Math.min(stateRef.current.score, 30) * 0.01,
      });
      syncView(now);
    },
    [status, syncView],
  );

  return { status, ...view, start, whack };
};
