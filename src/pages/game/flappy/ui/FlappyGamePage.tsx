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

  // 팀이 없으면 저장할 곳이 없으니 이번 달 최고 점수도 보여주지 않는다
  const canTrackScore = isGameServerConfigured && Boolean(teamId && teamMemberId);
  const myEntry = entries.find((entry) => entry.teamMemberId === teamMemberId);
  const myBest = myEntry?.score ?? 0;

  const { canvasRef, status, score, press, restart } = useFlappyGame((finalScore) => {
    // 서버 저장은 부가 기능이라 실패해도 게임 흐름을 막지 않는다.
    // 최고 점수 비교는 서버(greatest)에 맡긴다. 화면의 월과 제출 시점의 월이 달라도 점수가 사라지지 않는다.
    if (!canTrackScore || !teamId || !teamMemberId || finalScore <= 0) return;
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
      // 화면이 9:16보다 길면 남는 위아래가 비는데, 위는 하늘색·아래는 땅색으로 이어 붙여 검은 줄이 보이지 않게 한다
      contentClassName="bg-[linear-gradient(to_bottom,var(--color-tak-blue)_50%,var(--color-tak-yellow)_50%)] flex flex-col overflow-hidden"
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center select-none">
        {/* 터치와 마우스는 누르는 순간에, 키보드(Space·Enter)는 click으로 날갯짓한다 */}
        <button
          type="button"
          aria-label="날갯짓하기. 화면을 탭하거나 Space, Enter 키를 눌러요"
          onPointerDown={press}
          onClick={(event) => {
            if (event.detail === 0) press();
          }}
          className="absolute inset-0 touch-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        >
          {/* 비율을 지켜 게임판 전체(천장과 바닥)가 보이게 한다 */}
          <canvas ref={canvasRef} aria-hidden="true" className="size-full object-contain" />
        </button>

        <p aria-live="polite" className="sr-only">
          {status === 'ready' ? '' : `${score}점`}
        </p>

        {status === 'ready' && (
          <p className="pointer-events-none absolute bottom-24 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700">
            화면을 탭하거나 Space 키를 눌러 시작
          </p>
        )}

        {status === 'over' && (
          <GameOverCard
            className="absolute inset-x-6"
            score={score}
            bestScore={canTrackScore ? myBest : undefined}
            rank={myEntry?.rank}
            onRestart={restart}
          />
        )}
      </div>
    </PageShell>
  );
};
