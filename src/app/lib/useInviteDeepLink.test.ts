import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useInviteDeepLink } from './useInviteDeepLink';

const navigateMock = vi.fn();
const { addListenerMock, getLaunchUrlMock, isNativePlatformMock, removeMock } = vi.hoisted(() => ({
  addListenerMock: vi.fn(),
  getLaunchUrlMock: vi.fn<() => Promise<{ url: string } | undefined>>(),
  isNativePlatformMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: isNativePlatformMock,
  },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    getLaunchUrl: getLaunchUrlMock,
    addListener: addListenerMock,
  },
}));

describe('useInviteDeepLink', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    removeMock.mockClear();
    isNativePlatformMock.mockReset();
    isNativePlatformMock.mockReturnValue(true);
    getLaunchUrlMock.mockReset();
    getLaunchUrlMock.mockResolvedValue(undefined);
    addListenerMock.mockReset();
    addListenerMock.mockResolvedValue({ remove: removeMock });
  });

  it('웹 환경에서는 네이티브 딥링크 리스너를 등록하지 않는다', () => {
    isNativePlatformMock.mockReturnValue(false);

    renderHook(() => useInviteDeepLink());

    expect(getLaunchUrlMock).not.toHaveBeenCalled();
    expect(addListenerMock).not.toHaveBeenCalled();
  });

  it('콜드스타트 초대 URL이면 초대 수락 경로로 이동한다', async () => {
    getLaunchUrlMock.mockResolvedValue({ url: 'tikitak://invite/invite-token' });

    renderHook(() => useInviteDeepLink());

    await act(async () => {
      await Promise.resolve();
    });

    expect(navigateMock).toHaveBeenCalledWith('/invite/invite-token');
  });

  it('appUrlOpen 초대 URL이면 초대 수락 경로로 이동한다', async () => {
    let appUrlOpenHandler: ((event: { url: string }) => void) | undefined;
    addListenerMock.mockImplementation((eventName, handler) => {
      if (eventName === 'appUrlOpen') {
        appUrlOpenHandler = handler;
      }
      return Promise.resolve({ remove: removeMock });
    });

    renderHook(() => useInviteDeepLink());

    await act(async () => {
      appUrlOpenHandler?.({ url: 'https://app.tikitak.space/invite/invite-token' });
    });

    expect(navigateMock).toHaveBeenCalledWith('/invite/invite-token');
  });

  it('초대 URL이 아니면 이동하지 않는다', async () => {
    getLaunchUrlMock.mockResolvedValue({ url: 'tikitak://home' });

    renderHook(() => useInviteDeepLink());

    await act(async () => {
      await Promise.resolve();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
