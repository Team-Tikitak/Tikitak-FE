import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGameLeaderboard, useSubmitGameScore } from '@/shared/api/game/queries';
import { isGameServerConfigured } from '@/shared/api/game/supabase';
import { useMyTeamMember } from '@/shared/hooks/team/useMyTeamMember';
import { cn } from '@/shared/lib';
import { Button, GameOverCard, Header, SoundToggle } from '@/shared/ui';
import { WhackBackdrop } from './WhackBackdrop';
import { WhackBoard } from './WhackBoard';
import { useWhackGame } from '../hooks/useWhackGame';
import { BAD_PENALTY, GAME_SECONDS } from '../lib/whackEngine';

const LOW_TIME_SECONDS = 5;

export const WhackGamePage = () => {
  const navigate = useNavigate();
  const { teamId, teamMemberId } = useMyTeamMember();
  const { entries } = useGameLeaderboard('whack', teamId);
  const { mutate: submitScore } = useSubmitGameScore();

  const myEntry = entries.find((entry) => entry.teamMemberId === teamMemberId);
  const myBest = myEntry?.score ?? 0;

  const { status, holes, effects, score, remaining, start, whack } = useWhackGame((finalScore) => {
    // 서버 저장은 부가 기능이라 실패해도 게임 흐름을 막지 않는다
    if (!isGameServerConfigured || !teamId || !teamMemberId) return;
    if (finalScore <= myBest) return;
    submitScore({ gameId: 'whack', teamId, teamMemberId, score: finalScore });
  });

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
        <div className="bg-tak-mint w-full rounded-3xl p-4">
          <WhackBoard holes={holes} effects={effects} onWhack={whack} />
        </div>

        {status === 'ready' && (
          <div className="absolute inset-x-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 shadow-lg">
            <p className="text-2xl font-extrabold text-black">탁 잡기</p>
            <p className="text-center text-base leading-relaxed font-medium text-gray-700">
              {GAME_SECONDS}초 동안 튀어나오는 Tak를 탁! 잡아요.
              <br />
              가시 별을 누르면 {BAD_PENALTY}점이 깎여요.
            </p>
            <Button variant="primary" onClick={start}>
              시작하기
            </Button>
          </div>
        )}

        {status === 'over' && (
          <GameOverCard
            className="absolute inset-x-6"
            score={score}
            bestScore={isGameServerConfigured ? myBest : undefined}
            rank={myEntry?.rank}
            onRestart={start}
          />
        )}
      </div>
    </PageShell>
  );
};
