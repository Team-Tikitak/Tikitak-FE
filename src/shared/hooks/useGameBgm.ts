import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { unlockAudio, type Bgm } from '@/shared/lib/sound';
import { useSoundStore } from '@/shared/stores/soundStore';

/**
 * 게임 배경음악을 판이 진행되는 동안(playing)만 튼다.
 * 소리를 끄거나, 앱을 내리거나, 다른 화면으로 이동하면 멈춘다.
 * 화면 전환 중에는 이전 화면이 잠시 남아 있어서, 정리(언마운트)만 기다리지 않고 주소가 바뀌는 즉시 끈다.
 * 뒤로 가기 버튼, 스와이프 뒤로 가기, 안드로이드 뒤로 가기 모두 같은 경로로 처리된다.
 */
export const useGameBgm = (bgm: Bgm, playing: boolean) => {
  const soundEnabled = useSoundStore((state) => state.enabled);
  const { pathname } = useLocation();
  // 처음 들어온 주소. 렌더 중에 ref를 읽지 않도록 state로 고정해 둔다
  const [gamePath] = useState(pathname);
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    bgm.preload();
    const syncVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      bgm.stop();
    };
  }, [bgm]);

  const shouldPlay = playing && soundEnabled && visible && pathname === gamePath;

  useEffect(() => {
    if (shouldPlay) {
      // 앱을 내렸다 오면 오디오가 멈춰 있을 수 있어 다시 깨운다
      unlockAudio();
      bgm.start();
    } else {
      bgm.stop();
    }
  }, [shouldPlay, bgm]);
};
