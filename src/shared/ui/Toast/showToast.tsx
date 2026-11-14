import { overlay } from 'overlay-kit';
import { triggerHaptic } from '@/shared/lib/native/haptics';
import { Toast } from './Toast';

// 현재 토스트는 모두 완료 안내라 성공 진동을 함께 준다
export const showToast = (message: string) => {
  triggerHaptic('success');
  overlay.unmount('toast');
  overlay.open(({ unmount }) => <Toast message={message} unmount={unmount} />, {
    overlayId: 'toast',
  });
};
