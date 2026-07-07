import { describe, expect, it } from 'vitest';
import { getPushNotificationTargetPath } from './usePushNotificationDeepLink';

describe('getPushNotificationTargetPath', () => {
  it('피드 알림 데이터에서 피드 상세 경로를 만든다', () => {
    expect(getPushNotificationTargetPath({ type: 'FEED_COMMENT', feedId: '12' })).toBe('/feed/12');
    expect(getPushNotificationTargetPath({ type: 'FEED_COMMENT_REPLIED', feedId: '34' })).toBe(
      '/feed/34',
    );
    expect(getPushNotificationTargetPath({ type: 'DAILY_QUESTION_UPLOADED', feedId: '56' })).toBe(
      '/feed/56',
    );
  });

  it('지원하지 않는 알림이나 feedId 없는 데이터는 경로를 만들지 않는다', () => {
    expect(getPushNotificationTargetPath({ type: 'UNKNOWN', feedId: '12' })).toBeNull();
    expect(getPushNotificationTargetPath({ type: 'FEED_COMMENT' })).toBeNull();
  });
});
