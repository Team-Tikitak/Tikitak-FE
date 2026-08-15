import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXTERNAL_LINKS } from '@/shared/constants/externalLinks';
import { InviteAcceptPage } from './InviteAcceptPage';

const { isNativePlatformMock, openExternalUrlMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
  openExternalUrlMock: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: isNativePlatformMock, getPlatform: vi.fn(() => 'web') },
  registerPlugin: vi.fn(() => ({
    startPreview: vi.fn(),
    setZoom: vi.fn(),
    capture: vi.fn(),
    stopPreview: vi.fn(),
  })),
}));

vi.mock('../hooks/useInviteAccept', () => ({
  useInviteAccept: () => ({
    teamName: '티키탁',
    isInvalidInvite: false,
    isCheckingMembership: false,
    handleConfirm: vi.fn(),
    openInApp: vi.fn(),
  }),
}));

vi.mock('@/shared/lib/openExternalUrl', () => ({
  openExternalUrl: openExternalUrlMock,
}));

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

const IOS_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
const ANDROID_USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36';

describe('InviteAcceptPage', () => {
  const originalUserAgent = window.navigator.userAgent;

  beforeEach(() => {
    isNativePlatformMock.mockReturnValue(false);
  });

  afterEach(() => {
    openExternalUrlMock.mockClear();
    setUserAgent(originalUserAgent);
  });

  it('iOS 브라우저에서는 설치하기 버튼이 App Store 링크를 연다', () => {
    setUserAgent(IOS_USER_AGENT);
    render(<InviteAcceptPage />);

    fireEvent.click(screen.getByRole('button', { name: '설치하기' }));

    expect(openExternalUrlMock).toHaveBeenCalledWith(EXTERNAL_LINKS.APP_STORE);
  });

  it('Android 브라우저에서는 설치하기 버튼이 Play Store 링크를 연다', () => {
    setUserAgent(ANDROID_USER_AGENT);
    render(<InviteAcceptPage />);

    fireEvent.click(screen.getByRole('button', { name: '설치하기' }));

    expect(openExternalUrlMock).toHaveBeenCalledWith(EXTERNAL_LINKS.PLAY_STORE);
  });

  it('앱 안에서는 참여하기 버튼만 보여준다', () => {
    isNativePlatformMock.mockReturnValue(true);
    render(<InviteAcceptPage />);

    expect(screen.getByRole('button', { name: '참여하기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '설치하기' })).toBeNull();
  });
});
