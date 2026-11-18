import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGameLeaderboard, useSubmitGameScore } from '@/shared/api/game/queries';
import { isGameServerConfigured } from '@/shared/api/game/supabase';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg?react';
import TakFree from '@/shared/assets/Character/TakFree.svg?react';
import { useMyTeamMember } from '@/shared/hooks/team/useMyTeamMember';
import { cn } from '@/shared/lib';
import {
  encodeKeycapScore,
  formatKeycapScore,
  KEYCAP_STAGE_LABELS,
} from '@/shared/lib/game/keycapScore';
import { playSound, preloadKeySounds, unlockAudio } from '@/shared/lib/sound';
import { KEY_SWITCHES, useSoundStore, type KeySwitch } from '@/shared/stores/soundStore';
import { Button, GameOverCard, Header, SoundToggle } from '@/shared/ui';
import { KeycapBoard } from './KeycapBoard';
import { ScoreCard } from './ScoreCard';
import { useKeycapGame } from '../hooks/useKeycapGame';
import { GAME_SECONDS, STAGES } from '../lib/keycapEngine';

export const KEYCAP_GAME_TITLE = '티키타닥';

const SWITCH_LABEL = {
  tok: '또각',
  thock: '묵직',
  clack: '딸깍',
  creamy: '쫀득',
} satisfies Record<KeySwitch, string>;

const LOW_TIME_SECONDS = 5;
const LAST_STAGE_INDEX = STAGES.length - 1;

export const KeycapGamePage = () => {
  const navigate = useNavigate();
  const { teamId, teamMemberId } = useMyTeamMember();
  const { entries } = useGameLeaderboard('keycap', teamId);
  const { mutate: submitScore } = useSubmitGameScore();
  const keySwitch = useSoundStore((state) => state.keySwitch);
  const setKeySwitch = useSoundStore((state) => state.setKeySwitch);

  // 실제 키 소리 녹음을 미리 불러와 첫 입력부터 진짜 소리가 나게 한다
  useEffect(() => {
    preloadKeySounds();
  }, []);

  const myEntry = entries.find((entry) => entry.teamMemberId === teamMemberId);
  const myBest = myEntry?.score ?? 0;

  const {
    status,
    outcome,
    stageIndex,
    stage,
    run,
    keys,
    effects,
    me,
    bot,
    remaining,
    start,
    nextStage,
    press,
    release,
  } = useKeycapGame((finalScore) => {
    // 서버 저장은 부가 기능이라 실패해도 게임 흐름을 막지 않는다
    if (!isGameServerConfigured || !teamId || !teamMemberId) return;
    if (finalScore <= myBest) return;
    submitScore({ gameId: 'keycap', teamId, teamMemberId, score: finalScore });
  });

  const isLowTime = status === 'playing' && remaining <= LOW_TIME_SECONDS;
  const isFinalStage = stageIndex === LAST_STAGE_INDEX;
  const clearedAll = run.clearedStages === STAGES.length;

  const overDescription = clearedAll
    ? '초고수까지 모두 클리어!'
    : `${stage.label}에서 ${outcome === 'draw' ? '비겨서' : '져서'} 끝났어요`;

  return (
    <PageShell
      header={
        <Header
          title={KEYCAP_GAME_TITLE}
          onBack={() => navigate(PATHS.ACTIVITY)}
          rightSlot={<SoundToggle />}
        />
      }
      contentClassName="bg-tak-ink relative flex flex-col overflow-hidden"
    >
      <div className="flex flex-col gap-3 px-5 pt-4">
        <div className="flex justify-center">
          <span
            className={cn(
              'rounded-full px-4 py-1 text-base font-extrabold',
              isFinalStage
                ? 'bg-tak-red text-white motion-safe:animate-pulse'
                : 'bg-white/15 text-white',
            )}
          >
            {stage.label}
          </span>
        </div>
        <div className="flex items-stretch gap-2">
          <ScoreCard label="나" score={me} tone="me" Icon={TakFree} />
          <div className="flex flex-col items-center justify-center px-1">
            <p
              className={cn(
                'text-2xl font-extrabold text-white',
                isLowTime && 'text-tak-yellow motion-safe:animate-pulse',
              )}
            >
              {Math.ceil(remaining)}
            </p>
            <p className="text-xs font-bold text-white/60">초</p>
          </div>
          <ScoreCard label="컴퓨터" score={bot} tone="bot" Icon={TakBuilder} />
        </div>
        <div
          role="progressbar"
          aria-label="남은 시간"
          aria-valuemin={0}
          aria-valuemax={GAME_SECONDS}
          aria-valuenow={Math.ceil(remaining)}
          className="h-3 w-full overflow-hidden rounded-full bg-white/20"
        >
          <div
            className={cn('h-full rounded-full', isLowTime ? 'bg-tak-red' : 'bg-tak-yellow')}
            style={{ width: `${(remaining / GAME_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-5">
        <KeycapBoard keys={keys} effects={effects} onPress={press} onRelease={release} />

        <div role="radiogroup" aria-label="키 소리" className="flex gap-2">
          {KEY_SWITCHES.map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={keySwitch === item}
              onClick={() => {
                unlockAudio();
                setKeySwitch(item);
                playSound('keyMine');
              }}
              className={cn(
                'rounded-full px-4 py-2 text-base font-bold',
                keySwitch === item ? 'bg-white text-black' : 'bg-white/15 text-white',
              )}
            >
              {SWITCH_LABEL[item]}
            </button>
          ))}
        </div>

        {status === 'ready' && (
          <div className="absolute inset-x-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 shadow-lg">
            <p className="text-2xl font-extrabold text-black">{KEYCAP_GAME_TITLE}</p>
            <p className="text-center text-base leading-relaxed font-medium text-gray-700">
              불 켜진 키캡을 컴퓨터보다 먼저 눌러요.
              <br />한 단계는 {GAME_SECONDS}초이고, 컴퓨터보다 많이 가져오면 다음 단계로 올라가요.
              <br />
              꺼진 키캡을 누르면 1점이 깎여요.
            </p>
            <ol className="flex flex-wrap justify-center gap-1.5">
              {KEYCAP_STAGE_LABELS.map((label, index) => (
                <li
                  key={label}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-bold',
                    index === LAST_STAGE_INDEX
                      ? 'bg-tak-red text-white'
                      : 'bg-main-000 text-main-002',
                  )}
                >
                  {label}
                </li>
              ))}
            </ol>
            <Button variant="primary" onClick={start}>
              도전하기
            </Button>
          </div>
        )}

        {status === 'stageClear' && (
          <div className="absolute inset-x-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 shadow-lg">
            <p className="text-2xl font-extrabold text-black">{stage.label} 클리어!</p>
            <p className="text-main-002 text-lg font-bold">
              {me} : {bot}으로 컴퓨터를 이겼어요
            </p>
            <p className="text-base font-medium text-gray-600">
              다음은 {STAGES[stageIndex + 1].label}
              {stageIndex + 1 === LAST_STAGE_INDEX ? ' - 컴퓨터가 엄청 빨라요!' : ''}
            </p>
            <Button variant="primary" onClick={nextStage}>
              다음 단계로
            </Button>
          </div>
        )}

        {status === 'over' && (
          <GameOverCard
            className="absolute inset-x-6"
            score={encodeKeycapScore(run.clearedStages, run.points)}
            description={overDescription}
            formatScore={formatKeycapScore}
            bestScore={isGameServerConfigured ? myBest : undefined}
            rank={myEntry?.rank}
            onRestart={start}
          />
        )}
      </div>
    </PageShell>
  );
};
