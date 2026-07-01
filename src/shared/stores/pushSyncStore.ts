import { create } from 'zustand';

type PushSyncState = {
  // 값이 바뀔 때마다 usePushNotificationSync의 effect를 재실행시키는 트리거.
  resyncNonce: number;
  requestPushSync: () => void;
};

export const usePushSyncStore = create<PushSyncState>((set) => ({
  resyncNonce: 0,
  requestPushSync: () => set((state) => ({ resyncNonce: state.resyncNonce + 1 })),
}));
