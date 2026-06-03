import { Capacitor } from '@capacitor/core';
import { useState } from 'react';
import { alertDialog } from '@/shared/lib/native/nativeDialog';
import {
  requestAppPermission,
  type AppPermission,
} from '@/shared/lib/native/requestAppPermissions';

export const usePermissionRequests = () => {
  const [grantedPermissions, setGrantedPermissions] = useState<Set<AppPermission>>(() => new Set());
  const [pendingPermission, setPendingPermission] = useState<AppPermission | null>(null);

  const requestPermission = async (permission: AppPermission) => {
    if (!Capacitor.isNativePlatform()) return;
    if (pendingPermission) return;

    setPendingPermission(permission);
    const granted = await requestAppPermission(permission);
    setPendingPermission(null);

    if (!granted) {
      await alertDialog(
        '권한 팝업이 뜨지 않으면 iOS 설정에서 앱 권한을 허용해주세요.',
        '권한 설정 필요',
      );
      return;
    }
    setGrantedPermissions((prev) => new Set(prev).add(permission));
  };

  return { grantedPermissions, pendingPermission, requestPermission };
};
