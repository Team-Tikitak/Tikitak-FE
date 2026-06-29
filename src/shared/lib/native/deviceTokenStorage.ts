const DEVICE_TOKEN_KEY = 'tikitak:last-device-token';

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
