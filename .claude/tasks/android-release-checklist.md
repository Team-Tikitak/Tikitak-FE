# Android / Google Play Store 출시 체크리스트

iOS는 출시 완료. Android는 Capacitor `android/` 프로젝트가 이미 존재하며,
패키지명은 현재 `app.tikitak.space` 기준으로 맞춰져 있다.

이 문서는 Android 출시를 다시 진행할 때 그대로 따라 할 수 있도록 실제 절차 중심으로 기록한다.
키스토어 비밀번호 같은 민감 정보는 이 문서에 남기지 않는다.

## 현재 완료된 것

- `android/app/build.gradle`
  - `namespace = "app.tikitak.space"`
  - `applicationId "app.tikitak.space"`
  - `signingConfigs.release`가 `android/keystore.properties`를 읽도록 연결됨
  - `google-services.json`이 있으면 `com.google.gms.google-services` 플러그인 적용
- `android/app/google-services.json` 추가됨
  - Firebase Android 앱 패키지명은 `app.tikitak.space`
- `android/tikitak-release-key.jks` 생성됨
  - alias: `tikitak-release`
  - 알고리즘: RSA
  - key size: 2048
  - validity: 10000일
- `android/keystore.properties`로 릴리즈 서명 값 분리
- `.gitignore`에 Android 비밀 파일 제외 추가
  - `android/*.jks`
  - `android/keystore.properties`
- `./gradlew :app:bundleRelease` 성공
  - 생성물: `android/app/build/outputs/bundle/release/app-release.aab`

## 절대 커밋하면 안 되는 파일

- `android/tikitak-release-key.jks`
- `android/keystore.properties`

위 파일들은 로컬/비밀 저장소에서만 관리한다.
분실하면 같은 업로드 키로 업데이트를 못 할 수 있으므로 안전한 곳에 백업한다.

`android/app/google-services.json`은 팀 정책에 따라 결정한다.
현재 빌드에는 필요하며, Firebase 설정 파일로 Android 푸시/FCM 초기화에 사용된다.

## 1. Firebase Android 앱 등록

Firebase Console에서 Android 앱을 추가한다.

- Android 패키지 이름: `app.tikitak.space`
- 앱 닉네임: `Tikitak Android` 등 식별 가능한 이름
- SHA-1은 이 단계에서는 비워도 됨

등록 후 `google-services.json`을 다운로드해서 아래 위치에 둔다.

```text
android/app/google-services.json
```

Firebase SDK 추가 단계에서는 프로젝트가 Groovy Gradle을 사용하므로 Kotlin DSL 예시를 그대로 복사하지 않는다.
현재 프로젝트는 이미 Google Services Gradle 플러그인 적용 로직이 들어가 있으므로,
`google-services.json`만 있으면 Android 빌드 시 플러그인이 적용된다.

## 2. 릴리즈 키스토어 생성

프로젝트 루트에서 실행한다.

