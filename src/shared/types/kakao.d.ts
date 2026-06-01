declare global {
  interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
  }

  interface KakaoPoint {
    x: number;
    y: number;
  }

  interface KakaoProjection {
    containerPointFromCoords: (latLng: KakaoLatLng) => KakaoPoint;
  }

  interface KakaoLatLngBounds {
    getSouthWest: () => KakaoLatLng;
    getNorthEast: () => KakaoLatLng;
  }

  interface KakaoMap {
    getProjection: () => KakaoProjection;
    getCenter: () => KakaoLatLng;
    getLevel: () => number;
    getBounds: () => KakaoLatLngBounds;
    setCenter: (latLng: KakaoLatLng) => void;
    setLevel: (level: number, options?: { anchor?: KakaoLatLng }) => void;
    panTo: (latLng: KakaoLatLng) => void;
  }

  interface KakaoMapOptions {
    center: KakaoLatLng;
    level?: number;
  }

  type KakaoMapEventType = 'drag' | 'idle' | 'click' | 'zoom_changed' | 'center_changed';

  interface KakaoMapEvent {
    addListener: (target: KakaoMap, type: KakaoMapEventType, handler: () => void) => void;
    removeListener: (target: KakaoMap, type: KakaoMapEventType, handler: () => void) => void;
  }

  interface KakaoMapsNamespace {
    load: (callback: () => void) => void;
    Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    event: KakaoMapEvent;
  }

  interface KakaoNamespace {
    maps: KakaoMapsNamespace;
  }

  interface Window {
    kakao?: KakaoNamespace;
  }
}

export {};
