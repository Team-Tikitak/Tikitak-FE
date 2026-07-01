// 푸시 알림 토큰 저장
const DEVICE_TOKEN_KEY = 'tikitak:last-device-token';

// 앱 내 푸시 알림 설정 상태 저장
const PUSH_ENABLED_KEY = 'tikitak:push-enabled';

export const storeDeviceToken = async (fcmToken: string): Promise<void> => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: DEVICE_TOKEN_KEY, value: fcmToken });
  } catch {
    // 저장 실패는 무시
  }
};

export const readStoredDeviceToken = async (): Promise<string | null> => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: DEVICE_TOKEN_KEY });
    return value;
  } catch {
    return null;
  }
};

export const clearStoredDeviceToken = async (): Promise<void> => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key: DEVICE_TOKEN_KEY });
  } catch {
    // 삭제 실패는 무시
  }
};

export const readPushEnabled = async (): Promise<boolean> => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key: PUSH_ENABLED_KEY });
    return value !== 'false';
  } catch {
    return true;
  }
};

export const storePushEnabled = async (enabled: boolean): Promise<void> => {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key: PUSH_ENABLED_KEY, value: String(enabled) });
  } catch {
    // 저장 실패는 무시
  }
};
