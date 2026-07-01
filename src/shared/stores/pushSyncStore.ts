import { create } from 'zustand';

type PushSyncState = {
  // 값이 바뀔 때마다 usePushNotificationSync의 effect를 재실행시키는 트리거.
  // 약관 화면에서 알림 권한을 새로 허용한 뒤 토큰 등록을 다시 시도하는 데 사용한다.
  resyncNonce: number;
  requestPushSync: () => void;
};

export const usePushSyncStore = create<PushSyncState>((set) => ({
  resyncNonce: 0,
  requestPushSync: () => set((state) => ({ resyncNonce: state.resyncNonce + 1 })),
}));
