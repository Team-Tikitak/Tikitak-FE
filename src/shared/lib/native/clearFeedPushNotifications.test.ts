import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearFeedPushNotifications } from './clearFeedPushNotifications';

const { getPlatformMock, getDeliveredNotificationsMock, removeDeliveredNotificationsMock } =
  vi.hoisted(() => ({
    getPlatformMock: vi.fn(),
    getDeliveredNotificationsMock: vi.fn(),
    removeDeliveredNotificationsMock: vi.fn(),
  }));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: getPlatformMock },
}));

vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: {
    getDeliveredNotifications: getDeliveredNotificationsMock,
    removeDeliveredNotifications: removeDeliveredNotificationsMock,
  },
}));

describe('clearFeedPushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPlatformMock.mockReturnValue('ios');
    removeDeliveredNotificationsMock.mockResolvedValue(undefined);
  });

  it('iOS에서 같은 팀·같은 피드의 알림만 알림 센터에서 지운다', async () => {
    const sameFeed = [
      { id: 'a', data: { feedId: '12', teamId: '5' } },
      { id: 'b', data: { feedId: '12', teamId: '5' } },
    ];
    getDeliveredNotificationsMock.mockResolvedValue({
      notifications: [
        ...sameFeed,
        { id: 'c', data: { feedId: '12', teamId: '7' } },
        { id: 'd', data: { feedId: '99', teamId: '5' } },
        { id: 'e' },
      ],
    });

    await clearFeedPushNotifications({ feedId: '12', teamId: '5' });

    expect(removeDeliveredNotificationsMock).toHaveBeenCalledWith({ notifications: sameFeed });
  });

  it('탭한 알림에 teamId가 없으면 feedId만으로 찾는다', async () => {
    const sameFeed = [
      { id: 'a', data: { feedId: '12', teamId: '5' } },
      { id: 'b', data: { feedId: '12' } },
    ];
    getDeliveredNotificationsMock.mockResolvedValue({
      notifications: [...sameFeed, { id: 'c', data: { feedId: '99' } }],
    });

    await clearFeedPushNotifications({ feedId: '12' });

    expect(removeDeliveredNotificationsMock).toHaveBeenCalledWith({ notifications: sameFeed });
  });

  it('같은 피드 알림이 없으면 지우지 않는다', async () => {
    getDeliveredNotificationsMock.mockResolvedValue({
      notifications: [{ id: 'c', data: { feedId: '99', teamId: '5' } }],
    });

    await clearFeedPushNotifications({ feedId: '12', teamId: '5' });

    expect(removeDeliveredNotificationsMock).not.toHaveBeenCalled();
  });

  it('iOS가 아니면 알림 센터를 조회하지 않는다', async () => {
    getPlatformMock.mockReturnValue('android');

    await clearFeedPushNotifications({ feedId: '12', teamId: '5' });

    expect(getDeliveredNotificationsMock).not.toHaveBeenCalled();
    expect(removeDeliveredNotificationsMock).not.toHaveBeenCalled();
  });
});
