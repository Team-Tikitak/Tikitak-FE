import { overlay } from 'overlay-kit';
import { Toast } from './Toast';

export const showToast = (message: string) => {
  overlay.open(({ unmount }) => <Toast message={message} unmount={unmount} />, {
    overlayId: 'toast',
  });
};