```bash
keytool -genkey -v \
  -keystore android/tikitak-release-key.jks \
  -alias tikitak-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

입력값 예시:

```text
이름과 성: Tikitak
조직 단위: Tikitak
조직 이름: Tikitak
구/군/시: Seoul
시/도: Seoul
국가 코드: KR
```

확인 프롬프트에서 `yes`가 한국어 locale에서 안 먹을 수 있다.
이 경우 `y`를 입력하면 진행된다.

정상 완료 로그 예시:

```text
Generating 2048-bit RSA key pair and self-signed certificate ...
for: CN=Tikitak, OU=Tikitak, O=Tikitak, L=Seoul, ST=Seoul, C=KR
[android/tikitak-release-key.jks을(를) 저장하는 중]
```

생성 확인:

```bash
ls -l android/tikitak-release-key.jks
```

## 3. keystore.properties 작성

`android/keystore.properties` 파일을 만들고 아래 형식으로 작성한다.

```properties
storeFile=tikitak-release-key.jks
storePassword=<키스토어 비밀번호>
keyAlias=tikitak-release
keyPassword=<키 비밀번호>
```

키 비밀번호 입력 단계에서 별도 값을 넣지 않고 Enter로 넘겼다면,
`keyPassword`는 `storePassword`와 동일하다.

이 파일은 `.gitignore`에 포함되어 있어야 하며 절대 커밋하지 않는다.

## 4. Gradle 릴리즈 서명 연결

`android/app/build.gradle`에서 아래 구조가 있어야 한다.

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')

if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

`android { ... }` 내부:

```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile rootProject.file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
```

`buildTypes.release` 내부:

```gradle
signingConfig signingConfigs.release
```

## 5. 릴리즈 AAB 빌드

프로젝트 루트에서 실행한다.

```bash
cd android
./gradlew :app:bundleRelease
```

성공 시 AAB 위치:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

이 파일을 Google Play Console에 업로드한다.

## 6. Play Console 업로드

처음에는 프로덕션이 아니라 내부 테스트 트랙부터 사용한다.

1. Play Console에서 앱 생성
2. `테스트 및 출시 > 테스트 > 내부 테스트`
3. 새 릴리즈 생성
4. `app-release.aab` 업로드
5. Play App Signing 안내가 나오면 진행

주의:

- 로컬 `tikitak-release-key.jks`는 보통 업로드 키 역할
- 실제 사용자에게 배포되는 앱 서명은 Google Play App Signing 키가 될 수 있음
- App Links 검증에는 로컬 업로드 키 SHA256이 아니라 Play Console의 앱 서명 키 SHA256이 필요할 수 있음

## 7. App Links SHA256 처리

Play Console에서 확인:

```text
설정 > 앱 무결성 > 앱 서명 > 앱 서명 키 인증서 > SHA-256 인증서 지문
```

복사한 SHA-256을 아래 파일의 placeholder와 교체한다.

```text
public/.well-known/assetlinks.json
```

기존 placeholder:

```text
REPLACE_ANDROID_SIGNING_SHA256_FINGERPRINT
```

교체 후 웹 배포가 필요하다.
`assetlinks.json`은 `app.tikitak.space/.well-known/assetlinks.json`에서 접근 가능해야 한다.

## 8. Firebase SHA256 추가

Firebase Console에서 Android 앱 `app.tikitak.space` 설정에 들어가 SHA-256 지문을 추가한다.

우선순위:

1. Play Console 앱 서명 키 SHA-256
2. 필요 시 업로드 키 SHA-256

푸시 알림만 보면 필수는 아닐 수 있지만, Google 로그인/딥링크/인증 안정성을 위해 추가하는 것이 좋다.

## 9. Play Console 필수 등록 정보

- 개인정보처리방침 URL
- 데이터 보안(Data Safety)
- 콘텐츠 등급 설문
- 앱 카테고리
- 앱 이름/설명
- 앱 아이콘
- 스크린샷
- 그래픽 이미지
- 테스트 계정 또는 심사용 안내

iOS 심사용 자료를 대부분 재활용 가능하다.

## 10. Android QA

- Android 실기기에서 로그인 확인
- FCM 푸시 수신 확인
- 푸시 클릭 시 딥링크 진입 확인
- QR/초대 링크 진입 확인
- 카메라 촬영 확인
- 갤러리 업로드 확인
- 위치 권한 및 현재 위치 확인
- 키보드가 댓글 바텀시트를 가리지 않는지 확인
- 상태바/내비게이션바 safe-area 확인
- 폴더블/긴 화면/작은 화면 레이아웃 확인

## 현재 남은 주요 작업

- [ ] Play Console 내부 테스트 트랙에 `app-release.aab` 업로드
- [ ] Play Console 앱 서명 키 SHA-256 확인
- [ ] `public/.well-known/assetlinks.json` placeholder 교체
- [ ] Firebase Android 앱에 SHA-256 추가
- [ ] 웹 배포 후 App Links 검증
- [ ] Android 실기기 QA
- [ ] Play Console 스토어 등록 정보/데이터 보안/콘텐츠 등급 작성
