# Domain: Native / Capacitor / Camera

Capacitor native bridge, WebView viewport, back button, keyboard inset, camera/sticker 조작과 관련된 도메인.

## 주요 위치

```text
src/app/lib/native/
├── backButton.ts
├── keyboardInsets.ts
├── statusBar.ts
└── viewport.ts

src/app/lib/initNativeBridge.ts
src/shared/hooks/camera/
src/shared/api/media/
```

## 작업 기준

- Web API와 Capacitor API는 availability check 없이 직접 호출하지 않는다.
- native bridge 초기화는 `src/app/lib/initNativeBridge.ts`와 `src/app/lib/native/*` 패턴을 따른다.
- camera stream, capture, pending sticker, pinch/drag, trash zone은 hook 단위 책임을 유지한다.
- 이미지 저장/업로드는 `shared/api/media`와 image utility 경계를 확인한다.
- iOS/Android safe area, keyboard inset, hardware back behavior를 UI 변경과 함께 고려한다.

## 검증

- camera hook 변경: 관련 `usePendingSticker.test.ts`, `useTrashDragZone.test.ts`
- WebView layout 변경: 모바일 viewport E2E 또는 실제 device 확인
- native API 변경: browser fallback과 Capacitor runtime 양쪽 동작을 구분해 보고한다.
