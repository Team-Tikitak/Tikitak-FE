import { Capacitor } from '@capacitor/core';
import { useState } from 'react';
import { confirmDialog } from '@/shared/lib/native/nativeDialog';
import { openAppSettings } from '@/shared/lib/native/openAppSettings';
import {
  requestAppPermission,
  type AppPermission,
} from '@/shared/lib/native/requestAppPermissions';

const ALL_PERMISSIONS: AppPermission[] = ['location', 'camera', 'photos'];

export const usePermissionRequests = () => {
  const [grantedPermissions, setGrantedPermissions] = useState<Set<AppPermission>>(() => new Set());
  const [pendingPermission, setPendingPermission] = useState<AppPermission | null>(null);

  const markGranted = (permission: AppPermission) =>
    setGrantedPermissions((prev) => new Set(prev).add(permission));

  const requestPermission = async (permission: AppPermission) => {
    if (!Capacitor.isNativePlatform()) return;
    if (pendingPermission) return;

    setPendingPermission(permission);
    const granted = await requestAppPermission(permission);
    setPendingPermission(null);

    if (!granted) {
      const goSettings = await confirmDialog({
        title: '권한 설정 필요',
        message: '권한이 거부되어 있어요. 설정에서 직접 허용할 수 있어요.',
        okButtonTitle: '설정 열기',
        cancelButtonTitle: '취소',
      });
      if (goSettings) await openAppSettings();
      return;
    }
    markGranted(permission);
  };

  // 전체 동의 시 호출. iOS는 시스템 권한 팝업을 한 번에 하나만 띄우므로,
  // 각 팝업 응답을 기다리며 순차로 요청해야 위치 팝업이 묻히지 않는다.
  const requestAllPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (pendingPermission) return;

    for (const permission of ALL_PERMISSIONS) {
      if (grantedPermissions.has(permission)) continue;
      setPendingPermission(permission);
      const granted = await requestAppPermission(permission);
      if (granted) markGranted(permission);
    }
    setPendingPermission(null);
  };

  return { grantedPermissions, pendingPermission, requestPermission, requestAllPermissions };
};
