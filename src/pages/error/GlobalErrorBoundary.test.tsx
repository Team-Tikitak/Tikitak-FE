import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';

const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('일반 에러면 문제 발생 화면과 홈 버튼을 보여준다', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError message="그냥 에러" />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText('문제가 발생했어요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  it('청크 로드 실패 에러면 새로고침을 시도하고 복구 안내를 보여준다', () => {
    render(
      <GlobalErrorBoundary>
        <ThrowError message="Failed to fetch dynamically imported module" />
      </GlobalErrorBoundary>,
    );

    expect(screen.getByText('최신 버전을 불러오는 중이에요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '홈으로' })).toBeNull();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
