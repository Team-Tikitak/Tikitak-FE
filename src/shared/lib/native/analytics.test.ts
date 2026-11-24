import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  isNativePlatform,
  isPluginAvailable,
  logEvent,
  setCurrentScreen,
  setEnabled,
  pluginImported,
} = vi.hoisted(() => ({
  isNativePlatform: vi.fn(),
  isPluginAvailable: vi.fn(),
  logEvent: vi.fn(),
  setCurrentScreen: vi.fn(),
  setEnabled: vi.fn(),
  pluginImported: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform, isPluginAvailable } }));
vi.mock('@capacitor-firebase/analytics', () => {
  pluginImported();
  return { FirebaseAnalytics: { logEvent, setCurrentScreen, setEnabled } };
});

// 동적 import 완료까지 마이크로태스크를 비운다
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// 플러그인 로드 결과를 모듈 안에 캐시하므로 테스트마다 새로 불러온다
const loadModule = () => import('./analytics');

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(true);
    isPluginAvailable.mockReturnValue(true);
    logEvent.mockResolvedValue(undefined);
    setCurrentScreen.mockResolvedValue(undefined);
    setEnabled.mockResolvedValue(undefined);
  });

  it('앱에서 이벤트를 기록한다', async () => {
    const { logAnalyticsEvent } = await loadModule();

    logAnalyticsEvent('feed_create', { teamId: 3 });
    await flush();

    expect(logEvent).toHaveBeenCalledWith({ name: 'feed_create', params: { teamId: 3 } });
  });

  it('앱에서 화면 조회를 기록한다', async () => {
    const { setAnalyticsScreen } = await loadModule();

    setAnalyticsScreen('/feed/12');
    await flush();

    expect(setCurrentScreen).toHaveBeenCalledWith({ screenName: '/feed/12' });
  });

  it('동의 여부에 따라 수집을 켜고 끈다', async () => {
    const { setFirebaseAnalyticsEnabled } = await loadModule();

    setFirebaseAnalyticsEnabled(true);
    setFirebaseAnalyticsEnabled(false);
    await flush();

    expect(setEnabled).toHaveBeenNthCalledWith(1, { enabled: true });
    expect(setEnabled).toHaveBeenNthCalledWith(2, { enabled: false });
  });

  it('웹에서는 플러그인을 불러오지 않는다', async () => {
    isNativePlatform.mockReturnValue(false);
    const { logAnalyticsEvent } = await loadModule();

    logAnalyticsEvent('feed_create');
    await flush();

    expect(pluginImported).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('플러그인이 없는 구버전 앱에서는 불러오기 전에 멈춘다', async () => {
    isPluginAvailable.mockReturnValue(false);
    const { logAnalyticsEvent, setAnalyticsScreen } = await loadModule();

    logAnalyticsEvent('feed_create');
    setAnalyticsScreen('/feed/12');
    await flush();

    expect(isPluginAvailable).toHaveBeenCalledWith('FirebaseAnalytics');
    expect(pluginImported).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
    expect(setCurrentScreen).not.toHaveBeenCalled();
  });

  it('플러그인 판별은 처음 한 번만 한다', async () => {
    const { logAnalyticsEvent } = await loadModule();

    logAnalyticsEvent('a');
    logAnalyticsEvent('b');
    await flush();

    expect(isPluginAvailable).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledTimes(2);
  });

  it('네이티브 호출이 실패해도 예외를 던지지 않는다', async () => {
    logEvent.mockRejectedValue(new Error('native error'));
    const { logAnalyticsEvent } = await loadModule();

    expect(() => logAnalyticsEvent('feed_create')).not.toThrow();
    await flush();

    expect(logEvent).toHaveBeenCalledTimes(1);
  });
});
