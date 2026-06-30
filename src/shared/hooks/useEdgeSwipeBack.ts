import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const EDGE_WIDTH_PX = 24;
const TRIGGER_DISTANCE_PX = 70;

// iOS 왼쪽 가장자리 스와이프 → 뒤로가기 (감지 후 ssgoi 전환 재생, 손가락 추적은 아님)
export const useEdgeSwipeBack = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onDown = (e: PointerEvent) => {
      tracking = e.pointerType === 'touch' && e.clientX <= EDGE_WIDTH_PX;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onUp = (e: PointerEvent) => {
      if (!tracking) return;
      tracking = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const isBackSwipe = dx >= TRIGGER_DISTANCE_PX && dx > Math.abs(dy) * 1.5;
      if (!isBackSwipe) return;
      // 시트·풀스크린 오버레이가 열려 있으면 라우트를 바꾸지 않음
      if (document.querySelector('[data-vaul-drawer], [data-no-swipe-back]')) return;
      if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    };

    const onCancel = () => {
      tracking = false;
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onCancel, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [navigate]);
};
