import { overlay } from 'overlay-kit';
import { Toast } from './Toast';

export const showToast = (message: string) => {
  overlay.unmount('toast');
  overlay.open(({ unmount }) => <Toast message={message} unmount={unmount} />, {
    overlayId: 'toast',
  });
};
