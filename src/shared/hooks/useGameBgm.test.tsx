import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSoundStore } from '@/shared/stores/soundStore';
import { useGameBgm } from './useGameBgm';
import type { ReactNode } from 'react';

const { unlockAudio } = vi.hoisted(() => ({ unlockAudio: vi.fn() }));
vi.mock('@/shared/lib/sound', () => ({ unlockAudio }));

const createBgmMock = () => ({ start: vi.fn(), stop: vi.fn(), preload: vi.fn() });

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/activity/flappy']}>{children}</MemoryRouter>
);

describe('useGameBgm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSoundStore.setState({ enabled: true });
  });

  it('판이 시작되면 배경음악을 튼다', () => {
    const bgm = createBgmMock();
    const { rerender } = renderHook(({ playing }) => useGameBgm(bgm, playing), {
      wrapper,
      initialProps: { playing: false },
    });
    expect(bgm.start).not.toHaveBeenCalled();

    rerender({ playing: true });

    expect(bgm.start).toHaveBeenCalledTimes(1);
  });

  it('판이 끝나면 멈춘다', () => {
    const bgm = createBgmMock();
    const { rerender } = renderHook(({ playing }) => useGameBgm(bgm, playing), {
      wrapper,
      initialProps: { playing: true },
    });
    bgm.stop.mockClear();

    rerender({ playing: false });

    expect(bgm.stop).toHaveBeenCalled();
  });

  it('소리를 끄면 멈추고, 다시 켜면 이어서 튼다', () => {
    const bgm = createBgmMock();
    renderHook(() => useGameBgm(bgm, true), { wrapper });
    bgm.stop.mockClear();
    bgm.start.mockClear();

    act(() => useSoundStore.setState({ enabled: false }));
    expect(bgm.stop).toHaveBeenCalled();

    act(() => useSoundStore.setState({ enabled: true }));
    expect(bgm.start).toHaveBeenCalledTimes(1);
  });

  it('다른 화면으로 이동하면 바로 멈추고 되돌아와도 다시 틀지 않는다', () => {
    const bgm = createBgmMock();
    const { result } = renderHook(
      () => {
        useGameBgm(bgm, true);
        return useNavigate();
      },
      { wrapper },
    );
    bgm.stop.mockClear();
    bgm.start.mockClear();

    act(() => result.current('/activity'));

    expect(bgm.stop).toHaveBeenCalled();
    expect(bgm.start).not.toHaveBeenCalled();
  });

  it('앱을 내리면 멈추고 다시 돌아오면 이어서 튼다', () => {
    const setHidden = (hidden: boolean) => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      document.dispatchEvent(new Event('visibilitychange'));
    };
    const bgm = createBgmMock();
    renderHook(() => useGameBgm(bgm, true), { wrapper });
    bgm.stop.mockClear();
    bgm.start.mockClear();

    act(() => setHidden(true));
    expect(bgm.stop).toHaveBeenCalled();
    expect(bgm.start).not.toHaveBeenCalled();

    act(() => setHidden(false));
    expect(bgm.start).toHaveBeenCalledTimes(1);
  });

  it('화면이 정리되면 멈춘다', () => {
    const bgm = createBgmMock();
    const { unmount } = renderHook(() => useGameBgm(bgm, true), { wrapper });
    bgm.stop.mockClear();

    unmount();

    expect(bgm.stop).toHaveBeenCalled();
  });
});
