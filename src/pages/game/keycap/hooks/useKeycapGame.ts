import { useCallback, useEffect, useRef, useState } from 'react';
import { encodeKeycapScore } from '@/shared/lib/game/keycapScore';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { playSound, unlockAudio } from '@/shared/lib/sound';
import {
  GAME_SECONDS,
  KEY_COUNT,
  LAST_REGULAR_STAGE_INDEX,
  STAGES,
  createKeycapState,
  getOutcome,
  getRemainingSeconds,
  isKeycapOver,
  pressKeycap,
  tickKeycap,
  type Keycap,
  type Outcome,
} from '../lib/keycapEngine';

/**
 * ready: 시작 전, playing: 한 단계 진행 중, stageClear: 단계를 이겨서 다음 단계 대기, over: 끝
 */
export type KeycapStatus = 'ready' | 'playing' | 'stageClear' | 'over';

/** 키를 가져가거나 틀렸을 때 키 위에 잠깐 보여주는 효과 */
export interface KeyEffect {
  id: number;
  index: number;
  kind: 'me' | 'bot' | 'miss';
  label: string;
}

const TICK_MS = 50;
const LOW_TIME_SECONDS = 5;
const EFFECT_MS = 600;

interface KeycapView {
  keys: Keycap[];
  effects: KeyEffect[];
  me: number;
  bot: number;
  remaining: number;
}

const EMPTY_VIEW: KeycapView = {
  effects: [],
  keys: Array.from({ length: KEY_COUNT }, () => ({
    phase: 'idle' as const,
    owner: null,
    botAt: 0,
    releaseAt: 0,
  })),
  me: 0,
  bot: 0,
  remaining: GAME_SECONDS,
};

/** 이번 도전에서 지금까지의 성과 */
interface RunResult {
  clearedStages: number;
  points: number;
}

export const useKeycapGame = (onGameOver: (score: number) => void) => {
  const stateRef = useRef(createKeycapState(0));
  const runRef = useRef<RunResult>({ clearedStages: 0, points: 0 });
  const lastTickSecondRef = useRef(0);
  const effectsRef = useRef<(KeyEffect & { at: number })[]>([]);
  const effectIdRef = useRef(0);
  // 눌렀다가 아직 떼지 않은 키. 뗄 때 소리를 한 번만 내기 위해 둔다
  const heldKeysRef = useRef(new Set<number>());
  const onGameOverRef = useRef(onGameOver);
  const [status, setStatus] = useState<KeycapStatus>('ready');
  const [stageIndex, setStageIndex] = useState(0);
  const [run, setRun] = useState<RunResult>({ clearedStages: 0, points: 0 });
  const [view, setView] = useState<KeycapView>(EMPTY_VIEW);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const addEffect = useCallback((index: number, kind: KeyEffect['kind'], now: number) => {
    effectIdRef.current += 1;
    effectsRef.current.push({
      id: effectIdRef.current,
      index,
      kind,
      label: kind === 'miss' ? '-1' : '+1',
      at: now,
    });
  }, []);

  const syncView = useCallback((now: number) => {
    const state = stateRef.current;
    effectsRef.current = effectsRef.current.filter((effect) => now - effect.at < EFFECT_MS);
    setView({
      effects: effectsRef.current.map(({ at: _at, ...effect }) => effect),
      keys: [...state.keys],
      me: state.me,
      bot: state.bot,
      remaining: getRemainingSeconds(state, now),
    });
  }, []);

  const beginStage = useCallback(
    (index: number) => {
      unlockAudio();
      const now = performance.now();
      stateRef.current = createKeycapState(now, STAGES[index]);
      lastTickSecondRef.current = 0;
      effectsRef.current = [];
      heldKeysRef.current.clear();
      setStageIndex(index);
      setOutcome(null);
      syncView(now);
      setStatus('playing');
    },
    [syncView],
  );

  useEffect(() => {
    if (status !== 'playing') return;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const state = stateRef.current;

      if (isKeycapOver(state, now)) {
        window.clearInterval(timer);
        state.keys = state.keys.map((key) =>
          key.phase === 'lit' ? { ...key, phase: 'idle' } : key,
        );
        syncView(now);

        const result = getOutcome(state);
        const next: RunResult = {
          clearedStages: result === 'win' ? stageIndex + 1 : runRef.current.clearedStages,
          points: runRef.current.points + state.me,
        };
        runRef.current = next;
        setRun(next);
        setOutcome(result);
        triggerHaptic(result === 'win' ? 'success' : 'error');
        playSound('finish');

        // 이기고 다음 단계가 남아 있을 때만 이어진다. 지거나 비기거나 마지막 단계를 넘으면 끝난다.
        if (result === 'win' && stageIndex < STAGES.length - 1) {
          setStatus('stageClear');
          // 초고수를 깬 사람은 불가능에 도전할지 고르는 화면에서 앱을 나갈 수도 있다.
          // 기록이 사라지지 않게 이 시점의 점수를 먼저 저장한다(서버는 더 높은 점수만 남긴다)
          if (stageIndex === LAST_REGULAR_STAGE_INDEX) {
            onGameOverRef.current(encodeKeycapScore(next.clearedStages, next.points));
          }
        } else {
          setStatus('over');
          onGameOverRef.current(encodeKeycapScore(next.clearedStages, next.points));
        }
        return;
      }

      const botClaims = tickKeycap(state, now);
      botClaims.forEach((index) => {
        playSound('keyBot');
        addEffect(index, 'bot', now);
      });
      syncView(now);

      const second = Math.ceil(getRemainingSeconds(state, now));
      if (second <= LOW_TIME_SECONDS && second !== lastTickSecondRef.current) {
        lastTickSecondRef.current = second;
        playSound('tick');
      }
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [status, stageIndex, syncView, addEffect]);

  /** 처음부터 새로 도전한다 */
  const start = useCallback(() => {
    runRef.current = { clearedStages: 0, points: 0 };
    setRun({ clearedStages: 0, points: 0 });
    beginStage(0);
  }, [beginStage]);

  const nextStage = useCallback(() => beginStage(stageIndex + 1), [beginStage, stageIndex]);

  /** 불가능에 도전하지 않고 여기서 마무리한다. 점수는 초고수를 깬 순간 이미 저장했다 */
  const finish = useCallback(() => setStatus('over'), []);

  const press = useCallback(
    (index: number) => {
      if (status !== 'playing') return;
      const now = performance.now();
      // 종료 틱이 오기 전이라도 제한 시간이 지난 입력은 점수에 넣지 않는다
      if (isKeycapOver(stateRef.current, now)) return;
      const result = pressKeycap(stateRef.current, index, now);
      if (result) heldKeysRef.current.add(index);
      if (result === 'hit') {
        addEffect(index, 'me', now);
        playSound('keyMine');
        triggerHaptic('light');
      } else if (result === 'miss') {
        addEffect(index, 'miss', now);
        playSound('keyMiss');
        triggerHaptic('error');
      } else {
        return;
      }
      syncView(now);
    },
    [status, syncView, addEffect],
  );

  const release = useCallback((index: number) => {
    if (!heldKeysRef.current.delete(index)) return;
    playSound('keyRelease');
  }, []);

  return {
    status,
    outcome,
    stageIndex,
    stage: STAGES[stageIndex],
    run,
    ...view,
    start,
    nextStage,
    finish,
    press,
    release,
  };
};
