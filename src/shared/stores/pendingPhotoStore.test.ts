import { describe, expect, it } from 'vitest';
import { trackPendingPhoto, usePendingPhotoStore } from './pendingPhotoStore';

describe('trackPendingPhoto', () => {
  it('작업이 진행 중인 동안 count 가 올라가고 끝나면 내려간다', async () => {
    let resolveJob: (value: string) => void = () => {};
    const job = new Promise<string>((resolve) => {
      resolveJob = resolve;
    });

    const tracked = trackPendingPhoto(() => job);
    expect(usePendingPhotoStore.getState().count).toBe(1);

    resolveJob('done');
    await expect(tracked).resolves.toBe('done');
    expect(usePendingPhotoStore.getState().count).toBe(0);
  });

  it('작업이 실패해도 count 를 원복하고 에러를 그대로 전달한다', async () => {
    await expect(trackPendingPhoto(() => Promise.reject(new Error('boom')))).rejects.toThrow(
      'boom',
    );

    expect(usePendingPhotoStore.getState().count).toBe(0);
  });
});
