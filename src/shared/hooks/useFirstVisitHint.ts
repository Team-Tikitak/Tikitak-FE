import { useCallback, useState } from 'react';

const readSeen = (storageKey: string) => {
  try {
    return localStorage.getItem(storageKey) === '1';
  } catch {
    return false;
  }
};

const writeSeen = (storageKey: string) => {
  try {
    localStorage.setItem(storageKey, '1');
  } catch {
    // 차단 시 다음 진입에 다시 노출
  }
};

export const useFirstVisitHint = (storageKey: string) => {
  const [seen, setSeen] = useState(() => readSeen(storageKey));

  const markSeen = useCallback(() => {
    writeSeen(storageKey);
    setSeen(true);
  }, [storageKey]);

  return { seen, markSeen };
};
