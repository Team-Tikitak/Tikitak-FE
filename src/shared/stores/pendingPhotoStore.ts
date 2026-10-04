import { create } from 'zustand';

type PendingPhotoState = {
  // 카메라 리뷰에서 확정했지만 합성이 아직 끝나지 않은 사진 수
  count: number;
  begin: () => void;
  end: () => void;
};

export const usePendingPhotoStore = create<PendingPhotoState>((set) => ({
  count: 0,
  begin: () => set((state) => ({ count: state.count + 1 })),
  end: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
}));

// 사진 합성 같은 후처리를 추적한다. 진행 중에는 작성 화면이 자리표시자를 보이고 제출을 막는다.
export const trackPendingPhoto = async <T>(job: () => Promise<T>): Promise<T> => {
  const { begin, end } = usePendingPhotoStore.getState();
  begin();
  try {
    return await job();
  } finally {
    end();
  }
};
