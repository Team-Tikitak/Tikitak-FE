import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { ActivityPage } from './ActivityPage';

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

vi.mock('@/shared/api/home/queries', () => ({
  useHomeBestAttendance: vi.fn(() => ({
    data: { members: [{ teamMemberId: 1 }] },
    isPending: false,
    isFetching: false,
  })),
  useHomeEveryonePick: vi.fn(() => ({ data: { picks: [{ placeId: 'p1' }] }, isPending: false })),
  useHomeRegions: vi.fn(() => ({ data: { regions: [{ region: '서울' }] }, isPending: false })),
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

const renderPage = () =>
  render(
    <MemoryRouter>
      <ActivityPage />
    </MemoryRouter>,
  );

const getScrollContainer = (container: HTMLElement) => container.querySelector('.overflow-y-auto');

describe('ActivityPage - DailyQuestion 헤더 고정 레이아웃', () => {
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

  it('이미 답변한 질문이면 배너는 유지되지만 이동은 막힌다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: 42 });
    const { container } = renderPage();

    const banner = screen.getByText('오늘의 질문입니다');
    expect(banner.closest('header')).not.toBeNull();
    expect(getScrollContainer(container)).toHaveClass('pt-9');
    expect(banner.closest('button')).toBeDisabled();
  });

  it('배너 유무와 관계없이 콘텐츠는 스크롤 컨테이너 안에 렌더된다', () => {
    setDailyQuestion({ content: '오늘의 질문입니다', answerFeedId: null });
    const { container } = renderPage();

    const scrollContainer = getScrollContainer(container);
    expect(scrollContainer).toContainElement(screen.getByTestId('monthly-best-attendance'));
    expect(scrollContainer).toContainElement(screen.getByTestId('monthly-memories'));
  });
});
