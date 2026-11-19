import { overlay } from 'overlay-kit';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { Toast } from './Toast';

interface ShowToastOptions {
  /** 가벼운 안내(예: 팀 전환)는 진동 없이 보여준다. 기본은 성공 진동을 함께 준다 */
  haptic?: boolean;
}

// 기본 토스트는 완료 안내라 성공 진동을 함께 준다
export const showToast = (message: string, { haptic = true }: ShowToastOptions = {}) => {
  if (haptic) triggerHaptic('success');
  overlay.unmount('toast');
  overlay.open(({ unmount }) => <Toast message={message} unmount={unmount} />, {
    overlayId: 'toast',
  });
};
