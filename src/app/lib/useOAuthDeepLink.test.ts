import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOAuthDeepLink } from './useOAuthDeepLink';

const mutateMock = vi.fn();
const { addListenerMock, browserCloseMock, getLaunchUrlMock, isNativePlatformMock, removeMock } =
  vi.hoisted(() => ({
    addListenerMock: vi.fn(),
    browserCloseMock: vi.fn(),
    getLaunchUrlMock: vi.fn<() => Promise<{ url: string } | undefined>>(),
    isNativePlatformMock: vi.fn(),
    removeMock: vi.fn(),
  }));

vi.mock('@/shared/api/auth/queries', () => ({
  useLoginCodeExchange: () => ({ mutate: mutateMock }),
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

vi.mock('@capacitor/browser', () => ({
  Browser: {
    close: browserCloseMock,
  },
}));

const renderWithAppUrlOpen = () => {
  let appUrlOpenHandler: ((event: { url: string }) => void) | undefined;
  addListenerMock.mockImplementation((eventName, handler) => {
    if (eventName === 'appUrlOpen') {
      appUrlOpenHandler = handler;
    }
    return Promise.resolve({ remove: removeMock });
  });

  renderHook(() => useOAuthDeepLink());

  return (url: string) => appUrlOpenHandler?.({ url });
};

describe('useOAuthDeepLink', () => {
  beforeEach(() => {
    mutateMock.mockClear();
    removeMock.mockClear();
    browserCloseMock.mockReset();
    browserCloseMock.mockResolvedValue(undefined);
    isNativePlatformMock.mockReset();
    isNativePlatformMock.mockReturnValue(true);
    getLaunchUrlMock.mockReset();
    getLaunchUrlMock.mockResolvedValue(undefined);
    addListenerMock.mockReset();
    addListenerMock.mockResolvedValue({ remove: removeMock });
  });

  it('웹 환경에서는 네이티브 딥링크 리스너를 등록하지 않는다', () => {
    isNativePlatformMock.mockReturnValue(false);

    renderHook(() => useOAuthDeepLink());

    expect(getLaunchUrlMock).not.toHaveBeenCalled();
    expect(addListenerMock).not.toHaveBeenCalled();
  });

  it('콜드스타트 콜백 딥링크면 loginCode를 교환한다', async () => {
    getLaunchUrlMock.mockResolvedValue({ url: 'tikitak://oauth/callback?loginCode=login-code' });

    renderHook(() => useOAuthDeepLink());

    await act(async () => {
      await Promise.resolve();
    });

    expect(mutateMock).toHaveBeenCalledWith('login-code', expect.anything());
  });

  it('appUrlOpen 콜백 딥링크면 loginCode를 교환하고 인앱 브라우저를 닫는다', async () => {
    const emit = renderWithAppUrlOpen();

    await act(async () => {
      emit('tikitak://oauth/callback?loginCode=login-code');
    });

    expect(mutateMock).toHaveBeenCalledWith('login-code', expect.anything());
    expect(browserCloseMock).toHaveBeenCalled();
  });

  it('콜백 경로가 아닌 딥링크의 loginCode는 교환하지 않는다', async () => {
    const emit = renderWithAppUrlOpen();

    await act(async () => {
      emit('tikitak://anything?loginCode=evil');
      emit('tikitak://other/callback?loginCode=evil');
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('같은 loginCode가 두 번 도착해도 한 번만 교환한다', async () => {
    const emit = renderWithAppUrlOpen();

    await act(async () => {
      emit('tikitak://oauth/callback?loginCode=login-code');
      emit('tikitak://oauth/callback?loginCode=login-code');
    });

    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it('교환이 실패하면 같은 loginCode를 다시 시도할 수 있다', async () => {
    const emit = renderWithAppUrlOpen();

    await act(async () => {
      emit('tikitak://oauth/callback?loginCode=login-code');
    });

    const [, options] = mutateMock.mock.calls[0];
    act(() => {
      options.onError();
    });

    await act(async () => {
      emit('tikitak://oauth/callback?loginCode=login-code');
    });

    expect(mutateMock).toHaveBeenCalledTimes(2);
  });
});
