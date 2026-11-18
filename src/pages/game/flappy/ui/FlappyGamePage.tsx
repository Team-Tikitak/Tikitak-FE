import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useGameLeaderboard, useSubmitGameScore } from '@/shared/api/game/queries';
import { isGameServerConfigured } from '@/shared/api/game/supabase';
import { useMyTeamMember } from '@/shared/hooks/team/useMyTeamMember';
import { GameOverCard, Header, SoundToggle } from '@/shared/ui';
import { useFlappyGame } from '../hooks/useFlappyGame';

export const FlappyGamePage = () => {
  const navigate = useNavigate();
  const { teamId, teamMemberId } = useMyTeamMember();
  const { entries } = useGameLeaderboard('flappy', teamId);
  const { mutate: submitScore } = useSubmitGameScore();

  const myEntry = entries.find((entry) => entry.teamMemberId === teamMemberId);
  const myBest = myEntry?.score ?? 0;

  const { canvasRef, status, score, press, restart } = useFlappyGame((finalScore) => {
    // 서버 저장은 부가 기능이라 실패해도 게임 흐름을 막지 않는다
    if (!isGameServerConfigured || !teamId || !teamMemberId) return;
    if (finalScore <= myBest) return;
    submitScore({ gameId: 'flappy', teamId, teamMemberId, score: finalScore });
  });

  return (
    <PageShell
      header={
        <Header
          title="티키 날기"
          onBack={() => navigate(PATHS.ACTIVITY)}
          rightSlot={<SoundToggle />}
        />
      }
      contentClassName="flex flex-col overflow-hidden bg-main-000"
    >
      <div
        onPointerDown={press}
        className="relative flex min-h-0 flex-1 touch-none items-center justify-center select-none"
      >
        <canvas
          ref={canvasRef}
          aria-label="티키 날기 게임 화면"
          className="size-full object-cover"
        />

        <p aria-live="polite" className="sr-only">
          {status === 'ready' ? '' : `${score}점`}
        </p>

        {status === 'ready' && (
          <p className="pointer-events-none absolute bottom-24 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700">
            화면을 탭해서 시작
          </p>
        )}

        {status === 'over' && (
          <GameOverCard
            className="absolute inset-x-6"
            score={score}
            bestScore={isGameServerConfigured ? myBest : undefined}
            rank={myEntry?.rank}
            onRestart={restart}
          />
        )}
      </div>
    </PageShell>
  );
};
