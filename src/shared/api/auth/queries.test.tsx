import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/authStore';
import { useLoginCodeExchange, useLogout } from './queries';
import type { ReactNode } from 'react';

const {
  postLoginCodeExchangeMock,
  postLogoutMock,
  storeRefreshTokenMock,
  clearStoredRefreshTokenMock,
  navigateMock,
} = vi.hoisted(() => ({
  postLoginCodeExchangeMock: vi.fn(),
  postLogoutMock: vi.fn(),
  storeRefreshTokenMock: vi.fn(),
  clearStoredRefreshTokenMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock('react-router', () => ({ useNavigate: () => navigateMock }));
vi.mock('./api', () => ({
  postLoginCodeExchange: postLoginCodeExchangeMock,
  postLogout: postLogoutMock,
}));
vi.mock('@/shared/lib/native/refreshTokenStorage', () => ({
  storeRefreshToken: storeRefreshTokenMock,
  clearStoredRefreshToken: clearStoredRefreshTokenMock,
}));
vi.mock('@/shared/lib/native/deviceTokenStorage', () => ({
  readStoredDeviceToken: vi.fn().mockResolvedValue(null),
  clearStoredDeviceToken: vi.fn(),
}));
vi.mock('@/shared/lib/native/getDeviceToken', () => ({
  getDeviceTokenIfGranted: vi.fn().mockResolvedValue(null),
}));
vi.mock('../notification/api', () => ({ deleteDeviceToken: vi.fn() }));
vi.mock('@/shared/lib/routing/redirectAfterLogin', () => ({
  consumeRedirectAfterLogin: () => null,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('auth queries 의 refresh 토큰 보관', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAccessToken();
    storeRefreshTokenMock.mockReset().mockResolvedValue(undefined);
    clearStoredRefreshTokenMock.mockReset().mockResolvedValue(undefined);
    postLoginCodeExchangeMock.mockReset();
    postLogoutMock.mockReset();
  });

  it('로그인 코드 교환에 성공하면 응답의 refreshToken 을 보안 저장소에 저장한다', async () => {
    postLoginCodeExchangeMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          accessToken: 'access-1',
          refreshToken: 'refresh-1',
          isNewMember: false,
          hasAgreedRequiredTerms: true,
          activeTeamId: 1,
        },
      },
    });

    const { result } = renderHook(() => useLoginCodeExchange(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('login-code');
    });

    expect(useAuthStore.getState().accessToken).toBe('access-1');
    expect(storeRefreshTokenMock).toHaveBeenCalledWith('refresh-1');
  });

  it('로그아웃하면 저장된 refresh 토큰도 지운다', async () => {
    postLogoutMock.mockResolvedValue({ data: { success: true, data: { loggedOut: true } } });

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(clearStoredRefreshTokenMock).toHaveBeenCalledTimes(1);
  });

  it('서버 로그아웃 요청이 실패해도 기기에서는 refresh 토큰을 지운다', async () => {
    postLogoutMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });

    expect(clearStoredRefreshTokenMock).toHaveBeenCalledTimes(1);
  });
});
