# 인스타 스토리 원탭 공유 (iOS pasteboard)

- 상태: open
- 발견일: 2026-07-01

## 증상

피드 상세 공유 버튼은 `@capacitor/share` 시스템 공유 시트를 열어 인스타그램을 선택할 수는
있지만, "버튼 클릭 → 인스타 스토리 편집창에 이미지가 바로 올라감"(원탭 공유)은 지원하지
않는다.

## 영향

공유 카드(9:16, `shareCard.ts`)까지는 생성되지만 스토리 공유 UX가 시스템 공유 시트를
거치는 한 단계 더 필요하다. 사용자 편의성 저하.

## 근거 또는 원인

- iOS Instagram Stories 원탭 연동은 `instagram-stories://share` URL scheme + 시스템
  pasteboard에 `com.instagram.sharedSticker.backgroundImage`/sticker 데이터를 쓰는 방식으로
  동작한다.
- WKWebView JS는 이 형식으로 iOS 시스템 pasteboard에 직접 쓸 수 없다 — 순수 웹/JS로는
  불가능하고 Swift 네이티브 코드가 필요하다.

## 재현 또는 확인 방법

피드 상세 → 공유 버튼 → 시스템 공유 시트에서 Instagram 선택 시 이미지가 스토리 편집창에
자동으로 열리지 않고 일반 공유 흐름을 탄다.

## 임시 대응

`@capacitor/share` 시스템 공유 시트로 공유 카드를 전달 → 사용자가 Instagram을 선택해
수동으로 스토리에 올린다.

## 외부 의존성 또는 담당 주체

- iOS 네이티브(Swift) 작업 필요: Capacitor custom plugin으로 `UIPasteboard.general`에
  sharedSticker payload 기록 + `instagram-stories://share` URL open.
- Xcode 빌드·실기기 검증은 Mac 환경 필요 (Windows 개발 환경에서는 진행 불가).
- 커뮤니티 Capacitor 플러그인 사용 시 Capacitor 8 호환성·유지보수 상태 확인 후 도입.

## 해소 조건

Mac 환경에서 iOS custom plugin(`InstagramStory.share({ backgroundImageBase64 })`)을
구현하고 실기기에서 원탭 스토리 공유가 확인되면 해소.

## 변경 기록

- 2026-09-23: 최초 기록 (`.claude/troubleshooting/history.md` §13.2에서 이관)
