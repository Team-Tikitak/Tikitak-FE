import { openOverlay } from '@/shared/lib';
import { BottomSheetOverlay } from '@/shared/ui/BottomSheet';
import { NotificationSettingsSheetContainer } from '../ui/NotificationSettingsSheetContainer';

export const useNotificationSettingsSheet = () => {
  const openSheet = () => {
    openOverlay(({ isOpen, close, unmount }) => (
      <BottomSheetOverlay
        open={isOpen}
        onClose={close}
        onExitComplete={unmount}
        ariaTitle="알림 설정"
        ariaDescription="푸시 알림 수신 여부를 설정하세요"
      >
        <NotificationSettingsSheetContainer />
      </BottomSheetOverlay>
    ));
  };

  return { openSheet };
};
