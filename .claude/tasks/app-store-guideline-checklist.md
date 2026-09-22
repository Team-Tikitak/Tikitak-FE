# Apple App Store Review Guidelines Checklist

## Tikitak 앱 준수 현황 검토

### 🔴 이미 거절된 항목

- **1.2 Safety - User-Generated Content** (거절됨)
  - ❌ 콘텐츠 신고 메커니즘 미구현
  - ❌ 사용자 차단 메커니즘 미구현

---

### ⚠️ 즉시 확인 필요한 항목

#### **5.1 Privacy** (개인정보보호)

| 항목               | 현황                           | 상태         |
| ------------------ | ------------------------------ | ------------ |
| 개인정보 수집 공개 | 앱에서 수집하는 데이터 명시?   | ❓ 확인 필요 |
| Privacy Policy     | 웹사이트에 게시?               | ❓ 확인 필요 |
| 사용자 동의        | 민감 데이터 수집 시 사전 동의? | ❓ 확인 필요 |
| 데이터 삭제        | 사용자가 계정 삭제 가능?       | ❓ 확인 필요 |

#### **3.1 Business - Payments** (결제)

| 항목                 | 현황                     | 상태         |
| -------------------- | ------------------------ | ------------ |
| 유료 기능 유무       | 프리미엄/구독 있음?      | ❓ 확인 필요 |
| In-App Purchase 사용 | 있으면 Apple 결제만 허용 | ⚠️ 필수      |
| 환불 정책            | 명시되어 있음?           | ❓ 확인 필요 |

#### **4.3 Design - Web Content** (웹뷰)

| 항목         | 현황              | 상태              |
| ------------ | ----------------- | ----------------- |
| 웹뷰 사용    | 앱 내 웹뷰 있음?  | ⚠️ Capacitor 사용 |
| 전체 앱 기능 | 웹뷰가 주요 기능? | ⚠️ 확인 필요      |

#### **2.3 Metadata - App Name & Subtitle**

| 항목     | 현황              | 상태                |
| -------- | ----------------- | ------------------- |
| 앱 이름  | 정확한 앱 이름?   | ⚠️ 확인 필요        |
| Subtitle | 기능 정확히 설명? | ⚠️ 확인 필요        |
| Keywords | 관련 키워드만?    | ⚠️ 스팸 키워드 금지 |

#### **4.1 Design - Functionality**

| 항목      | 현황               | 상태           |
| --------- | ------------------ | -------------- |
| 최소 기능 | 베타 상태는 거절됨 | ⚠️ 완성도 확인 |
| 충돌/오류 | 버그 없음?         | ⚠️ QA 필수     |
| 성능      | 로딩 시간 적절?    | ⚠️ 확인 필요   |

---

### ⚠️ 권한 관련 (앱이 사용하는 경우)

| 권한          | Tikitak 사용   | 요구사항       |
| ------------- | -------------- | -------------- |
| **Camera**    | ✅ 사진 촬영   | 용도 명시 필수 |
| **Photos**    | ✅ 갤러리 접근 | 용도 명시 필수 |
| **Location**  | ✅ 지도/장소   | 용도 명시 필수 |
| **Contacts**  | ❓ 사용?       | 필요하면 명시  |
| **Bluetooth** | ❌ 미사용      | -              |
| **Health**    | ❌ 미사용      | -              |

**권한 설정 방법:**

- `Info.plist`에 `NSCamera/NSPhoto/NSLocation UsageDescription` 추가
- 앱 스토어 메타데이터에서 "App Privacy" 항목 작성

---

### 🟢 대체로 문제없을 항목

- **1.1 Illegal Content** — 콘텐츠 신고 구현 후 OK
- **2.1 App Accuracy** — 앱 설명과 실제 기능 일치
- **3.2 Advertising** — 광고 ID 추적 동의 (필요하면)
- **5.2 Health Claims** — 건강/의료 주장 없음
- **5.3 Gambling** — 도박 요소 없음

---

## 📝 즉시 조치사항

### ✅ 완료된 항목

#### 1. Privacy Policy

- ✅ 앱 내 문서 완성 (`src/pages/termsDetail/constants/privacyPolicy.ts`)
  - 제1조: 수집하는 개인정보 항목 (로그인, 프로필, 팀, 기록, 위치, 기기 로그)
  - 제2조: 수집 목적
  - 제3조: 보유 기간 (탈퇴 후 30일 ~ 5년)
  - v1.0, 시행일: 2026.07.06
- **남은 작업**: 웹사이트에 공개 URL 게시 필요

#### 2. 권한 설정 (Info.plist)

- ✅ `NSCameraUsageDescription` — "게시물 사진 촬영에 카메라를 사용해요."
- ✅ `NSPhotoLibraryUsageDescription` — "앨범에서 사진을 불러올 때 사용해요."
- ✅ `NSPhotoLibraryAddUsageDescription` — "촬영한 사진을 앨범에 저장할 때 사용해요."
- ✅ `NSLocationWhenInUseUsageDescription` — "내 주변 기록과 지도 표시에 위치를 사용해요."
- ✅ `NSLocationAlwaysAndWhenInUseUsageDescription` — "내 주변 기록과 지도 표시에 위치를 사용해요."

#### 3. 기타 기능

- ✅ Privacy 약관 동의 UI (`src/pages/terms/`)
- ✅ 계정 삭제 기능 (`deleteMe` API)
- ✅ Capacitor 웹뷰 설정 (HTTPS 기반)

---

### ⚠️ 반드시 해결해야 할 항목

#### 1순위: User-Generated Content (신고/차단) ⚠️ 앱스토어 거절됨

- ❌ 콘텐츠 신고 메커니즘 **미구현**
- ❌ 사용자 차단 메커니즘 **미구현**
- ❌ 부적절한 콘텐츠 삭제 정책 **미구현**

  **필수 구현:**
  - [ ] 게시물/댓글에 "신고" 버튼 추가
  - [ ] 사용자에게 차단 기능 제공
  - [ ] 신고 사유 분류 (스팸, 폭력, 부적절, 기타)
  - [ ] 관리자 신고 처리 대시보드 (백엔드)
  - [ ] 신고 처리 기준 및 정책 문서

#### 2순위: Privacy Policy 앱스토어 등록

- ✅ Privacy Policy 문서 완성
- ✅ 공개 URL 존재 (`https://tiki-tak-2026.notion.site/...`)
- ✅ 앱스토어 Connect에 URL 등록 완료

#### 3순위: 메타데이터

- [ ] 앱 설명 정확성 검토 (앱스토어 Connect)
- [ ] 스크린샷이 최신 UI와 일치하는지 확인
- [ ] 키워드에 스팸 없는지 확인

#### 4순위: 기능 완성도 (QA)

- [ ] 버그 테스트
- [ ] 크래시 테스트
- [ ] 성능 테스트 (로딩 시간)
- [ ] 권한 요청 플로우 검증

---

## 🔗 참고 자료

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Privacy](https://developer.apple.com/app-store/app-privacy/)
- [Privacy Policy Template](https://www.privacypolicies.com/blog/sample-privacy-policy-template/)
