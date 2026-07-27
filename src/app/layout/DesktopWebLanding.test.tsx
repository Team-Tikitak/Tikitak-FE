import { fireEvent, render, screen } from '@testing-library/react';
import { OverlayProvider } from 'overlay-kit';
import { describe, expect, it, vi } from 'vitest';
import { DesktopWebLanding } from './DesktopWebLanding';

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
  it('일반 PC 방문에는 모바일 이용 안내를 보여준다', () => {
    renderLanding('/home');

    expect(screen.getByRole('heading', { name: /티키탁은 모바일에서/ })).toBeInTheDocument();
    expect(screen.getByText(/PC에서는 안내 화면만 제공돼요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iOS 앱 설치하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Android 앱 설치하기' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '초대 링크 QR 코드' })).not.toBeInTheDocument();
  });

  it('Android 앱 설치 버튼은 출시 준비 안내를 보여준다', () => {
    renderLanding('/home');

    fireEvent.click(screen.getByRole('button', { name: 'Android 앱 설치하기' }));

    expect(screen.getByRole('alertdialog')).toHaveTextContent('Android 앱은 준비 중이에요');
    expect(screen.getByText(/조금만 기다려주세요/)).toHaveClass('whitespace-pre-line');
  });

  it('PC 초대 링크 방문에는 QR 과 복사 버튼을 보여준다', () => {
    const { container } = renderLanding('/invite/test-token');

    expect(screen.getByRole('img', { name: '초대 링크 QR 코드' })).toBeInTheDocument();
    expect(container.querySelector('svg[data-value]')).toHaveAttribute(
      'data-value',
      `${window.location.origin}/invite/test-token`,
    );
    expect(screen.getByRole('button', { name: /초대 링크 복사하기/ })).toBeInTheDocument();
  });
});
