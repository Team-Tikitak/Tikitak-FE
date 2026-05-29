import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'space.tikitak.app',
  appName: 'Tikitak',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#ffffff',
    scrollEnabled: false,
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    Keyboard: {
      resize: 'native',
      style: 'default',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
