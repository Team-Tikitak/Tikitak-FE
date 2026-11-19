import { useEffect, useState } from 'react';
import { getGameMonth } from './selectors';

// 한 달 뒤까지 setTimeout을 걸 수는 없어서(최대 약 24일), 주기적으로 월이 바뀌었는지만 확인한다
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * 지금이 한국 시간 기준 몇 월인지 알려주고, 월이 바뀌면 화면을 다시 그리게 한다.
 * 화면을 열어 둔 채 월이 넘어가도(또는 앱을 오래 백그라운드에 뒀다 돌아와도) 새 달의 순위를 보여주기 위해 쓴다.
 */
export const useGameMonth = () => {
  const [month, setMonth] = useState(() => getGameMonth());

  useEffect(() => {
    const refresh = () => setMonth(getGameMonth());
    const timer = window.setInterval(refresh, CHECK_INTERVAL_MS);
    // 백그라운드에서는 타이머가 멈출 수 있어, 앱으로 돌아오는 순간에도 바로 확인한다
    document.addEventListener('visibilitychange', refresh);
    refresh();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return month;
};
