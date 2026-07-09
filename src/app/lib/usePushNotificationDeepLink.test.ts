import { describe, expect, it } from 'vitest';
import {
  getPushNotificationTargetPath,
  shouldInvalidateFeedQueries,
} from './usePushNotificationDeepLink';

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

describe('shouldInvalidateFeedQueries', () => {
  it('이미 같은 피드 상세를 보고 있는 댓글 알림이면 무효화한다', () => {
    expect(
      shouldInvalidateFeedQueries({ type: 'FEED_COMMENT', feedId: '12' }, '/feed/12', '/feed/12'),
    ).toBe(true);
  });

  it('다른 경로에 있으면 무효화하지 않는다 (navigate가 실제로 동작함)', () => {
    expect(
      shouldInvalidateFeedQueries({ type: 'FEED_COMMENT', feedId: '12' }, '/feed/34', '/feed/12'),
    ).toBe(false);
  });

  it('댓글 관련 알림이 아니면 무효화하지 않는다', () => {
    expect(
      shouldInvalidateFeedQueries({ type: 'UNKNOWN', feedId: '12' }, '/feed/12', '/feed/12'),
    ).toBe(false);
  });

  it('targetPath가 없으면 무효화하지 않는다', () => {
    expect(shouldInvalidateFeedQueries({ type: 'FEED_COMMENT' }, '/feed/12', null)).toBe(false);
  });
});
