import { useState } from 'react';
import { confirmDialog } from '@/shared/lib/native/nativeDialog';

const confirmRetry = (message: string): Promise<boolean> =>
  confirmDialog({
    title: '실패했어요',
    message: `${message}\n다시 시도할까요?`,
    okButtonTitle: '다시 시도',
    cancelButtonTitle: '취소',
  });

// task 실행 후 실패 시 재시도 다이얼로그. 성공 후처리(navigate 등)는 task가 담당
export const useShareSubmit = (errorMessage: string) => {
  const [isSharing, setIsSharing] = useState(false);

  const attempt = async (task: () => Promise<void>) => {
    try {
      await task();
    } catch (error) {
      console.error(errorMessage, error);
      if (await confirmRetry(errorMessage)) await attempt(task);
    }
  };

  const submit = async (task: () => Promise<void>) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await attempt(task);
    } finally {
      setIsSharing(false);
    }
  };

  return { submit, isSharing };
};
