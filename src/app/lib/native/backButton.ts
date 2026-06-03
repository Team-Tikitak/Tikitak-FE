import { App } from '@capacitor/app';

export const setupBackButton = (): void => {
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
};
