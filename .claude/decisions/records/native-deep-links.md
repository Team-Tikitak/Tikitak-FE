# 네이티브 딥링크 / 초대 QR

## 배경

- 상태: accepted
- 기록일: 2026-09-23

QR 초대 링크는 앱이 설치되어 있으면 Tikitak 앱 안의 초대장으로 열리고, 앱이 없으면 브라우저 웹 초대장으로 열려야 한다. 기존 OAuth 복귀는 `tikitak://oauth/callback` 커스텀 스킴을 사용하지만, QR 초대 링크는 미설치 fallback까지 필요하므로 커스텀 스킴만으로는 부족하다.

## 결정

- 상태: accepted
- 기록일: 2026-09-23

- 초대 QR은 커스텀 스킴이 아니라 HTTPS URL을 사용한다. 예: `https://app.tikitak.space/invite/{token}`.
- iOS 앱은 Universal Links로 해당 HTTPS URL을 앱에 연결한다.
- 앱이 설치되어 있으면 iOS가 Tikitak 앱을 열고, 설치되어 있지 않으면 같은 URL이 브라우저에서 열린다.
- 앱 JS는 `@capacitor/app`의 `App.addListener('appUrlOpen', ...)`와 cold start용 `App.getLaunchUrl()`에서 `/invite/:token`을 파싱해 기존 초대 수락 플로우로 보낸다.

## iOS 설정 계약

- 상태: accepted
- 기록일: 2026-09-23

Mac/Xcode 팀원이 처리해야 하는 항목:

1. Xcode Signing & Capabilities에 Associated Domains 추가.
2. domain entry 추가: `applinks:app.tikitak.space` 또는 실제 배포 도메인.
3. 서버에 `https://app.tikitak.space/.well-known/apple-app-site-association` 배포.
4. AASA에 앱의 Team ID + Bundle ID와 `/invite/*` path 등록.
5. `npx cap sync ios` 후 실기기에서 QR 스캔, Safari 탭, 카카오톡/메시지 앱 링크 탭을 각각 검증.

## 대안 / 기각 사유

- 상태: rejected
- 기록일: 2026-09-23

- `tikitak://invite/{token}` 커스텀 스킴: 앱 설치 시 열 수는 있지만, 미설치 시 브라우저 fallback이 자연스럽지 않다. QR은 외부 카메라/메신저에서 시작되므로 HTTPS Universal Link가 맞다.
- 웹에서 JS로 앱 설치 여부를 감지한 뒤 분기: iOS 보안 정책상 설치 여부 감지는 신뢰할 수 없고 UX가 흔들린다.
- Android App Links까지 동시에 진행: 현재 요청은 iOS 우선이다. Android는 `assetlinks.json`과 intent-filter 검증을 별도 단계로 진행한다.

## 검증 / 남은 리스크

- 상태: accepted
- 기록일: 2026-09-23

- 현재 결정은 구현 전 설계 기록이다. Xcode entitlement와 AASA는 Windows 환경에서 최종 검증할 수 없다.
- Universal Links는 Simulator보다 실기기 검증이 중요하다. AASA 캐시가 강하므로 도메인/Bundle ID/path를 바꾸면 재설치 또는 캐시 대기 시간이 필요할 수 있다.
- 기존 OAuth 커스텀 스킴(`tikitak://oauth/callback`)은 그대로 유지한다. 초대 QR의 HTTPS Universal Link와 목적이 다르다.
