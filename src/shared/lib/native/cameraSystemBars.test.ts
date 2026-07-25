import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setAndroidCameraSystemBars } from './cameraSystemBars';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'android'),
    isNativePlatform: vi.fn(() => true),
  },
  SystemBars: {
    setStyle: vi.fn(() => Promise.resolve()),
  },
  SystemBarsStyle: {
    Dark: 'DARK',
    Light: 'LIGHT',
  },
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: {
    setBackgroundColor: vi.fn(() => Promise.resolve()),
    setStyle: vi.fn(() => Promise.resolve()),
  },
  Style: {
    Dark: 'DARK',
    Light: 'LIGHT',
  },
}));

describe('setAndroidCameraSystemBars', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    document.documentElement.className = '';
    document.body.className = '';
  });

  it('Android 카메라 오버레이가 열리면 시스템 바를 어두운 배경용으로 전환한다', async () => {
    await setAndroidCameraSystemBars(true);

    expect(document.documentElement).toHaveClass('android-camera-system-bars-active');
    expect(document.body).toHaveClass('android-camera-system-bars-active');
    expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith({ color: '#111111' });
    expect(StatusBar.setStyle).toHaveBeenCalledWith({ style: Style.Dark });
    expect(SystemBars.setStyle).toHaveBeenCalledWith({ style: SystemBarsStyle.Dark });
  });

  it('Android 카메라 오버레이가 닫히면 기본 밝은 시스템 바로 복구한다', async () => {
    await setAndroidCameraSystemBars(true);
    await setAndroidCameraSystemBars(false);

    expect(document.documentElement).not.toHaveClass('android-camera-system-bars-active');
    expect(document.body).not.toHaveClass('android-camera-system-bars-active');
    expect(StatusBar.setBackgroundColor).toHaveBeenLastCalledWith({ color: '#ffffff' });
    expect(StatusBar.setStyle).toHaveBeenLastCalledWith({ style: Style.Light });
    expect(SystemBars.setStyle).toHaveBeenLastCalledWith({ style: SystemBarsStyle.Light });
  });

  it('Android가 아니면 iOS 시스템 바와 클래스를 건드리지 않는다', async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');

    await setAndroidCameraSystemBars(true);

    expect(document.documentElement).not.toHaveClass('android-camera-system-bars-active');
    expect(document.body).not.toHaveClass('android-camera-system-bars-active');
    expect(StatusBar.setStyle).not.toHaveBeenCalled();
    expect(SystemBars.setStyle).not.toHaveBeenCalled();
  });

  it('웹 환경이면 Android 시스템 바와 클래스를 건드리지 않는다', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

    await setAndroidCameraSystemBars(true);

    expect(document.documentElement).not.toHaveClass('android-camera-system-bars-active');
    expect(document.body).not.toHaveClass('android-camera-system-bars-active');
    expect(StatusBar.setBackgroundColor).not.toHaveBeenCalled();
    expect(StatusBar.setStyle).not.toHaveBeenCalled();
    expect(SystemBars.setStyle).not.toHaveBeenCalled();
  });

  it('동시 호출되면 마지막 요청만 Android 시스템 바에 적용한다', async () => {
    await Promise.all([setAndroidCameraSystemBars(true), setAndroidCameraSystemBars(false)]);

    expect(document.documentElement).not.toHaveClass('android-camera-system-bars-active');
    expect(document.body).not.toHaveClass('android-camera-system-bars-active');
    await vi.waitFor(() => expect(StatusBar.setBackgroundColor).toHaveBeenCalledTimes(1));
    expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith({ color: '#ffffff' });
    expect(StatusBar.setStyle).toHaveBeenCalledWith({ style: Style.Light });
    expect(SystemBars.setStyle).toHaveBeenCalledWith({ style: SystemBarsStyle.Light });
  });
});
