import { overlay } from 'overlay-kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { showToast } from './showToast';

vi.mock('overlay-kit', () => ({
  overlay: {
    open: vi.fn(),
    unmount: vi.fn(),
  },
}));

vi.mock('@/shared/lib/native/haptics', () => ({ triggerHaptic: vi.fn() }));

describe('showToast', () => {
  beforeEach(() => vi.clearAllMocks());

  it('같은 토스트를 다시 열기 전에 기존 오버레이를 제거한다', () => {
    showToast('완료');

    const unmount = vi.mocked(overlay.unmount);
    const open = vi.mocked(overlay.open);

    expect(unmount).toHaveBeenCalledWith('toast');
    expect(unmount.mock.invocationCallOrder[0]).toBeLessThan(open.mock.invocationCallOrder[0]);
  });

  it('기본은 성공 진동을 함께 준다', () => {
    showToast('완료');

    expect(triggerHaptic).toHaveBeenCalledWith('success');
  });

  it('haptic: false면 진동 없이 보여준다', () => {
    showToast('팀을 변경했어요', { haptic: false });

    expect(triggerHaptic).not.toHaveBeenCalled();
    expect(vi.mocked(overlay.open)).toHaveBeenCalled();
  });
});
