import { Capacitor } from '@capacitor/core';

export const openAppSettings = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { NativeSettings, IOSSettings, AndroidSettings } =
      await import('capacitor-native-settings');
    await NativeSettings.open({
      optionIOS: IOSSettings.App,
      optionAndroid: AndroidSettings.ApplicationDetails,
    });
  } catch {
    // 설정 열기 실패는 무시
  }
};
