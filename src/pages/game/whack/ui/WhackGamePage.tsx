import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGameLeaderboard, useSubmitGameScore } from '@/shared/api/game/queries';
import { isGameServerConfigured } from '@/shared/api/game/supabase';
import bgmUrl from '@/shared/assets/Sound/bgm-happy-clappy.mp3';
import { useMyTeamMember } from '@/shared/hooks/team/useMyTeamMember';
import { useGameBgm } from '@/shared/hooks/useGameBgm';
import { cn } from '@/shared/lib';
import { createBgm } from '@/shared/lib/sound';
import { Button, GameOverCard, Header, SoundToggle } from '@/shared/ui';
import { WhackBackdrop } from './WhackBackdrop';
import { WhackBoard } from './WhackBoard';
import { useWhackGame } from '../hooks/useWhackGame';
import {
  DIFFICULTY_SETTINGS,
  GAME_SECONDS,
  WHACK_DIFFICULTIES,
  type WhackDifficulty,
} from '../lib/whackEngine';

const LOW_TIME_SECONDS = 5;

// 두더지 소리와 점수 소리가 묻히지 않게 작게 깔고, 곡은 밝고 경쾌한 피아노로 골랐다.
// 티키 날기 곡(0.1)보다 원본이 3dB 작아서 비슷하게 들리도록 조금 높게 잡았다
const bgm = createBgm(bgmUrl, 0.14);

export const WhackGamePage = () => {
  const navigate = useNavigate();
  const { teamId, teamMemberId } = useMyTeamMember();
  const { entries } = useGameLeaderboard('whack', teamId);
  const { mutate: submitScore } = useSubmitGameScore();

  // 팀이 없으면 저장할 곳이 없으니 이번 달 최고 점수도 보여주지 않는다
  const canTrackScore = isGameServerConfigured && Boolean(teamId && teamMemberId);
  const myEntry = entries.find((entry) => entry.teamMemberId === teamMemberId);
  const myBest = myEntry?.score ?? 0;

  const { status, holes, effects, score, remaining, start, whack } = useWhackGame((finalScore) => {
    // 서버 저장은 부가 기능이라 실패해도 게임 흐름을 막지 않는다
    if (!canTrackScore || !teamId || !teamMemberId || finalScore <= 0) return;
    submitScore({ gameId: 'whack', teamId, teamMemberId, score: finalScore });
  });

  useGameBgm(bgm, status === 'playing');

  // 난이도는 시작 전과 끝난 뒤에 바꿀 수 있고, 같은 점수판에 올라가서 어려움은 점수를 더 준다
  const [difficulty, setDifficulty] = useState<WhackDifficulty>('normal');
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const startGame = () => start(difficulty);

  const isLowTime = status === 'playing' && remaining <= LOW_TIME_SECONDS;

  return (
    <PageShell
      header={
        <Header
          title="탁 잡기"
          onBack={() => navigate(PATHS.ACTIVITY)}
          rightSlot={<SoundToggle />}
        />
      }
      contentClassName="bg-tak-blue relative flex flex-col overflow-hidden"
    >
      <WhackBackdrop />

      <div className="relative z-10 flex flex-col gap-3 px-5 pt-4">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'text-lg font-bold text-white',
              isLowTime && 'text-tak-yellow motion-safe:animate-pulse',
            )}
          >
            남은 시간 {Math.ceil(remaining)}초
          </p>
          <p aria-live="polite" className="text-3xl font-extrabold text-white">
            {score}점
          </p>
        </div>
        <div role="radiogroup" aria-label="난이도" className="flex gap-2">
          {WHACK_DIFFICULTIES.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={difficulty === level}
              disabled={status === 'playing'}
              onClick={() => setDifficulty(level)}
              className={cn(
                'min-h-9 flex-1 rounded-full px-3 text-sm font-bold motion-safe:transition-colors',
                difficulty === level ? 'text-tak-ink bg-white' : 'bg-white/25 text-white',
                status === 'playing' && difficulty !== level && 'opacity-40',
              )}
            >
              {DIFFICULTY_SETTINGS[level].label}
              {level === 'hard' && ` · Tak ${DIFFICULTY_SETTINGS.hard.takPoints}점`}
            </button>
          ))}
        </div>
        <div
          role="progressbar"
          aria-label="남은 시간"
          aria-valuemin={0}
          aria-valuemax={GAME_SECONDS}
          aria-valuenow={Math.ceil(remaining)}
          className="h-3 w-full overflow-hidden rounded-full bg-white/40"
        >
          <div
            className={cn('h-full rounded-full', isLowTime ? 'bg-tak-red' : 'bg-tak-yellow')}
            style={{ width: `${(remaining / GAME_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-5">
        <div className="relative w-full rounded-3xl bg-white p-4">
          <WhackBoard holes={holes} effects={effects} onWhack={whack} />
          {/* 시작 전·끝난 뒤에는 흰 판을 어둡게 덮어, 흰 카드가 판과 섞이지 않고 떠 보이게 한다 */}
          {status !== 'playing' && (
            <div aria-hidden="true" className="bg-tak-ink/55 absolute inset-0 rounded-3xl" />
          )}
        </div>

        {status === 'ready' && (
          <div className="absolute inset-x-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 shadow-lg">
            <p className="text-2xl font-extrabold text-black">탁 잡기</p>
            <p className="text-center text-base leading-relaxed font-medium text-gray-700">
              {GAME_SECONDS}초 동안 튀어나오는 Tak를 탁! 잡아요.
              <br />
              Tak는 {settings.takPoints}점, 가시 별을 누르면 {settings.badPenalty}점이 깎여요.
            </p>
            <Button variant="primary" onClick={startGame}>
              {settings.label} 난이도로 시작하기
            </Button>
          </div>
        )}

        {status === 'over' && (
          <GameOverCard
            className="absolute inset-x-6"
            score={score}
            bestScore={canTrackScore ? myBest : undefined}
            rank={myEntry?.rank}
            onRestart={startGame}
            onExit={() => navigate(PATHS.ACTIVITY)}
          />
        )}
      </div>
    </PageShell>
  );
};
