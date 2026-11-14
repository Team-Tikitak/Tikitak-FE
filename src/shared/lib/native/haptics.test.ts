import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerHaptic } from './haptics';

const { isNativePlatform, isPluginAvailable, impact, notification, selectionChanged } = vi.hoisted(
  () => ({
    isNativePlatform: vi.fn(),
    isPluginAvailable: vi.fn(),
    impact: vi.fn(),
    notification: vi.fn(),
    selectionChanged: vi.fn(),
  }),
);

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform, isPluginAvailable } }));
vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact, notification, selectionChanged },
  ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' },
  NotificationType: { Success: 'SUCCESS', Error: 'ERROR' },
}));

// 동적 import 완료까지 마이크로태스크를 비운다
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('triggerHaptic', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isNativePlatform.mockReturnValue(true);
    isPluginAvailable.mockReturnValue(true);
    impact.mockResolvedValue(undefined);
    notification.mockResolvedValue(undefined);
    selectionChanged.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('웹에서는 아무것도 하지 않는다', async () => {
    isNativePlatform.mockReturnValue(false);

    triggerHaptic('light');
    await flush();

    expect(impact).not.toHaveBeenCalled();
  });

  it('플러그인이 없는 구버전 앱에서는 아무것도 하지 않는다', async () => {
    isPluginAvailable.mockReturnValue(false);

    triggerHaptic('light');
    await flush();

    expect(impact).not.toHaveBeenCalled();
  });

  it('종류별로 알맞은 진동을 준다', async () => {
    triggerHaptic();
    await vi.waitFor(() => expect(impact).toHaveBeenCalledTimes(1));
    triggerHaptic('medium');
    await vi.waitFor(() => expect(impact).toHaveBeenCalledTimes(2));
    triggerHaptic('selection');
    await vi.waitFor(() => expect(selectionChanged).toHaveBeenCalledTimes(1));
    triggerHaptic('success');
    await vi.waitFor(() => expect(notification).toHaveBeenCalledTimes(1));
    triggerHaptic('error');
    await vi.waitFor(() => expect(notification).toHaveBeenCalledTimes(2));

    expect(impact).toHaveBeenNthCalledWith(1, { style: 'LIGHT' });
    expect(impact).toHaveBeenNthCalledWith(2, { style: 'MEDIUM' });
    expect(selectionChanged).toHaveBeenCalledTimes(1);
    expect(notification).toHaveBeenNthCalledWith(1, { type: 'SUCCESS' });
    expect(notification).toHaveBeenNthCalledWith(2, { type: 'ERROR' });
  });

  it('진동이 실패해도 예외를 던지지 않는다', async () => {
    impact.mockRejectedValue(new Error('unavailable'));

    expect(() => triggerHaptic('light')).not.toThrow();
    await flush();
  });
});
