import { Capacitor } from '@capacitor/core';

const REFRESH_TOKEN_KEY = 'tikitak:refresh-token';

// 웹은 httpOnly 쿠키가 전부 담당하므로 네이티브에서만 보관한다. Keychain(iOS)·Keystore AES-GCM(Android)에
// 저장하고 iCloud 동기화는 쓰지 않는다. 플러그인이 없는 구버전 바이너리에서도 앱이 깨지지 않도록
// 모든 호출은 실패를 삼키고 "저장된 토큰 없음"으로 동작한다.
const loadSecureStorage = async () => {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    return SecureStorage;
  } catch {
    return null;
  }
};

export const storeRefreshToken = async (token: string): Promise<void> => {
  const storage = await loadSecureStorage();
  if (!storage) return;

  try {
    await storage.set(REFRESH_TOKEN_KEY, token, false, false);
  } catch {
    // 저장 실패는 무시 (쿠키 복구는 그대로 동작)
  }
};

export const readStoredRefreshToken = async (): Promise<string | null> => {
  const storage = await loadSecureStorage();
  if (!storage) return null;

  try {
    const value = await storage.get(REFRESH_TOKEN_KEY, false, false);
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
};

export const clearStoredRefreshToken = async (): Promise<void> => {
  const storage = await loadSecureStorage();
  if (!storage) return;

  try {
    await storage.remove(REFRESH_TOKEN_KEY, false);
  } catch {
    // 삭제 실패는 무시
  }
};
