import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { clearStoredHero, storeHero } from '@/shared/lib/hero/heroStorage';
import { ActivityPage } from './ActivityPage';

const LocationDisplay = () => <div data-testid="location-display">{useLocation().pathname}</div>;

const ACTIVITY_HERO_STORAGE_KEY = 'tikitak:last-activity-hero';

vi.mock('@/shared/hooks/team/useActiveTeamSelection', () => ({
  useActiveTeamSelection: vi.fn(() => ({
    activeTeam: { teamId: 1, teamName: '티키탁' },
    openTeamSheet: vi.fn(),
    toNotificationPage: vi.fn(),
    isMePending: false,
    isTeamsPending: false,
  })),
}));

const mockUseGetDailyQuestion = vi.fn();
vi.mock('@/shared/api/dailyQuestion/queries', () => ({
  useGetDailyQuestion: (teamId: number) => mockUseGetDailyQuestion(teamId),
}));

// useHasUnreadNotifications는 실제 구현을 태우고 그 아래 쿼리만 mock — unreadCount 파생 로직까지 검증
const mockUseUnreadNotificationCount = vi.fn();
vi.mock('@/shared/api/notification/queries', () => ({
  useUnreadNotificationCount: (params: { teamId: number }) =>
    mockUseUnreadNotificationCount(params),
}));

vi.mock('@/shared/api/user/queries', () => ({
  useMe: () => ({ data: { activeTeamId: 1 } }),
}));

const mockUseHomeBestAttendance = vi.fn();
const mockUseHomeEveryonePick = vi.fn();
const mockUseHomeRegions = vi.fn();
vi.mock('@/shared/api/home/queries', () => ({
  useHomeBestAttendance: (teamId?: number) => mockUseHomeBestAttendance(teamId),
  useHomeEveryonePick: (teamId?: number) => mockUseHomeEveryonePick(teamId),
  useHomeRegions: (teamId?: number) => mockUseHomeRegions(teamId),
}));

vi.mock('./MonthlyBestAttendance', () => ({
  MonthlyBestAttendance: () => <div data-testid="monthly-best-attendance" />,
}));
vi.mock('./MonthlyMemories', () => ({
  MonthlyMemories: () => <div data-testid="monthly-memories" />,
}));

const setDailyQuestion = (data: { content: string; answerFeedId: number | null } | undefined) => {
  mockUseGetDailyQuestion.mockReturnValue({ data, isPending: false });
};

const setUnreadCount = (unreadCount?: number) => {
  mockUseUnreadNotificationCount.mockReturnValue({
    data: unreadCount === undefined ? undefined : { unreadCount },
  });
};

const setHomeQueries = ({
  members = [{ teamMemberId: 1 }],
  picks = [{ placeId: 'p1' }],
  regions = [{ region: '서울' }],
  isPending = false,
  isFetching = false,
}: {
  members?: { teamMemberId: number }[];
  picks?: { placeId: string }[];
  regions?: { region: string }[];
  isPending?: boolean;
  isFetching?: boolean;
} = {}) => {
  mockUseHomeBestAttendance.mockReturnValue({ data: { members }, isPending, isFetching });
  mockUseHomeEveryonePick.mockReturnValue({ data: { picks }, isPending, isFetching });
  mockUseHomeRegions.mockReturnValue({ data: { regions }, isPending, isFetching });
};

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  setUnreadCount(undefined);
  setHomeQueries();
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/activity']}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <ActivityPage />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const getScrollContainer = (container: HTMLElement) => container.querySelector('.overflow-y-auto');

