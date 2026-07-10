import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RootErrorBoundary } from './ErrorBoundary';
import type * as ReactRouter from 'react-router';

const mockUseRouteError = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router');
  return {
    ...actual,
    useRouteError: () => mockUseRouteError(),
  };
});

const renderBoundary = () =>
  render(
    <MemoryRouter>
      <RootErrorBoundary />
    </MemoryRouter>,
  );

const renderBoundaryStrict = () =>
  render(
    <StrictMode>
      <MemoryRouter>
        <RootErrorBoundary />
      </MemoryRouter>
    </StrictMode>,
  );

describe('RootErrorBoundary', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
  });

  it('일반 에러면 문제 발생 화면과 홈 링크를 보여준다', () => {
    mockUseRouteError.mockReturnValue(new Error('그냥 에러'));

    renderBoundary();

    expect(screen.getByText('문제가 발생했어요')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '홈으로' })).toBeInTheDocument();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('청크 로드 실패 에러면 새로고침을 시도하고 복구 안내를 보여준다', () => {
    mockUseRouteError.mockReturnValue(new Error('Failed to fetch dynamically imported module'));

    renderBoundary();

    expect(screen.getByText('최신 버전을 불러오는 중이에요')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '홈으로' })).toBeNull();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it('StrictMode에서 청크 로드 복구 판정이 두 번 호출되어도 복구 안내를 유지한다', () => {
    mockUseRouteError.mockReturnValue(new Error('Failed to fetch dynamically imported module'));

    renderBoundaryStrict();

    expect(screen.getByText('최신 버전을 불러오는 중이에요')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '홈으로' })).toBeNull();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
