import { Capacitor } from '@capacitor/core';
import type { FirebaseAnalyticsPlugin } from '@capacitor-firebase/analytics';

export type AnalyticsParams = Record<string, string | number | boolean>;

const PLUGIN_NAME = 'FirebaseAnalytics';

let analyticsPromise: Promise<{ analytics: FirebaseAnalyticsPlugin } | null> | null = null;

// 플러그인을 import하면 구버전 바이너리에서도 isPluginAvailable이 true가 되므로 import 전에 판별한다.
// 프록시를 그대로 resolve하면 then이 네이티브 호출로 취급돼 멈추므로 객체로 감싼다.
const loadAnalytics = () => {
  analyticsPromise ??= (async () => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable(PLUGIN_NAME)) return null;
    const { FirebaseAnalytics } = await import('@capacitor-firebase/analytics');
    return { analytics: FirebaseAnalytics };
  })().catch(() => null);
  return analyticsPromise;
};

const runAnalytics = (task: (analytics: FirebaseAnalyticsPlugin) => Promise<void>): void => {
  void loadAnalytics()
    .then((loaded) => (loaded ? task(loaded.analytics) : undefined))
    .catch(() => {
      // 수집 실패가 사용자 동작을 막지 않게 한다
    });
};

export const logAnalyticsEvent = (name: string, params?: AnalyticsParams): void => {
  runAnalytics((analytics) => analytics.logEvent({ name, params }));
};

export const setAnalyticsScreen = (screenName: string): void => {
  runAnalytics((analytics) => analytics.setCurrentScreen({ screenName }));
};

// 네이티브 설정에서 자동 수집을 꺼 두고, 약관 동의 후에만 켠다. 설정값은 앱 재실행 후에도 유지된다.
export const setFirebaseAnalyticsEnabled = (enabled: boolean): void => {
  runAnalytics((analytics) => analytics.setEnabled({ enabled }));
};
