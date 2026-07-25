import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InviteAcceptPage } from './InviteAcceptPage';

const { isNativePlatformMock } = vi.hoisted(() => ({
  isNativePlatformMock: vi.fn(),
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
    setUserAgent(originalUserAgent);
  });

  it('iOS 브라우저에서는 설치하기 버튼을 보여준다', () => {
    setUserAgent(IOS_USER_AGENT);
    render(<InviteAcceptPage />);

    expect(screen.getByRole('button', { name: '설치하기' })).toBeInTheDocument();
  });

  it('Android 브라우저에서는 설치하기 버튼을 숨긴다 (Play 스토어 미등록)', () => {
    setUserAgent(ANDROID_USER_AGENT);
    render(<InviteAcceptPage />);

    expect(screen.queryByRole('button', { name: '설치하기' })).toBeNull();
    expect(screen.getByRole('button', { name: '티키탁에서 초대장 확인하기' })).toBeInTheDocument();
  });

  it('앱 안에서는 참여하기 버튼만 보여준다', () => {
    isNativePlatformMock.mockReturnValue(true);
    render(<InviteAcceptPage />);

    expect(screen.getByRole('button', { name: '참여하기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '설치하기' })).toBeNull();
  });
});