describe('ActivityPage - DailyQuestion 헤더 고정 레이아웃', () => {
  it('미답변 질문이 있으면 배너가 스크롤 영역이 아닌 헤더 안에 렌더된다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: null });
    const { container } = renderPage();

    const banner = screen.getByText('오늘의 질문입니다');
    expect(banner.closest('header')).not.toBeNull();
    expect(getScrollContainer(container)).not.toContainElement(banner);
  });

  it('배너가 보일 때 스크롤 컨테이너에 상단 여백(pt-9)이 적용된다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: null });
    const { container } = renderPage();

    expect(getScrollContainer(container)).toHaveClass('pt-9');
  });

  it('질문이 없으면 배너가 없고 상단 여백도 없다', () => {
    setDailyQuestion(undefined);
    const { container } = renderPage();

    expect(screen.queryByText('오늘의 질문입니다')).toBeNull();
    expect(getScrollContainer(container)).not.toHaveClass('pt-9');
  });

  it('이미 답변한 질문이면 고정 안내 문구를 보여주고 눌렀을 때 피드 페이지로 이동한다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: 42 });
    const { container } = renderPage();

    const banner = screen.getByText('참여 완료! 친구들의 답변도 확인해 보세요');
    expect(banner.closest('header')).not.toBeNull();
    expect(getScrollContainer(container)).toHaveClass('pt-9');

    const button = banner.closest('button');
    expect(button).not.toBeDisabled();
    fireEvent.click(button!);
    expect(screen.getByTestId('location-display')).toHaveTextContent('/feed');
  });

  it('배너 유무와 관계없이 콘텐츠는 스크롤 컨테이너 안에 렌더된다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: null });
    const { container } = renderPage();

    const scrollContainer = getScrollContainer(container);
    expect(scrollContainer).toContainElement(screen.getByTestId('monthly-best-attendance'));
    expect(scrollContainer).toContainElement(screen.getByTestId('monthly-memories'));
  });
});

describe('ActivityPage - 안읽은 알림 점 표시', () => {
  beforeEach(() => {
    setDailyQuestion(undefined);
  });

  it('안읽은 알림이 있으면 벨 버튼에 점이 표시되고 aria-label이 바뀐다', () => {
    setUnreadCount(5);
    renderPage();

    const bell = screen.getByRole('button', { name: '알림 (읽지 않은 알림 있음)' });
    expect(bell.querySelector('span[aria-hidden]')).not.toBeNull();
  });

  it('안읽은 알림이 0개면 점 없이 기본 aria-label로 렌더된다', () => {
    setUnreadCount(0);
    renderPage();

    const bell = screen.getByRole('button', { name: '알림' });
    expect(bell.querySelector('span[aria-hidden]')).toBeNull();
  });

  it('안읽음 카운트 응답 전(data undefined)에도 점 없이 렌더된다', () => {
    renderPage();

    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  });

  it('활성 팀 id로 안읽음 카운트를 조회한다', () => {
    setUnreadCount(5);
    renderPage();

    expect(mockUseUnreadNotificationCount).toHaveBeenCalledWith({ teamId: 1 });
  });
});

describe('ActivityPage - 빈 상태 판별', () => {
  beforeEach(() => {
    setDailyQuestion(undefined);
  });

  it('모든 섹션이 비어 있으면 EmptyActiveView를 렌더한다', () => {
    setHomeQueries({ members: [], picks: [], regions: [] });
    renderPage();

    expect(screen.getByText(/아직 우리 팀의 활동이 없어요/)).toBeInTheDocument();
    expect(screen.queryByTestId('monthly-best-attendance')).toBeNull();
  });

  it('빈 상태에서 백그라운드 리패치(isFetching) 중에도 EmptyActiveView가 유지된다', () => {
    // 회귀: 빈 상태 판별에 isFetching을 쓰면 리패치마다 콘텐츠 뷰로 토글돼 깜빡인다
    setHomeQueries({ members: [], picks: [], regions: [], isFetching: true });
    renderPage();

    expect(screen.getByText(/아직 우리 팀의 활동이 없어요/)).toBeInTheDocument();
    expect(screen.queryByTestId('monthly-best-attendance')).toBeNull();
  });

  it('하나라도 데이터가 있으면 콘텐츠 뷰를 렌더한다', () => {
    setHomeQueries({ members: [{ teamMemberId: 1 }], picks: [], regions: [] });
    renderPage();

    expect(screen.queryByText(/아직 우리 팀의 활동이 없어요/)).toBeNull();
    expect(screen.getByTestId('monthly-best-attendance')).toBeInTheDocument();
  });

  it('첫 로드(isPending) 중에는 빈 상태 대신 스켈레톤을 보여준다', () => {
    setHomeQueries({ members: [], picks: [], regions: [], isPending: true });
    renderPage();

    expect(screen.queryByText(/아직 우리 팀의 활동이 없어요/)).toBeNull();
  });
});

