// 네이티브 다이얼로그 접근 단일 지점 (웹은 @capacitor/dialog가 window alert/confirm으로 폴백)
export const alertDialog = async (message: string, title = '오류'): Promise<void> => {
  try {
    const { Dialog } = await import('@capacitor/dialog');
    await Dialog.alert({ title, message });
  } catch {
    // 다이얼로그 표시 실패는 무시
  }
};

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  okButtonTitle?: string;
  cancelButtonTitle?: string;
}

export const confirmDialog = async (options: ConfirmDialogOptions): Promise<boolean> => {
  try {
    const { Dialog } = await import('@capacitor/dialog');
    return (await Dialog.confirm(options)).value;
  } catch {
    return false;
  }
};
