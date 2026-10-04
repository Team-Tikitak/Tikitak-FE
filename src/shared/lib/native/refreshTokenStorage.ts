import { Capacitor } from '@capacitor/core';

const REFRESH_TOKEN_KEY = 'tikitak:refresh-token';

// 웹은 httpOnly 쿠키가 전부 담당하므로 네이티브에서만 보관한다. Keychain(iOS)·Keystore AES-GCM(Android)에
// 저장하고 iCloud 동기화는 쓰지 않는다. 플러그인이 없는 구버전 바이너리에서도 앱이 깨지지 않도록
// 모든 호출은 실패를 삼키고 "저장된 토큰 없음"으로 동작한다.
const STORAGE_TIMEOUT_MS = 3000;

// 네이티브 브리지가 응답하지 않아도 세션 복구·로그아웃이 멈추지 않도록 시간 제한을 둔다
const withTimeout = <T>(promise: Promise<T>): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('secure storage timeout')), STORAGE_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const loadSecureStorage = async () => {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    const { SecureStorage } = await withTimeout(import('@aparajita/capacitor-secure-storage'));
    return SecureStorage;
  } catch {
    return null;
  }
};

export const storeRefreshToken = async (token: string): Promise<void> => {
  const storage = await loadSecureStorage();
  if (!storage) return;

  try {
    await withTimeout(storage.set(REFRESH_TOKEN_KEY, token, false, false));
  } catch {
    // 저장 실패는 무시 (쿠키 복구는 그대로 동작)
  }
};

export const readStoredRefreshToken = async (): Promise<string | null> => {
  const storage = await loadSecureStorage();
  if (!storage) return null;

  try {
    const value = await withTimeout(storage.get(REFRESH_TOKEN_KEY, false, false));
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
};

export const clearStoredRefreshToken = async (): Promise<void> => {
  const storage = await loadSecureStorage();
  if (!storage) return;

  try {
    await withTimeout(storage.remove(REFRESH_TOKEN_KEY, false));
  } catch {
    // 삭제 실패는 무시
  }
};
