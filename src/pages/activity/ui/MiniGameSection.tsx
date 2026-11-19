import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useGameLeaderboard } from '@/shared/api/game/queries';
import { isGameServerConfigured } from '@/shared/api/game/supabase';
import type { GameId } from '@/shared/api/game/types';
import flappyThumbnailUrl from '@/shared/assets/Game/FlappyThumbnail.jpg';
import keycapThumbnailUrl from '@/shared/assets/Game/KeycapThumbnail.jpg';
import whackThumbnailUrl from '@/shared/assets/Game/WhackThumbnail.jpg';
import ChevronDownIcon from '@/shared/assets/Icon/ChevronDownIcon.svg?react';
import { cn, openOverlay } from '@/shared/lib';
import { formatKeycapScore } from '@/shared/lib/game/keycapScore';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { Avatar } from '@/shared/ui';
import { BottomSheetOverlay } from '@/shared/ui/BottomSheet';
import { GameRankingSheet } from './GameRankingSheet';

interface GameCardConfig {
  id: GameId;
  title: string;
  description: string;
  path: string;
  thumbnailUrl: string;
  /** 순위표에 보여줄 점수 문구. 기본은 "N점" */
  formatScore?: (score: number) => string;
}

const GAME_CARDS = [
  {
    id: 'flappy',
    title: '티키 날기',
    description: '팀원들과 이번 달 최고 점수에 도전해요',
    path: PATHS.FLAPPY_GAME,
    thumbnailUrl: flappyThumbnailUrl,
  },
  {
    id: 'whack',
    title: '탁 잡기',
    description: '30초 동안 튀어나오는 Tak를 탁! 잡아요',
    path: PATHS.WHACK_GAME,
    thumbnailUrl: whackThumbnailUrl,
  },
  {
    id: 'keycap',
    title: '티키타닥',
    description: '컴퓨터보다 먼저 키캡을 눌러요. 초고수까지 도전!',
    formatScore: formatKeycapScore,
    path: PATHS.KEYCAP_GAME,
    thumbnailUrl: keycapThumbnailUrl,
  },
] satisfies GameCardConfig[];

const TOP_COUNT = 3;

const formatPlainScore = (score: number) => `${score}점`;

interface MiniGameSectionProps {
  teamId: number | null | undefined;
  myTeamMemberId: number | null | undefined;
}

const COLLAPSED_STORAGE_KEY_PREFIX = 'tikitak:minigame-collapsed:';

// 접어 둔 선택은 게임마다 이 기기에서만 기억한다. 저장소를 못 쓰면 매번 펼친 채로 시작한다.
const readCollapsed = (gameId: GameId) => {
  try {
    return window.localStorage.getItem(`${COLLAPSED_STORAGE_KEY_PREFIX}${gameId}`) === '1';
  } catch {
    return false;
  }
};

const writeCollapsed = (gameId: GameId, collapsed: boolean) => {
  try {
    window.localStorage.setItem(`${COLLAPSED_STORAGE_KEY_PREFIX}${gameId}`, collapsed ? '1' : '0');
  } catch {
    // 저장하지 못해도 이번 접속 동안은 동작한다
  }
};

export const MiniGameSection = ({ teamId, myTeamMemberId }: MiniGameSectionProps) => (
  <section className="flex w-full flex-col gap-[18px]">
    <h2 className="body-2 text-black">미니게임</h2>
    <div className="flex flex-col gap-3">
      {GAME_CARDS.map((game) => (
        <GameCard key={game.id} game={game} teamId={teamId} myTeamMemberId={myTeamMemberId} />
      ))}
    </div>
  </section>
);

interface GameCardProps extends MiniGameSectionProps {
  game: GameCardConfig;
}

const GameCard = ({ game, teamId, myTeamMemberId }: GameCardProps) => {
  const navigate = useNavigate();
  const { entries, isPending } = useGameLeaderboard(game.id, teamId);
  const [collapsed, setCollapsed] = useState(() => readCollapsed(game.id));
  const contentId = useId();
  const top = entries.slice(0, TOP_COUNT);
  const myEntry = entries.find((entry) => entry.teamMemberId === myTeamMemberId);
  const formatScore = game.formatScore ?? formatPlainScore;
  const showRanking = isGameServerConfigured && !isPending;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed(game.id, next);
  };

  const openRanking = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <BottomSheetOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        ariaTitle={`${game.title} 이번 달 순위`}
      >
        <GameRankingSheet
          title={game.title}
          entries={entries}
          myTeamMemberId={myTeamMemberId}
          formatScore={formatScore}
        />
      </BottomSheetOverlay>
    ));
  };

  const handlePlay = () => {
    triggerHaptic('light');
    navigate(game.path);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* 제목 줄은 늘 보이고, 누르면 아래 내용만 접히고 펴진다 */}
      <h3>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-controls={contentId}
          onClick={toggle}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="title-2 text-black">{game.title}</span>
            {myEntry && (
              <span className="bg-main-000 text-main-002 rounded-full px-2.5 py-0.5 text-xs font-bold">
                내 {myEntry.rank}위
              </span>
            )}
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              'h-auto w-4 shrink-0 text-gray-600 motion-safe:transition-transform',
              !collapsed && 'rotate-180',
            )}
          />
        </button>
      </h3>

      {/* 접으면 높이가 0으로 줄고, 숨겨진 내용으로는 키보드 포커스도 가지 않는다 */}
      <div
        id={contentId}
        inert={collapsed}
        className={cn(
          'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200',
          collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        )}
      >
        <div className="overflow-hidden">
          {/* 설명과 순위는 일반 요소로 두고, 실제 버튼은 "플레이" 하나다. 버튼의 클릭 영역만 카드 전체로 넓힌다 */}
          <div className="relative flex w-full gap-4 px-4 pt-1 pb-4 active:scale-[0.99] motion-safe:transition-transform">
            {/* 실제 게임 화면을 캡처한 이미지 */}
            <img
              src={game.thumbnailUrl}
              alt=""
              className="aspect-[9/16] w-[104px] shrink-0 rounded-xl object-cover"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="body-10 break-keep text-gray-600">{game.description}</p>

              {showRanking && (
                <ul aria-label={`${game.title} 이번 달 순위`} className="flex flex-col gap-2">
                  {top.length === 0 ? (
                    <li className="body-10 text-gray-600">첫 기록의 주인공이 되어보세요!</li>
                  ) : (
                    top.map((entry) => (
                      <li
                        key={entry.teamMemberId}
                        className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                      >
                        <span className="w-4 text-center text-xs font-bold text-gray-600">
                          {entry.rank}
                        </span>
                        <Avatar src={entry.profileImgUrl} alt="" size="xs" />
                        <span className="min-w-16 flex-1 truncate text-sm font-semibold text-black">
                          {entry.nickname}
                        </span>
                        <span className="ml-auto text-xs text-gray-600">
                          {formatScore(entry.score)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}

              {showRanking && entries.length > 0 && (
                <button
                  type="button"
                  onClick={openRanking}
                  className="relative z-10 -mt-1 self-start text-xs font-semibold text-gray-600 underline underline-offset-2"
                >
                  전체 순위 보기 ({entries.length}명)
                </button>
              )}

              <button
                type="button"
                onClick={handlePlay}
                aria-label={`${game.title} 플레이`}
                className="bg-main-001 button-1 mt-auto flex h-11 items-center justify-center rounded-full text-white after:absolute after:inset-0 after:content-['']"
              >
                플레이
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
