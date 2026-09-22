# 코드 컨벤션 (Code Convention)

## 네이밍 규칙

### 한글 발음 영어 표기 피하기

한글 발음을 영어로 표기하는 것은 피함, 의미에 맞는 **정확한 영어 단어**를 사용

**예외:** 고유명사/브랜드명

- ❌ 나쁜 예: `moohyungJasan` (무형자산)
- ✅ 좋은 예: `intangibleAssets`

### 클래스 이름: PascalCase

- ❌ `class reservation {}`, `class Accesstoken {}`
- ✅ `class Reservation {}`, `class AccessToken {}`

### 함수 및 변수: camelCase

- ❌ `function GetData() {}`, `function process_data() {}`
- ✅ `function getData() {}`, `function processData() {}`

### 상수: SCREAMING_SNAKE_CASE

`const`로 선언된 변하지 않는 값(상수)은 대문자 + 언더스코어 방식을 사용

```tsx
const MAX_LENGTH = 255;
const DEFAULT_TIMEOUT_MS = 3000;
const API_BASE_URL = 'https://api.example.com';
```

일반 변수에 `const`를 사용하는 경우는 camelCase를 유지: `const userId = 123;`

## 네이밍 요약

| 대상               | 표기법                       | 예시                      |
| ------------------ | ---------------------------- | ------------------------- |
| 클래스/생성자      | PascalCase                   | `class UserAccount`       |
| 함수/변수/파라미터 | camelCase                    | `getUserData`, `userName` |
| 상수               | SCREAMING_SNAKE_CASE         | `MAX_RETRY_COUNT`         |
| 한글 영어 표기     | 피하기 (의미 있는 영어 사용) | `intangibleAssets`        |

## 파일 및 폴더 네이밍

### 폴더명: kebab-case

```
src/pages/
├── auth/
├── my-page/
└── home/
```

### React 컴포넌트 파일: PascalCase

```tsx
// LoginForm.tsx
export const LoginForm = () => {
  return <div>...</div>;
};
```

### Hook 파일: camelCase

```tsx
// useAuth.ts
export const useAuth = () => { ... };
```

### Utility/Helper 함수: camelCase

```tsx
// formatDate.ts
export const formatDate = (date: Date) => { ... };
```

### 상수 파일: camelCase

```tsx
// apiConstants.ts
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRY_COUNT = 3;
```
