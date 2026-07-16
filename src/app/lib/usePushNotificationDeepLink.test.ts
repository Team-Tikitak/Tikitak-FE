import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPushNotificationTargetPath,
  shouldInvalidateFeedQueries,
  usePushNotificationDeepLink,
} from './usePushNotificationDeepLink';

const {
  navigateMock,
  isNativePlatformMock,
  addListenerMock,
  removeMock,
  patchActiveTeamMock,
  readNotificationMock,
  openConfirmDialogMock,
  activeTeamIdMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  isNativePlatformMock: vi.fn(),
  addListenerMock: vi.fn(),
  removeMock: vi.fn(),
  patchActiveTeamMock: vi.fn(),
  readNotificationMock: vi.fn(),
  openConfirmDialogMock: vi.fn(),
  activeTeamIdMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: '/feed' }),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: isNativePlatformMock },
}));

vi.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: { addListener: addListenerMock },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@/shared/api/notification/queries', () => ({
  useReadNotification: () => ({ mutate: readNotificationMock }),
}));

vi.mock('@/shared/api/user/queries', () => ({
  usePatchActiveTeam: () => ({ mutate: patchActiveTeamMock }),
}));

vi.mock('@/shared/hooks/team/useActiveTeamId', () => ({
  useActiveTeamId: () => activeTeamIdMock(),
}));

vi.mock('@/shared/stores/authStore', () => {
  const state = { accessToken: 'access-token' };
  const useAuthStore = Object.assign(
    (selector: (current: typeof state) => unknown) => selector(state),
    { getState: () => state },
  );
  return { useAuthStore };
});

vi.mock('@/shared/api/auth/restoreSession', () => ({
  restoreSession: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/shared/lib/routing/redirectAfterLogin', () => ({
  saveRedirectAfterLogin: vi.fn(),
}));

vi.mock('@/shared/ui/ConfirmDialog/openConfirmDialog', () => ({
  openConfirmDialog: openConfirmDialogMock,
}));

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

describe('usePushNotificationDeepLink 팀 전환', () => {
  type PushHandler = (event: { notification?: { data?: Record<string, string> } }) => void;
  type MutateOptions = { onSuccess?: () => void; onError?: (error: Error) => void };
  let pushHandler: PushHandler | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    pushHandler = undefined;
    isNativePlatformMock.mockReturnValue(true);
    activeTeamIdMock.mockReturnValue(1);
    addListenerMock.mockImplementation((_event: string, handler: PushHandler) => {
      pushHandler = handler;
      return Promise.resolve({ remove: removeMock });
    });
    // isReadyForDeepLink가 스플래시(ROOT)로 판정하지 않도록 실제 경로를 옮겨둔다
    window.history.pushState({}, '', '/feed');
  });

  const renderDeepLinkWithListener = async () => {
    renderHook(() => usePushNotificationDeepLink());
    // FirebaseMessaging 동적 import·리스너 등록 완료까지 플러시
    await act(async () => {});
    expect(pushHandler).toBeDefined();
  };

  const emitPush = async (data: Record<string, string>) => {
    await act(async () => {
      pushHandler?.({ notification: { data } });
    });
  };

  it('다른 팀 알림이면 팀 전환 성공 후 피드 상세로 이동한다', async () => {
    patchActiveTeamMock.mockImplementation((_teamId: number, options?: MutateOptions) =>
      options?.onSuccess?.(),
    );

    await renderDeepLinkWithListener();
    await emitPush({ type: 'FEED_COMMENT', feedId: '12', teamId: '2', notificationId: '7' });

    expect(patchActiveTeamMock).toHaveBeenCalledWith(2, expect.anything());
    expect(navigateMock).toHaveBeenCalledWith('/feed/12');
    expect(openConfirmDialogMock).not.toHaveBeenCalled();
  });

  it('팀 전환이 실패하면 상세로 진입하지 않고 오류 다이얼로그를 띄운다', async () => {
    patchActiveTeamMock.mockImplementation((_teamId: number, options?: MutateOptions) =>
      options?.onError?.(new Error('network error')),
    );

    await renderDeepLinkWithListener();
    await emitPush({ type: 'FEED_COMMENT', feedId: '12', teamId: '2' });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(openConfirmDialogMock).toHaveBeenCalledWith(
      expect.objectContaining({ showCancel: false }),
    );
  });

  it('같은 팀 알림이면 팀 전환 없이 바로 이동한다', async () => {
    await renderDeepLinkWithListener();
    await emitPush({ type: 'FEED_COMMENT', feedId: '12', teamId: '1' });

    expect(patchActiveTeamMock).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/feed/12');
  });
});
