import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.tikitak.space',
  appName: 'Tikitak',
  webDir: 'dist',
  server: {
    url: 'https://app.tikitak.space',
    // 서버에 연결할 수 없을 때 앱에 들어 있는 오프라인 페이지를 보여준다 (iOS는 네트워크 실패만 해당)
    errorPath: 'offline.html',
    androidScheme: 'https',
    iosScheme: 'https',
  },
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
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#ffffff',
    },
    SystemBars: {
      insetsHandling: 'css',
      style: 'LIGHT',
      hidden: false,
      animation: 'NONE',
    },
    SplashScreen: {
      // 웹이 hideNativeSplash()로 직접 닫는다. 웹이 뜨지 않을 때를 위한 안전장치 시간
      launchShowDuration: 3000,
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
