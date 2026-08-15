import { fireEvent, render, screen } from '@testing-library/react';
import { OverlayProvider } from 'overlay-kit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXTERNAL_LINKS } from '@/shared/constants/externalLinks';
import { DesktopWebLanding } from './DesktopWebLanding';

const { openExternalUrlMock } = vi.hoisted(() => ({
  openExternalUrlMock: vi.fn(),
}));

vi.mock('@/shared/lib/openExternalUrl', () => ({
  openExternalUrl: openExternalUrlMock,
}));

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({
    title,
    value,
    'aria-hidden': ariaHidden,
  }: {
    title: string;
    value: string;
    'aria-hidden'?: boolean;
  }) => <svg role="img" aria-label={title} aria-hidden={ariaHidden} data-value={value} />,
}));

const renderLanding = (pathname: string) =>
  render(
    <OverlayProvider>
      <DesktopWebLanding pathname={pathname} />
    </OverlayProvider>,
  );

describe('DesktopWebLanding', () => {
  let writeText: ReturnType<typeof vi.fn>;
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    openExternalUrlMock.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('일반 PC 방문에는 모바일 이용 안내를 보여준다', () => {
    renderLanding('/home');

    expect(screen.getByRole('heading', { name: /티키탁은 모바일에서/ })).toBeInTheDocument();
    expect(screen.getByText(/PC에서는 안내 화면만 제공돼요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iOS 앱 설치하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Android 앱 설치하기' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '초대 링크 QR 코드' })).not.toBeInTheDocument();
  });

  it('iOS 앱 설치 버튼은 App Store 링크를 연다', () => {
    renderLanding('/home');

    fireEvent.click(screen.getByRole('button', { name: 'iOS 앱 설치하기' }));

    expect(openExternalUrlMock).toHaveBeenCalledWith(EXTERNAL_LINKS.APP_STORE);
  });

  it('Android 앱 설치 버튼은 Play Store 링크를 연다', () => {
    renderLanding('/home');

    fireEvent.click(screen.getByRole('button', { name: 'Android 앱 설치하기' }));

    expect(openExternalUrlMock).toHaveBeenCalledWith(EXTERNAL_LINKS.PLAY_STORE);
  });

  it('PC 초대 링크 방문에는 QR 과 복사 버튼을 보여주고 링크를 복사한다', () => {
    const { container } = renderLanding('/invite/test-token');

    expect(screen.getByRole('img', { name: '초대 링크 QR 코드' })).toBeInTheDocument();
    expect(container.querySelector('svg[data-value]')).toHaveAttribute(
      'data-value',
      `${window.location.origin}/invite/test-token`,
    );
    fireEvent.click(screen.getByRole('button', { name: /초대 링크 복사하기/ }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/invite/test-token`);
  });
});
