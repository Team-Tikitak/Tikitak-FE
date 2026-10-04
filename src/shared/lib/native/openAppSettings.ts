import { Capacitor } from '@capacitor/core';
import { confirmDialog } from './nativeDialog';

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

// OS 정책상 한 번 거절된 권한은 팝업을 다시 못 띄우므로 설정 이동을 안내한다 (웹은 해당 없음)
export const promptOpenAppSettings = async (message: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  const goSettings = await confirmDialog({
    title: '권한 설정 필요',
    message,
    okButtonTitle: '설정 열기',
    cancelButtonTitle: '취소',
  });
  if (goSettings) await openAppSettings();
};
