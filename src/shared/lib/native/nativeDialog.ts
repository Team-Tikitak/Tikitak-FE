import { Capacitor } from '@capacitor/core';

// Single access point for native dialogs. Capacitor Dialog falls back to web dialogs on web.
export const isNativeDialogPlatform = (): boolean => Capacitor.isNativePlatform();

export const alertDialog = async (message: string, title = '오류'): Promise<void> => {
  try {
    const { Dialog } = await import('@capacitor/dialog');
    await Dialog.alert({ title, message });
  } catch {
    // Ignore dialog display failures.
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

interface PromptDialogOptions extends ConfirmDialogOptions {
  inputPlaceholder?: string;
  inputText?: string;
}

export const promptDialog = async (options: PromptDialogOptions): Promise<string | null> => {
  try {
    const { Dialog } = await import('@capacitor/dialog');
    const result = await Dialog.prompt(options);
    return result.cancelled ? null : result.value;
  } catch {
    return null;
  }
};

interface ConfirmExactTextDialogOptions extends Omit<PromptDialogOptions, 'inputText'> {
  confirmationText: string;
}

export const confirmExactTextDialog = async ({
  confirmationText,
  inputPlaceholder = confirmationText,
  ...options
}: ConfirmExactTextDialogOptions): Promise<boolean> => {
  const input = await promptDialog({
    ...options,
    inputPlaceholder,
    inputText: '',
  });
  return input?.trim() === confirmationText;
};