describe('ActivityPage - 히어로 핸드오프', () => {
  beforeEach(() => {
    setDailyQuestion(undefined);
  });

  afterEach(() => {
    clearStoredHero(ACTIVITY_HERO_STORAGE_KEY);
  });

  it('복귀(POP) 시 저장된 히어로가 있고 대상이 여전히 첫 PICK이면 사본을 렌더한다', () => {
    mockUseHomeBestAttendance.mockReturnValue({
      data: { members: [{ teamMemberId: 1 }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeEveryonePick.mockReturnValue({
      data: { picks: [{ feedId: 1, thumbnailImageUrl: 'https://example.com/pick.jpg' }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeRegions.mockReturnValue({
      data: { regions: [] },
      isPending: false,
      isFetching: false,
    });

    storeHero(ACTIVITY_HERO_STORAGE_KEY, {
      itemId: '1',
      heroKey: 'pin-1',
      thumbnailUrl: 'https://example.com/pick.jpg',
      heroPreviewUrl: 'https://example.com/pick.jpg',
      left: 10,
      top: 20,
      width: 90,
      height: 90,
    });

    const { container } = renderPage();

    const clone = container.querySelector('[data-stored-hero]');
    expect(clone).toBeInTheDocument();
    expect(clone).toHaveAttribute('data-hero-exit-key', 'pin-1');
    expect(clone).toHaveAttribute('data-hero-radius', '8');
  });

  it('회귀: 저장된 히어로 사본은 스크롤 컨테이너 내부에서 함께 스크롤된다', () => {
    mockUseHomeBestAttendance.mockReturnValue({
      data: { members: [{ teamMemberId: 1 }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeEveryonePick.mockReturnValue({
      data: { picks: [{ feedId: 1, thumbnailImageUrl: 'https://example.com/pick.jpg' }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeRegions.mockReturnValue({
      data: { regions: [] },
      isPending: false,
      isFetching: false,
    });

    storeHero(ACTIVITY_HERO_STORAGE_KEY, {
      itemId: '1',
      heroKey: 'pin-1',
      thumbnailUrl: 'https://example.com/pick.jpg',
      heroPreviewUrl: 'https://example.com/pick.jpg',
      left: 10,
      top: 20,
      width: 90,
      height: 90,
    });

    const { container } = renderPage();

    const scrollContainer = getScrollContainer(container);
    const clone = container.querySelector('[data-stored-hero]');

    expect(scrollContainer).toHaveClass('relative');
    expect(clone?.parentElement).toBe(scrollContainer);
  });

  it('저장된 히어로 대상이 더 이상 첫 PICK/지역이 아니면 그레이스 타임 안에 핸드오프되지 않는다', () => {
    vi.useFakeTimers();
    mockUseHomeBestAttendance.mockReturnValue({
      data: { members: [{ teamMemberId: 1 }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeEveryonePick.mockReturnValue({
      data: { picks: [{ feedId: 999, thumbnailImageUrl: 'https://example.com/other.jpg' }] },
      isPending: false,
      isFetching: false,
    });
    mockUseHomeRegions.mockReturnValue({
      data: { regions: [] },
      isPending: false,
      isFetching: false,
    });

    storeHero(ACTIVITY_HERO_STORAGE_KEY, {
      itemId: '1',
      heroKey: 'pin-1',
      thumbnailUrl: 'https://example.com/pick.jpg',
      heroPreviewUrl: 'https://example.com/pick.jpg',
      left: 10,
      top: 20,
      width: 90,
      height: 90,
    });

    const { container } = renderPage();

    // 정상 핸드오프(그레이스 300ms + 페이드 120ms + 클리어 260ms = 680ms)가 지나도
    // 대상 불일치라 dismiss가 트리거되지 않아 사본이 그대로 남아있어야 한다
    act(() => {
      vi.advanceTimersByTime(680);
    });

    expect(container.querySelector('[data-stored-hero]')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
