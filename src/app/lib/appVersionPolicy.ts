import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Dialog } from '@capacitor/dialog';

const APP_VERSION_POLICY_URL = '/app-version.json';
const UPDATE_DIALOG_TITLE = '업데이트가 필요합니다';
const UPDATE_DIALOG_BUTTON = '업데이트';

interface PlatformVersionPolicy {
  latestVersion?: string;
  minimumVersion?: string;
  forceUpdate?: boolean;
  updateMessage?: string;
  storeUrl?: string;
}

interface AppVersionPolicyResponse {
  ios?: PlatformVersionPolicy;
}

export interface RequiredAppUpdate {
  message: string;
  storeUrl?: string;
}

const parseVersionParts = (version: string): number[] =>
  version
    .split('.')
    .map((part) => Number.parseInt(part.replace(/\D.*$/, ''), 10))
    .map((part) => (Number.isFinite(part) ? part : 0));

export const compareAppVersion = (currentVersion: string, targetVersion: string): number => {
  const currentParts = parseVersionParts(currentVersion);
  const targetParts = parseVersionParts(targetVersion);
  const maxLength = Math.max(currentParts.length, targetParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const current = currentParts[index] ?? 0;
    const target = targetParts[index] ?? 0;

    if (current > target) return 1;
    if (current < target) return -1;
  }

  return 0;
};

export const getRequiredAppUpdate = (
  currentVersion: string,
  policy?: PlatformVersionPolicy,
): RequiredAppUpdate | null => {
  if (!policy) return null;

  const latestVersion = policy.latestVersion?.trim();
  const minimumVersion = policy.minimumVersion?.trim();
  const forceUpdate = policy.forceUpdate === true;
  const isBelowMinimum = minimumVersion
    ? compareAppVersion(currentVersion, minimumVersion) < 0
    : false;
  const isBelowLatest =
    forceUpdate && latestVersion ? compareAppVersion(currentVersion, latestVersion) < 0 : false;

  if (!isBelowMinimum && !isBelowLatest) return null;

  return {
    message: policy.updateMessage?.trim() || '최신 버전으로 업데이트한 뒤 다시 이용해 주세요.',
    storeUrl: policy.storeUrl?.trim() || undefined,
  };
};

const fetchAppVersionPolicy = async (): Promise<AppVersionPolicyResponse | null> => {
  try {
    const response = await fetch(`${APP_VERSION_POLICY_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return (await response.json()) as AppVersionPolicyResponse;
  } catch {
    return null;
  }
};

export const checkRequiredAppUpdate = async (): Promise<RequiredAppUpdate | null> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return null;

  const [appInfo, versionPolicy] = await Promise.all([App.getInfo(), fetchAppVersionPolicy()]);

  return getRequiredAppUpdate(appInfo.version, versionPolicy?.ios);
};

export const showRequiredAppUpdateDialog = async (update: RequiredAppUpdate): Promise<void> => {
  await Dialog.alert({
    title: UPDATE_DIALOG_TITLE,
    message: update.message,
    buttonTitle: UPDATE_DIALOG_BUTTON,
  });

  if (update.storeUrl) {
    await Browser.open({ url: update.storeUrl });
  }
};
