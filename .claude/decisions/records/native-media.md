# 네이티브 미디어 / 카메라 처리

## 배경

- 상태: accepted
- 기록일: 2026-09-23

Tikitak은 웹 우선 React 앱을 Capacitor로 패키징한다. 그래서 사진 선택/카메라/공유 이미지는 웹 브라우저와 iOS WKWebView에서 URL, 권한, 파일 접근 방식이 다르다. 특히 iOS 앱에서 `capacitor://localhost/_capacitor_file_...` 리소스를 웹 `fetch`로 읽으면 mixed content/access control 차단이 발생할 수 있다.

## 결정

- 상태: accepted
- 기록일: 2026-07

### 갤러리 파일 읽기

- 네이티브 `Camera.pickImages()` 결과는 `photo.path`가 있으면 `@capacitor/filesystem`의 `Filesystem.readFile()`로 읽고, base64를 `Blob`으로 변환한다.
- 웹 파일 선택은 기존처럼 `<input type="file">`과 `File` 객체를 사용한다.
- `capacitor://localhost/_capacitor_file_...` URL을 `fetch()`로 읽는 방식은 사용하지 않는다. 화면 표시에는 동작할 수 있어도, Blob 변환/업로드용 읽기에서는 iOS WebView 보안 정책에 막힌다.

### 사진 선택 추상화

- `usePhotoSourcePicker`는 웹/네이티브 분기를 감싼 공통 진입점으로 유지한다.
- 기본 `source: 'all'`은 카메라/갤러리 선택 액션시트를 띄우고, `source: 'gallery'`는 갤러리만 바로 연다.
- `acceptedMimeTypes`, `maxFileSizeBytes`, `remaining`을 hook 옵션으로 받아 호출 화면이 제약을 명시한다.
- 팀/프로필 이미지 설정은 갤러리 선택만 허용한다. 네이티브에서 받은 `CapturedPhoto.blob`은 기존 업로드 흐름과 맞추기 위해 `File`로 변환한다.

### 커스텀 카메라 프리뷰

- 커스텀 카메라는 sticker 편집 UX 때문에 `getUserMedia` 기반 stream을 유지한다.
- stream constraint는 리뷰 카드와 같은 세로 비율(`CAMERA_REVIEW_IMAGE_WIDTH / CAMERA_REVIEW_IMAGE_HEIGHT`)을 ideal로 둔다.
- `isReady`는 `video.play()` 또는 `loadeddata` 이후 다음 animation frame에 true로 바꾼다. stream 획득 직후 바로 보여주면 iOS에서 preview scale이 한 번 더 보정되며 뚝 끊기는 체감이 생긴다.

### iOS 네이티브 카메라 전환 (다음 재심사 빌드)

- 2026-07 QA에서 iOS 앱 커스텀 카메라 1x 프리뷰가 기본 카메라 앱보다 약 1.2x 확대된 것처럼 보이고, 줌 전환/프리뷰에서 한 번 뚝 끊기는 현상이 관찰됐다.
- WebView `getUserMedia`는 `facingMode`, `width/height`, `aspectRatio`, `zoom`을 제약으로 요청할 수 있지만, iPhone 기본 카메라 앱과 동일한 물리 렌즈/화각/줌 램핑을 보장하지 않는다.
- 2026-07-08 추가 판단: 화면을 꽉 채운 커스텀 프리뷰에서는 WebView crop/zoom 보정만으로 기본 iPhone 카메라 1x 화각과 화질을 충분히 맞추기 어렵다. 출시 전에는 웹 구현을 최대한 안정화하고, 다음 iOS 재심사 빌드에서는 카메라 품질 개선 항목으로 네이티브 전환을 진행한다.
- 출시 직전 웹 안정화 범위: 3:4 세로 stream 요청, full-cover 프리뷰의 체감 화각 보정, zoom constraint throttling으로 인위적인 확대감과 프레임 드랍 가능성을 줄인다.
- 다음 iOS 재심사 빌드에서는 React `CameraOverlay` 화면은 유지하고 iOS native plugin으로 preview/capture/zoom만 이전한다.
- 기대 효과:
  - WebView 커스텀 카메라보다 기본 iPhone 카메라에 가까운 화각/줌 동작을 제공한다.
  - 기본 카메라 앱과 100% 동일한 후처리 품질은 보장할 수 없지만, WebView `getUserMedia`보다 캡처 품질과 프리뷰 안정성이 좋아질 가능성이 높다.
  - 저조도, 문서/글자 촬영, 흔들림 상황에서 현재 WebView 구현보다 더 나은 결과를 목표로 한다.
