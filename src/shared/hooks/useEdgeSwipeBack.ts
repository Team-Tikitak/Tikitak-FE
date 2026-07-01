import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const EDGE_WIDTH_PX = 24;
const TRIGGER_DISTANCE_PX = 60;

// iOS 왼쪽 가장자리 스와이프 → 뒤로가기 (감지 후 ssgoi 전환 재생, 손가락 추적은 아님)
export const useEdgeSwipeBack = (onBack?: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let triggered = false;

    const canNavigateBack = () =>
      !document.querySelector('[data-vaul-drawer], [data-no-swipe-back]') &&
      (window.history.state?.idx ?? 0) > 0;

    const triggerBack = () => {
      if (triggered || !canNavigateBack()) return;
      triggered = true;
      tracking = false;
      if (onBack) {
        onBack();
        return;
      }
      navigate(-1);
    };

    const isBackSwipe = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      return dx >= TRIGGER_DISTANCE_PX && dx > Math.abs(dy) * 1.5;
    };

    const onDown = (e: PointerEvent) => {
      tracking = e.pointerType === 'touch' && e.clientX <= EDGE_WIDTH_PX;
      triggered = false;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      if (!tracking) return;
      if (isBackSwipe(e)) triggerBack();
    };

    const onUp = (e: PointerEvent) => {
      if (!tracking || triggered) return;
      tracking = false;

      if (!isBackSwipe(e)) return;
      // 시트·풀스크린 오버레이가 열려 있으면 라우트를 바꾸지 않음
      triggerBack();
    };

    const onCancel = () => {
      tracking = false;
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [navigate, onBack]);
};
