import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/routes/paths';
import { MapView } from './MapView';

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUseMapView = vi.fn();
vi.mock('../hooks/useMapView', () => ({
  useMapView: (teamId: number) => mockUseMapView(teamId),
}));

vi.mock('../hooks/useUserLocation', () => ({
  useUserLocation: () => ({ center: { latitude: 0, longitude: 0 }, located: true }),
}));

vi.mock('./Map', () => ({
  Map: () => <div data-testid="map" />,
}));

const renderMapView = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MapView teamId={1} />
    </QueryClientProvider>,
  );
};

describe('MapView', () => {
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

  it('오늘의 질문에 아직 답변하지 않았으면 배너를 눌러 작성 화면으로 이동한다', () => {
    mockNavigate.mockClear();
    mockUseMapView.mockReturnValue({
      dailyQuestion: '오늘의 질문입니다',
      showDailyQuestion: true,
      dailyQuestionAnswered: false,
      pins: [],
    });

    renderMapView();

    const banner = screen.getByText('오늘의 질문입니다').closest('button');
    expect(banner).not.toBeDisabled();

    fireEvent.click(banner!);
    expect(mockNavigate).toHaveBeenCalledWith(PATHS.DAILY_FEED_CREATE);
  });

  it('오늘의 질문에 이미 답변했으면 배너는 보이되 이동은 막힌다', () => {
    mockNavigate.mockClear();
    mockUseMapView.mockReturnValue({
      dailyQuestion: '오늘의 질문입니다',
      showDailyQuestion: true,
      dailyQuestionAnswered: true,
      pins: [],
    });

    renderMapView();

    const banner = screen.getByText('오늘의 질문입니다').closest('button');
    expect(banner).toBeDisabled();

    fireEvent.click(banner!);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