- 네이티브 구현 목표:
  - `AVCaptureSession` + `AVCaptureVideoPreviewLayer` 기반 live preview.
  - iPhone 기본 카메라 1x/2x에 최대한 맞는 device selection 및 `videoZoomFactor` 제어.
  - `startPreview`, `setZoom(1 | 2)`, `capture`, `stopPreview` JS bridge 제공.
  - 촬영 결과는 기존 `CapturedPhoto`/리뷰/필터/스티커/업로드 흐름과 호환되는 Blob 또는 file URL로 변환.
  - React 버튼, 줌 토글, 필터 트레이, 스티커 리뷰 UI는 가능한 한 유지.
- App Store 관점:
  - Swift native plugin, iOS project 설정, 권한/Info.plist 변경이 들어가면 새 iOS 바이너리이므로 App Store Connect에 새 빌드를 업로드하고 재심사를 받아야 한다.
  - 카메라 권한 문구와 심사 메모에 커스텀 카메라 사용 목적을 명확히 남긴다.

### 카메라 리뷰 하단 액션

- 필터/스티커 UI가 열리거나 드래그 중이면 업로드 버튼은 숨긴다.
- 업로드 버튼을 절대 위치로 둘 때는 safe-area 포함 하단 padding을 함께 확보해 필터 라벨/스티커 버튼과 겹치지 않게 한다.
- 장기적으로 레이아웃을 다시 만질 경우, 절대 위치 버튼보다 `image / editor controls / footer action`을 flex column으로 나누는 구조가 더 안정적이다.

### 공유 카드

- 피드 상세 공유 이미지는 canvas에서 9:16(`1080x1920`) 카드로 생성한다. Instagram Story 기준은 4:3이 아니라 9:16이다.
- 앱에서는 `@capacitor/filesystem` cache file + `@capacitor/share` 시스템 공유 시트를 사용하고, 브라우저에서는 생성된 jpg를 다운로드한다.
- Instagram Story 편집창을 바로 열고 이미지까지 넣는 원탭 공유는 Swift/네이티브 plugin이 필요하다. JS/WKWebView만으로 iOS pasteboard의 Instagram sharedSticker payload를 쓸 수 없다.

## 대안 / 기각 사유

- 상태: rejected
- 기록일: 2026-09-23

- `fetch(photo.webPath)` 또는 `fetch(capacitor://...)`로 Blob 생성: iOS 앱에서 access control/mixed content 차단. 화면 표시와 파일 읽기는 보안 모델이 다르다.
- 프로필 이미지도 카메라 허용: 현재 요구사항은 갤러리 선택만이며, 프로필 설정에서 카메라 액션시트를 띄우면 기대 동작이 흐려진다.
- `@capacitor/camera`로 커스텀 카메라 전체 교체: OS 카메라/피커는 단순 촬영에는 좋지만, 현재 sticker editor는 live preview와 canvas 합성이 핵심이라 stream 기반 구현을 유지한다.
- 공유 카드를 4:3으로 생성: Instagram Feed 일부 맥락에는 맞을 수 있으나, 사용자가 원하는 공유 대상은 Story 중심이라 9:16을 채택한다.
- WebView만으로 iPhone 기본 카메라 1x/2x와 완전 동일 화각 보장: 브라우저/WebView가 물리 카메라 선택과 zoom 적용을 추상화하므로 보장 불가. 출시 직전에는 웹 안정화, 다음 재심사 빌드에서는 native plugin 검토.

## 검증 / 남은 리스크

- 상태: accepted
- 기록일: 2026-09-23

- 검증: `yarn type-check`, 관련 파일 ESLint, `FeedGrid`/`FeedImageDetail` targeted Vitest, 팀 프로필 설정 hook 테스트.
- 남은 리스크: iOS 실기기에서 갤러리 파일 MIME/확장자 케이스가 더 다양할 수 있다. `photo.format`이 비어 있거나 HEIC가 들어오는 경우 서버 업로드 허용 범위를 별도로 확인해야 한다.
- 남은 리스크: 카메라 preview scale 안정성은 기기 카메라 드라이버와 브라우저 구현 영향을 받는다. 실기기에서 남는 튐이 있으면 constraint를 더 느슨하게 두고 review 단계 crop만 강제하거나, 다음 재심사 빌드에서 iOS native camera plugin으로 전환한다.
